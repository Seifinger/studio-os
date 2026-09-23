import { directionForCuisine, LEAD_IMAGE_SLOTS, leadCreativeDirection } from "@/catalog/lead-demos";
import type { PlaceFacts } from "@/domain/leads/place-profile";
import { restaurantProfileSchema } from "@/domain/gastronomy/restaurant-profile";

import type { RenderProfile, SiteModel } from "./model";

// Eingabe einer Lead-Demo: alle Angaben unbekannt (→ Platzhalter mit Briefing-Frage), darüber
// die live von Google übernommenen Angaben. Die Küche ist nur ein Vorschlag (ADR 0021).

export type LeadDemoInput = {
  readonly facts: PlaceFacts;
  readonly rating: { readonly value: number; readonly count: number } | null;
};

export function leadDemoModel({ facts, rating }: LeadDemoInput): SiteModel {
  const empty = restaurantProfileSchema.parse({});
  const profile: RenderProfile = { ...empty, ...facts };
  const direction = directionForCuisine(facts.cuisine.value);
  return {
    context: { kind: "leadDemo" },
    profile,
    direction,
    creative: leadCreativeDirection(direction),
    imageSlots: LEAD_IMAGE_SLOTS,
    ...(rating ? { googleLive: { rating } } : {}),
  };
}
