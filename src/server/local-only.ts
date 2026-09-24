import "server-only";

// Funktionen nur für den eigenen Rechner (Lead-Demos ADR 0021, Anfrage-Probe ADR 0023): Sie sind
// zusätzlich per Umgebungsvariable abgeschaltet – die Host-Prüfung allein schützt keinen öffentlichen
// Server, denn den Host-Header kann jeder Aufrufer setzen.

const LOOPBACK_HOST = /^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d{1,5})?$/i;

export function isLoopbackHost(host: string | null): boolean {
  return host !== null && LOOPBACK_HOST.test(host.trim());
}
