"use client";

import { useState } from "react";
import { Plus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MessageInput() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("Opus 4.5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Handle message submission here
    console.log("Submitting:", message);
    setMessage("");
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Area */}
          <div className="relative rounded-xl border border-border bg-input focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can I help you today?"
              className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 pr-20 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
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
                className="h-8 w-8 hover:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  {selectedModel}
                  <svg
                    className="ml-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-popover">
                <DropdownMenuItem
                  onClick={() => setSelectedModel("Opus 4.5")}
                  className="cursor-pointer"
                >
                  Opus 4.5
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel("Sonnet 4.5")}
                  className="cursor-pointer"
                >
                  Sonnet 4.5
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel("Haiku 4")}
                  className="cursor-pointer"
                >
                  Haiku 4
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </form>
      </div>
    </div>
  );
}
