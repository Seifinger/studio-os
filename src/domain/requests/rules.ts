import { formatDayHours, isOpenAt } from "../content/opening-hours";
import { daysBetween, localMoment, timeToMinutes, weekdayName, weekdayOf } from "./calendar";
import { HORIZON_DAYS, MAX_PARTY_SIZE } from "./fields";
import type { FieldErrors, GuestRequest } from "./parse";
import type { RequestTarget } from "./target";

// Fachregeln einer Anfrage gegen den Betrieb. Eine Anfrage ist keine Buchung: Geprüft wird nur, was
// sicher nicht geht (Vergangenheit, Ruhetag, geschlossen). Ob ein Tisch frei ist, entscheidet das Haus.

/** Vorlauf für den selben Tag – kürzer geht nur am Telefon. */
export const LEAD_MINUTES = 30;

const callHint = (target: RequestTarget) => (target.phone ? ` Rufen Sie gern an: ${target.phone.display}.` : "");

export function checkRequest(request: GuestRequest, target: RequestTarget, now: Date): FieldErrors {
  const errors: FieldErrors = {};
  const today = localMoment(now);
  const ahead = daysBetween(today.date, request.date);
  const minutes = timeToMinutes(request.time);
  const table = request.kind === "table";

  if (ahead < 0) {
    errors.datum = "Dieser Tag liegt in der Vergangenheit.";
  } else if (ahead > HORIZON_DAYS) {
    errors.datum = `Anfragen gehen bis ${HORIZON_DAYS} Tage im Voraus.${callHint(target)}`;
  } else if (ahead === 0 && minutes < today.minutes + LEAD_MINUTES) {
    errors.uhrzeit = `Für heute bitte mindestens ${LEAD_MINUTES} Minuten Vorlauf.${callHint(target)}`;
  }

  if (!errors.datum && !errors.uhrzeit && target.openingHours) {
    const day = weekdayOf(request.date);
    const dayHours = formatDayHours(target.openingHours, day);
    if (dayHours === "Ruhetag" && !isOpenAt(target.openingHours, day, minutes)) {
      errors.datum = `${weekdayName(day)} ist Ruhetag – bitte einen anderen Tag wählen.`;
    } else if (!isOpenAt(target.openingHours, day, minutes)) {
      errors.uhrzeit = `Um ${request.time} Uhr ist geschlossen. ${weekdayName(day)}: ${dayHours} Uhr.`;
    }
  }

  if (table && request.partySize > MAX_PARTY_SIZE) {
    errors.personen = `Für mehr als ${MAX_PARTY_SIZE} Personen sprechen wir uns lieber direkt ab.${callHint(target) || " Bitte rufen Sie an."}`;
  }
  return errors;
}
