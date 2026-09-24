import { z } from "zod";

import { factSchema } from "../provenance/fact";
import { ACTION_TYPES } from "./actions";
import { externalBookingSchema } from "./booking";
import { openingHoursSchema } from "./opening-hours";
import { phoneNumberSchema } from "./phone";

// Betriebsprofil: alle Angaben über einen Betrieb, jede mit Herkunft (ADR 0015, 0017).
// Branchenneutral – Restaurant-Felder ergänzt src/domain/gastronomy/restaurant-profile.ts.
// Marke, Medien und Stil folgen in ROADMAP Stufe 3.

const text = (max: number) => z.string().trim().min(1).max(max);
const textList = (max: number) => z.array(text(max)).min(1).max(20);

export const postalAddressSchema = z.object({
  street: text(120),
  postalCode: z.string().regex(/^\d{5}$/, { error: "fünfstellige Postleitzahl" }),
  locality: text(80),
});
export type PostalAddress = z.infer<typeof postalAddressSchema>;

export const requestChannelsSchema = z
  .object({ table: z.boolean(), pickup: z.boolean() })
  .refine((channels) => channels.table || channels.pickup, { error: "Mindestens eine Anfrageart wählen" });
export type RequestChannels = z.infer<typeof requestChannelsSchema>;

export const guestQuoteSchema = z.object({
  text: text(400),
  author: text(80),
  /** Woher das Zitat stammt (z. B. „Gästebuch 2025“). Nie Google-Rezensionen (ADR 0013). */
  origin: text(120),
});

export const PRICE_LEVELS = ["budget", "mid", "upscale"] as const;

export const businessProfileShape = {
  name: factSchema(text(120)),
  locality: factSchema(text(80)),
  address: factSchema(postalAddressSchema),
  phone: factSchema(phoneNumberSchema),
  whatsapp: factSchema(phoneNumberSchema),
  email: factSchema(z.email({ error: "keine gültige E-Mail-Adresse" })),
  openingHours: factSchema(openingHoursSchema),
  onlineBooking: factSchema(externalBookingSchema),
  requestChannels: factSchema(requestChannelsSchema),
  conceptShort: factSchema(text(200)),
  story: factSchema(text(2000)),
  usp: factSchema(text(300)),
  proofs: factSchema(textList(200)),
  audiences: factSchema(textList(80)),
  occasions: factSchema(textList(80)),
  priceLevel: factSchema(z.enum(PRICE_LEVELS)),
  atmosphere: factSchema(text(300)),
  primaryAction: factSchema(z.enum(ACTION_TYPES)),
  serviceNotes: factSchema(textList(200)),
  guestQuotes: factSchema(z.array(guestQuoteSchema).min(1).max(12)),
  awards: factSchema(textList(200)),
  publicationApproved: factSchema(z.literal(true)),
};

/** Unbekannte Felder sind ein Fehler, damit sich kein Tippfehler als „unbekannt“ tarnt. */
export const businessProfileSchema = z.strictObject(businessProfileShape);
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
