/**
 * Erzeugt supabase/seeds/content-<prüfsumme>.sql aus der geprüften Wissensbasis (src/content).
 * Idempotent (UPSERT), damit bestehende Attempts (FK auf exercises) erhalten bleiben.
 *
 * Warum ein Dateiname mit Prüfsumme: `supabase db push --include-seed` spielt eine Seed-Datei nur beim ersten Mal ein;
 * ändert sie sich später, aktualisiert die CLI nur ihre Prüfsumme („Updating seed hash“) und führt sie NICHT aus.
 * Mit neuem Namen bei jeder Inhaltsänderung ist es für die CLI eine neue Datei – sie wird eingespielt.
 * Aufruf: npm run seed:sql
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { curricula, topics } from '../src/content/index';
import { answerFormatOf } from '../src/content/publicView';

type Val = string | number | boolean | null | undefined | { json: unknown } | { arr: string[] };

function lit(v: Val): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  if ('json' in v) return v.json === undefined ? 'null' : `${lit(JSON.stringify(v.json))}::jsonb`;
  return `array[${v.arr.map(lit).join(', ')}]::text[]`;
}

/**
 * Zeilen je Tabelle sammeln und als wenige mehrzeilige Upserts ausgeben (Reihenfolge = Fremdschlüssel-Reihenfolge).
 * Die Supabase-CLI schickt jede Anweisung einzeln über das Netz – mit einer Anweisung je Zeile (≈ 15 000) dauerte
 * das Einspielen länger als das Zeitlimit des Deploys.
 */
const tables = new Map<string, { pk: string[]; rows: Record<string, Val>[] }>();
function upsert(table: string, pk: string[], row: Record<string, Val>): void {
  if (!tables.has(table)) tables.set(table, { pk, rows: [] });
  tables.get(table)!.rows.push(row);
}
const ROWS_PER_STATEMENT = 500;

function statements(): string[] {
  const result: string[] = [];
  for (const [table, { pk, rows }] of tables) {
    const cols = Object.keys(rows[0]);
    const upd = cols.filter((c) => !pk.includes(c));
    const set = upd.length ? `do update set ${upd.map((c) => `${c} = excluded.${c}`).join(', ')}` : 'do nothing';
    for (let i = 0; i < rows.length; i += ROWS_PER_STATEMENT) {
      const values = rows.slice(i, i + ROWS_PER_STATEMENT).map((row) => `  (${cols.map((c) => lit(row[c])).join(', ')})`);
      result.push(`insert into public.${table} (${cols.join(', ')}) values\n${values.join(',\n')}\non conflict (${pk.join(', ')}) ${set};`);
    }
  }
  return result;
}

for (const c of curricula) {
  upsert('curricula', ['id'], { id: c.id, subject: c.subject, state: c.state, school_type: c.schoolType, grade_from: c.gradeFrom, grade_to: c.gradeTo, version: c.version });
}
topics.forEach((t, ti) => {
  upsert('topics', ['id'], {
    id: t.id, curriculum_id: t.curriculumId, subject: t.subject, grade: t.grade, area: t.area, title: t.title,
    description: t.description, keywords: { arr: t.keywords }, review_status: t.reviewStatus, position: ti,
  });
  for (const s of t.subtopics) {
    upsert('subtopics', ['id'], {
      id: s.id, topic_id: s.topicId, position: s.order, title: s.title, description: s.description, objective: s.objective,
      intro: s.intro, rules: { json: s.rules }, example: { json: s.example }, summary: { json: s.summary },
    });
    s.materials.forEach((m, mi) =>
      upsert('learning_materials', ['id'], { id: m.id, subtopic_id: s.id, position: mi, kind: m.kind, title: m.title, url: m.url, provider: m.provider, duration_sec: m.durationSec }),
    );
    s.exercises.forEach((e, ei) => {
      upsert('exercises', ['id'], {
        id: e.id, subtopic_id: e.subtopicId, position: ei, type: e.type, requirement: e.requirement, difficulty: e.difficulty,
        levels: { json: e.levels }, checkpoint: e.checkpoint, prompt: e.prompt,
        choices: { json: e.choices }, answer_format: { json: answerFormatOf(e.answer) }, objectives: { arr: e.objectives },
        figure: { json: e.figure },
      });
      // Lösungsschlüssel getrennt: für Clients nicht lesbar (0002_production.sql)
      upsert('exercise_keys', ['exercise_id'], { exercise_id: e.id, answer: { json: e.answer }, common_mistakes: { json: e.commonMistakes } });
      upsert('solutions', ['exercise_id'], { exercise_id: e.id, steps: { json: e.solution.steps }, final_answer: e.solution.finalAnswer, alternative: { json: e.solution.alternative } });
      e.hints.forEach((h, hi) => upsert('hints', ['exercise_id', 'level'], { exercise_id: e.id, level: hi + 1, text: h }));
    });
  }
});
const body = statements();
const out = ['-- AUTOMATISCH ERZEUGT durch scripts/generate-seed.ts – nicht von Hand bearbeiten.', 'begin;', ...body, 'commit;', ''];
const sql = out.join('\n');
const dir = fileURLToPath(new URL('../supabase/seeds/', import.meta.url));
const name = `content-${createHash('sha256').update(sql).digest('hex').slice(0, 12)}.sql`;
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (/^content-[0-9a-f]+\.sql$/.test(f) && f !== name) rmSync(dir + f);
writeFileSync(dir + name, sql, 'utf8');
console.log(`supabase/seeds/${name} geschrieben: ${body.length} Anweisungen, ${[...tables.values()].reduce((n, t) => n + t.rows.length, 0)} Zeilen`);
