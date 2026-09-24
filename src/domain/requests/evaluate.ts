import type { RequestKind } from "./fields";
import { type FieldErrors, type GuestRequest, parseRequest, type RawForm } from "./parse";
import { checkRequest } from "./rules";
import { linkErrors, spamVerdict } from "./spam";
import { offers, type RequestTarget } from "./target";

// Eine Anfrage fachlich bewerten – alles außer Rate-Limit und Versand (die gehören in den Server).

export type Evaluation =
  | { readonly kind: "ok"; readonly request: GuestRequest }
  | { readonly kind: "drop" }
  | { readonly kind: "retry" }
  | { readonly kind: "notOffered" }
  | { readonly kind: "invalid"; readonly errors: FieldErrors };

export function evaluateRequest(kind: RequestKind, raw: RawForm, target: RequestTarget, now: Date): Evaluation {
  const spam = spamVerdict(raw);
  if (spam.kind !== "clean") return spam;
  if (!offers(target, kind)) return { kind: "notOffered" };

  const parsed = parseRequest(kind, raw);
  if (!parsed.ok) return { kind: "invalid", errors: parsed.errors };

  const errors = { ...checkRequest(parsed.request, target, now), ...linkErrors(parsed.request) };
  return Object.keys(errors).length > 0 ? { kind: "invalid", errors } : { kind: "ok", request: parsed.request };
}
