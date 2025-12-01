"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import type { ActiveChip, AnalyzePromptResponse } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";

const DEBOUNCE_DELAY = 1000;
const SATISFACTION_DISPLAY_DURATION = 3000; // Show checkmark before removal
const MIN_PROMPT_LENGTH = 30;

interface UsePromptAnalysisOptions {
  enabled?: boolean;
}

interface NewChip {
  mastery_id: string;
  chip_text: string;
}

interface UsePromptAnalysisReturn {
  chips: ActiveChip[];
  isAnalyzing: boolean;
  dismissChips: (ids: string[]) => void;
  satisfyChips: (ids: string[]) => void;
  addChips: (newChips: NewChip[]) => void;
}

export function usePromptAnalysis(
  prompt: string,
  options: UsePromptAnalysisOptions = {}
): UsePromptAnalysisReturn {
  const { enabled = true } = options;
  const { learnedMasteryIds, markSatisfied } = useMasteryContext();

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

  // Chip management functions
  const dismissChips = useCallback((ids: string[]) => {
    setChips((prev) => prev.filter((c) => !ids.includes(c.mastery_id)));
  }, []);

  const satisfyChips = useCallback(
    (ids: string[]) => {
      setChips((prev) => {
        const idsSet = new Set(ids);
        return prev.map((c) =>
          idsSet.has(c.mastery_id) && c.status === "active"
            ? { ...c, status: "satisfied" as const }
            : c
        );
      });

      // Update mastery progress in context
      ids.forEach((id) => markSatisfied(id));

      // Remove after showing satisfied state
      setTimeout(() => {
        setChips((curr) => curr.filter((c) => !ids.includes(c.mastery_id)));
      }, SATISFACTION_DISPLAY_DURATION);
    },
    [markSatisfied]
  );

  const addChips = useCallback((newChips: NewChip[]) => {
    setChips((prev) => {
      const updated = [...prev];

      newChips.forEach((chip) => {
        const exists = updated.some((c) => c.mastery_id === chip.mastery_id);
        if (!exists) {
          updated.push({
            mastery_id: chip.mastery_id,
            surfaced_at: Date.now(),
            status: "active",
            chip_text: chip.chip_text,
          });
        }
      });

      // Limit to 1 active chip (keep newest)
      const activeChips = updated.filter((c) => c.status === "active");
      if (activeChips.length > 1) {
        const sorted = activeChips.sort(
          (a, b) => b.surfaced_at - a.surfaced_at
        );
        const toKeep = new Set(sorted.slice(0, 1).map((c) => c.mastery_id));
        return updated.filter(
          (c) => c.status !== "active" || toKeep.has(c.mastery_id)
        );
      }

      return updated;
    });
  }, []);

  // Analyze the prompt and update chips based on API response
  const analyze = useCallback(
    async (promptToAnalyze: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsAnalyzing(true);

      try {
        const response = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partial_prompt: promptToAnalyze,
            active_chip_ids: chips
              .filter((c) => c.status === "active")
              .map((c) => c.mastery_id),
            learned_mastery_ids: learnedMasteryIds,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data: AnalyzePromptResponse = await response.json();

        // Satisfy chips that met criteria
        const satisfiedIds = data.satisfied.map((s) => s.mastery_id);
        if (satisfiedIds.length > 0) {
          satisfyChips(satisfiedIds);
        }

        // Add new suggested chips
        if (data.surface.length > 0) {
          addChips(data.surface);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Analysis error:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [chips, learnedMasteryIds, satisfyChips, addChips]
  );

  // Trigger analysis when debounced prompt changes
  useEffect(() => {
    if (!enabled) return;
    if (!debouncedPrompt || debouncedPrompt.trim().length < MIN_PROMPT_LENGTH)
      return;
    if (debouncedPrompt === lastAnalyzedPrompt.current) return;

    lastAnalyzedPrompt.current = debouncedPrompt;
    analyze(debouncedPrompt);
  }, [debouncedPrompt, enabled, analyze]);

  // Clear chips when prompt is cleared
  useEffect(() => {
    if (!prompt || prompt.trim().length === 0) {
      setChips([]);
      lastAnalyzedPrompt.current = "";
    }
  }, [prompt]);

  return {
    chips,
    isAnalyzing,
    dismissChips,
    satisfyChips,
    addChips,
  };
}
