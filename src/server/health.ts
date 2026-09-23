import "server-only";

import { z } from "zod";

import { APP_NAME, APP_VERSION } from "./app-info";
import { type EnvSource, parseServerEnv } from "./env";

// Antwortformat von GET /api/health (docs/decisions/0006-health-check.md).
// Öffentlich erreichbar, deshalb ohne Konfigurationswerte und ohne Variablennamen.

export const healthCheckSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["pass", "fail"]),
  detail: z.string().optional(),
});

export const healthReportSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal(APP_NAME),
  version: z.string().min(1),
  timestamp: z.iso.datetime(),
  checks: z.array(healthCheckSchema).min(1),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;

export type HealthResult = {
  /** Darf öffentlich ausgeliefert werden. */
  readonly report: HealthReport;
  /** Nur fürs Server-Log: Variablennamen und Meldungen, nie Werte. */
  readonly problems: readonly string[];
};

export type HealthOptions = {
  readonly now?: Date;
  readonly env?: EnvSource;
};

export function runHealthCheck({ now = new Date(), env }: HealthOptions = {}): HealthResult {
  const config = parseServerEnv(env);
  const problems = config.ok ? [] : config.issues.map((issue) => `${issue.variable}: ${issue.message}`);

  const checks: HealthCheck[] = [
    config.ok
      ? { name: "config", status: "pass" }
      : {
          name: "config",
          status: "fail",
          detail: `Serverkonfiguration ungültig (${problems.length} ${problems.length === 1 ? "Problem" : "Probleme"}), Details im Server-Log`,
        },
  ];

  return {
    report: {
      status: checks.every((check) => check.status === "pass") ? "ok" : "degraded",
      service: APP_NAME,
      version: APP_VERSION,
      timestamp: now.toISOString(),
      checks,
    },
    problems,
  };
}
