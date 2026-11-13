// SessionStart: kompakter Projektkontext für Claude (stdout wird dem Kontext hinzugefügt).
import fs from 'node:fs';
import path from 'node:path';
import { readInput, context, get, git, mainBranch } from './lib.mjs';

const input = await readInput();
const { projectDir, config } = context(input);

if (!config) {
  console.log('[devflow] Noch nicht eingerichtet. Bei Entwicklungsaufgaben einmalig /devflow:devflow-init vorschlagen.');
  process.exit(0);
}

const branch = git(projectDir, ['rev-parse', '--abbrev-ref', 'HEAD']) || '?';
const main = mainBranch(config);
const dirty = git(projectDir, ['status', '--porcelain']).split('\n').filter(Boolean).length;
const lastTag = git(projectDir, ['describe', '--tags', '--abbrev=0']) || '–';

let specs = [];
try {
  const dir = path.join(projectDir, get(config, 'docs.path') || 'docs', 'specs');
  specs = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort().reverse().slice(0, 3);
} catch { /* keine Specs */ }

console.log(`[devflow] Projekt: ${get(config, 'project.name') || 'unbenannt'} | Branch: ${branch} (Haupt: ${main}) | uncommittete Dateien: ${dirty} | letztes Release: ${lastTag}`);
console.log(`[devflow] Neueste Pläne: ${specs.join(', ') || 'keine'}`);
console.log('[devflow] Prozess: /devflow:feature, /devflow:fix, /devflow:review, /devflow:release, /devflow:docs-sync, /devflow:social-post, /devflow:demo-video. Regeln: CLAUDE.md.');
if (branch === main) console.log('[devflow] Achtung: Hauptbranch. Für Änderungen zuerst einen Feature-/Fix-Branch anlegen.');
process.exit(0);
