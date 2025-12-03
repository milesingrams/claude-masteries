"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  MasteryDisplayData,
  MasteryProgressStore,
} from "./types";
import {
  loadProgress,
  saveProgress,
  incrementSatisfaction,
  getLearnedMasteryIds,
} from "./progress-store";
import { masteries, parseIdParts } from "@/lib/masteries";

// Build static mastery display data at module load time
const staticMasteryDisplayData: Record<string, MasteryDisplayData> = masteries.reduce(
  (acc, m) => {
    const { category, name } = parseIdParts(m.id);
    acc[m.id] = {
      id: m.id,
      name,
      category,
      title: m.title,
      detail: m.detail,
      learning_threshold: m.learning_threshold,
      icon: m.icon,
    };
    return acc;
  },
  {} as Record<string, MasteryDisplayData>
);

interface MasteryContextValue {
  // Display data (static)
  masteryDisplayData: Record<string, MasteryDisplayData>;

  // Progress tracking
  progress: MasteryProgressStore;
  learnedMasteryIds: string[];

  // Actions
  markSatisfied: (masteryId: string) => void;

  // Helpers
  getMasteryDisplay: (masteryId: string) => MasteryDisplayData | undefined;
  hasMasteryDisplay: (masteryId: string) => boolean;
}

const MasteryContext = createContext<MasteryContextValue | null>(null);

export function MasteryProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<MasteryProgressStore>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      saveProgress(progress);
    }
  }, [progress]);

  const markSatisfied = useCallback(
    (masteryId: string) => {
      const mastery = staticMasteryDisplayData[masteryId];
      if (!mastery) return;

      setProgress((prev) =>
        incrementSatisfaction(prev, masteryId, mastery.learning_threshold)
      );
    },
    []
  );

  const getMasteryDisplay = useCallback(
    (masteryId: string) => staticMasteryDisplayData[masteryId],
    []
  );

  const hasMasteryDisplay = useCallback(
    (masteryId: string) => masteryId in staticMasteryDisplayData,
    []
  );

  const learnedMasteryIds = getLearnedMasteryIds(progress);

  return (
    <MasteryContext.Provider
      value={{
        masteryDisplayData: staticMasteryDisplayData,
        progress,
        learnedMasteryIds,
        markSatisfied,
        getMasteryDisplay,
        hasMasteryDisplay,
      }}
    >
      {children}
    </MasteryContext.Provider>
  );
}

export function useMasteryContext() {
  const context = useContext(MasteryContext);
  if (!context) {
    throw new Error("useMasteryContext must be used within a MasteryProvider");
  }
  return context;
}
