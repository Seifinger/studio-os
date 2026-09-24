import Link from "next/link";
import type { ReactNode } from "react";

import { type ActionSources, type ActionType, ACTION_ANCHORS, resolveAction, type ResolvedAction } from "@/domain/content/actions";
import { checkSignatures, type CreativeDirection, type SectionId } from "@/domain/design/creative-direction";
import { cuisineLabel } from "@/domain/gastronomy/cuisines";
import { isLiveSource } from "@/domain/provenance/fact";
import { pagePolicy } from "@/domain/provenance/gate";
import { assertRenderable } from "@/domain/quality/render-gate";

import { Hours, ImageSlots, Quotes, RequestForm, ServiceNotes, SignatureDishes, Specials, Story, Visit } from "./blocks";
import { Hero } from "./hero";
import { MenuSection } from "./menu";
import { isVisible, show, type SiteModel } from "./model";
import styles from "./site.module.css";
import { themeStyle } from "./theme";

// Eine Restaurant-Website aus Profil, Design Direction und Creative Direction. Reihenfolge,
// Gewicht und Überschriften der Abschnitte kommen aus der Dramaturgie – nicht aus einer Vorlage.

type Available = Extract<ResolvedAction, { available: true }>;
type RequestKind = "tableRequest" | "pickupRequest";

export type SiteChrome = {
  /** Rückweg zur Übersicht (Showcases). Pfade ohne basePath – next/link ergänzt ihn beim Export. */
  readonly overviewHref?: string | undefined;
  readonly impressumHref?: string | undefined;
  readonly datenschutzHref?: string | undefined;
  /** Zusätzlicher Hinweis in der Kopfleiste (z. B. Anfrage-Probe). */
  readonly notice?: string | undefined;
};

/** Profilfeld → Abschnitt, den ein belegtes Signature-Detail hervorhebt. */
const SIGNATURE_SECTION: Readonly<Record<string, SectionId>> = {
  story: "story",
  signatureDishes: "signatureDishes",
  menu: "menu",
  specials: "specials",
  openingHours: "hours",
  serviceNotes: "serviceNotes",
};

const NAV: readonly { readonly section: SectionId; readonly href: string; readonly label: string }[] = [
  { section: "menu", href: ACTION_ANCHORS.menu, label: "Speisekarte" },
  { section: "specials", href: "#aktuell", label: "Aktuell" },
  { section: "hours", href: "#zeiten", label: "Zeiten" },
  { section: "visit", href: ACTION_ANCHORS.visit, label: "Anfahrt" },
];

function sourcesOf(model: SiteModel): ActionSources {
  const { profile } = model;
  return {
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: profile.address,
    email: profile.email,
    onlineBooking: profile.onlineBooking,
    requestChannels: profile.requestChannels,
    menu: profile.menu,
  };
}

/** Welche Anfrageformulare die Seite zeigt. Lead-Demos zeigen die Tischanfrage als Möglichkeit. */
function requestKinds(model: SiteModel, sections: ReadonlySet<SectionId>): RequestKind[] {
  if (!sections.has("request")) return [];
  const channels = show(model.profile.requestChannels, model.context);
  if (isVisible(channels)) {
    return [...(channels.value.table ? (["tableRequest"] as const) : []), ...(channels.value.pickup ? (["pickupRequest"] as const) : [])];
  }
  return model.context.kind === "leadDemo" ? ["tableRequest"] : [];
}

export type SiteActions = {
  readonly primary: Available | null;
  readonly hero: readonly Available[];
  readonly visit: readonly Available[];
  readonly bar: readonly Available[];
  readonly requests: readonly RequestKind[];
};

/** Löst alle Handlungsaufforderungen der Seite über das Fakten-Gate auf. */
export function siteActions(model: SiteModel): SiteActions {
  const sections = new Set(model.creative.dramaturgy.map((entry) => entry.section));
  const requests = requestKinds(model, sections);
  const sources = sourcesOf(model);
  const menuShown = sections.has("menu") && show(model.profile.menu, model.context).kind !== "omit";

  const get = (type: ActionType): Available | null => {
    if ((type === "tableRequest" || type === "pickupRequest") && !requests.includes(type)) return null;
    if (type === "menu" && !menuShown) return null;
    const action = resolveAction(type, sources, model.context);
    return action.available ? action : null;
  };

  const wanted = show(model.profile.primaryAction, model.context);
  const preferred: ActionType[] = [...(isVisible(wanted) ? [wanted.value] : []), ...requests, "onlineBooking", "call", "menu"];
  const primary = preferred.map(get).find((action) => action !== null) ?? null;

  const second = (["menu", "call", "directions"] as const)
    .filter((type) => type !== primary?.type)
    .map(get)
    .find((action) => action !== null);
  const hero = [primary, second].filter((action): action is Available => Boolean(action));

  // In Beispielen springen Anruf und Route zur Besuchs-Sektion – dort selbst wären sie ein Kreis.
  const visit = (["directions", "call", "whatsapp", "onlineBooking"] as const)
    .map(get)
    .filter((action): action is Available => action !== null && action.href !== ACTION_ANCHORS.visit);

  const call = primary?.type === "call" ? get("directions") : get("call");
  const bar = [primary, call].filter((action): action is Available => Boolean(action));

  return { primary, hero, visit, bar, requests };
}

function usesGoogleData(model: SiteModel): boolean {
  if (model.googleLive) return true;
  return Object.values(model.profile).some((fact) => fact.status === "uebernommen" && isLiveSource(fact.source));
}

function renderSection(
  entry: CreativeDirection["dramaturgy"][number],
  model: SiteModel,
  actions: SiteActions,
  highlighted: ReadonlySet<SectionId>,
): ReactNode {
  const common = { model, weight: entry.weight, title: entry.title, signature: highlighted.has(entry.section) };
  switch (entry.section) {
    case "hero":
      return <Hero key="hero" model={model} actions={actions.hero} />;
    case "story":
      return <Story key="story" {...common} />;
    case "signatureDishes":
      return <SignatureDishes key="signatureDishes" {...common} />;
    case "menu":
      return <MenuSection key="menu" {...common} />;
    case "specials":
      return <Specials key="specials" {...common} />;
    case "hours":
      return <Hours key="hours" {...common} />;
    case "visit":
      return <Visit key="visit" {...common} actions={actions.visit} />;
    case "request":
      // Die eigene Überschrift gilt dem ersten Formular; ein zweites trägt seine Standardüberschrift.
      return actions.requests.map((kind, index) => <RequestForm key={kind} {...common} title={index === 0 ? entry.title : undefined} kind={kind} />);
    case "serviceNotes":
      return <ServiceNotes key="serviceNotes" {...common} />;
    case "imageSlots":
      return <ImageSlots key="imageSlots" {...common} />;
    case "quotes":
      return <Quotes key="quotes" {...common} />;
  }
}

export function RestaurantSite({ model, chrome = {} }: { model: SiteModel; chrome?: SiteChrome }) {
  // Bricht den Build ab, wenn eine Angabe gegen das Fakten-Gate verstößt (ADR 0018).
  assertRenderable(model.profile, model.context);

  const { profile, context, creative, direction } = model;
  const name = show(profile.name, context);
  const cuisine = show(profile.cuisine, context);
  const locality = show(profile.locality, context);
  const displayName = isVisible(name) ? name.value : "Ihr Restaurant";
  const policy = pagePolicy(context, isVisible(name) ? name.value : null);
  const actions = siteActions(model);

  const { kept } = checkSignatures(creative, profile, context);
  const highlighted = new Set(kept.flatMap((signature) => signature.evidence.flatMap((field) => SIGNATURE_SECTION[field] ?? [])));
  const sections = new Set(creative.dramaturgy.map((entry) => entry.section));
  const nav = NAV.filter((item) => sections.has(item.section) && (item.section !== "menu" || show(profile.menu, context).kind !== "omit"));
  const google = usesGoogleData(model);

  return (
    <div className={styles.site} style={themeStyle(direction)} data-motion={direction.motion.intensity}>
      {policy.notice ? (
        <div className={styles.notice} role="note">
          <p className={`${styles.inner} ${styles.noticeInner}`}>
            <span>{policy.notice}</span>
            {chrome.overviewHref ? <Link href={chrome.overviewHref}>Alle Beispiele</Link> : null}
          </p>
          {chrome.notice ? <p className={`${styles.inner} ${styles.noticeInner}`}>{chrome.notice}</p> : null}
        </div>
      ) : null}

      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.headerInner}`}>
          <a className={styles.brand} href="#titel">
            {displayName}
          </a>
          <nav className={styles.nav} aria-label="Seitenbereiche">
            <ul className={styles.navList}>
              {nav.map((item) => (
                <li key={item.href}>
                  <a className={styles.navLink} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
              {actions.primary ? (
                <li>
                  <a className={styles.button} href={actions.primary.href} data-demo={actions.primary.demoOnly || undefined}>
                    {actions.primary.label}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
          {nav.length > 0 ? (
            <details className={styles.menuToggle}>
              <summary>Menü</summary>
              <nav className={styles.menuPanel} aria-label="Seitenbereiche">
                {nav.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </details>
          ) : null}
        </div>
      </header>

      <main id="inhalt" className={styles.main}>
        {creative.dramaturgy.map((entry) => renderSection(entry, model, actions, highlighted))}
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerGrid}`}>
          <div>
            <p className={styles.footerName}>{displayName}</p>
            <p className={styles.footerMeta}>
              {[isVisible(cuisine) ? cuisineLabel(cuisine.value) : null, isVisible(locality) ? locality.value : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className={styles.footerMeta}>
            {policy.notice ? <p>{policy.notice}</p> : null}
            {context.kind === "showcase" ? <p>Name, Adresse, Telefonnummer, Karte und Preise sind ausgedacht. Fotos folgen erst mit einem echten Haus.</p> : null}
            {google ? (
              <p className={styles.attribution}>
                Einzelne Angaben: Google Maps – beim Aufruf abgerufen, nicht gespeichert.
              </p>
            ) : null}
            {chrome.overviewHref || chrome.impressumHref || chrome.datenschutzHref ? (
              <ul className={styles.footerLinks}>
                {chrome.overviewHref ? (
                  <li>
                    <Link href={chrome.overviewHref}>Alle Beispiele</Link>
                  </li>
                ) : null}
                {chrome.impressumHref ? (
                  <li>
                    <Link href={chrome.impressumHref}>Impressum</Link>
                  </li>
                ) : null}
                {chrome.datenschutzHref ? (
                  <li>
                    <Link href={chrome.datenschutzHref}>Datenschutz</Link>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>
      </footer>

      {actions.bar.length > 0 ? (
        <nav className={styles.actionBar} aria-label="Schnellzugriff">
          {actions.bar.map((action) => (
            <a key={action.type} href={action.href} data-demo={action.demoOnly || undefined} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {action.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
