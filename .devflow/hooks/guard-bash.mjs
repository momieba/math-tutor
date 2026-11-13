// PreToolUse(Bash): blockiert gefährliche oder prozesswidrige Befehle.
import { readInput, context, get, git, mainBranch, block } from './lib.mjs';

const input = await readInput();
const cmd = get(input, 'tool_input.command') || '';
if (!cmd) process.exit(0);

const { projectDir, config } = context(input);
const lc = cmd.toLowerCase().replace(/\s+/g, ' ');
const main = mainBranch(config);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1) Zerstörerisches Löschen
if (/\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+(\/|~|\$HOME|\*|\.)(\s|$)/.test(cmd) ||
    /remove-item\s+.*-recurse.*\s(\/|~|\*|\.|[a-z]:\\?)(\s|$)/i.test(cmd)) {
  block('Blockiert: rekursives Löschen von /, ~, * oder . ist nicht erlaubt. Lösche gezielt einzelne Pfade.');
}

// 2) Force-Push
if (/\bgit\s+push\b/.test(cmd) && /(--force(\s|$)|\s-f(\s|$)|\s\+[A-Za-z])/.test(cmd)) {
  block("Blockiert: 'git push --force' ist nicht erlaubt. Wenn nötig: '--force-with-lease' auf eigenem Feature-Branch.");
}
if (new RegExp(`git\\s+push.*--force-with-lease.*\\s(origin\\s+)?(${esc(main)}|master)(\\s|$)`).test(cmd)) {
  block(`Blockiert: Force-Push auf '${main}' ist nicht erlaubt.`);
}

// 3) Direkt auf dem Hauptbranch committen (Release-Commits ausgenommen)
if (/\bgit\s+commit\b/.test(cmd) && process.env.DEVFLOW_ALLOW_MAIN_COMMIT !== '1') {
  const br = git(projectDir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if ((br === main || br === 'master') && !/chore\(release\)/.test(cmd)) {
    block(`Blockiert: Kein direkter Commit auf '${br}'. Lege zuerst einen Branch an: git switch -c feat/<name> (oder fix/…, chore/…).`);
  }
}

// 4) Mergen macht der Mensch
if (/\bgh\s+pr\s+merge\b/.test(cmd)) {
  block('Blockiert: PRs werden vom Menschen gemergt. Gib den PR-Link aus und bitte um Merge.');
}

// 5) Secrets lesen / ausgeben
if (/(cat|less|more|head|tail|bat|grep|rg|awk|sed|cp|scp|type|get-content|gc)\b[^|;&]*(^|[\s/\\])\.env(\.(local|development|dev|production|prod|staging|test))?(\s|$)/i.test(cmd)) {
  block('Blockiert: .env-Dateien enthalten Secrets und werden nicht gelesen oder kopiert. Prüfe nur, ob eine Variable gesetzt ist.');
}
if (/(^|[\s;&|])(printenv|env|set)\s*($|\|)/.test(cmd) || /get-childitem\s+env:/i.test(cmd) || /\bdir\s+env:/i.test(cmd)) {
  block('Blockiert: Ausgabe aller Umgebungsvariablen kann Secrets offenlegen. Prüfe gezielt einzelne Variablen auf Existenz.');
}

// 6) Destruktives SQL
if (/(drop\s+(database|schema|table)|truncate\s+table|delete\s+from\s+[a-z_."]+\s*(;|$|"|'))/.test(lc)) {
  block('Blockiert: destruktives SQL (DROP/TRUNCATE/DELETE ohne WHERE). Schemaänderungen nur über Migrationen und mit Freigabe.');
}

// 7) Ungeprüfte Remote-Skripte
if (/(curl|wget|iwr|invoke-webrequest)[^|]*\|\s*(sudo\s+)?((ba|z)?sh|iex|invoke-expression)\b/i.test(cmd)) {
  block("Blockiert: 'curl | sh' führt ungeprüften Code aus. Lade das Skript herunter, zeige es und frage nach Freigabe.");
}

// 8) Unsichere Rechte
if (/chmod\s+(-R\s+)?777/.test(cmd)) {
  block('Blockiert: chmod 777 ist unsicher. Verwende minimale Rechte (z. B. 644/755).');
}

// 9) Projektspezifische Sperren aus .devflow/config.json → blocked_commands
for (const rule of get(config, 'blocked_commands') || []) {
  try {
    if (new RegExp(rule.pattern, 'i').test(cmd)) block(rule.message || `Blockiert durch Projektregel: ${rule.pattern}`);
  } catch { /* ungültiges Muster ignorieren */ }
}

process.exit(0);
