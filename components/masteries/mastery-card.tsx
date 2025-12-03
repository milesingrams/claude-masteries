import { cn } from "@/lib/utils";
import type { MasteryDisplayData } from "@/lib/masteries/types";

interface MasteryCardProps {
  mastery: MasteryDisplayData;
  isLearned: boolean;
}

export function MasteryCard({ mastery, isLearned }: MasteryCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isLearned
          ? "border-claude-orange/30 bg-claude-orange/5"
          : "border-border/50 bg-muted/30"
      )}
    >
      <h3
        className={cn(
          "text-sm font-medium",
          isLearned ? "text-claude-orange" : "text-muted-foreground"
        )}
      >
        {mastery.name}
      </h3>
      <p
        className={cn(
          "mt-1 text-sm",
          isLearned ? "text-foreground/80" : "text-muted-foreground/70"
        )}
      >
        {mastery.detail}
      </p>
    </div>
  );
}
