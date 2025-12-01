// Data kept client-side for display (name/category derived from id)
export interface MasteryDisplayData {
  id: string;
  name: string;
  category: string;
  chip: string;
  detail: string;
  learning_threshold: number;
}

// Active chip state
export type ChipStatus = "active" | "satisfied";

export interface ActiveChip {
  mastery_id: string;
  surfaced_at: number;
  status: ChipStatus;
  chip_text?: string;
}

// API request/response types
export interface AnalyzePromptRequest {
  partial_prompt: string;
  active_chip_id: string | null;
  learned_mastery_ids?: string[];
}

export interface AnalyzePromptResponse {
  surface: {
    mastery_id: string;
    chip_text: string;
  } | null;
  satisfied_id: string | null;
}

// Mastery progress tracking (Phase 2)
export interface MasteryProgress {
  mastery_id: string;
  satisfaction_count: number;
  learned: boolean;
  first_seen_at: number;
  last_satisfied_at?: number;
}

export interface MasteryProgressStore {
  [mastery_id: string]: MasteryProgress;
}

// Rewrite prompt API types
export interface RewritePromptRequest {
  original_prompt: string;
  mastery_id: string;
  chip_text: string;
}

export interface RewritePromptResponse {
  rewritten_prompt: string;
}
