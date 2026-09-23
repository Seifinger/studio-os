import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseServerEnv, SERVER_ENV_VARIABLES } from "./env";

const SECRET = "geheim-7f3a9c";

function issuesOf(result: ReturnType<typeof parseServerEnv>) {
  if (result.ok) throw new Error("Erwartet: ungültige Konfiguration");
  return result.issues;
}

describe("parseServerEnv", () => {
  it("akzeptiert eine leere Umgebung: keine Integration ist Pflicht", () => {
    const result = parseServerEnv({});
    expect(result).toEqual({ ok: true, env: { NODE_ENV: "development" } });
  });

  it("behandelt leere und reine Leerzeichen-Werte wie nicht gesetzt", () => {
    const result = parseServerEnv({ GOOGLE_PLACES_API_KEY: "", SUPABASE_URL: "   ", EMAIL_FROM: "" });
    expect(result.ok).toBe(true);
    expect(result.ok && result.env.GOOGLE_PLACES_API_KEY).toBeUndefined();
  });

  it("übernimmt gesetzte Schlüssel getrimmt und ignoriert fremde Variablen", () => {
    const result = parseServerEnv({ GOOGLE_PLACES_API_KEY: `  ${SECRET}  `, PATH: "/usr/bin" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.env.GOOGLE_PLACES_API_KEY).toBe(SECRET);
    expect(result.env).not.toHaveProperty("PATH");
  });

  it("verlangt Supabase-URL und Service-Role-Key nur gemeinsam", () => {
    expect(issuesOf(parseServerEnv({ SUPABASE_URL: "https://abc.supabase.co" }))).toEqual([
      { variable: "SUPABASE_SERVICE_ROLE_KEY", message: "fehlt, obwohl SUPABASE_URL gesetzt ist" },
    ]);
    expect(issuesOf(parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: SECRET }))).toEqual([
      { variable: "SUPABASE_URL", message: "fehlt, obwohl SUPABASE_SERVICE_ROLE_KEY gesetzt ist" },
    ]);
    expect(
      parseServerEnv({ SUPABASE_URL: "https://abc.supabase.co", SUPABASE_SERVICE_ROLE_KEY: SECRET }).ok,
    ).toBe(true);
  });

  it.each(["http://abc.supabase.co", "abc.supabase.co", "ftp://abc.supabase.co"])(
    "lehnt die Supabase-URL %j ab (nur https)",
    (url) => {
      const issues = issuesOf(parseServerEnv({ SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: SECRET }));
      expect(issues).toContainEqual({ variable: "SUPABASE_URL", message: "muss eine https-URL sein" });
    },
  );

  it.each(["studio@example.com", "Studio OS <studio@example.com>"])("akzeptiert den Absender %j", (from) => {
    expect(parseServerEnv({ RESEND_API_KEY: SECRET, EMAIL_FROM: from }).ok).toBe(true);
  });

  it.each(["studio", "studio@", "<studio@example.com", "a b@example.com"])(
    "lehnt den Absender %j ab",
    (from) => {
      const issues = issuesOf(parseServerEnv({ RESEND_API_KEY: SECRET, EMAIL_FROM: from }));
      expect(issues.map((issue) => issue.variable)).toEqual(["EMAIL_FROM"]);
    },
  );

  it("lehnt einen unbekannten NODE_ENV ab", () => {
    expect(issuesOf(parseServerEnv({ NODE_ENV: "staging" }))).toEqual([
      { variable: "NODE_ENV", message: "muss development, test oder production sein" },
    ]);
  });

  it("lehnt Geheimnisse mit NEXT_PUBLIC_-Präfix ab, erlaubt aber harmlose öffentliche Werte", () => {
    const issues = issuesOf(
      parseServerEnv({
        NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: SECRET,
        NEXT_PUBLIC_SERVICE_TOKEN: SECRET,
        NEXT_PUBLIC_SITE_NAME: "Studio OS",
      }),
    );
    expect(issues.map((issue) => issue.variable)).toEqual([
      "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY",
      "NEXT_PUBLIC_SERVICE_TOKEN",
    ]);
    expect(parseServerEnv({ NEXT_PUBLIC_SITE_NAME: "Studio OS", NEXT_PUBLIC_API_KEY: "" }).ok).toBe(true);
  });

  it("gibt in Problemmeldungen nie Werte preis", () => {
    const result = parseServerEnv({
      SUPABASE_URL: `http://${SECRET}.example`,
      RESEND_API_KEY: SECRET,
      EMAIL_FROM: `${SECRET}-kein-absender`,
      NEXT_PUBLIC_ANTHROPIC_API_KEY: SECRET,
    });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain(SECRET);
  });
});

describe(".env.example", () => {
  const examplePath = fileURLToPath(new URL("../../.env.example", import.meta.url));
  const assignments = readFileSync(examplePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) => {
      const [name = "", ...rest] = line.split("=");
      return { name: name.trim(), value: rest.join("=").trim() };
    });

  it("enthält keine Werte", () => {
    expect(assignments.filter(({ value }) => value !== "")).toEqual([]);
  });

  it("beschreibt genau die Variablen des Schemas (außer NODE_ENV)", () => {
    const documented = assignments.map(({ name }) => name).sort();
    const known = SERVER_ENV_VARIABLES.filter((name) => name !== "NODE_ENV").toSorted();
    expect(documented).toEqual(known);
  });

  it("ist so, wie sie ist, eine gültige Konfiguration", () => {
    const source = Object.fromEntries(assignments.map(({ name, value }) => [name, value]));
    expect(parseServerEnv(source).ok).toBe(true);
  });
});
