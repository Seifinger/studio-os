import { probeProfile } from "@/catalog/request-probes";
import type { RequestResponse } from "@/domain/requests/response";
import { KIND_FIELD, requestKindFromValue } from "@/domain/requests/fields";
import { backHref, clientKey, fallbackPage, httpStatusFor, isCrossSite, readRequestForm, requestHost, wantsJson } from "@/server/requests/http";
import { requestDeps, resolveRequestTarget } from "@/server/requests/request-service";
import { submitRequest } from "@/server/requests/submit-request";

// Anfragen per E-Mail (ROADMAP Stufe 5, ADR 0023). Mit JavaScript antwortet die Route als JSON,
// ohne JavaScript mit einer kleinen HTML-Seite. Der Empfänger ergibt sich nur aus der Seitenkennung.

type Context = { readonly params: Promise<{ site: string }> };

const NO_STORE = { "Cache-Control": "no-store" } as const;

function reply(request: Request, response: RequestResponse, kind: ReturnType<typeof requestKindFromValue>): Response {
  const status = httpStatusFor(response);
  const headers: Record<string, string> = { ...NO_STORE };
  if (response.status === "limited") headers["Retry-After"] = String(response.retryAfterSeconds);
  if (wantsJson(request.headers)) return Response.json(response, { status, headers });
  return new Response(fallbackPage(response, kind, backHref(request.headers, requestHost(request))), {
    status,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}

function refuse(request: Request, status: 400 | 403 | 404 | 413 | 415, message: string): Response {
  if (wantsJson(request.headers)) return Response.json({ status: "unavailable", message } satisfies RequestResponse, { status, headers: NO_STORE });
  return new Response(fallbackPage({ status: "unavailable", message }, null, backHref(request.headers, requestHost(request))), {
    status,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request, context: Context): Promise<Response> {
  const host = requestHost(request);
  if (isCrossSite(request.headers, host)) return refuse(request, 403, "Anfragen nur über die Website des Hauses.");

  const { site } = await context.params;
  const target = resolveRequestTarget(site, {
    host,
    probeFacts: (slug) => probeProfile(slug),
  });
  if (!target) return refuse(request, 404, "Für diese Seite nimmt niemand Anfragen entgegen.");

  const body = await readRequestForm(request);
  if (!body.ok) return refuse(request, body.status, "Die Anfrage ließ sich nicht lesen. Bitte laden Sie die Seite neu und versuchen Sie es noch einmal.");

  const kind = requestKindFromValue(body.form[KIND_FIELD]);
  if (!kind) return refuse(request, 400, "Unbekannte Anfrageart. Bitte laden Sie die Seite neu.");

  const response = await submitRequest({ target, kind, form: body.form, client: clientKey(request.headers) }, requestDeps());
  return reply(request, response, kind);
}
