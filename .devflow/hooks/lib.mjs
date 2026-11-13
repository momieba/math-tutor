// devflow – gemeinsame Helfer für Hook-Skripte (Node ≥ 18, keine Abhängigkeiten, Windows/macOS/Linux).
// Hooks bekommen JSON auf stdin. Exit 0 = ok, Exit 2 = blockieren (stderr geht an Claude).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export async function readInput() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export function context(input) {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const configPath = path.join(projectDir, '.devflow', 'config.json');
  let config = null;
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { /* keine Config */ }
  return { projectDir, config, logDir: path.join(projectDir, '.devflow', 'logs') };
}

export const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function git(projectDir, args) {
  try {
    return execFileSync('git', ['-C', projectDir, ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
    }).trim();
  } catch { return ''; }
}

export function run(cmd, cwd) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}` };
}

export const mainBranch = (config) => get(config, 'git.main_branch') || 'main';
export const toPosix = (p) => String(p || '').replace(/\\/g, '/');

export function block(msg) {
  process.stderr.write(`devflow: ${msg}\n`);
  process.exit(2);
}

export function tail(text, lines = 40) {
  return String(text).trimEnd().split(/\r?\n/).slice(-lines).join('\n');
}
