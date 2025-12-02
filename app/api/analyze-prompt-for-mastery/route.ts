import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { masteries, type Mastery } from "@/lib/masteries";
import { MIN_PROMPT_LENGTH } from "@/lib/constants";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Request schema
const requestSchema = z.object({
  partial_prompt: z.string(),
  active_mastery_id: z.string().nullable(),
  learned_mastery_ids: z.array(z.string()).optional(),
  suppressed_mastery_ids: z.array(z.string()).optional(),
  manual_mode: z.boolean().optional(),
});

// Shared surface schema
const surfaceSchema = z.object({
  mastery_id: z.string().nullable(),
  suggestion_text: z.string(),
  suggestion_description: z.string(),
  suggestion_examples: z.array(z.string()),
});

// Manual mode: always returns a suggestion (mastery or custom)
const manualModeSchema = z.object({
  surface: surfaceSchema,
});

// Auto mode: checks maintained/satisfied, surface is optional
const autoModeSchema = z.object({
  surface: surfaceSchema.nullable(),
  maintained: z.boolean(),
  satisfied: z.boolean(),
});

type AnalyzePromptResponse = {
  surface: {
    mastery_id: string | null;
    suggestion_text: string;
    suggestion_description: string;
    suggestion_examples: string[];
  } | null;
  maintained_id: string | null;
  satisfied_id: string | null;
};

export const maxDuration = 15;

// Shared suggestion generation instructions
const suggestionInstructions = `
If surfacing, generate:

a) suggestion_text (5-10 words): A contextual suggestion that:
   - References the user's specific topic/task
   - Suggests the technique naturally, not pushy

b) suggestion_description (15-25 words): A brief explanation of WHY this technique helps, personalized to their task:
   - Explain the benefit in context of what they're writing
   - Be specific about what they'll gain
   - Keep it conversational and helpful

c) suggestion_examples (exactly 2 strings, each 8-15 words): Very short example phrases showing HOW to apply the technique:
   - Each example should be a snippet they could actually add to their prompt
   - Make them specific to their topic, not generic
   - Show different ways to apply the same technique

Example for a user writing about email:
- suggestion_text: "Ask Claude how it would approach this email"
- suggestion_description: "Letting Claude share its perspective often reveals angles you hadn't considered for tricky emails."
- suggestion_examples: ["What would you suggest for the tone here?", "How would you handle the budget concern?"]
`;

// Manual mode: User clicked Brain button - always surface a suggestion
function buildManualModePrompt(
  partialPrompt: string,
  availableMasteries: Mastery[]
): string {
  return `
<partial_prompt>
${partialPrompt}
</partial_prompt>

<masteries>
${JSON.stringify(
  availableMasteries.map((m) => ({
    id: m.id,
    surface_triggers: m.surface_triggers,
    chip_example: m.title,
  })),
  null,
  2
)}
</masteries>

<instructions>
The user explicitly requested prompt help. Find the most relevant mastery for this prompt, or generate a custom suggestion.

1. Look for a mastery whose surface_triggers match the prompt
2. If a mastery matches, set mastery_id to that mastery's id
3. If NO mastery clearly matches, you MUST still help:
   - Set mastery_id to null (this indicates a custom suggestion)
   - Generate a helpful prompting tip specific to their prompt
   - Focus on what would improve clarity, specificity, or effectiveness

${suggestionInstructions}
</instructions>`;
}

// Auto mode: Debounced analysis - check maintained/satisfied, only surface if clear match
function buildAutoModePrompt(
  partialPrompt: string,
  availableMasteries: Mastery[],
  activeMasteryId: string | null
): string {
  const activeMastery = activeMasteryId
    ? masteries.find((m) => m.id === activeMasteryId)
    : null;

  return `
<partial_prompt>
${partialPrompt}
</partial_prompt>

<masteries>
${JSON.stringify(
  availableMasteries.map((m) => ({
    id: m.id,
    surface_triggers: m.surface_triggers,
    chip_example: m.title,
  })),
  null,
  2
)}
</masteries>

${
  activeMastery
    ? `
<active_mastery>
${JSON.stringify(
  {
    id: activeMastery.id,
    surface_triggers: activeMastery.surface_triggers,
    satisfaction_triggers: activeMastery.satisfaction_triggers,
  },
  null,
  2
)}
</active_mastery>
`
    : ""
}

<instructions>
Analyze the partial prompt:
${
  activeMastery
    ? `
1. MAINTAINED: Is the active mastery still relevant?
   Return true if the prompt still matches the active mastery's surface_triggers.

2. SATISFIED: Has the user applied the technique?
   Return true if the prompt clearly demonstrates the behavior or contains phrases from satisfaction_triggers.
   The user doesn't need to use exact phrases, but the intent should be clear.

3. SURFACE (only if maintained is false):
`
    : `
1. SURFACE:
`
}
   Find the single most relevant mastery for this prompt.
   Only surface if there's a clear match to surface_triggers.
   Be very conservative - when in doubt, return null.
${suggestionInstructions}
</instructions>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.message }, { status: 400 });
    }

    const {
      partial_prompt,
      active_mastery_id,
      learned_mastery_ids,
      suppressed_mastery_ids,
      manual_mode,
    } = parsed.data;

    // Skip analysis for empty or very short prompts
    if (!partial_prompt || partial_prompt.trim().length < MIN_PROMPT_LENGTH) {
      return Response.json({
        surface: null,
        maintained_id: null,
        satisfied_id: null,
      } satisfies AnalyzePromptResponse);
    }

    // In manual mode, use all masteries (no filtering)
    // In automatic mode, filter out learned and suppressed masteries
    let availableMasteries: Mastery[] = masteries;
    if (learned_mastery_ids?.length) {
      availableMasteries = availableMasteries.filter(
        (m) => !learned_mastery_ids.includes(m.id)
      );
    }
    if (suppressed_mastery_ids?.length) {
      availableMasteries = availableMasteries.filter(
        (m) => !suppressed_mastery_ids.includes(m.id)
      );
    }

    if (manual_mode) {
      const { object } = await generateObject({
        model: anthropic("claude-sonnet-4-5"),
        schema: manualModeSchema,
        prompt: buildManualModePrompt(partial_prompt, availableMasteries),
      });
      return Response.json({
        surface: object.surface,
        maintained_id: null,
        satisfied_id: null,
      });
    }

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: autoModeSchema,
      prompt: buildAutoModePrompt(
        partial_prompt,
        availableMasteries,
        active_mastery_id
      ),
    });
    return Response.json({
      surface: object.surface,
      maintained_id:
        object.maintained && active_mastery_id ? active_mastery_id : null,
      satisfied_id:
        object.satisfied && active_mastery_id ? active_mastery_id : null,
    });
  } catch (error) {
    console.error("Error in analyze-prompt-for-mastery:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({
      surface: null,
      maintained_id: null,
      satisfied_id: null,
    } as AnalyzePromptResponse);
  }
}
