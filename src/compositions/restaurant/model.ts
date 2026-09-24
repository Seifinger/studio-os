import type { CreativeDirection } from "@/domain/design/creative-direction";
import type { DesignDirection } from "@/domain/design/design-direction";
import type { ImageSlot } from "@/domain/design/image-plan";
import type { RestaurantProfile } from "@/domain/gastronomy/restaurant-profile";
import type { Fact } from "@/domain/provenance/fact";
import { gate, type GateContext } from "@/domain/provenance/gate";

// Eingabe einer Restaurant-Komposition. Das Profil kann aus einer gespeicherten Datei (Showcase)
// oder live aus Google Places (Lead-Demo) stammen – gelesen wird es nur über das Fakten-Gate.

export type RenderProfile = {
  readonly [K in keyof RestaurantProfile]: Fact<NonNullable<RestaurantProfile[K]["value"]>>;
};

export type SiteModel = {
  readonly context: GateContext;
  readonly profile: RenderProfile;
  readonly direction: DesignDirection;
  readonly creative: CreativeDirection;
  readonly imageSlots: readonly ImageSlot[];
  /** Live angezeigte Google-Daten in Lead-Demos – verlangen Quellenangabe (ADR 0013, 0021). */
  readonly googleLive?: { readonly rating?: { readonly value: number; readonly count: number } };
};

export type Shown<T> =
  | { readonly kind: "value" | "draft"; readonly value: T }
  | { readonly kind: "placeholder" }
  | { readonly kind: "omit" };

/** Liest eine Angabe über das Gate. Verstöße hat `assertRenderable` vorher abgefangen. */
export function show<T>(fact: Fact<T>, context: GateContext): Shown<T> {
  const outcome = gate(fact, context);
  if (outcome.show === "value") return { kind: "value", value: outcome.value };
  if (outcome.show === "draft") return { kind: "draft", value: outcome.value };
  if (outcome.show === "placeholder") return { kind: "placeholder" };
  return { kind: "omit" };
}

export const isVisible = <T>(shown: Shown<T>): shown is Extract<Shown<T>, { value: T }> =>
  shown.kind === "value" || shown.kind === "draft";
