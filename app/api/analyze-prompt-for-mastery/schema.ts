import { z } from "zod";

// Shared surface schema
export const surfaceSchema = z.object({
  mastery_id: z.string().nullable(),
  suggestion_text: z.string(),
  suggestion_description: z.string(),
  suggestion_examples: z.array(z.string()),
});

// Response schema used by both server (streamObject) and client (useObject)
export const analyzePromptResponseSchema = z.object({
  surface: surfaceSchema.nullable(),
  maintained_id: z.string().nullable(),
  satisfied_id: z.string().nullable(),
});

export type AnalyzePromptResponse = z.infer<typeof analyzePromptResponseSchema>;
