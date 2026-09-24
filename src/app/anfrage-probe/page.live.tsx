import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { TIFFINSTUBE_RAO_SLUG, tiffinstubeRaoProfile } from "@/catalog/narrative-demos/tiffinstube-rao.fixture";
import { SHOWCASES } from "@/catalog/showcases";
import type { RestaurantProfile } from "@/domain/gastronomy/restaurant-profile";
import { emailSenderFromEnv, requestProbeInbox } from "@/server/requests/request-service";

import { DemoNotice } from "../demo/demo-notice";

// Anfrage-Probe (ADR 0023): prüft den ganzen Weg Formular → Route → Resend → Postfach mit den
// erfundenen Beispielhäusern. Nur lokal; die E-Mails an den „Betrieb“ gehen ans Studio-Postfach.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Anfrage-Probe", robots: { index: false, follow: false } };

function channels(profile: RestaurantProfile): string {
  const value = profile.requestChannels.value;
  if (!value) return "keine Anfragen";
  return [value.table ? "Tisch" : null, value.pickup ? "Abholung" : null].filter(Boolean).join(" + ");
}

export default async function RequestProbePage() {
  const inbox = requestProbeInbox((await headers()).get("host"));
  if (!inbox) {
    return (
      <DemoNotice title="Anfrage-Probe ist abgeschaltet">
        <p>
          Die Probe verschickt echte E-Mails und bleibt deshalb auf diesem Rechner. Zum Einschalten in
          <code className="font-mono"> .env.local</code> <code className="font-mono">STUDIO_REQUEST_PROBE=local</code>, die
          Betreiberangaben <code className="font-mono">STUDIO_OPERATOR_*</code> sowie <code className="font-mono">RESEND_API_KEY</code>{" "}
          und <code className="font-mono">EMAIL_FROM</code> setzen und die Seite über localhost öffnen.
        </p>
      </DemoNotice>
    );
  }

  const houses = [
    ...SHOWCASES.map((showcase) => ({ slug: showcase.slug, profile: showcase.profile })),
    { slug: TIFFINSTUBE_RAO_SLUG, profile: tiffinstubeRaoProfile },
  ];
  return (
    <DemoNotice title="Anfrage-Probe">
      <p>
        Jede Anfrage geht als E-Mail an <strong className="text-ink">{inbox}</strong> (statt an das erfundene Haus), die
        Eingangsbestätigung an die Adresse im Formular. Betreff und Text tragen „Probe“. Gespeichert wird nichts.
      </p>
      {emailSenderFromEnv() ? null : (
        <p className="text-fail">Der Versand ist nicht eingerichtet: RESEND_API_KEY und EMAIL_FROM fehlen.</p>
      )}
      <ul className="grid gap-2">
        {houses.map(({ slug, profile }) => (
          <li key={slug}>
            <Link href={`/anfrage-probe/${slug}`}>{profile.name.value ?? slug}</Link>{" "}
            <span className="font-mono text-sm">· {channels(profile)}</span>
          </li>
        ))}
      </ul>
    </DemoNotice>
  );
}
