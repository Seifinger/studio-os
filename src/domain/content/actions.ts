import type { Fact } from "../provenance/fact";
import { gate, type GateContext } from "../provenance/gate";
import type { PostalAddress, RequestChannels } from "./business-profile";
import { BOOKING_PROVIDERS, type ExternalBooking } from "./booking";
import { type PhoneNumber, telHref, whatsAppHref } from "./phone";

// Handlungsaufforderungen (CTAs). Eine Aktion ist nur verfügbar, wenn die Angabe dahinter das
// Fakten-Gate passiert – eine Telefonnummer, die niemand bestätigt hat, wird kein Anruf-Knopf.
// Beschriftungen ehrlich: Eine Anfrage ist keine Reservierung („Tisch anfragen“, DESIGN.md T3).

export const ACTION_TYPES = ["call", "whatsapp", "tableRequest", "pickupRequest", "onlineBooking", "menu", "directions"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_LABELS: Readonly<Record<ActionType, string>> = {
  call: "Anrufen",
  whatsapp: "WhatsApp schreiben",
  tableRequest: "Tisch anfragen",
  pickupRequest: "Abholung anfragen",
  onlineBooking: "Online reservieren",
  menu: "Speisekarte",
  directions: "Route planen",
};

/** Anker der Abschnitte, zu denen seiteninterne Aktionen springen. */
export const ACTION_ANCHORS = {
  tableRequest: "#tisch-anfragen",
  pickupRequest: "#abholung-anfragen",
  menu: "#speisekarte",
  visit: "#besuch",
} as const;

export type ActionSources = {
  readonly phone: Fact<PhoneNumber>;
  readonly whatsapp: Fact<PhoneNumber>;
  readonly address: Fact<PostalAddress>;
  readonly email: Fact<string>;
  readonly onlineBooking: Fact<ExternalBooking>;
  readonly requestChannels: Fact<RequestChannels>;
  /** Nur Gastronomie; fehlt bei anderen Branchen. */
  readonly menu?: Fact<unknown>;
};

export type ResolvedAction =
  | {
      readonly available: true;
      readonly type: ActionType;
      readonly label: string;
      readonly href: string;
      readonly external: boolean;
      /** Beruht auf einem Vorschlag – als Entwurf kennzeichnen. */
      readonly draft: boolean;
      /** In Demos sichtbar, verschickt aber nichts. */
      readonly demoOnly: boolean;
    }
  | { readonly available: false; readonly type: ActionType; readonly reason: string };

function usable<T>(fact: Fact<T>, context: GateContext): { value: T; draft: boolean } | null {
  const outcome = gate(fact, context);
  if (outcome.show === "value") return { value: outcome.value, draft: false };
  if (outcome.show === "draft") return { value: outcome.value, draft: true };
  return null;
}

function mapsHref(address: PostalAddress): string {
  const query = `${address.street}, ${address.postalCode} ${address.locality}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function resolveAction(type: ActionType, sources: ActionSources, context: GateContext): ResolvedAction {
  const label = ACTION_LABELS[type];
  const available = (href: string, external: boolean, draft: boolean, demoOnly = false): ResolvedAction => ({
    available: true,
    type,
    label,
    href,
    external,
    draft,
    demoOnly,
  });
  const unavailable = (reason: string): ResolvedAction => ({ available: false, type, reason });

  // Beispielbetriebe sind erfunden: Nummern, Adressen und Buchungslinks führen nirgendwohin.
  // Die Aktion bleibt sichtbar und springt zur Besuchs-Sektion der Seite.
  const showcaseStandIn = (): ResolvedAction => available(ACTION_ANCHORS.visit, false, false, true);

  switch (type) {
    case "call": {
      if (context.kind === "showcase") return usable(sources.phone, context) ? showcaseStandIn() : unavailable("Keine Telefonnummer");
      const phone = usable(sources.phone, context);
      return phone ? available(telHref(phone.value), false, phone.draft) : unavailable("Keine freigegebene Telefonnummer");
    }
    case "whatsapp": {
      if (context.kind === "showcase") return usable(sources.whatsapp, context) ? showcaseStandIn() : unavailable("Keine WhatsApp-Nummer");
      const phone = usable(sources.whatsapp, context);
      return phone ? available(whatsAppHref(phone.value), true, phone.draft) : unavailable("Keine freigegebene WhatsApp-Nummer");
    }
    case "directions": {
      if (context.kind === "showcase") return usable(sources.address, context) ? showcaseStandIn() : unavailable("Keine Adresse");
      const address = usable(sources.address, context);
      return address ? available(mapsHref(address.value), true, address.draft) : unavailable("Keine freigegebene Adresse");
    }
    case "onlineBooking": {
      if (context.kind === "showcase") return usable(sources.onlineBooking, context) ? showcaseStandIn() : unavailable("Kein Reservierungssystem");
      const booking = usable(sources.onlineBooking, context);
      if (!booking) return unavailable("Kein Reservierungssystem hinterlegt");
      const provider = BOOKING_PROVIDERS.find((candidate) => candidate.id === booking.value.provider);
      return {
        available: true,
        type,
        label: !provider || provider.id === "other" ? label : `${label} über ${provider.label}`,
        href: booking.value.url,
        external: true,
        draft: booking.draft,
        demoOnly: false,
      };
    }
    case "tableRequest":
    case "pickupRequest": {
      const anchor = ACTION_ANCHORS[type];
      // Demos zeigen das Formular, verschicken aber nichts (ADR 0016).
      if (context.kind !== "customer") return available(anchor, false, false, true);
      const channels = usable(sources.requestChannels, context);
      const email = usable(sources.email, context);
      const wanted = type === "tableRequest" ? channels?.value.table : channels?.value.pickup;
      if (!channels || !wanted) return unavailable("Diese Anfrageart ist nicht vereinbart");
      if (!email) return unavailable("Keine freigegebene E-Mail-Adresse für Anfragen");
      return available(anchor, false, channels.draft || email.draft);
    }
    case "menu": {
      if (!sources.menu) return unavailable("Dieses Profil hat keine Speisekarte");
      const outcome = gate(sources.menu, context);
      // Ein Platzhalter-Abschnitt („Hier steht Ihre Speisekarte“) ist in Demos ein gültiges Sprungziel.
      if (outcome.show === "value" || outcome.show === "draft" || outcome.show === "placeholder") {
        return available(ACTION_ANCHORS.menu, false, outcome.show === "draft");
      }
      return unavailable("Keine freigegebene Speisekarte");
    }
  }
}
