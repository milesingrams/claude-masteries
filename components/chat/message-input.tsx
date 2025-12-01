"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, ArrowUp, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChipContainer } from "./chip-container";
import { usePromptAnalysis } from "@/hooks/use-prompt-analysis";
import { useMasteryContext } from "@/lib/masteries/mastery-context";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableChips?: boolean;
}

export function MessageInput({
  onSubmit,
  disabled = false,
  placeholder = "How can I help you today?",
  enableChips = true,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [rewriteState, setRewriteState] = useState<{
    originalPrompt: string;
    masteryId: string;
  } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamedTextRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { learnedMasteryIds, markSatisfied } = useMasteryContext();

  const { chips, dismissChip } = usePromptAnalysis(message, {
    enabled: enableChips && !disabled && !isStreaming,
    learnedMasteryIds,
    onSatisfied: markSatisfied,
  });

  const handleShowMe = useCallback(
    async (masteryId: string, chipText: string) => {
      const original = message;
      setRewriteState({ originalPrompt: original, masteryId });
      setIsStreaming(true);
      setMessage("");
      streamedTextRef.current = "";

      try {
        const response = await fetch("/api/rewrite-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_prompt: original,
            mastery_id: masteryId,
            chip_text: chipText,
          }),
        });

        if (!response.ok) throw new Error("Rewrite failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          streamedTextRef.current = accumulated;
          setMessage(accumulated);
        }

        // Mark mastery as satisfied after successful rewrite
        markSatisfied(masteryId);
        dismissChip(masteryId);
      } catch (error) {
        console.error("Show me failed:", error);
        // Restore original on error
        setMessage(original);
        setRewriteState(null);
      } finally {
        setIsStreaming(false);
      }
    },
    [message, markSatisfied, dismissChip]
  );

  const handleRevert = useCallback(() => {
    if (rewriteState) {
      setMessage(rewriteState.originalPrompt);
      setRewriteState(null);
      streamedTextRef.current = "";
    }
  }, [rewriteState]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // If user edits after a rewrite, clear the revert option
    if (rewriteState && newValue !== streamedTextRef.current) {
      setRewriteState(null);
      streamedTextRef.current = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage("");
    textareaRef.current?.focus();
  };

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-4 pb-4">
      <div className="mx-auto max-w-3xl space-y-2">
        {/* Mastery Chips */}
        {enableChips && (
          <ChipContainer
            chips={chips}
            onDismiss={dismissChip}
            onShowMe={handleShowMe}
            className="pointer-events-auto"
          />
        )}

        <form onSubmit={handleSubmit} className="pointer-events-auto">
          {/* Input Area */}
          <div className="border-border bg-background focus-within:border-foreground/20 overflow-hidden rounded-xl border shadow-lg transition-all">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              placeholder={placeholder}
              disabled={disabled || isStreaming}
              className="text-foreground placeholder:text-muted-foreground max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent px-3 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Button Bar */}
            <div className="flex items-center justify-between px-2 pb-2">
              {/* Left side - Revert Button */}
              <div>
                {rewriteState && !isStreaming && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                    onClick={handleRevert}
                  >
                    <Undo2 className="mr-1 h-3.5 w-3.5" />
                    Revert
                  </Button>
                )}
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="hover:bg-accent h-8 w-8"
                  disabled={disabled}
                >
                  <Plus className="text-muted-foreground h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || disabled || isStreaming}
                  className="bg-primary hover:bg-primary/90 h-8 w-8 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
