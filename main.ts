// Leonida Platinum Tracker — entry program for make.fun bounty gta6-trophy-guide-01.
// Copies app/ and screenshots/ from this repository into the output directory
// (/output in the grader, MAKEFUN_OUTPUT_DIR locally) and writes dossier.json
// with the kit's buildDossier. Node 22 standard library only, deterministic:
// the same repository always writes the same bytes, so the grader's two runs
// of this program produce identical output.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = import.meta.dirname;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);

console.log("dossier written to " + join(outputDir, "dossier.json"));
