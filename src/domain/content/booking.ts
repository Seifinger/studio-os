import { z } from "zod";

import { isGoogleUrl } from "../provenance/fact";

// Vorhandene Reservierungssysteme werden verlinkt, nicht eingebettet (ARCHITECTURE.md §6).
// Bei bekannten Anbietern muss der Link auf deren Domain zeigen – so fällt ein vertauschter
// oder veralteter Link beim Eintragen auf. Domains vor dem ersten echten Einsatz prüfen.

export const BOOKING_PROVIDERS = [
  { id: "resmio", label: "resmio", hosts: ["resmio.com", "resmio.de"] },
  { id: "opentable", label: "OpenTable", hosts: ["opentable.de", "opentable.com"] },
  { id: "quandoo", label: "Quandoo", hosts: ["quandoo.de", "quandoo.com"] },
  { id: "thefork", label: "TheFork", hosts: ["thefork.de", "thefork.com"] },
  { id: "other", label: "Online-Reservierung", hosts: [] },
] as const;

type BookingProviderId = (typeof BOOKING_PROVIDERS)[number]["id"];
const PROVIDER_IDS = BOOKING_PROVIDERS.map((provider) => provider.id) as [BookingProviderId, ...BookingProviderId[]];

const matchesHost = (hostname: string, host: string) => hostname === host || hostname.endsWith(`.${host}`);

export const externalBookingSchema = z
  .object({
    provider: z.enum(PROVIDER_IDS),
    url: z.url({ protocol: /^https$/, error: "muss eine https-URL sein" }),
  })
  .superRefine((booking, ctx) => {
    const hostname = new URL(booking.url).hostname.toLowerCase();
    const provider = BOOKING_PROVIDERS.find((candidate) => candidate.id === booking.provider);
    const hosts: readonly string[] = provider?.hosts ?? [];
    if (hosts.length > 0 && !hosts.some((host) => matchesHost(hostname, host))) {
      ctx.addIssue({ code: "custom", path: ["url"], message: `Link gehört nicht zu ${provider?.label ?? booking.provider}` });
    }
    if (isGoogleUrl(booking.url)) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Google-Links sind kein Reservierungssystem des Betriebs" });
    }
  });

export type ExternalBooking = z.infer<typeof externalBookingSchema>;
