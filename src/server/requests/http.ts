import "server-only";

import { type RequestResponse, sentMessage } from "@/domain/requests/response";
import { DURATION_FIELD, FIELD_NAMES, HONEYPOT_FIELD, KIND_FIELD, REQUEST_FIELDS, type RequestKind } from "@/domain/requests/fields";
import type { RawForm } from "@/domain/requests/parse";

// HTTP-Grenze der Anfrage-Route: Körper begrenzt lesen, fremde Herkunft abweisen, Antwort als JSON
// (Formular mit JavaScript) oder als kleine HTML-Seite (Formular ohne JavaScript, progressive Verbesserung).

/** Ein ausgefülltes Formular hat wenige Kilobyte; mehr ist kein Gast. */
export const MAX_BODY_BYTES = 16 * 1024;

const ACCEPTED_FIELDS: readonly string[] = [...FIELD_NAMES, KIND_FIELD, HONEYPOT_FIELD, DURATION_FIELD];

export type FormRead = { readonly ok: true; readonly form: RawForm } | { readonly ok: false; readonly status: 400 | 413 | 415 };

async function readCapped(body: ReadableStream<Uint8Array> | null, max: number): Promise<Uint8Array | null> {
  if (!body) return new Uint8Array();
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Liest nur bekannte Textfelder; Dateien und fremde Felder fallen weg. */
export async function readRequestForm(request: Request): Promise<FormRead> {
  const contentType = request.headers.get("content-type") ?? "";
  const urlEncoded = contentType.startsWith("application/x-www-form-urlencoded");
  const multipart = contentType.startsWith("multipart/form-data");
  if (!urlEncoded && !multipart) return { ok: false, status: 415 };

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { ok: false, status: 413 };
  const bytes = await readCapped(request.body, MAX_BODY_BYTES);
  if (bytes === null) return { ok: false, status: 413 };

  let values: { get(name: string): FormDataEntryValue | null };
  try {
    values = urlEncoded
      ? new URLSearchParams(new TextDecoder().decode(bytes))
      : await new Response(bytes as BodyInit, { headers: { "content-type": contentType } }).formData();
  } catch {
    return { ok: false, status: 400 };
  }

  const form: Record<string, string> = {};
  for (const name of ACCEPTED_FIELDS) {
    const value = values.get(name);
    if (typeof value === "string") form[name] = value;
  }
  return { ok: true, form };
}

/**
 * Host der Anfrage. `Host` ist für fetch ein verbotener Header und fehlt dort; Next.js baut
 * `request.url` aus demselben Header, daher ist die URL der Ersatz.
 */
export function requestHost(request: Request): string {
  return request.headers.get("host") ?? new URL(request.url).host;
}

/**
 * Anfragen von fremden Seiten abweisen. Browser schicken bei POST `Origin` und meist `Sec-Fetch-Site`;
 * ohne beide (z. B. curl) entscheidet das Rate-Limit.
 */
export function isCrossSite(headers: Headers, host: string): boolean {
  if (headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = headers.get("origin");
  if (origin === null) return false;
  if (!URL.canParse(origin)) return true;
  return new URL(origin).host !== host;
}

/** Absender fürs Rate-Limit. Hinter dem Hoster setzt der Proxy X-Forwarded-For; lokal ist es fälschbar. */
export function clientKey(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get("x-real-ip")?.trim() || null;
}

export function wantsJson(headers: Headers): boolean {
  return (headers.get("accept") ?? "").includes("application/json");
}

export function httpStatusFor(response: RequestResponse): number {
  switch (response.status) {
    case "sent":
      return 200;
    case "invalid":
      return 422;
    case "limited":
      return 429;
    case "unavailable":
      return 503;
    case "failed":
      return 502;
  }
}

/** Zurück zur Seite mit dem Formular – nur innerhalb derselben Adresse, sonst zur Startseite. */
export function backHref(headers: Headers, host: string): string {
  const referer = headers.get("referer");
  if (!referer || !URL.canParse(referer)) return "/";
  const url = new URL(referer);
  return url.host === host ? `${url.pathname}${url.search}` : "/";
}

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

type PageContent = { readonly title: string; readonly paragraphs: readonly string[]; readonly errors: readonly string[] };

function contentFor(response: RequestResponse, kind: RequestKind | null): PageContent {
  switch (response.status) {
    case "sent": {
      const message = sentMessage(kind ?? "table", response.confirmation);
      return { title: message.title, paragraphs: [message.text], errors: [] };
    }
    case "invalid": {
      const labels = new Map<string, string>((kind ? REQUEST_FIELDS[kind] : []).map((field) => [field.name, field.label.replace(/ \(optional\)$/, "")]));
      const errors = Object.entries(response.fieldErrors).map(([field, message]) => `${labels.get(field) ?? field}: ${message}`);
      return {
        title: "Bitte prüfen Sie Ihre Angaben",
        paragraphs: [response.message, "Gehen Sie zurück – Ihre Eingaben sind meist noch da."],
        errors,
      };
    }
    case "limited":
      return { title: "Gerade zu viele Anfragen", paragraphs: [response.message], errors: [] };
    case "unavailable":
      return { title: "Anfrage gerade nicht möglich", paragraphs: [response.message], errors: [] };
    case "failed":
      return { title: "Nicht verschickt", paragraphs: [response.message], errors: [] };
  }
}

/** Antwortseite für Browser ohne JavaScript. Ohne fremde Ressourcen, ohne Farben – der Browser setzt sie. */
export function fallbackPage(response: RequestResponse, kind: RequestKind | null, back: string): string {
  const { title, paragraphs, errors } = contentFor(response, kind);
  return [
    "<!doctype html>",
    '<html lang="de">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    `<title>${escapeHtml(title)}</title>`,
    "<style>:root{color-scheme:light dark}body{margin:0;padding:clamp(1.5rem,6vw,4rem) 1rem;font:1.0625rem/1.55 system-ui,sans-serif}main{max-width:34rem;margin:0 auto}h1{font-size:1.625rem;line-height:1.2}li{margin-block:.5rem}a{display:inline-block;min-height:44px;padding-block:.625rem}</style>",
    "</head>",
    "<body>",
    "<main>",
    `<h1>${escapeHtml(title)}</h1>`,
    ...paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`),
    ...(errors.length > 0 ? ["<ul>", ...errors.map((text) => `<li>${escapeHtml(text)}</li>`), "</ul>"] : []),
    `<p><a href="${escapeHtml(back)}">Zurück zur Seite</a></p>`,
    "</main>",
    "</body>",
    "</html>",
  ].join("\n");
}
