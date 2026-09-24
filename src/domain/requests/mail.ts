import { formatLongDate, formatShortDate } from "./calendar";
import type { GuestRequest } from "./parse";
import type { RequestTarget } from "./target";

// E-Mails einer Anfrage (ADR 0023): eine an den Betrieb, eine Eingangsbestätigung an den Gast.
// Bewusst nur Text – lesbar in jedem Postfach, keine Tracking-Pixel, kein HTML zum Einschleusen.
// Ehrlich formuliert: Eine Anfrage ist keine Reservierung (DESIGN.md T3).

export type RequestMail = {
  readonly to: string;
  /** Antworten gehen an die Gegenseite: der Betrieb antwortet dem Gast und umgekehrt. */
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
  /** Anzeigename im Absender; die Adresse selbst kommt aus der Konfiguration. */
  readonly senderName: string;
};

const PROBE_LINE = "PROBE aus studio-os – kein echter Gast. Das Haus ist ein erfundenes Beispiel.";

function rows(entries: readonly (readonly [string, string | null])[]): string {
  const shown = entries.filter((entry): entry is readonly [string, string] => entry[1] !== null);
  const width = Math.max(...shown.map(([label]) => label.length)) + 2;
  return shown.map(([label, value]) => `  ${`${label}:`.padEnd(width)}${value}`).join("\n");
}

const when = (request: GuestRequest) => `${formatLongDate(request.date)}, ${request.time} Uhr`;
const subjectPrefix = (target: RequestTarget) => (target.probe ? "[Probe] " : "");
const probeIntro = (target: RequestTarget) => (target.probe ? [PROBE_LINE, ""] : []);

/** Nachricht an den Betrieb. Antworten landen direkt beim Gast. */
export function businessMail(request: GuestRequest, target: RequestTarget): RequestMail {
  const table = request.kind === "table";
  const subject = table
    ? `${subjectPrefix(target)}Tischanfrage: ${request.partySize} ${request.partySize === 1 ? "Person" : "Personen"}, ${formatShortDate(request.date)}, ${request.time} Uhr – ${request.name}`
    : `${subjectPrefix(target)}Abholung: ${formatShortDate(request.date)}, ${request.time} Uhr – ${request.name}`;

  const details = rows([
    [table ? "Wann" : "Abholung", when(request)],
    ["Personen", table ? String(request.partySize) : null],
    ["Name", request.name],
    ["E-Mail", request.email],
    ["Telefon", request.phone?.display ?? null],
  ]);
  const freeText = table ? (request.note ? ["", "Anmerkung:", request.note] : []) : ["", "Bestellung:", request.order];

  const text = [
    ...probeIntro(target),
    table ? `Neue Tischanfrage über die Website von ${target.businessName}.` : `Neue Abhol-Bestellung über die Website von ${target.businessName}.`,
    "",
    details,
    ...freeText,
    "",
    `So antworten Sie: Einfach auf diese E-Mail antworten – die Antwort geht direkt an ${request.name}.`,
    table
      ? "Der Gast hat eine Eingangsbestätigung bekommen, aber noch keine Zusage."
      : "Der Gast hat eine Eingangsbestätigung bekommen. Bitte bestätigen Sie die Abholzeit oder schlagen Sie eine andere vor. Die Website nimmt keine Zahlungen an.",
    "",
    "Die Website speichert Anfragen nicht. Diese E-Mail ist Ihr einziges Exemplar.",
  ].join("\n");

  return { to: target.recipient, replyTo: request.email, subject, text, senderName: `Website ${target.businessName}` };
}

/** Eingangsbestätigung an den Gast. Antworten landen beim Betrieb. */
export function guestMail(request: GuestRequest, target: RequestTarget): RequestMail {
  const table = request.kind === "table";
  const subject = `${subjectPrefix(target)}${table ? "Ihre Tischanfrage" : "Ihre Bestellung"} bei ${target.businessName} ist eingegangen`;

  const details = rows([
    [table ? "Wann" : "Abholung", when(request)],
    ["Personen", table ? String(request.partySize) : null],
  ]);
  const freeText = table ? (request.note ? ["", "Ihre Anmerkung:", request.note] : []) : ["", "Ihre Bestellung:", request.order];
  const call = target.phone ? ` oder rufen Sie an: ${target.phone.display}` : "";
  const address = target.address ? [target.address.street, `${target.address.postalCode} ${target.address.locality}`] : [];

  const text = [
    ...probeIntro(target),
    `Guten Tag ${request.name},`,
    "",
    table
      ? `Ihre Anfrage ist bei ${target.businessName} eingegangen. Das ist noch keine Reservierung: Das Haus meldet sich bei Ihnen, sobald der Tisch bestätigt ist.`
      : `Ihre Bestellung ist bei ${target.businessName} eingegangen. Das Haus meldet sich bei Ihnen, um die Abholzeit zu bestätigen. Bezahlt wird vor Ort.`,
    "",
    "Ihre Angaben",
    details,
    ...freeText,
    "",
    `Etwas ändern oder absagen? Antworten Sie einfach auf diese E-Mail${call}.`,
    "",
    target.businessName,
    ...address,
    "",
    `Sie bekommen diese E-Mail, weil auf der Website von ${target.businessName} eine Anfrage mit Ihrer Adresse gestellt wurde. Weitere E-Mails folgen nur als Antwort des Hauses.`,
  ].join("\n");

  return { to: request.email, replyTo: target.recipient, subject, text, senderName: target.businessName };
}
