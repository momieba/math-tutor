// PreToolUse(Read|Edit|Write|MultiEdit): schützt sensible oder generierte Dateien.
// protected_paths-Einträge: "muster" (sperrt alles) oder
// { "pattern": "muster", "tools": ["Edit","Write","MultiEdit"], "message": "Begründung" } (sperrt nur diese Tools).
// Muster mit "/" am Ende = Verzeichnis; sonst Glob (* ?) gegen den Dateinamen.
import { readInput, context, get, toPosix, block } from './lib.mjs';

const input = await readInput();
const raw = get(input, 'tool_input.file_path');
if (!raw) process.exit(0);

const { config } = context(input);
const tool = input.tool_name || 'Tool';
const file = toPosix(raw);
const base = file.split('/').pop();

const rules = (get(config, 'protected_paths') ||
  ['.env', '.env.local', '.env.production', '.git/', 'secrets/', '*.pem', 'id_rsa'])
  .map((r) => (typeof r === 'string' ? { pattern: r } : r));

const globToRegex = (g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')}$`, 'i');

for (const { pattern: p, tools, message } of rules) {
  if (!p || (tools && !tools.includes(tool))) continue;
  const hit = p.endsWith('/')
    ? file.includes(`/${p}`) || file.startsWith(p)
    : globToRegex(p).test(base);
  if (hit) {
    block(`Blockiert (${tool}): '${raw}' ist geschützt (Muster '${p}'). ${message ||
      'Secrets nie lesen oder ändern – Vorlagen gehören in .env.example.'}`);
  }
}
process.exit(0);
