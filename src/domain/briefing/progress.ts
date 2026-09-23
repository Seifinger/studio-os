import { FACT_STATUSES, type Fact, type FactStatus, isEstablished } from "../provenance/fact";
import { BRIEFING_QUESTIONS, type BriefingQuestion } from "./questions";

// Was ist im Briefing noch offen? Grundlage für das nächste Gespräch mit dem Betrieb.

export type OpenQuestion = {
  readonly field: BriefingQuestion["field"];
  readonly question: string;
  readonly status: Exclude<FactStatus, "bestaetigt" | "uebernommen">;
  /** Bei Vorschlägen: der Wert, der zur Bestätigung vorgelegt wird. */
  readonly suggestion?: unknown;
};

type Profile = Readonly<Record<string, Fact<unknown>>>;

/** Offene Fragen in Gesprächsreihenfolge – nur für Felder, die das Profil kennt. */
export function openQuestions(profile: Profile): OpenQuestion[] {
  return BRIEFING_QUESTIONS.flatMap((entry) => {
    const fact = profile[entry.field];
    if (!fact || isEstablished(fact)) return [];
    const base = { field: entry.field, question: entry.question, status: fact.status };
    return [fact.status === "vorschlag" ? { ...base, suggestion: fact.value } : base];
  });
}

export function statusCounts(profile: Profile): Record<FactStatus, number> {
  const counts = Object.fromEntries(FACT_STATUSES.map((status) => [status, 0])) as Record<FactStatus, number>;
  for (const fact of Object.values(profile)) counts[fact.status] += 1;
  return counts;
}
