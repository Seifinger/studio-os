import { defineShowcase, week } from "../define";

export const baanNoi = defineShowcase({
  slug: "garkueche-baan-noi",
  direction: "garkueche-feierabend",
  facts: {
    name: "Garküche Baan Noi",
    locality: "Weidenstett",
    cuisine: "thailaendisch",
    address: { street: "Gerberstraße 5", postalCode: "00913", locality: "Weidenstett" },
    phone: "089 99998 107",
    conceptShort: "Thailändische Garküche für nach der Arbeit: sechs Gerichte, ein Wok, Currypasten aus dem Mörser.",
    story:
      "Noi Srisuk hat zwölf Jahre in Bangkoker Garküchen gekocht, bevor sie 2021 in der Gerberstraße ein ehemaliges Schuhgeschäft übernahm. Die Karte ist absichtlich kurz: sechs Gerichte, dazu eines, das jede Woche wechselt. Die Currypasten stampft sie morgens im Steinmörser, die Kräuter zieht ein Gärtner aus dem Nachbarort für sie.",
    usp: "Currypasten aus dem Mörser, nicht aus dem Glas – und nach zehn Minuten steht das Essen auf dem Tresen.",
    specials: ["Diese Woche: Khao Soi mit Hähnchenkeule", "Dazu: eingelegter Senfkohl und Limette"],
    signatureDishes: ["Pad Kra Pao mit Spiegelei", "Grünes Curry aus dem Mörser", "Som Tam"],
    menu: {
      sections: [
        {
          title: "Aus dem Wok",
          items: [
            { name: "Pad Kra Pao", description: "Schweinehack, Thai-Basilikum, Chili, Spiegelei", priceCents: 1350, dietary: ["scharf"], allergens: ["soja", "fisch", "eier", "gluten"] },
            { name: "Pad See Ew", description: "breite Reisnudeln, Brokkoli, Ei", priceCents: 1300, allergens: ["soja", "eier", "gluten"] },
            { name: "Pad Thai mit Tofu", priceCents: 1250, dietary: ["vegetarisch"], allergens: ["erdnuesse", "soja", "eier"] },
          ],
        },
        {
          title: "Aus dem Mörser",
          items: [
            { name: "Grünes Curry", description: "Hähnchen, Thai-Aubergine, Kokos", priceCents: 1450, dietary: ["scharf"], allergens: ["fisch", "krebstiere"] },
            { name: "Massaman-Curry", description: "Rind, Kartoffel, Erdnuss", priceCents: 1550, allergens: ["erdnuesse", "fisch"] },
            { name: "Som Tam", description: "grüne Papaya, Limette, Erdnuss", priceCents: 950, dietary: ["scharf"], allergens: ["erdnuesse", "fisch", "krebstiere"] },
          ],
        },
        {
          title: "Dazu",
          items: [
            { name: "Klebreis im Körbchen", priceCents: 350, dietary: ["vegan"], allergens: [] },
            { name: "Mango mit Klebreis", description: "nur solange es reife Mangos gibt", priceCents: 700, dietary: ["vegan"], allergens: [] },
          ],
        },
      ],
      note: "Schärfe auf Wunsch milder. Alle Gerichte auch zum Mitnehmen.",
    },
    openingHours: week({ mo: "17:00-22:00", di: "17:00-22:00", mi: "17:00-22:00", do: "17:00-22:00", fr: "17:00-22:30" }, "Wochenende geschlossen – dann geht Noi auf den Markt."),
    serviceNotes: ["Keine Reservierungen: Die sechs Tische werden frei vergeben.", "Abholung am Fenster zur Gerberstraße."],
    requestChannels: { table: false, pickup: true },
    primaryAction: "pickupRequest",
    priceLevel: "budget",
  },
  creative: {
    idea: "Die Garküche als Lampe über dem Wok: Dunkel, ein Orange, kurze laute Wörter.",
    effect: "Man sieht die Wochenkarte und den Weg zur Abholung, bevor man überhaupt scrollt.",
    metaphor: "Eine orange Lampe über dem Wok in einer dunklen Gasse, die Karte als Zettel am Fenster.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Kurzer, lauter Name; wer hungrig ist, liest nicht." },
      { section: "specials", weight: "normal", title: "Diese Woche aus dem Wok", why: "Das Wochengericht ist der Grund, wiederzukommen." },
      { section: "menu", weight: "gross", title: "Sechs Gerichte, ein Wok", why: "Die kurze Karte passt auf Zettel; jeder mit Preis." },
      { section: "request", weight: "gross", title: "Vorbestellen, am Fenster abholen", why: "Feierabend heißt: keine Wartezeit." },
      { section: "serviceNotes", weight: "klein", title: "Keine Reservierungen", why: "Ehrlich sagen, wie es läuft, erspart Enttäuschung." },
      { section: "imageSlots", weight: "normal", title: "Mörser, Wok, Fenster", why: "Handwerk am Mörser ist das Bild, das die Karte belegt." },
      { section: "hours", weight: "normal", title: "Montag bis Freitag, ab 17 Uhr", why: "Die Zeiten sind ungewöhnlich und müssen auffallen." },
      { section: "story", weight: "klein", title: "Von Bangkok in die Gerberstraße", why: "Kurz, weil die Gäste wegen des Essens kommen." },
      { section: "visit", weight: "normal", title: "Gerberstraße 5", why: "Adresse und Abholfenster." },
    ],
    signatures: [{ title: "Wochengericht als Zettel", description: "Das Wochengericht steht als eingerahmter Zettel direkt unter dem Namen.", evidence: ["specials"] }],
    omissions: ["Keine Elefanten, keine Tempel, keine Buddha-Figuren", "Kein Bambus-Hintergrund", "Keine Schärfe-Symbole aus Chilischoten"],
  },
  imageSlots: [
    { id: "moerser", subject: "team", role: "beweis", motif: "Noi stampft Currypaste im Steinmörser, Kräuter daneben", alt: "Noi Srisuk stampft Currypaste im Steinmörser", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "wok", subject: "detail", role: "stimmung", motif: "Flamme unter dem Wok, Pad Kra Pao im Schwung", alt: "Pad Kra Pao im Wok über hoher Flamme", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 55 } }, asset: null },
    { id: "fenster", subject: "haus", role: "orientierung", motif: "Das Abholfenster zur Gerberstraße am Abend, mit Licht von innen", alt: "Abholfenster der Garküche an der Gerberstraße", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
