// Sendet einen FREIGEGEBENEN Social-Media-Entwurf an einen Webhook (Make, Zapier, n8n, Buffer …).
// Aufruf: node .devflow/hooks/publish-webhook.mjs marketing/drafts/<datei>.md
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Pfad zum Entwurf fehlt oder Datei nicht gefunden.'); process.exit(1); }

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let envName = 'DEVFLOW_PUBLISH_WEBHOOK';
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(projectDir, '.devflow', 'config.json'), 'utf8'));
  envName = cfg?.marketing?.webhook_env || envName;
} catch { /* Standard */ }
const url = process.env[envName];
if (!url) { console.error(`Umgebungsvariable ${envName} ist nicht gesetzt – kein Webhook konfiguriert.`); process.exit(1); }

const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
const field = (k) => fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
if (field('status') !== 'approved') { console.error(`Status ist '${field('status')}' – nur 'approved' wird veröffentlicht.`); process.exit(1); }

const section = (name) => {
  const m = text.match(new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  return (m?.[1] || '').trim();
};

const payload = {
  source: file,
  version: field('version'),
  linkedin: { text: section('LinkedIn') },
  instagram: { caption: section('Instagram') },
};

const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
if (!res.ok) { console.error(`Webhook-Fehler (HTTP ${res.status}).`); process.exit(1); }
console.log(`Gesendet (HTTP ${res.status}).`);
