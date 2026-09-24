import type { Fact } from "../provenance/fact";

// Küchen für Showcase-Demos und Lead-Demos. Die Namenserkennung ist neu geschrieben nach
// gastro-webagentur src/menuCatalog.js (detectCuisine) – mit zwei bewussten Abweichungen (ADR 0017):
// Treffer nur am Wortanfang (v1: "roma" traf "Romantik", "bowl" traf "Bowling") und kein
// stiller Standardwert (v1: unbekannt → "bayerisch"). Das Ergebnis ist immer ein Vorschlag.

export const CUISINES = [
  { id: "bayerisch", label: "Bayerisch" },
  { id: "deutsch", label: "Deutsch" },
  { id: "italienisch", label: "Italienisch" },
  { id: "griechisch", label: "Griechisch" },
  { id: "tuerkisch", label: "Türkisch" },
  { id: "syrisch", label: "Syrisch" },
  { id: "chinesisch", label: "Chinesisch" },
  { id: "thailaendisch", label: "Thailändisch" },
  { id: "vietnamesisch", label: "Vietnamesisch" },
  { id: "japanisch", label: "Japanisch" },
  { id: "indisch", label: "Indisch" },
  { id: "asiatisch", label: "Asiatisch (gemischt)" },
  { id: "cafe", label: "Café" },
  { id: "international", label: "International" },
] as const;

export type CuisineId = (typeof CUISINES)[number]["id"];
export const CUISINE_IDS = CUISINES.map((cuisine) => cuisine.id) as [CuisineId, ...CuisineId[]];

// Stichwörter gelten als Wortanfang ("pizz" trifft "Pizzeria"). Mit "=" davor nur als
// ganzes Wort – für kurze oder mehrdeutige Wörter. Reihenfolge: spezielle Küchen zuerst,
// Sammelkategorien zuletzt; die erste passende Regel gewinnt.
const RULES: readonly (readonly [CuisineId, readonly string[]])[] = [
  ["italienisch", ["pizz", "italien", "trattoria", "osteria", "ristorante", "napoli", "=roma", "toscana", "vesuvio", "milano", "venezia", "sapori"]],
  ["japanisch", ["sushi", "japan", "ramen", "sakura", "kyoto", "tokio", "tokyo", "osaka", "izakaya", "teriyaki", "wasabi", "nippon", "yakitori", "=maki"]],
  ["thailaendisch", ["thai", "bangkok", "siam", "chiang", "phuket", "krabi", "isaan", "lemongras"]],
  ["vietnamesisch", ["vietnam", "saigon", "hanoi", "=pho", "=phở", "bánh", "=banh mi", "mekong", "=viet", "=hoi an", "=da nang"]],
  ["indisch", ["india", "indisch", "tandoor", "=curry", "masala", "bombay", "mumbai", "delhi", "punjab", "=goa", "=taj", "maharaja", "namaste", "himalaya", "ganesha"]],
  ["chinesisch", ["china", "chines", "peking", "beijing", "shanghai", "szechuan", "sichuan", "kanton", "canton", "mandarin", "dragon", "bambus", "lotus", "panda", "=dim sum", "=ming", "=jade", "=wan tan"]],
  ["syrisch", ["syri", "damaskus", "damascus", "aleppo", "halab", "levante", "schawarma", "shawarma", "hummus", "falafel", "beirut", "libanes"]],
  ["griechisch", ["griech", "hellas", "akropolis", "poseidon", "santorini", "mykonos", "olymp", "athen", "delphi", "rhodos", "kreta", "taverna"]],
  ["tuerkisch", ["döner", "doener", "kebab", "kebap", "türk", "tuerk", "istanbul", "anatol", "bosporus", "antalya", "pide"]],
  ["asiatisch", ["asia", "asien", "mongol", "=fusion", "=bowl", "=bowls", "noodle", "nudelbar", "=wok"]],
  ["cafe", ["café", "cafe", "kaffee", "konditorei", "bäckerei", "baeckerei", "eisdiele", "eiscafé", "rösterei"]],
  ["bayerisch", ["wirtshaus", "gasthof", "gasthaus", "bräu", "brauerei", "biergarten", "stüberl", "=wirt"]],
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const COMPILED = RULES.map(([cuisine, keywords]) => ({
  cuisine,
  patterns: keywords.map((keyword) => {
    const whole = keyword.startsWith("=");
    const word = escapeRegExp(whole ? keyword.slice(1) : keyword);
    return {
      keyword: whole ? keyword.slice(1) : keyword,
      regex: new RegExp(`(?:^|[^\\p{L}\\p{N}])${word}${whole ? "(?![\\p{L}\\p{N}])" : ""}`, "u"),
    };
  }),
}));

export type CuisineSuggestion = { readonly cuisine: CuisineId; readonly matched: string };

export function suggestCuisine(name: string | null | undefined): CuisineSuggestion | null {
  const haystack = String(name ?? "").normalize("NFC").toLocaleLowerCase("de-DE");
  if (haystack.trim() === "") return null;
  for (const { cuisine, patterns } of COMPILED) {
    const hit = patterns.find((pattern) => pattern.regex.test(haystack));
    if (hit) return { cuisine, matched: hit.keyword };
  }
  return null;
}

/** Ergebnis als Angabe: immer ein Vorschlag des Studios, ohne Treffer „unbekannt“. */
export function cuisineFactFromName(name: string | null | undefined): Fact<CuisineId> {
  const suggestion = suggestCuisine(name);
  return suggestion
    ? { status: "vorschlag", value: suggestion.cuisine, by: "studio", note: `Name enthält „${suggestion.matched}“` }
    : { status: "unbekannt", value: null };
}

export function cuisineLabel(id: CuisineId): string {
  return CUISINES.find((cuisine) => cuisine.id === id)?.label ?? id;
}
