import type { CSSProperties } from "react";

import type { ResolvedAction } from "@/domain/content/actions";
import { formatOpeningHours } from "@/domain/content/opening-hours";
import { cuisineLabel } from "@/domain/gastronomy/cuisines";

import { isVisible, show, type SiteModel } from "./model";
import styles from "./hero.module.css";
import { ActionLink, BoardEntry, Draft, Placeholder } from "./primitives";

type Available = Extract<ResolvedAction, { available: true }>;

const longestWord = (text: string) => Math.max(...text.split(/\s+/).map((word) => word.length), 6);

/** Länge der längeren Zeile, wenn der Name möglichst gleichmäßig auf zwei Zeilen verteilt wird. */
function balancedLine(text: string): number {
  const words = text.split(/\s+/);
  let best = text.length;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ").length;
    const second = words.slice(index).join(" ").length;
    best = Math.min(best, Math.max(first, second));
  }
  return Math.max(best, longestWord(text));
}

export function Hero({ model, actions }: { model: SiteModel; actions: readonly Available[] }) {
  const { profile, context, direction } = model;
  const name = show(profile.name, context);
  const locality = show(profile.locality, context);
  const cuisine = show(profile.cuisine, context);
  const concept = show(profile.conceptShort, context);
  const specials = show(profile.specials, context);
  const hours = show(profile.openingHours, context);

  const title = isVisible(name) ? name.value : "Ihr Restaurant";
  const kicker = [isVisible(cuisine) ? cuisineLabel(cuisine.value) : null, isVisible(locality) ? locality.value : null]
    .filter(Boolean)
    .join(" · ");
  const layout = direction.layout.hero === "split-editorial" ? "split" : "immersive";

  return (
    <section className={styles.hero} data-section="hero" data-layout={layout} aria-labelledby="titel">
      <div className={styles.main}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h1 id="titel" className={styles.title} style={{ "--name-chars": longestWord(title), "--name-line": balancedLine(title) } as CSSProperties} data-settle>
          {title}
        </h1>
        <div className={styles.body}>
          {isVisible(concept) ? (
            <p className={styles.lead}>
              <Draft draft={concept.kind === "draft"}>{concept.value}</Draft>
            </p>
          ) : concept.kind === "placeholder" ? (
            <Placeholder field="conceptShort" compact />
          ) : null}
          {model.googleLive?.rating ? (
            <p className={styles.rating}>
              {model.googleLive.rating.value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} von 5 ·{" "}
              {model.googleLive.rating.count.toLocaleString("de-DE")} Bewertungen auf Google Maps
            </p>
          ) : null}
          {actions.length > 0 ? (
            <div className={styles.actions}>
              {actions.map((action, index) => (
                <ActionLink key={action.type} action={action} variant={index === 0 ? "primary" : "secondary"} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {layout === "split" ? (
        <aside className={styles.board} aria-label={isVisible(specials) ? "Aktuell" : "Öffnungszeiten"}>
          {isVisible(specials) ? (
            <>
              <p className={styles.boardLabel}>Aktuell</p>
              <ul className={styles.boardList}>
                {specials.value.map((entry) => (
                  <li key={entry}>
                    <BoardEntry text={entry} draft={specials.kind === "draft"} />
                  </li>
                ))}
              </ul>
            </>
          ) : isVisible(hours) ? (
            <>
              <p className={styles.boardLabel}>Geöffnet</p>
              <ul className={styles.boardList}>
                {formatOpeningHours(hours.value).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <Placeholder field="specials" compact />
          )}
        </aside>
      ) : null}
    </section>
  );
}
