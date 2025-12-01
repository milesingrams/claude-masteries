"use client";

import type { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { usePromptContext } from "@/components/chat/prompt/prompt-context";
import { MasteryChip } from "./mastery-chip";
import { cn } from "@/lib/utils";

export function MasteryChipContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  const { getMasteryDisplay } = useMasteryContext();
  const { chip } = usePromptContext();

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
            <MasteryChip chip={chip} display={display} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
