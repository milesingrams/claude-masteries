import { z } from "zod";

export const generateChatTitleRequestSchema = z.object({
  firstUserMessage: z.string(),
  firstAssistantMessage: z.string(),
});

export const generateChatTitleResponseSchema = z.object({
  title: z.string(),
});

export type GenerateChatTitleRequest = z.infer<
  typeof generateChatTitleRequestSchema
>;
export type GenerateChatTitleResponse = z.infer<
  typeof generateChatTitleResponseSchema
>;
