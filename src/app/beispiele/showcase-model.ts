import type { Showcase } from "@/catalog/showcases";
import type { SiteModel } from "@/compositions/restaurant/model";

/** Ein Beispielbetrieb als Eingabe der Restaurant-Komposition – immer im Kontext „showcase“. */
export function showcaseModel(showcase: Showcase): SiteModel {
  return {
    context: { kind: "showcase" },
    profile: showcase.profile,
    direction: showcase.direction,
    creative: showcase.creative,
    imageSlots: showcase.imageSlots,
  };
}

export const SHOWCASE_CHROME = {
  overviewHref: "/beispiele",
  impressumHref: "/beispiele/impressum",
  datenschutzHref: "/beispiele/datenschutz",
} as const;
