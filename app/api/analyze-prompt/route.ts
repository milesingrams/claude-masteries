import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { getMasteriesForAnalysis } from "@/lib/masteries/loader";
import type { AnalyzePromptRequest, AnalyzePromptResponse } from "@/lib/masteries/types";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Response schema for structured output
const analysisSchema = z.object({
  surface: z
    .array(
      z.object({
        mastery_id: z.string(),
        relevance: z.enum(["high", "medium"]),
        reason: z.string(),
      })
    )
    .max(1),
  satisfied: z.array(
    z.object({
      mastery_id: z.string(),
      evidence: z.string(),
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
      return Response.json({ surface: [], satisfied: [] } as AnalyzePromptResponse);
    }

    // Load all masteries and filter out learned ones
    let masteries = getMasteriesForAnalysis();
    if (learned_mastery_ids?.length) {
      masteries = masteries.filter((m) => !learned_mastery_ids.includes(m.id));
    }

    // Get active chips for satisfaction checking
    const activeChips = active_chip_ids?.length
      ? masteries.filter((m) => active_chip_ids.includes(m.id))
      : [];

    const prompt = `<task>
Analyze the user's partial prompt to identify the single most relevant mastery suggestion (if any) and check if any active suggestions have been satisfied.

For surfacing: identify 0-1 masteries relevant to what the user seems to be trying to do. Only suggest a mastery if it's clearly and strongly relevant. Be very conservative.

For satisfaction: check if the user's prompt now demonstrates the behavior described in any active chip's satisfaction criteria.
</task>

<partial_prompt>
${partial_prompt}
</partial_prompt>

<masteries>
${JSON.stringify(masteries, null, 2)}
</masteries>

<active_chips>
${JSON.stringify(activeChips, null, 2)}
</active_chips>

<instructions>
1. Review the partial prompt against each mastery's triggers
2. Surface at most 1 mastery - only the single most relevant one
3. For active chips, check if the prompt now satisfies their satisfaction criteria
4. Be very conservative - only surface a chip if it's clearly and strongly relevant
5. If nothing is highly relevant, return an empty surface array
6. Keep reasons and evidence brief (1 sentence max)
</instructions>`;

    const { object } = await generateObject({
      model: anthropic("claude-3-5-haiku-20241022"),
      schema: analysisSchema,
      prompt,
    });

    return Response.json(object as AnalyzePromptResponse);
  } catch (error) {
    console.error("Error in analyze-prompt:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({ surface: [], satisfied: [] } as AnalyzePromptResponse);
  }
}
