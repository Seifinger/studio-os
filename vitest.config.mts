import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "server-only" wirft außerhalb des React-Server-Bundles absichtlich einen Fehler.
      // In Unit-Tests laufen Servermodule direkt in Node, daher ein leerer Ersatz.
      "server-only": fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.ts"],
    restoreMocks: true,
    unstubEnvs: true,
  },
});
