import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      system:
        "You are Claude, a helpful AI assistant created by Anthropic. Respond to the user in Markdown format.",
      messages: convertToModelMessages(messages),
      maxOutputTokens: 4096,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
