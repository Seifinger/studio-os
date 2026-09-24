import type { NextConfig } from "next";

// Zwei Build-Ziele (ADR 0020):
// - live (Standard): Studio mit Serverfunktionen – Health-Check, Lead-Demos, später Dashboard.
// - showcases: statischer Export der Beispielseiten für GitHub Pages. Nur Dateien ohne ".live"
//   gehören dazu; Serverrouten (".live.ts/.live.tsx") fallen über pageExtensions heraus.
const target = process.env.STUDIO_BUILD_TARGET ?? "live";
if (target !== "live" && target !== "showcases") {
  throw new Error(`STUDIO_BUILD_TARGET muss "live" oder "showcases" sein, nicht "${target}"`);
}

// GitHub Pages liefert Projektseiten unter /<repository>/ aus.
const basePath = process.env.SHOWCASE_BASE_PATH ?? "";
if (!/^(?:\/[a-z0-9-]+)*$/.test(basePath)) {
  throw new Error(`SHOWCASE_BASE_PATH muss wie "/studio-demos" aussehen, nicht "${basePath}"`);
}

// Grundlegende Sicherheits-Header für alle Antworten. Eine Content-Security-Policy
// mit Nonces folgt mit den ersten Kundenseiten (siehe docs/decisions/0010-sicherheits-header.md).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig =
  target === "showcases"
    ? {
        poweredByHeader: false,
        reactStrictMode: true,
        output: "export",
        // Jede Seite als Ordner mit index.html – so liefert GitHub Pages sie ohne Umleitung aus.
        trailingSlash: true,
        basePath,
        pageExtensions: ["export.tsx", "tsx", "ts"],
        images: { unoptimized: true },
      }
    : {
        poweredByHeader: false,
        reactStrictMode: true,
        pageExtensions: ["live.tsx", "live.ts", "tsx", "ts"],
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      };

export default nextConfig;
