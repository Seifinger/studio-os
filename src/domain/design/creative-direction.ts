import { z } from "zod";

import type { Fact } from "../provenance/fact";
import { gate, type GateContext } from "../provenance/gate";
import { checkCopy } from "../quality/copy-rules";

// Creative Direction je Haus (DESIGN.md §1, §10; ADR 0019). Neu geschrieben nach
// gastro-webagentur v2/creative/creativeDirection.js: Leitidee, Wirkung, Metapher, Dramaturgie mit
// „warum“, höchstens zwei Signature-Details mit Beleg, bewusster Verzicht.

export const SECTION_IDS = [
  "hero",
  "story",
  "signatureDishes",
  "menu",
  "specials",
  "hours",
  "visit",
  "request",
  "serviceNotes",
  "imageSlots",
  "quotes",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const sentence = (max: number) => z.string().trim().min(8).max(max);

export const creativeDirectionSchema = z
  .object({
    /** Leitidee in einem Satz. */
    idea: sentence(160),
    /** Wirkung auf Gäste nach drei Sekunden. */
    effect: sentence(240),
    /** Visuelle Metapher. */
    metaphor: sentence(240),
    dramaturgy: z
      .array(
        z.object({
          section: z.enum(SECTION_IDS),
          weight: z.enum(["gross", "normal", "klein"]),
          why: sentence(200),
        }),
      )
      .min(3),
    signatures: z
      .array(
        z.object({
          title: z.string().trim().min(3).max(80),
          description: sentence(240),
          /** Profilfelder, die das Detail belegen – ohne sie fällt es weg. */
          evidence: z.array(z.string().min(1)).min(1),
        }),
      )
      .max(2),
    omissions: z.array(z.string().trim().min(3)).min(1),
  })
  .superRefine((direction, ctx) => {
    const sections = direction.dramaturgy.map((entry) => entry.section);
    if (sections[0] !== "hero") ctx.addIssue({ code: "custom", path: ["dramaturgy", 0], message: "Die Dramaturgie beginnt mit dem Hero" });
    if (new Set(sections).size !== sections.length) ctx.addIssue({ code: "custom", path: ["dramaturgy"], message: "Abschnitt doppelt" });
    if (!sections.includes("visit")) ctx.addIssue({ code: "custom", path: ["dramaturgy"], message: "Anfahrt und Kontakt fehlen" });
  });

export type CreativeDirection = z.infer<typeof creativeDirectionSchema>;

export function creativeDirectionProblems(direction: CreativeDirection): string[] {
  const texts = [direction.idea, direction.effect, direction.metaphor, ...direction.dramaturgy.map((entry) => entry.why)];
  return texts.flatMap((text) =>
    checkCopy(text)
      .filter((finding) => finding.severity === "fehler")
      .map((finding) => `Floskel in der Creative Direction: „${finding.match.trim()}“`),
  );
}

export type SignatureCheck = {
  readonly kept: CreativeDirection["signatures"];
  readonly dropped: readonly { readonly title: string; readonly missing: readonly string[] }[];
};

/** Ein Signature-Detail ohne zeigbaren Beleg fällt weg (v2 `belegPruefung`). */
export function checkSignatures(
  direction: CreativeDirection,
  profile: Readonly<Record<string, Fact<unknown>>>,
  context: GateContext,
): SignatureCheck {
  const kept: CreativeDirection["signatures"][number][] = [];
  const dropped: { title: string; missing: string[] }[] = [];
  for (const signature of direction.signatures) {
    const missing = signature.evidence.filter((field) => {
      const fact = profile[field];
      if (!fact) return true;
      const outcome = gate(fact, context).show;
      return outcome !== "value" && outcome !== "draft";
    });
    if (missing.length === 0) kept.push(signature);
    else dropped.push({ title: signature.title, missing });
  }
  return { kept, dropped };
}
