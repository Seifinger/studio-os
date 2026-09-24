import { describe, expect, it } from "vitest";

import { pickupForm, TARGET, tableForm } from "../../../tests/support/request-fixtures";
import { businessMail, guestMail } from "./mail";
import { type GuestRequest, parseRequest } from "./parse";

function parsed(kind: "table" | "pickup", form: ReturnType<typeof tableForm>): GuestRequest {
  const result = parseRequest(kind, form);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.request;
}

const table = parsed("table", tableForm({ telefon: "0171 2345678", nachricht: "Ein Kinderstuhl, bitte." }));
const pickup = parsed("pickup", pickupForm());

describe("businessMail", () => {
  it("geht an den Betrieb, Antworten gehen direkt an den Gast", () => {
    const mail = businessMail(table, TARGET);
    expect(mail.to).toBe("anfragen@gasthaus.example");
    expect(mail.replyTo).toBe("maria@example.org");
    expect(mail.senderName).toBe("Website Gasthaus zur Probe");
    expect(mail.subject).toBe("Tischanfrage: 4 Personen, Fr 25.9., 19:30 Uhr – Maria Huber");
  });

  it("enthält alle Angaben lesbar untereinander und sagt, dass nichts gespeichert wird", () => {
    const { text } = businessMail(table, TARGET);
    expect(text).toContain("Freitag, 25. September 2026, 19:30 Uhr");
    expect(text).toMatch(/Personen: +4/);
    expect(text).toMatch(/Telefon: +0171 2345678/);
    expect(text).toContain("Anmerkung:\nEin Kinderstuhl, bitte.");
    expect(text).toContain("noch keine Zusage");
    expect(text).toContain("Die Website speichert Anfragen nicht.");
    expect(text).not.toContain("PROBE");
  });

  it("lässt leere Angaben weg und schreibt „1 Person“", () => {
    const single = parsed("table", tableForm({ personen: "1" }));
    const mail = businessMail(single, TARGET);
    expect(mail.subject).toContain("1 Person,");
    expect(mail.text).not.toContain("Telefon:");
    expect(mail.text).not.toContain("Anmerkung:");
  });

  it("beschreibt Abholungen mit Bestellung und ohne Zahlung", () => {
    const mail = businessMail(pickup, TARGET);
    expect(mail.subject).toBe("Abholung: Fr 25.9., 12:15 Uhr – Jonas Berg");
    expect(mail.text).toContain("Bestellung:\n2 × Schweinebraten\n1 × Kaiserschmarrn");
    expect(mail.text).toContain("keine Zahlungen");
    expect(mail.text).not.toContain("Personen:");
  });

  it("kennzeichnet Proben in Betreff und Text", () => {
    const mail = businessMail(table, { ...TARGET, probe: true });
    expect(mail.subject.startsWith("[Probe] ")).toBe(true);
    expect(mail.text.split("\n")[0]).toMatch(/^PROBE aus studio-os/);
  });
});

describe("guestMail", () => {
  it("geht an den Gast, Antworten gehen an den Betrieb", () => {
    const mail = guestMail(table, TARGET);
    expect(mail.to).toBe("maria@example.org");
    expect(mail.replyTo).toBe("anfragen@gasthaus.example");
    expect(mail.senderName).toBe("Gasthaus zur Probe");
    expect(mail.subject).toBe("Ihre Tischanfrage bei Gasthaus zur Probe ist eingegangen");
  });

  it("sagt ehrlich, dass es noch keine Reservierung ist, und nennt Telefon und Adresse", () => {
    const { text } = guestMail(table, TARGET);
    expect(text).toContain("Guten Tag Maria Huber,");
    expect(text).toContain("Das ist noch keine Reservierung");
    expect(text).toContain("oder rufen Sie an: 089 99998 150.");
    expect(text).toContain("Probegasse 1\n00123 Beispielstadt");
    expect(text).toContain("Ihre Anmerkung:\nEin Kinderstuhl, bitte.");
    // Keine Kontaktdaten des Gastes in seiner eigenen Bestätigung – falls jemand fremde Adressen einträgt.
    expect(text).not.toContain("0171 2345678");
  });

  it("kommt ohne Telefon und Adresse des Betriebs aus", () => {
    const { text } = guestMail(table, { ...TARGET, phone: null, address: null });
    expect(text).toContain("Antworten Sie einfach auf diese E-Mail.");
    expect(text).not.toContain("rufen Sie an");
  });

  it("bestätigt Abholungen mit Bestellung und Bezahlung vor Ort", () => {
    const mail = guestMail(pickup, TARGET);
    expect(mail.subject).toBe("Ihre Bestellung bei Gasthaus zur Probe ist eingegangen");
    expect(mail.text).toContain("Bezahlt wird vor Ort.");
    expect(mail.text).toContain("Ihre Bestellung:\n2 × Schweinebraten");
  });
});
