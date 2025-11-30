import fs from "fs";
import path from "path";
import type {
  Mastery,
  MasteryAnalysisInput,
  MasteryDisplayData,
} from "./types";

const MASTERIES_DIR = path.join(process.cwd(), "masteries");

interface ParsedFrontmatter {
  id: string;
  name: string;
  category: string;
  learning_threshold: number;
}

interface ParsedFile {
  frontmatter: ParsedFrontmatter;
  body: string;
}

// Parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): ParsedFile {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid frontmatter format");
  }

  const frontmatterLines = match[1].split("\n");
  const frontmatter: Record<string, string | number> = {};

  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    // Parse numbers
    if (key === "learning_threshold") {
      frontmatter[key] = parseInt(value, 10) || 3;
    } else {
      frontmatter[key] = value;
    }
  }

  return {
    frontmatter: frontmatter as unknown as ParsedFrontmatter,
    body: match[2],
  };
}

// Extract a markdown section as a single string (for Chip and Detail)
function parseSectionText(body: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\n\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = body.match(regex);
  return match ? match[1].trim() : "";
}

// Extract a markdown section as bullet points (for Triggers and Satisfaction)
function parseSectionList(body: string, sectionName: string): string[] {
  const text = parseSectionText(body, sectionName);
  if (!text) return [];

  return text
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
}

// Parse a single mastery file
function parseMasteryFile(filePath: string): Mastery {
  const content = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);

  return {
    id: frontmatter.id,
    name: frontmatter.name,
    category: frontmatter.category,
    learning_threshold: frontmatter.learning_threshold,
    chip_text: parseSectionText(body, "Chip"),
    triggers: parseSectionList(body, "Triggers"),
    satisfaction: parseSectionList(body, "Satisfaction"),
    detail: parseSectionText(body, "Detail"),
  };
}

// Load all masteries from the directory
export function loadAllMasteries(): Mastery[] {
  if (!fs.existsSync(MASTERIES_DIR)) {
    console.warn(`Masteries directory not found: ${MASTERIES_DIR}`);
    return [];
  }

  const files = fs.readdirSync(MASTERIES_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => parseMasteryFile(path.join(MASTERIES_DIR, file)));
}

// Get minimal data for Claude analysis (reduces token usage)
export function getMasteriesForAnalysis(): MasteryAnalysisInput[] {
  return loadAllMasteries().map((m) => ({
    id: m.id,
    triggers: m.triggers,
    satisfaction: m.satisfaction,
  }));
}

// Get display data for frontend
export function getMasteriesForDisplay(): MasteryDisplayData[] {
  return loadAllMasteries().map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    chip_text: m.chip_text,
    detail: m.detail,
    learning_threshold: m.learning_threshold,
  }));
}

// Get a single mastery by ID
export function getMasteryById(id: string): Mastery | undefined {
  return loadAllMasteries().find((m) => m.id === id);
}
