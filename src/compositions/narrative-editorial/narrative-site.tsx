import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { composeNarrative, type NarrativeConfig, type ResolvedStep, SECTION_ANCHORS } from "@studio/design-system/composition/narrative-editorial";
import { briefsForSection, type ImageBrief, imageBriefsFor } from "@studio/design-system/media/image-briefs";
import { motionAttributes, motionVariables, resolveMotion } from "@studio/design-system/motion/narrative-editorial";
import { themeVariables } from "@studio/design-system/themes/css";
import type { Theme } from "@studio/design-system/themes/schema";

import { type ActionSources, type ActionType, resolveAction } from "@/domain/content/actions";
import { openingHoursRows } from "@/domain/content/opening-hours";
import { fontById } from "@/domain/design/fonts";
import { allergenLabels, formatMenuPrice, type Menu, type MenuItem } from "@/domain/gastronomy/menu";
import { cuisineLabel } from "@/domain/gastronomy/cuisines";
import { type GateContext, pagePolicy } from "@/domain/provenance/gate";
import { assertRenderable } from "@/domain/quality/render-gate";

import { isVisible, type RenderProfile, show } from "../restaurant/model";
import { NAME_FIT } from "../restaurant/theme";
import { ContextualCta } from "./contextual-cta";
import styles from "./narrative.module.css";

// Komposition „narrative-editorial“ (ADR 0022): Akte statt Abschnitte, Erzählung vor Karte, ein
// primärer Weg. Reihenfolge, Akte und Überschriften kommen aus der NarrativeConfig des Hauses,
// Aussehen und Bewegung aus dem Theme. Jede Angabe läuft über das Fakten-Gate.

export type NarrativeChrome = {
  readonly overviewHref?: string | undefined;
  readonly impressumHref?: string | undefined;
  readonly datenschutzHref?: string | undefined;
};

export type NarrativeSiteProps = {
  readonly theme: Theme;
  readonly profile: RenderProfile;
  readonly config: NarrativeConfig;
  readonly context: GateContext;
  readonly chrome?: NarrativeChrome;
};

type Cta = { readonly href: string; readonly label: string; readonly demoOnly: boolean };

const NAV_LABELS = { story: "Geschichte", menu: "Karte", atmosphere: "Raum", visit: "Anfahrt", reservation: "Reservieren" } as const;

const SECTION_TITLES = {
  story: "Die Geschichte",
  craft: "Handwerk",
  menu: "Die Karte",
  atmosphere: "Der Raum",
  reservation: "Tisch anfragen",
  visit: "Anfahrt und Zeiten",
  closing: "Bis bald",
} as const;

const ROLE_LABEL = { beweis: "Beleg", stimmung: "Stimmung", orientierung: "Orientierung" } as const;

/** Sprungziel ohne Umlaute: „Süßes und Chai“ → „suesses-und-chai“. */
function slug(text: string): string {
  return text
    .toLocaleLowerCase("de-DE")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const longestWord = (text: string) => Math.max(...text.split(/\s+/).map((word) => word.length), 5);

function paragraphs(story: string): string[] {
  const blocks = story.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  const [first = "", ...rest] = story.split(/(?<=[.!?])\s+/);
  return rest.length > 0 ? [first, rest.join(" ")] : [first];
}

function actions(profile: RenderProfile, config: NarrativeConfig, context: GateContext): { primary: Cta | null; secondary: Cta | null } {
  const sources: ActionSources = {
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: profile.address,
    email: profile.email,
    onlineBooking: profile.onlineBooking,
    requestChannels: profile.requestChannels,
    menu: profile.menu,
  };
  // Seiteninterne Ziele zeigen auf die Abschnitte dieser Komposition.
  const inPage: Partial<Record<ActionType, string>> = {
    tableRequest: `#${SECTION_ANCHORS.reservation}`,
    pickupRequest: `#${SECTION_ANCHORS.reservation}`,
    menu: `#${SECTION_ANCHORS.menu}`,
  };
  const resolve = (type: ActionType): Cta | null => {
    const action = resolveAction(type, sources, context);
    if (!action.available) return null;
    const href = action.href.startsWith("#") ? (inPage[type] ?? `#${SECTION_ANCHORS.visit}`) : action.href;
    return { href, label: action.label, demoOnly: action.demoOnly };
  };
  return { primary: resolve(config.primaryAction), secondary: resolve(config.secondaryAction) };
}

function CtaLink({ cta, variant, tone }: { cta: Cta; variant: "primary" | "secondary"; tone: "night" | "paper" }) {
  return (
    <a className={variant === "primary" ? styles.ctaPrimary : styles.ctaSecondary} data-tone={tone} href={cta.href} data-demo={cta.demoOnly || undefined}>
      {cta.label}
    </a>
  );
}

function BriefFrame({ brief, tone }: { brief: ImageBrief; tone: "night" | "paper" }) {
  const style = {
    "--ratio-d": brief.format.desktop.replace(":", "/"),
    "--ratio-m": brief.format.mobile.replace(":", "/"),
  } as CSSProperties;
  return (
    <figure className={styles.frame} data-tone={tone}>
      <div className={styles.frameWindow} style={style}>
        <div className={styles.frameInner} data-drift>
          <span className={styles.frameLabel}>Bildplatz · {ROLE_LABEL[brief.role]}</span>
          <span className={styles.frameSubject}>{brief.subject}</span>
          <span className={styles.frameLight}>{brief.light}</span>
        </div>
      </div>
      <figcaption className={styles.caption}>Foto folgt – eigenes Foto des Hauses, Format {brief.format.desktop}</figcaption>
    </figure>
  );
}

function SectionHead({ step, label, id }: { step: ResolvedStep; label: string; id: string }) {
  const kind = step.kind as keyof typeof SECTION_TITLES;
  return (
    <header className={styles.head} data-reveal>
      <p className={styles.label}>{label}</p>
      <h2 id={id} className={styles.h2}>
        {step.title ?? SECTION_TITLES[kind] ?? label}
      </h2>
    </header>
  );
}

function MenuItemRow({ item, leaders }: { item: MenuItem; leaders: boolean }) {
  const allergens = allergenLabels(item);
  const meta = [...item.dietary, ...(allergens.length > 0 ? [`Allergene: ${allergens.join(", ")}`] : [])].join(" · ");
  return (
    <li className={styles.menuItem}>
      <p className={styles.menuRow}>
        <span className={styles.menuName}>{item.name}</span>
        {leaders ? <span className={styles.menuLeader} aria-hidden="true" /> : null}
        <span className={styles.menuPrice}>{formatMenuPrice(item)}</span>
      </p>
      {item.description ? <p className={styles.menuDescription}>{item.description}</p> : null}
      {meta ? <p className={styles.menuMeta}>{meta}</p> : null}
    </li>
  );
}

function MenuBody({ menu, theme }: { menu: Menu; theme: Theme }) {
  return (
    <>
      <nav className={styles.categoryNav} aria-label="Kategorien der Karte">
        <ul>
          {menu.sections.map((section) => (
            <li key={section.title}>
              <a href={`#karte-${slug(section.title)}`}>{section.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.menuGrid}>
        {menu.sections.map((section) => (
          <section key={section.title} id={`karte-${slug(section.title)}`} className={styles.menuGroup} aria-labelledby={`karte-${slug(section.title)}-titel`}>
            <h3 id={`karte-${slug(section.title)}-titel`} className={styles.h3}>
              {section.title}
            </h3>
            {section.note ? <p className={styles.menuNote}>{section.note}</p> : null}
            <ul className={styles.menuList}>
              {section.items.map((item) => (
                <MenuItemRow key={item.name} item={item} leaders={theme.menu.leaders} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      {menu.note ? <p className={styles.small}>{menu.note}</p> : null}
    </>
  );
}

export function NarrativeSite({ theme, profile, config, context, chrome = {} }: NarrativeSiteProps) {
  // Bricht ab, wenn eine Angabe gegen das Fakten-Gate verstößt (ADR 0018).
  assertRenderable(profile, context);

  const name = show(profile.name, context);
  const displayName = isVisible(name) ? name.value : "Ihr Restaurant";
  const cuisine = show(profile.cuisine, context);
  const locality = show(profile.locality, context);
  const concept = show(profile.conceptShort, context);
  const usp = show(profile.usp, context);
  const story = show(profile.story, context);
  const proofs = show(profile.proofs, context);
  const dishes = show(profile.signatureDishes, context);
  const menu = show(profile.menu, context);
  const atmosphere = show(profile.atmosphere, context);
  const hours = show(profile.openingHours, context);
  const address = show(profile.address, context);
  const phone = show(profile.phone, context);
  const notes = show(profile.serviceNotes, context);

  const { steps } = composeNarrative(config, {
    claim: isVisible(usp),
    story: isVisible(story),
    craft: isVisible(proofs) || isVisible(dishes),
    menu: isVisible(menu),
    atmosphere: isVisible(atmosphere),
  });
  const present = new Set(steps.map((step) => step.kind));
  const briefs = imageBriefsFor(theme, { name: displayName, signatureDish: isVisible(dishes) ? dishes.value[0] : undefined });
  const policy = pagePolicy(context, isVisible(name) ? name.value : null);
  const { primary, secondary } = actions(profile, config, context);
  const motion = resolveMotion(theme.motion, { reducedMotion: false });
  const openRows = isVisible(hours) ? openingHoursRows(hours.value).filter((row) => row.times !== "Ruhetag") : [];
  const nav = theme.navigation.items.filter((item) => present.has(item));
  const kicker = theme.hero.kicker === "none" ? "" : [theme.hero.kicker === "cuisine-locality" && isVisible(cuisine) ? cuisineLabel(cuisine.value) : null, isVisible(locality) ? locality.value : null].filter(Boolean).join(" · ");

  const rootStyle = {
    ...themeVariables(theme),
    ...motionVariables(motion),
    "--name-chars": String(longestWord(displayName)),
    "--name-fit": String(NAME_FIT[fontById(theme.typography.display.font).category]),
  } as CSSProperties;

  const renderStep = (step: ResolvedStep): ReactNode => {
    const common = { id: step.anchor, "data-act": step.act, "data-act-change": step.actChange || undefined, "data-kind": step.kind } as const;
    const tone = step.act;
    switch (step.kind) {
      case "hero":
        return (
          <section key="hero" {...common} className={styles.hero} aria-labelledby="titel">
            <div className={`${styles.wrap} ${styles.heroInner}`}>
              <div className={styles.heroMain}>
                {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
                <h1 id="titel" className={styles.heroTitle}>
                  {displayName}
                </h1>
              </div>
              <div className={styles.heroFoot}>
                {isVisible(concept) ? <p className={styles.heroClaim}>{concept.value}</p> : null}
                <div className={styles.actions}>
                  {primary ? <CtaLink cta={primary} variant="primary" tone="night" /> : null}
                  {secondary && theme.hero.actions === 2 ? <CtaLink cta={secondary} variant="secondary" tone="night" /> : null}
                </div>
              </div>
              {openRows.length > 0 ? (
                <aside className={styles.heroHours} aria-label="Öffnungszeiten">
                  <p className={styles.label}>Geöffnet</p>
                  <ul>
                    {openRows.map((row) => (
                      <li key={row.days}>
                        <span className={styles.heroDays}>{row.days}</span> {row.times}
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>
          </section>
        );
      case "claim":
        return isVisible(usp) ? (
          <section key="claim" {...common} className={styles.claim} aria-label="Haltung des Hauses">
            <div className={styles.wrap}>
              <p className={styles.claimText} data-reveal-text>
                {usp.value}
              </p>
            </div>
          </section>
        ) : null;
      case "story": {
        if (!isVisible(story)) return null;
        const figures = briefsForSection(briefs, "story");
        return (
          <section key="story" {...common} className={styles.section} aria-labelledby="geschichte-titel">
            <div className={`${styles.wrap} ${styles.split}`}>
              <SectionHead step={step} label="Geschichte" id="geschichte-titel" />
              <div className={styles.storyBody}>
                {paragraphs(story.value).map((text, index) => (
                  <div key={text.slice(0, 32)} className={styles.storyChapter} data-rhythm={index % 2 === 0 ? "a" : "b"}>
                    <p className={index === 0 && theme.story.lead === "large" ? styles.lead : styles.body}>{text}</p>
                    {figures[index] ? <BriefFrame brief={figures[index]} tone={tone} /> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "craft": {
        const figure = briefsForSection(briefs, "craft")[0];
        return (
          <section key="craft" {...common} className={styles.section} aria-labelledby="handwerk-titel">
            <div className={`${styles.wrap} ${styles.split}`}>
              <SectionHead step={step} label="Handwerk" id="handwerk-titel" />
              <div className={styles.craftBody}>
                {isVisible(dishes) ? (
                  <ul className={styles.dishes} aria-label="Hausgerichte">
                    {dishes.value.map((dish) => (
                      <li key={dish}>{dish}</li>
                    ))}
                  </ul>
                ) : null}
                {isVisible(proofs) ? (
                  <ol className={styles.proofs} aria-label="Handgriffe">
                    {proofs.value.map((proof) => (
                      <li key={proof}>{proof}</li>
                    ))}
                  </ol>
                ) : null}
                {figure ? <BriefFrame brief={figure} tone={tone} /> : null}
              </div>
            </div>
          </section>
        );
      }
      case "menu":
        return isVisible(menu) ? (
          <section key="menu" {...common} className={styles.section} aria-labelledby="karte-titel">
            <div className={styles.wrap}>
              <SectionHead step={step} label="Karte" id="karte-titel" />
              <MenuBody menu={menu.value} theme={theme} />
            </div>
          </section>
        ) : null;
      case "atmosphere": {
        const figures = briefsForSection(briefs, "atmosphere");
        return (
          <section key="atmosphere" {...common} className={styles.section} aria-labelledby="raum-titel">
            <div className={styles.wrap}>
              <SectionHead step={step} label="Raum" id="raum-titel" />
              {isVisible(atmosphere) ? <p className={styles.lead}>{atmosphere.value}</p> : null}
            </div>
            {figures.length > 0 ? (
              <div className={styles.galleryWrap}>
                <div className={styles.gallery} role="region" aria-label="Bildreihe zum Raum, seitlich scrollbar" tabIndex={0}>
                  <ul>
                    {figures.map((brief) => (
                      <li key={brief.id}>
                        <BriefFrame brief={brief} tone={tone} />
                      </li>
                    ))}
                  </ul>
                </div>
                <p className={`${styles.wrap} ${styles.galleryHint}`}>Seitlich wischen oder mit den Pfeiltasten blättern.</p>
              </div>
            ) : null}
          </section>
        );
      }
      case "reservation": {
        const demo = context.kind !== "customer";
        return (
          <section key="reservation" {...common} className={styles.section} aria-labelledby="reservieren-titel">
            <div className={`${styles.wrap} ${styles.split}`}>
              <div>
                <SectionHead step={step} label="Reservieren" id="reservieren-titel" />
                <p className={styles.body}>Die Anfrage geht per E-Mail an das Haus. Sie bekommen eine Antwort, sobald der Tisch bestätigt ist.</p>
                {isVisible(notes) ? (
                  <ul className={styles.notes}>
                    {notes.value.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <form className={styles.form} aria-describedby={demo ? "anfrage-demo" : undefined}>
                <div className={styles.field}>
                  <label htmlFor="anfrage-name">Name</label>
                  <input id="anfrage-name" name="name" autoComplete="name" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="anfrage-telefon">Telefon</label>
                  <input id="anfrage-telefon" name="telefon" type="tel" autoComplete="tel" inputMode="tel" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="anfrage-datum">Datum</label>
                  <input id="anfrage-datum" name="datum" type="date" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="anfrage-uhrzeit">Uhrzeit</label>
                  <input id="anfrage-uhrzeit" name="uhrzeit" type="time" step={900} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="anfrage-personen">Personen</label>
                  <input id="anfrage-personen" name="personen" type="number" inputMode="numeric" min={1} max={12} required />
                </div>
                <div className={styles.fieldWide}>
                  <label htmlFor="anfrage-nachricht">Anmerkung (optional)</label>
                  <textarea id="anfrage-nachricht" name="nachricht" rows={3} />
                </div>
                <div className={styles.formFoot}>
                  <button type="submit" className={styles.submit} disabled={demo}>
                    Anfrage senden
                  </button>
                  {demo ? (
                    <p id="anfrage-demo" className={styles.small}>
                      In dieser Demo wird nichts verschickt. Auf der echten Website landet die Anfrage per E-Mail beim Haus.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </section>
        );
      }
      case "visit":
        return (
          <section key="visit" {...common} className={styles.section} aria-labelledby="anfahrt-titel">
            <div className={`${styles.wrap} ${styles.split}`}>
              <SectionHead step={step} label="Anfahrt" id="anfahrt-titel" />
              <div className={styles.visitBody}>
                <address className={styles.address}>
                  <strong>{displayName}</strong>
                  {isVisible(address) ? (
                    <>
                      <span>{address.value.street}</span>
                      <span>
                        {address.value.postalCode} {address.value.locality}
                      </span>
                    </>
                  ) : null}
                  {isVisible(phone) ? <span>Telefon {phone.value.display}</span> : null}
                </address>
                {isVisible(hours) ? (
                  <div>
                    <dl className={styles.hours}>
                      {openingHoursRows(hours.value).map((row) => (
                        <div key={row.days}>
                          <dt>{row.days}</dt>
                          <dd>{row.times}</dd>
                        </div>
                      ))}
                    </dl>
                    {hours.value.note ? <p className={styles.small}>{hours.value.note}</p> : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
      case "closing":
        return (
          <section key="closing" {...common} className={styles.closing} aria-labelledby="schluss-titel">
            <div className={styles.wrap}>
              <h2 id="schluss-titel" className={styles.closingTitle} data-reveal>
                {step.title ?? SECTION_TITLES.closing}
              </h2>
              <div className={styles.actions}>
                {primary ? <CtaLink cta={primary} variant="primary" tone="night" /> : null}
                {secondary ? <CtaLink cta={secondary} variant="secondary" tone="night" /> : null}
              </div>
              {theme.closing.showAddress && isVisible(address) ? (
                <p className={styles.closingMeta}>
                  {address.value.street}, {address.value.postalCode} {address.value.locality}
                </p>
              ) : null}
            </div>
          </section>
        );
    }
  };

  const hideFor = theme.motion.contextualCta.hideWhileVisible.map((kind) => SECTION_ANCHORS[kind]);

  return (
    <div className={styles.root} style={rootStyle} data-theme={theme.id} {...motionAttributes(motion)}>
      {policy.notice ? (
        <div className={styles.notice} role="note">
          <p className={styles.wrap}>
            <span>{policy.notice}</span>
            {chrome.overviewHref ? <Link href={chrome.overviewHref}>Alle Beispiele</Link> : null}
          </p>
        </div>
      ) : null}

      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <a className={styles.brand} href={`#${SECTION_ANCHORS.hero}`}>
            {displayName}
          </a>
          <nav className={styles.nav} aria-label="Hauptnavigation">
            <ul>
              {nav.map((item) => (
                <li key={item}>
                  <a href={`#${SECTION_ANCHORS[item]}`}>{NAV_LABELS[item]}</a>
                </li>
              ))}
            </ul>
          </nav>
          {theme.navigation.headerCta && primary ? (
            <a className={styles.headerCta} href={primary.href}>
              {primary.label}
            </a>
          ) : null}
          <details className={styles.sheet}>
            <summary className={styles.sheetToggle}>Menü</summary>
            <div className={styles.sheetPanel}>
              <nav aria-label="Hauptnavigation (mobil)">
                <ul>
                  {nav.map((item) => (
                    <li key={item}>
                      <a href={`#${SECTION_ANCHORS[item]}`}>{NAV_LABELS[item]}</a>
                    </li>
                  ))}
                </ul>
              </nav>
              {primary ? <CtaLink cta={primary} variant="primary" tone="night" /> : null}
            </div>
          </details>
        </div>
      </header>

      <main id="inhalt">{steps.map(renderStep)}</main>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <p className={styles.footerName}>{displayName}</p>
          <div className={styles.footerMeta}>
            {policy.notice ? <p>{policy.notice}</p> : null}
            {context.kind === "showcase" ? <p>Name, Adresse, Telefonnummer, Karte, Preise und Geschichte sind ausgedacht. Wo Fotos hingehören, steht die Bildaufgabe.</p> : null}
            <p>
              Gestaltet im Basissystem narrative-editorial, Theme „{theme.name}“.
            </p>
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
          </div>
        </div>
      </footer>

      {theme.mobile.stickyActionBar && primary ? (
        <ContextualCta
          primary={{ href: primary.href, label: primary.label }}
          secondary={secondary ? { href: secondary.href, label: secondary.label } : null}
          hideWhileVisible={hideFor}
        />
      ) : null}
    </div>
  );
}
