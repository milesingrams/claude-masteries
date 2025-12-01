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
export type ChipStatus = "active" | "satisfied" | "fading";

export interface ActiveChip {
  mastery_id: string;
  relevance: "high" | "medium";
  reason: string;
  surfaced_at: number;
  status: ChipStatus;
}

// API request/response types
export interface AnalyzePromptRequest {
  partial_prompt: string;
  active_chip_ids: string[];
  learned_mastery_ids?: string[];
}

export interface AnalyzePromptResponse {
  surface: Array<{
    mastery_id: string;
    relevance: "high" | "medium";
    reason: string;
  }>;
  satisfied: Array<{
    mastery_id: string;
    evidence: string;
  }>;
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
