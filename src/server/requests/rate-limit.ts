import "server-only";

// Rate-Limit im Speicher (ADR 0023): festes Zeitfenster je Schlüssel, begrenzte Anzahl Schlüssel.
// Ohne Datenbank bewusst einfach. Grenze: Auf mehreren Server-Instanzen zählt jede für sich – bis
// Stufe 7 genügt das, danach gemeinsamer Speicher oder die Firewall des Hosters.

export type RateDecision = { readonly allowed: true } | { readonly allowed: false; readonly retryAfterSeconds: number };

export interface RateLimiter {
  hit(key: string): RateDecision;
}

export type RateLimitOptions = {
  readonly limit: number;
  readonly windowMs: number;
  /** Obergrenze für den Speicher; darüber fallen erst abgelaufene, dann die ältesten Einträge weg. */
  readonly maxKeys?: number;
  readonly now?: () => number;
};

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { limit, windowMs, maxKeys = 10_000, now = Date.now } = options;
  if (!Number.isInteger(limit) || limit < 1 || windowMs <= 0) throw new Error("Rate-Limit braucht limit ≥ 1 und ein positives Zeitfenster");
  const windows = new Map<string, { count: number; resetAt: number }>();

  const evict = (time: number) => {
    for (const [key, entry] of windows) if (entry.resetAt <= time) windows.delete(key);
    for (const key of windows.keys()) {
      if (windows.size < maxKeys) break;
      windows.delete(key);
    }
  };

  return {
    hit(key) {
      const time = now();
      const entry = windows.get(key);
      if (!entry || entry.resetAt <= time) {
        if (!entry && windows.size >= maxKeys) evict(time);
        windows.set(key, { count: 1, resetAt: time + windowMs });
        return { allowed: true };
      }
      if (entry.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - time) / 1000)) };
      entry.count += 1;
      return { allowed: true };
    },
  };
}

/** Drei Zähler: je Absender-Adresse (IP), je Gast-E-Mail und je Betrieb. */
export type RequestLimits = {
  readonly client: RateLimiter;
  readonly guest: RateLimiter;
  readonly site: RateLimiter;
};

const MINUTE = 60_000;

/**
 * - client: 10 Versuche in 10 Minuten – genug, um Eingabefehler zu korrigieren.
 * - guest: 3 Anfragen je Stunde an dieselbe Adresse – niemand wird mit Bestätigungen zugeschüttet.
 * - site: 30 Anfragen je Stunde und Betrieb – schützt Postfach und Versandkontingent.
 */
export function createRequestLimits(now?: () => number): RequestLimits {
  return {
    client: createRateLimiter({ limit: 10, windowMs: 10 * MINUTE, ...(now ? { now } : {}) }),
    guest: createRateLimiter({ limit: 3, windowMs: 60 * MINUTE, ...(now ? { now } : {}) }),
    site: createRateLimiter({ limit: 30, windowMs: 60 * MINUTE, ...(now ? { now } : {}) }),
  };
}
