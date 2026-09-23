import type { CSSProperties } from "react";

import type { ResolvedAction } from "@/domain/content/actions";
import { openingHoursRows } from "@/domain/content/opening-hours";
import { resolveImageSlot } from "@/domain/design/image-plan";

import styles from "./blocks.module.css";
import { isVisible, show, type SiteModel } from "./model";
import { ActionLink, BoardEntry, Draft, DraftBlock, Placeholder, Section, SectionHead } from "./primitives";

export type BlockProps = { model: SiteModel; weight: string; title?: string | undefined; signature?: boolean | undefined };
type Available = Extract<ResolvedAction, { available: true }>;

export function Story({ model, weight, title, signature }: BlockProps) {
  const story = show(model.profile.story, model.context);
  const usp = show(model.profile.usp, model.context);
  if (story.kind === "omit") return null;
  const [first, ...rest] = isVisible(story) ? story.value.split(/(?<=[.!?])\s+/) : [];
  return (
    <Section name="story" weight={weight} labelledBy="haus-titel" signature={signature}>
      <div className={styles.story}>
        <SectionHead label="Das Haus" title={title ?? "Über das Haus"} id="haus-titel" />
        <div>
          {isVisible(story) ? (
            <DraftBlock draft={story.kind === "draft"}>
              <p className={styles.storyLead}>{first}</p>
              {rest.length > 0 ? <p>{rest.join(" ")}</p> : null}
            </DraftBlock>
          ) : (
            <Placeholder field="story" />
          )}
          {isVisible(usp) ? (
            <p className={styles.usp}>
              <Draft draft={usp.kind === "draft"}>{usp.value}</Draft>
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

export function SignatureDishes({ model, weight, title, signature }: BlockProps) {
  const dishes = show(model.profile.signatureDishes, model.context);
  if (dishes.kind === "omit") return null;
  return (
    <Section name="signatureDishes" weight={weight} labelledBy="hausgerichte-titel" signature={signature}>
      <SectionHead label="Hausgerichte" title={title ?? "Dafür kommt man"} id="hausgerichte-titel" />
      {isVisible(dishes) ? (
        <ol className={styles.dishes}>
          {dishes.value.map((dish) => (
            <li key={dish}>
              <Draft draft={dishes.kind === "draft"}>{dish}</Draft>
            </li>
          ))}
        </ol>
      ) : (
        <Placeholder field="signatureDishes" />
      )}
    </Section>
  );
}

export function Specials({ model, weight, title, signature }: BlockProps) {
  const specials = show(model.profile.specials, model.context);
  if (specials.kind === "omit") return null;
  return (
    <Section name="specials" id="aktuell" weight={weight} labelledBy="aktuell-titel" signature={signature}>
      <div className={styles.board}>
        <p className={styles.boardLabel}>Aktuell</p>
        <h2 id="aktuell-titel" className={styles.boardTitle}>
          {title ?? "Tageskarte"}
        </h2>
        {isVisible(specials) ? (
          <ul className={styles.boardList}>
            {specials.value.map((entry) => (
              <li key={entry}>
                <BoardEntry text={entry} draft={specials.kind === "draft"} />
              </li>
            ))}
          </ul>
        ) : (
          <Placeholder field="specials" />
        )}
      </div>
    </Section>
  );
}

export function Hours({ model, weight, title, signature }: BlockProps) {
  const hours = show(model.profile.openingHours, model.context);
  if (hours.kind === "omit") return null;
  return (
    <Section name="hours" id="zeiten" weight={weight} labelledBy="zeiten-titel" signature={signature}>
      <div className={styles.split}>
        <SectionHead label="Öffnungszeiten" title={title ?? "Wann wir da sind"} id="zeiten-titel" />
        {isVisible(hours) ? (
          <DraftBlock draft={hours.kind === "draft"}>
            <ul className={styles.hours}>
              {openingHoursRows(hours.value).map((row) => (
                <li key={row.days}>
                  <span className={styles.days}>{row.days}</span>
                  <span className={styles.times}>{row.times}</span>
                </li>
              ))}
            </ul>
            {hours.value.note ? <p className={styles.note}>{hours.value.note}</p> : null}
          </DraftBlock>
        ) : (
          <Placeholder field="openingHours" />
        )}
      </div>
    </Section>
  );
}

export function ServiceNotes({ model, weight, title, signature }: BlockProps) {
  const notes = show(model.profile.serviceNotes, model.context);
  if (!isVisible(notes)) return null;
  return (
    <Section name="serviceNotes" weight={weight} labelledBy="regeln-titel" signature={signature}>
      <div className={styles.split}>
        <SectionHead label="Gut zu wissen" title={title ?? "Hausregeln"} id="regeln-titel" />
        <ul className={styles.notes}>
          {notes.value.map((note) => (
            <li key={note}>
              <Draft draft={notes.kind === "draft"}>{note}</Draft>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function Visit({ model, weight, title, actions }: BlockProps & { actions: readonly Available[] }) {
  const { profile, context } = model;
  const address = show(profile.address, context);
  const phone = show(profile.phone, context);
  const name = show(profile.name, context);
  return (
    <Section name="visit" id="besuch" weight={weight} labelledBy="besuch-titel">
      <div className={styles.split}>
        <SectionHead label="Besuch" title={title ?? "So finden Sie uns"} id="besuch-titel" />
        <div className={styles.visit}>
          <address className={styles.address}>
            {isVisible(name) ? <strong>{name.value}</strong> : null}
            {isVisible(address) ? (
              <Draft draft={address.kind === "draft"}>
                <span>{address.value.street}</span>
                <span>
                  {address.value.postalCode} {address.value.locality}
                </span>
              </Draft>
            ) : address.kind === "placeholder" ? (
              <Placeholder field="address" compact />
            ) : null}
            {isVisible(phone) ? (
              <span>
                Telefon <Draft draft={phone.kind === "draft"}>{phone.value.display}</Draft>
              </span>
            ) : phone.kind === "placeholder" ? (
              <Placeholder field="phone" compact />
            ) : null}
          </address>
          {actions.length > 0 ? (
            <div className={styles.visitActions}>
              {actions.map((action) => (
                <ActionLink key={action.type} action={action} variant="secondary" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

export function RequestForm({ model, weight, title, kind }: BlockProps & { kind: "tableRequest" | "pickupRequest" }) {
  const demo = model.context.kind !== "customer";
  const table = kind === "tableRequest";
  const id = table ? "tisch-anfragen" : "abholung-anfragen";
  return (
    <Section name="request" id={id} weight={weight} labelledBy={`${id}-titel`}>
      <div className={styles.split}>
        <div>
          <SectionHead label={table ? "Tisch anfragen" : "Abholung anfragen"} title={title ?? (table ? "Einen Tisch anfragen" : "Zum Abholen bestellen")} id={`${id}-titel`} />
          <p className={styles.formIntro}>
            {table
              ? "Die Anfrage geht per E-Mail an das Haus. Sie bekommen eine Bestätigung, sobald der Tisch frei ist."
              : "Die Bestellung geht per E-Mail an das Haus. Bezahlt wird bei der Abholung."}
          </p>
        </div>
        <form className={styles.form} aria-describedby={demo ? `${id}-demo` : undefined}>
          <div className={styles.field}>
            <label htmlFor={`${id}-name`}>Name</label>
            <input id={`${id}-name`} name="name" autoComplete="name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-telefon`}>Telefon</label>
            <input id={`${id}-telefon`} name="telefon" type="tel" autoComplete="tel" inputMode="tel" required />
          </div>
          {table ? (
            <>
              <div className={styles.field}>
                <label htmlFor={`${id}-datum`}>Datum</label>
                <input id={`${id}-datum`} name="datum" type="date" required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-uhrzeit`}>Uhrzeit</label>
                <input id={`${id}-uhrzeit`} name="uhrzeit" type="time" step={900} required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-personen`}>Personen</label>
                <input id={`${id}-personen`} name="personen" type="number" inputMode="numeric" min={1} max={30} required />
              </div>
            </>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor={`${id}-abholzeit`}>Abholzeit</label>
                <input id={`${id}-abholzeit`} name="abholzeit" type="time" step={900} required />
              </div>
              <div className={styles.fieldWide}>
                <label htmlFor={`${id}-bestellung`}>Was dürfen wir vorbereiten?</label>
                <textarea id={`${id}-bestellung`} name="bestellung" rows={3} required />
              </div>
            </>
          )}
          {table ? (
            <div className={styles.fieldWide}>
              <label htmlFor={`${id}-nachricht`}>Anmerkung (optional)</label>
              <textarea id={`${id}-nachricht`} name="nachricht" rows={3} />
            </div>
          ) : null}
          <div className={styles.formFooter}>
            <button type="submit" className={styles.submit} disabled={demo}>
              {table ? "Anfrage senden" : "Bestellung senden"}
            </button>
            {demo ? (
              <p id={`${id}-demo`} className={styles.demoNote}>
                In dieser Demo wird nichts verschickt. Auf Ihrer Website landet die Anfrage per E-Mail bei Ihnen.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </Section>
  );
}

export function ImageSlots({ model, weight, title }: BlockProps) {
  const layout = model.direction.layout.gallery;
  if (layout === "none" || model.imageSlots.length === 0) return null;
  // Eine seitlich scrollende Reihe muss per Tastatur erreichbar sein.
  const scroller = layout === "horizontal-scroll" ? ({ tabIndex: 0, role: "region", "aria-label": "Bildplätze, seitlich scrollbar" } as const) : {};
  return (
    <Section name="imageSlots" weight={weight} labelledBy="bilder-titel">
      <SectionHead label="Bildplätze" title={title ?? "Fotos aus dem Haus"} id="bilder-titel" />
      <div className={styles.gallery} data-layout={layout} {...scroller}>
        {model.imageSlots.map((slot) => {
          const outcome = resolveImageSlot(slot);
          return (
            <figure
              key={slot.id}
              className={styles.slot}
              style={{ "--ratio-mobile": slot.crop.mobile.replace(":", "/"), "--ratio-desktop": slot.crop.desktop.replace(":", "/") } as CSSProperties}
            >
              {outcome.show === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung
                <img src={outcome.asset.src} alt={slot.alt} loading="lazy" style={{ objectPosition: `${slot.crop.focus.x}% ${slot.crop.focus.y}%` }} />
              ) : (
                <div className={styles.slotFrame}>
                  <span className={styles.slotLabel}>Bildplatz</span>
                  <span className={styles.slotMotif}>{slot.motif}</span>
                </div>
              )}
              <figcaption className={styles.slotCaption}>
                {outcome.show === "image" ? slot.alt : `Foto folgt · ${outcome.reason}`}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}

export function Quotes({ model, weight, title }: BlockProps) {
  const quotes = show(model.profile.guestQuotes, model.context);
  if (quotes.kind === "omit") return null;
  return (
    <Section name="quotes" weight={weight} labelledBy="stimmen-titel">
      <SectionHead label="Gäste" title={title ?? "Was Gäste sagen"} id="stimmen-titel" />
      {isVisible(quotes) ? (
        <DraftBlock draft={quotes.kind === "draft"}>
          <div className={styles.quotes}>
            {quotes.value.map((quote) => (
              <figure key={`${quote.author}-${quote.text.slice(0, 24)}`} className={styles.quote}>
                <blockquote>
                  <p>{quote.text}</p>
                </blockquote>
                <figcaption>
                  {quote.author} · {quote.origin}
                </figcaption>
              </figure>
            ))}
          </div>
        </DraftBlock>
      ) : (
        <Placeholder field="guestQuotes" />
      )}
    </Section>
  );
}
