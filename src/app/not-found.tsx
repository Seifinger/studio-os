import Link from "next/link";

export default function NotFound() {
  return (
    <main id="inhalt" className="mx-auto max-w-[44rem] px-6 py-24">
      <p className="font-mono text-sm text-ink-muted">404</p>
      <h1 className="mt-4 text-[1.75rem] font-semibold leading-tight">Diese Seite gibt es nicht.</h1>
      <p className="mt-6">
        <Link href="/">Zur Startseite</Link>
      </p>
    </main>
  );
}
