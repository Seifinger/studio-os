import { describe, expect, it } from "vitest";

import packageJson from "../../package.json";

import { healthReportSchema, runHealthCheck } from "./health";

const NOW = new Date("2026-09-23T12:00:00.000Z");

describe("runHealthCheck", () => {
  it("meldet ok mit gültiger (leerer) Konfiguration", () => {
    const { report, problems } = runHealthCheck({ now: NOW, env: {} });

    expect(healthReportSchema.parse(report)).toEqual(report);
    expect(report).toEqual({
      status: "ok",
      service: "studio-os",
      version: packageJson.version,
      timestamp: "2026-09-23T12:00:00.000Z",
      checks: [{ name: "config", status: "pass" }],
    });
    expect(problems).toEqual([]);
  });

  it("meldet degraded bei ungültiger Konfiguration – ohne Namen oder Werte im öffentlichen Bericht", () => {
    const secret = "geheim-41d0";
    const { report, problems } = runHealthCheck({
      now: NOW,
      env: { SUPABASE_URL: `http://${secret}.example`, RESEND_API_KEY: secret },
    });

    expect(healthReportSchema.parse(report)).toEqual(report);
    expect(report.status).toBe("degraded");
    expect(report.checks).toEqual([
      {
        name: "config",
        status: "fail",
        detail: "Serverkonfiguration ungültig (3 Probleme), Details im Server-Log",
      },
    ]);

    const publicJson = JSON.stringify(report);
    expect(publicJson).not.toContain(secret);
    expect(publicJson).not.toMatch(/SUPABASE|RESEND|EMAIL_FROM/);

    // Das Server-Log bekommt die Variablennamen, aber ebenfalls keine Werte.
    expect(problems).toHaveLength(3);
    expect(problems.join(" ")).toMatch(/SUPABASE_URL/);
    expect(problems.join(" ")).not.toContain(secret);
  });

  it("verwendet im Singular die richtige Form", () => {
    const { report } = runHealthCheck({ now: NOW, env: { NODE_ENV: "staging" } });
    expect(report.checks[0]?.detail).toBe("Serverkonfiguration ungültig (1 Problem), Details im Server-Log");
  });
});
