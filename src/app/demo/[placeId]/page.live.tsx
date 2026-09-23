import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import "@/compositions/restaurant/font-faces";
import { leadDemoModel } from "@/compositions/restaurant/lead-model";
import { RestaurantSite } from "@/compositions/restaurant/site";
import { PLACE_ID_PATTERN, PlacesRequestError } from "@/server/integrations/google-places";
import { IntegrationNotConfiguredError } from "@/server/integrations/ports";
import { leadDemosAllowed, loadLeadDemo, placesFromEnv } from "@/server/leads/lead-demo";

import { DemoNotice } from "../demo-notice";

// Lead-Demo live aus Google Places (ADR 0021): bei jedem Aufruf neu, nie zwischengespeichert,
// nur über localhost erreichbar und nie in Suchmaschinen.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Konzeptentwurf", robots: { index: false, follow: false } };

type Props = { readonly params: Promise<{ placeId: string }> };

export default async function LeadDemoPage({ params }: Props) {
  if (!leadDemosAllowed((await headers()).get("host"))) notFound();
  const placeId = decodeURIComponent((await params).placeId);
  if (!PLACE_ID_PATTERN.test(placeId)) notFound();

  let result;
  try {
    result = await loadLeadDemo(placeId, { places: placesFromEnv(), now: () => new Date() });
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      return (
        <DemoNotice title="Google Places ist nicht eingerichtet">
          <p>
            <code className="font-mono">GOOGLE_PLACES_API_KEY</code> in <code className="font-mono">.env.local</code> setzen und den
            Server neu starten.
          </p>
        </DemoNotice>
      );
    }
    if (error instanceof PlacesRequestError) {
      console.error(`[lead-demo] ${error.message}`);
      return (
        <DemoNotice title="Google Places hat nicht geantwortet">
          <p>{error.message}. Schlüssel, API-Freigabe und Abrechnung in der Google Cloud Console prüfen.</p>
        </DemoNotice>
      );
    }
    throw error;
  }

  if (result.kind === "notFound") notFound();
  if (result.kind === "blocked") {
    return (
      <DemoNotice title="Für diesen Betrieb entsteht keine Demo">
        <p>{result.reason}.</p>
      </DemoNotice>
    );
  }
  return <RestaurantSite model={leadDemoModel(result.demo)} />;
}
