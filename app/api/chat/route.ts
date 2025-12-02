import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Validate structure, cast to UIMessage for SDK compatibility
const requestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      parts: z.array(z.unknown()).optional(),
    })
  ),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(parsed.error.message, { status: 400 });
    }

    const messages = parsed.data.messages as UIMessage[];

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
