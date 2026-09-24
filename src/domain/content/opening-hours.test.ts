import { describe, expect, it } from "vitest";

import { formatDayHours, formatOpeningHours, isOpenAt, type OpeningHours, openingHoursRows, openingHoursSchema } from "./opening-hours";

const closed: [] = [];
const lunchAndDinner = [
  { from: "17:30", to: "22:00" },
  { from: "11:30", to: "14:00" },
];

function week(overrides: Partial<OpeningHours["week"]>): OpeningHours["week"] {
  return { mo: closed, di: closed, mi: closed, do: closed, fr: closed, sa: closed, so: closed, ...overrides };
}

describe("openingHoursSchema", () => {
  it("akzeptiert Mittag und Abend sowie Zeiten über Mitternacht", () => {
    const hours = { week: week({ fr: lunchAndDinner, sa: [{ from: "18:00", to: "01:00" }] }) };
    expect(openingHoursSchema.safeParse(hours).success).toBe(true);
  });

  it("lehnt sich überschneidende Zeiträume ab – auch über Mitternacht", () => {
    const overlapping = { week: week({ fr: [{ from: "11:00", to: "15:00" }, { from: "14:30", to: "22:00" }] }) };
    const intoNextDay = { week: week({ sa: [{ from: "18:00", to: "02:00" }], so: [{ from: "01:00", to: "03:00" }] }) };
    const intoMonday = { week: week({ so: [{ from: "20:00", to: "01:30" }], mo: [{ from: "00:30", to: "02:00" }] }) };
    expect(openingHoursSchema.safeParse(overlapping).success).toBe(false);
    expect(openingHoursSchema.safeParse(intoNextDay).success).toBe(false);
    expect(openingHoursSchema.safeParse(intoMonday).success).toBe(false);
  });

  it("erlaubt einen Folgetag, der nach dem Ende der Nacht beginnt", () => {
    const hours = { week: week({ sa: [{ from: "18:00", to: "02:00" }], so: [{ from: "02:00", to: "03:00" }, { from: "11:30", to: "21:00" }] }) };
    expect(openingHoursSchema.safeParse(hours).success).toBe(true);
  });

  it.each(["24:00", "9:30", "12:60", "mittags"])("lehnt die Uhrzeit %j ab", (value) => {
    expect(openingHoursSchema.safeParse({ week: week({ mo: [{ from: value, to: "14:00" }] }) }).success).toBe(false);
  });

  it("lehnt gleiche Anfangs- und Endzeit und eine ganz geschlossene Woche ab", () => {
    expect(openingHoursSchema.safeParse({ week: week({ mo: [{ from: "12:00", to: "12:00" }] }) }).success).toBe(false);
    expect(openingHoursSchema.safeParse({ week: week({}) }).success).toBe(false);
  });
});

describe("formatOpeningHours", () => {
  it("fasst aufeinanderfolgende gleiche Tage zusammen und sortiert die Zeiten", () => {
    const hours = openingHoursSchema.parse({
      week: week({
        mi: lunchAndDinner,
        do: lunchAndDinner,
        fr: lunchAndDinner,
        sa: [{ from: "17:00", to: "23:00" }],
        so: [{ from: "11:30", to: "21:00" }],
      }),
    });
    expect(formatOpeningHours(hours)).toEqual([
      "Mo, Di Ruhetag",
      "Mi–Fr 11:30–14:00, 17:30–22:00",
      "Sa 17:00–23:00",
      "So 11:30–21:00",
    ]);
  });

  it("zeigt Zeiten über Mitternacht wie angegeben", () => {
    const hours = openingHoursSchema.parse({ week: week({ sa: [{ from: "18:00", to: "01:00" }] }) });
    expect(formatOpeningHours(hours)).toEqual(["Mo–Fr Ruhetag", "Sa 18:00–01:00", "So Ruhetag"]);
  });
});

describe("openingHoursRows", () => {
  it("trennt Tage und Zeiten auch bei zwei zusammengefassten Tagen sauber (Regression: „Mo,“ | „Di Ruhetag“)", () => {
    const hours = openingHoursSchema.parse({
      week: { mo: [], di: [], mi: [{ from: "18:00", to: "23:00" }], do: [{ from: "18:00", to: "23:00" }], fr: [], sa: [], so: [] },
    });
    expect(openingHoursRows(hours)).toEqual([
      { days: "Mo, Di", times: "Ruhetag" },
      { days: "Mi, Do", times: "18:00–23:00" },
      { days: "Fr–So", times: "Ruhetag" },
    ]);
  });
});

describe("isOpenAt", () => {
  const minutes = (value: string) => {
    const [h = 0, m = 0] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const hours: OpeningHours = { week: week({ fr: lunchAndDinner, sa: [{ from: "18:00", to: "01:00" }], so: [{ from: "20:00", to: "02:00" }] }) };

  it("prüft Beginn einschließlich und Ende ausschließlich", () => {
    expect(isOpenAt(hours, "fr", minutes("11:30"))).toBe(true);
    expect(isOpenAt(hours, "fr", minutes("13:59"))).toBe(true);
    expect(isOpenAt(hours, "fr", minutes("14:00"))).toBe(false);
    expect(isOpenAt(hours, "fr", minutes("15:00"))).toBe(false);
    expect(isOpenAt(hours, "fr", minutes("11:29"))).toBe(false);
  });

  it("zählt Zeiträume über Mitternacht zum Folgetag – auch von Sonntag in den Montag", () => {
    expect(isOpenAt(hours, "sa", minutes("23:30"))).toBe(true);
    expect(isOpenAt(hours, "so", minutes("00:30"))).toBe(true);
    expect(isOpenAt(hours, "so", minutes("01:00"))).toBe(false);
    expect(isOpenAt(hours, "mo", minutes("01:30"))).toBe(true);
    expect(isOpenAt(hours, "mo", minutes("02:00"))).toBe(false);
  });

  it("ist an Ruhetagen nie geöffnet", () => {
    expect(isOpenAt(hours, "di", minutes("12:00"))).toBe(false);
    expect(formatDayHours(hours, "di")).toBe("Ruhetag");
    expect(formatDayHours(hours, "fr")).toBe("11:30–14:00, 17:30–22:00");
  });
});
