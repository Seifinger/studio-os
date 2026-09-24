import { PROBE_PREFIX } from "@/server/requests/request-service";

/** Route der Probe für ein Beispielhaus. */
export const probeEndpoint = (slug: string) => `/api/anfragen/${PROBE_PREFIX}${slug}`;

/** Kopfhinweis auf Probe-Seiten: sagt, wohin die E-Mails wirklich gehen. */
export function probeNotice(inbox: string, emailReady: boolean): string {
  return emailReady
    ? `Anfrage-Probe, nur lokal: Die Formulare verschicken echte E-Mails – an ${inbox} und an die Gast-Adresse, die Sie eintragen.`
    : "Anfrage-Probe, nur lokal: Der Versand ist nicht eingerichtet (RESEND_API_KEY und EMAIL_FROM fehlen) – die Formulare melden das ehrlich.";
}
