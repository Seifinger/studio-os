import { NARRATIVE_EDITORIAL_MOTION } from "../motion/narrative-editorial";
import type { Theme } from "./schema";

// Basissystem für erzählende Restaurant-Websites (ADR 0022, docs/design-studies/dishoom-analysis.md).
// Übersetzt Qualitätsprinzipien, keine Referenz: Akte mit Kontrastwechsel, eine Behauptung im
// Eingang, Erzählung vor Karte, Bilder als Belege, ein primärer Weg, ruhige Bewegung.
// Küchen-Themes leiten davon ab (extendTheme) und ändern nur, was ihre Geschichte verlangt.

export const narrativeEditorialBase: Theme = {
  id: "narrative-editorial-base",
  name: "Erzählend, redaktionell",
  description: "Grundsystem für Restaurants mit Geschichte: dunkler Eingang, helle Erzählung, eine Handlung, die immer erreichbar bleibt.",
  basedOn: null,
  colors: {
    paper: "#f4f1eb",
    paperRaised: "#fbf9f5",
    ink: "#1d1b18",
    inkMuted: "#5b554c",
    line: "#ddd6ca",
    night: "#16171a",
    nightInk: "#efebe3",
    nightMuted: "#b3ada3",
    primary: "#2f4a3f",
    onPrimary: "#ffffff",
    nightPrimary: "#e6dfd2",
    onNightPrimary: "#16171a",
    accent: "#9a6b2f",
    focus: "#3b7bc4",
  },
  typography: {
    display: { font: "libre-caslon-display", weight: 400, italic: false, tracking: -0.01, case: "normal", lineHeight: 1.02 },
    text: { font: "source-serif-4", weight: 400, italic: false, tracking: 0, case: "normal", lineHeight: 1.6 },
    label: { font: "work-sans", weight: 700, italic: false, tracking: 0.08, case: "uppercase", lineHeight: 1.3 },
    caption: { font: "source-serif-4", weight: 400, italic: true, tracking: 0, case: "normal", lineHeight: 1.45 },
    scale: {
      hero: "clamp(3rem, 11vw, 8.5rem)",
      claim: "clamp(1.75rem, 4.6vw, 3.4rem)",
      h2: "clamp(2rem, 5vw, 3.6rem)",
      h3: "clamp(1.25rem, 2.2vw, 1.6rem)",
      lead: "clamp(1.2rem, 2vw, 1.45rem)",
      body: "1.0625rem",
      small: "0.875rem",
    },
  },
  spacing: {
    steps: { xs: 0.5, s: 1, m: 1.5, l: 2.5, xl: 4, xxl: 6 },
    section: { mobile: 4, desktop: 7.5 },
    act: { mobile: 6, desktop: 10 },
  },
  container: { textMaxCh: 62, wideMaxRem: 76, gutter: { mobile: 1.25, desktop: 3.5 }, bleedImages: true },
  hero: { variant: "night-type", height: "screen", align: "bottom", actions: 2, kicker: "cuisine-locality" },
  navigation: { items: ["story", "menu", "visit"], sticky: true, headerCta: true, mobile: "sheet" },
  cta: { primaryStyle: "filled", secondaryStyle: "outline", radius: "none", mobileBar: true, minTargetPx: 48 },
  menu: { layout: "ledger", categoryNav: "scroll-row", allergens: "inline", leaders: false },
  story: { layout: "chapters", lead: "large", imageRhythm: "alternate", captions: "italic" },
  gallery: { layout: "scroll-row", ratio: "4:5", captions: true },
  closing: { act: "night", showHours: true, showAddress: true },
  mobile: { singleColumnBelowRem: 56, stickyActionBar: true, oneIdeaPerScreen: true, maxLineCh: 38 },
  accessibility: { minTextContrast: 4.5, minNonTextContrast: 3, focusRingPx: 3, skipLink: true, respectReducedMotion: true },
  motion: NARRATIVE_EDITORIAL_MOTION,
  imagery: {
    language: "Dokumentarisch und nah: echte Handgriffe, echte Räume, Menschen bei der Arbeit statt beim Posieren.",
    light: "Vorhandenes Licht mit einer Hauptrichtung; Schatten dürfen tief sein.",
    colorWorld: ["Papierweiß", "warmes Holz", "tiefes Grün"],
    avoid: ["Stockfotos jeder Art", "KI-Bilder von Gerichten, Räumen oder Menschen des Hauses", "Menschen, die in die Kamera lächeln", "Weitwinkel-Verzerrung und Filter"],
    placements: [
      { id: "eingang", section: "hero", role: "stimmung", subjectKind: "detail", subject: "Ein Handgriff in der Küche von {name}, nah und im Halbdunkel", ratio: { desktop: "16:9", mobile: "4:5" } },
      { id: "menschen", section: "story", role: "beweis", subjectKind: "team", subject: "Die Menschen von {name} bei der Arbeit, Hände im Fokus", ratio: { desktop: "3:2", mobile: "4:5" } },
      { id: "gericht", section: "craft", role: "beweis", subjectKind: "gericht", subject: "{dish}, so wie es bei {name} auf den Tisch kommt", ratio: { desktop: "4:5", mobile: "4:5" } },
      { id: "raum", section: "atmosphere", role: "stimmung", subjectKind: "raum", subject: "Der Gastraum von {name} mit Gästen, von hinten fotografiert", ratio: { desktop: "4:5", mobile: "4:5" } },
      { id: "tuer", section: "closing", role: "orientierung", subjectKind: "haus", subject: "Die Tür von {name} am Abend, Licht von innen", ratio: { desktop: "3:2", mobile: "4:5" } },
    ],
  },
};
