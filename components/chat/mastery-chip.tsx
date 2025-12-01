"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
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

const detailVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      },
      opacity: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  },
};

export function MasteryChip({ chip, display, onDismiss }: MasteryChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSatisfied = chip.status === "satisfied";
  const isFading = chip.status === "fading";

  return (
    <motion.div
      variants={chipVariants}
      initial="initial"
      animate={isSatisfied ? "satisfied" : "animate"}
      exit="exit"
      className={cn(
        "group relative w-fit overflow-hidden rounded-md border transition-colors",
        "bg-card/80 text-card-foreground backdrop-blur-sm",
        isSatisfied &&
          "border-green-500/40 bg-green-50/80 dark:bg-green-950/20",
        isFading && "pointer-events-none",
        !isSatisfied && !isFading && "border-border/50 hover:border-border",
        chip.relevance === "high" && !isSatisfied && "border-grey/30"
      )}
      data-slot="mastery-chip"
    >
      <div className="flex items-center gap-1.5 px-2 py-1">
        {/* Icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isSatisfied ? [0, -10, 10, 0] : 0,
            scale: isSatisfied ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          className="shrink-0"
        >
          {isSatisfied ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          ) : (
            <ClaudeLogo className="h-3 w-3 text-[#d97757]" />
          )}
        </motion.div>

        {/* Chip text */}
        <span className="text-muted-foreground text-xs">
          {isSatisfied ? display.name : display.chip_text}
        </span>

        {/* Actions */}
        {!isSatisfied && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onDismiss}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>
      {/* Expanded detail */}
      <motion.div
        variants={detailVariants}
        initial="hidden"
        animate={isExpanded && !isSatisfied ? "visible" : "hidden"}
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
    </motion.div>
  );
}
