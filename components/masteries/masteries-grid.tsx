"use client";

import { useMemo } from "react";
import { useMasteryContext } from "@/lib/masteries/mastery-context";
import { MasteryCard } from "./mastery-card";
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/80">
            {category}
          </h2>
          <div className="flex flex-col gap-3">
            {categorizedMasteries[category].map((mastery) => (
              <MasteryCard
                key={mastery.id}
                mastery={mastery}
                isLearned={learnedMasteryIds.includes(mastery.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
