/**
 * Erzeugt supabase/seed.sql aus der geprüften Wissensbasis (src/content).
 * Idempotent (UPSERT), damit bestehende Attempts (FK auf exercises) erhalten bleiben.
 * Aufruf: npm run seed:sql
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { curricula, topics } from '../src/content/index';

type Val = string | number | boolean | null | undefined | { json: unknown } | { arr: string[] };

function lit(v: Val): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  if ('json' in v) return v.json === undefined ? 'null' : `${lit(JSON.stringify(v.json))}::jsonb`;
  return `array[${v.arr.map(lit).join(', ')}]::text[]`;
}

function upsert(table: string, pk: string[], row: Record<string, Val>): string {
  const cols = Object.keys(row);
  const upd = cols.filter((c) => !pk.includes(c));
  const set = upd.length ? `do update set ${upd.map((c) => `${c} = excluded.${c}`).join(', ')}` : 'do nothing';
  return `insert into public.${table} (${cols.join(', ')}) values (${cols.map((c) => lit(row[c])).join(', ')}) on conflict (${pk.join(', ')}) ${set};`;
}

const out: string[] = ['-- AUTOMATISCH ERZEUGT durch scripts/generate-seed.ts – nicht von Hand bearbeiten.', 'begin;'];

for (const c of curricula) {
  out.push(upsert('curricula', ['id'], { id: c.id, subject: c.subject, state: c.state, school_type: c.schoolType, grade_from: c.gradeFrom, grade_to: c.gradeTo, version: c.version }));
}
topics.forEach((t, ti) => {
  out.push(
    upsert('topics', ['id'], {
      id: t.id, curriculum_id: t.curriculumId, subject: t.subject, grade: t.grade, area: t.area, title: t.title,
      description: t.description, keywords: { arr: t.keywords }, review_status: t.reviewStatus, position: ti,
    }),
  );
  for (const s of t.subtopics) {
    out.push(
      upsert('subtopics', ['id'], {
        id: s.id, topic_id: s.topicId, position: s.order, title: s.title, description: s.description, objective: s.objective,
        intro: s.intro, rules: { json: s.rules }, example: { json: s.example }, summary: { json: s.summary },
      }),
    );
    s.materials.forEach((m, mi) =>
      out.push(upsert('learning_materials', ['id'], { id: m.id, subtopic_id: s.id, position: mi, kind: m.kind, title: m.title, url: m.url, provider: m.provider, duration_sec: m.durationSec })),
    );
    s.exercises.forEach((e, ei) => {
      out.push(
        upsert('exercises', ['id'], {
          id: e.id, subtopic_id: e.subtopicId, position: ei, type: e.type, difficulty: e.difficulty, prompt: e.prompt,
          choices: { json: e.choices }, answer: { json: e.answer }, objectives: { arr: e.objectives },
          common_mistakes: { json: e.commonMistakes }, figure: { json: e.figure },
        }),
      );
      out.push(upsert('solutions', ['exercise_id'], { exercise_id: e.id, steps: { json: e.solution.steps }, final_answer: e.solution.finalAnswer, alternative: { json: e.solution.alternative } }));
      e.hints.forEach((h, hi) => out.push(upsert('hints', ['exercise_id', 'level'], { exercise_id: e.id, level: hi + 1, text: h })));
    });
  }
});
out.push('commit;', '');

const target = fileURLToPath(new URL('../supabase/seed.sql', import.meta.url));
writeFileSync(target, out.join('\n'), 'utf8');
console.log(`seed.sql geschrieben: ${out.length - 3} Statements`);
