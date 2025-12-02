import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { z } from "zod";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const requestSchema = z.object({
  firstUserMessage: z.string(),
  firstAssistantMessage: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(parsed.error.message, { status: 400 });
    }

    const { firstUserMessage, firstAssistantMessage } = parsed.data;

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      messages: [
        {
          role: "user",
          content: `Based on this conversation, generate a concise 3-5 word title that captures the main topic:

User: ${firstUserMessage}
Assistant: ${firstAssistantMessage}

Respond with ONLY the title, nothing else.`,
        },
      ],
      maxOutputTokens: 50,
    });

    const title = text.trim();

    return Response.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
