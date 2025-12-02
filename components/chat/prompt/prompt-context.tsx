"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useDebounce } from "react-use";
import { useCompletion } from "@ai-sdk/react";
import type { ActiveChip, AnalyzePromptResponse } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";

const DEBOUNCE_DELAY = 1500;
const MIN_PROMPT_LENGTH = 30;

interface PromptContextValue {
  // Prompt state
  prompt: string;
  setPrompt: (value: string) => void;
  originalPrompt: string | null;

  // Analysis state
  chip: ActiveChip | null;
  isAnalyzing: boolean;
  suppressedIds: string[];

  // Streaming state
  completion: string;
  isStreaming: boolean;

  // Actions
  dismissChip: () => void;
  satisfyChip: () => void;
  resetSession: () => void;
  handleShowMe: (masteryId: string, chipText: string) => Promise<void>;
  handleRevert: () => void;

  // Refs
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const PromptContext = createContext<PromptContextValue | null>(null);

interface PromptProviderProps {
  children: ReactNode;
  enableMasteryChips?: boolean;
  disabled?: boolean;
}

export function PromptProvider({
  children,
  enableMasteryChips = true,
  disabled = false,
}: PromptProviderProps) {
  const { learnedMasteryIds, markSatisfied } = useMasteryContext();

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Analysis state
  const [chip, setChip] = useState<ActiveChip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debouncedPrompt, setDebouncedPrompt] = useState("");
  const [suppressedIds, setSuppressedIds] = useState<string[]>([]);

  const lastAnalyzedPrompt = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Rewrite streaming
  const {
    completion,
    complete,
    isLoading: isStreaming,
  } = useCompletion({
    api: "/api/complete-prompt",
    streamProtocol: "text",
    onFinish: (originalText, completionText) => {
      setPrompt(`${originalText}${completionText}`);
    },
    onError: (error) => {
      console.error("Show me failed:", error);
    },
  });

  // Debounce the prompt
  useDebounce(
    () => {
      setDebouncedPrompt(prompt);
    },
    DEBOUNCE_DELAY,
    [prompt]
  );

  // Chip management
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
    setChip((prev) => (prev ? { ...prev, status: "satisfied" } : null));
    requestAnimationFrame(() => setChip(null));
  }, [chip, markSatisfied]);

  const resetSession = useCallback(() => {
    setSuppressedIds([]);
  }, []);

  // Show me handler
  const handleShowMe = useCallback(
    async (masteryId: string, chipText: string): Promise<void> => {
      setOriginalPrompt(prompt);
      satisfyChip();

      await complete(prompt, {
        body: {
          mastery_id: masteryId,
          chip_text: chipText,
        },
      });
    },
    [prompt, complete, satisfyChip]
  );

  // Revert handler
  const handleRevert = useCallback(() => {
    if (originalPrompt !== null) {
      setPrompt(originalPrompt);
      setOriginalPrompt(null);
    }
  }, [originalPrompt]);

  // Analyze the prompt
  const analyze = useCallback(
    async (promptToAnalyze: string) => {
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

        if (data.maintained_id && chip?.mastery_id === data.maintained_id) {
          return;
        } else {
          if (data.satisfied_id && chip?.mastery_id === data.satisfied_id) {
            satisfyChip();
          }

          if (data.surface) {
            setChip({
              mastery_id: data.surface.mastery_id,
              surfaced_at: Date.now(),
              status: "active",
              chip_text: data.surface.chip_text,
              chip_description: data.surface.chip_description,
              chip_examples: data.surface.chip_examples,
            });
          }
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
    if (!enableMasteryChips || disabled || isStreaming) return;
    if (!debouncedPrompt || debouncedPrompt.trim().length < MIN_PROMPT_LENGTH)
      return;
    if (debouncedPrompt === lastAnalyzedPrompt.current) return;

    lastAnalyzedPrompt.current = debouncedPrompt;
    analyze(debouncedPrompt);
  }, [debouncedPrompt, enableMasteryChips, disabled, isStreaming, analyze]);

  // Clear chip when prompt is cleared
  useEffect(() => {
    if (!prompt || prompt.trim().length === 0) {
      setChip(null);
      lastAnalyzedPrompt.current = "";
    }
  }, [prompt]);

  // Scroll textarea to bottom during streaming
  useEffect(() => {
    if (isStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [completion, isStreaming]);

  return (
    <PromptContext.Provider
      value={{
        prompt: isStreaming ? `${originalPrompt}${completion}` : prompt,
        setPrompt,
        originalPrompt,
        chip,
        isAnalyzing,
        suppressedIds,
        completion,
        isStreaming,
        dismissChip,
        satisfyChip,
        resetSession,
        handleShowMe,
        handleRevert,
        textareaRef,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePromptContext must be used within a PromptProvider");
  }
  return context;
}
