import { describe, expect, it, vi } from "vitest";

import type { OutboundEmail } from "./ports";
import { createResendSender, EmailSendError, formatSender, senderAddress } from "./resend";

const KEY = "re_test-schluessel-9b1c";
const EMAIL: OutboundEmail = {
  fromName: "Gasthaus zur Probe",
  to: ["gast@example.org"],
  subject: "Ihre Tischanfrage",
  text: "Guten Tag",
  replyTo: "anfragen@gasthaus.example",
  idempotencyKey: "anfrage-0123abcd-gast",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function failure(promise: Promise<unknown>): Promise<EmailSendError> {
  const error = await promise.catch((caught: unknown) => caught);
  if (!(error instanceof EmailSendError)) throw new Error(`Erwartet: EmailSendError, erhalten: ${String(error)}`);
  return error;
}

describe("createResendSender", () => {
  it("schickt Text, Antwortadresse und Idempotency-Key – Schlüssel nur im Header", async () => {
    const fetch = vi.fn(async () => json({ id: "4ef9a417-02e9-4d39-ad75-9611e0fcc33c" }));
    const sender = createResendSender({ apiKey: KEY, from: "Anfragen <anfragen@studio.example>", fetch });

    expect(await sender.send(EMAIL)).toEqual({ messageId: "4ef9a417-02e9-4d39-ad75-9611e0fcc33c" });

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(url).not.toContain(KEY);
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(headers["Idempotency-Key"]).toBe("anfrage-0123abcd-gast");
    expect(JSON.parse(String(init.body))).toEqual({
      from: "Gasthaus zur Probe <anfragen@studio.example>",
      to: ["gast@example.org"],
      subject: "Ihre Tischanfrage",
      text: "Guten Tag",
      reply_to: "anfragen@gasthaus.example",
    });
  });

  it("nutzt eine abweichende Adresse (Test-Ersatzserver) ohne doppelten Schrägstrich", async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => json({ id: "x1" }));
    await createResendSender({ apiKey: KEY, from: "anfragen@studio.example", baseUrl: "http://127.0.0.1:3111/", fetch }).send(EMAIL);
    expect(fetch.mock.calls[0]?.[0]).toBe("http://127.0.0.1:3111/emails");
  });

  it.each([
    [401, "misconfigured"],
    [403, "misconfigured"],
    [400, "rejected"],
    [422, "rejected"],
    [409, "duplicate"],
    [429, "unavailable"],
    [500, "unavailable"],
    [503, "unavailable"],
  ] as const)("ordnet HTTP %i als „%s“ ein – ohne Antworttext oder Schlüssel", async (status, kind) => {
    const sender = createResendSender({ apiKey: KEY, from: "anfragen@studio.example", fetch: async () => json({ message: `API key ${KEY} is invalid` }, status) });
    const error = await failure(sender.send(EMAIL));
    expect(error.kind).toBe(kind);
    expect(error.status).toBe(status);
    expect(error.message).not.toContain(KEY);
  });

  it("meldet Netzfehler, Zeitüberschreitung und unlesbare Antworten als „unavailable“", async () => {
    const offline = createResendSender({ apiKey: KEY, from: "anfragen@studio.example", fetch: async () => Promise.reject(new TypeError("fetch failed")) });
    expect((await failure(offline.send(EMAIL))).kind).toBe("unavailable");
    const garbled = createResendSender({ apiKey: KEY, from: "anfragen@studio.example", fetch: async () => new Response("<html>", { status: 200 }) });
    expect(await failure(garbled.send(EMAIL))).toMatchObject({ kind: "unavailable", status: 200 });
  });

  it("schickt ungültige Keys und Empfängerlisten gar nicht erst ab", async () => {
    const fetch = vi.fn(async () => json({ id: "x" }));
    const sender = createResendSender({ apiKey: KEY, from: "anfragen@studio.example", fetch });
    expect((await failure(sender.send({ ...EMAIL, idempotencyKey: "mit leerzeichen" }))).kind).toBe("rejected");
    expect((await failure(sender.send({ ...EMAIL, idempotencyKey: "x".repeat(257) }))).kind).toBe("rejected");
    expect((await failure(sender.send({ ...EMAIL, to: [] }))).kind).toBe("rejected");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("Absender", () => {
  it("liest die Adresse aus EMAIL_FROM", () => {
    expect(senderAddress("Anfragen <anfragen@studio.example>")).toBe("anfragen@studio.example");
    expect(senderAddress("anfragen@studio.example")).toBe("anfragen@studio.example");
  });

  it("entfernt Zeichen, mit denen ein Betriebsname das Absenderfeld verbiegen könnte", () => {
    expect(formatSender('Wirt "Zur Linde" <x@y>, Bcc', "anfragen@studio.example")).toBe("Wirt Zur Linde x y Bcc <anfragen@studio.example>");
    expect(formatSender("Café Müller & Söhne", "Studio <anfragen@studio.example>")).toBe("Café Müller & Söhne <anfragen@studio.example>");
    expect(formatSender(undefined, "Studio <anfragen@studio.example>")).toBe("Studio <anfragen@studio.example>");
    expect(formatSender("  ", "anfragen@studio.example")).toBe("anfragen@studio.example");
  });
});
