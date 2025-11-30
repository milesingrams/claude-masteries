import type { MasteryProgress, MasteryProgressStore } from "./types";

const STORAGE_KEY = "mastery-progress";

// Load progress from localStorage
export function loadProgress(): MasteryProgressStore {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save progress to localStorage
export function saveProgress(progress: MasteryProgressStore): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save mastery progress:", error);
  }
}

// Get progress for a specific mastery
export function getMasteryProgress(
  progress: MasteryProgressStore,
  masteryId: string
): MasteryProgress | undefined {
  return progress[masteryId];
}

// Increment satisfaction count and check if learned
export function incrementSatisfaction(
  progress: MasteryProgressStore,
  masteryId: string,
  learningThreshold: number
): MasteryProgressStore {
  const existing = progress[masteryId];
  const now = Date.now();

  const updated: MasteryProgress = existing
    ? {
        ...existing,
        satisfaction_count: existing.satisfaction_count + 1,
        last_satisfied_at: now,
        learned:
          existing.learned ||
          existing.satisfaction_count + 1 >= learningThreshold,
      }
    : {
        mastery_id: masteryId,
        satisfaction_count: 1,
        learned: 1 >= learningThreshold,
        first_seen_at: now,
        last_satisfied_at: now,
      };

  return {
    ...progress,
    [masteryId]: updated,
  };
}

// Check if a mastery is learned
export function isLearned(
  progress: MasteryProgressStore,
  masteryId: string
): boolean {
  return progress[masteryId]?.learned ?? false;
}

// Get all learned mastery IDs
export function getLearnedMasteryIds(progress: MasteryProgressStore): string[] {
  return Object.entries(progress)
    .filter(([, p]) => p.learned)
    .map(([id]) => id);
}

// Reset progress for a mastery (useful for testing)
export function resetMasteryProgress(
  progress: MasteryProgressStore,
  masteryId: string
): MasteryProgressStore {
  const { [masteryId]: _, ...rest } = progress;
  return rest;
}

// Reset all progress
export function resetAllProgress(): MasteryProgressStore {
  return {};
}
