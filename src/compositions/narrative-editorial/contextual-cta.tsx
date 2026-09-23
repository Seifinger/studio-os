"use client";

import { useEffect, useState } from "react";

import styles from "./narrative.module.css";

type Link = { readonly href: string; readonly label: string };

/**
 * Mobile Handlungsleiste, kontextbezogen (ADR 0022): Sie erscheint erst, wenn der Eingang aus dem
 * Bild ist, und tritt zurück, solange die Anfrage oder der Abschluss ohnehin sichtbar sind. Ohne
 * JavaScript bleibt sie verborgen – Kopf, Menü und Eingang tragen dieselben Wege.
 */
export function ContextualCta({ primary, secondary, hideWhileVisible }: { primary: Link; secondary: Link | null; hideWhileVisible: readonly string[] }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const targets = hideWhileVisible.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
    // Ohne Beobachtungsziele oder IntersectionObserver bleibt die Leiste verborgen (Wege gibt es genug).
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setHidden(visible.size > 0);
      },
      { threshold: 0.2 },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [hideWhileVisible]);

  return (
    <nav className={styles.bar} aria-label="Schnellzugriff" data-hidden={hidden || undefined} inert={hidden}>
      <a className={styles.barPrimary} href={primary.href}>
        {primary.label}
      </a>
      {secondary ? (
        <a className={styles.barSecondary} href={secondary.href}>
          {secondary.label}
        </a>
      ) : null}
    </nav>
  );
}
