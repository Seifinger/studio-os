import type { PostalAddress, RequestChannels } from "../content/business-profile";
import type { OpeningHours } from "../content/opening-hours";
import type { PhoneNumber } from "../content/phone";
import type { Fact } from "../provenance/fact";
import { gate, type GateContext } from "../provenance/gate";
import type { RequestKind } from "./fields";

// Wohin eine Anfrage geht. Der Empfänger kommt nie aus dem Formular, sondern immer aus dem Profil
// des Betriebs (über das Fakten-Gate) – sonst wäre der Endpunkt ein offenes Mail-Relais.

export type RequestTarget = {
  /** Schlüssel der Seite in der Anfrage-Route (`/api/anfragen/<siteId>`). */
  readonly siteId: string;
  readonly businessName: string;
  /** Postfach des Betriebs. */
  readonly recipient: string;
  readonly channels: { readonly table: boolean; readonly pickup: boolean };
  /** Unbekannte Öffnungszeiten prüfen nichts – der Betrieb entscheidet. */
  readonly openingHours: OpeningHours | null;
  /** Ausweichweg in Fehlermeldungen („Bitte rufen Sie an“). */
  readonly phone: PhoneNumber | null;
  readonly address: PostalAddress | null;
  /** Probe aus dem Studio (ADR 0023): Betreff und Text sagen es deutlich. */
  readonly probe: boolean;
};

export type TargetResult = { readonly ok: true; readonly target: RequestTarget } | { readonly ok: false; readonly reason: string };

/** Die Angaben eines Profils, die ein Anfrageziel braucht – gespeichert oder live. */
export type TargetFacts = {
  readonly name: Fact<string>;
  readonly email: Fact<string>;
  readonly requestChannels: Fact<RequestChannels>;
  readonly openingHours: Fact<OpeningHours>;
  readonly phone: Fact<PhoneNumber>;
  readonly address: Fact<PostalAddress>;
};

const SITE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Nur Werte, die ohne Einschränkung gelten – ein Entwurf empfängt keine echten Anfragen. */
function settled<T>(fact: Fact<T>, context: GateContext): T | null {
  const outcome = gate(fact, context);
  return outcome.show === "value" ? outcome.value : null;
}

function build(siteId: string, facts: TargetFacts, context: GateContext, recipient: string | null, probe: boolean): TargetResult {
  if (!SITE_ID.test(siteId)) return { ok: false, reason: `Ungültige Seitenkennung „${siteId}“` };
  const businessName = settled(facts.name, context);
  if (!businessName) return { ok: false, reason: "Name des Betriebs fehlt oder ist nicht bestätigt" };
  if (!recipient) return { ok: false, reason: "Keine bestätigte E-Mail-Adresse für Anfragen" };
  const channels = settled(facts.requestChannels, context);
  if (!channels) return { ok: false, reason: "Keine vereinbarten Anfragearten" };
  return {
    ok: true,
    target: {
      siteId,
      businessName,
      recipient,
      channels,
      openingHours: settled(facts.openingHours, context),
      phone: settled(facts.phone, context),
      address: settled(facts.address, context),
      probe,
    },
  };
}

/** Anfrageziel einer Kundenseite. Beispiele und Lead-Demos verschicken nie etwas (ADR 0016). */
export function requestTargetFromProfile(siteId: string, facts: TargetFacts, context: GateContext): TargetResult {
  if (context.kind !== "customer") return { ok: false, reason: "Nur Kundenseiten verschicken Anfragen" };
  return build(siteId, facts, context, settled(facts.email, context), false);
}

/**
 * Probe mit einem Beispielbetrieb (nur lokal, ADR 0023): Angaben des erfundenen Hauses, Empfänger
 * ist das Postfach des Studios. So lässt sich der ganze Weg prüfen, ohne einen echten Betrieb zu stören.
 */
export function probeTarget(siteId: string, facts: TargetFacts, studioInbox: string): TargetResult {
  return build(siteId, facts, { kind: "showcase" }, studioInbox, true);
}

export function offers(target: RequestTarget, kind: RequestKind): boolean {
  return kind === "table" ? target.channels.table : target.channels.pickup;
}
