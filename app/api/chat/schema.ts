import { z } from "zod";

// Validate structure, cast to UIMessage for SDK compatibility
export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      parts: z.array(z.unknown()).optional(),
    })
  ),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
