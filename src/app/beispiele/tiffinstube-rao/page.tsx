import type { Metadata } from "next";

import { TIFFINSTUBE_RAO_THEME, tiffinstubeRaoNarrative, tiffinstubeRaoProfile } from "@/catalog/narrative-demos/tiffinstube-rao.fixture";
import "@/compositions/restaurant/font-faces";
import { NarrativeSite } from "@/compositions/narrative-editorial/narrative-site";
import { THEME_REGISTRY } from "@studio/design-system/themes/registry";

import { SHOWCASE_CHROME } from "../showcase-model";

// Erste Demo im Basissystem narrative-editorial (ADR 0022): frei erfundenes Haus, Daten nur aus
// der Fixture-Datei, Theme „indian-bombay-story“.
export const metadata: Metadata = {
  title: { absolute: "Tiffinstube Rao · Beispielseite des Studios" },
  description: tiffinstubeRaoProfile.conceptShort.value ?? undefined,
  robots: { index: false, follow: false },
};

export default function TiffinstubeRaoPage() {
  return (
    <NarrativeSite
      theme={THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME)}
      profile={tiffinstubeRaoProfile}
      config={tiffinstubeRaoNarrative}
      context={{ kind: "showcase" }}
      chrome={SHOWCASE_CHROME}
    />
  );
}
