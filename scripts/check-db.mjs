// Validiert alle Migrationen + Inhalts-Seed (supabase/seeds/content-*.sql) gegen PGlite mit minimalen Supabase-Stubs und prüft RLS, Rechte und RPCs.
// Aufruf: npm run db:check  (Supabase-Stubs für auth/storage; echte Supabase-Instanz nicht nötig)
import { readdirSync, readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const root = new URL('../supabase/', import.meta.url);
const migrations = readdirSync(new URL('migrations/', root)).filter((f) => f.endsWith('.sql')).sort();
const seedFiles = readdirSync(new URL('seeds/', root)).filter((f) => /^content-[0-9a-f]+\.sql$/.test(f));
if (seedFiles.length !== 1) throw new Error(`Genau eine Inhaltsdatei in supabase/seeds/ erwartet, gefunden: ${seedFiles.join(', ') || 'keine'}`);
const seed = readFileSync(new URL(`seeds/${seedFiles[0]}`, root), 'utf8');
const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  -- Wie Supabase: neue Tabellen/Funktionen in public sind standardmäßig für alle API-Rollen freigegeben.
  -- Die Migrationen müssen Rechte also ausdrücklich entziehen; dieser Check fällt sonst auf.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  create schema auth; grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage; grant usage on schema storage to anon, authenticated, service_role;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select, insert on storage.objects to authenticated;
  grant all on storage.objects to service_role;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'),1)-1] $$;
`);
for (const file of migrations) {
  try {
    await db.exec(readFileSync(new URL(`migrations/${file}`, root), 'utf8'));
  } catch (e) {
    console.log(`MIGRATION FEHLER (${file}):`, e.message, 'pos', e.position);
    process.exit(2);
  }
  console.log(`✓ Migration ${file}`);
}
await db.exec(seed);
const counts = await db.query(`select (select count(*) from topics) t, (select count(*) from subtopics) s, (select count(*) from exercises) e, (select count(*) from exercise_keys) k, (select count(*) from hints) h, (select count(*) from solutions) so`);
console.log('✓ Seed ausgeführt', counts.rows[0]);
await db.exec(seed); // Idempotenz
console.log('✓ Seed idempotent');

// Labels (0009): jedes Thema und Unterthema hat Labels aus dem Seed, Prismen (Kreis und Zylinder) liegt in Klasse 8
const labels = (await db.query(`select
  (select count(*) from topics where jsonb_array_length(labels) = 0) + (select count(*) from subtopics where jsonb_array_length(labels) = 0) as ohne,
  (select labels @> '[{"state":"NW","schoolType":"gymnasium","grade":8}]' from subtopics where id = 'kz-prisma') as prisma8,
  (select count(*) from topics where labels @> '[{"grade":9}]') as klasse9,
  (select count(*) from topics where grade is not null) as mit_grade`)).rows[0];
if (Number(labels.ohne) !== 0 || labels.prisma8 !== true || Number(labels.klasse9) < 1 || Number(labels.mit_grade) !== 0) {
  throw new Error(`Labels aus dem Seed unvollständig: ${JSON.stringify(labels)}`);
}
console.log('✓ Labels an Themen und Unterthemen', labels);

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${U1}', 'a@x.de', '{"display_name":"Anna","consent_version":"2026-11"}'), ('${U2}', 'b@x.de', '{}')`);
const prof = await db.query(`select id, display_name, role, consent_version, consented_at is not null as consented from profiles order by id`);
console.log('✓ Profile per Trigger', prof.rows.map((r) => `${r.display_name}/${r.role}/${r.consent_version ?? 'ohne Einwilligung'}`).join(', '));

// Eine Zahlaufgabe (Hinweise + Lösung vorhanden) als Testobjekt
const ex = (await db.query(`select e.id, e.subtopic_id, s.topic_id from exercises e join subtopics s on s.id = e.subtopic_id join exercise_keys k on k.exercise_id = e.id where k.answer->>'kind' = 'numeric' order by e.id limit 1`)).rows[0];

let failures = 0;
async function as(user, role = 'authenticated') {
  await db.exec(`reset role`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [user ?? '']);
  await db.exec(`set role ${role}`);
}
async function expectOk(label, sql, params) {
  try { const r = await db.query(sql, params); console.log(`  ✓ erlaubt:   ${label}`, r.rows.length ? JSON.stringify(r.rows[0]).slice(0, 80) : ''); return r; }
  catch (e) { failures++; console.log(`  ✗ FEHLER (sollte erlaubt sein): ${label} → ${e.message}`); }
}
async function expectDenied(label, sql, params) {
  try { await db.query(sql, params); failures++; console.log(`  ✗ FEHLER (sollte verboten sein): ${label}`); }
  catch (e) { console.log(`  ✓ verboten:  ${label} (${e.message.slice(0, 60)})`); }
}
async function expectValue(label, sql, expected, params) {
  try {
    const r = await db.query(sql, params);
    const v = Object.values(r.rows[0] ?? {})[0];
    const got = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
    if (got === String(expected)) console.log(`  ✓ ${label}: ${got.slice(0, 60)}`); else { failures++; console.log(`  ✗ ${label}: ${got.slice(0, 120)}, erwartet ${expected}`); }
  } catch (e) { failures++; console.log(`  ✗ ${label} → ${e.message}`); }
}

const record = `select record_graded_attempt($1, $2, $3, '15', 'correct', 1, '[]'::jsonb, 'Richtig!') as id`;
const A1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

console.log('Schüler U1 – Inhalte und Lösungen:');
await as(U1);
await expectOk('Inhalte lesen', `select count(*) c from topics`);
await expectValue('Labels lesen', `select labels->0->>'grade' from subtopics where id = 'kz-prisma'`, 8);
await expectDenied('Labels ändern', `update subtopics set labels = '[]' where id = 'kz-prisma'`);
await expectOk('Aufgaben ohne Lösung lesen', `select id, answer_format from exercises limit 1`);
await expectDenied('Inhalte schreiben', `insert into topics (id, curriculum_id, grade, area, title) values ('x','de-gym-mathe-7-9-v1',7,'a','b')`);
await expectDenied('Aufgabe ändern', `update exercises set prompt = 'x'`);
await expectDenied('Lösungsschlüssel lesen', `select * from exercise_keys`);
await expectDenied('Antwort über exercises lesen', `select answer from exercises`);
await expectDenied('Hinweise direkt lesen', `select * from hints`);
await expectDenied('Musterlösung direkt lesen', `select * from solutions`);
await expectDenied('Bewertungskontext (nur Server)', `select grading_context($1)`, [ex.id]);
await expectValue('Nachlesen ohne Versuch', `select get_exercise_review($1) is null`, true, [ex.id]);

console.log('Schüler U1 – Hilfen werden protokolliert:');
await expectDenied('Hinweis 2 vor Hinweis 1', `select reveal_hint($1, 2)`, [ex.id]);
await expectValue('Hinweis 1 aufdecken', `select jsonb_array_length(reveal_hint($1, 1))`, 1, [ex.id]);
await expectValue('Hinweis 2 aufdecken', `select jsonb_array_length(reveal_hint($1, 2))`, 2, [ex.id]);
await expectDenied('Hinweisstufe 4', `select reveal_hint($1, 4)`, [ex.id]);
await expectDenied('Hinweis zu unbekannter Aufgabe', `select reveal_hint('gibt-es-nicht', 1)`);
await expectValue('Lösung vor Abgabe', `select reveal_solution($1) ? 'finalAnswer'`, true, [ex.id]);
await expectValue('Stand nach Neuladen', `select jsonb_array_length(s->'hints')::text || '/' || (s->'solution' is not null and s->'solution' <> 'null')::text from get_exercise_session($1) s`, '2/true', [ex.id]);
await expectDenied('Bearbeitung zurücksetzen (Hilfen tilgen)', `delete from exercise_sessions`);
await expectDenied('Hilfen-Zähler ändern', `update exercise_sessions set hints_used = 0`);
await expectDenied('Abgelaufene Bearbeitung direkt löschen', `select drop_stale_session($1, $2)`, [U1, ex.id]);

console.log('Schüler U1 – Schreiben nur serverseitig:');
await expectDenied('Versuch selbst anlegen', `insert into attempts (user_id, exercise_id, subtopic_id, topic_id, answer_raw, points, is_correct) values ($1,$2,$3,$4,'5',1,true)`, [U1, ex.id, ex.subtopic_id, ex.topic_id]);
await expectDenied('Bewerteten Versuch per RPC fälschen', record, [U1, ex.id, A1]);
await expectDenied('Fortschritt selbst schreiben', `insert into progress (user_id, topic_id, score) values ($1, $2, 100)`, [U1, ex.topic_id]);
await expectDenied('Storage: Bild selbst hochladen', `insert into storage.objects (bucket_id, name) values ('submissions', $1)`, [`${U1}/x.png`]);
await expectOk('aktives Thema upsert #1', `insert into student_topics (user_id, topic_id) values ($1,$2) on conflict (user_id, topic_id) do update set topic_id = excluded.topic_id returning topic_id`, [U1, ex.topic_id]);
await expectOk('aktives Thema upsert #2', `insert into student_topics (user_id, topic_id) values ($1,$2) on conflict (user_id, topic_id) do update set topic_id = excluded.topic_id returning topic_id`, [U1, ex.topic_id]);
await expectOk('Anzeigename ändern', `update profiles set display_name = 'Anna B.' where id = $1`, [U1]);
await expectDenied('eigene Rolle hochstufen', `update profiles set role = 'admin' where id = $1`, [U1]);
await expectDenied('Einwilligung direkt setzen', `update profiles set consented_at = '2000-01-01' where id = $1`, [U1]);
await expectDenied('Eltern-Verknüpfung selbst anlegen', `insert into parent_child (parent_id, child_id) values ($1,$2)`, [U1, U2]);
await expectDenied('Abo selbst anlegen', `insert into subscriptions (user_id, plan, billing_interval, status) values ($1,'x','month','active')`, [U1]);

console.log('Edge Function (service_role):');
await as(null, 'service_role');
await expectValue('Bewertungskontext', `select grading_context($1) -> 'key' ? 'answer'`, true, [ex.id]);
await expectValue('Ausführliche Lösung im Bewertungskontext', `select jsonb_array_length(grading_context('pyth-hypotenuse-1') -> 'review' -> 'solution' -> 'detailed') >= 5`, true);
await expectDenied('unklare Abgabe speichern', `select record_graded_attempt($1, $2, $3, '?', 'unclear', 0, '[]'::jsonb, '')`, [U1, ex.id, A1]);
await expectDenied('fremder Speicherpfad', `select record_graded_attempt($1, $2, $3, '15', 'correct', 1, '[]'::jsonb, '', null, 'canvas', $4)`, [U1, ex.id, A1, `${U2}/${A1}.png`]);
await expectOk('bewerteten Versuch speichern', `select record_graded_attempt($1, $2, $3, '15', 'correct', 1, '[]'::jsonb, 'Richtig!', null, 'canvas', $4)`, [U1, ex.id, A1, `${U1}/${A1}.png`]);
await expectValue('Hilfen übernommen', `select hints_used || '/' || solution_viewed from attempts where id = $1`, '2/true', [A1]);
await expectValue('Korrektur + Einreichung', `select (select count(*) from corrections where attempt_id = $1) || '/' || (select count(*) from submissions where attempt_id = $1)`, '1/1', [A1]);
await expectValue('Bearbeitung beendet', `select count(*) from exercise_sessions where user_id = $1`, 0, [U1]);
await expectValue('Übungsmodus und Quelle auto als Standard', `select a.mode || '/' || c.source from attempts a join corrections c on c.attempt_id = a.id where a.id = $1`, 'practice/auto', [A1]);
const A2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
await expectOk('Testversuch mit KI-Korrektur speichern', `select record_graded_attempt($1, $2, $3, '15', 'correct', 1, '[]'::jsonb, '', null, null, null, null, 'test', 'ai')`, [U1, ex.id, A2]);
await expectValue('Testmodus und Quelle ai gespeichert', `select a.mode || '/' || c.source from attempts a join corrections c on c.attempt_id = a.id where a.id = $1`, 'test/ai', [A2]);
await expectDenied('Quelle „teacher“ über die Edge Function', `select record_graded_attempt($1, $2, gen_random_uuid(), '15', 'correct', 1, '[]'::jsonb, '', null, null, null, null, 'practice', 'teacher')`, [U1, ex.id]);
await expectOk('Storage: Upload durch Server', `insert into storage.objects (bucket_id, name) values ('submissions', $1)`, [`${U1}/${A1}.png`]);

console.log('Schüler U1 – nach der Abgabe:');
await as(U1);
await expectValue('eigene Versuche sichtbar', `select count(*) from attempts`, 2);
await expectOk('Lernpfad: gesehen speichern (upsert)', `insert into learning_path_seen (user_id, subtopic_id, intro_seen) values ($1, $2, true) on conflict (user_id, subtopic_id) do update set user_id = excluded.user_id, subtopic_id = excluded.subtopic_id, intro_seen = excluded.intro_seen, explain_seen = excluded.explain_seen, updated_at = now() returning intro_seen`, [U1, ex.subtopic_id]);
await expectDenied('Lernpfad: für andere speichern', `insert into learning_path_seen (user_id, subtopic_id, intro_seen) values ($1, $2, true)`, [U2, ex.subtopic_id]);
await expectValue('Nachlesen nach Versuch', `select get_exercise_review($1) ?& array['hints','solution','commonMistakes']`, true, [ex.id]);
await expectValue('neue Bearbeitung ohne Hilfen', `select jsonb_array_length(get_exercise_session($1)->'hints')`, 0, [ex.id]);
await expectValue('Hinweis in neuer Bearbeitung', `select jsonb_array_length(reveal_hint($1, 1))`, 1, [ex.id]);
await expectOk('Überspringen verwirft die Hilfen', `select discard_exercise_session($1)`, [ex.id]);
await expectValue('nach dem Überspringen ohne Hilfen', `select jsonb_array_length(get_exercise_session($1)->'hints')`, 0, [ex.id]);
await expectValue('Storage: eigenes Bild lesbar', `select count(*) from storage.objects`, 1);
await expectOk('Einwilligung per RPC', `select accept_terms('2026-11')`);
await expectValue('Einwilligung gespeichert', `select consent_version from profiles where id = $1`, '2026-11', [U1]);
await expectDenied('Einwilligung ohne Version', `select accept_terms('')`);

console.log('Schüler U2:');
await as(U2);
await expectValue('fremde Versuche sichtbar', `select count(*) from attempts`, 0);
await expectValue('fremde Korrekturen sichtbar', `select count(*) from corrections`, 0);
await expectValue('fremde Submissions sichtbar', `select count(*) from submissions`, 0);
await expectValue('fremde Profile sichtbar', `select count(*) from profiles`, 1);
await expectValue('fremde Storage-Objekte', `select count(*) from storage.objects`, 0);
await expectValue('fremde Bearbeitungen', `select count(*) from exercise_sessions`, 0);
await expectValue('fremder Lernpfad', `select count(*) from learning_path_seen`, 0);
await expectValue('Nachlesen fremder Aufgabe', `select get_exercise_review($1) is null`, true, [ex.id]);
await expectValue('ohne Einwilligung', `select consent_version is null from profiles`, true);

console.log('Anonym:');
await as(null, 'anon');
await expectDenied('Inhalte lesen (anon)', `select count(*) from topics`);
await expectDenied('Versuche lesen (anon)', `select count(*) from attempts`);
await expectDenied('Lernpfad lesen (anon)', `select count(*) from learning_path_seen`);
await expectDenied('Hinweis aufdecken (anon)', `select reveal_hint($1, 1)`, [ex.id]);
await expectDenied('Bewerteten Versuch speichern (anon)', record, [U1, ex.id, A1]);

await db.exec('reset role');
console.log(failures ? `\n${failures} FEHLER` : '\nALLE PRÜFUNGEN BESTANDEN');
process.exit(failures ? 1 : 0);
