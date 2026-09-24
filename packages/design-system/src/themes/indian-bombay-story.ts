import { narrativeEditorialBase } from "./narrative-editorial-base";
import { extendTheme } from "./schema";

// Erstes Küchen-Theme auf dem Basissystem. Bezugspunkte sind die Hausküche und die Stadt, nicht
// Klischees: Stahlgeschirr und Tiffin-Dosen, Terrazzo und Sandstein, gemalte Ladenschilder,
// Abendlicht nach dem Monsun. Bewusst ohne Merkmale der Studienreferenz (dishoom-analysis.md §11):
// keine gesperrten Kapitälchen-Titel, kein Anthrazit auf Papier, keine gerahmten Archivfotos.

export const indianBombayStory = extendTheme(narrativeEditorialBase, {
  id: "indian-bombay-story",
  name: "Mumbai, erzählt",
  description: "Für Küchen aus Mumbai: Hausküche und Stadt, gemalte Ladenschrift, Sandstein und Messing, Abendlicht nach dem Regen.",
  colors: {
    paper: "#f3e6d3",
    paperRaised: "#faf2e6",
    ink: "#2a1c15",
    inkMuted: "#654f41",
    line: "#e0cdb4",
    night: "#1c2030",
    nightInk: "#f3e6d3",
    nightMuted: "#bdb4c4",
    primary: "#9e3320",
    onPrimary: "#fff8ef",
    nightPrimary: "#e3b45f",
    onNightPrimary: "#1c2030",
    accent: "#a07a2c",
    focus: "#3f7fc9",
  },
  typography: {
    display: { font: "antonio", weight: 700, italic: false, tracking: 0.005, case: "normal", lineHeight: 0.92 },
    label: { font: "work-sans", weight: 700, italic: false, tracking: 0.1, case: "uppercase", lineHeight: 1.3 },
    scale: {
      hero: "clamp(4rem, 21vw, 13rem)",
      claim: "clamp(1.85rem, 5.2vw, 3.7rem)",
      h2: "clamp(2.4rem, 7vw, 4.8rem)",
    },
  },
  navigation: { items: ["story", "menu", "atmosphere", "visit"] },
  cta: { radius: "soft" },
  menu: { layout: "ledger", leaders: true },
  story: { captions: "label" },
  gallery: { ratio: "2:3" },
  imagery: {
    language: "Wie eine Reportage aus einer Stadtküche: Hände, Dampf, Stahl und Stein, nah und ohne Requisiten. Menschen arbeiten, niemand posiert.",
    light: "Morgens schräges Fensterlicht, abends warmes Glühlampenlicht mit tiefen Schatten.",
    colorWorld: ["Sandstein", "Messing", "Zinnober", "Regenabend-Indigo"],
    avoid: [
      "Stockfotos und KI-Bilder von Gerichten, Räumen oder Menschen des Hauses",
      "Klischees: Elefanten, Paläste, Rikschas als Kulisse, Filmplakate, Gewürzberge",
      "Sepia-Filter und künstliches Altern",
      "Trachten oder Schmuck als Dekoration",
      "Fremde Marken, Schilder oder Logos im Bild",
    ],
    placements: [
      { id: "dampf", section: "hero", role: "stimmung", subjectKind: "detail", subject: "Dampf über einem Topf Dal in der Küche von {name}, nah, im Halbdunkel", ratio: { desktop: "16:9", mobile: "4:5" } },
      { id: "chapati", section: "story", role: "beweis", subjectKind: "team", subject: "Die Köchin von {name} rollt am Morgen Chapati aus, Hände und Mehl im Fokus", ratio: { desktop: "3:2", mobile: "4:5" } },
      { id: "nachmittag", section: "story", role: "stimmung", subjectKind: "raum", subject: "Der Gastraum von {name} am späten Nachmittag, Licht fällt schräg auf Tisch und Terrazzo", ratio: { desktop: "3:2", mobile: "4:5" } },
      { id: "teller", section: "craft", role: "beweis", subjectKind: "gericht", subject: "{dish} auf dem Stahlteller, von schräg oben, ohne Dekoration", ratio: { desktop: "4:5", mobile: "4:5" } },
      { id: "dosen", section: "atmosphere", role: "stimmung", subjectKind: "detail", subject: "Gestapelte Tiffin-Dosen aus Stahl auf dem Tresen von {name}", ratio: { desktop: "2:3", mobile: "2:3" } },
      { id: "tafel", section: "atmosphere", role: "stimmung", subjectKind: "raum", subject: "Gäste am langen Tisch von {name} am Abend, von hinten, Gesichter unscharf", ratio: { desktop: "2:3", mobile: "2:3" } },
      { id: "regen", section: "atmosphere", role: "orientierung", subjectKind: "umgebung", subject: "Die Straße vor {name} bei Regen am Abend, Licht aus dem Fenster", ratio: { desktop: "2:3", mobile: "2:3" } },
      { id: "tuer", section: "closing", role: "orientierung", subjectKind: "haus", subject: "Die Tür von {name} bei Einbruch der Dunkelheit, Licht von innen", ratio: { desktop: "3:2", mobile: "4:5" } },
    ],
  },
});
