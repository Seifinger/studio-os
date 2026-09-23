import "server-only";

import { OPERATOR_MISSING_MARKER } from "@/domain/publishing/static-export";

import { type EnvSource, parseServerEnv } from "./env";

export { OPERATOR_MISSING_MARKER };

// Wer die öffentlichen Beispielseiten betreibt (Impressum nach § 5 DDG, Datenschutzerklärung).
// Fehlen die Angaben, zeigen die Seiten das offen an – und die Veröffentlichungsprüfung schlägt fehl.

export type StudioOperator = { readonly name: string; readonly address: string; readonly email: string };

export function studioOperator(source?: EnvSource): StudioOperator | null {
  const result = parseServerEnv(source);
  if (!result.ok) return null;
  const { STUDIO_OPERATOR_NAME: name, STUDIO_OPERATOR_ADDRESS: address, STUDIO_OPERATOR_EMAIL: email } = result.env;
  return name && address && email ? { name, address, email } : null;
}
