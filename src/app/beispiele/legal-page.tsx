import Link from "next/link";
import type { ReactNode } from "react";

import { SHOWCASE_CHROME } from "./showcase-model";

/** Rahmen für Impressum und Datenschutz der Beispielseiten (funktionale Studio-UI). */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="inhalt" className="mx-auto max-w-[44rem] px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
      <p className="font-mono text-sm text-ink-muted">
        <Link href={SHOWCASE_CHROME.overviewHref}>Beispielseiten</Link>
      </p>
      <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight">{title}</h1>
      <div className="mt-8 grid gap-6 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold">{children}</div>
    </main>
  );
}
