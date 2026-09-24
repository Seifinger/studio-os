import { describe, expect, it, vi } from "vitest";

import { NOW, pickupForm, TARGET, tableForm } from "../../../tests/support/request-fixtures";
import type { EmailSenderPort, OutboundEmail } from "../integrations/ports";
import { EmailSendError } from "../integrations/resend";
import { createRequestLimits } from "./rate-limit";
import { type RequestIncident, type SubmitDeps, submitRequest } from "./submit-request";

function fakeSender(fail: (email: OutboundEmail) => EmailSendError | null = () => null) {
  const sent: OutboundEmail[] = [];
  const port: EmailSenderPort = {
    async send(email) {
      const error = fail(email);
      if (error) throw error;
      sent.push(email);
      return { messageId: `id-${sent.length}` };
    },
  };
  return { port, sent };
}

function setup(options: { email?: EmailSenderPort | null } = {}) {
  const sender = fakeSender();
  const incidents: RequestIncident[] = [];
  const deps: SubmitDeps = {
    email: options.email === undefined ? sender.port : options.email,
    limits: createRequestLimits(() => NOW.getTime()),
    now: () => NOW,
    report: (incident) => incidents.push(incident),
  };
  return { deps, sent: sender.sent, incidents };
}

const input = (form = tableForm(), overrides: Partial<Parameters<typeof submitRequest>[0]> = {}) => ({ target: TARGET, kind: "table" as const, form, client: "203.0.113.7", ...overrides });

describe("submitRequest", () => {
  it("schickt eine Mail an den Betrieb und eine Bestätigung an den Gast", async () => {
    const { deps, sent, incidents } = setup();
    expect(await submitRequest(input(), deps)).toEqual({ status: "sent", confirmation: "sent" });

    expect(sent.map((mail) => mail.to)).toEqual([["anfragen@gasthaus.example"], ["maria@example.org"]]);
    const [business, guest] = sent;
    expect(business?.replyTo).toBe("maria@example.org");
    expect(business?.fromName).toBe("Website Gasthaus zur Probe");
    expect(guest?.replyTo).toBe("anfragen@gasthaus.example");
    expect(business?.idempotencyKey).toMatch(/^anfrage-[0-9a-f]{40}-betrieb$/);
    expect(guest?.idempotencyKey).toBe(business?.idempotencyKey.replace(/-betrieb$/, "-gast"));
    expect(incidents).toEqual([]);
  });

  it("gibt derselben Anfrage denselben Schlüssel – ein Doppelklick wird keine zweite Mail", async () => {
    const { deps, sent } = setup();
    await submitRequest(input(), deps);
    await submitRequest(input(), deps);
    expect(sent[0]?.idempotencyKey).toBe(sent[2]?.idempotencyKey);
    await submitRequest(input(tableForm({ personen: "5" })), deps);
    expect(sent[4]?.idempotencyKey).not.toBe(sent[0]?.idempotencyKey);
  });

  it("verschickt bei Honigtopf nichts, meldet aber Erfolg", async () => {
    const { deps, sent } = setup();
    expect(await submitRequest(input(tableForm({ webseite: "https://werbung.example" })), deps)).toEqual({ status: "sent", confirmation: "sent" });
    expect(sent).toEqual([]);
  });

  it("bittet bei zu schnellem Absenden um einen zweiten Versuch", async () => {
    const { deps, sent } = setup();
    expect(await submitRequest(input(tableForm({ dauer: "300" })), deps)).toMatchObject({ status: "invalid", fieldErrors: {} });
    expect(sent).toEqual([]);
  });

  it("meldet Feldfehler, ohne etwas zu verschicken", async () => {
    const { deps, sent } = setup();
    const response = await submitRequest(input(tableForm({ email: "kaputt", datum: "2026-09-28" })), deps);
    expect(response).toMatchObject({ status: "invalid", message: "Bitte prüfen Sie die markierten Felder." });
    expect(response.status === "invalid" && Object.keys(response.fieldErrors).sort()).toEqual(["email"]);
    expect(sent).toEqual([]);
  });

  it("lehnt nicht vereinbarte Anfragearten ab und nennt das Telefon", async () => {
    const { deps } = setup();
    const target = { ...TARGET, channels: { table: true, pickup: false } };
    const response = await submitRequest({ target, kind: "pickup", form: pickupForm(), client: null }, deps);
    expect(response).toEqual({ status: "unavailable", message: "Abhol-Bestellungen nimmt das Haus online nicht an. Bitte rufen Sie an: 089 99998 150." });
  });

  it("sagt ehrlich, wenn der Versand nicht eingerichtet ist, und meldet es dem Studio", async () => {
    const { deps, incidents } = setup({ email: null });
    expect(await submitRequest(input(), deps)).toMatchObject({ status: "unavailable", message: expect.stringContaining("089 99998 150") });
    expect(incidents).toEqual([{ site: "gasthaus-probe", kind: "table", incident: "notConfigured" }]);
  });

  it("meldet einen Fehlschlag, wenn die Mail an den Betrieb nicht rausgeht – und schickt dann keine Bestätigung", async () => {
    const sender = fakeSender((email) => (email.to[0] === TARGET.recipient ? new EmailSendError("unavailable", 503) : null));
    const { deps, incidents } = setup({ email: sender.port });
    expect(await submitRequest(input(), deps)).toMatchObject({ status: "failed", message: expect.stringContaining("Bitte rufen Sie an") });
    expect(sender.sent).toEqual([]);
    expect(incidents).toEqual([{ site: "gasthaus-probe", kind: "table", incident: "businessMailFailed", error: { kind: "unavailable", status: 503 } }]);
  });

  it("zählt die Anfrage als angekommen, wenn nur die Bestätigung scheitert", async () => {
    const sender = fakeSender((email) => (email.to[0] === "maria@example.org" ? new EmailSendError("rejected", 422) : null));
    const { deps, incidents } = setup({ email: sender.port });
    expect(await submitRequest(input(), deps)).toEqual({ status: "sent", confirmation: "failed" });
    expect(sender.sent).toHaveLength(1);
    expect(incidents[0]).toMatchObject({ incident: "guestMailFailed", error: { kind: "rejected", status: 422 } });
  });

  it("wertet „schon unterwegs“ (409) als zugestellt", async () => {
    const sender = fakeSender(() => new EmailSendError("duplicate", 409));
    const { deps, incidents } = setup({ email: sender.port });
    expect(await submitRequest(input(), deps)).toEqual({ status: "sent", confirmation: "sent" });
    expect(incidents).toEqual([]);
  });

  it("fängt unerwartete Fehler des Adapters ab", async () => {
    const port: EmailSenderPort = { send: vi.fn(async () => Promise.reject(new Error("kaputt"))) };
    const { deps } = setup({ email: port });
    expect(await submitRequest(input(), deps)).toMatchObject({ status: "failed" });
  });

  it("begrenzt Anfragen je Gast-Adresse, zählt aber keine fehlerhaften Versuche", async () => {
    const { deps, sent } = setup();
    for (let index = 0; index < 3; index += 1) await submitRequest(input(tableForm({ email: "kaputt" }), { client: null }), deps);
    for (let index = 0; index < 3; index += 1) {
      expect(await submitRequest(input(tableForm({ personen: String(index + 1) }), { client: null }), deps)).toMatchObject({ status: "sent" });
    }
    const response = await submitRequest(input(tableForm({ email: "MARIA@example.org" }), { client: null }), deps);
    expect(response).toMatchObject({ status: "limited", retryAfterSeconds: 3600, message: expect.stringContaining("60 Minuten") });
    expect(sent).toHaveLength(6);
  });

  it("begrenzt Versuche je Absender – auch fehlerhafte", async () => {
    const { deps } = setup();
    for (let index = 0; index < 10; index += 1) await submitRequest(input(tableForm({ email: "kaputt" })), deps);
    expect(await submitRequest(input(), deps)).toMatchObject({ status: "limited", retryAfterSeconds: 600 });
    expect(await submitRequest(input(tableForm(), { client: "198.51.100.4" }), deps)).toMatchObject({ status: "sent" });
  });
});
