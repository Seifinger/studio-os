import "server-only";

import { probeTarget, type RequestTarget, type TargetFacts } from "@/domain/requests/target";

import { type EnvSource, parseServerEnv } from "../env";
import type { EmailSenderPort } from "../integrations/ports";
import { createResendSender } from "../integrations/resend";
import { isLoopbackHost } from "../local-only";
import { createRequestLimits } from "./rate-limit";
import type { RequestIncident, SubmitDeps } from "./submit-request";

// Composition Root der Anfragen (ARCHITECTURE.md §3, Regel 5): Nur hier werden Versand, Zähler und
// Ziele aus der Konfiguration zusammengesteckt. Route und Seiten bekommen fertige Abhängigkeiten.

/** Einmal je Server-Prozess, damit die Zähler über Anfragen hinweg gelten. */
const limits = createRequestLimits();

/** Seitenkennungen der Probe: `probe-<slug des Beispielhauses>`. */
export const PROBE_PREFIX = "probe-";

export function emailSenderFromEnv(source?: EnvSource): EmailSenderPort | null {
  const env = parseServerEnv(source);
  if (!env.ok || !env.env.RESEND_API_KEY || !env.env.EMAIL_FROM) return null;
  return createResendSender({
    apiKey: env.env.RESEND_API_KEY,
    from: env.env.EMAIL_FROM,
    ...(env.env.RESEND_BASE_URL ? { baseUrl: env.env.RESEND_BASE_URL } : {}),
  });
}

function report(incident: RequestIncident): void {
  // Nur Seite, Art und Fehlerart – nie Namen, Adressen oder Inhalte (ARCHITECTURE.md §5).
  console.error(`[anfrage] ${JSON.stringify(incident)}`);
}

export function requestDeps(source?: EnvSource): SubmitDeps {
  return { email: emailSenderFromEnv(source), limits, now: () => new Date(), report };
}

/** Postfach der Probe, wenn sie eingeschaltet und der Aufruf lokal ist – sonst `null`. */
export function requestProbeInbox(host: string | null, source?: EnvSource): string | null {
  const env = parseServerEnv(source);
  if (!env.ok || env.env.STUDIO_REQUEST_PROBE !== "local" || !isLoopbackHost(host)) return null;
  return env.env.STUDIO_OPERATOR_EMAIL ?? null;
}

export type TargetLookup = {
  readonly host: string | null;
  /** Angaben eines Beispielhauses für die Probe; `null`, wenn es den Slug nicht gibt. */
  readonly probeFacts: (slug: string) => TargetFacts | null;
  readonly source?: EnvSource;
};

/**
 * Seitenkennung → Anfrageziel. Heute gibt es nur Probe-Ziele; Kundenseiten kommen mit Stufe 6 hinzu
 * (Profil über `requestTargetFromProfile`). Unbekannt, abgeschaltet und nicht lokal sehen gleich aus.
 */
export function resolveRequestTarget(siteId: string, lookup: TargetLookup): RequestTarget | null {
  if (!siteId.startsWith(PROBE_PREFIX)) return null;
  const inbox = requestProbeInbox(lookup.host, lookup.source);
  if (!inbox) return null;
  const facts = lookup.probeFacts(siteId.slice(PROBE_PREFIX.length));
  if (!facts) return null;
  const result = probeTarget(siteId, facts, inbox);
  return result.ok ? result.target : null;
}
