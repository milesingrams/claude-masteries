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
    .array(
      z.object({
        mastery_id: z.string(),
        chip_text: z.string(),
      })
    )
    .max(1),
  satisfied: z.array(
    z.object({
      mastery_id: z.string(),
    })
  ),
});

export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const body: AnalyzePromptRequest = await req.json();
    const { partial_prompt, active_chip_ids, learned_mastery_ids } = body;

    // Skip analysis for empty or very short prompts
    if (!partial_prompt || partial_prompt.trim().length < 30) {
      return Response.json({
        surface: [],
        satisfied: [],
      } as AnalyzePromptResponse);
    }

    // Filter out learned masteries
    let availableMasteries: Mastery[] = masteries;
    if (learned_mastery_ids?.length) {
      availableMasteries = masteries.filter(
        (m) => !learned_mastery_ids.includes(m.id)
      );
    }

    // Get active chips for satisfaction checking
    const activeChips = active_chip_ids?.length
      ? masteries.filter((m) => active_chip_ids.includes(m.id))
      : [];

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

<active_chips>
${JSON.stringify(
  activeChips.map((m) => ({
    id: m.id,
    satisfaction_triggers: m.satisfaction_triggers,
  })),
  null,
  2
)}
</active_chips>

<instructions>
SURFACING:
Match the partial prompt against each mastery's surface_triggers. Surface when the user's prompt matches the trigger conditions but isn't yet using the technique. Only surface the single most relevant mastery. If nothing clearly matches, return an empty array.

When surfacing a mastery, generate a contextual chip_text (5-10 words) that:
- References the specific topic/task from the user's prompt
- Suggests the technique in a helpful, kind, and non-pushy way
- Uses the chip_example as a style reference for tone and length

Example: If user is writing about email and mastery chip_example is "You could ask Claude what's possible here", generate something like "Ask Claude how it would approach this email"

SATISFACTION:
Match the partial prompt against each active chip's satisfaction_triggers. A chip is satisfied when the user's prompt contains the phrases or demonstrates the behavior described. Look for the specific phrases listed.

Be conservative for surfacing. Be generous for satisfaction—if the user incorporated the suggestion, credit them.
</instructions>`;

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: analysisSchema,
      prompt,
    });

    return Response.json(object as AnalyzePromptResponse);
  } catch (error) {
    console.error("Error in analyze-prompt:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({
      surface: [],
      satisfied: [],
    } as AnalyzePromptResponse);
  }
}
