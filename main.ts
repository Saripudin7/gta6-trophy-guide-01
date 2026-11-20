// Leonida Platinum entrypoint (Node 22, standard library only).
// Copies the offline guide in app/ and its screenshots/ to /output, then writes
// /output/dossier.json with the vendored make.fun library so the scorer can rebuild
// the exact same bytes. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  // Gate caps from reference/gate.json: dossier text 160 KiB, at most 4 screenshots
  // of 256 KiB each, app/ at most 993 entries and 48 MiB.
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('Leonida Platinum: app/, screenshots/ and dossier.json written to', outputDir);
