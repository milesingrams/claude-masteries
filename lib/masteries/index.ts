import capabilityInquiry from "@/masteries/capability-inquiry.json";
import constraintSpecification from "@/masteries/constraint-specification.json";
import contextLoading from "@/masteries/context-loading.json";
import devilsAdvocate from "@/masteries/devils-advocate.json";
import examplesInPrompt from "@/masteries/examples-in-prompt.json";
import iterativeRefinement from "@/masteries/iterative-refinement.json";
import promptCritique from "@/masteries/prompt-critique.json";
import roleFraming from "@/masteries/role-framing.json";
import rolePlay from "@/masteries/role-play.json";
import selfCritique from "@/masteries/self-critique.json";
import socraticMode from "@/masteries/socratic-mode.json";
import thinkingPartner from "@/masteries/thinking-partner.json";
import uploadFile from "@/masteries/upload-file.json";
import uploadImage from "@/masteries/upload-image.json";
import webSearch from "@/masteries/web-search.json";

export interface Mastery {
  id: string;
  icon: string;
  learning_threshold: number;
  title: string;
  surface_triggers: string;
  satisfaction_triggers: string;
  detail: string;
}

export const masteries: Mastery[] = [
  capabilityInquiry,
  constraintSpecification,
  contextLoading,
  devilsAdvocate,
  examplesInPrompt,
  iterativeRefinement,
  promptCritique,
  roleFraming,
  rolePlay,
  selfCritique,
  socraticMode,
  thinkingPartner,
  uploadFile,
  uploadImage,
  webSearch,
];

export function getMasteryById(id: string): Mastery | undefined {
  return masteries.find((m) => m.id === id);
}

function toTitleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseIdParts(id: string): { category: string; name: string } {
  const [category, ...rest] = id.split("/");
  const slug = rest.join("/");
  return {
    category: toTitleCase(category),
    name: toTitleCase(slug),
  };
}

export function parseFormattedMasteryName(id: string): string {
  const parts = id.split("/");
  return parts.map(toTitleCase).join(" / ");
}
