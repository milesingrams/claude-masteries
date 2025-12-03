// Data kept client-side for display (name/category derived from id)
export interface MasteryDisplayData {
  id: string;
  name: string;
  category: string;
  title: string;
  detail: string;
  learning_threshold: number;
  icon: string;
}

// Active mastery chip state
export type MasteryChipStatus = "active" | "satisfied";

export interface ActiveMasteryChip {
  mastery_id: string | null; // null for custom suggestions (not tied to a mastery)
  surfaced_at: number;
  status: MasteryChipStatus;
  suggestion_text?: string;
  suggestion_description?: string;
  suggestion_examples?: string[];
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
