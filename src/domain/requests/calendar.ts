import type { Weekday } from "../content/opening-hours";

// Kalender für Anfragen: Datum und Uhrzeit, wie Gast und Betrieb sie meinen – in der Ortszeit des
// Betriebs, nicht in der des Servers. Rein: die aktuelle Zeit wird immer übergeben.

export const REQUEST_TIME_ZONE = "Europe/Berlin";

/** Kalendertag „JJJJ-MM-TT“ und Minuten ab Tagesbeginn. */
export type LocalMoment = { readonly date: string; readonly minutes: number };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const GERMAN_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const TIME = /^(\d{1,2})[:.](\d{2})$/;

const WEEKDAY_BY_UTC_DAY: readonly Weekday[] = ["so", "mo", "di", "mi", "do", "fr", "sa"];
const WEEKDAY_NAMES: Readonly<Record<Weekday, string>> = {
  mo: "Montag",
  di: "Dienstag",
  mi: "Mittwoch",
  do: "Donnerstag",
  fr: "Freitag",
  sa: "Samstag",
  so: "Sonntag",
};
const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const pad = (value: number) => String(value).padStart(2, "0");

/** Zeitpunkt → Kalendertag und Uhrzeit in der angegebenen Zeitzone. */
export function localMoment(now: Date, timeZone: string = REQUEST_TIME_ZONE): LocalMoment {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { date: `${get("year")}-${pad(get("month"))}-${pad(get("day"))}`, minutes: get("hour") * 60 + get("minute") };
}

/** „2026-09-26“ oder „26.9.2026“ → „2026-09-26“; `null`, wenn es den Tag nicht gibt. */
export function normalizeDate(input: string): string | null {
  const value = input.trim();
  const iso = ISO_DATE.exec(value);
  const german = GERMAN_DATE.exec(value);
  const [year, month, day] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : german
      ? [Number(german[3]), Number(german[2]), Number(german[1])]
      : [0, 0, 0];
  if (year < 2000 || year > 2999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** „19:30“, „9:30“ oder „19.30“ → „19:30“; `null` bei ungültiger Uhrzeit. */
export function normalizeTime(input: string): string | null {
  const match = TIME.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Tage zwischen zwei Kalendertagen („JJJJ-MM-TT“), positiv, wenn `to` später liegt. */
export function daysBetween(from: string, to: string): number {
  const utc = (date: string) => {
    const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** Kalendertag plus Tage („2026-09-24“ + 7 → „2026-10-01“). */
export function addDays(date: string, days: number): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

export function weekdayOf(date: string): Weekday {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return WEEKDAY_BY_UTC_DAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? "mo";
}

export function weekdayName(day: Weekday): string {
  return WEEKDAY_NAMES[day];
}

/** „Freitag, 26. September 2026“ – ohne Intl, damit jede Umgebung dasselbe schreibt. */
export function formatLongDate(date: string): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return `${WEEKDAY_NAMES[weekdayOf(date)]}, ${day}. ${MONTH_NAMES[month - 1] ?? ""} ${year}`;
}

/** „Fr 26.9.“ für Betreffzeilen. */
export function formatShortDate(date: string): string {
  const [, month = 1, day = 1] = date.split("-").map(Number);
  return `${WEEKDAY_NAMES[weekdayOf(date)].slice(0, 2)} ${day}.${month}.`;
}
