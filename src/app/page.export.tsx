import type { Metadata } from "next";

import "@/compositions/restaurant/font-faces";

import { ShowcaseOverview } from "./beispiele/showcase-overview";

// Startseite des statischen Exports (GitHub Pages): die Übersicht der Beispielseiten.
// Das Studio selbst (page.live.tsx) ist nicht Teil des Exports.
export const metadata: Metadata = {
  title: { absolute: "Beispielseiten · Studio OS" },
  description: "Erfundene Restaurants, eines je Küche – Beispielseiten eines Website-Studios.",
};

export default function ExportHomePage() {
  return <ShowcaseOverview />;
}
