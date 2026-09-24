import { z } from "zod";

// Öffnungszeiten als Wochenplan. Ein Intervall darf über Mitternacht gehen (18:00–01:00),
// Intervalle eines Tages dürfen sich nicht überschneiden. Ein leerer Tag ist ein Ruhetag.

export const WEEKDAYS = ["mo", "di", "mi", "do", "fr", "sa", "so"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const WEEKDAY_LABEL: Record<Weekday, string> = {
  mo: "Mo",
  di: "Di",
  mi: "Mi",
  do: "Do",
  fr: "Fr",
  sa: "Sa",
  so: "So",
};

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Uhrzeit im Format HH:MM" });

export const intervalSchema = z
  .object({ from: time, to: time })
  .refine((interval) => interval.from !== interval.to, { error: "Beginn und Ende sind gleich" });

export type Interval = z.infer<typeof intervalSchema>;

const toMinutes = (value: string): number => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Minutenspanne ab Tagesbeginn; über Mitternacht endet sie nach 1440. */
function span(interval: Interval): readonly [number, number] {
  const start = toMinutes(interval.from);
  const end = toMinutes(interval.to);
  return [start, end > start ? end : end + 1440];
}

const daySchema = z.array(intervalSchema).max(4).superRefine((intervals, ctx) => {
  const sorted = intervals.map(span).toSorted((a, b) => a[0] - b[0]);
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (previous && current && current[0] < previous[1]) {
      ctx.addIssue({ code: "custom", message: "Zeiträume eines Tages überschneiden sich" });
      return;
    }
  }
});

export const openingHoursSchema = z
  .object({
    week: z.object({
      mo: daySchema,
      di: daySchema,
      mi: daySchema,
      do: daySchema,
      fr: daySchema,
      sa: daySchema,
      so: daySchema,
    }),
    /** z. B. „Küche bis 21:30 Uhr“ */
    note: z.string().trim().min(1).max(200).optional(),
  })
  .refine((hours) => WEEKDAYS.some((day) => hours.week[day].length > 0), {
    error: "An keinem Tag geöffnet – dann Status „unbekannt“ verwenden",
  })
  .superRefine((hours, ctx) => {
    // Ein Zeitraum über Mitternacht ragt in den Folgetag (So → Mo) und darf dort nichts überdecken.
    WEEKDAYS.forEach((day, index) => {
      const next = WEEKDAYS[(index + 1) % WEEKDAYS.length] ?? "mo";
      const spillEnd = Math.max(0, ...hours.week[day].map((interval) => span(interval)[1] - 1440));
      if (spillEnd > 0 && hours.week[next].some((interval) => span(interval)[0] < spillEnd)) {
        ctx.addIssue({
          code: "custom",
          path: ["week", next],
          message: `Zeitraum über Mitternacht (${WEEKDAY_LABEL[day]}) überschneidet sich mit ${WEEKDAY_LABEL[next]}`,
        });
      }
    });
  });

export type OpeningHours = z.infer<typeof openingHoursSchema>;

function formatDay(intervals: readonly Interval[]): string {
  if (intervals.length === 0) return "Ruhetag";
  return intervals
    .toSorted((a, b) => toMinutes(a.from) - toMinutes(b.from))
    .map((interval) => `${interval.from}–${interval.to}`)
    .join(", ");
}

function formatDays(days: readonly Weekday[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return "";
  if (days.length === 1) return WEEKDAY_LABEL[first];
  if (days.length === 2) return `${WEEKDAY_LABEL[first]}, ${WEEKDAY_LABEL[last]}`;
  return `${WEEKDAY_LABEL[first]}–${WEEKDAY_LABEL[last]}`;
}

/**
 * Ist zur Uhrzeit (Minuten ab Tagesbeginn) an diesem Wochentag geöffnet? Berücksichtigt Zeiträume
 * des Vortags, die über Mitternacht reichen (Fr 18:00–01:00 → Sa 00:30 geöffnet).
 */
export function isOpenAt(hours: OpeningHours, day: Weekday, minutes: number): boolean {
  const index = WEEKDAYS.indexOf(day);
  const previous = WEEKDAYS[(index + WEEKDAYS.length - 1) % WEEKDAYS.length] ?? "so";
  const today = hours.week[day].some((interval) => {
    const [start, end] = span(interval);
    return minutes >= start && minutes < end;
  });
  return today || hours.week[previous].some((interval) => minutes < span(interval)[1] - 1440);
}

/** Zeiträume eines Tages als Text („11:30–14:00, 17:30–22:00“ oder „Ruhetag“). */
export function formatDayHours(hours: OpeningHours, day: Weekday): string {
  return formatDay(hours.week[day]);
}

export type OpeningHoursRow = { readonly days: string; readonly times: string };

/**
 * Zeilen für die Anzeige, aufeinanderfolgende Tage mit gleichen Zeiten zusammengefasst:
 * [{ days: "Mo, Di", times: "Ruhetag" }, { days: "Mi–Fr", times: "11:30–14:00, 17:30–22:00" }]
 */
export function openingHoursRows(hours: OpeningHours): OpeningHoursRow[] {
  const rows: OpeningHoursRow[] = [];
  let group: Weekday[] = [];
  let groupText = "";

  for (const day of WEEKDAYS) {
    const text = formatDay(hours.week[day]);
    if (group.length > 0 && text === groupText) {
      group.push(day);
      continue;
    }
    if (group.length > 0) rows.push({ days: formatDays(group), times: groupText });
    group = [day];
    groupText = text;
  }
  if (group.length > 0) rows.push({ days: formatDays(group), times: groupText });
  return rows;
}

/**
 * Deutsche Kurzform als Text:
 * ["Mo, Di Ruhetag", "Mi–Fr 11:30–14:00, 17:30–22:00", "Sa 17:00–23:00", "So 11:30–21:00"]
 */
export function formatOpeningHours(hours: OpeningHours): string[] {
  return openingHoursRows(hours).map((row) => `${row.days} ${row.times}`);
}
