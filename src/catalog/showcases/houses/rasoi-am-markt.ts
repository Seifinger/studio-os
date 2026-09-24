import { defineShowcase, week } from "../define";

export const rasoiAmMarkt = defineShowcase({
  slug: "rasoi-am-markt",
  direction: "gewuerzmarkt-papier",
  facts: {
    name: "Rasoi am Markt",
    locality: "Lindenried",
    cuisine: "indisch",
    address: { street: "Am Viktualienplatz 3", postalCode: "00862", locality: "Lindenried" },
    phone: "089 99998 110",
    conceptShort: "Nordindische Küche am Wochenmarkt: Gewürze jeden Morgen geröstet und gemahlen, mittags ein Thali, abends aus dem Tandoor.",
    story:
      "Anjali Mehra ist in Amritsar aufgewachsen, wo ihre Familie einen Gewürzstand hatte. Seit 2019 kocht sie in Lindenried, direkt am Viktualienplatz, auf dem dienstags und freitags Markt ist. Jeden Morgen röstet sie Kreuzkümmel, Koriander und Kardamom in der Pfanne und mahlt sie auf dem Stein; die Garam Masala des Hauses hat elf Zutaten. Der Tandoor ist aus Ton und wird mit Holzkohle geheizt.",
    usp: "Gewürze jeden Morgen frisch geröstet und gemahlen, keine fertige Currypaste im Haus.",
    specials: ["Mittagsthali: zwei Currys, Dal, Reis, Raita, Roti – 13,50 Euro", "Freitag: Fisch-Amritsari vom Markt"],
    signatureDishes: ["Dal Makhani über Nacht", "Tandoori-Hähnchen", "Garam Masala mit elf Gewürzen"],
    menu: {
      sections: [
        {
          title: "Zum Anfang",
          items: [
            { name: "Samosa", description: "Kartoffel, Erbsen, Tamarinden-Chutney", priceCents: 650, dietary: ["vegan"], allergens: ["gluten"] },
            { name: "Paneer Tikka", description: "aus dem Tandoor, Minz-Chutney", priceCents: 950, dietary: ["vegetarisch"], allergens: ["milch"] },
          ],
        },
        {
          title: "Aus dem Tandoor",
          items: [
            { name: "Tandoori-Hähnchen", description: "halbes Hähnchen, Joghurt, Kaschmir-Chili", priceCents: 1850, allergens: ["milch", "senf"] },
            { name: "Lamm-Seekh-Kebab", priceCents: 1950, dietary: ["scharf"], allergens: ["milch"] },
          ],
        },
        {
          title: "Currys",
          items: [
            { name: "Dal Makhani", description: "schwarze Linsen, über Nacht gekocht", priceCents: 1350, dietary: ["vegetarisch"], allergens: ["milch"] },
            { name: "Butter Chicken", description: "Tomate, Butter, Bockshornklee", priceCents: 1750, allergens: ["milch", "schalenfruechte"] },
            { name: "Chana Masala", description: "Kichererbsen, Amchur, Ingwer", priceCents: 1300, dietary: ["vegan"], allergens: [] },
            { name: "Lamm Rogan Josh", priceCents: 1950, dietary: ["scharf"], allergens: ["milch"] },
          ],
        },
        {
          title: "Dazu",
          items: [
            { name: "Butter-Naan", priceCents: 350, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
            { name: "Basmatireis mit Kreuzkümmel", priceCents: 350, dietary: ["vegan"], allergens: [] },
            { name: "Raita", priceCents: 400, dietary: ["vegetarisch"], allergens: ["milch"] },
          ],
        },
        {
          title: "Süß",
          items: [{ name: "Gulab Jamun", description: "warm, mit Kardamomsirup", priceCents: 600, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] }],
        },
      ],
      note: "Die Schärfe richtet die Küche nach Ihrem Wunsch. Preise inklusive Mehrwertsteuer.",
    },
    openingHours: week(
      { di: "11:30-14:30 17:30-22:00", mi: "11:30-14:30 17:30-22:00", do: "11:30-14:30 17:30-22:00", fr: "11:30-14:30 17:30-22:30", sa: "17:30-22:30", so: "12:00-21:00" },
      "Das Mittagsthali gibt es Dienstag bis Freitag.",
    ),
    serviceNotes: ["An Markttagen ist mittags viel los – eine kurze Anfrage sichert den Tisch.", "Alle Currys gibt es auch zum Mitnehmen im eigenen Gefäß."],
    requestChannels: { table: true, pickup: true },
    primaryAction: "tableRequest",
    priceLevel: "mid",
  },
  creative: {
    idea: "Rasoi als Gewürzpapier am Marktstand: gefaltete Tüten, Stempelschrift, jede Zutat mit Namen.",
    effect: "Man sieht Mittagsthali und Preis sofort und versteht, dass die Gewürze selbst gemahlen werden.",
    metaphor: "Braunes Packpapier mit gestempelten Etiketten, die Karte in Gängen wie ein Rezeptheft.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und Mittagsthali nebeneinander, wie das Schild am Marktstand." },
      { section: "menu", weight: "gross", title: "Vom Anfang bis zum Süßen", why: "Fünf Gänge wie Kapitel; die Karte ist lang und braucht Gliederung." },
      { section: "request", weight: "normal", title: "Tisch oder Mitnahme anfragen", why: "An Markttagen ist mittags jeder Tisch belegt; Tisch und Mitnahme stehen gleich weit vorn." },
      { section: "story", weight: "normal", title: "Elf Gewürze, jeden Morgen", why: "Rösten und Mahlen sind der Beleg für alles auf der Karte." },
      { section: "imageSlots", weight: "normal", title: "Pfanne, Stein, Tandoor", why: "Das Mahlen am Morgen ist das Bild, das die Geschichte beweist." },
      { section: "hours", weight: "normal", title: "Mittags und abends", why: "Mittags- und Abendzeiten unterscheiden sich; sie müssen klar stehen." },
      { section: "serviceNotes", weight: "klein", title: "Markttage und Mitnahme", why: "Markttage verändern den Mittag; das gehört gesagt." },
      { section: "visit", weight: "normal", title: "Direkt am Viktualienplatz", why: "Der Markt ist der Orientierungspunkt." },
    ],
    signatures: [{ title: "Rezeptheft in Gängen", description: "Die Karte ist in fünf Gänge mit großen Ziffern gegliedert, wie Kapitel eines Rezepthefts.", evidence: ["menu"] }],
    omissions: ["Keine Mandalas, keine Elefanten, kein Taj Mahal", "Keine Gewürzhaufen-Stockfotos", "Kein Bollywood-Vokabular"],
  },
  imageSlots: [
    { id: "gewuerze", subject: "team", role: "beweis", motif: "Anjali röstet Gewürze in der Eisenpfanne, daneben der Mahlstein", alt: "Anjali Mehra röstet Gewürze in einer Eisenpfanne", crop: { desktop: "21:9", mobile: "4:5", focus: { x: 45, y: 55 } }, asset: null },
    { id: "thali", subject: "gericht", role: "beweis", motif: "Mittagsthali von oben auf dem Messingteller", dish: "Mittagsthali", alt: "Mittagsthali mit zwei Currys, Dal, Reis, Raita und Roti", crop: { desktop: "3:2", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
    { id: "tandoor", subject: "detail", role: "stimmung", motif: "Naan an der Innenwand des Tontandoors", alt: "Naan-Brot an der Wand des Tandoor-Ofens", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
