import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { masteries, type Mastery } from "@/lib/masteries";
import { MIN_PROMPT_LENGTH } from "@/lib/constants";
import {
  analyzePromptResponseSchema,
  type AnalyzePromptResponse,
} from "./schema";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Active chip schema for satisfaction detection
const activeChipSchema = z.object({
  mastery_id: z.string().nullable(),
  suggestion_text: z.string(),
  suggestion_description: z.string(),
  suggestion_examples: z.array(z.string()),
});

// Request schema
const requestSchema = z.object({
  partial_prompt: z.string(),
  active_mastery_chip: activeChipSchema.nullable(),
  learned_mastery_ids: z.array(z.string()).optional(),
  suppressed_mastery_ids: z.array(z.string()).optional(),
  manual_mode: z.boolean().optional(),
});

export const maxDuration = 15;

// Shared types
type ActiveChip = z.infer<typeof activeChipSchema>;

interface PromptContext {
  partial_prompt: string;
  available_masteries: Mastery[];
  active_chip?: ActiveChip | null;
}

// Build the masteries XML section
function buildMasteriesSection(masteries: Mastery[]): string {
  const simplified = masteries.map((m) => ({
    id: m.id,
    surface_triggers: m.surface_triggers,
  }));
  return `<masteries>
${JSON.stringify(simplified, null, 2)}
</masteries>`;
}

// Build the active chip XML section
function buildActiveChipSection(chip: ActiveChip): string {
  return `<active_chip>
${JSON.stringify(
  {
    mastery_id: chip.mastery_id,
    text: chip.suggestion_text,
    examples: chip.suggestion_examples,
  },
  null,
  2
)}
</active_chip>`;
}

// Shared instructions for generating suggestions
const SUGGESTION_FORMAT = `Generate for the surface object:
- suggestion_text (5-10 words): Reference their specific topic, suggest technique naturally
- suggestion_description (15-25 words): Why this helps for their task
- suggestion_examples (2 strings, 8-15 words each): Snippets they could add to their prompt`;

// Manual mode: User clicked Brain button - always surface a suggestion
export function buildManualModePrompt(ctx: PromptContext): string {
  return `<task>User requested prompt help. Find the most relevant mastery or generate a custom suggestion.</task>

<partial_prompt>
${ctx.partial_prompt}
</partial_prompt>

${buildMasteriesSection(ctx.available_masteries)}

<instructions>
1. Find a mastery whose surface_triggers match the prompt
2. If a mastery matches, set mastery_id to that id
3. If NO mastery matches, set mastery_id to null and generate a custom prompting tip

${SUGGESTION_FORMAT}

Always return a surface object. Set maintained_id and satisfied_id to null.
</instructions>`;
}

// Auto mode: Debounced analysis
export function buildAutoModePrompt(ctx: PromptContext): string {
  const hasActiveChip = ctx.active_chip?.mastery_id;

  return `<task>Analyze prompt for mastery suggestions and satisfaction.</task>

<partial_prompt>
${ctx.partial_prompt}
</partial_prompt>

${buildMasteriesSection(ctx.available_masteries)}

${ctx.active_chip ? buildActiveChipSection(ctx.active_chip) : ""}

<instructions>
${
  hasActiveChip
    ? `FIRST check the active chip (${ctx.active_chip!.mastery_id}):
- SATISFIED: User's prompt demonstrates the technique (similar to examples: ${JSON.stringify(ctx.active_chip!.suggestion_examples)})
  → Set satisfied_id to "${ctx.active_chip!.mastery_id}", surface: null, maintained_id: null
- MAINTAINED: Suggestion still relevant but not yet applied
  → Set maintained_id to "${ctx.active_chip!.mastery_id}", surface: null, satisfied_id: null
- NEITHER: Context changed significantly
  → Set both to null, consider surfacing a new mastery

`
    : ""
}SURFACING (only if no maintained chip):
- Find the single most relevant mastery matching surface_triggers
- Be conservative—only surface if clearly relevant, otherwise null

${SUGGESTION_FORMAT}
</instructions>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.message }, { status: 400 });
    }

    const {
      partial_prompt,
      active_mastery_chip,
      learned_mastery_ids,
      suppressed_mastery_ids,
      manual_mode,
    } = parsed.data;

    // Skip analysis for empty or very short prompts
    if (!partial_prompt || partial_prompt.trim().length < MIN_PROMPT_LENGTH) {
      return Response.json({
        surface: null,
        maintained_id: null,
        satisfied_id: null,
      } satisfies AnalyzePromptResponse);
    }

    // In manual mode, use all masteries (no filtering)
    // In automatic mode, filter out learned and suppressed masteries
    let availableMasteries: Mastery[] = masteries;
    if (learned_mastery_ids?.length) {
      availableMasteries = availableMasteries.filter(
        (m) => !learned_mastery_ids.includes(m.id)
      );
    }
    if (suppressed_mastery_ids?.length) {
      availableMasteries = availableMasteries.filter(
        (m) => !suppressed_mastery_ids.includes(m.id)
      );
    }

    if (manual_mode) {
      const result = await generateObject({
        model: anthropic("claude-haiku-4-5"),
        schema: analyzePromptResponseSchema,
        prompt: buildManualModePrompt({
          partial_prompt,
          available_masteries: availableMasteries,
        }),
      });

      return Response.json(result.object);
    }

    const result = await generateObject({
      model: anthropic("claude-haiku-4-5"),
      schema: analyzePromptResponseSchema,
      prompt: buildAutoModePrompt({
        partial_prompt,
        available_masteries: availableMasteries,
        active_chip: active_mastery_chip,
      }),
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Error in analyze-prompt-for-mastery:", error);
    // Return empty response on error to avoid breaking the UI
    return Response.json({
      surface: null,
      maintained_id: null,
      satisfied_id: null,
    } as AnalyzePromptResponse);
  }
}
