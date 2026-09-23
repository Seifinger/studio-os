import type { z } from "zod";

import { type PhoneNumber, parsePhoneNumber } from "@/domain/content/phone";
import { WEEKDAYS, type OpeningHours, type Weekday } from "@/domain/content/opening-hours";
import { type CreativeDirection, creativeDirectionSchema } from "@/domain/design/creative-direction";
import type { DesignDirection } from "@/domain/design/design-direction";
import { type ImageSlot, imageSlotSchema } from "@/domain/design/image-plan";
import { type RestaurantProfile, restaurantProfileSchema } from "@/domain/gastronomy/restaurant-profile";

import { type DirectionId, directionById } from "../directions";

// Beispielbetriebe (ROADMAP Stufe 4, ADR 0020): frei erfundene Häuser, eines je Küche. Jede Angabe
// trägt den Status „fiktiv“ – das Fakten-Gate lässt sie nur auf Beispielseiten zu.
// Telefonnummern stammen aus dem Rufnummernbereich für Film und Fernsehen (089 99998 …),
// Postleitzahlen beginnen mit 00 und sind in Deutschland nicht vergeben.

type ProfileInput = z.input<typeof restaurantProfileSchema>;
type FictionValue<K extends keyof ProfileInput> = Extract<NonNullable<ProfileInput[K]>, { status: "fiktiv" }>["value"];

/** Rohwerte eines Beispielbetriebs; Telefonnummern als Text, wie sie auf der Karte stehen. */
export type ShowcaseFacts = {
  readonly [K in keyof ProfileInput]?: K extends "phone" | "whatsapp" ? string : FictionValue<K>;
};

export type ShowcaseInput = {
  readonly slug: string;
  readonly direction: DirectionId;
  readonly facts: ShowcaseFacts;
  readonly creative: z.input<typeof creativeDirectionSchema>;
  readonly imageSlots: readonly z.input<typeof imageSlotSchema>[];
};

export type Showcase = {
  readonly slug: string;
  readonly direction: DesignDirection;
  readonly profile: RestaurantProfile;
  readonly creative: CreativeDirection;
  readonly imageSlots: readonly ImageSlot[];
};

export class ShowcaseError extends Error {
  override readonly name = "ShowcaseError";
}

const FICTIONAL_PHONE = /^\+4989999981\d{2}$/;

function phone(slug: string, input: string): PhoneNumber {
  const parsed = parsePhoneNumber(input);
  if (!parsed.ok) throw new ShowcaseError(`${slug}: Telefonnummer „${input}“ – ${parsed.reason}`);
  if (!FICTIONAL_PHONE.test(parsed.phone.e164)) {
    throw new ShowcaseError(`${slug}: Beispielbetriebe nutzen nur Rufnummern aus 089 99998 1xx`);
  }
  return parsed.phone;
}

/** Prüft einen Beispielbetrieb vollständig. Ein Fehler bricht den Build ab, statt still zu rendern. */
export function defineShowcase(input: ShowcaseInput): Showcase {
  const { slug } = input;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ShowcaseError(`Ungültiger Slug: ${slug}`);

  const raw: Record<string, { status: "fiktiv"; value: unknown }> = {};
  for (const [field, value] of Object.entries(input.facts)) {
    if (value === undefined) continue;
    const resolved = (field === "phone" || field === "whatsapp") && typeof value === "string" ? phone(slug, value) : value;
    raw[field] = { status: "fiktiv", value: resolved };
  }

  const profile = restaurantProfileSchema.safeParse(raw);
  if (!profile.success) throw new ShowcaseError(`${slug}: Profil ungültig – ${profile.error.message}`);
  const postalCode = profile.data.address.value?.postalCode;
  if (postalCode !== undefined && !postalCode.startsWith("00")) {
    throw new ShowcaseError(`${slug}: Beispielbetriebe nutzen nur Postleitzahlen mit 00 (nicht vergeben)`);
  }

  const creative = creativeDirectionSchema.safeParse(input.creative);
  if (!creative.success) throw new ShowcaseError(`${slug}: Creative Direction ungültig – ${creative.error.message}`);

  const imageSlots = input.imageSlots.map((slot) => {
    const parsed = imageSlotSchema.safeParse(slot);
    if (!parsed.success) throw new ShowcaseError(`${slug}: Bildplatz ungültig – ${parsed.error.message}`);
    return parsed.data;
  });

  return { slug, direction: directionById(input.direction), profile: profile.data, creative: creative.data, imageSlots };
}

/**
 * Wochenplan aus kurzer Schreibweise: `{ di: "11:30-14:00 17:30-22:00" }`.
 * Nicht genannte Tage sind Ruhetage.
 */
export function week(days: Partial<Record<Weekday, string>>, note?: string): OpeningHours {
  const schedule = Object.fromEntries(
    WEEKDAYS.map((day) => [
      day,
      (days[day] ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((range) => {
          const [from = "", to = ""] = range.split("-");
          return { from, to };
        }),
    ]),
  ) as OpeningHours["week"];
  return note ? { week: schedule, note } : { week: schedule };
}
