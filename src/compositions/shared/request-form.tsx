import { type RequestFormClasses, RequestFormView, type RequestWiring } from "./request-form-view";

export type { LiveRequestFormComponent, RequestFormClasses, RequestWiring } from "./request-form-view";

// Anfrageformular für Kompositionen (ROADMAP Stufe 5, ADR 0023). Ohne Verdrahtung (Beispiele,
// Lead-Demos) rendert es gesperrt und nur auf dem Server. Das scharfe Formular importiert nicht die
// Komposition, sondern die Seite, die es braucht – sonst lüde Next.js seinen Code auf jeder Seite.

export type RequestFormSlotProps = {
  readonly kind: "table" | "pickup";
  readonly idPrefix: string;
  readonly demoNote: string;
  readonly classes: RequestFormClasses;
  readonly requests: RequestWiring | undefined;
};

export function RequestForm({ requests, ...props }: RequestFormSlotProps) {
  if (!requests) return <RequestFormView {...props} endpoint={null} />;
  const { Form, endpoint } = requests;
  return <Form {...props} endpoint={endpoint} />;
}
