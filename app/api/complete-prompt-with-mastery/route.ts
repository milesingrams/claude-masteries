import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getMasteryById, parseIdParts } from "@/lib/masteries";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // useCompletion sends 'prompt', but we also support 'original_prompt' for backwards compat
    const {
      prompt: inputPrompt,
      original_prompt,
      mastery_id,
      suggestion_text,
      suggestion_description,
    } = body;
    const userPrompt = original_prompt || inputPrompt;

    if (!userPrompt || !mastery_id) {
      return new Response("Missing required fields", { status: 400 });
    }

    const mastery = getMasteryById(mastery_id);
    if (!mastery) {
      return new Response("Mastery not found", { status: 404 });
    }

    const { category, name } = parseIdParts(mastery_id);

    const prompt = `<task>
Generate text to append to the user's prompt that demonstrates a specific prompting technique.
</task>

<original_prompt>
${userPrompt}
</original_prompt>

<technique>
Name: ${category} / ${name}
Suggestion: ${suggestion_text}
Description: ${suggestion_description || mastery.satisfaction_triggers}
</technique>

<instructions>
Output ONLY the text to append to the user's prompt.

CRITICAL:
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
