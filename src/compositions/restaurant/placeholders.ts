import { BRIEFING_QUESTIONS } from "@/domain/briefing/questions";

import type { RenderProfile } from "./model";

// Platzhalter in Demos sind zugleich die Fragen fürs Briefing: Wer die Demo sieht, sieht, was fehlt.

const TITLES: Partial<Record<keyof RenderProfile, string>> = {
  conceptShort: "Hier steht in einem Satz, was Ihr Haus ausmacht",
  story: "Hier steht die Geschichte Ihres Hauses",
  menu: "Hier steht Ihre Speisekarte – mit Preisen und Allergenen",
  specials: "Hier steht Ihre Tageskarte oder Ihr Mittagstisch",
  signatureDishes: "Hier stehen die Gerichte, für die man zu Ihnen kommt",
  openingHours: "Hier stehen Ihre Öffnungszeiten",
  serviceNotes: "Hier stehen Ihre Hausregeln",
  address: "Hier steht Ihre Adresse",
  phone: "Hier steht Ihre Telefonnummer",
  guestQuotes: "Hier stehen Stimmen Ihrer Gäste – mit Herkunft, nie aus Google-Rezensionen",
};

export function placeholderFor(field: keyof RenderProfile): { readonly title: string; readonly question: string } {
  const question = BRIEFING_QUESTIONS.find((entry) => entry.field === field)?.question ?? "";
  return { title: TITLES[field] ?? "Angabe folgt", question };
}
