"use client";

import type { ComponentProps } from "react";
import { ArrowUp, Undo2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import { MasteryChipContainer } from "./mastery-chip-container";
import { MasteryDebugPopover } from "@/components/chat/prompt/mastery-debug-popover";
import {
  PromptProvider,
  usePromptContext,
} from "@/components/chat/prompt/prompt-context";
import { useInputHeight } from "@/components/chat/prompt/input-height-context";
import { cn } from "@/lib/utils";
import { MIN_PROMPT_LENGTH } from "@/lib/constants";

interface PromptInputProps extends ComponentProps<"div"> {
  onPromptSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableMasterySuggestions?: boolean;
}

export function PromptInput({
  onPromptSubmit,
  disabled = false,
  placeholder = "How can I help you today?",
  enableMasterySuggestions = true,
  className,
  ...props
}: PromptInputProps) {
  return (
    <PromptProvider
      enableMasterySuggestions={enableMasterySuggestions}
      disabled={disabled}
    >
      <PromptInputInner
        onPromptSubmit={onPromptSubmit}
        disabled={disabled}
        placeholder={placeholder}
        enableMasterySuggestions={enableMasterySuggestions}
        className={className}
        {...props}
      />
    </PromptProvider>
  );
}

function PromptInputInner({
  onPromptSubmit,
  disabled = false,
  placeholder = "How can I help you today?",
  enableMasterySuggestions = true,
  className,
  ...props
}: PromptInputProps) {
  const {
    prompt,
    setPrompt,
    handleUserInput,
    originalPrompt,
    isShowMeStreaming,
    isAnalyzing,
    resetSession,
    handleRevert,
    triggerManualAnalysis,
    textareaRef,
  } = usePromptContext();

  const { inputContainerRef } = useInputHeight();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleUserInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;

    onPromptSubmit(prompt);
    setPrompt("");
    resetSession();
    textareaRef.current?.focus();
  };

  return (
    <div
      ref={inputContainerRef}
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-4 pb-4",
        className
      )}
      {...props}
    >
      {/* Debug Popover */}
      {enableMasterySuggestions && <MasteryDebugPopover />}

      <div className="mx-auto max-w-3xl space-y-2">
        {/* Mastery Chips */}
        {enableMasterySuggestions && (
          <MasteryChipContainer className="pointer-events-auto" />
        )}

        <form onSubmit={handleSubmit} className="pointer-events-auto">
          {/* Input Area */}
          <div
            className={cn(
              "bg-background overflow-hidden rounded-xl border shadow-lg transition-all",
              !isShowMeStreaming &&
                "border-border focus-within:border-foreground/20"
            )}
            style={
              isShowMeStreaming
                ? {
                    animation: "pulse-border 1.5s ease-in-out infinite",
                    borderColor: "rgba(217, 120, 87, 0.4)",
                  }
                : undefined
            }
          >
            <AutosizeTextarea
              ref={textareaRef}
              value={prompt}
              onChange={handleMessageChange}
              placeholder={placeholder}
              disabled={disabled || isShowMeStreaming}
              autoFocus
              minHeight={50}
              maxHeight="50vh"
              className="text-foreground placeholder:text-muted-foreground w-full rounded-md border-0 bg-transparent px-3 py-3 text-base shadow-none transition-[color,box-shadow] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-base dark:bg-transparent"
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                // On mobile/touch devices, allow Enter for new lines
                // On desktop, Enter submits (Shift+Enter for new line)
                const isTouchDevice =
                  "ontouchstart" in window || navigator.maxTouchPoints > 0;
                if (e.key === "Enter" && !e.shiftKey && !isTouchDevice) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Button Bar */}
            <div className="flex items-center justify-between px-2 pb-2">
              {/* Left side - Action Buttons */}
              <div className="flex items-center gap-2">
                {isShowMeStreaming && (
                  <ClaudeLogo
                    size={20}
                    style={{
                      animation: "pulse-scale 1.2s ease-in-out infinite",
                    }}
                  />
                )}
                {originalPrompt !== null && !isShowMeStreaming && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                        onClick={handleRevert}
                      >
                        <Undo2 className="mr-1 h-3.5 w-3.5" />
                        Revert
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore original prompt</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Right side - Submit Button */}
              <div className="flex items-center gap-2">
                {!isShowMeStreaming && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="hover:bg-accent h-8 w-8"
                        disabled={
                          disabled ||
                          isShowMeStreaming ||
                          isAnalyzing ||
                          prompt.trim().length < MIN_PROMPT_LENGTH
                        }
                        onClick={triggerManualAnalysis}
                        style={
                          isAnalyzing
                            ? {
                                animation:
                                  "pulse-border 1.5s ease-in-out infinite",
                                borderColor: "rgba(217, 120, 87, 0.4)",
                              }
                            : undefined
                        }
                      >
                        <Brain
                          className={cn(
                            "h-4 w-4",
                            !isAnalyzing && "text-muted-foreground"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Prompt help</TooltipContent>
                  </Tooltip>
                )}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!prompt.trim() || disabled || isShowMeStreaming}
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
