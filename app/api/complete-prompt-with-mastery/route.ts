import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { getMasteryById, parseIdParts } from "@/lib/masteries";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Request schema - supports both 'prompt' (from useCompletion) and 'original_prompt'
// mastery_id is optional - null/missing indicates a custom suggestion
const requestSchema = z
  .object({
    prompt: z.string().optional(),
    original_prompt: z.string().optional(),
    mastery_id: z.string().nullable().optional(),
    suggestion_text: z.string(),
    suggestion_description: z.string(),
  })
  .refine((data) => data.prompt || data.original_prompt, {
    message: "Either prompt or original_prompt is required",
  });

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(parsed.error.message, { status: 400 });
    }

    const {
      prompt: inputPrompt,
      original_prompt,
      mastery_id,
      suggestion_text,
      suggestion_description,
    } = parsed.data;
    const userPrompt = (original_prompt || inputPrompt)!;

    // Build technique section - only include Name if we have a real mastery
    let techniqueSection = "";
    if (mastery_id) {
      const mastery = getMasteryById(mastery_id);
      if (!mastery) {
        return new Response("Mastery not found", { status: 404 });
      }
      const { category, name } = parseIdParts(mastery_id);
      techniqueSection = `Name: ${category} / ${name}`;
    }

    const prompt = `
<original_prompt>
${userPrompt}
</original_prompt>

<technique>
${techniqueSection}
Suggestion: ${suggestion_text}
Description: ${suggestion_description}
</technique>

<instructions>
Generate text to append to the user's prompt that demonstrates a specific prompting technique.
Output ONLY the text to append to the user's prompt.

CRITICAL:
- It must be as if it was written by the user, not by Claude.
- Do NOT invent specific details, constraints, examples, or context the user hasn't provided
- Use [bracketed placeholders] for any specifics you don't know
- For example: "Keep it under [X words] and make the tone [formal/casual]"
- For example: "Respond as a [type of expert] would"

FORMAT:
- Close the previous sentence properly and/or add a space or newlines if needed
- Do NOT repeat the original prompt
- Keep it concise (1-2 sentences max)
- Output ONLY the text to append, nothing else
</instructions>`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in complete-prompt-with-mastery:", error);
    return new Response("Failed to complete prompt", { status: 500 });
  }
}
