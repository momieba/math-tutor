// Kopiert die Bewertungslogik (evaluate.ts, Vertrag, Typen) in die Edge Functions, damit Server und lokaler Modus
// exakt gleich bewerten. Deno braucht Dateiendungen in Imports, deshalb werden relative Imports um `.ts` ergänzt.
// Aufruf: npm run functions:sync   (Prüfung ohne Schreiben, z. B. in CI: node scripts/sync-functions.mjs --check)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILES = ['domain/evaluate.ts', 'domain/gradingContract.ts', 'types/index.ts', 'types/content.ts', 'types/learner.ts'];
const src = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));
const dst = (f) => fileURLToPath(new URL(`../supabase/functions/_shared/${f}`, import.meta.url));

const HEADER = '// AUTOMATISCH KOPIERT aus src/ durch scripts/sync-functions.mjs – nicht hier bearbeiten.\n';

/** `from '../types'` → `'../types/index.ts'`, `from './evaluate'` → `'./evaluate.ts'`. */
function denoImports(code, file) {
  return code.replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, (m, pre, spec, post) => {
    if (spec.endsWith('.ts')) return m;
    const base = dirname(src(file));
    const asFile = fileURLToPath(new URL(`${spec}.ts`, `file://${base.replace(/\\/g, '/')}/`));
    return `${pre}${spec}${existsSync(asFile) ? '.ts' : '/index.ts'}${post}`;
  });
}

const check = process.argv.includes('--check');
const stale = [];
for (const f of FILES) {
  const out = HEADER + denoImports(readFileSync(src(f), 'utf8'), f);
  const current = existsSync(dst(f)) ? readFileSync(dst(f), 'utf8') : null;
  if (current === out) continue;
  if (check) stale.push(f);
  else {
    mkdirSync(dirname(dst(f)), { recursive: true });
    writeFileSync(dst(f), out, 'utf8');
    console.log(`aktualisiert: supabase/functions/_shared/${f}`);
  }
}
if (check && stale.length) {
  console.error(`Edge Functions veraltet (npm run functions:sync): ${stale.join(', ')}`);
  process.exit(1);
}
if (check) console.log('Edge Functions synchron mit src/.');
