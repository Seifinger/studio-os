import type { ComponentType, FocusEventHandler, FormEventHandler, Ref } from "react";

import {
  type FieldErrors,
  HONEYPOT_FIELD,
  KIND_FIELD,
  REQUEST_FIELDS,
  REQUEST_KIND_VALUES,
  type RequestField,
  type RequestKind,
  SUBMIT_LABELS,
} from "@/domain/requests/fields";

// Markup des Anfrageformulars (ADR 0023), ohne eigenen Zustand. Rendert auf dem Server (gesperrte
// Demo-Formulare, kein JavaScript) und im Browser (live, über LiveRequestForm). Felder aus
// domain/requests/fields, Aussehen aus der Komposition (DESIGN.md §2).

/** Klassen der Komposition (CSS-Module liefern `string | undefined`). */
export type RequestFormClasses = {
  readonly form: string | undefined;
  readonly field: string | undefined;
  readonly fieldWide: string | undefined;
  readonly hint: string | undefined;
  readonly error: string | undefined;
  readonly footer: string | undefined;
  readonly submit: string | undefined;
  /** Hinweis unter dem Knopf (Demo). */
  readonly note: string | undefined;
  /** Meldung für das ganze Formular („Bitte prüfen Sie …“). */
  readonly alert: string | undefined;
  readonly success: string | undefined;
  readonly successTitle: string | undefined;
};

export type RequestFormProps = {
  readonly kind: RequestKind;
  /** Eindeutiger Präfix für Feld-IDs, z. B. „tisch-anfragen“. */
  readonly idPrefix: string;
  /** Anfrage-Route; `null` = Beispiel oder Lead-Demo: sichtbar, aber gesperrt. */
  readonly endpoint: string | null;
  /** Begründung, warum ein gesperrtes Formular nichts verschickt. */
  readonly demoNote: string;
  readonly classes: RequestFormClasses;
};

/** Das scharfe Formular (Client). Seiten reichen es hinein, damit Beispielseiten kein JavaScript dafür laden. */
export type LiveRequestFormComponent = ComponentType<RequestFormProps & { readonly endpoint: string }>;

/** Verdrahtung einer Seite mit echtem Anfrage-Endpunkt (Kundenseite, lokale Probe). */
export type RequestWiring = { readonly endpoint: string; readonly Form: LiveRequestFormComponent };

export type RequestFormViewProps = RequestFormProps & {
  readonly errors?: FieldErrors;
  readonly alert?: string | null;
  readonly sending?: boolean;
  /** Das Skript prüft selbst – dann keine Browser-Hinweisblasen. */
  readonly enhanced?: boolean;
  readonly dateRange?: { readonly min: string; readonly max: string } | null;
  readonly formRef?: Ref<HTMLFormElement>;
  readonly onSubmit?: FormEventHandler<HTMLFormElement>;
  readonly onFocus?: FocusEventHandler<HTMLFormElement>;
  readonly onInput?: FormEventHandler<HTMLFormElement>;
};

type ControlProps = {
  readonly field: RequestField;
  readonly id: string;
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
  readonly dateRange: { readonly min: string; readonly max: string } | null;
};

function Control({ field, id, describedBy, invalid, dateRange }: ControlProps) {
  const common = {
    id,
    name: field.name,
    required: field.required,
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
    autoComplete: field.autoComplete,
    inputMode: field.inputMode,
    maxLength: field.maxLength,
  };
  if (field.control === "textarea") return <textarea {...common} rows={field.name === "bestellung" ? 4 : 3} />;
  return (
    <input
      {...common}
      type={field.control}
      min={field.control === "date" ? dateRange?.min : field.min}
      max={field.control === "date" ? dateRange?.max : field.max}
    />
  );
}

export function RequestFormView({
  kind,
  idPrefix,
  endpoint,
  demoNote,
  classes,
  errors = {},
  alert = null,
  sending = false,
  enhanced = false,
  dateRange = null,
  formRef,
  onSubmit,
  onFocus,
  onInput,
}: RequestFormViewProps) {
  const live = endpoint !== null;

  return (
    <form
      ref={formRef}
      className={classes.form}
      action={endpoint ?? undefined}
      method={live ? "post" : undefined}
      noValidate={enhanced && live}
      onSubmit={onSubmit}
      onFocus={onFocus}
      onInput={onInput}
      aria-describedby={live ? undefined : `${idPrefix}-demo`}
      aria-busy={sending || undefined}
    >
      <input type="hidden" name={KIND_FIELD} value={REQUEST_KIND_VALUES[kind]} />
      {/* Honigtopf: für Menschen unsichtbar und nicht erreichbar, Bots füllen ihn aus (ADR 0023). */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>Bitte leer lassen</label>
        <input id={`${idPrefix}-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {REQUEST_FIELDS[kind].map((field) => {
        const id = `${idPrefix}-${field.name}`;
        const error = errors[field.name];
        const describedBy = [field.hint ? `${id}-hinweis` : null, error ? `${id}-fehler` : null].filter(Boolean).join(" ") || undefined;
        return (
          <div key={field.name} className={field.wide ? classes.fieldWide : classes.field}>
            <label htmlFor={id}>{field.label}</label>
            <Control field={field} id={id} describedBy={describedBy} invalid={Boolean(error)} dateRange={dateRange} />
            {field.hint ? (
              <p id={`${id}-hinweis`} className={classes.hint}>
                {field.hint}
              </p>
            ) : null}
            {error ? (
              <p id={`${id}-fehler`} className={classes.error}>
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className={classes.footer}>
        {alert ? (
          <p className={classes.alert} role="alert">
            {alert}
          </p>
        ) : null}
        <button type="submit" className={classes.submit} disabled={!live} aria-disabled={sending || undefined}>
          {sending ? "Wird gesendet …" : SUBMIT_LABELS[kind]}
        </button>
        {live ? null : (
          <p id={`${idPrefix}-demo`} className={classes.note}>
            {demoNote}
          </p>
        )}
      </div>
    </form>
  );
}
