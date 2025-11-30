"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      layout
      variants={chipVariants}
      initial="initial"
      animate={isSatisfied ? "satisfied" : "animate"}
      exit="exit"
      className={cn(
        "group relative overflow-hidden rounded-lg border transition-colors",
        "bg-card text-card-foreground shadow-sm",
        isSatisfied && "border-green-500/50 bg-green-50 dark:bg-green-950/30",
        isFading && "pointer-events-none",
        !isSatisfied && !isFading && "border-border hover:border-primary/30",
        chip.relevance === "high" && !isSatisfied && "border-primary/20"
      )}
      data-slot="mastery-chip"
    >
      {/* Main chip content */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isSatisfied ? [0, -10, 10, 0] : 0,
            scale: isSatisfied ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
        >
          {isSatisfied ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Sparkles className="text-primary/60 h-4 w-4" />
          )}
        </motion.div>

        {/* Chip text */}
        <span className="text-sm font-medium">
          {isSatisfied ? display.name : display.chip_text}
        </span>

        {/* Actions */}
        {!isSatisfied && (
          <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-destructive h-6 w-6"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      <motion.div
        variants={detailVariants}
        initial="hidden"
        animate={isExpanded && !isSatisfied ? "visible" : "hidden"}
        className="overflow-hidden"
      >
        <div className="border-t px-3 py-2">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {display.detail}
          </p>
          <p className="text-muted-foreground/60 mt-1 text-xs">
            {display.category}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
