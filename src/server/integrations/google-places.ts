import "server-only";

import { z } from "zod";

import type { PlaceData } from "@/domain/leads/place-profile";

import { detailsFieldMaskHeader, type PlaceDetailsPurpose } from "./places-fields";
import type { PlaceDetailsPort } from "./ports";

// Adapter für Google Places API (New), Place Details (ADR 0013, 0021). Nur serverseitig, der
// Schlüssel verlässt den Server nie. Antworten werden geprüft und nicht zwischengespeichert.

const DETAILS_URL = "https://places.googleapis.com/v1/places/";
const TIMEOUT_MS = 10_000;

/** Place-IDs sind URL-sichere Zeichenketten; alles andere wird gar nicht erst angefragt. */
export const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,300}$/;

export class PlacesRequestError extends Error {
  override readonly name = "PlacesRequestError";
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.status = status;
  }
}

const point = z.object({ day: z.number().int().min(0).max(6), hour: z.number().int().min(0).max(24), minute: z.number().int().min(0).max(59) });

const detailsSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }).optional(),
  formattedAddress: z.string().optional(),
  postalAddress: z
    .object({ postalCode: z.string().optional(), locality: z.string().optional(), addressLines: z.array(z.string()).optional() })
    .optional(),
  businessStatus: z.string().optional(),
  primaryType: z.string().optional(),
  types: z.array(z.string()).optional(),
  nationalPhoneNumber: z.string().optional(),
  websiteUri: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingCount: z.number().int().min(0).optional(),
  regularOpeningHours: z.object({ periods: z.array(z.object({ open: point, close: point.optional() })).optional() }).optional(),
});

type Fetch = (input: string, init: RequestInit) => Promise<Response>;

export type GooglePlacesOptions = {
  readonly apiKey: string;
  readonly fetch?: Fetch;
  readonly languageCode?: string;
  readonly regionCode?: string;
};

export function createGooglePlaces(options: GooglePlacesOptions): PlaceDetailsPort {
  const request = options.fetch ?? fetch;
  return {
    async getDetails(placeId: string, purpose: PlaceDetailsPurpose): Promise<PlaceData | null> {
      if (!PLACE_ID_PATTERN.test(placeId)) throw new PlacesRequestError("Ungültige Place-ID", null);

      const url = `${DETAILS_URL}${encodeURIComponent(placeId)}?languageCode=${options.languageCode ?? "de"}&regionCode=${options.regionCode ?? "DE"}`;
      let response: Response;
      try {
        response = await request(url, {
          method: "GET",
          headers: { "X-Goog-Api-Key": options.apiKey, "X-Goog-FieldMask": detailsFieldMaskHeader(purpose) },
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch {
        throw new PlacesRequestError("Google Places nicht erreichbar", null);
      }

      if (response.status === 404) return null;
      // Nur den Status melden – die Fehlerantwort kann die Anfrage samt Schlüsselhinweisen enthalten.
      if (!response.ok) throw new PlacesRequestError(`Google Places antwortet mit HTTP ${response.status}`, response.status);

      const parsed = detailsSchema.safeParse(await response.json().catch(() => null));
      if (!parsed.success) throw new PlacesRequestError("Unerwartete Antwort von Google Places", response.status);
      const data = parsed.data;

      return {
        placeId: data.id,
        displayName: data.displayName?.text ?? null,
        formattedAddress: data.formattedAddress ?? null,
        postalAddress: data.postalAddress
          ? { postalCode: data.postalAddress.postalCode ?? null, locality: data.postalAddress.locality ?? null, addressLines: data.postalAddress.addressLines ?? [] }
          : null,
        businessStatus: data.businessStatus ?? null,
        primaryType: data.primaryType ?? null,
        types: data.types ?? [],
        nationalPhoneNumber: data.nationalPhoneNumber ?? null,
        websiteUri: data.websiteUri ?? null,
        rating: data.rating ?? null,
        userRatingCount: data.userRatingCount ?? null,
        regularOpeningHours: data.regularOpeningHours ? { periods: data.regularOpeningHours.periods ?? [] } : null,
      };
    },
  };
}
