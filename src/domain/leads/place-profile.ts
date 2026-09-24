import { openingHoursSchema, type OpeningHours, type Weekday } from "../content/opening-hours";
import { parsePhoneNumber } from "../content/phone";
import { type CuisineId, suggestCuisine } from "../gastronomy/cuisines";
import type { Fact, LiveSource } from "../provenance/fact";

// Lead-Demos (ADR 0021): Aus live abgerufenen Place Details wird ein Profil im Speicher. Nichts
// davon wird gespeichert. Direkt von Google übernommene Angaben tragen den Status „uebernommen“
// mit Live-Quelle; alles, was das Studio daraus ableitet (Küche), ist ein „vorschlag“.

/** Place Details in der Form, die der Adapter liefert (Felder laut PLACE_DETAILS_FIELD_MASKS.leadDemo). */
export type PlaceData = {
  readonly placeId: string;
  readonly displayName: string | null;
  readonly formattedAddress: string | null;
  readonly postalAddress: { readonly postalCode: string | null; readonly locality: string | null; readonly addressLines: readonly string[] } | null;
  readonly businessStatus: string | null;
  readonly primaryType: string | null;
  readonly types: readonly string[];
  readonly nationalPhoneNumber: string | null;
  readonly websiteUri: string | null;
  readonly rating: number | null;
  readonly userRatingCount: number | null;
  readonly regularOpeningHours: { readonly periods: readonly PlacePeriod[] } | null;
};

export type PlacePoint = { readonly day: number; readonly hour: number; readonly minute: number };
export type PlacePeriod = { readonly open: PlacePoint; readonly close?: PlacePoint | undefined };

/** Google zählt ab Sonntag (0). */
const GOOGLE_DAYS: readonly Weekday[] = ["so", "mo", "di", "mi", "do", "fr", "sa"];

const time = ({ hour, minute }: PlacePoint) => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

/**
 * Wandelt Googles Öffnungsperioden in einen Wochenplan. Lässt sich das Ergebnis nicht sauber
 * prüfen, gilt die Angabe als unbekannt – lieber ein Platzhalter als falsche Zeiten.
 */
export function openingHoursFromPeriods(periods: readonly PlacePeriod[]): OpeningHours | null {
  if (periods.length === 0) return null;
  const week: Record<Weekday, { from: string; to: string }[]> = { mo: [], di: [], mi: [], do: [], fr: [], sa: [], so: [] };
  for (const period of periods) {
    const day = GOOGLE_DAYS[period.open.day];
    if (!day) return null;
    // Ohne Ende: rund um die Uhr geöffnet (Google liefert dann nur „So 00:00“).
    if (!period.close) {
      for (const weekday of GOOGLE_DAYS) week[weekday].push({ from: "00:00", to: "23:59" });
      continue;
    }
    const close = time(period.close) === "24:00" ? "00:00" : time(period.close);
    week[day].push({ from: time(period.open), to: close });
  }
  const parsed = openingHoursSchema.safeParse({ week });
  return parsed.success ? parsed.data : null;
}

/** Google-Typen → Küche. Nur Vorschlag: „restaurant“ allein sagt nichts. */
const TYPE_CUISINE: Readonly<Record<string, CuisineId>> = {
  italian_restaurant: "italienisch",
  pizza_restaurant: "italienisch",
  greek_restaurant: "griechisch",
  turkish_restaurant: "tuerkisch",
  middle_eastern_restaurant: "syrisch",
  lebanese_restaurant: "syrisch",
  chinese_restaurant: "chinesisch",
  thai_restaurant: "thailaendisch",
  vietnamese_restaurant: "vietnamesisch",
  japanese_restaurant: "japanisch",
  sushi_restaurant: "japanisch",
  ramen_restaurant: "japanisch",
  indian_restaurant: "indisch",
  asian_restaurant: "asiatisch",
  korean_restaurant: "asiatisch",
  indonesian_restaurant: "asiatisch",
  cafe: "cafe",
  coffee_shop: "cafe",
  german_restaurant: "deutsch",
};

/** Küche als Vorschlag: zuerst aus dem Namen (genauer, z. B. „Wirtshaus“), dann aus den Google-Typen. */
export function cuisineFromPlace(place: Pick<PlaceData, "displayName" | "primaryType" | "types">): Fact<CuisineId> {
  const fromName = suggestCuisine(place.displayName);
  if (fromName) return { status: "vorschlag", value: fromName.cuisine, by: "studio", note: `Name enthält „${fromName.matched}“` };
  const type = [place.primaryType, ...place.types].find((candidate): candidate is string => candidate !== null && candidate in TYPE_CUISINE);
  const cuisine = type ? TYPE_CUISINE[type] : undefined;
  if (type && cuisine) return { status: "vorschlag", value: cuisine, by: "studio", note: `Google-Typ „${type}“` };
  return { status: "unbekannt", value: null };
}

export type PlaceFacts = {
  readonly name: Fact<string>;
  readonly locality: Fact<string>;
  readonly address: Fact<{ street: string; postalCode: string; locality: string }>;
  readonly phone: Fact<{ e164: string; display: string }>;
  readonly openingHours: Fact<OpeningHours>;
  readonly cuisine: Fact<CuisineId>;
};

const UNKNOWN = { status: "unbekannt", value: null } as const;

/** Nur Felder mit eindeutigem Wert werden übernommen – leere oder unklare bleiben unbekannt. */
export function factsFromPlace(place: PlaceData, retrievedAt: Date): PlaceFacts {
  const source: LiveSource = { kind: "googlePlacesLive", placeId: place.placeId, retrievedAt: retrievedAt.toISOString() };
  const recordedAt = retrievedAt.toISOString().slice(0, 10);
  const taken = <T>(value: T): Fact<T> => ({ status: "uebernommen", value, source, recordedAt });

  const name = place.displayName?.trim();
  const postal = place.postalAddress;
  const street = postal?.addressLines[0]?.trim();
  const locality = postal?.locality?.trim();
  const postalCode = postal?.postalCode?.trim();
  const phone = place.nationalPhoneNumber ? parsePhoneNumber(place.nationalPhoneNumber) : null;
  const hours = place.regularOpeningHours ? openingHoursFromPeriods(place.regularOpeningHours.periods) : null;

  return {
    name: name ? taken(name) : UNKNOWN,
    locality: locality ? taken(locality) : UNKNOWN,
    address: street && locality && postalCode && /^\d{5}$/.test(postalCode) ? taken({ street, postalCode, locality }) : UNKNOWN,
    phone: phone?.ok ? taken(phone.phone) : UNKNOWN,
    openingHours: hours ? taken(hours) : UNKNOWN,
    cuisine: cuisineFromPlace(place),
  };
}

/** Betriebe, für die keine Demo entsteht. */
export function placeDemoBlocker(place: Pick<PlaceData, "businessStatus">): string | null {
  if (place.businessStatus === "CLOSED_PERMANENTLY") return "Laut Google dauerhaft geschlossen";
  return null;
}
