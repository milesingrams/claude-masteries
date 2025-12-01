"use client";

import { useState, useRef } from "react";
import { Plus, ArrowUp } from "lucide-react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { learnedMasteryIds, markSatisfied, isLoading } = useMasteryContext();

  const { chips, dismissChip } = usePromptAnalysis(message, {
    enabled: enableChips && !disabled && !isLoading,
    learnedMasteryIds,
    onSatisfied: markSatisfied,
  });

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
            className="pointer-events-auto"
          />
        )}

        <form onSubmit={handleSubmit} className="pointer-events-auto">
          {/* Input Area */}
          <div className="border-border bg-background focus-within:border-foreground/20 relative rounded-xl border shadow-lg transition-all">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="text-foreground placeholder:text-muted-foreground max-h-[200px] min-h-[80px] resize-none border-0 bg-transparent px-3 py-3 pr-20 text-base focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
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
                disabled={!message.trim() || disabled}
                className="bg-primary hover:bg-primary/90 h-8 w-8 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
