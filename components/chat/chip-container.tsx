"use client";

import { AnimatePresence } from "framer-motion";
import type { ActiveChip, MasteryDisplayData } from "@/lib/masteries/types";
import { MasteryChip } from "./mastery-chip";
import { cn } from "@/lib/utils";

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

  if (visibleChips.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence mode="popLayout">
        {visibleChips.map((chip) => {
          const display = masteryDisplayData[chip.mastery_id];
          if (!display) return null;

          return (
            <MasteryChip
              key={chip.mastery_id}
              chip={chip}
              display={display}
              onDismiss={() => onDismiss(chip.mastery_id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
