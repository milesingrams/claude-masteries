import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getMasteryById, parseIdParts } from "@/lib/masteries";
import type { RewritePromptRequest } from "@/lib/masteries/types";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body: RewritePromptRequest = await req.json();
    const { original_prompt, mastery_id, chip_text } = body;

    if (!original_prompt || !mastery_id) {
      return new Response("Missing required fields", { status: 400 });
    }

    const mastery = getMasteryById(mastery_id);
    if (!mastery) {
      return new Response("Mastery not found", { status: 404 });
    }

    const { category, name } = parseIdParts(mastery_id);

    const prompt = `<task>
Make minimal adjustments to the user's prompt to incorporate a specific prompting technique. Preserve their original wording, voice, and structure as much as possible.
</task>

<original_prompt>
${original_prompt}
</original_prompt>

<technique>
Name: ${category} / ${name}
Suggestion: ${chip_text}
What makes a good implementation: ${mastery.satisfaction_triggers}
Explanation: ${mastery.detail}
</technique>

<instructions>
Adjust the user's prompt to naturally incorporate this technique. Your output should:
1. Keep the user's original wording and structure as close as possible
2. Only add or modify what's necessary to demonstrate the technique
3. Sound natural, not forced or over-elaborate
4. Be ready to send as-is (no explanations, just the adjusted prompt)

Output ONLY the adjusted prompt text, nothing else.
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
