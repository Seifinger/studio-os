import { z } from "zod";

// Bildplan (DESIGN.md §5, ADR 0019). Neu geschrieben nach gastro-webagentur
// v2/assets-pipeline/bildplan.js: Motiv, Rolle, Zuschnitt desktop/mobil, Fokus, Alt-Text,
// Herkunft, Rechte, Freigabe. Ein Platz ohne geeignetes Bild bleibt ein sichtbarer Bildplatz.

const ratio = z.enum(["21:9", "16:9", "3:2", "4:5", "1:1"]);
const percent = z.number().min(0).max(100);

export const imageAssetSchema = z.object({
  src: z.string().min(1),
  origin: z.enum(["eigen", "beauftragt", "ki", "stock"]),
  rights: z.string().trim().min(3),
  approved: z.boolean(),
  /** Bei Gerichtsfotos: welches Gericht das Bild tatsächlich zeigt. */
  showsDish: z.string().trim().min(1).optional(),
});

export const imageSlotSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  subject: z.enum(["gericht", "raum", "team", "haus", "detail", "umgebung"]),
  role: z.enum(["beweis", "stimmung", "orientierung"]),
  /** Was das Bild zeigen soll – zugleich die Foto-Aufgabe für den Betrieb. */
  motif: z.string().trim().min(8).max(160),
  /** Bei Gerichtsplätzen: das Gericht laut Karte. */
  dish: z.string().trim().min(1).optional(),
  alt: z.string().trim().min(8).max(200),
  crop: z.object({ desktop: ratio, mobile: ratio, focus: z.object({ x: percent, y: percent }) }),
  asset: imageAssetSchema.nullable(),
});

export type ImageSlot = z.infer<typeof imageSlotSchema>;

export type ImageSlotOutcome =
  | { readonly show: "image"; readonly slot: ImageSlot; readonly asset: NonNullable<ImageSlot["asset"]> }
  | { readonly show: "slot"; readonly slot: ImageSlot; readonly reason: string };

const OWN_ORIGINS = new Set(["eigen", "beauftragt"]);

/** Entscheidet, ob ein Bild gezeigt werden darf – sonst bleibt der Bildplatz mit Begründung sichtbar. */
export function resolveImageSlot(slot: ImageSlot): ImageSlotOutcome {
  const { asset } = slot;
  if (!asset) return { show: "slot", slot, reason: "Noch kein Foto" };
  if (!asset.approved) return { show: "slot", slot, reason: "Nutzung noch nicht freigegeben" };
  if (/^(?:https?:)?\/\//i.test(asset.src)) return { show: "slot", slot, reason: "Bilder werden selbst gehostet, keine Hotlinks" };
  if (["raum", "team", "haus"].includes(slot.subject) && !OWN_ORIGINS.has(asset.origin)) {
    return { show: "slot", slot, reason: "Haus, Team und Raum nur mit eigenen oder beauftragten Fotos (S10)" };
  }
  if (slot.subject === "gericht") {
    if (asset.origin === "ki") return { show: "slot", slot, reason: "Gerichte nie als KI-Bild" };
    if (!OWN_ORIGINS.has(asset.origin) && asset.showsDish !== slot.dish) {
      return { show: "slot", slot, reason: "Stockfoto zeigt nicht das genannte Gericht (S10)" };
    }
  }
  return { show: "image", slot, asset };
}
