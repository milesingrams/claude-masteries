import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { masteries, type Mastery } from "@/lib/masteries";
import type {
  AnalyzePromptRequest,
  AnalyzePromptResponse,
} from "@/lib/masteries/types";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Response schema for structured output
const analysisSchema = z.object({
  surface: z
    .object({
      mastery_id: z.string(),
      chip_text: z.string(),
    })
    .nullable(),
  satisfied: z.boolean(),
});

// Transform schema output to response format
function toResponse(
  result: z.infer<typeof analysisSchema>,
  activeChipId: string | null
): AnalyzePromptResponse {
  return {
    surface: result.surface,
    satisfied_id: result.satisfied && activeChipId ? activeChipId : null,
  };
}

export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const body: AnalyzePromptRequest = await req.json();
    const { partial_prompt, active_chip_id, learned_mastery_ids } = body;

    // Skip analysis for empty or very short prompts
    if (!partial_prompt || partial_prompt.trim().length < 30) {
      return Response.json({
        surface: null,
        satisfied_id: null,
      } as AnalyzePromptResponse);
    }

    // Filter out learned masteries
    let availableMasteries: Mastery[] = masteries;
    if (learned_mastery_ids?.length) {
      availableMasteries = masteries.filter(
        (m) => !learned_mastery_ids.includes(m.id)
      );
    }

    // Get active chip for satisfaction checking
    const activeChip = active_chip_id
      ? masteries.find((m) => m.id === active_chip_id)
      : null;

    const prompt = `<task>
Analyze the user's partial prompt to:
1. Identify the single most relevant mastery to surface (if any)
2. Check if any active chips have been satisfied
</task>

<partial_prompt>
${partial_prompt}
</partial_prompt>

<masteries>
${JSON.stringify(
  availableMasteries.map((m) => ({
    id: m.id,
    surface_triggers: m.surface_triggers,
    chip_example: m.chip,
  })),
  null,
  2
)}
</masteries>

<active_chip>
${activeChip ? JSON.stringify({
  id: activeChip.id,
  satisfaction_triggers: activeChip.satisfaction_triggers,
}, null, 2) : "null"}
</active_chip>

<instructions>
SURFACING:
Match the partial prompt against each mastery's surface_triggers. Surface when the user's prompt matches the trigger conditions but isn't yet using the technique. Only surface the single most relevant mastery. If nothing clearly matches, return null for surface.

When surfacing a mastery, generate a contextual chip_text (5-10 words) that:
- References the specific topic/task from the user's prompt
- Suggests the technique in a helpful, kind, and non-pushy way
- Uses the chip_example as a style reference for tone and length

Example: If user is writing about email and mastery chip_example is "You could ask Claude what's possible here", generate something like "Ask Claude how it would approach this email"

SATISFACTION:
If there is an active_chip, check if the partial prompt satisfies it based on the satisfaction_triggers. A chip is satisfied when the user's prompt contains the phrases or demonstrates the behavior described. Return satisfied: true if satisfied, false otherwise.

Be conservative for surfacing. Be generous for satisfaction—if the user incorporated the suggestion, credit them.
</instructions>`;

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: analysisSchema,
      prompt,
    });

    return Response.json(toResponse(object, active_chip_id));
  } catch (error) {
    console.error("Error in analyze-prompt:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({
      surface: null,
      satisfied_id: null,
    } as AnalyzePromptResponse);
  }
}
