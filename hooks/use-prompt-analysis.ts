"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import type { ActiveChip, AnalyzePromptResponse } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";

const DEBOUNCE_DELAY = 1000;
const MIN_PROMPT_LENGTH = 30;

interface UsePromptAnalysisOptions {
  enabled?: boolean;
}

interface UsePromptAnalysisReturn {
  chip: ActiveChip | null;
  isAnalyzing: boolean;
  dismissChip: () => void;
  satisfyChip: () => void;
  resetSession: () => void;
}

export function usePromptAnalysis(
  prompt: string,
  options: UsePromptAnalysisOptions = {}
): UsePromptAnalysisReturn {
  const { enabled = true } = options;
  const { learnedMasteryIds, markSatisfied } = useMasteryContext();

  const [chip, setChip] = useState<ActiveChip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debouncedPrompt, setDebouncedPrompt] = useState("");
  const [suppressedIds, setSuppressedIds] = useState<string[]>([]);

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
  const dismissChip = useCallback(() => {
    if (chip) {
      setSuppressedIds((prev) => [...prev, chip.mastery_id]);
    }
    setChip(null);
  }, [chip]);

  const satisfyChip = useCallback(() => {
    if (chip) {
      markSatisfied(chip.mastery_id);
      setSuppressedIds((prev) => [...prev, chip.mastery_id]);
    }
    // Set satisfied status - AnimatePresence preserves this during exit animation
    setChip((prev) => (prev ? { ...prev, status: "satisfied" } : null));
    // Clear chip on next frame - exit animation will show satisfied state
    requestAnimationFrame(() => setChip(null));
  }, [chip, markSatisfied]);

  // Reset session state (call on message submit)
  const resetSession = useCallback(() => {
    setSuppressedIds([]);
  }, []);

  // Analyze the prompt and update chip based on API response
  const analyze = useCallback(
    async (promptToAnalyze: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsAnalyzing(true);

      try {
        const activeChipId = chip?.status === "active" ? chip.mastery_id : null;

        const response = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partial_prompt: promptToAnalyze,
            active_chip_id: activeChipId,
            learned_mastery_ids: learnedMasteryIds,
            suppressed_mastery_ids: suppressedIds,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data: AnalyzePromptResponse = await response.json();

        // Satisfy chip if it met criteria (check ID matches to avoid race conditions)
        if (data.satisfied_id && chip?.mastery_id === data.satisfied_id) {
          satisfyChip();
        }

        // Set new suggested chip
        if (data.surface) {
          setChip({
            mastery_id: data.surface.mastery_id,
            surfaced_at: Date.now(),
            status: "active",
            chip_text: data.surface.chip_text,
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Analysis error:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [chip, learnedMasteryIds, satisfyChip, suppressedIds]
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

  // Clear chip when prompt is cleared
  useEffect(() => {
    if (!prompt || prompt.trim().length === 0) {
      setChip(null);
      lastAnalyzedPrompt.current = "";
    }
  }, [prompt]);

  return {
    chip,
    isAnalyzing,
    dismissChip,
    satisfyChip,
    resetSession,
  };
}
