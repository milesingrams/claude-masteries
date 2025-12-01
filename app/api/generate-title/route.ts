import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { firstUserMessage, firstAssistantMessage } = await req.json();

    if (!firstUserMessage || !firstAssistantMessage) {
      return new Response("Invalid request body", { status: 400 });
    }

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
