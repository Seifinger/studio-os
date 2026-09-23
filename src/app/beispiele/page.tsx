import type { Metadata } from "next";

import "@/compositions/restaurant/font-faces";

import { ShowcaseOverview } from "./showcase-overview";

export const metadata: Metadata = {
  title: "Beispielseiten",
  description: "Erfundene Restaurants, eines je Küche – Beispielseiten eines Website-Studios.",
};

export default function ShowcasesPage() {
  return <ShowcaseOverview />;
}
