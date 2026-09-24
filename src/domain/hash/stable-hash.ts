// Stabiler Hash (FNV-1a, 32 Bit, über UTF-8): gleicher Schlüssel → gleiche Wahl, auf jedem System.
// Nur für Gleichstände zwischen gleich gut begründeten Optionen (DESIGN.md S9) – nie als
// Gestaltungsquelle. Ersetzt den djb2-Hash aus gastro-v3 src/composer/index.js (seedHash).

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const encoder = new TextEncoder();

export function stableHash(input: string): number {
  let hash = FNV_OFFSET;
  for (const byte of encoder.encode(input)) {
    hash ^= byte;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

export function pickStable<T>(options: readonly T[], key: string): T {
  if (options.length === 0) throw new Error("pickStable braucht mindestens eine Option");
  return options[stableHash(key) % options.length] as T;
}
