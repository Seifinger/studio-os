import type { businessProfileShape } from "../content/business-profile";
import type { restaurantProfileShape } from "../gastronomy/restaurant-profile";

// Fragenkatalog fürs Kundengespräch: zu jedem Profilfeld genau eine Frage.
// Inhaltlich übernommen und überarbeitet aus gastro-webagentur v2/briefing/briefing.js (FELDER).
// Marke, Medien und Stil kommen mit ROADMAP Stufe 3 dazu.

type GeneralField = keyof typeof businessProfileShape;
type RestaurantField = Exclude<keyof typeof restaurantProfileShape, GeneralField>;

export type BriefingGroup = "betrieb" | "konzept" | "gaeste" | "positionierung" | "karte" | "aktion" | "belege" | "freigabe";

export type BriefingQuestion =
  | { readonly field: GeneralField; readonly sector: "allgemein"; readonly group: BriefingGroup; readonly question: string }
  | { readonly field: RestaurantField; readonly sector: "gastronomie"; readonly group: BriefingGroup; readonly question: string };

export const BRIEFING_QUESTIONS: readonly BriefingQuestion[] = [
  { field: "name", sector: "allgemein", group: "betrieb", question: "Wie heißt Ihr Betrieb genau – so, wie es auf dem Schild steht?" },
  { field: "locality", sector: "allgemein", group: "betrieb", question: "In welchem Ort liegt Ihr Betrieb?" },
  { field: "address", sector: "allgemein", group: "betrieb", question: "Wie lautet die Adresse?" },
  { field: "phone", sector: "allgemein", group: "betrieb", question: "Unter welcher Nummer nehmen Sie Reservierungen und Anfragen an?" },
  { field: "whatsapp", sector: "allgemein", group: "betrieb", question: "Betreuen Sie WhatsApp aktiv – und unter welcher Nummer?" },
  { field: "email", sector: "allgemein", group: "betrieb", question: "An welche E-Mail-Adresse sollen Anfragen von der Website gehen?" },
  { field: "openingHours", sector: "allgemein", group: "betrieb", question: "Wann haben Sie geöffnet – auch Ruhetage und Küchenschluss?" },
  { field: "cuisine", sector: "gastronomie", group: "betrieb", question: "Welche Küche kochen Sie?" },
  { field: "conceptShort", sector: "allgemein", group: "konzept", question: "Was ist Ihr Betrieb in einem Satz – so, wie Stammgäste ihn beschreiben würden?" },
  { field: "story", sector: "allgemein", group: "konzept", question: "Seit wann gibt es das Haus, wer steht in der Küche, was ist die Geschichte?" },
  { field: "usp", sector: "allgemein", group: "konzept", question: "Was machen Sie, das die anderen im Ort nicht machen?" },
  { field: "proofs", sector: "allgemein", group: "konzept", question: "Woran sieht oder schmeckt der Gast das?" },
  { field: "audiences", sector: "allgemein", group: "gaeste", question: "Wer kommt zu Ihnen?" },
  { field: "occasions", sector: "allgemein", group: "gaeste", question: "Zu welchen Anlässen kommen Ihre Gäste?" },
  { field: "priceLevel", sector: "allgemein", group: "positionierung", question: "Wie würden Sie Ihre Preise einordnen: günstig, mittel oder gehoben?" },
  { field: "atmosphere", sector: "allgemein", group: "positionierung", question: "Wie soll es sich anfühlen, wenn man hereinkommt?" },
  { field: "signatureDishes", sector: "gastronomie", group: "karte", question: "Welche zwei, drei Gerichte muss man bei Ihnen gegessen haben?" },
  { field: "menu", sector: "gastronomie", group: "karte", question: "Bitte die aktuelle Speisekarte mit Preisen und Allergenen – ein Foto oder PDF reicht." },
  { field: "specials", sector: "gastronomie", group: "karte", question: "Gibt es eine Tageskarte, einen Mittagstisch oder eine saisonale Karte?" },
  { field: "primaryAction", sector: "allgemein", group: "aktion", question: "Was sollen Gäste auf der Website vor allem tun: anrufen, anfragen, online reservieren oder die Karte ansehen?" },
  { field: "onlineBooking", sector: "allgemein", group: "aktion", question: "Nutzen Sie schon ein Reservierungssystem wie resmio, OpenTable oder Quandoo?" },
  { field: "requestChannels", sector: "allgemein", group: "aktion", question: "Sollen Gäste über die Website einen Tisch oder eine Abholung anfragen können?" },
  { field: "serviceNotes", sector: "allgemein", group: "aktion", question: "Gibt es Regeln – Walk-in, Gruppen ab einer bestimmten Größe, keine Reservierung am Wochenende?" },
  { field: "guestQuotes", sector: "allgemein", group: "belege", question: "Dürfen wir einzelne Gästestimmen zitieren – mit Quelle und Einverständnis?" },
  { field: "awards", sector: "allgemein", group: "belege", question: "Gibt es Auszeichnungen oder Presseberichte?" },
  { field: "publicationApproved", sector: "allgemein", group: "freigabe", question: "Ist die Website als offizieller Auftritt beauftragt und freigegeben?" },
];
