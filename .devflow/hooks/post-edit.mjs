// PostToolUse(Edit|Write|MultiEdit): formatiert die geänderte Datei mit dem Projekt-Formatter (falls konfiguriert).
import fs from 'node:fs';
import path from 'node:path';
import { readInput, context, get, run, tail } from './lib.mjs';

const input = await readInput();
const { projectDir, config } = context(input);
if (!config) process.exit(0);

const file = get(input, 'tool_input.file_path');
const fmt = get(config, 'commands.format_file');
if (!file || !fmt || !fs.existsSync(file)) process.exit(0);

const exts = get(config, 'format_extensions') || [];
if (exts.length && !exts.includes(path.extname(file))) process.exit(0);

const quoted = `"${file.replace(/"/g, '\\"')}"`;
const cmd = fmt.includes('{file}') ? fmt.replaceAll('{file}', quoted) : `${fmt} ${quoted}`;
const r = run(cmd, projectDir);
if (!r.ok) {
  process.stderr.write(`devflow: Formatter meldet Probleme in ${file}:\n${tail(r.out, 20)}\n`);
  process.exit(2);
}
process.exit(0);
