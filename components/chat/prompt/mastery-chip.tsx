"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import { usePromptContext } from "@/components/chat/prompt/prompt-context";
import { parseFormattedMasteryName } from "@/lib/masteries";
import type {
  ActiveMasteryChip,
  MasteryDisplayData,
} from "@/lib/masteries/types";

interface MasteryChipProps {
  chip: ActiveMasteryChip;
  display?: MasteryDisplayData; // Optional - not present for custom suggestions
}

export function MasteryChip({ chip, display }: MasteryChipProps) {
  const { dismissMasteryChip, handleMasteryDemonstration } = usePromptContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShowMeLoading, setIsShowMeLoading] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const isSatisfied = chip.status === "satisfied";

  const formattedCategoryName = chip.mastery_id
    ? parseFormattedMasteryName(chip.mastery_id)
    : null;

  // Click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;

    function handleClickOutside(event: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleChipClick = () => {
    if (!isSatisfied) {
      setIsExpanded(true);
    }
  };

  const onDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissMasteryChip();
  };

  const onShowMeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowMeLoading(true);
    try {
      await handleMasteryDemonstration({
        masteryId: chip.mastery_id,
        suggestionText: chip.suggestion_text || "",
        suggestionDescription: chip.suggestion_description || "",
      });
    } catch (error) {
      console.error("Show me failed:", error);
    } finally {
      setIsShowMeLoading(false);
    }
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={chipRef}
      onClick={handleChipClick}
      className="group bg-card text-card-foreground border-border/50 hover:border-border relative max-w-full cursor-pointer overflow-hidden border backdrop-blur-sm"
      style={{ borderRadius: 6 }}
      data-slot="mastery-chip"
    >
      <motion.div
        layout
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex items-center gap-1.5 px-2 py-1"
      >
        {/* Icon */}
        {isSatisfied ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <ClaudeLogo className="h-3 w-3 text-claude-orange" />
        )}

        {/* Chip text */}
        <div className="text-foreground/80 min-w-0 flex-1 truncate text-sm">
          {isSatisfied
            ? formattedCategoryName || "Applied suggestion"
            : chip.suggestion_text}
        </div>

        {/* Actions */}
        {!isSatisfied && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-5 w-5 shrink-0"
              onClick={onDismissClick}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}
      </motion.div>
      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && !isSatisfied && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-border/30 border-t px-2 py-1.5">
              <p className="text-muted-foreground text-sm">
                {chip.suggestion_description || display?.detail}
              </p>
              {chip.suggestion_examples &&
                chip.suggestion_examples.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {chip.suggestion_examples.map((example, i) => (
                      <p
                        key={i}
                        className="text-muted-foreground border-muted/30 border-l-2 pl-2 text-sm italic"
                      >
                        &ldquo;{example}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              <div className="mt-2 flex items-center justify-end">
                {formattedCategoryName && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground mr-auto h-6 px-2 text-xs"
                  >
                    {formattedCategoryName}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs text-claude-orange hover:text-claude-orange"
                  onClick={onShowMeClick}
                  disabled={isShowMeLoading}
                >
                  {isShowMeLoading && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Show me
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
