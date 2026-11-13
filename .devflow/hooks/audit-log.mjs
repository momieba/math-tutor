// PostToolUse(Bash): Audit-Log ausgeführter Befehle nach .devflow/logs/audit.log
import fs from 'node:fs';
import path from 'node:path';
import { readInput, context, get, git } from './lib.mjs';

const input = await readInput();
const { projectDir, config, logDir } = context(input);
const cmd = get(input, 'tool_input.command');
if (!config || !cmd) process.exit(0);

try {
  fs.mkdirSync(logDir, { recursive: true });
  const line = [
    new Date().toISOString(),
    String(input.session_id || '').slice(0, 8),
    input.agent_type || 'main',
    git(projectDir, ['rev-parse', '--abbrev-ref', 'HEAD']) || '?',
    cmd.replace(/\s+/g, ' ').slice(0, 500),
  ].join('\t');
  fs.appendFileSync(path.join(logDir, 'audit.log'), `${line}\n`);
} catch { /* Logging darf nie stören */ }
process.exit(0);
