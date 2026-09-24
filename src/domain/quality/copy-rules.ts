// Copy-Regeln gegen KI-Floskeln (DESIGN.md T2–T5, ADR 0018).
// Neu geschrieben nach gastro-webagentur v2/build/copyRefiner.js und v2/COPY-PRINZIPIEN.md.
// Anders als v2: Die Regeln melden und schlagen vor – sie schreiben nie stillschweigend um.
// Wortgrenzen sind Unicode-sicher; JavaScripts \b hält „ä“ für ein Nicht-Wortzeichen.

export type CopySeverity = "fehler" | "hinweis";

export type CopyRule = {
  readonly id: string;
  readonly severity: CopySeverity;
  readonly pattern: RegExp;
  readonly reason: string;
  /** Vorschlag für den Treffer: Ersatztext oder "" für „streichen“. Fehlt er, gibt es nur einen Hinweis. */
  readonly suggest?: (match: string, ...groups: string[]) => string;
};

export type CopyFinding = {
  readonly ruleId: string;
  readonly severity: CopySeverity;
  readonly match: string;
  readonly index: number;
  readonly reason: string;
  readonly suggestion?: string;
};

const L = "\\p{L}";
/** Ganzes Wort mit deutschen Endungen; `stem` ohne Endung. */
const word = (stem: string, endings = "(?:e|en|em|er|es|n)?") =>
  new RegExp(`(?<![${L}])${stem}${endings}(?![${L}])`, "giu");
/** Satz, der mit `start` beginnt, bis einschließlich Satzzeichen. */
const sentence = (start: string) => new RegExp(`(?<![^\\s.!?])${start}[^.!?]*[.!?]?\\s*`, "giu");

const SUPERLATIVES = [
  "unvergesslich", "einzigartig", "exquisit", "erlesen", "himmlisch", "sensationell", "traumhaft",
  "zauberhaft", "unwiderstehlich", "atemberaubend", "perfekt", "ultimativ", "außergewöhnlich",
  "fantastisch", "authentisch",
];
const GENERIC_ADJECTIVES = [
  "bodenständig", "ehrlich", "frisch", "authentisch", "liebevoll", "hausgemacht", "regional", "saisonal",
  "lecker", "köstlich", "traditionell", "modern", "gemütlich", "familiär", "herzlich", "echt", "kreativ", "hochwertig",
];
const ADJ = `(?:${GENERIC_ADJECTIVES.join("|")})(?:e|en|em|er|es)?`;

const strike = () => "";

export const COPY_RULES: readonly CopyRule[] = [
  { id: "willkommen", severity: "fehler", pattern: sentence("(?:Herzlich\\s+)?Willkommen\\s+(?:bei|im|in der|in|zu|zur|zum)(?![\\p{L}])"), reason: "Begrüßungsformel jeder generierten Seite – direkt mit der Sache beginnen.", suggest: strike },
  { id: "eintauchen", severity: "fehler", pattern: sentence("Tauchen Sie ein(?![\\p{L}])"), reason: "Werbe-Imperativ ohne Information.", suggest: strike },
  { id: "verwoehnen", severity: "fehler", pattern: new RegExp(`(?<![^\\s.!?])Lassen Sie sich[^.!?]*(?:verwöhnen|verzaubern|überraschen|begeistern|inspirieren)[^.!?]*[.!?]?\\s*`, "giu"), reason: "Leere Einladung.", suggest: strike },
  { id: "entdecken-erleben", severity: "fehler", pattern: /(?<![\p{L}])(?:Entdecken|Erleben|Genießen|Erkunden) Sie (?=\p{L})/gu, reason: "Imperativ-Werbesprech – sagen, was es gibt („Unsere Karte“).", suggest: strike },
  { id: "kulinarische-reise", severity: "fehler", pattern: word("kulinarische", "(?:n|r)?\\s+Reise"), reason: "Abstraktes Nomen statt Essen.", suggest: () => "Karte" },
  { id: "kulinarisches-erlebnis", severity: "fehler", pattern: word("kulinarische", "(?:s|n)?\\s+Erlebnis(?:se)?"), reason: "Abstraktes Nomen statt Essen.", suggest: () => "Essen" },
  { id: "geschmackserlebnis", severity: "fehler", pattern: word("Geschmackserlebnis", "(?:se)?"), reason: "Abstraktes Nomen statt Essen.", suggest: () => "Aroma" },
  { id: "gaumenschmaus", severity: "fehler", pattern: word("Gaumenschm(?:a|ä)us", "(?:e)?"), reason: "Floskel statt Gericht.", suggest: () => "Teller" },
  { id: "geschmacksexplosion", severity: "fehler", pattern: word("Geschmacksexplosion", "(?:en)?"), reason: "Floskel statt Gericht.", suggest: () => "Würze" },
  { id: "herzstueck", severity: "fehler", pattern: word("Herzstück", "(?:e|s)?"), reason: "Floskel – konkret benennen, was im Mittelpunkt steht." },
  { id: "oase", severity: "fehler", pattern: /(?<![\p{L}])Oase (?:der|für) \p{L}+/giu, reason: "Postkarten-Metapher statt Haus." },
  { id: "mit-liebe", severity: "fehler", pattern: /(?<![\p{L}])mit (?:viel )?Liebe (zubereitet|gemacht|gekocht|gebacken)(?![\p{L}])/giu, reason: "Behauptete Emotion – den Handgriff nennen.", suggest: (_m, verb = "gemacht") => `von Hand ${verb}` },
  { id: "nicht-nur-sondern", severity: "fehler", pattern: /(?<![\p{L}])nicht nur ([^,.;!?]+), sondern auch ([^,.;!?]+)/giu, reason: "Satzschablone generierter Texte – aufzählen.", suggest: (_m, a = "", b = "") => `${a.trim()} und ${b.trim()}` },
  { id: "adjektiv-kette", severity: "fehler", pattern: new RegExp(`(?<![${L}])${ADJ}, ${ADJ} und (${ADJ})(?![${L}])`, "giu"), reason: "Drei Allgemeinplätze, null Information – ein Adjektiv mit Beleg.", suggest: (_m, last = "") => last },
  ...SUPERLATIVES.map((adjective): CopyRule => ({
    id: `superlativ-${adjective}`,
    severity: "fehler",
    pattern: word(adjective),
    reason: "Unbelegbarer Superlativ – Zahl, Herkunft oder Zeit nennen.",
    suggest: strike,
  })),
  { id: "klischee-dolce-vita", severity: "fehler", pattern: /(?<![\p{L}])Dolce Vita(?![\p{L}])/giu, reason: "Postkarte statt Haus." },
  { id: "klischee-meer", severity: "fehler", pattern: /(?<![\p{L}])wie am Meer(?![\p{L}])/giu, reason: "Postkarte statt Haus." },
  { id: "klischee-gastfreundschaft", severity: "fehler", pattern: /(?<![\p{L}])(?:mediterrane|griechische|orientalische|asiatische) Gastfreundschaft(?![\p{L}])/giu, reason: "Klischee der Küche." },
  { id: "klischee-gemuetlich", severity: "fehler", pattern: /(?<![\p{L}])gemütliche Stunden(?![\p{L}])/giu, reason: "Floskel ohne Inhalt." },
  { id: "fuellwort", severity: "fehler", pattern: /(?<![\p{L}])(?:absolut|wirklich|ganz besonders|wahrhaft)\s+(?=\p{L})/giu, reason: "Verstärkt, was nicht da ist.", suggest: strike },
  { id: "geviertstrich", severity: "fehler", pattern: /\s*—\s*/gu, reason: "Englische Typografie – im Deutschen Halbgeviertstrich mit Leerzeichen.", suggest: () => " – " },
  { id: "superlativ-beste", severity: "hinweis", pattern: /(?<![\p{L}])(?:der|die|das|den) beste[n]? \p{L}+ (?:der Stadt|im Ort|weit und breit|der Region)(?![\p{L}])/giu, reason: "Unbelegter Superlativ, rechtlich heikel (§ 5 UWG) – Auszeichnung mit Quelle oder weglassen." },
  { id: "egal-ob", severity: "hinweis", pattern: /(?<![\p{L}])Egal,? ob(?![\p{L}])/giu, reason: "Schablone – „mittags und abends“ statt „Egal ob mittags oder abends“." },
  { id: "ihr-partner", severity: "hinweis", pattern: /(?<![\p{L}])Ihr(?:e)? (?:Partner|Adresse) (?:für|wenn)(?![\p{L}])/gu, reason: "Agentursprache." },
  { id: "duzen", severity: "hinweis", pattern: /(?<![\p{L}])(?:du|dein|deine|deinen|dich|dir|komm)(?![\p{L}])/giu, reason: "Sprachkanon ist „Sie“ – Abweichung nur per Creative Direction." },
  { id: "englisch", severity: "hinweis", pattern: /(?<![\p{L}])(?:Food ?Lovers?|Vibes?|Experience|Must-have|Foodies?)(?![\p{L}])/giu, reason: "Englische Füllwörter passen nicht zum Haus." },
];

export function checkCopy(text: string, rules: readonly CopyRule[] = COPY_RULES): CopyFinding[] {
  const findings: CopyFinding[] = [];
  for (const rule of rules) {
    for (const match of text.matchAll(rule.pattern)) {
      const finding: CopyFinding = {
        ruleId: rule.id,
        severity: rule.severity,
        match: match[0],
        index: match.index,
        reason: rule.reason,
        ...(rule.suggest ? { suggestion: rule.suggest(match[0], ...match.slice(1).map((group) => group ?? "")) } : {}),
      };
      findings.push(finding);
    }
  }
  return findings.toSorted((a, b) => a.index - b.index);
}

/** Seitenweite Regel: höchstens ein Ausrufezeichen je Seite (T5). */
export function checkPageCopy(texts: readonly string[]): CopyFinding[] {
  const findings = texts.flatMap((text) => checkCopy(text));
  const exclamations = texts.reduce((sum, text) => sum + (text.match(/!/g)?.length ?? 0), 0);
  if (exclamations > 1) {
    findings.push({
      ruleId: "ausrufezeichen",
      severity: "fehler",
      match: "!",
      index: -1,
      reason: `${exclamations} Ausrufezeichen auf der Seite – höchstens eins.`,
    });
  }
  return findings;
}

function replaceMatches(text: string, rule: CopyRule): string {
  const { suggest } = rule;
  if (!suggest) return text;
  let result = "";
  let last = 0;
  for (const match of text.matchAll(rule.pattern)) {
    result += text.slice(last, match.index) + suggest(match[0], ...match.slice(1).map((group) => group ?? ""));
    last = match.index + match[0].length;
  }
  return result + text.slice(last);
}

/**
 * Vorschlag für eine überarbeitete Fassung. Wird nie automatisch übernommen: Das Ergebnis ist
 * eine Angabe mit Status „vorschlag“, die ein Mensch bestätigt (ADR 0018).
 */
export function proposeCopy(text: string): { readonly text: string; readonly appliedRules: readonly string[] } {
  let result = text;
  const applied: string[] = [];
  for (const rule of COPY_RULES) {
    if (rule.severity !== "fehler" || !rule.suggest) continue;
    const next = replaceMatches(result, rule);
    if (next !== result) applied.push(rule.id);
    result = next;
  }
  const tidy = result
    .replace(/ {2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/^[\s,;:–-]+/, "")
    .trim();
  const capitalized = /^\p{Ll}/u.test(tidy) ? tidy.charAt(0).toUpperCase() + tidy.slice(1) : tidy;
  return { text: capitalized, appliedRules: applied };
}
