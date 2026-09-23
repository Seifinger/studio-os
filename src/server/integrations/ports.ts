import "server-only";

import type { PlaceData } from "@/domain/leads/place-profile";

import type { PlaceDetailsPurpose, PlacesSearchPurpose } from "./places-fields";

// Ports für externe Dienste (ARCHITECTURE.md, Abschnitt 6).
// In der Foundation existieren nur die Verträge, keine Implementierung und keine SDKs.
// Adapter implementieren diese Schnittstellen; Tests ersetzen sie durch Fakes.
// Weitere Ports (Datenbank-Repositories, Deployment, KI, Benachrichtigung) entstehen mit
// der jeweiligen Stufe aus ROADMAP.md, nicht auf Vorrat.

export type IntegrationName = "googlePlaces" | "supabase" | "resend" | "vercel" | "anthropic";

/** Wird geworfen, wenn eine Integration genutzt wird, deren Konfiguration fehlt. */
export class IntegrationNotConfiguredError extends Error {
  readonly integration: IntegrationName;

  constructor(integration: IntegrationName) {
    super(`Integration "${integration}" ist nicht konfiguriert.`);
    this.name = "IntegrationNotConfiguredError";
    this.integration = integration;
  }
}

/* ---------- Google Places API (New) – Stufe 8 ---------- */

export type PlacesTextQuery = {
  /** Freitext, z. B. "Restaurants in Mühldorf am Inn". */
  readonly text: string;
  /** Bestimmt die Field Mask und damit Kosten und Datenumfang (places-fields.ts, ADR 0013). */
  readonly purpose: PlacesSearchPurpose;
  /** Höchstens 20 je Anfrage (Limit der Textsuche). */
  readonly maxResults: number;
  readonly languageCode?: string;
  readonly regionCode?: string;
};

/**
 * Ein Suchtreffer – nur für die Anzeige. Dauerhaft gespeichert werden darf ausschließlich
 * `placeId`; alles andere wird beim erneuten Anzeigen live abgerufen und mit Google-Logo
 * gezeigt (ADR 0013). Bewusst ohne Fotos und Rezensionen.
 * Felder der Enterprise-Stufe sind `null`, wenn der Zweck sie nicht anfordert.
 */
export type PlaceCandidate = {
  readonly placeId: string;
  readonly displayName: string | null;
  readonly formattedAddress: string | null;
  /** z. B. "OPERATIONAL", "CLOSED_PERMANENTLY" */
  readonly businessStatus: string | null;
  /** Enterprise – nur bei `leadSearch`. */
  readonly websiteUri: string | null;
  /** Enterprise – nur bei `leadSearch`. */
  readonly nationalPhoneNumber: string | null;
  /** Enterprise – nur bei `leadSearch`. */
  readonly rating: number | null;
  /** Enterprise – nur bei `leadSearch`. */
  readonly userRatingCount: number | null;
  readonly retrievedAt: Date;
};

export interface PlacesSearchPort {
  searchText(query: PlacesTextQuery): Promise<readonly PlaceCandidate[]>;
}

/**
 * Place Details live abrufen – nie speichern, nur anzeigen (Lead-Demos, ADR 0021).
 * `null`, wenn Google die Place-ID nicht kennt.
 */
export interface PlaceDetailsPort {
  getDetails(placeId: string, purpose: PlaceDetailsPurpose): Promise<PlaceData | null>;
}

/* ---------- Transaktionale E-Mail (z. B. Resend) – Stufe 5 ---------- */

export type OutboundEmail = {
  readonly to: readonly string[];
  readonly subject: string;
  /** Textfassung ist Pflicht (Barrierefreiheit, Zustellbarkeit). */
  readonly text: string;
  readonly html?: string;
  readonly replyTo?: string;
  /** Verhindert doppelten Versand, wenn ein Aufruf wiederholt wird. */
  readonly idempotencyKey: string;
};

export interface EmailSenderPort {
  send(email: OutboundEmail): Promise<{ readonly messageId: string }>;
}
