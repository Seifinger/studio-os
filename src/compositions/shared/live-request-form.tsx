"use client";

import { type FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { addDays, localMoment } from "@/domain/requests/calendar";
import { DURATION_FIELD, type FieldErrors, HORIZON_DAYS, missingFields, type RawForm, REQUEST_FIELDS } from "@/domain/requests/fields";
import { INVALID_MESSAGE, requestResponseSchema, sentMessage } from "@/domain/requests/response";

import { type RequestFormProps, RequestFormView } from "./request-form-view";

// Scharfes Anfrageformular (ADR 0023). Nur hier läuft JavaScript – und nur Code ohne Zod-Vollpaket:
// Pflichtfelder prüft der Browser sofort, alles andere (Format, Öffnungszeiten, Spam) der Server.

type State =
  | { readonly phase: "idle" }
  | { readonly phase: "sending" }
  | { readonly phase: "error"; readonly message: string; readonly fieldErrors: FieldErrors }
  | { readonly phase: "sent"; readonly title: string; readonly text: string };

const subscribeNever = () => () => undefined;
/** Heutiger Tag (Ortszeit des Betriebs) – auf dem Server `null`, weil die Seite dort veralten kann. */
const todayOnClient = () => localMoment(new Date()).date;
const todayOnServer = () => null;

const OFFLINE_MESSAGE = "Die Anfrage ist nicht angekommen. Bitte prüfen Sie die Verbindung und senden Sie noch einmal.";

function readForm(form: HTMLFormElement): RawForm {
  const raw: Record<string, string> = {};
  for (const [name, value] of new FormData(form)) if (typeof value === "string") raw[name] = value;
  return raw;
}

export function LiveRequestForm(props: RequestFormProps & { readonly endpoint: string }) {
  const { kind, idPrefix, endpoint, classes } = props;
  const [state, setState] = useState<State>({ phase: "idle" });
  // Erst nach dem Laden übernimmt das Skript die Prüfung; vorher helfen die Browser-Hinweise.
  const today = useSyncExternalStore(subscribeNever, todayOnClient, todayOnServer);
  const startedAt = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.phase === "sent") successRef.current?.focus();
    if (state.phase === "error") {
      const first = REQUEST_FIELDS[kind].find((field) => state.fieldErrors[field.name]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#${idPrefix}-${first.name}`)?.focus();
    }
  }, [state, kind, idPrefix]);

  const markStart = () => {
    startedAt.current ??= performance.now();
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.phase === "sending") return;
    const form = event.currentTarget;

    const missing = missingFields(kind, readForm(form));
    if (Object.keys(missing).length > 0) {
      setState({ phase: "error", message: INVALID_MESSAGE, fieldErrors: missing });
      return;
    }

    const body = new FormData(form);
    // Ohne erfasste Eingabe (z. B. Autofill und sofort Enter) lieber keine Dauer als eine falsche 0.
    if (startedAt.current !== null) body.set(DURATION_FIELD, String(Math.round(performance.now() - startedAt.current)));
    setState({ phase: "sending" });
    try {
      const response = await fetch(endpoint, { method: "POST", body, headers: { Accept: "application/json" } });
      const parsed = requestResponseSchema.safeParse(await response.json().catch(() => null));
      if (!parsed.success) {
        setState({ phase: "error", message: OFFLINE_MESSAGE, fieldErrors: {} });
        return;
      }
      const result = parsed.data;
      if (result.status === "sent") {
        setState({ phase: "sent", ...sentMessage(kind, result.confirmation) });
        return;
      }
      setState({ phase: "error", message: result.message, fieldErrors: result.status === "invalid" ? result.fieldErrors : {} });
    } catch {
      setState({ phase: "error", message: OFFLINE_MESSAGE, fieldErrors: {} });
    }
  }

  if (state.phase === "sent") {
    return (
      <div ref={successRef} className={classes.success} role="status" tabIndex={-1}>
        <p className={classes.successTitle}>{state.title}</p>
        <p>{state.text}</p>
      </div>
    );
  }

  return (
    <RequestFormView
      {...props}
      errors={state.phase === "error" ? state.fieldErrors : {}}
      alert={state.phase === "error" ? state.message : null}
      sending={state.phase === "sending"}
      enhanced={today !== null}
      dateRange={today ? { min: today, max: addDays(today, HORIZON_DAYS) } : null}
      formRef={formRef}
      onSubmit={submit}
      onFocus={markStart}
      onInput={markStart}
    />
  );
}
