import type { CreativeDirection } from "@/domain/design/creative-direction";
import type { DesignDirection } from "@/domain/design/design-direction";
import type { ImageSlot } from "@/domain/design/image-plan";
import type { CuisineId } from "@/domain/gastronomy/cuisines";

import { DIRECTIONS, directionById } from "./directions";

// Lead-Demos (ADR 0021): Design Direction nach vorgeschlagener Küche, dazu eine neutrale
// Dramaturgie. Sie ist bewusst ein Gesprächsanfang, keine Creative Direction für das Haus –
// die entsteht erst im Briefing.

/** Ohne erkannte Küche: das ruhige Bistro-System, das zu fast jedem Haus passt. */
const FALLBACK_DIRECTION = "bistro-leinen";

export function directionForCuisine(cuisine: CuisineId | null): DesignDirection {
  const match = cuisine ? DIRECTIONS.find((direction) => (direction.cuisines as readonly string[]).includes(cuisine)) : undefined;
  return match ?? directionById(FALLBACK_DIRECTION);
}

export function leadCreativeDirection(direction: DesignDirection): CreativeDirection {
  const split = direction.layout.hero === "split-editorial";
  const withGallery = direction.layout.gallery !== "none";
  const dramaturgy: CreativeDirection["dramaturgy"] = [
    { section: "hero", weight: "gross", why: "Name und Ort zuerst – der Betrieb soll sich auf den ersten Blick wiederfinden." },
    ...(split ? [] : [{ section: "specials" as const, weight: "normal" as const, why: "Zeigt, wo eine Tageskarte oder ein Mittagstisch stehen würde." }]),
    { section: "menu", weight: "gross", why: "Die Karte ist der häufigste Grund für einen Besuch der Website." },
    { section: "story", weight: "normal", why: "Hier entsteht im Gespräch die Geschichte des Hauses." },
    ...(withGallery ? [{ section: "imageSlots" as const, weight: "normal" as const, why: "Zeigt, welche Fotos das Haus braucht – als Aufgabe, nicht als Stockfoto." }] : []),
    { section: "hours", weight: "normal", why: "Öffnungszeiten, sofern Google sie kennt; sonst die Frage dazu." },
    { section: "request", weight: "normal", why: "So sähe die Tischanfrage per E-Mail aus – ohne Reservierungssystem." },
    { section: "visit", weight: "normal", why: "Adresse und Telefon, damit der Weg zum Haus kurz bleibt." },
  ];
  return {
    idea: "Konzeptentwurf auf Grundlage öffentlich sichtbarer Angaben – der Rest entsteht im Gespräch.",
    effect: "Der Betrieb erkennt sich wieder und sieht an den Platzhaltern, welche Angaben noch fehlen.",
    metaphor: `Die Design Direction „${direction.name}“ als Ausgangspunkt, noch ohne eigene Handschrift.`,
    dramaturgy,
    signatures: [],
    omissions: ["Keine erfundenen Gerichte, Preise, Geschichten oder Stimmen", "Keine Google-Fotos und keine Rezensionen"],
  };
}

/** Foto-Aufgaben für jede Lead-Demo – nie mit Bildern gefüllt. */
export const LEAD_IMAGE_SLOTS: readonly ImageSlot[] = [
  { id: "gastraum", subject: "raum", role: "stimmung", motif: "Ihr Gastraum, wie Gäste ihn beim Hereinkommen sehen", alt: "Gastraum des Restaurants", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  { id: "hausgericht", subject: "gericht", role: "beweis", motif: "Das Gericht, für das man zu Ihnen kommt, auf Ihrem Teller", alt: "Hausgericht des Restaurants", crop: { desktop: "1:1", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
  { id: "kueche", subject: "team", role: "beweis", motif: "Ihre Küche bei der Arbeit – Hände, Herd, Handgriff", alt: "Küche des Restaurants bei der Arbeit", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
];
