import { type NarrativeConfig, narrativeConfigSchema } from "@studio/design-system/composition/narrative-editorial";

import { fictionProfile, week } from "../showcases/define";

// FIXTURE – frei erfundenes Haus für die erste Demo im Basissystem narrative-editorial (ADR 0022).
// Alle Angaben sind ausgedacht und tragen den Status „fiktiv“; Rufnummer aus 089 99998 1xx,
// Postleitzahl 00xxx. Keine Inhalte, Bilder oder Strukturen aus der Studienreferenz.

export const TIFFINSTUBE_RAO_SLUG = "tiffinstube-rao";
export const TIFFINSTUBE_RAO_THEME = "indian-bombay-story";

export const tiffinstubeRaoProfile = fictionProfile(TIFFINSTUBE_RAO_SLUG, {
  name: "Tiffinstube Rao",
  locality: "Aubrunn",
  cuisine: "indisch",
  address: { street: "Färbergasse 8", postalCode: "00318", locality: "Aubrunn" },
  phone: "089 99998 115",
  conceptShort: "Hausküche aus Mumbai in einer alten Färberei: mittags Tiffin in Stahldosen, abends Thali am langen Tisch.",
  usp: "Hier kommt auf den Tisch, was in Mumbai zu Hause gekocht wird: Dal, Gemüse der Woche und Brot vom heißen Blech.",
  story:
    "Meera Rao ist in einer Mietwohnung in Mumbai aufgewachsen, in der morgens um sechs der Schnellkochtopf pfiff. Ihre Mutter packte jeden Tag vier Tiffin-Dosen für die Familie, und Meera lernte dabei, was in welches Fach gehört.\n\n2019 kam sie nach Aubrunn, 2023 eröffnete sie mit Jonas Keller die Tiffinstube in der ehemaligen Färberei. Gekocht wird, was es auf dem Wochenmarkt gibt, mit Gewürzen, die Meera jeden Morgen selbst röstet.",
  proofs: [
    "Kreuzkümmel, Koriander und Kardamom werden jeden Morgen in der Eisenpfanne geröstet und von Hand gemahlen.",
    "Chapati rollt Meera für jede Bestellung frisch aus und backt es auf der offenen Flamme.",
    "Das Dal köchelt vier Stunden, bevor heißes Ghee mit Kreuzkümmel darübergegossen wird.",
  ],
  signatureDishes: ["Dal Tadka mit Jeera-Reis", "Pav Bhaji vom heißen Blech", "Masala-Chai aus dem Topf"],
  atmosphere: "Ein langer Tisch aus Eiche für zwölf, Terrazzoboden aus der alten Färberei und drei hohe Fenster zur Gasse.",
  menu: {
    sections: [
      {
        title: "Mittags im Tiffin",
        note: "Dienstag bis Freitag, 11:30 bis 14:30 Uhr. Vier Fächer, jeden Tag neu.",
        items: [
          { name: "Tiffin mit Dal", description: "Dal, Gemüse der Woche, Jeera-Reis, Chapati", priceCents: 1350, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
          { name: "Tiffin mit Hähnchen-Curry", description: "Curry mit Tomate und Ingwer, Gemüse, Reis, Chapati", priceCents: 1500, allergens: ["gluten", "milch"] },
        ],
      },
      {
        title: "Vom heißen Blech",
        items: [
          { name: "Pav Bhaji", description: "Gemüse, lange geschmort, mit gebutterten Brötchen", priceCents: 1150, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
          { name: "Kanda Poha", description: "Reisflocken mit Zwiebel, Curryblättern und Erdnüssen", priceCents: 950, dietary: ["vegan"], allergens: ["erdnuesse"] },
          { name: "Misal Pav", description: "Sprossenbohnen-Curry, knusprige Linsen, Brötchen", priceCents: 1100, dietary: ["vegetarisch", "scharf"], allergens: ["gluten", "milch"] },
        ],
      },
      {
        title: "Abends am langen Tisch",
        note: "Ab 17:30 Uhr.",
        items: [
          { name: "Thali Rao", description: "Sieben Schalen: Dal, zwei Currys, Raita, Pickle, Reis, Chapati", priceCents: 2600, dietary: ["vegetarisch"], allergens: ["gluten", "milch", "senf"] },
          { name: "Kokos-Fischcurry", description: "Seelachs, Kokosmilch, Kokum, Reis", priceCents: 2250, allergens: ["fisch"] },
        ],
      },
      {
        title: "Süßes und Chai",
        items: [
          { name: "Shrikhand", description: "abgetropfter Joghurt mit Kardamom und Safran", priceCents: 650, dietary: ["vegetarisch"], allergens: ["milch", "schalenfruechte"] },
          { name: "Masala-Chai", description: "im Topf gekocht", priceCents: 420, dietary: ["vegetarisch"], allergens: ["milch"] },
        ],
      },
    ],
    note: "Alle Preise in Euro inklusive Mehrwertsteuer. Die Schärfe richtet die Küche nach Ihrem Wunsch.",
  },
  openingHours: week(
    { di: "11:30-14:30 17:30-22:00", mi: "11:30-14:30 17:30-22:00", do: "11:30-14:30 17:30-22:00", fr: "11:30-14:30 17:30-22:30", sa: "17:30-22:30" },
    "Mittags Tiffin, abends Thali. Küche bis eine Stunde vor Schluss.",
  ),
  serviceNotes: [
    "Am langen Tisch sitzen bis zu zwölf Personen – auch als Gruppe anfragbar.",
    "Tiffin zum Mitnehmen in der eigenen Stahldose: Wer sie zurückbringt, zahlt einen Euro weniger.",
  ],
  requestChannels: { table: true, pickup: false },
  primaryAction: "tableRequest",
  priceLevel: "mid",
});

export const tiffinstubeRaoNarrative: NarrativeConfig = narrativeConfigSchema.parse({
  primaryAction: "tableRequest",
  secondaryAction: "menu",
  sequence: [
    { kind: "hero", act: "night", why: "Ankommen am Abend: der Name wie ein gemaltes Ladenschild, darunter die Zeiten." },
    { kind: "claim", act: "paper", why: "Ein Satz, der nur für dieses Haus stimmt – Hausküche statt Restaurantküche." },
    { kind: "story", act: "paper", title: "Vier Dosen, jeden Morgen", why: "Die Tiffin-Dosen der Mutter erklären das Mittagsangebot und den Namen." },
    { kind: "craft", act: "paper", title: "Was hier von Hand passiert", why: "Drei Handgriffe belegen die Behauptung, bevor die Karte kommt." },
    { kind: "menu", act: "paper", title: "Mittags Tiffin, abends Thali", why: "Die Karte folgt dem Tag; Kategorien sind direkt anspringbar." },
    { kind: "atmosphere", act: "night", title: "Die alte Färberei am Abend", why: "Der lange Tisch ist der Raum des Hauses – ein zweiter dunkler Moment." },
    { kind: "reservation", act: "paper", title: "Einen Platz am langen Tisch anfragen", why: "Die Anfrage steht dort, wo die Entscheidung fällt." },
    { kind: "visit", act: "paper", title: "Färbergasse 8", why: "Adresse und Zeiten ohne Umweg." },
    { kind: "closing", act: "night", title: "Ab halb sechs ist der lange Tisch gedeckt.", why: "Eine letzte, konkrete Einladung statt eines Slogans." },
  ],
});
