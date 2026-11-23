// Kindlefall's hand-in: a Node 22 program (standard library only) that puts the
// game and its screenshots where the grader looks, then writes the dossier the
// judge reads. The game itself is plain static files under game/ and needs no
// build step: index.html and its ES modules run in a desktop browser offline.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts     # locally
//   node serve.ts                                            # play it on :8080
//
// The grader runs this twice with /bot read-only and /output writable, and both
// runs must write the same bytes, so nothing here depends on time or the host.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps: the dossier's text budget shapes the bytes, and the rest refuse
// an entry the sealed scorer would refuse, before it is ever uploaded.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repo, 'game'), join(outputDir, 'game'), { recursive: true });
if (existsSync(join(repo, 'screenshots'))) {
  cpSync(join(repo, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, CAPS));
