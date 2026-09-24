import type { OpeningHours } from "@/domain/content/opening-hours";
import type { RawForm } from "@/domain/requests/parse";
import type { RequestTarget } from "@/domain/requests/target";

// Gemeinsame Testdaten für Anfragen (Stufe 5). Erfundener Betrieb, reservierte Beispiel-Domains
// (RFC 2606) und eine Rufnummer aus dem Bereich für Film und Fernsehen – keine echten Daten.

/** Donnerstag, 24.09.2026, 10:00 Uhr in Berlin. */
export const NOW = new Date("2026-09-24T08:00:00Z");

const lunchAndDinner = [
  { from: "11:30", to: "14:00" },
  { from: "17:30", to: "22:00" },
];

export const HOURS: OpeningHours = {
  week: {
    mo: [],
    di: [],
    mi: lunchAndDinner,
    do: lunchAndDinner,
    fr: lunchAndDinner,
    sa: [{ from: "17:00", to: "01:00" }],
    so: [{ from: "11:30", to: "21:00" }],
  },
};

export const TARGET: RequestTarget = {
  siteId: "gasthaus-probe",
  businessName: "Gasthaus zur Probe",
  recipient: "anfragen@gasthaus.example",
  channels: { table: true, pickup: true },
  openingHours: HOURS,
  phone: { e164: "+498999998150", display: "089 99998 150" },
  address: { street: "Probegasse 1", postalCode: "00123", locality: "Beispielstadt" },
  probe: false,
};

export function tableForm(overrides: Record<string, string | undefined> = {}): RawForm {
  return {
    art: "tisch",
    name: "Maria Huber",
    email: "maria@example.org",
    telefon: "",
    datum: "2026-09-25",
    uhrzeit: "19:30",
    personen: "4",
    nachricht: "",
    webseite: "",
    dauer: "8000",
    ...overrides,
  };
}

export function pickupForm(overrides: Record<string, string | undefined> = {}): RawForm {
  return {
    art: "abholung",
    name: "Jonas Berg",
    email: "jonas@example.org",
    telefon: "0171 2345678",
    datum: "2026-09-25",
    uhrzeit: "12:15",
    bestellung: "2 × Schweinebraten\n1 × Kaiserschmarrn",
    webseite: "",
    dauer: "12000",
    ...overrides,
  };
}
