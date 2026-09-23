import { type Fact, isEstablished } from "../provenance/fact";
import { auditFacts, type FactAudit, type GateContext } from "../provenance/gate";

// Build-Gate (ADR 0018): Eine Seite wird nur gebaut, wenn keine Angabe gegen das Fakten-Gate
// verstößt. Live-Kundenseiten brauchen zusätzlich die bestätigte Freigabe des Betriebs.

export type GateViolation = { readonly field: string; readonly reason: string };

export class RenderGateError extends Error {
  readonly violations: readonly GateViolation[];

  constructor(violations: readonly GateViolation[]) {
    super(`Seite darf nicht gebaut werden: ${violations.map((v) => `${v.field} – ${v.reason}`).join("; ")}`);
    this.name = "RenderGateError";
    this.violations = violations;
  }
}

type Profile = Readonly<Record<string, Fact<unknown>>>;

export function assertRenderable(profile: Profile, context: GateContext): FactAudit {
  const audit = auditFacts(profile, context);
  const violations: GateViolation[] = [...audit.violations];

  if (context.kind === "customer" && context.stage === "live") {
    const approval = profile.publicationApproved;
    if (!approval || !isEstablished(approval) || approval.status !== "bestaetigt") {
      violations.push({ field: "publicationApproved", reason: "Keine bestätigte Freigabe des Betriebs für die Veröffentlichung" });
    }
  }

  if (violations.length > 0) throw new RenderGateError(violations);
  return audit;
}
