import { masteries, parseIdParts } from "@/lib/masteries";
import type { MasteryDisplayData } from "@/lib/masteries/types";

export async function GET() {
  const displayData: MasteryDisplayData[] = masteries.map((m) => {
    const { category, name } = parseIdParts(m.id);
    return {
      id: m.id,
      name,
      category,
      chip: m.chip,
      detail: m.detail,
      learning_threshold: m.learning_threshold,
    };
  });

  return Response.json(displayData);
}
