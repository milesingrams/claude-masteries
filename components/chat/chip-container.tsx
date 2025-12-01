"use client";

import type { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ActiveChip } from "@/lib/masteries/types";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MasteryChip } from "./mastery-chip";
import { cn } from "@/lib/utils";

interface ChipContainerProps extends ComponentProps<"div"> {
  chip: ActiveChip | null;
  onDismiss: () => void;
  onShowMe: (masteryId: string, chipText: string) => Promise<void>;
}

export function ChipContainer({
  chip,
  onDismiss,
  onShowMe,
  className,
  ...props
}: ChipContainerProps) {
  const { getMasteryDisplay } = useMasteryContext();

  const display = chip ? getMasteryDisplay(chip.mastery_id) : null;
  const isVisible = chip && display;

  return (
    <div
      className={cn("flex flex-col items-start gap-2", className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            key={chip.mastery_id}
            layout
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(4px)",
              scale: 0.95,
              transition: {
                duration: chip.status === "satisfied" ? 2 : 0.2,
                ease: "easeOut",
              },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <MasteryChip
              chip={chip}
              display={display}
              onDismiss={onDismiss}
              onShowMe={() => onShowMe(chip.mastery_id, chip.chip_text || "")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
