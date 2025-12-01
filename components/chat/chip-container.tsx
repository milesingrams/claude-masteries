"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ActiveChip, MasteryDisplayData } from "@/lib/masteries/types";
import { MasteryChip } from "./mastery-chip";
import { cn } from "@/lib/utils";

const chipWrapperVariants = {
  initial: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};

interface ChipContainerProps {
  chips: ActiveChip[];
  masteryDisplayData: Record<string, MasteryDisplayData>;
  onDismiss: (id: string) => void;
  className?: string;
}

export function ChipContainer({
  chips,
  masteryDisplayData,
  onDismiss,
  className,
}: ChipContainerProps) {
  // Only show chips that have display data
  const visibleChips = chips.filter(
    (chip) => masteryDisplayData[chip.mastery_id]
  );

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <AnimatePresence>
        {visibleChips.map((chip) => {
          const display = masteryDisplayData[chip.mastery_id];
          if (!display) return null;

          return (
            <motion.div
              key={chip.mastery_id}
              variants={chipWrapperVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <MasteryChip
                chip={chip}
                display={display}
                onDismiss={() => onDismiss(chip.mastery_id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
