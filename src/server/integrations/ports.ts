import "server-only";

// Ports für externe Dienste (ARCHITECTURE.md, Abschnitt 6).
// In der Foundation existieren nur die Verträge, keine Implementierung und keine SDKs.
// Adapter implementieren diese Schnittstellen; Tests ersetzen sie durch Fakes.
// Weitere Ports (Datenbank-Repositories, Deployment, KI, Benachrichtigung) entstehen mit
// der jeweiligen Stufe aus MIGRATION.md, nicht auf Vorrat.

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

/* ---------- Google Places API (New) – Stufe 5 ---------- */

export type PlacesTextQuery = {
  /** Freitext, z. B. "Restaurants in Mühldorf am Inn". */
  readonly text: string;
  /** Höchstens 20 je Anfrage (Limit der Textsuche). */
  readonly maxResults: number;
  readonly languageCode?: string;
  readonly regionCode?: string;
};

/**
 * Ein Suchtreffer. Flüchtig: Dauerhaft gespeichert werden darf nur `placeId`,
 * alle anderen Felder nur mit Ablaufdatum (ARCHITECTURE.md, Abschnitt 5).
 * Bewusst ohne Fotos und Rezensionstexte.
 */
export type PlaceCandidate = {
  readonly placeId: string;
  readonly displayName: string;
  readonly formattedAddress: string | null;
  readonly nationalPhoneNumber: string | null;
  readonly websiteUri: string | null;
  readonly rating: number | null;
  readonly userRatingCount: number | null;
  /** Zeitpunkt des Abrufs – Grundlage für das Ablaufdatum. */
  readonly retrievedAt: Date;
};

export interface PlacesSearchPort {
  searchText(query: PlacesTextQuery): Promise<readonly PlaceCandidate[]>;
}

/* ---------- Transaktionale E-Mail (z. B. Resend) – Stufe 7 ---------- */

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
