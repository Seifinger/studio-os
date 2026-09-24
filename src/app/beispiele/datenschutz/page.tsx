import type { Metadata } from "next";

import { OPERATOR_MISSING_MARKER, studioOperator } from "@/server/studio-operator";

import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Datenschutz" };

// Vor der ersten Veröffentlichung rechtlich prüfen lassen (ROADMAP Stufe 4, offener Punkt).
export default function DatenschutzPage() {
  const operator = studioOperator();
  return (
    <LegalPage title="Datenschutz">
      <section className="grid gap-2">
        <h2>Verantwortlich</h2>
        {operator ? (
          <p>
            {operator.name}, {operator.address}, <a href={`mailto:${operator.email}`}>{operator.email}</a>
          </p>
        ) : (
          <p role="alert" className="border border-fail p-4 text-fail">
            {OPERATOR_MISSING_MARKER}. Diese Seite darf so nicht veröffentlicht werden.
          </p>
        )}
      </section>
      <section className="grid gap-2">
        <h2>Hosting</h2>
        <p>
          Die Beispielseiten liegen bei GitHub Pages (GitHub, Inc., USA). Beim Aufruf verarbeitet GitHub
          technisch notwendige Daten wie Ihre IP-Adresse, um die Seiten auszuliefern und den Dienst zu
          schützen (Art. 6 Abs. 1 lit. f DSGVO). Näheres steht in der{" "}
          <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Keine Cookies, keine Analyse</h2>
        <p>
          Diese Seiten setzen keine Cookies, messen keine Besuche und laden nichts von Dritten nach. Schriften
          werden von hier ausgeliefert, nicht von Google. Die Formulare auf den Beispielseiten sind gesperrt
          und senden nichts.
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und
          Widerspruch sowie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </p>
      </section>
    </LegalPage>
  );
}
