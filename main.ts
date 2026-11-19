// main.ts — the entry's program (Node 22). It hands the app in: it copies
// app/ and screenshots/ from this repository into the output directory and
// writes /output/dossier.json with buildDossier from vendor/makefun-app.ts,
// the kit's library, copied byte for byte. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output.
//
//   node main.ts
//   MAKEFUN_OUTPUT_DIR=./out node main.ts

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : "/output";

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);

console.log(`Wrote ${outputDir}/dossier.json (${dossier.length} bytes).`);
