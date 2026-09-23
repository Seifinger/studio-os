import type { Metadata } from "next";

import { OPERATOR_MISSING_MARKER, studioOperator } from "@/server/studio-operator";

import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  const operator = studioOperator();
  return (
    <LegalPage title="Impressum">
      {operator ? (
        <section className="grid gap-2">
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            {operator.name}
            <br />
            {operator.address}
          </p>
          <p>
            E-Mail: <a href={`mailto:${operator.email}`}>{operator.email}</a>
          </p>
        </section>
      ) : (
        <p role="alert" className="border border-fail p-4 text-fail">
          {OPERATOR_MISSING_MARKER}. Diese Seite darf so nicht veröffentlicht werden.
        </p>
      )}
      <section className="grid gap-2">
        <h2>Zu den Beispielseiten</h2>
        <p>
          Die hier gezeigten Restaurants sind frei erfunden. Namen, Adressen, Telefonnummern, Speisekarten und
          Preise sind ausgedacht; Ähnlichkeiten mit bestehenden Betrieben sind nicht beabsichtigt. Die
          Telefonnummern stammen aus dem Rufnummernbereich, den die Bundesnetzagentur für Film und Fernsehen
          freihält, die Postleitzahlen sind nicht vergeben.
        </p>
      </section>
    </LegalPage>
  );
}
