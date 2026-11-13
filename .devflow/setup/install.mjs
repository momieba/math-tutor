// Kopiert die devflow-Dateien, die Claude aus Sicherheitsgründen nicht selbst schreiben darf,
// an ihren Platz: .claude/settings.json, .mcp.json, .github/… (Berechtigungen, Anbindungen, CI).
// Aufruf im Projektordner:  node .devflow/setup/install.mjs
// Bestehende Dateien werden NICHT überschrieben (dann Hinweis + manuell zusammenführen).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

const files = [
  ['claude-settings.json', '.claude/settings.json'],
  ['mcp.json', '.mcp.json'],
  ['pull_request_template.md', '.github/pull_request_template.md'],
  ['claude-review.yml', '.github/workflows/claude-review.yml'],
  ['claude-mention.yml', '.github/workflows/claude-mention.yml'],
];

let skipped = 0;
for (const [src, dest] of files) {
  const from = path.join(here, src);
  const to = path.join(root, dest);
  if (fs.existsSync(to)) {
    console.log(`übersprungen (existiert schon): ${dest}  → Inhalt aus .devflow/setup/${src} bei Bedarf manuell übernehmen`);
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`angelegt: ${dest}`);
}
console.log(skipped ? '\nFertig (mit übersprungenen Dateien).' : '\nFertig. Claude Code im Projekt neu starten, damit Hooks und MCP-Server geladen werden.');
