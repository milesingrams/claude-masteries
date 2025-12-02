import { z } from "zod";

// Request schema - supports both 'prompt' (from useCompletion) and 'original_prompt'
// mastery_id is optional - null/missing indicates a custom suggestion
export const completePromptRequestSchema = z
  .object({
    prompt: z.string().optional(),
    original_prompt: z.string().optional(),
    mastery_id: z.string().nullable().optional(),
    suggestion_text: z.string(),
    suggestion_description: z.string(),
  })
  .refine((data) => data.prompt || data.original_prompt, {
    message: "Either prompt or original_prompt is required",
  });

export type CompletePromptRequest = z.infer<typeof completePromptRequestSchema>;
