"use client";

import { useMemo } from "react";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MasteryTimelineItem } from "./mastery-timeline-item";
import type { MasteryDisplayData } from "@/lib/masteries/types";

export function MasteriesGrid() {
  const { masteryDisplayData, learnedMasteryIds } = useMasteryContext();

  // Group masteries by category
  const categorizedMasteries = useMemo(() => {
    const grouped: Record<string, MasteryDisplayData[]> = {};

    Object.values(masteryDisplayData).forEach((mastery) => {
      const category = mastery.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(mastery);
    });

    // Sort masteries within each category by name
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [masteryDisplayData]);

  const categories = Object.keys(categorizedMasteries).sort();

  return (
    <div className="flex gap-8">
      {categories.map((category) => {
        const masteries = categorizedMasteries[category];
        return (
          <div key={category} className="flex w-72 shrink-0 flex-col">
            {/* Category header */}
            <h2 className="mb-4 text-sm font-semibold text-foreground/80">
              {category}
            </h2>

            {/* Timeline for this category */}
            <div className="flex flex-col">
              {masteries.map((mastery, index) => (
                <MasteryTimelineItem
                  key={mastery.id}
                  mastery={mastery}
                  isLearned={learnedMasteryIds.includes(mastery.id)}
                  isLast={index === masteries.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
