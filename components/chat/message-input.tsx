"use client";

import { useState } from "react";
import { Plus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSubmit,
  disabled = false,
  placeholder = "How can I help you today?",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage("");
  };

  return (
    <div className="border-border bg-background border-t">
      <div className="mx-auto max-w-3xl p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Area */}
          <div className="border-border bg-input focus-within:border-ring focus-within:ring-ring relative rounded-xl border transition-all focus-within:ring-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="text-foreground placeholder:text-muted-foreground max-h-[200px] min-h-[56px] resize-none border-0 bg-transparent px-4 py-3 pr-20 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
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
