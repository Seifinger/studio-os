import type { Fact } from "./fact";

// Fakten-Gate (ARCHITECTURE.md §4.2, ADR 0015): entscheidet für jede Angabe, ob und wie sie
// auf einer Seite erscheinen darf. Kompositionen lesen Betriebsangaben nur über diese Funktion.

/**
 * - `showcase`: fiktiver Beispielbetrieb je Küche (öffentlich zeigbar, als erfunden gekennzeichnet)
 * - `leadDemo`: personalisierte Konzept-Demo für einen echten Betrieb, der (noch) kein Kunde ist
 * - `customer`: Website eines Kunden, als Vorschau oder live
 */
export type ProjectKind = "showcase" | "leadDemo" | "customer";

export type GateContext =
  | { readonly kind: "showcase" }
  | { readonly kind: "leadDemo" }
  | { readonly kind: "customer"; readonly stage: "preview" | "live" };

export type GateOutcome<T> =
  | { readonly show: "value"; readonly value: T }
  /** Sichtbar, aber als Entwurf markiert. */
  | { readonly show: "draft"; readonly value: T }
  /** Erkennbarer Platzhalter („Hier steht Ihre Mittagskarte“). */
  | { readonly show: "placeholder" }
  | { readonly show: "omit" }
  /** Unzulässig – der Build muss abbrechen. */
  | { readonly show: "violation"; readonly reason: string };

export function gate<T>(fact: Fact<T>, context: GateContext): GateOutcome<T> {
  const isLive = context.kind === "customer" && context.stage === "live";

  switch (fact.status) {
    case "bestaetigt":
    case "uebernommen":
      return context.kind === "showcase"
        ? { show: "violation", reason: "Ein fiktiver Beispielbetrieb hat keine bestätigten oder übernommenen Angaben" }
        : { show: "value", value: fact.value };
    case "vorschlag":
      return isLive
        ? { show: "violation", reason: "Ein Vorschlag darf nicht live gehen – erst bestätigen lassen" }
        : { show: "draft", value: fact.value };
    case "unbekannt":
      if (context.kind === "leadDemo") return { show: "placeholder" };
      if (context.kind === "customer" && context.stage === "preview") return { show: "placeholder" };
      return { show: "omit" };
    case "fiktiv":
      return context.kind === "showcase"
        ? { show: "value", value: fact.value }
        : { show: "violation", reason: "Erfundene Angabe auf der Seite eines echten Betriebs" };
  }
}

export type FactAudit = {
  readonly violations: readonly { readonly field: string; readonly reason: string }[];
  readonly drafts: readonly string[];
  readonly placeholders: readonly string[];
  readonly omitted: readonly string[];
};

/** Prüft alle Angaben eines Profils auf einmal – Grundlage für das Veröffentlichungs-Gate. */
export function auditFacts(facts: Readonly<Record<string, Fact<unknown>>>, context: GateContext): FactAudit {
  const violations: { field: string; reason: string }[] = [];
  const drafts: string[] = [];
  const placeholders: string[] = [];
  const omitted: string[] = [];

  for (const [field, fact] of Object.entries(facts)) {
    const outcome = gate(fact, context);
    if (outcome.show === "violation") violations.push({ field, reason: outcome.reason });
    if (outcome.show === "draft") drafts.push(field);
    if (outcome.show === "placeholder") placeholders.push(field);
    if (outcome.show === "omit") omitted.push(field);
  }
  return { violations, drafts, placeholders, omitted };
}

export type PagePolicy = {
  /** `noindex, nofollow` setzen. */
  readonly noindex: boolean;
  /** Nicht in öffentlichen Übersichten oder Sitemaps führen; Adresse nicht erratbar. */
  readonly unlisted: boolean;
  /** Pflichthinweis oben auf jeder Seite, `null` = keiner. */
  readonly notice: string | null;
};

/** Pflichten je Projektart (ADR 0014, 0016). */
export function pagePolicy(context: GateContext, businessName: string | null = null): PagePolicy {
  switch (context.kind) {
    case "showcase":
      return {
        noindex: true,
        unlisted: false,
        notice: "Beispielseite des Studios – dieser Betrieb ist frei erfunden.",
      };
    case "leadDemo":
      return {
        noindex: true,
        unlisted: true,
        notice: businessName
          ? `Konzeptentwurf des Studios – nicht die offizielle Website von ${businessName}.`
          : "Konzeptentwurf des Studios – nicht die offizielle Website dieses Betriebs.",
      };
    case "customer":
      return context.stage === "live"
        ? { noindex: false, unlisted: false, notice: null }
        : { noindex: true, unlisted: true, notice: "Vorschau – noch nicht freigegeben." };
  }
}
