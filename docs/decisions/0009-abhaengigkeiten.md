# 0009 – Abhängigkeiten der Foundation

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `package.json`, `package-lock.json`, CLAUDE.md Abschnitt 4

## Kontext

CLAUDE.md verlangt für jede Abhängigkeit eine Begründung. Diese Liste ist der Ausgangsstand.
Alle Versionen sind exakt gepinnt (`save-exact=true`). `npm audit` meldet 0 Schwachstellen
(Stand 2026-09-23).

## Entscheidung

**Laufzeit**

| Paket | Version | Lizenz | Zweck | Warum nicht ohne |
|---|---|---|---|---|
| `next` | 16.3.6 | MIT | Framework (Vorgabe) | – |
| `react`, `react-dom` | 19.3.0 | MIT | UI (von Next vorausgesetzt) | – |
| `zod` | 4.6.5 | MIT | Schemata und Validierung (Vorgabe) | – |
| `server-only` | 0.0.1 | MIT | Build-Fehler, wenn Servermodule in Client-Code landen | Schützt Produktprinzip 7 mechanisch; winziges Paket des React-Teams ohne Abhängigkeiten, von Next.js empfohlen |

**Entwicklung**

| Paket | Version | Zweck |
|---|---|---|
| `typescript` | 5.9.3 | Typprüfung (siehe 0002 zur Versionswahl) |
| `@types/node`, `@types/react`, `@types/react-dom` | 22.20.4 / 19.3.0 / 19.3.0 | Typen passend zu Node 22 und React 19 |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | Styling (Vorgabe) |
| `eslint`, `eslint-config-next` | 9.39.5 / 16.3.6 | Linting inkl. Next-, React-Hooks-, a11y- und TypeScript-Regeln |
| `vitest` | 5.0.1 | Unit-Tests (Vorgabe); bringt `vite` 8 als Peer mit |
| `@playwright/test` | 1.63.0 | E2E vorbereitet (Vorgabe) |

**Ergänzung 2026-09-23 (ADR 0019): Schriften**

| Pakete | Version | Lizenz | Zweck |
|---|---|---|---|
| 24 × `@fontsource/*` (Vollkorn, Alegreya Sans, Cormorant Garamond, Karla, Marcellus, Figtree, Bricolage Grotesque, Work Sans, Reem Kufi, Young Serif, Hanken Grotesk, Chivo, Newsreader, Be Vietnam Pro, Antonio, Zen Kaku Gothic New, Rozha One, Source Serif 4, Schibsted Grotesk, Instrument Serif, Instrument Sans, Libre Caslon Display, Libre Franklin, Fraunces) | 5.3.0 | OFL-1.1 | Selbst gehostete Schriften für Kundenseiten und Demos; reine Daten (woff2 + CSS), kein Code |

**Ergänzung 2026-09-24 (ADR 0023): keine neue Abhängigkeit für den Conversion-Layer**

- Resend wird per `fetch` angesprochen, ohne SDK.
- Im Browser prüft `zod/mini` die Antworten der Anfrage-Route; es gehört zum vorhandenen Paket `zod`.
- Radix bleibt bis Stufe 7 draußen, native Formularfelder genügen.

## Bewusst nicht aufgenommen

- **Prettier:** sinnvoll, aber nicht Teil des Auftrags; ESLint + `.editorconfig` reichen für den
  Start. Eigene Entscheidung, sobald mehrere Personen parallel arbeiten.
- **`@vitejs/plugin-react`, Testing Library, jsdom:** erst nötig, wenn Client Components
  Unit-Tests brauchen. Heute prüft Playwright die Seite.
- **`vite-tsconfig-paths`:** ein Alias in `vitest.config.mts` genügt.
- **`@t3-oss/env-nextjs`:** siehe 0004.
- **SDKs für Supabase, Resend, Google, Anthropic, Vercel:** siehe 0005.
- **Icon-, Komponenten- oder Animationsbibliotheken:** widersprechen DESIGN.md oder haben keinen Anlass.

## Konsequenzen

- Jede Erweiterung dieser Liste ist ein neues ADR oder eine Ergänzung hier mit Datum.
