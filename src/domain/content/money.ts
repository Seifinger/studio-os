import { z } from "zod";

// Preise in ganzen Cent – nie als Kommazahl (v1 speicherte 8.5 als Float).

export const euroCentsSchema = z
  .number()
  .int({ error: "Preis in ganzen Cent angeben" })
  .nonnegative({ error: "Preis darf nicht negativ sein" })
  .max(10_000_000, { error: "Preis unplausibel hoch" });

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** 1150 → "11,50 €" (mit geschütztem Leerzeichen, wie es Intl für de-DE liefert). */
export function formatEuro(cents: number): string {
  return EURO.format(cents / 100);
}

/**
 * Eingabe aus einer Speisekarte in Cent: "11,50", "11.50", "11,5", "11 €", "11,50 €" → 1150.
 * Tausenderpunkte werden nicht unterstützt (auf Speisekarten praktisch nie nötig).
 */
export function parseEuro(input: string): number | null {
  const cleaned = input.trim().replace(/\s*(€|EUR)$/i, "").trim();
  const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(cleaned);
  if (!match?.[1]) return null;
  const euros = Number(match[1]);
  const cents = match[2] === undefined ? 0 : Number(match[2].padEnd(2, "0"));
  return euros * 100 + cents;
}
