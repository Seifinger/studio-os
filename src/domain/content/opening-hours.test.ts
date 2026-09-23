import { describe, expect, it } from "vitest";

import { formatOpeningHours, type OpeningHours, openingHoursSchema } from "./opening-hours";

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
