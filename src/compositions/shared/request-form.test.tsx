import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { REQUEST_FIELDS } from "@/domain/requests/fields";

import { LiveRequestForm } from "./live-request-form";
import { RequestForm, type RequestFormClasses } from "./request-form";

const CLASSES: RequestFormClasses = {
  form: "f",
  field: "fd",
  fieldWide: "fw",
  hint: "h",
  error: "e",
  footer: "ft",
  submit: "s",
  note: "n",
  alert: "a",
  success: "ok",
  successTitle: "okt",
};

/** Das öffnende Tag des Elements mit dieser ID – Attributreihenfolge egal. */
function tag(html: string, id: string): string {
  const match = new RegExp(`<(?:input|textarea)[^>]*id="${id}"[^>]*>`).exec(html);
  if (!match) throw new Error(`Kein Feld mit id="${id}"`);
  return match[0];
}

const render = ({ endpoint, ...props }: Partial<Omit<Parameters<typeof RequestForm>[0], "requests">> & { endpoint?: string } = {}) =>
  renderToStaticMarkup(
    <RequestForm
      kind="table"
      idPrefix="tisch"
      demoNote="In dieser Demo wird nichts verschickt."
      classes={CLASSES}
      requests={endpoint ? { endpoint, Form: LiveRequestForm } : undefined}
      {...props}
    />,
  );

describe("RequestForm", () => {
  it("zeigt in Demos alle Felder, sperrt aber das Absenden mit Begründung", () => {
    const html = render();
    expect(html).not.toContain("action=");
    expect(html).toMatch(/<button type="submit" class="s" disabled="">Anfrage senden<\/button>/);
    expect(html).toContain('aria-describedby="tisch-demo"');
    expect(html).toContain('<p id="tisch-demo" class="n">In dieser Demo wird nichts verschickt.</p>');
  });

  it("schickt live ohne JavaScript per POST an die Route – der Browser prüft Pflichtfelder selbst", () => {
    const html = render({ endpoint: "/api/anfragen/probe-x" });
    expect(html).toContain('action="/api/anfragen/probe-x" method="post"');
    expect(html).not.toContain("novalidate");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("tisch-demo");
    expect(html).toContain('<input type="hidden" name="art" value="tisch"/>');
  });

  it("verknüpft jedes Feld mit sichtbarer Beschriftung, Hinweis und passendem autocomplete", () => {
    const html = render({ endpoint: "/api/anfragen/probe-x" });
    for (const field of REQUEST_FIELDS.table) {
      expect(html).toContain(`<label for="tisch-${field.name}">${field.label}</label>`);
    }
    const email = tag(html, "tisch-email");
    for (const attribute of ['name="email"', 'type="email"', 'required=""', 'aria-describedby="tisch-email-hinweis"', 'autoComplete="email"', 'inputMode="email"']) expect(email).toContain(attribute);
    expect(html).toContain('<p id="tisch-email-hinweis" class="h">Dorthin geht die Eingangsbestätigung.</p>');
    const phone = tag(html, "tisch-telefon");
    for (const attribute of ['type="tel"', 'autoComplete="tel"', 'inputMode="tel"']) expect(phone).toContain(attribute);
    expect(phone).not.toContain("required");
    for (const attribute of ['type="number"', 'min="1"', 'max="12"', 'inputMode="numeric"']) expect(tag(html, "tisch-personen")).toContain(attribute);
    for (const attribute of ['type="time"', 'required=""']) expect(tag(html, "tisch-uhrzeit")).toContain(attribute);
    // Ohne JavaScript darf der Browser keine Viertelstunden erzwingen – der Server nimmt jede Minute.
    expect(tag(html, "tisch-uhrzeit")).not.toContain("step=");
  });

  it("versteckt den Honigtopf vor Menschen, Tastatur und Screenreadern", () => {
    const html = render({ endpoint: "/api/anfragen/probe-x" });
    expect(html).toMatch(/<div aria-hidden="true" style="position:absolute;left:-10000px[^"]*"><label for="tisch-webseite">/);
    const honeypot = tag(html, "tisch-webseite");
    for (const attribute of ['name="webseite"', 'tabindex="-1"', 'autoComplete="off"']) expect(honeypot).toContain(attribute);
  });

  it("fragt bei Abholungen Tag, Zeit und Bestellung ab", () => {
    const html = render({ kind: "pickup", idPrefix: "abholung", endpoint: "/api/anfragen/probe-x" });
    expect(html).toContain('<label for="abholung-datum">Abholtag</label>');
    expect(html).toContain('<label for="abholung-bestellung">Was dürfen wir vorbereiten?</label>');
    expect(html).toContain('value="abholung"');
    expect(html).toContain(">Bestellung senden</button>");
    expect(html).not.toContain("abholung-personen");
  });
});
