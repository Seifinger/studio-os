import "server-only";

import { z } from "zod";

// Einzige Stelle, die process.env liest (CLAUDE.md, Abschnitt 5).
// In der Foundation ist keine Variable Pflicht: Jede Integration ist ohne Wert abgeschaltet.

export type EnvSource = Readonly<Record<string, string | undefined>>;

/** Ein Konfigurationsproblem. Enthält nie den Wert der Variable. */
export type EnvIssue = { readonly variable: string; readonly message: string };

// .env-Dateien liefern "KEY=" als leeren String. Leer bedeutet "nicht gesetzt".
const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalSecret = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());

const optionalHttpsUrl = z.preprocess(
  emptyToUndefined,
  z.url({ protocol: /^https$/, error: "muss eine https-URL sein" }).optional(),
);

// Resend akzeptiert "adresse@domain.de" und "Name <adresse@domain.de>".
const SENDER = /^(?:[^<>@\n]+<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>|[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)$/;
const optionalSender = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(SENDER, { error: 'muss "adresse@domain.de" oder "Name <adresse@domain.de>" sein' })
    .optional(),
);

type Pair = readonly [string, string];

// Variablen, die nur gemeinsam Sinn ergeben. Eine halbe Konfiguration ist ein Fehler,
// keine abgeschaltete Integration – sonst fällt sie erst beim ersten Aufruf auf.
const REQUIRED_TOGETHER: readonly Pair[] = [
  ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  ["RESEND_API_KEY", "EMAIL_FROM"],
];

export const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"], {
        error: "muss development, test oder production sein",
      })
      .default("development"),
    GOOGLE_PLACES_API_KEY: optionalSecret,
    SUPABASE_URL: optionalHttpsUrl,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    RESEND_API_KEY: optionalSecret,
    EMAIL_FROM: optionalSender,
    VERCEL_TOKEN: optionalSecret,
    ANTHROPIC_API_KEY: optionalSecret,
  })
  .superRefine((env, ctx) => {
    const values: Readonly<Record<string, unknown>> = env;
    for (const [a, b] of REQUIRED_TOGETHER) {
      const hasA = values[a] !== undefined;
      const hasB = values[b] !== undefined;
      if (hasA !== hasB) {
        const missing = hasA ? b : a;
        const present = hasA ? a : b;
        ctx.addIssue({ code: "custom", path: [missing], message: `fehlt, obwohl ${present} gesetzt ist` });
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Alle Variablen, die studio-os kennt. */
export const SERVER_ENV_VARIABLES = Object.keys(serverEnvSchema.shape) as readonly (keyof ServerEnv)[];

// Werte mit NEXT_PUBLIC_ landen im Browser-Bundle. Geheimnisse dürfen dort nie stehen.
// Für den Browser gedachte, öffentliche Schlüssel (z. B. ein Supabase publishable key)
// werden nur mit ADR in diese Liste aufgenommen.
const PUBLIC_KEY_ALLOWLIST: readonly string[] = [];
const SECRET_LIKE_NAME = /KEY|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL/i;

function findPublicSecrets(source: EnvSource): EnvIssue[] {
  return Object.keys(source)
    .filter((name) => name.startsWith("NEXT_PUBLIC_"))
    .filter((name) => SECRET_LIKE_NAME.test(name.slice("NEXT_PUBLIC_".length)))
    .filter((name) => !PUBLIC_KEY_ALLOWLIST.includes(name))
    .filter((name) => (source[name] ?? "").trim() !== "")
    .map((name) => ({
      variable: name,
      message: "sieht nach einem Geheimnis aus und darf nicht mit NEXT_PUBLIC_ beginnen",
    }));
}

export type EnvResult =
  | { readonly ok: true; readonly env: ServerEnv }
  | { readonly ok: false; readonly issues: readonly EnvIssue[] };

/**
 * Prüft die Serverkonfiguration, ohne zu werfen. Problemmeldungen nennen
 * Variablennamen, aber nie Werte.
 */
export function parseServerEnv(source: EnvSource = process.env): EnvResult {
  const publicSecrets = findPublicSecrets(source);
  const parsed = serverEnvSchema.safeParse(source);

  const schemaIssues: EnvIssue[] = parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({
        variable: String(issue.path[0] ?? "(Konfiguration)"),
        message: issue.message,
      }));

  const issues = [...publicSecrets, ...schemaIssues];
  if (parsed.success && issues.length === 0) {
    return { ok: true, env: parsed.data };
  }
  return { ok: false, issues };
}
