"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ActiveChip } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MasteryChip } from "./mastery-chip";
import { cn } from "@/lib/utils";

interface ChipContainerProps {
  chips: ActiveChip[];
  onDismiss: (id: string) => void;
  className?: string;
}

export function ChipContainer({
  chips,
  onDismiss,
  className,
}: ChipContainerProps) {
  const { getMasteryDisplay, hasMasteryDisplay } = useMasteryContext();

  // Only show chips that have display data
  const visibleChips = chips.filter((chip) =>
    hasMasteryDisplay(chip.mastery_id)
  );

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <AnimatePresence mode="sync">
        {visibleChips.map((chip) => {
          const display = getMasteryDisplay(chip.mastery_id);
          if (!display) return null;

          return (
            <motion.div
              key={chip.mastery_id}
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
