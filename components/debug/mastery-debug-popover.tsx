"use client";

import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { cn } from "@/lib/utils";
import type { ActiveChip } from "@/lib/masteries/types";

interface MasteryDebugPopoverProps {
  activeChip: ActiveChip | null;
  suppressedIds: string[];
}

export function MasteryDebugPopover({
  activeChip,
  suppressedIds,
}: MasteryDebugPopoverProps) {
  const { masteryDisplayData, progress, learnedMasteryIds } =
    useMasteryContext();

  const allMasteryIds = Object.keys(masteryDisplayData);
  const totalMasteries = allMasteryIds.length;
  const learnedCount = learnedMasteryIds.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto fixed top-2 right-2 z-[100] h-8 w-8 opacity-50 hover:opacity-100"
        >
          <Bug className="h-4 w-4" />
          <span className="sr-only">Debug masteries</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="z-[100] w-80">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Mastery Debug</h4>
            <p className="text-muted-foreground text-sm">
              {learnedCount}/{totalMasteries} masteries learned
            </p>
          </div>

          {/* Active Chip */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Currently Surfaced</h5>
            {activeChip ? (
              <div
                className={cn(
                  "rounded-md border p-2 text-sm",
                  activeChip.status === "satisfied"
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-blue-500/50 bg-blue-500/10"
                )}
              >
                <div className="font-mono text-xs opacity-70">
                  {activeChip.mastery_id}
                </div>
                <div>{activeChip.chip_text}</div>
                <div className="mt-1 text-xs opacity-70">
                  Status: {activeChip.status}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No chip surfaced
              </div>
            )}
          </div>

          {/* Session Suppressed */}
          {suppressedIds.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">
                Session Suppressed ({suppressedIds.length})
              </h5>
              <div className="flex flex-wrap gap-1">
                {suppressedIds.map((id) => (
                  <span
                    key={id}
                    className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs"
                  >
                    {id.split("/").pop()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learned Masteries */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium">
              Learned ({learnedMasteryIds.length})
            </h5>
            {learnedMasteryIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {learnedMasteryIds.map((id) => (
                  <span
                    key={id}
                    className="rounded bg-green-500/20 px-1.5 py-0.5 font-mono text-xs text-green-400"
                  >
                    {id.split("/").pop()}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No masteries learned yet
              </div>
            )}
          </div>

          {/* Progress Details */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Progress Details</h5>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {Object.entries(progress).map(([id, p]) => {
                const display = masteryDisplayData[id];
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-mono opacity-70">
                      {id.split("/").pop()}
                    </span>
                    <span>
                      {p.satisfaction_count}/{display?.learning_threshold ?? "?"}
                      {p.learned && " ✓"}
                    </span>
                  </div>
                );
              })}
              {Object.keys(progress).length === 0 && (
                <div className="text-muted-foreground text-sm">
                  No progress yet
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
