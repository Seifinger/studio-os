import "server-only";

import { factsFromPlace, type PlaceFacts, placeDemoBlocker } from "@/domain/leads/place-profile";

import { type EnvSource, parseServerEnv } from "../env";
import { createGooglePlaces } from "../integrations/google-places";
import { IntegrationNotConfiguredError, type PlaceDetailsPort } from "../integrations/ports";

// Lead-Demos (ADR 0016 Option B, ADR 0021): persönliche Konzept-Demo für einen echten Betrieb,
// gerendert beim Aufruf aus live abgerufenen Place Details. Nichts wird gespeichert oder
// zwischengespeichert; die Seite ist nur lokal erreichbar.

export type LeadDemoData = {
  readonly placeId: string;
  readonly facts: PlaceFacts;
  /** Live angezeigt, nie gespeichert – verlangt die Quellenangabe „Google Maps“. */
  readonly rating: { readonly value: number; readonly count: number } | null;
  /** Nur zur Einordnung im Gespräch, nicht auf der Demo-Seite. */
  readonly websiteUri: string | null;
};

export type LeadDemoResult =
  | { readonly kind: "ok"; readonly demo: LeadDemoData }
  | { readonly kind: "notFound" }
  | { readonly kind: "blocked"; readonly reason: string };

const LOOPBACK_HOST = /^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d{1,5})?$/i;

/** Nur mit STUDIO_LEAD_DEMOS=local und nur über localhost – nie auf einem öffentlichen Host. */
export function leadDemosAllowed(host: string | null, source?: EnvSource): boolean {
  const env = parseServerEnv(source);
  if (!env.ok || env.env.STUDIO_LEAD_DEMOS !== "local") return false;
  return host !== null && LOOPBACK_HOST.test(host.trim());
}

export function placesFromEnv(source?: EnvSource): PlaceDetailsPort {
  const env = parseServerEnv(source);
  const apiKey = env.ok ? env.env.GOOGLE_PLACES_API_KEY : undefined;
  if (!apiKey) throw new IntegrationNotConfiguredError("googlePlaces");
  return createGooglePlaces({ apiKey });
}

export async function loadLeadDemo(placeId: string, deps: { readonly places: PlaceDetailsPort; readonly now: () => Date }): Promise<LeadDemoResult> {
  const place = await deps.places.getDetails(placeId, "leadDemo");
  if (!place) return { kind: "notFound" };
  const blocker = placeDemoBlocker(place);
  if (blocker) return { kind: "blocked", reason: blocker };

  const rating = place.rating !== null && place.userRatingCount !== null && place.userRatingCount > 0 ? { value: place.rating, count: place.userRatingCount } : null;
  return { kind: "ok", demo: { placeId: place.placeId, facts: factsFromPlace(place, deps.now()), rating, websiteUri: place.websiteUri } };
}
