import { describe, expect, it } from "vitest";

import { backHref, clientKey, fallbackPage, httpStatusFor, isCrossSite, MAX_BODY_BYTES, readRequestForm, requestHost, wantsJson } from "./http";

const post = (body: BodyInit, contentType: string, headers: Record<string, string> = {}) =>
  new Request("http://127.0.0.1:3100/api/anfragen/probe-kramerwirt", { method: "POST", body, headers: { "content-type": contentType, ...headers } });

describe("readRequestForm", () => {
  it("liest URL-kodierte Formulare (ohne JavaScript) und nur bekannte Felder", async () => {
    const body = new URLSearchParams({ art: "tisch", name: "Maria", webseite: "", dauer: "4000", fremd: "x" }).toString();
    expect(await readRequestForm(post(body, "application/x-www-form-urlencoded"))).toEqual({
      ok: true,
      form: { art: "tisch", name: "Maria", webseite: "", dauer: "4000" },
    });
  });

  it("liest multipart-Formulare (fetch mit FormData) und ignoriert Dateien", async () => {
    const data = new FormData();
    data.set("art", "abholung");
    data.set("bestellung", "2 × Knödel");
    data.set("name", new Blob(["datei"]), "name.txt");
    const request = new Request("http://127.0.0.1:3100/x", { method: "POST", body: data });
    expect(await readRequestForm(request)).toEqual({ ok: true, form: { art: "abholung", bestellung: "2 × Knödel" } });
  });

  it("lehnt andere Formate, zu große und kaputte Körper ab", async () => {
    expect(await readRequestForm(post("{}", "application/json"))).toEqual({ ok: false, status: 415 });
    expect(await readRequestForm(post("a=".padEnd(MAX_BODY_BYTES + 10, "x"), "application/x-www-form-urlencoded"))).toEqual({ ok: false, status: 413 });
    expect(await readRequestForm(post("kaputt", "multipart/form-data; boundary=xyz"))).toEqual({ ok: false, status: 400 });
  });

  it("verlässt sich nicht auf eine falsche Längenangabe", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let index = 0; index < 20; index += 1) controller.enqueue(new TextEncoder().encode("x".repeat(1024)));
        controller.close();
      },
    });
    const request = new Request("http://127.0.0.1:3100/x", {
      method: "POST",
      body: stream,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      duplex: "half",
    } as RequestInit);
    expect(await readRequestForm(request)).toEqual({ ok: false, status: 413 });
  });
});

describe("isCrossSite", () => {
  const HOST = "127.0.0.1:3100";

  it("lässt eigene Formulare und Aufrufe ohne Origin durch", () => {
    expect(isCrossSite(new Headers({ origin: "http://127.0.0.1:3100", "sec-fetch-site": "same-origin" }), HOST)).toBe(false);
    expect(isCrossSite(new Headers(), HOST)).toBe(false);
  });

  it("weist fremde Seiten ab", () => {
    expect(isCrossSite(new Headers({ "sec-fetch-site": "cross-site" }), HOST)).toBe(true);
    expect(isCrossSite(new Headers({ origin: "https://fremd.example" }), HOST)).toBe(true);
    expect(isCrossSite(new Headers({ origin: "null" }), HOST)).toBe(true);
  });

  it("liest den Host aus der Kopfzeile, ersatzweise aus der URL", () => {
    expect(requestHost(new Request("http://127.0.0.1:3100/x"))).toBe("127.0.0.1:3100");
  });
});

describe("Kopfzeilen", () => {
  it("nimmt die erste Adresse aus X-Forwarded-For", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientKey(new Headers())).toBeNull();
  });

  it("erkennt Formulare mit JavaScript an Accept", () => {
    expect(wantsJson(new Headers({ accept: "application/json" }))).toBe(true);
    expect(wantsJson(new Headers({ accept: "text/html,application/xhtml+xml" }))).toBe(false);
  });

  it("führt nur auf derselben Adresse zurück", () => {
    expect(backHref(new Headers({ referer: "http://127.0.0.1:3100/anfrage-probe/gasthaus-zum-kramerwirt?x=1" }), "127.0.0.1:3100")).toBe("/anfrage-probe/gasthaus-zum-kramerwirt?x=1");
    expect(backHref(new Headers({ referer: "https://fremd.example/phishing" }), "127.0.0.1:3100")).toBe("/");
    expect(backHref(new Headers(), "127.0.0.1:3100")).toBe("/");
  });
});

describe("Antworten", () => {
  it("ordnet jedem Ergebnis einen HTTP-Status zu", () => {
    expect(httpStatusFor({ status: "sent", confirmation: "sent" })).toBe(200);
    expect(httpStatusFor({ status: "invalid", message: "", fieldErrors: {} })).toBe(422);
    expect(httpStatusFor({ status: "limited", message: "", retryAfterSeconds: 5 })).toBe(429);
    expect(httpStatusFor({ status: "unavailable", message: "" })).toBe(503);
    expect(httpStatusFor({ status: "failed", message: "" })).toBe(502);
  });

  it("zeigt ohne JavaScript eine lesbare Seite mit Fehlern je Feld und maskiert alles", () => {
    const html = fallbackPage({ status: "invalid", message: "Bitte prüfen Sie die markierten Felder.", fieldErrors: { email: "Adresse <falsch>", telefon: "Nummer falsch" } }, "table", '/x"><script>');
    expect(html).toContain('<html lang="de">');
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain("<li>E-Mail: Adresse &lt;falsch&gt;</li>");
    expect(html).toContain("<li>Telefon: Nummer falsch</li>");
    expect(html).toContain('href="/x&quot;&gt;&lt;script&gt;"');
    expect(html).not.toContain("<script>");
  });

  it("bestätigt ohne JavaScript ehrlich, was passiert ist", () => {
    const html = fallbackPage({ status: "sent", confirmation: "sent" }, "table", "/");
    expect(html).toContain("<h1>Anfrage verschickt</h1>");
    expect(html).toContain("noch keine Reservierung");
  });
});
