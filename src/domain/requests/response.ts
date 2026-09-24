import * as z from "zod/mini";

import { FIELD_NAMES, type RequestKind } from "./fields";

// Antwort der Anfrage-Route – gemeinsam für Server und Formular im Browser. Bewusst mit `zod/mini`:
// Das Formular läuft auf Kundenseiten, dort zählt jedes Kilobyte (ADR 0023).

export const requestResponseSchema = z.discriminatedUnion("status", [
  /** Beim Betrieb angekommen; `confirmation` sagt, ob die Bestätigung an den Gast rausging. */
  z.object({ status: z.literal("sent"), confirmation: z.enum(["sent", "failed"]) }),
  z.object({ status: z.literal("invalid"), message: z.string(), fieldErrors: z.partialRecord(z.enum(FIELD_NAMES), z.string()) }),
  z.object({ status: z.literal("limited"), message: z.string(), retryAfterSeconds: z.int().check(z.positive()) }),
  z.object({ status: z.literal("unavailable"), message: z.string() }),
  z.object({ status: z.literal("failed"), message: z.string() }),
]);

export type RequestResponse = z.infer<typeof requestResponseSchema>;

export const INVALID_MESSAGE = "Bitte prüfen Sie die markierten Felder.";
export const RETRY_MESSAGE = "Das ging sehr schnell – bitte prüfen Sie Ihre Angaben und senden Sie noch einmal.";

/** Text nach erfolgreichem Versand – für Formular und Seite ohne JavaScript. */
export function sentMessage(kind: RequestKind, confirmation: "sent" | "failed"): { readonly title: string; readonly text: string } {
  const table = kind === "table";
  const title = table ? "Anfrage verschickt" : "Bestellung verschickt";
  if (confirmation === "failed") {
    return {
      title,
      text: `${table ? "Ihre Anfrage" : "Ihre Bestellung"} ist beim Haus angekommen. Die Eingangsbestätigung per E-Mail ließ sich nicht verschicken – das Haus meldet sich trotzdem bei Ihnen.`,
    };
  }
  return {
    title,
    text: table
      ? "Danke! Ihre Anfrage ist beim Haus. Das ist noch keine Reservierung: Sie bekommen gleich eine Eingangsbestätigung per E-Mail, die Zusage kommt vom Haus."
      : "Danke! Ihre Bestellung ist beim Haus. Sie bekommen gleich eine Eingangsbestätigung per E-Mail; das Haus bestätigt Ihnen die Abholzeit.",
  };
}
