import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { TIFFINSTUBE_RAO_SLUG, TIFFINSTUBE_RAO_THEME, tiffinstubeRaoNarrative, tiffinstubeRaoProfile } from "@/catalog/narrative-demos/tiffinstube-rao.fixture";
import { showcaseBySlug } from "@/catalog/showcases";
import "@/compositions/restaurant/font-faces";
import { NarrativeSite } from "@/compositions/narrative-editorial/narrative-site";
import { RestaurantSite } from "@/compositions/restaurant/site";
import { LiveRequestForm } from "@/compositions/shared/live-request-form";
import { emailSenderFromEnv, requestProbeInbox } from "@/server/requests/request-service";
import { THEME_REGISTRY } from "@studio/design-system/themes/registry";

import { SHOWCASE_CHROME, showcaseModel } from "../../beispiele/showcase-model";
import { probeEndpoint, probeNotice } from "../probe-notice";

// Ein Beispielhaus mit scharfen Formularen (ADR 0023) – nur lokal, nie im statischen Export.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Anfrage-Probe", robots: { index: false, follow: false } };

type Props = { readonly params: Promise<{ slug: string }> };

export default async function RequestProbeHousePage({ params }: Props) {
  const inbox = requestProbeInbox((await headers()).get("host"));
  if (!inbox) notFound();
  const { slug } = await params;
  const chrome = { ...SHOWCASE_CHROME, overviewHref: "/anfrage-probe", notice: probeNotice(inbox, emailSenderFromEnv() !== null) };
  const requests = { endpoint: probeEndpoint(slug), Form: LiveRequestForm };

  if (slug === TIFFINSTUBE_RAO_SLUG) {
    return (
      <NarrativeSite
        theme={THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME)}
        profile={tiffinstubeRaoProfile}
        config={tiffinstubeRaoNarrative}
        context={{ kind: "showcase" }}
        chrome={chrome}
        requests={requests}
      />
    );
  }

  const showcase = showcaseBySlug(slug);
  if (!showcase) notFound();
  return <RestaurantSite model={{ ...showcaseModel(showcase), requests }} chrome={chrome} />;
}
