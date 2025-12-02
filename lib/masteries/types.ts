// Data kept client-side for display (name/category derived from id)
export interface MasteryDisplayData {
  id: string;
  name: string;
  category: string;
  title: string;
  detail: string;
  learning_threshold: number;
}

// Active mastery chip state
export type MasteryChipStatus = "active" | "satisfied";

export interface ActiveMasteryChip {
  mastery_id: string;
  surfaced_at: number;
  status: MasteryChipStatus;
  suggestion_text?: string;
  suggestion_description?: string;
  suggestion_examples?: string[];
}

// API request/response types
export interface AnalyzePromptRequest {
  partial_prompt: string;
  active_mastery_id: string | null;
  learned_mastery_ids?: string[];
  suppressed_mastery_ids?: string[];
  manual_mode?: boolean;
}

export interface AnalyzePromptResponse {
  surface: {
    mastery_id: string;
    suggestion_text: string;
    suggestion_description: string;
    suggestion_examples: string[];
  } | null;
  maintained_id: string | null;
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
  suggestion_text: string;
}

export interface RewritePromptResponse {
  rewritten_prompt: string;
}
