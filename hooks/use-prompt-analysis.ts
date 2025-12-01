"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import type {
  ActiveChip,
  AnalyzePromptResponse,
  MasteryDisplayData,
} from "@/lib/masteries/types";

const DEBOUNCE_DELAY = 1500;
const SATISFACTION_DISPLAY_DURATION = 1500; // Show checkmark before removal
const MIN_PROMPT_LENGTH = 30;

interface UsePromptAnalysisOptions {
  enabled?: boolean;
  learnedMasteryIds?: string[];
  masteryDisplayData?: Record<string, MasteryDisplayData>;
  onSatisfied?: (masteryId: string) => void;
}

interface UsePromptAnalysisReturn {
  chips: ActiveChip[];
  isAnalyzing: boolean;
  dismissChip: (id: string) => void;
}

export function usePromptAnalysis(
  prompt: string,
  options: UsePromptAnalysisOptions = {}
): UsePromptAnalysisReturn {
  const {
    enabled = true,
    learnedMasteryIds = [],
    onSatisfied,
  } = options;

  const [chips, setChips] = useState<ActiveChip[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debouncedPrompt, setDebouncedPrompt] = useState("");

  const lastAnalyzedPrompt = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the prompt
  useDebounce(
    () => {
      setDebouncedPrompt(prompt);
    },
    DEBOUNCE_DELAY,
    [prompt]
  );

  // Analyze prompt when debounced value changes
  useEffect(() => {
    if (!enabled) return;
    if (!debouncedPrompt || debouncedPrompt.trim().length < MIN_PROMPT_LENGTH) return;
    if (debouncedPrompt === lastAnalyzedPrompt.current) return;

    lastAnalyzedPrompt.current = debouncedPrompt;

    const analyze = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsAnalyzing(true);

      try {
        const activeChipIds = chips
          .filter((c) => c.status === "active")
          .map((c) => c.mastery_id);

        const response = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partial_prompt: debouncedPrompt,
            active_chip_ids: activeChipIds,
            learned_mastery_ids: learnedMasteryIds,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data: AnalyzePromptResponse = await response.json();

        // Collect satisfied mastery IDs to notify after state update
        const satisfiedMasteryIds: string[] = [];

        setChips((prev) => {
          const updated = [...prev];

          // Mark satisfied chips
          data.satisfied.forEach((sat) => {
            const idx = updated.findIndex((c) => c.mastery_id === sat.mastery_id);
            if (idx !== -1 && updated[idx].status === "active") {
              updated[idx] = { ...updated[idx], status: "satisfied" };

              // Track for notification after state update
              satisfiedMasteryIds.push(sat.mastery_id);

              // Remove after showing satisfied state - AnimatePresence handles exit animation
              setTimeout(() => {
                setChips((curr) =>
                  curr.filter((c) => c.mastery_id !== sat.mastery_id)
                );
              }, SATISFACTION_DISPLAY_DURATION);
            }
          });

          // Add new chips (avoid duplicates)
          data.surface.forEach((surf) => {
            const exists = updated.some((c) => c.mastery_id === surf.mastery_id);
            if (!exists) {
              updated.push({
                mastery_id: surf.mastery_id,
                relevance: surf.relevance,
                reason: surf.reason,
                surfaced_at: Date.now(),
                status: "active",
              });
            }
          });

          // Limit to 1 active chip (keep newest)
          const activeChips = updated.filter((c) => c.status === "active");
          if (activeChips.length > 1) {
            const sorted = activeChips.sort((a, b) => b.surfaced_at - a.surfaced_at);
            const toKeep = new Set(sorted.slice(0, 1).map((c) => c.mastery_id));
            return updated.filter(
              (c) => c.status !== "active" || toKeep.has(c.mastery_id)
            );
          }

          return updated;
        });

        // Notify parent of satisfied masteries after state update completes
        satisfiedMasteryIds.forEach((id) => onSatisfied?.(id));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Analysis error:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyze();
  }, [debouncedPrompt, enabled, learnedMasteryIds, onSatisfied]);

  // Clear chips when prompt is cleared
  useEffect(() => {
    if (!prompt || prompt.trim().length === 0) {
      setChips([]);
      lastAnalyzedPrompt.current = "";
    }
  }, [prompt]);

  const dismissChip = useCallback((id: string) => {
    setChips((prev) => prev.filter((c) => c.mastery_id !== id));
  }, []);

  return {
    chips,
    isAnalyzing,
    dismissChip,
  };
}
