import { indianBombayStory } from "./indian-bombay-story";
import { narrativeEditorialBase } from "./narrative-editorial-base";
import { type Theme, themeProblems, themeSchema } from "./schema";

// Theme-Registry: nur geprüfte Themes, eindeutige IDs, abgeleitete Themes nur von registrierten.

export class ThemeRegistryError extends Error {
  override readonly name = "ThemeRegistryError";
}

export type ThemeRegistry = {
  readonly ids: readonly string[];
  get(id: string): Theme;
  find(id: string): Theme | undefined;
  list(): readonly Theme[];
};

export function createThemeRegistry(themes: readonly Theme[]): ThemeRegistry {
  const byId = new Map<string, Theme>();
  for (const candidate of themes) {
    const parsed = themeSchema.safeParse(candidate);
    if (!parsed.success) throw new ThemeRegistryError(`Theme ${String((candidate as { id?: unknown }).id)} ist unvollständig: ${parsed.error.message}`);
    const theme = parsed.data;
    if (byId.has(theme.id)) throw new ThemeRegistryError(`Theme-ID doppelt: ${theme.id}`);
    if (theme.basedOn !== null && !byId.has(theme.basedOn)) {
      throw new ThemeRegistryError(`${theme.id} baut auf ${theme.basedOn} auf, das (noch) nicht registriert ist`);
    }
    const problems = themeProblems(theme);
    if (problems.length > 0) throw new ThemeRegistryError(`${theme.id}: ${problems.join("; ")}`);
    byId.set(theme.id, theme);
  }
  return {
    ids: [...byId.keys()],
    get(id) {
      const theme = byId.get(id);
      if (!theme) throw new ThemeRegistryError(`Unbekanntes Theme: ${id}`);
      return theme;
    },
    find: (id) => byId.get(id),
    list: () => [...byId.values()],
  };
}

/** Alle Themes des Studios. Reihenfolge: Basis zuerst, dann Ableitungen. */
export const THEME_REGISTRY = createThemeRegistry([narrativeEditorialBase, indianBombayStory]);
