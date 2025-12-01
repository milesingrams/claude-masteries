"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import type { ActiveChip, MasteryDisplayData } from "@/lib/masteries/types";

interface MasteryChipProps {
  chip: ActiveChip;
  display: MasteryDisplayData;
  onDismiss: () => void;
}

const chipVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  satisfied: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};


export function MasteryChip({ chip, display, onDismiss }: MasteryChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const isSatisfied = chip.status === "satisfied";
  const isFading = chip.status === "fading";

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
    if (!isSatisfied && !isFading) {
      setIsExpanded(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  };

  return (
    <motion.div
      ref={chipRef}
      layout
      variants={chipVariants}
      initial="initial"
      animate={isSatisfied ? "satisfied" : "animate"}
      exit="exit"
      onClick={handleChipClick}
      transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
      className={cn(
        "group relative overflow-hidden rounded-md border",
        "bg-card/80 text-card-foreground backdrop-blur-sm",
        isSatisfied &&
          "border-green-500/40 bg-green-50/80 dark:bg-green-950/20",
        isFading && "pointer-events-none",
        !isSatisfied &&
          !isFading &&
          "border-border/50 hover:border-border cursor-pointer",
        chip.relevance === "high" && !isSatisfied && "border-grey/30",
        "w-fit"
      )}
      data-slot="mastery-chip"
    >
      <motion.div layout="position" className="flex items-center gap-1.5 px-2 py-1">
        {/* Icon */}
        <div className="shrink-0">
          {isSatisfied ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          ) : (
            <ClaudeLogo className="h-3 w-3 text-[#d97757]" />
          )}
        </div>

        {/* Chip text */}
        <span className="text-muted-foreground flex-1 text-xs whitespace-nowrap">
          {isSatisfied ? display.name : display.chip_text}
        </span>

        {/* Actions */}
        {!isSatisfied && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        )}
      </motion.div>
      {/* Expanded detail */}
      <AnimatePresence mode="popLayout">
        {isExpanded && !isSatisfied && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-border/30 border-t px-2 py-1.5">
              <p className="text-muted-foreground/80 text-[11px] leading-relaxed">
                {display.detail}
              </p>
              <p className="text-muted-foreground/50 mt-0.5 text-[10px]">
                {display.category}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
