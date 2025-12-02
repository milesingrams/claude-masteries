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
  const { activeMasteryChip } = usePromptContext();

  const display = activeMasteryChip ? getMasteryDisplay(activeMasteryChip.mastery_id) : null;
  const isVisible = activeMasteryChip && display;

  return (
    <div
      className={cn("flex flex-col items-start gap-2", className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            key={activeMasteryChip.mastery_id}
            layout
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(4px)",
              scale: 0.95,
              transition: {
                duration: activeMasteryChip.status === "satisfied" ? 2 : 0.2,
                ease: "easeOut",
              },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <MasteryChip chip={activeMasteryChip} display={display} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
