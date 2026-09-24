import type { RestaurantProfile } from "@/domain/gastronomy/restaurant-profile";

import { TIFFINSTUBE_RAO_SLUG, tiffinstubeRaoProfile } from "./narrative-demos/tiffinstube-rao.fixture";
import { showcaseBySlug } from "./showcases";

// Beispielhäuser, mit denen die Anfrage-Probe den ganzen Weg bis ins Postfach prüft (ADR 0023):
// alle 14 Beispielseiten und die narrative Demo. Ihre Angaben bleiben „fiktiv“.

export function probeProfile(slug: string): RestaurantProfile | null {
  if (slug === TIFFINSTUBE_RAO_SLUG) return tiffinstubeRaoProfile;
  return showcaseBySlug(slug)?.profile ?? null;
}
