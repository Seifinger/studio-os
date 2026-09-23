import { describe, expect, it } from "vitest";

import { checkCopy } from "@/domain/quality/copy-rules";

import { THEME_REGISTRY } from "../themes/registry";
import { briefsForSection, imageBriefSchema, imageBriefsFor } from "./image-briefs";
import { imagePromptFor, imagePromptsFor } from "./image-prompts";

const CONTEXT = { name: "Testhaus", signatureDish: "Dal mit Jeera-Reis" };

describe("Bildbriefings", () => {
  it.each(THEME_REGISTRY.list().map((theme) => [theme.id, theme] as const))("%s liefert für jeden Bildplatz ein vollständiges Briefing", (_id, theme) => {
    const briefs = imageBriefsFor(theme, CONTEXT);
    expect(briefs).toHaveLength(theme.imagery.placements.length);
    for (const brief of briefs) {
      expect(imageBriefSchema.safeParse(brief).success).toBe(true);
      for (const field of ["purpose", "format", "position", "visualLanguage", "light", "colorWorld", "subject", "exclusions", "altTextIntent"] as const) {
        expect(brief[field], `${brief.id}.${field}`).toBeTruthy();
      }
      expect(brief.subject).not.toMatch(/\{name\}|\{dish\}/);
      expect(brief.aiPolicy).toBe("moodboard-only");
      expect(brief.exclusions.join(" ")).toMatch(/Stock/);
      expect(checkCopy(brief.subject).filter((finding) => finding.severity === "fehler")).toEqual([]);
    }
  });

  it("setzt Name und Hausgericht ein und fällt ohne Gericht neutral zurück", () => {
    const theme = THEME_REGISTRY.get("indian-bombay-story");
    expect(briefsForSection(imageBriefsFor(theme, CONTEXT), "craft")[0]?.subject).toBe("Dal mit Jeera-Reis auf dem Stahlteller, von schräg oben, ohne Dekoration");
    expect(briefsForSection(imageBriefsFor(theme, { name: "Testhaus" }), "craft")[0]?.subject).toMatch(/^Das Hausgericht/);
    expect(imageBriefsFor(theme, CONTEXT).some((brief) => brief.subject.includes("Testhaus"))).toBe(true);
  });

  it("verlangt für den Eingang größere Bilder als für den Rest", () => {
    const briefs = imageBriefsFor(THEME_REGISTRY.get("narrative-editorial-base"), CONTEXT);
    expect(briefsForSection(briefs, "hero")[0]?.format.minWidthPx).toBe(2400);
    expect(briefsForSection(briefs, "story")[0]?.format.minWidthPx).toBe(1600);
  });
});

describe("Bildgenerierungs-Prompts", () => {
  it("macht aus jedem Briefing einen Prompt nur fürs Moodboard", () => {
    const briefs = imageBriefsFor(THEME_REGISTRY.get("indian-bombay-story"), CONTEXT);
    const prompts = imagePromptsFor(briefs);
    expect(prompts).toHaveLength(briefs.length);
    for (const prompt of prompts) {
      expect(prompt.usage).toBe("moodboard-only");
      expect(prompt.notice).toMatch(/Nicht veröffentlichen/);
      expect(prompt.negativePrompt).toMatch(/Stockfotos/);
    }
  });

  it("enthält Motiv, Licht, Farbwelt und Format des Briefings", () => {
    const [brief] = imageBriefsFor(THEME_REGISTRY.get("indian-bombay-story"), CONTEXT);
    if (!brief) throw new Error("kein Briefing");
    const prompt = imagePromptFor(brief);
    expect(prompt.prompt).toContain(brief.subject);
    expect(prompt.prompt).toContain(brief.light);
    expect(prompt.prompt).toContain(brief.colorWorld[0] ?? "");
    expect(prompt.aspectRatio).toBe(brief.format.desktop);
  });
});
