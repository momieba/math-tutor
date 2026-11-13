// Stop: Bevor Claude die Runde beendet, läuft der Gate-Befehl – aber nur, wenn sich seit dem
// letzten erfolgreichen Gate Code geändert hat. Bei Fehlschlag (Exit 2) arbeitet Claude weiter.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readInput, context, get, git, run, tail } from './lib.mjs';

const input = await readInput();
const { projectDir, config, logDir } = context(input);
if (!config) process.exit(0);
if (input.stop_hook_active === true) process.exit(0); // keine Endlosschleife
if (get(config, 'quality_gate.on_stop') === false) process.exit(0);

const key = get(config, 'quality_gate.command') || 'test';
const cmd = get(config, `commands.${key}`);
if (!cmd) process.exit(0);
if (git(projectDir, ['rev-parse', '--is-inside-work-tree']) !== 'true') process.exit(0);

const excludes = (get(config, 'quality_gate.ignore') || ['docs', 'marketing', '*.md', '.devflow'])
  .map((p) => `:(exclude)${p}`);
const fingerprint = crypto.createHash('sha1')
  .update(git(projectDir, ['rev-parse', 'HEAD']))
  .update(git(projectDir, ['diff', 'HEAD', '--', '.', ...excludes]))
  .update(git(projectDir, ['ls-files', '--others', '--exclude-standard', '--', '.', ...excludes]))
  .digest('hex').slice(0, 16);

const stateFile = path.join(logDir, 'last-gate');
try { if (fs.readFileSync(stateFile, 'utf8').trim() === fingerprint) process.exit(0); } catch { /* erster Lauf */ }

const r = run(cmd, projectDir);
if (r.ok) {
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(stateFile, fingerprint);
  process.exit(0);
}
process.stderr.write(`devflow Qualitäts-Gate: '${cmd}' schlägt fehl. Bitte beheben, bevor du abschließt.\n--- letzte Ausgabe ---\n${tail(r.out)}\n`);
process.exit(2);
