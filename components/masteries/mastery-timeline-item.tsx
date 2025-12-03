"use client";

import { useState } from "react";
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

interface MasteryTimelineItemProps {
  mastery: MasteryDisplayData;
  isLearned: boolean;
  isLast?: boolean;
}

export function MasteryTimelineItem({
  mastery,
  isLearned,
  isLast,
}: MasteryTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = iconMap[mastery.icon];

  return (
    <div
      className="group relative flex gap-4"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center pt-1.5">
        {/* Dot - vertically centered with collapsed card header */}
        <div
          className={cn(
            "relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
            isLearned
              ? "border-claude-orange bg-claude-orange/10"
              : "border-border bg-background",
            isExpanded && "scale-110"
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                "size-4 transition-colors",
                isLearned ? "text-claude-orange" : "text-muted-foreground"
              )}
            />
          )}
        </div>
        {/* Vertical line */}
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 transition-colors",
              isLearned ? "bg-claude-orange/30" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Card content */}
      <div
        className={cn(
          "mb-4 flex-1 overflow-hidden rounded-lg border transition-all duration-200",
          isLearned
            ? "border-claude-orange/30 bg-claude-orange/5"
            : "border-border/50 bg-muted/30",
          isExpanded && "shadow-md"
        )}
      >
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-medium",
                isLearned ? "text-claude-orange" : "text-foreground"
              )}
            >
              {mastery.name}
            </h3>
            {isLearned && (
              <span className="bg-claude-orange/10 text-claude-orange/90 rounded-full px-2 py-0.5 text-xs font-medium">
                Learned
              </span>
            )}
          </div>

          {/* Expandable detail section */}
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p
                className={cn(
                  "mt-2 text-sm",
                  isLearned ? "text-foreground/80" : "text-muted-foreground"
                )}
              >
                {mastery.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
