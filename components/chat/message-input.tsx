"use client";

import type { ComponentProps } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Plus, ArrowUp, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import { ChipContainer } from "./chip-container";
import { MasteryDebugPopover } from "@/components/debug/mastery-debug-popover";
import { usePromptAnalysis } from "@/hooks/use-prompt-analysis";
import { cn } from "@/lib/utils";

interface MessageInputProps extends ComponentProps<"div"> {
  onMessageSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableChips?: boolean;
}

export function MessageInput({
  onMessageSubmit,
  disabled = false,
  placeholder = "How can I help you today?",
  enableChips = true,
  className,
  ...props
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    completion,
    complete,
    isLoading: isStreaming,
  } = useCompletion({
    api: "/api/rewrite-prompt",
    streamProtocol: "text",
    onFinish: (prompt, completionText) => {
      // prompt is the original we passed to complete()
      setMessage(`${prompt} ${completionText}`);
    },
    onError: (error) => {
      console.error("Show me failed:", error);
      // Revert handled by originalPrompt state
    },
  });

  const { chip, suppressedIds, dismissChip, satisfyChip, resetSession } =
    usePromptAnalysis(message, {
      enabled: enableChips && !disabled && !isStreaming,
    });

  // Scroll textarea to bottom during streaming
  useEffect(() => {
    if (isStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [completion, isStreaming]);

  const handleShowMe = useCallback(
    async (masteryId: string, chipText: string): Promise<void> => {
      setOriginalPrompt(message);

      // Mark satisfied immediately - user engaged with the technique
      satisfyChip();

      // Trigger completion with mastery params
      await complete(message, {
        body: {
          mastery_id: masteryId,
          chip_text: chipText,
        },
      });
    },
    [message, complete, satisfyChip]
  );

  const handleRevert = useCallback(() => {
    if (originalPrompt !== null) {
      setMessage(originalPrompt);
      setOriginalPrompt(null);
    }
  }, [originalPrompt]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // If user edits after a rewrite, clear the revert option
    if (originalPrompt !== null) {
      setOriginalPrompt(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onMessageSubmit(message);
    setMessage("");
    resetSession();
    textareaRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-4 pb-4",
        className
      )}
      {...props}
    >
      {/* Debug Popover */}
      {enableChips && (
        <MasteryDebugPopover activeChip={chip} suppressedIds={suppressedIds} />
      )}

      <div className="mx-auto max-w-3xl space-y-2">
        {/* Mastery Chips */}
        {enableChips && (
          <ChipContainer
            chip={chip}
            onDismiss={dismissChip}
            onShowMe={handleShowMe}
            className="pointer-events-auto"
          />
        )}

        <form onSubmit={handleSubmit} className="pointer-events-auto">
          {/* Input Area */}
          <div
            className={cn(
              "bg-background overflow-hidden rounded-xl border shadow-lg transition-all",
              !isStreaming && "border-border focus-within:border-foreground/20"
            )}
            style={
              isStreaming
                ? {
                    animation: "pulse-border 1.5s ease-in-out infinite",
                    borderColor: "rgba(217, 120, 87, 0.4)",
                  }
                : undefined
            }
          >
            <Textarea
              ref={textareaRef}
              value={isStreaming ? `${originalPrompt} ${completion}` : message}
              onChange={handleMessageChange}
              placeholder={placeholder}
              disabled={disabled || isStreaming}
              autoFocus
              className="text-foreground placeholder:text-muted-foreground max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent px-3 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-base dark:bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Button Bar */}
            <div className="flex items-center justify-between px-2 pb-2">
              {/* Left side - Revert Button or Streaming Indicator */}
              <div className="flex items-center">
                {isStreaming && (
                  <ClaudeLogo
                    size={20}
                    style={{
                      animation: "pulse-scale 1.2s ease-in-out infinite",
                    }}
                  />
                )}
                {originalPrompt !== null && !isStreaming && (
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
