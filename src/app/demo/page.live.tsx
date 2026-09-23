import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PLACE_ID_PATTERN } from "@/server/integrations/google-places";
import { leadDemosAllowed } from "@/server/leads/lead-demo";

import { DemoNotice } from "./demo-notice";

export const metadata: Metadata = { title: "Lead-Demos", robots: { index: false, follow: false } };

type Props = { readonly searchParams: Promise<{ placeId?: string | string[] }> };

// Einstieg der Lead-Demos: Place-ID eingeben (z. B. aus gastro-v3), dann entsteht die Demo live.
export default async function DemoStartPage({ searchParams }: Props) {
  const allowed = leadDemosAllowed((await headers()).get("host"));
  if (!allowed) {
    return (
      <DemoNotice title="Lead-Demos sind abgeschaltet">
        <p>
          Lead-Demos zeigen echte Betriebe und bleiben deshalb auf diesem Rechner. Zum Einschalten in
          <code className="font-mono"> .env.local</code> <code className="font-mono">STUDIO_LEAD_DEMOS=local</code> und{" "}
          <code className="font-mono">GOOGLE_PLACES_API_KEY</code> setzen und die Seite über localhost öffnen.
        </p>
      </DemoNotice>
    );
  }

  const raw = (await searchParams).placeId;
  const placeId = typeof raw === "string" ? raw.trim() : "";
  if (PLACE_ID_PATTERN.test(placeId)) redirect(`/demo/${encodeURIComponent(placeId)}`);

  return (
    <DemoNotice title="Konzept-Demo für einen Lead">
      <p>
        Die Demo entsteht beim Aufruf aus den aktuellen Google-Angaben (Name, Adresse, Telefon, Öffnungszeiten,
        Bewertung). Gespeichert wird nichts. Alles andere bleibt ein Platzhalter mit der Frage fürs Gespräch.
      </p>
      <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="grid gap-1 text-ink">
          <span className="font-semibold">Google Place-ID</span>
          <input
            name="placeId"
            required
            pattern="[A-Za-z0-9_\-]{10,300}"
            autoComplete="off"
            spellCheck={false}
            defaultValue={placeId}
            className="min-h-12 border border-line-strong bg-surface px-3 font-mono text-base"
          />
        </label>
        <button type="submit" className="min-h-12 bg-accent px-5 font-semibold text-on-accent">
          Demo öffnen
        </button>
      </form>
      {placeId ? <p className="text-fail">Das ist keine gültige Place-ID.</p> : null}
    </DemoNotice>
  );
}
