import { hueDistance, parseCssColor, rgbToHsl } from "../color/hsl";

// Katalog verbotener Gestaltungsmuster (DESIGN.md §3, S1–S10) und Prüfungen gegen gerendertes
// CSS und Markup. Neu geschrieben nach gastro-webagentur v2/build/antiSlopLint.js und
// gastro-v3 src/judge/index.js – als einfache Textprüfungen ohne eigenen Parser (MIGRATION.md K8).
// Sie sichern Untergrenzen; ob eine Seite gut ist, entscheidet das Review (Regel P2).

export type DesignRuleId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10";

export const DESIGN_RULES: Readonly<Record<DesignRuleId, { readonly title: string; readonly automated: boolean }>> = {
  S1: { title: "Keine Template-Standardschriften als Markenschrift", automated: true },
  S2: { title: "Keine mehrfarbigen Verläufe", automated: true },
  S3: { title: "Kein Glasmorphismus", automated: true },
  S4: { title: "Keine Reihe aus drei gleich gebauten Karten", automated: true },
  S5: { title: "Keine Emoji als Icons, keine Icon-Bibliotheken", automated: true },
  S6: { title: "Kein Text auf abgedunkeltem Stockfoto als Hero-Standard", automated: false },
  S7: { title: "Keine Pillen-Flut, keine leuchtenden Schatten", automated: true },
  S8: { title: "Kein durchgehend zentriertes Layout", automated: false },
  S9: { title: "Keine Gestaltung per Zufall oder Hash", automated: false },
  S10: { title: "Keine Stockfotos für Haus, Team oder Raum", automated: false },
};

export const BANNED_FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "DM Sans",
  "Space Grotesk",
  "Lato",
  "system-ui",
] as const;

const normalizeFamily = (family: string) => family.trim().replace(/^["']|["']$/g, "").toLowerCase();
const BANNED = new Set(BANNED_FONT_FAMILIES.map(normalizeFamily));

export function isBannedFontFamily(family: string): boolean {
  return BANNED.has(normalizeFamily(family));
}

export type DesignFinding = {
  readonly ruleId: DesignRuleId;
  readonly severity: "fehler" | "hinweis";
  readonly message: string;
  readonly excerpt: string;
};

const PILL_RADIUS = /border-radius\s*:\s*(?:9{3,}px|50%|[1-9]\d{3,}px)/gi;
const MAX_PILLS = 3;

function gradients(css: string): string[] {
  const found: string[] = [];
  const start = /(?:repeating-)?(?:linear|radial|conic)-gradient\(/gi;
  for (const match of css.matchAll(start)) {
    let depth = 1;
    let index = match.index + match[0].length;
    while (index < css.length && depth > 0) {
      if (css[index] === "(") depth += 1;
      else if (css[index] === ")") depth -= 1;
      index += 1;
    }
    found.push(css.slice(match.index, index));
  }
  return found;
}

/** Farbtöne mit nennenswerter Sättigung; Grautöne und Transparenzstufen zählen nicht. */
function distinctHues(gradient: string): number {
  const hues: number[] = [];
  for (const [token] of gradient.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi)) {
    const rgb = parseCssColor(token);
    if (!rgb) continue;
    const { h, s } = rgbToHsl(rgb);
    if (s < 12) continue;
    if (!hues.some((hue) => hueDistance(hue, h) < 20)) hues.push(h);
  }
  return hues.length;
}

export function checkStylesheet(css: string): DesignFinding[] {
  const findings: DesignFinding[] = [];

  for (const match of css.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const stack = match[1] ?? "";
    const banned = stack.split(",").filter((family) => isBannedFontFamily(family));
    if (banned.length > 0) {
      findings.push({ ruleId: "S1", severity: "fehler", message: `Verbotene Schrift: ${banned.map((b) => b.trim()).join(", ")}`, excerpt: match[0].trim() });
    }
  }

  for (const gradient of gradients(css)) {
    if (distinctHues(gradient) >= 2) {
      findings.push({ ruleId: "S2", severity: "fehler", message: "Verlauf über mehrere Farbtöne", excerpt: gradient });
    }
  }

  for (const match of css.matchAll(/(?:-webkit-)?backdrop-filter\s*:\s*([^;}]+)/gi)) {
    if ((match[1] ?? "").trim().toLowerCase() !== "none") {
      findings.push({ ruleId: "S3", severity: "fehler", message: "Glasmorphismus (backdrop-filter)", excerpt: match[0].trim() });
    }
  }

  for (const match of css.matchAll(/repeat\(\s*3\s*,\s*(?:1fr|minmax\([^)]*\))\s*\)/gi)) {
    findings.push({ ruleId: "S4", severity: "hinweis", message: "Drei gleich breite Spalten – begründet?", excerpt: match[0] });
  }

  for (const match of css.matchAll(/text-shadow\s*:\s*([^;}]+)/gi)) {
    const value = (match[1] ?? "").trim();
    // Glühen = Schatten mit Unschärfe; ein harter Versatzschatten (0 Unschärfe) ist erlaubt.
    const lengths = value.split(",").map((shadow) => shadow.match(/-?\d*\.?\d+(?:px|em|rem)?/g) ?? []);
    if (value !== "none" && lengths.some((parts) => parts.length >= 3 && Number.parseFloat(parts[2] ?? "0") > 0)) {
      findings.push({ ruleId: "S7", severity: "fehler", message: "Leuchtender Textschatten", excerpt: match[0].trim() });
    }
  }

  const pills = [...css.matchAll(PILL_RADIUS)];
  if (pills.length > MAX_PILLS) {
    findings.push({ ruleId: "S7", severity: "fehler", message: `Pillen-Flut: ${pills.length} voll gerundete Elemente`, excerpt: pills[0]?.[0] ?? "" });
  }

  return findings;
}

const ICON_LIBRARY_CLASS = /class="[^"]*\b(?:fa[srb]?\s|fa-|material-icons|material-symbols|bi\s+bi-|glyphicon)/i;
// ©, ®, ™ und die Bewertungssterne ★☆ sind Typografie, keine Emoji.
const EMOJI = /(?![©®™★☆])\p{Extended_Pictographic}/u;

export function checkMarkup(html: string): DesignFinding[] {
  const findings: DesignFinding[] = [];
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  const emoji = EMOJI.exec(text);
  if (emoji) {
    findings.push({ ruleId: "S5", severity: "fehler", message: "Emoji im Seitentext", excerpt: emoji[0] });
  }
  const icon = ICON_LIBRARY_CLASS.exec(html);
  if (icon) {
    findings.push({ ruleId: "S5", severity: "fehler", message: "Icon-Bibliothek im Markup", excerpt: icon[0] });
  }
  return findings;
}
