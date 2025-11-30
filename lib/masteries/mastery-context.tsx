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

interface MasteryContextValue {
  // Display data loaded from API
  masteryDisplayData: Record<string, MasteryDisplayData>;
  isLoading: boolean;

  // Progress tracking
  progress: MasteryProgressStore;
  learnedMasteryIds: string[];

  // Actions
  markSatisfied: (masteryId: string) => void;
}

const MasteryContext = createContext<MasteryContextValue | null>(null);

export function MasteryProvider({ children }: { children: ReactNode }) {
  const [masteryDisplayData, setMasteryDisplayData] = useState<
    Record<string, MasteryDisplayData>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<MasteryProgressStore>({});

  // Load mastery display data from API
  useEffect(() => {
    async function loadMasteries() {
      try {
        const response = await fetch("/api/masteries");
        if (!response.ok) throw new Error("Failed to load masteries");

        const masteries: MasteryDisplayData[] = await response.json();
        const dataMap = masteries.reduce(
          (acc, m) => {
            acc[m.id] = m;
            return acc;
          },
          {} as Record<string, MasteryDisplayData>
        );

        setMasteryDisplayData(dataMap);
      } catch (error) {
        console.error("Failed to load masteries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMasteries();
  }, []);

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
      const mastery = masteryDisplayData[masteryId];
      if (!mastery) return;

      setProgress((prev) =>
        incrementSatisfaction(prev, masteryId, mastery.learning_threshold)
      );
    },
    [masteryDisplayData]
  );

  const learnedMasteryIds = getLearnedMasteryIds(progress);

  return (
    <MasteryContext.Provider
      value={{
        masteryDisplayData,
        isLoading,
        progress,
        learnedMasteryIds,
        markSatisfied,
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
