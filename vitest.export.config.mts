import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Veröffentlichungsprüfung (npm run check:export): prüft den fertigen Export in out/.
// Getrennt von den Unit-Tests, weil sie einen vorherigen `npm run export:showcases` braucht.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/export/**/*.test.ts"],
  },
});
