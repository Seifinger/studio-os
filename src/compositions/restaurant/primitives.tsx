import type { ReactNode } from "react";

import type { ResolvedAction } from "@/domain/content/actions";
import type { SectionId } from "@/domain/design/creative-direction";

import type { RenderProfile } from "./model";
import { placeholderFor } from "./placeholders";
import styles from "./site.module.css";

export function Placeholder({ field, compact = false }: { field: keyof RenderProfile; compact?: boolean }) {
  const { title, question } = placeholderFor(field);
  return (
    <div className={styles.placeholder} data-compact={compact || undefined}>
      <p className={styles.placeholderTitle}>{title}</p>
      {!compact && question ? <p className={styles.placeholderQuestion}>Frage fürs Gespräch: {question}</p> : null}
    </div>
  );
}

/** Vorschläge sind sichtbar als Entwurf markiert (ARCHITECTURE.md §4.2). */
export function Draft({ draft, children }: { draft: boolean; children: ReactNode }) {
  if (!draft) return <>{children}</>;
  return (
    <span className={styles.draft}>
      {children}
      <span className={styles.draftMark}>Entwurf</span>
    </span>
  );
}

const LABELLED_ENTRY = /^([^:]{2,24}):\s+(.+)$/u;

/** Tafel-Eintrag: „Dienstag: Kalbsrahmgulasch“ wird zu kleiner Zeile über dem Gericht. */
export function BoardEntry({ text, draft }: { text: string; draft: boolean }) {
  const match = LABELLED_ENTRY.exec(text);
  if (!match) return <Draft draft={draft}>{text}</Draft>;
  return (
    <>
      <span className={styles.entryLabel}>{match[1]}</span> <Draft draft={draft}>{match[2]}</Draft>
    </>
  );
}

export function DraftBlock({ draft, children }: { draft: boolean; children: ReactNode }) {
  if (!draft) return <>{children}</>;
  return (
    <div className={styles.draftBlock}>
      <span className={styles.draftMark}>Entwurf</span>
      {children}
    </div>
  );
}

export function ActionLink({ action, variant }: { action: Extract<ResolvedAction, { available: true }>; variant: "primary" | "secondary" }) {
  return (
    <a
      className={variant === "primary" ? styles.button : styles.buttonSecondary}
      href={action.href}
      {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-demo={action.demoOnly || undefined}
    >
      {action.label}
      {action.draft ? <span className={styles.draftMark}>Entwurf</span> : null}
    </a>
  );
}

/** Rahmen jedes Abschnitts: Rhythmus, Gewicht und Signature-Hervorhebung aus der Creative Direction. */
export function Section({
  name,
  id,
  weight,
  labelledBy,
  signature = false,
  children,
}: {
  name: SectionId;
  id?: string | undefined;
  weight: string;
  labelledBy: string;
  signature?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} data-section={name} data-weight={weight} data-signature={signature || undefined} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

export function SectionHead({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <header className={styles.sectionHead} data-reveal>
      <p className={styles.label}>{label}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}
