// Veröffentlichungsprüfung für den statischen Export der Beispielseiten (ADR 0020).
// Läuft gegen die fertigen HTML-Dateien in out/, nicht gegen den Quelltext: geprüft wird, was
// tatsächlich öffentlich wird.

/** Merkmal im Seitentext, an dem fehlende Betreiberangaben erkannt werden. */
export const OPERATOR_MISSING_MARKER = "Angaben des Betreibers fehlen";

export const SHOWCASE_NOTICE = "Beispielseite des Studios – dieser Betrieb ist frei erfunden.";

export type ExportedFile = { readonly path: string; readonly content: string };

export type ExportProblem = { readonly path: string; readonly problem: string };

// Google-API-Schlüssel beginnen mit "AIza"; ein Treffer im Export wäre ein veröffentlichtes Geheimnis.
const GOOGLE_API_KEY = /AIza[0-9A-Za-z_-]{35}/;
const SECRET_NAMES = /\b(?:GOOGLE_PLACES_API_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|ANTHROPIC_API_KEY|VERCEL_TOKEN)\b/;
const NOINDEX = /<meta\s+name="robots"\s+content="noindex, ?nofollow"/i;
const EXTERNAL_SCRIPT = /<script[^>]+src="(?:https?:)?\/\//i;
const EXTERNAL_STYLESHEET = /<link[^>]+rel="stylesheet"[^>]+href="(?:https?:)?\/\//i;

const isLegalPage = (path: string) => /(?:^|\/)(?:impressum|datenschutz)\/index\.html$/.test(path);
const isShowcasePage = (path: string) => /(?:^|\/)beispiele\/(?!impressum\/|datenschutz\/)[a-z0-9-]+\/index\.html$/.test(path);

/** Prüft eine exportierte HTML-Datei. Leere Liste = darf veröffentlicht werden. */
export function checkExportedPage(file: ExportedFile): string[] {
  const { path, content } = file;
  const problems: string[] = [];

  if (!NOINDEX.test(content)) problems.push("noindex fehlt – Beispielseiten gehören nicht in Suchmaschinen");
  if (GOOGLE_API_KEY.test(content) || SECRET_NAMES.test(content)) problems.push("enthält einen Schlüssel oder den Namen einer geheimen Variable");
  if (EXTERNAL_SCRIPT.test(content)) problems.push("lädt ein Skript von fremdem Server");
  if (EXTERNAL_STYLESHEET.test(content)) problems.push("lädt ein Stylesheet von fremdem Server (Schriften nur selbst gehostet)");
  if (content.includes(OPERATOR_MISSING_MARKER)) problems.push("Betreiberangaben fehlen (STUDIO_OPERATOR_* beim Export setzen)");
  if (/href="[^"]*\/demo\//.test(content)) problems.push("verlinkt eine Lead-Demo – die bleiben lokal (ADR 0016)");

  if (!isLegalPage(path)) {
    // Erfundene Betriebe dürfen nie wählbar oder anschreibbar wirken.
    if (/href="(?:tel:|mailto:|https:\/\/wa\.me)/.test(content)) problems.push("enthält Telefon-, WhatsApp- oder Mail-Link");
    if (/google\.[a-z.]+\/maps/.test(content)) problems.push("verlinkt Google Maps mit erfundener Adresse");
  }
  if (isShowcasePage(path) && !content.includes(SHOWCASE_NOTICE)) problems.push("Pflichthinweis „frei erfunden“ fehlt");
  return problems;
}

/** Prüft den ganzen Export: jede Seite, dazu Pflichtdateien und verbotene Pfade. */
export function checkExport(files: readonly ExportedFile[]): ExportProblem[] {
  const problems: ExportProblem[] = [];
  const paths = new Set(files.map((file) => file.path));

  for (const required of ["index.html", "beispiele/index.html", "beispiele/impressum/index.html", "beispiele/datenschutz/index.html", ".nojekyll"]) {
    if (!paths.has(required)) problems.push({ path: required, problem: "fehlt im Export" });
  }
  for (const path of paths) {
    if (/^(?:api|demo)\//.test(path)) problems.push({ path, problem: "Serverroute im statischen Export" });
  }
  for (const file of files) {
    if (!file.path.endsWith(".html")) continue;
    for (const problem of checkExportedPage(file)) problems.push({ path: file.path, problem });
  }
  return problems;
}
