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

// Response schema for structured output
const analysisSchema = z.object({
  surface: z
    .object({
      mastery_id: z.string(),
      suggestion_text: z.string(),
      suggestion_description: z.string(),
      suggestion_examples: z.array(z.string()),
    })
    .nullable(),
  maintained: z.boolean(),
  satisfied: z.boolean(),
});

type AnalyzePromptResponse = {
  surface: {
    mastery_id: string;
    suggestion_text: string;
    suggestion_description: string;
    suggestion_examples: string[];
  } | null;
  maintained_id: string | null;
  satisfied_id: string | null;
};

// Transform schema output to response format
function toResponse(
  result: z.infer<typeof analysisSchema>,
  activeMasteryId: string | null
): AnalyzePromptResponse {
  return {
    surface: result.surface,
    maintained_id: result.maintained && activeMasteryId ? activeMasteryId : null,
    satisfied_id: result.satisfied && activeMasteryId ? activeMasteryId : null,
  };
}

export const maxDuration = 15;

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
    if (!manual_mode) {
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
    }

    // Get active mastery for satisfaction checking
    const activeMastery = active_mastery_id
      ? masteries.find((m) => m.id === active_mastery_id)
      : null;

    const prompt = `<partial_prompt>
${partial_prompt}
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

<active_mastery>
${
  activeMastery
    ? JSON.stringify(
        {
          id: activeMastery.id,
          surface_triggers: activeMastery.surface_triggers,
          satisfaction_triggers: activeMastery.satisfaction_triggers,
        },
        null,
        2
      )
    : "null"
}
</active_mastery>

<instructions>
Analyze the partial prompt and return three things:

1. MAINTAINED (only if active_mastery exists):
Is the active mastery still relevant to what the user is writing?
Return true if the prompt still matches the active mastery's surface_triggers.

2. SATISFIED (only if active_mastery exists):
Has the user applied the technique?
Return true if the prompt clearly demonstrates the behavior or contains phrases from satisfaction_triggers.
The user doesn't need to use exact phrases, but the intent should be clear—not just hinted at.

3. SURFACE (only if no active_mastery, or maintained is false):
Find the single most relevant mastery for this prompt.
Only surface if there's a clear match to surface_triggers.
Be very conservative - when in doubt, return null.

If surfacing, generate:

a) suggestion_text (5-10 words): A contextual suggestion that:
   - References the user's specific topic/task
   - Suggests the technique naturally, not pushy
   - Matches the tone of chip_example

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
</instructions>`;

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: analysisSchema,
      prompt,
    });

    return Response.json(toResponse(object, active_mastery_id));
  } catch (error) {
    console.error("Error in analyze-prompt-for-mastery:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({
      surface: null,
      maintained_id: null,
      satisfied_id: null,
    } satisfies AnalyzePromptResponse);
  }
}
