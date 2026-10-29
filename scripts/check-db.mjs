// Validiert 0001_init.sql + seed.sql gegen PGlite mit minimalen Supabase-Stubs und prüft RLS.
// Aufruf: npm run db:check  (Supabase-Stubs für auth/storage; echte Supabase-Instanz nicht nötig)
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const root = new URL('../supabase/', import.meta.url);
const migration = readFileSync(new URL('migrations/0001_init.sql', root), 'utf8');
const seed = readFileSync(new URL('seed.sql', root), 'utf8');
const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  create schema auth; grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage; grant usage on schema storage to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select, insert on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'),1)-1] $$;
`);
try { await db.exec(migration); } catch (e) { console.log("MIGRATION FEHLER:", e.message, "pos", e.position); process.exit(2); }
console.log('✓ Migration ausgeführt');
await db.exec(seed);
const counts = await db.query(`select (select count(*) from topics) t, (select count(*) from subtopics) s, (select count(*) from exercises) e, (select count(*) from hints) h, (select count(*) from solutions) so`);
console.log('✓ Seed ausgeführt', counts.rows[0]);
await db.exec(seed); // Idempotenz
console.log('✓ Seed idempotent');

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${U1}', 'a@x.de', '{"display_name":"Anna"}'), ('${U2}', 'b@x.de', '{}')`);
const prof = await db.query(`select id, display_name, role from profiles order by id`);
console.log('✓ Profile per Trigger', prof.rows.map((r) => `${r.display_name}/${r.role}`).join(', '));

const ex = (await db.query(`select e.id, e.subtopic_id, s.topic_id from exercises e join subtopics s on s.id = e.subtopic_id limit 1`)).rows[0];

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
async function expectCount(label, sql, n) {
  const r = await db.query(sql); const c = Number(r.rows[0].c);
  if (c === n) console.log(`  ✓ ${label}: ${c}`); else { failures++; console.log(`  ✗ ${label}: ${c}, erwartet ${n}`); }
}

const ins = `insert into attempts (user_id, exercise_id, subtopic_id, topic_id, answer_raw, points, is_correct) values ($1,$2,$3,$4,'5',1,true) returning id`;

console.log('Schüler U1:');
await as(U1);
await expectOk('Inhalte lesen', `select count(*) c from topics`);
await expectDenied('Inhalte schreiben', `insert into topics (id, curriculum_id, grade, area, title) values ('x','de-gym-mathe-7-9-v1',7,'a','b')`);
await expectDenied('Aufgabe ändern', `update exercises set prompt = 'x'`);
const a1 = await expectOk('eigenen Versuch anlegen', ins, [U1, ex.id, ex.subtopic_id, ex.topic_id]);
const attemptId = a1?.rows[0].id;
await expectDenied('Versuch für fremden Nutzer', ins, [U2, ex.id, ex.subtopic_id, ex.topic_id]);
await expectDenied('Versuch mit falschem Kapitel', ins, [U1, ex.id, 'falsch', ex.topic_id]);
await expectDenied('Versuch nachträglich ändern', `update attempts set points = 0 where id = $1 returning id`, [attemptId]).catch(() => {});
await expectOk('Korrektur source=auto', `insert into corrections (attempt_id, source, verdict, points) values ($1,'auto','correct',1)`, [attemptId]);
await expectDenied('Korrektur source=ai vom Client', `insert into corrections (attempt_id, source, verdict, points) values ($1,'ai','correct',1)`, [attemptId]);
await expectOk('Submission eigener Versuch', `insert into submissions (attempt_id, user_id, kind, storage_path) values ($1,$2,'canvas',$3)`, [attemptId, U1, `${U1}/${attemptId}.png`]);
await expectOk('aktives Thema upsert #1', `insert into student_topics (user_id, topic_id) values ($1,$2) on conflict (user_id, topic_id) do update set topic_id = excluded.topic_id returning topic_id`, [U1, ex.topic_id]);
await expectOk('aktives Thema upsert #2', `insert into student_topics (user_id, topic_id) values ($1,$2) on conflict (user_id, topic_id) do update set topic_id = excluded.topic_id returning topic_id`, [U1, ex.topic_id]);
await expectOk('Anzeigename ändern', `update profiles set display_name = 'Anna B.' where id = $1`, [U1]);
await expectDenied('eigene Rolle hochstufen', `update profiles set role = 'admin' where id = $1`, [U1]);
await expectDenied('Eltern-Verknüpfung selbst anlegen', `insert into parent_child (parent_id, child_id) values ($1,$2)`, [U1, U2]);
await expectDenied('Abo selbst anlegen', `insert into subscriptions (user_id, plan, billing_interval, status) values ($1,'x','month','active')`, [U1]);
await expectOk('Storage: eigenes Bild', `insert into storage.objects (bucket_id, name) values ('submissions', $1)`, [`${U1}/${attemptId}.png`]);
await expectDenied('Storage: fremder Ordner', `insert into storage.objects (bucket_id, name) values ('submissions', $1)`, [`${U2}/x.png`]);
await expectCount('eigene Versuche sichtbar', `select count(*) c from attempts`, 1);

console.log('Schüler U2:');
await as(U2);
await expectCount('fremde Versuche sichtbar', `select count(*) c from attempts`, 0);
await expectCount('fremde Korrekturen sichtbar', `select count(*) c from corrections`, 0);
await expectCount('fremde Submissions sichtbar', `select count(*) c from submissions`, 0);
await expectCount('fremde Profile sichtbar', `select count(*) c from profiles`, 1);
await expectCount('fremde Storage-Objekte', `select count(*) c from storage.objects`, 0);

console.log('Anonym:');
await as(null, 'anon');
await expectDenied('Inhalte lesen (anon)', `select count(*) from topics`);
await expectDenied('Versuche lesen (anon)', `select count(*) from attempts`);

await db.exec('reset role');
console.log(failures ? `\n${failures} FEHLER` : '\nALLE PRÜFUNGEN BESTANDEN');
process.exit(failures ? 1 : 0);
