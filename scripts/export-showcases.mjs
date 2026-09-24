// Baut den statischen Export der Beispielseiten nach out/ (ADR 0020).
// Plattformunabhängig statt "STUDIO_BUILD_TARGET=… next build", das unter Windows nicht läuft.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, STUDIO_BUILD_TARGET: "showcases" },
});
process.exit(result.status ?? 1);
