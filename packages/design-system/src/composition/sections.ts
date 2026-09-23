// Abschnittsarten der erzählenden Komposition. Eigene Datei, damit Theme und Komposition sie teilen,
// ohne sich gegenseitig zu importieren.

export const NARRATIVE_SECTIONS = ["hero", "claim", "story", "craft", "menu", "atmosphere", "reservation", "visit", "closing"] as const;
export type NarrativeSectionKind = (typeof NARRATIVE_SECTIONS)[number];

/** Sprungziele (deutsch, weil sie in der Adresszeile stehen). */
export const SECTION_ANCHORS: Readonly<Record<NarrativeSectionKind, string>> = {
  hero: "anfang",
  claim: "haltung",
  story: "geschichte",
  craft: "handwerk",
  menu: "karte",
  atmosphere: "raum",
  reservation: "reservieren",
  visit: "anfahrt",
  closing: "zum-schluss",
};

/** Zwei Stimmungsräume: „night“ (dunkel, Ankommen und Abschied), „paper“ (hell, Erzählen und Wählen). */
export const ACTS = ["night", "paper"] as const;
export type Act = (typeof ACTS)[number];
