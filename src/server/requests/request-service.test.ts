import { describe, expect, it, vi } from "vitest";

import type { TargetFacts } from "@/domain/requests/target";

import { emailSenderFromEnv, requestProbeInbox, resolveRequestTarget } from "./request-service";

const PROBE_ENV = {
  STUDIO_REQUEST_PROBE: "local",
  STUDIO_OPERATOR_NAME: "Studio Beispiel",
  STUDIO_OPERATOR_ADDRESS: "Probegasse 1, 00123 Beispielstadt",
  STUDIO_OPERATOR_EMAIL: "studio@example.org",
};

const unknown = { status: "unbekannt", value: null } as const;
const FACTS: TargetFacts = {
  name: { status: "fiktiv", value: "Kramerwirt" },
  email: unknown,
  requestChannels: { status: "fiktiv", value: { table: true, pickup: false } },
  openingHours: unknown,
  phone: unknown,
  address: unknown,
};

const probeFacts = (slug: string) => (slug === "kramerwirt" ? FACTS : null);

describe("requestProbeInbox", () => {
  it("liefert das Studio-Postfach nur mit STUDIO_REQUEST_PROBE=local und nur über localhost", () => {
    expect(requestProbeInbox("127.0.0.1:3100", PROBE_ENV)).toBe("studio@example.org");
    expect(requestProbeInbox("studio.example", PROBE_ENV)).toBeNull();
    expect(requestProbeInbox("localhost:3000", { ...PROBE_ENV, STUDIO_REQUEST_PROBE: "off" })).toBeNull();
    expect(requestProbeInbox("localhost:3000", { STUDIO_REQUEST_PROBE: "local" })).toBeNull();
  });
});

describe("resolveRequestTarget", () => {
  it("baut Probe-Ziele aus dem Beispielhaus mit Studio-Postfach", () => {
    const target = resolveRequestTarget("probe-kramerwirt", { host: "localhost:3000", probeFacts, source: PROBE_ENV });
    expect(target).toMatchObject({ siteId: "probe-kramerwirt", businessName: "Kramerwirt", recipient: "studio@example.org", probe: true });
  });

  it("kennt keine anderen Seiten – Kundenseiten kommen erst mit Stufe 6", () => {
    const lookup = { host: "localhost:3000", probeFacts, source: PROBE_ENV };
    expect(resolveRequestTarget("kramerwirt", lookup)).toBeNull();
    expect(resolveRequestTarget("probe-unbekannt", lookup)).toBeNull();
    expect(resolveRequestTarget("probe-kramerwirt", { ...lookup, host: "studio.example" })).toBeNull();
  });
});

describe("emailSenderFromEnv", () => {
  it("ist ohne Schlüssel und Absender abgeschaltet", () => {
    expect(emailSenderFromEnv({})).toBeNull();
  });

  it("nutzt die konfigurierte Resend-Adresse", async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response(JSON.stringify({ id: "m1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const sender = emailSenderFromEnv({ RESEND_API_KEY: "re_test", EMAIL_FROM: "anfragen@studio.example", RESEND_BASE_URL: "http://127.0.0.1:3111" });
    await sender?.send({ to: ["gast@example.org"], subject: "x", text: "y", idempotencyKey: "k1" });
    expect(fetch.mock.calls[0]?.[0]).toBe("http://127.0.0.1:3111/emails");
    vi.unstubAllGlobals();
  });
});
