import type { ImageBrief } from "./image-briefs";

// Bildgenerierungs-Prompts aus Briefings (ADR 0022). Sie dienen dem internen Moodboard und dem
// Briefing von Fotografinnen – nie als veröffentlichtes Bild eines echten Hauses: Gerichte nie als
// KI-Bild, Haus, Team und Raum nur als echtes Foto (DESIGN.md S10). Das steht in jedem Prompt-Paket.

export type ImagePrompt = {
  readonly briefId: string;
  readonly themeId: string;
  /** Positive Beschreibung, deutsch – die gängigen Bildmodelle verstehen sie. */
  readonly prompt: string;
  readonly negativePrompt: string;
  readonly aspectRatio: string;
  readonly usage: "moodboard-only";
  readonly notice: string;
};

const NOTICE = "Nur für Moodboard und Foto-Briefing. Nicht veröffentlichen: Auf der Website stehen nur eigene, freigegebene Fotos des Hauses.";

const SUBJECT_STYLE: Readonly<Record<ImageBrief["subjectKind"], string>> = {
  gericht: "Food-Reportage, Teller wie serviert, keine Deko-Zutaten daneben",
  raum: "Innenraum-Reportage, natürliche Perspektive auf Augenhöhe",
  team: "Arbeitsreportage, Hände und Handgriff im Fokus, niemand schaut in die Kamera",
  haus: "Architekturfoto auf Augenhöhe, gerade Linien",
  detail: "Nahaufnahme, geringe Schärfentiefe",
  umgebung: "Straßenfotografie ohne erkennbare Passanten",
};

export function imagePromptFor(brief: ImageBrief): ImagePrompt {
  const prompt = [
    brief.subject,
    SUBJECT_STYLE[brief.subjectKind],
    brief.visualLanguage,
    `Licht: ${brief.light}`,
    `Farbwelt: ${brief.colorWorld.join(", ")}`,
    `Format ${brief.format.desktop} (mobil ${brief.format.mobile})`,
    "fotografisch, analoges Korn, keine Überzeichnung",
  ].join(". ");
  return {
    briefId: brief.id,
    themeId: brief.themeId,
    prompt,
    negativePrompt: [...brief.exclusions, "Illustration", "3D-Render", "HDR", "übersättigte Farben", "Schrift im Bild"].join(", "),
    aspectRatio: brief.format.desktop,
    usage: "moodboard-only",
    notice: NOTICE,
  };
}

export function imagePromptsFor(briefs: readonly ImageBrief[]): ImagePrompt[] {
  return briefs.map(imagePromptFor);
}
