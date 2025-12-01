"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import { usePromptContext } from "@/components/chat/prompt/prompt-context";
import type { ActiveChip, MasteryDisplayData } from "@/lib/masteries/types";

interface MasteryChipProps {
  chip: ActiveChip;
  display: MasteryDisplayData;
}

export function MasteryChip({ chip, display }: MasteryChipProps) {
  const { dismissChip, handleShowMe } = usePromptContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShowMeLoading, setIsShowMeLoading] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const isSatisfied = chip.status === "satisfied";

  const formattedCategoryName = `${display.category} / ${display.name}`;

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
    dismissChip();
  };

  const onShowMeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowMeLoading(true);
    try {
      await handleShowMe(chip.mastery_id, chip.chip_text || "");
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
      className="group bg-card text-card-foreground border-border/50 hover:border-border relative w-fit cursor-pointer overflow-hidden border backdrop-blur-sm"
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
          <ClaudeLogo className="h-3 w-3 text-[#d97757]" />
        )}

        {/* Chip text */}
        <div className="text-muted-foreground flex-1 text-xs whitespace-nowrap">
          {isSatisfied ? formattedCategoryName : chip.chip_text}
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
              <p className="text-muted-foreground/80 text-[11px] leading-relaxed">
                {display.detail}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-muted-foreground/50 text-[10px]">
                  {formattedCategoryName}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-[#d97757] hover:text-[#d97757]/80"
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
