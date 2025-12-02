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
import type { ActiveMasteryChip } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MIN_PROMPT_LENGTH } from "@/lib/constants";

// Response type from analyze-prompt-for-mastery API
type AnalyzePromptResponse = {
  surface: {
    mastery_id: string | null; // null for custom suggestions
    suggestion_text: string;
    suggestion_description: string;
    suggestion_examples: string[];
  } | null;
  maintained_id: string | null;
  satisfied_id: string | null;
};

const DEBOUNCE_DELAY = 1000;

interface PromptContextValue {
  // Prompt state
  prompt: string;
  setPrompt: (value: string) => void;
  originalPrompt: string | null;

  // Analysis state
  activeMasteryChip: ActiveMasteryChip | null;
  isAnalyzing: boolean;
  suppressedIds: string[];

  // Show me streaming state
  masteryDemonstrationText: string;
  isShowMeStreaming: boolean;

  // Actions
  dismissMasteryChip: () => void;
  satisfyMasteryChip: () => void;
  resetSession: () => void;
  handleMasteryDemonstration: (params: {
    masteryId: string | null;
    suggestionText: string;
    suggestionDescription: string;
  }) => Promise<void>;
  handleRevert: () => void;
  triggerManualAnalysis: () => void;

  // Refs
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const PromptContext = createContext<PromptContextValue | null>(null);

interface PromptProviderProps {
  children: ReactNode;
  enableMasterySuggestions?: boolean;
  disabled?: boolean;
}

export function PromptProvider({
  children,
  enableMasterySuggestions = true,
  disabled = false,
}: PromptProviderProps) {
  const { learnedMasteryIds, markSatisfied } = useMasteryContext();

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Analysis state
  const [activeMasteryChip, setActiveMasteryChip] =
    useState<ActiveMasteryChip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debouncedPrompt, setDebouncedPrompt] = useState("");
  const [suppressedIds, setSuppressedIds] = useState<string[]>([]);

  const lastAnalyzedPrompt = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Show me streaming
  const {
    completion: masteryDemonstrationText,
    complete: triggerShowMe,
    isLoading: isShowMeStreaming,
  } = useCompletion({
    api: "/api/complete-prompt-with-mastery",
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

  // Mastery chip management
  const dismissMasteryChip = useCallback(() => {
    const masteryId = activeMasteryChip?.mastery_id;
    if (masteryId) {
      setSuppressedIds((prev) => [...prev, masteryId]);
    }
    setActiveMasteryChip(null);
  }, [activeMasteryChip]);

  const satisfyMasteryChip = useCallback(() => {
    const masteryId = activeMasteryChip?.mastery_id;
    if (masteryId) {
      markSatisfied(masteryId);
      setSuppressedIds((prev) => [...prev, masteryId]);
    }
    setActiveMasteryChip((prev) =>
      prev ? { ...prev, status: "satisfied" } : null
    );
    requestAnimationFrame(() => setActiveMasteryChip(null));
  }, [activeMasteryChip, markSatisfied]);

  const resetSession = useCallback(() => {
    setSuppressedIds([]);
  }, []);

  // Mastery demonstration handler
  const handleMasteryDemonstration = useCallback(
    async ({
      masteryId,
      suggestionText,
      suggestionDescription,
    }: {
      masteryId: string | null;
      suggestionText: string;
      suggestionDescription: string;
    }): Promise<void> => {
      setOriginalPrompt(prompt);

      // For custom suggestions (null mastery_id), just dismiss instead of tracking satisfaction
      satisfyMasteryChip();

      await triggerShowMe(prompt, {
        body: {
          mastery_id: masteryId,
          suggestion_text: suggestionText,
          suggestion_description: suggestionDescription,
        },
      });
    },
    [prompt, triggerShowMe, satisfyMasteryChip]
  );

  // Revert handler
  const handleRevert = useCallback(() => {
    if (originalPrompt !== null) {
      setPrompt(originalPrompt);
      setOriginalPrompt(null);
    }
  }, [originalPrompt]);

  // Analyze the prompt
  const analyzePrompt = useCallback(
    async (promptToAnalyze: string, manual: boolean = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsAnalyzing(true);

      try {
        const activeMasteryId =
          activeMasteryChip?.status === "active"
            ? activeMasteryChip.mastery_id
            : null;

        const response = await fetch("/api/analyze-prompt-for-mastery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partial_prompt: promptToAnalyze,
            active_mastery_id: activeMasteryId,
            learned_mastery_ids: learnedMasteryIds,
            suppressed_mastery_ids: suppressedIds,
            manual_mode: manual,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data: AnalyzePromptResponse = await response.json();

        if (
          data.maintained_id &&
          activeMasteryChip?.mastery_id === data.maintained_id
        ) {
          return;
        } else {
          if (
            data.satisfied_id &&
            activeMasteryChip?.mastery_id === data.satisfied_id
          ) {
            satisfyMasteryChip();
          }

          if (data.surface) {
            setActiveMasteryChip({
              mastery_id: data.surface.mastery_id,
              surfaced_at: Date.now(),
              status: "active",
              suggestion_text: data.surface.suggestion_text,
              suggestion_description: data.surface.suggestion_description,
              suggestion_examples: data.surface.suggestion_examples,
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
    [activeMasteryChip, learnedMasteryIds, satisfyMasteryChip, suppressedIds]
  );

  // Manual analysis trigger (bypasses debounce and filtering)
  const triggerManualAnalysis = useCallback(() => {
    if (prompt.trim().length >= MIN_PROMPT_LENGTH) {
      dismissMasteryChip(); // Clear existing chip before fresh analysis
      analyzePrompt(prompt, true);
    }
  }, [prompt, analyzePrompt, dismissMasteryChip]);

  // Trigger analysis when debounced prompt changes
  useEffect(() => {
    if (!enableMasterySuggestions || disabled || isShowMeStreaming) return;
    if (!debouncedPrompt || debouncedPrompt.trim().length < MIN_PROMPT_LENGTH)
      return;
    if (debouncedPrompt === lastAnalyzedPrompt.current) return;

    lastAnalyzedPrompt.current = debouncedPrompt;
    analyzePrompt(debouncedPrompt);
  }, [
    debouncedPrompt,
    enableMasterySuggestions,
    disabled,
    isShowMeStreaming,
    analyzePrompt,
  ]);

  // Clear chip when prompt is cleared
  useEffect(() => {
    if (!prompt || prompt.trim().length === 0) {
      setActiveMasteryChip(null);
      lastAnalyzedPrompt.current = "";
    }
  }, [prompt]);

  // Scroll textarea to bottom during streaming
  useEffect(() => {
    if (isShowMeStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [masteryDemonstrationText, isShowMeStreaming]);

  return (
    <PromptContext.Provider
      value={{
        prompt: isShowMeStreaming
          ? `${originalPrompt}${masteryDemonstrationText}`
          : prompt,
        setPrompt,
        originalPrompt,
        activeMasteryChip,
        isAnalyzing,
        suppressedIds,
        masteryDemonstrationText,
        isShowMeStreaming,
        dismissMasteryChip,
        satisfyMasteryChip,
        resetSession,
        handleMasteryDemonstration,
        handleRevert,
        triggerManualAnalysis,
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
