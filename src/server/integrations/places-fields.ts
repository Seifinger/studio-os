import "server-only";

// Field Masks für Google Places Text Search (New) – ADR 0013.
// Die angeforderten Felder bestimmen die abgerechnete SKU (höchste Stufe zählt) und damit,
// welche Google-Inhalte überhaupt ins System kommen. Deshalb gibt es nur feste, getestete
// Masken je Anwendungsfall – nie frei zusammengesetzte oder "*".
// Quelle der Stufen: developers.google.com/maps/documentation/places/web-service/text-search
// (abgerufen 2026-09-23). Vor Stufe 8 erneut prüfen.

export type PlacesSkuTier = "essentials" | "pro" | "enterprise" | "enterpriseAtmosphere";

const ESSENTIALS_FIELDS: ReadonlySet<string> = new Set([
  "places.id",
  "places.name",
  "places.attributions",
  "places.consumerAlert",
  "places.movedPlace",
  "places.movedPlaceId",
  "nextPageToken",
]);

const ENTERPRISE_FIELDS: ReadonlySet<string> = new Set([
  "places.currentOpeningHours",
  "places.currentSecondaryOpeningHours",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.priceLevel",
  "places.priceRange",
  "places.rating",
  "places.regularOpeningHours",
  "places.regularSecondaryOpeningHours",
  "places.transitStation",
  "places.userRatingCount",
  "places.websiteUri",
]);

// Felder, die studio-os nie anfordert: Fotos und Rezensionen (Produktprinzip 8, ADR 0013),
// generierte Zusammenfassungen (fremde Texte, die wie eigene wirken würden) und Platzhalter.
// "places.photos" gehört zur Pro-Stufe – die Stufe allein schützt also nicht.
export const FORBIDDEN_PLACES_FIELDS: ReadonlySet<string> = new Set([
  "*",
  "places.*",
  "places.photos",
  "places.reviews",
  "places.reviewSummary",
  "places.generativeSummary",
  "places.editorialSummary",
  "places.neighborhoodSummary",
]);

// Alle übrigen Atmosphere-Felder: nicht verboten, aber teuer und für Leads ohne Nutzen.
const ATMOSPHERE_PREFIXES = ["places.serves", "places.goodFor"] as const;
const ATMOSPHERE_FIELDS: ReadonlySet<string> = new Set([
  "places.allowsDogs",
  "places.curbsidePickup",
  "places.delivery",
  "places.dineIn",
  "places.liveMusic",
  "places.menuForChildren",
  "places.outdoorSeating",
  "places.parkingOptions",
  "places.paymentOptions",
  "places.reservable",
  "places.restroom",
  "places.takeout",
]);

const TIER_ORDER: readonly PlacesSkuTier[] = ["essentials", "pro", "enterprise", "enterpriseAtmosphere"];

/** Place Details schreibt Felder ohne "places."-Präfix; die Stufen sind dieselben. */
const normalize = (field: string) => (field === "nextPageToken" || field.startsWith("places.") ? field : `places.${field}`);

/** Verboten, egal ob mit oder ohne Präfix geschrieben. */
export function isForbiddenPlacesField(field: string): boolean {
  return FORBIDDEN_PLACES_FIELDS.has(field) || FORBIDDEN_PLACES_FIELDS.has(normalize(field));
}

function tierOfField(raw: string): PlacesSkuTier {
  const field = normalize(raw);
  if (ESSENTIALS_FIELDS.has(field)) return "essentials";
  if (ENTERPRISE_FIELDS.has(field)) return "enterprise";
  if (ATMOSPHERE_FIELDS.has(field) || ATMOSPHERE_PREFIXES.some((prefix) => field.startsWith(prefix))) {
    return "enterpriseAtmosphere";
  }
  return "pro";
}

/** Höchste SKU-Stufe einer Maske – nach ihr wird die Anfrage abgerechnet. */
export function skuTierOf(fields: readonly string[]): PlacesSkuTier {
  return fields.reduce<PlacesSkuTier>((highest, field) => {
    const tier = tierOfField(field);
    return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(highest) ? tier : highest;
  }, "essentials");
}

export const TEXT_SEARCH_FIELD_MASKS = {
  /**
   * Lead-Suche (Stufe 8). Enterprise, weil `websiteUri` den stärksten Befund liefert
   * („keine Website“). Weitere Enterprise-Felder kosten innerhalb derselben Stufe nichts extra.
   */
  leadSearch: [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.businessStatus",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.rating",
    "places.userRatingCount",
    "nextPageToken",
  ],
  /** Live-Anzeige in der Rechercheansicht ohne Kontakt- und Bewertungsdaten (Pro). */
  researchDisplay: ["places.id", "places.displayName", "places.formattedAddress", "places.businessStatus"],
} as const satisfies Record<string, readonly string[]>;

export type PlacesSearchPurpose = keyof typeof TEXT_SEARCH_FIELD_MASKS;

/** Wert für den Header `X-Goog-FieldMask`. */
export function fieldMaskHeader(purpose: PlacesSearchPurpose): string {
  return TEXT_SEARCH_FIELD_MASKS[purpose].join(",");
}

// Field Masks für Place Details (New) – ohne "places."-Präfix. Quelle der Stufen:
// developers.google.com/maps/documentation/places/web-service/place-details (abgerufen 2026-09-23).
export const PLACE_DETAILS_FIELD_MASKS = {
  /**
   * Lead-Demo (ADR 0021): dieselbe Datenlage wie die Lead-Suche aus gastro-webagentur und
   * gastro-v3 (Name, Adresse, Telefon, Website, Bewertung), ergänzt um Öffnungszeiten,
   * strukturierte Adresse und Typ. Alles Enterprise – Zusatzfelder kosten in der Stufe nichts extra.
   */
  leadDemo: [
    "id",
    "displayName",
    "formattedAddress",
    "postalAddress",
    "businessStatus",
    "primaryType",
    "types",
    "nationalPhoneNumber",
    "websiteUri",
    "rating",
    "userRatingCount",
    "regularOpeningHours",
  ],
} as const satisfies Record<string, readonly string[]>;

export type PlaceDetailsPurpose = keyof typeof PLACE_DETAILS_FIELD_MASKS;

export function detailsFieldMaskHeader(purpose: PlaceDetailsPurpose): string {
  return PLACE_DETAILS_FIELD_MASKS[purpose].join(",");
}
