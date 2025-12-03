import { cn } from "@/lib/utils";
import type { MasteryDisplayData } from "@/lib/masteries/types";
import {
  Brain,
  CircleHelp,
  FileText,
  Globe,
  HelpCircle,
  Image,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Scale,
  Search,
  SlidersHorizontal,
  Theater,
  Upload,
  UserCog,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  CircleHelp,
  FileText,
  Globe,
  HelpCircle,
  Image,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Scale,
  Search,
  SlidersHorizontal,
  Theater,
  Upload,
  UserCog,
};

interface MasteryCardProps {
  mastery: MasteryDisplayData;
  isLearned: boolean;
}

export function MasteryCard({ mastery, isLearned }: MasteryCardProps) {
  const Icon = iconMap[mastery.icon];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isLearned
          ? "border-claude-orange/30 bg-claude-orange/5"
          : "border-border/50 bg-muted/30"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            className={cn(
              "mt-0.5 size-4 shrink-0",
              isLearned ? "text-claude-orange" : "text-muted-foreground"
            )}
          />
        )}
        <div>
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
      </div>
    </div>
  );
}
