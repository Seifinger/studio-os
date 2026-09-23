import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Studio OS", template: "%s · Studio OS" },
  description: "Werkzeug eines Website-Studios für lokale Betriebe.",
  // Das Studio ist kein öffentliches Angebot und gehört nicht in Suchmaschinen.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:px-4 focus:py-2"
        >
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
