import { describe, expect, it, vi } from "vitest";

import { healthReportSchema } from "@/server/health";

import { GET } from "./route.live";

describe("GET /api/health", () => {
  it("antwortet 200 mit gültigem Bericht und ohne Cache", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");

    const body = healthReportSchema.parse(await response.json());
    expect(body.status).toBe("ok");
    expect(body.service).toBe("studio-os");
  });

  it("antwortet 503 bei ungültiger Konfiguration und protokolliert nur Variablennamen", async () => {
    vi.stubEnv("SUPABASE_URL", "http://intern-geheim.example");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = GET();
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(healthReportSchema.parse(JSON.parse(text)).status).toBe("degraded");
    expect(text).not.toContain("intern-geheim");

    expect(log).toHaveBeenCalledTimes(1);
    const logged = String(log.mock.calls[0]?.[0]);
    expect(logged).toContain("SUPABASE_URL");
    expect(logged).not.toContain("intern-geheim");
  });
});
