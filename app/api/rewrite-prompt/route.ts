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
    const { prompt: inputPrompt, original_prompt, mastery_id, chip_text } = body;
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
Generate additional text to append to the user's prompt that demonstrates a specific prompting technique.
</task>

<original_prompt>
${userPrompt}
</original_prompt>

<technique>
Name: ${category} / ${name}
Suggestion: ${chip_text}
What makes a good implementation: ${mastery.satisfaction_triggers}
Explanation: ${mastery.detail}
</technique>

<instructions>
Generate ONLY the additional text to append to the user's prompt that demonstrates this technique.
- Do NOT repeat or modify the original prompt
- Output only new text that should be added after the original
- Keep it concise and natural
- The appended text should flow naturally from the original
- Start with appropriate punctuation or whitespace (e.g., newline, space) as needed

Output ONLY the text to append, nothing else.
</instructions>`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in rewrite-prompt:", error);
    return new Response("Failed to rewrite prompt", { status: 500 });
  }
}
