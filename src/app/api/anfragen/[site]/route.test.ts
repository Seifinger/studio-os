import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestResponseSchema } from "@/domain/requests/response";

import { NOW, tableForm } from "../../../../../tests/support/request-fixtures";
import { POST } from "./route.live";

// Die Route mit echter Zusammensetzung (Env → Resend-Adapter → fetch). Nur `fetch` ist ersetzt –
// kein Aufruf verlässt den Test (CLAUDE.md §3).

const HOST = "127.0.0.1:3100";
const context = (site: string) => ({ params: Promise.resolve({ site }) });

let sent: { url: string; body: Record<string, unknown>; key: string | null }[] = [];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  vi.stubEnv("STUDIO_REQUEST_PROBE", "local");
  vi.stubEnv("STUDIO_OPERATOR_NAME", "Studio Beispiel");
  vi.stubEnv("STUDIO_OPERATOR_ADDRESS", "Probegasse 1, 00123 Beispielstadt");
  vi.stubEnv("STUDIO_OPERATOR_EMAIL", "studio@example.org");
  vi.stubEnv("RESEND_API_KEY", "re_test-route");
  vi.stubEnv("EMAIL_FROM", "Anfragen <anfragen@studio.example>");
  vi.stubEnv("RESEND_BASE_URL", "http://127.0.0.1:3111");
  sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      sent.push({ url, body: JSON.parse(String(init.body)) as Record<string, unknown>, key: new Headers(init.headers).get("idempotency-key") });
      return Response.json({ id: `m${sent.length}` });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function post(site: string, fields: Record<string, string | undefined>, headers: Record<string, string> = {}) {
  const body = new URLSearchParams(Object.entries(fields).filter((entry): entry is [string, string] => entry[1] !== undefined)).toString();
  return POST(
    new Request(`http://${HOST}/api/anfragen/${site}`, {
      method: "POST",
      body,
      headers: { origin: `http://${HOST}`, "content-type": "application/x-www-form-urlencoded", accept: "application/json", ...headers },
    }),
    context(site),
  );
}

describe("POST /api/anfragen/[site]", () => {
  it("verschickt eine Probe-Anfrage an das Studio-Postfach und bestätigt dem Gast", async () => {
    const response = await post("probe-gasthaus-zum-kramerwirt", tableForm({ email: "route-1@example.org" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(requestResponseSchema.parse(await response.json())).toEqual({ status: "sent", confirmation: "sent" });

    expect(sent.map((call) => call.url)).toEqual(["http://127.0.0.1:3111/emails", "http://127.0.0.1:3111/emails"]);
    expect(sent[0]?.body).toMatchObject({ to: ["studio@example.org"], reply_to: "route-1@example.org", from: "Website Gasthaus Zum Kramerwirt <anfragen@studio.example>" });
    expect(String(sent[0]?.body.subject)).toMatch(/^\[Probe\] Tischanfrage: 4 Personen, Fr 25\.9\., 19:30 Uhr/);
    expect(sent[1]?.body).toMatchObject({ to: ["route-1@example.org"], reply_to: "studio@example.org" });
    expect(sent[0]?.key).toMatch(/^anfrage-[0-9a-f]{40}-betrieb$/);
  });

  it("antwortet ohne JavaScript mit einer HTML-Seite", async () => {
    const response = await post("probe-gasthaus-zum-kramerwirt", tableForm({ email: "route-2@example.org" }), { accept: "text/html", referer: `http://${HOST}/anfrage-probe/gasthaus-zum-kramerwirt` });
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const html = await response.text();
    expect(html).toContain("<h1>Anfrage verschickt</h1>");
    expect(html).toContain('href="/anfrage-probe/gasthaus-zum-kramerwirt"');
  });

  it("meldet Feldfehler mit 422 und verschickt nichts", async () => {
    const response = await post("probe-gasthaus-zum-kramerwirt", tableForm({ email: "route-3@example.org", datum: "2026-09-28" }));
    expect(response.status).toBe(422);
    const body = requestResponseSchema.parse(await response.json());
    expect(body.status === "invalid" && body.fieldErrors.datum).toBe("Montag ist Ruhetag – bitte einen anderen Tag wählen.");
    expect(sent).toEqual([]);
  });

  it("lehnt Abholungen ab, wenn das Haus sie nicht anbietet", async () => {
    const response = await post("probe-gasthaus-zum-kramerwirt", { ...tableForm({ email: "route-4@example.org" }), art: "abholung", bestellung: "2 × Obazda" });
    expect(response.status).toBe(503);
    expect(sent).toEqual([]);
  });

  it("kennt ohne Probe-Schalter, von außen und für unbekannte Seiten keine Empfänger", async () => {
    expect((await post("kramerwirt", tableForm())).status).toBe(404);
    expect((await post("probe-gibt-es-nicht", tableForm())).status).toBe(404);
    vi.stubEnv("STUDIO_REQUEST_PROBE", "off");
    expect((await post("probe-gasthaus-zum-kramerwirt", tableForm())).status).toBe(404);
    expect(sent).toEqual([]);
  });

  it("weist fremde Seiten, fremde Formate und unbekannte Anfragearten ab", async () => {
    expect((await post("probe-gasthaus-zum-kramerwirt", tableForm(), { origin: "https://fremd.example" })).status).toBe(403);
    expect((await post("probe-gasthaus-zum-kramerwirt", { ...tableForm(), art: "bestellung" })).status).toBe(400);
    const json = await POST(
      new Request(`http://${HOST}/api/anfragen/probe-gasthaus-zum-kramerwirt`, { method: "POST", body: "{}", headers: { "content-type": "application/json" } }),
      context("probe-gasthaus-zum-kramerwirt"),
    );
    expect(json.status).toBe(415);
    expect(sent).toEqual([]);
  });

  it("nennt beim Rate-Limit die Wartezeit im Header", async () => {
    const headers = { "x-forwarded-for": "198.51.100.23" };
    for (let index = 0; index < 10; index += 1) await post("probe-gasthaus-zum-kramerwirt", tableForm({ email: "" }), headers);
    const response = await post("probe-gasthaus-zum-kramerwirt", tableForm({ email: "route-5@example.org" }), headers);
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("600");
  });

  it("verschickt auch aus der narrativen Demo", async () => {
    const response = await post("probe-tiffinstube-rao", tableForm({ email: "route-6@example.org", datum: "2026-09-25", uhrzeit: "12:30", personen: "2" }));
    const body = requestResponseSchema.parse(await response.json());
    expect(body).toEqual({ status: "sent", confirmation: "sent" });
    expect(String(sent[0]?.body.subject)).toContain("[Probe]");
  });
});
