# 0002 – Technischer Stack und Versionen

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ARCHITECTURE.md, Abschnitt 2; 0009 (Abhängigkeiten)

## Kontext

Vorgegeben: Next.js mit App Router, TypeScript strict, Tailwind CSS, Zod, Vitest, Playwright nur
vorbereitet. Offen waren Versionen, Paketmanager und Strenge der Konfiguration.

## Entscheidung

| Baustein | Version | Anmerkung |
|---|---|---|
| Node.js | 22 (≥ 22.12) | `.nvmrc`, `engines`, `engine-strict=true` |
| npm | mitgeliefert | wie in beiden Referenzen; Lockfile im Repo |
| Next.js | 16.3.6 | App Router, Turbopack; `next lint` gibt es nicht mehr → ESLint direkt |
| React | 19.3.0 | |
| TypeScript | 5.9.3 | `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` |
| Tailwind CSS | 4.3.3 | CSS-first (`@theme`), Standardfarben abgeschaltet |
| Zod | 4.6.5 | Validierung an allen Grenzen |
| ESLint | 9.39.5 | `eslint-config-next` (Core Web Vitals + TypeScript) + eigene Regeln |
| Vitest | 5.0.1 | Umgebung `node`; `server-only` wird im Test durch einen leeren Ersatz ersetzt |
| Playwright | 1.63.0 | ein Smoke-Test, Projekte „mobil“ (Pixel 7) und „desktop“ |

`npm run check` = Lint + Typprüfung (`next typegen && tsc --noEmit`) + Vitest; `npm run build`
zusätzlich in CI.

## Betrachtete Alternativen

- **TypeScript 6/7:** `typescript-eslint` unterstützt derzeit nur `< 6.1`, das offizielle
  Next.js-Template setzt `^5`. TypeScript 7 (nativ) hat noch keine stabile Compiler-API für die
  Werkzeuge. → 5.9 bis die Werkzeugkette folgt.
- **ESLint 10:** npm meldet 9.x als nicht mehr unterstützt, aber `eslint-plugin-react`,
  `eslint-plugin-import` und `eslint-plugin-jsx-a11y` (über `eslint-config-next`) erlauben nur
  ESLint ≤ 9. → 9.39.5; Wechsel, sobald `eslint-config-next` ESLint 10 offiziell trägt.
- **pnpm/Bun:** kein Vorteil, der den Bruch mit den Referenzen und CI rechtfertigt.
- **Jest statt Vitest:** Vorgabe Vitest; schneller, ESM-nativ.
- **`exactOptionalPropertyTypes`:** erzeugt derzeit viel Reibung mit Next- und Zod-Typen; später prüfen.

## Konsequenzen

- Versionen sind exakt gepinnt; Updates sind bewusste Commits mit grünem `check` + `build`.
- Playwright 1.63 erwartet ein passendes Chromium (`npx playwright install chromium`). Ein
  vorhandenes Chromium kann über `PLAYWRIGHT_CHROMIUM_EXECUTABLE` genutzt werden (so in der
  Entwicklungsumgebung mit vorinstalliertem Chromium geprüft).
