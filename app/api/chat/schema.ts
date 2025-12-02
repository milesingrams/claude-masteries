import type { UIMessage } from "ai";
import { z } from "zod";

// Minimal validation - UIMessage type provides compile-time safety,
// and the AI SDK handles the actual message structure
export const chatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
