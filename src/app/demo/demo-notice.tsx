import Link from "next/link";
import type { ReactNode } from "react";

/** Hinweisseite der Lead-Demos in funktionaler Studio-UI (DESIGN.md §2). */
export function DemoNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="inhalt" className="mx-auto max-w-[44rem] px-6 pb-24 pt-16">
      <p className="font-mono text-sm text-ink-muted">
        <Link href="/demo">Lead-Demos</Link> · nur lokal
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold leading-tight">{title}</h1>
      <div className="mt-6 grid gap-4 leading-relaxed text-ink-muted">{children}</div>
    </main>
  );
}
