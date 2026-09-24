import Link from "next/link";

import { TIFFINSTUBE_RAO_THEME, tiffinstubeRaoProfile } from "@/catalog/narrative-demos/tiffinstube-rao.fixture";
import { SHOWCASES } from "@/catalog/showcases";
import { themeStyle } from "@/compositions/restaurant/theme";
import { cuisineLabel } from "@/domain/gastronomy/cuisines";
import { themeVariables } from "@studio/design-system/themes/css";
import { THEME_REGISTRY } from "@studio/design-system/themes/registry";

import styles from "./overview.module.css";
import { SHOWCASE_CHROME } from "./showcase-model";

// Übersicht der Beispielseiten: funktionale Studio-Oberfläche (DESIGN.md §2). Jede Zeile zeigt
// den Namen in Schrift und Farben seines Hauses – die Tauschprobe auf einen Blick.

export function ShowcaseOverview() {
  return (
    <main id="inhalt" className="mx-auto max-w-[72rem] px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
      <header className="max-w-[42rem]">
        <p className="font-mono text-sm text-ink-muted">Studio · Beispielseiten</p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
          Restaurants, die es nicht gibt
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Ein erfundenes Haus je Küche, jedes mit eigener Schrift, eigenen Farben und eigener Reihenfolge
          der Abschnitte. Namen, Adressen, Telefonnummern, Karten und Preise sind ausgedacht. Wo Fotos
          hingehören, steht die Foto-Aufgabe.
        </p>
      </header>

      <ol className="mt-12 grid gap-3" aria-label="Beispielseiten">
        {SHOWCASES.map((showcase) => {
          const { profile, direction } = showcase;
          const meta = [profile.cuisine.value ? cuisineLabel(profile.cuisine.value) : null, profile.locality.value].filter(Boolean).join(" · ");
          return (
            <li key={showcase.slug}>
              <Link className={styles.band} style={themeStyle(direction)} href={`/beispiele/${showcase.slug}`}>
                <span className={styles.name}>{profile.name.value}</span>
                <span className={styles.meta}>{meta}</span>
                <span className={styles.mood}>
                  Richtung „{direction.name}“ – {direction.mood}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="erzaehlend" className="mt-16">
        <h2 id="erzaehlend" className="text-xl font-semibold">
          Erzählendes Basissystem
        </h2>
        <p className="mt-2 max-w-[42rem] text-ink-muted">
          Die erste Seite im System narrative-editorial: Akte mit Kontrastwechsel, Erzählung vor der Karte, eine
          Handlung, die mitläuft. Auch dieses Haus ist erfunden.
        </p>
        <Link
          className={`${styles.band} mt-5`}
          style={{ ...themeVariables(THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME)), "--c-bg": "var(--ne-night)", "--c-text": "var(--ne-night-ink)", "--c-muted": "var(--ne-night-muted)", "--c-line": "var(--ne-night-primary)", "--c-primary": "var(--ne-focus)", "--f-display": "var(--ne-display-font)", "--w-display": "var(--ne-display-weight)", "--f-body": "var(--ne-text-font)", "--radius": "var(--ne-radius)" } as React.CSSProperties}
          href="/beispiele/tiffinstube-rao"
        >
          <span className={styles.name}>{tiffinstubeRaoProfile.name.value}</span>
          <span className={styles.meta}>Indisch · {tiffinstubeRaoProfile.locality.value}</span>
          <span className={styles.mood}>Theme „{THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME).name}“ – {THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME).description}</span>
        </Link>
      </section>

      <footer className="mt-16 border-t border-line pt-6 text-sm text-ink-muted">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href={SHOWCASE_CHROME.impressumHref}>Impressum</Link>
          </li>
          <li>
            <Link href={SHOWCASE_CHROME.datenschutzHref}>Datenschutz</Link>
          </li>
        </ul>
      </footer>
    </main>
  );
}
