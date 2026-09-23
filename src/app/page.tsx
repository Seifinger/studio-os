import type { ReactNode } from "react";

import { APP_VERSION } from "@/server/app-info";

// Interne Startseite des Studios: zeigt den technischen Stand, keine Fachfunktionen.
// Funktionale UI nach DESIGN.md, Abschnitt 2 – bewusst keine Landingpage.

type StatusRowProps = { term: string; children: ReactNode };

function StatusRow({ term, children }: StatusRowProps) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="font-semibold">{term}</dt>
      <dd className="text-ink-muted">{children}</dd>
    </div>
  );
}

const DOCUMENTS = [
  { file: "ROADMAP.md", purpose: "Produktplan in zehn Stufen – vom Fachkern bis zur eigenen Bestellstrecke" },
  { file: "ARCHITECTURE.md", purpose: "Modulgrenzen, Datenfluss, Sicherheit, spätere Integrationen" },
  { file: "DESIGN.md", purpose: "Anti-Slop-Regeln, funktionale UI und kreative Kompositionen" },
  { file: "MIGRATION.md", purpose: "Was aus den Referenzprojekten übernommen wird – und in welcher Reihenfolge" },
  { file: "CLAUDE.md", purpose: "Verbindliche Entwicklungsregeln" },
  { file: "docs/decisions/", purpose: "Entscheidungen mit Begründung" },
] as const;

export default function HomePage() {
  return (
    <main id="inhalt" className="mx-auto max-w-[44rem] px-6 pb-24 pt-16 sm:pt-24">
      <header className="border-b border-line pb-10">
        <p className="font-mono text-sm text-ink-muted">
          studio-os · Version {APP_VERSION} · Stufe 1
        </p>
        <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.1] tracking-tight">Studio OS</h1>
        <p className="mt-6 max-w-[34rem] text-xl leading-relaxed text-ink-muted">
          Werkzeug eines Website-Studios für lokale Betriebe, zuerst für Restaurants. Diese Seite zeigt
          den technischen Stand. Fachfunktionen gibt es noch keine.
        </p>
      </header>

      <section aria-labelledby="stand" className="mt-12">
        <h2 id="stand" className="text-xl font-semibold">
          Stand
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          <StatusRow term="Anwendung">Next.js mit App Router, serverseitig gerendert</StatusRow>
          <StatusRow term="Health-Check">
            <a href="/api/health" className="font-mono">
              /api/health
            </a>
          </StatusRow>
          <StatusRow term="Fachkern">
            Angaben mit Herkunft, Fakten-Gate, Betriebs- und Restaurantprofil (ohne Oberfläche). Nächste
            Stufe laut ROADMAP.md: Regeln gegen KI-Floskeln
          </StatusRow>
          <StatusRow term="Integrationen">
            Google Places und E-Mail als Schnittstellen vorbereitet, alle abgeschaltet. Weitere Dienste
            sind in ARCHITECTURE.md geplant
          </StatusRow>
        </dl>
      </section>

      <section aria-labelledby="grundlagen" className="mt-12">
        <h2 id="grundlagen" className="text-xl font-semibold">
          Verbindliche Grundlagen im Repository
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {DOCUMENTS.map(({ file, purpose }) => (
            <li key={file} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <span className="font-mono text-sm leading-6">{file}</span>
              <span className="text-ink-muted">{purpose}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="nicht-gebaut" className="mt-12">
        <h2 id="nicht-gebaut" className="text-xl font-semibold">
          Bewusst noch nicht gebaut
        </h2>
        <p className="mt-4 max-w-[65ch] text-ink-muted">
          Lead-Dashboard, Google-Places-Abfrage, Kundenportal, Reservierung und Bestellung. Sie folgen
          in eigenen, freigegebenen Schritten.
        </p>
      </section>
    </main>
  );
}
