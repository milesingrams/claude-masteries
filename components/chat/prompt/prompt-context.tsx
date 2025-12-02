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
import { useCompletion } from "@ai-sdk/react";
import type { ActiveMasteryChip } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MIN_PROMPT_LENGTH } from "@/lib/constants";
import {
  analyzePromptResponseSchema,
  type AnalyzePromptResponse,
} from "@/app/api/analyze-prompt-for-mastery/schema";

const DEBOUNCE_DELAY = 800;

interface PromptContextValue {
  // Prompt state
  prompt: string;
  setPrompt: (value: string) => void;
  handleUserInput: (value: string) => void;
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
  const [suppressedIds, setSuppressedIds] = useState<string[]>([]);

  // Debounce timer for user input
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lastAnalyzedPrompt = useRef<string>("");

  // Handle analysis response - extracted to avoid closure issues with useObject
  const handleAnalysisResponse = useCallback(
    (data: AnalyzePromptResponse) => {
      if (
        data.maintained_id &&
        activeMasteryChip?.mastery_id === data.maintained_id
      ) {
        return;
      }

      if (
        data.satisfied_id &&
        activeMasteryChip?.mastery_id === data.satisfied_id
      ) {
        const masteryId = activeMasteryChip?.mastery_id;
        if (masteryId) {
          markSatisfied(masteryId);
          setSuppressedIds((prev) => [...prev, masteryId]);
        }
        setActiveMasteryChip((prev) =>
          prev ? { ...prev, status: "satisfied" } : null
        );
        requestAnimationFrame(() => setActiveMasteryChip(null));
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
    },
    [activeMasteryChip, markSatisfied]
  );

  // Prompt analysis with fetch
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopAnalysis = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const submitAnalysis = useCallback(
    async (payload: {
      partial_prompt: string;
      active_mastery_chip: {
        mastery_id: string | null;
        suggestion_text: string;
        suggestion_description: string;
        suggestion_examples: string[];
      } | null;
      learned_mastery_ids?: string[];
      suppressed_mastery_ids?: string[];
      manual_mode?: boolean;
    }) => {
      // Abort any in-flight request
      stopAnalysis();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-prompt-for-mastery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }

        const data = analyzePromptResponseSchema.parse(await response.json());
        handleAnalysisResponse(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, ignore
          return;
        }
        console.error("Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [stopAnalysis, handleAnalysisResponse]
  );

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

  // Analyze the prompt using useObject's submit
  const analyzePrompt = useCallback(
    (promptToAnalyze: string) => {
      // Stop any in-progress analysis
      stopAnalysis();

      // Build active chip payload for satisfaction detection
      const activeChipPayload =
        activeMasteryChip?.status === "active" &&
        activeMasteryChip.suggestion_text &&
        activeMasteryChip.suggestion_description &&
        activeMasteryChip.suggestion_examples
          ? {
              mastery_id: activeMasteryChip.mastery_id,
              suggestion_text: activeMasteryChip.suggestion_text,
              suggestion_description: activeMasteryChip.suggestion_description,
              suggestion_examples: activeMasteryChip.suggestion_examples,
            }
          : null;

      submitAnalysis({
        partial_prompt: promptToAnalyze,
        active_mastery_chip: activeChipPayload,
        learned_mastery_ids: learnedMasteryIds,
        suppressed_mastery_ids: suppressedIds,
        manual_mode: false,
      });
    },
    [
      activeMasteryChip,
      learnedMasteryIds,
      suppressedIds,
      submitAnalysis,
      stopAnalysis,
    ]
  );

  // Manual analysis trigger (bypasses debounce and filtering)
  // Inlines dismiss logic to compute fresh values before API call
  const triggerManualAnalysis = useCallback(() => {
    if (prompt.trim().length < MIN_PROMPT_LENGTH) return;

    // Compute new state values before any async operations
    const masteryId = activeMasteryChip?.mastery_id;
    const newSuppressedIds = masteryId
      ? [...suppressedIds, masteryId]
      : suppressedIds;

    // Update state for UI
    if (masteryId) {
      setSuppressedIds(newSuppressedIds);
    }
    setActiveMasteryChip(null);

    // Stop any in-progress analysis and submit with fresh values
    stopAnalysis();
    submitAnalysis({
      partial_prompt: prompt,
      active_mastery_chip: null, // We just dismissed
      learned_mastery_ids: learnedMasteryIds,
      suppressed_mastery_ids: newSuppressedIds,
      manual_mode: true,
    });
  }, [
    prompt,
    activeMasteryChip,
    suppressedIds,
    learnedMasteryIds,
    stopAnalysis,
    submitAnalysis,
  ]);

  // Handle user input - updates prompt and schedules debounced analysis
  const handleUserInput = useCallback(
    (value: string) => {
      setPrompt(value);

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedule analysis if conditions are met
      if (
        enableMasterySuggestions &&
        !disabled &&
        value.trim().length >= MIN_PROMPT_LENGTH &&
        value !== lastAnalyzedPrompt.current
      ) {
        debounceTimerRef.current = setTimeout(() => {
          lastAnalyzedPrompt.current = value;
          analyzePrompt(value);
        }, DEBOUNCE_DELAY);
      }
    },
    [enableMasterySuggestions, disabled, analyzePrompt]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
        handleUserInput,
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
