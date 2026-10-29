-- =====================================================================================
-- 0001_init.sql – Grundschema MatheMentor (MVP Phase 1, vorbereitet für Phase 2–4)
--
-- Zwei strikt getrennte Bereiche:
--   A) LERNINHALTE (curricula … tests): global, versioniert, für `authenticated` NUR LESBAR.
--      Schreiben ausschließlich per service_role (Seed: supabase/seed.sql, erzeugt via `npm run seed:sql`).
--   B) NUTZERDATEN (profiles, student_topics, attempts, …): gehören genau einem auth.uid().
--      Kein Zugriff für `anon`. Beziehungen Eltern/Lehrer und Abos: angelegt, aber restriktiv.
--
-- Konventionen: Inhalts-IDs sind sprechende Text-Slugs aus src/content (z. B. 'pythagoras-hypotenuse-1'),
-- Nutzerdaten-IDs sind UUIDs. Alle Tabellen haben RLS aktiviert („deny by default“).
-- =====================================================================================

-- gen_random_uuid() ist seit PostgreSQL 13 im Kern enthalten (keine Extension nötig).

-- ---------------------------------------------------------------- Typen
create type public.app_role        as enum ('student', 'parent', 'teacher', 'admin');
create type public.exercise_type   as enum ('multiple-choice', 'numeric', 'equation', 'text', 'handwriting');
create type public.review_status   as enum ('draft', 'internal-review', 'approved');
create type public.attempt_mode    as enum ('practice', 'test');
create type public.submission_kind as enum ('canvas', 'photo', 'text');
create type public.correction_source as enum ('auto', 'self', 'ai', 'teacher');
create type public.verdict         as enum ('correct', 'partial', 'incorrect', 'unclear');
create type public.chapter_status  as enum ('not_started', 'in_progress', 'needs_practice', 'mastered');
create type public.link_status     as enum ('pending', 'approved', 'revoked');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid');

-- =====================================================================================
-- A) LERNINHALTE
-- =====================================================================================

create table public.curricula (
  id          text primary key,
  subject     text not null default 'Mathematik',
  state       text not null,                 -- Bundesland-Kürzel oder 'DE'
  school_type text not null,
  grade_from  smallint not null check (grade_from between 1 and 13),
  grade_to    smallint not null check (grade_to between grade_from and 13),
  version     text not null,
  created_at  timestamptz not null default now()
);

create table public.topics (
  id            text primary key,
  curriculum_id text not null references public.curricula(id) on delete restrict,
  subject       text not null default 'Mathematik',
  grade         smallint not null,
  area          text not null,               -- Themengebiet, z. B. Geometrie
  title         text not null,
  description   text not null default '',
  keywords      text[] not null default '{}',-- für deterministisches Topic-Matching
  review_status public.review_status not null default 'draft',
  position      int not null default 0
);
create index on public.topics (curriculum_id);

create table public.subtopics (
  id          text primary key,
  topic_id    text not null references public.topics(id) on delete cascade,
  position    int not null,
  title       text not null,
  description text not null default '',
  objective   text not null,
  intro       text not null default '',
  rules       jsonb not null default '[]',   -- Rule[]
  example     jsonb,                         -- WorkedExample
  summary     jsonb not null default '[]',   -- string[]
  unique (topic_id, position)
);

create table public.learning_materials (
  id           text primary key,
  subtopic_id  text not null references public.subtopics(id) on delete cascade,
  position     int not null default 0,
  kind         text not null check (kind in ('video', 'text', 'link')),
  title        text not null,
  url          text,                         -- NULL = Platzhalter
  provider     text check (provider in ('own', 'youtube', 'external')),
  duration_sec int
);
create index on public.learning_materials (subtopic_id);

create table public.exercises (
  id              text primary key,
  subtopic_id     text not null references public.subtopics(id) on delete cascade,
  position        int not null default 0,
  type            public.exercise_type not null,
  difficulty      smallint not null check (difficulty between 1 and 3),
  prompt          text not null,
  choices         jsonb,                     -- Choice[] (nur multiple-choice)
  answer          jsonb not null,            -- ExpectedAnswer
  objectives      text[] not null default '{}',
  common_mistakes jsonb not null default '[]',
  figure          jsonb,
  review_status   public.review_status not null default 'approved'
);
create index on public.exercises (subtopic_id);

-- Musterlösung + Bewertungskriterien (1:1 zur Aufgabe)
create table public.solutions (
  exercise_id  text primary key references public.exercises(id) on delete cascade,
  steps        jsonb not null,               -- SolutionStep[]
  final_answer text not null,
  alternative  jsonb,                        -- SolutionStep[] | null
  criteria     jsonb not null default '[]'   -- Phase 2: Bewertungskriterien für Teilpunkte
);

-- Gestufte Hinweise (genau 3 Stufen im MVP)
create table public.hints (
  exercise_id text not null references public.exercises(id) on delete cascade,
  level       smallint not null check (level between 1 and 3),
  text        text not null,
  primary key (exercise_id, level)
);

-- Testdefinitionen (Phase 2) – Inhalte, daher read-only
create table public.tests (
  id            text primary key,
  topic_id      text not null references public.topics(id) on delete cascade,
  subtopic_id   text references public.subtopics(id) on delete cascade, -- NULL = Test über ganzes Thema
  title         text not null,
  difficulty    smallint check (difficulty between 1 and 3),
  time_limit_sec int check (time_limit_sec > 0),
  review_status public.review_status not null default 'draft'
);

create table public.test_exercises (
  test_id     text not null references public.tests(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete restrict,
  position    int not null,
  max_points  numeric(5,2) not null default 1,
  primary key (test_id, exercise_id)
);

-- =====================================================================================
-- B) NUTZERDATEN
-- =====================================================================================

-- Profil (1:1 zu auth.users). Rolle wird NICHT vom Client gesetzt (siehe Column-Grants unten).
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         public.app_role not null default 'student',
  grade        smallint check (grade between 1 and 13),
  curriculum_id text references public.curricula(id),
  created_at   timestamptz not null default now()
);

-- Eltern-Kind-Verknüpfung (Phase 3). Anlage/Freigabe NUR serverseitig (Edge Function mit Einladungscode + Einwilligung).
create table public.parent_child (
  parent_id   uuid not null references auth.users(id) on delete cascade,
  child_id    uuid not null references auth.users(id) on delete cascade,
  status      public.link_status not null default 'pending',
  consent_at  timestamptz,
  created_at  timestamptz not null default now(),
  primary key (parent_id, child_id),
  check (parent_id <> child_id)
);

-- Lehrer-Schüler-Zuordnung (Phase 3). Anlage/Freigabe NUR serverseitig.
create table public.teacher_student (
  teacher_id  uuid not null references auth.users(id) on delete cascade,
  student_id  uuid not null references auth.users(id) on delete cascade,
  group_name  text,
  status      public.link_status not null default 'pending',
  created_at  timestamptz not null default now(),
  primary key (teacher_id, student_id),
  check (teacher_id <> student_id)
);

-- Aktive Themen eines Schülers (Dashboard-Kacheln)
create table public.student_topics (
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete restrict,
  added_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- Ein Bearbeitungsversuch. Unveränderlich (Historie) – kein UPDATE/DELETE für Clients.
create table public.attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id     text not null references public.exercises(id) on delete restrict,
  subtopic_id     text not null references public.subtopics(id) on delete restrict,
  topic_id        text not null references public.topics(id) on delete restrict,
  mode            public.attempt_mode not null default 'practice',
  test_result_id  uuid,                      -- gesetzt, wenn im Testmodus (FK unten)
  answer_raw      text not null default '',
  points          numeric(4,3) not null check (points between 0 and 1),
  is_correct      boolean not null,
  hints_used      smallint not null default 0 check (hints_used between 0 and 3),
  solution_viewed boolean not null default false,
  started_at      timestamptz not null default now(),
  submitted_at    timestamptz not null default now()
);
create index on public.attempts (user_id, submitted_at desc);
create index on public.attempts (user_id, topic_id);
create index on public.attempts (user_id, subtopic_id);

-- Eingereichte Lösung (Canvas-Bild, Foto, Strokes). Bild liegt im privaten Bucket `submissions/<user_id>/…`.
create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null references public.attempts(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind         public.submission_kind not null,
  storage_path text,
  strokes      jsonb,
  created_at   timestamptz not null default now()
);
create index on public.submissions (attempt_id);

-- Korrektur/Feedback zu einem Versuch (Teilpunkte, Markierungen rot/gelb/grün).
create table public.corrections (
  id         uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  source     public.correction_source not null,
  verdict    public.verdict not null,
  points     numeric(4,3) not null check (points between 0 and 1),
  marks      jsonb not null default '[]',    -- CorrectionMark[]
  feedback   text not null default '',
  created_at timestamptz not null default now()
);
create index on public.corrections (attempt_id);

-- Fortschritts-SNAPSHOT (Cache für Eltern/Lehrer-Ansichten). Wahrheit = attempts + domain/score.ts.
create table public.progress (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  topic_id    text not null references public.topics(id) on delete cascade,
  subtopic_id text references public.subtopics(id) on delete cascade, -- NULL = Themen-Ebene
  score       smallint not null check (score between 0 and 100),
  completion  numeric(4,3) not null default 0 check (completion between 0 and 1),
  status      public.chapter_status not null default 'not_started',
  updated_at  timestamptz not null default now()
);
create unique index progress_user_scope_uq on public.progress (user_id, topic_id, coalesce(subtopic_id, ''));

-- Testergebnisse (Phase 2)
create table public.test_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  test_id      text not null references public.tests(id) on delete restrict,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  points       numeric(6,2),
  max_points   numeric(6,2),
  created_at   timestamptz not null default now()
);
create index on public.test_results (user_id, test_id);
alter table public.attempts
  add constraint attempts_test_result_fk foreign key (test_result_id) references public.test_results(id) on delete set null;

-- Abonnements (Phase 3). Geschrieben NUR vom Stripe-Webhook (service_role). Keine Zahlungsdaten!
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade, -- zahlendes Konto (i. d. R. Eltern)
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null,      -- z. B. 'family-monthly'
  billing_interval       text not null check (billing_interval in ('month', 'year')),
  status                 public.subscription_status not null,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);
create index on public.subscriptions (user_id);

-- =====================================================================================
-- Trigger / Hilfsfunktionen
-- =====================================================================================

-- Profil beim Sign-up anlegen. Rolle ist IMMER 'student' – Eltern/Lehrer werden serverseitig hochgestuft.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Konsistenz: topic_id/subtopic_id eines Versuchs müssen zur Aufgabe passen (verhindert verfälschte Scores).
create or replace function public.check_attempt_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sub text; v_topic text;
begin
  select e.subtopic_id, s.topic_id into v_sub, v_topic
  from public.exercises e join public.subtopics s on s.id = e.subtopic_id
  where e.id = new.exercise_id;
  if v_sub is distinct from new.subtopic_id or v_topic is distinct from new.topic_id then
    raise exception 'attempt scope mismatch for exercise %', new.exercise_id;
  end if;
  return new;
end;
$$;

create trigger attempts_check_scope
  before insert on public.attempts
  for each row execute function public.check_attempt_scope();

-- Hilfsfunktion: gehört der Versuch dem aktuellen Nutzer?
create or replace function public.owns_attempt(p_attempt uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.attempts a where a.id = p_attempt and a.user_id = auth.uid());
$$;

-- =====================================================================================
-- Rechte (Grants) – zusätzlich zu RLS. `anon` hat auf nichts Zugriff.
-- =====================================================================================

revoke all on all tables in schema public from anon, authenticated;

-- Inhalte: nur lesen
grant select on public.curricula, public.topics, public.subtopics, public.learning_materials,
  public.exercises, public.solutions, public.hints, public.tests, public.test_exercises
  to authenticated;

-- Nutzerdaten
grant select on public.profiles to authenticated;
grant update (display_name, grade, curriculum_id) on public.profiles to authenticated; -- NICHT role
grant select, insert, delete on public.student_topics to authenticated;
grant update (user_id, topic_id) on public.student_topics to authenticated; -- für upsert (ON CONFLICT DO UPDATE)
grant select, insert on public.attempts, public.submissions, public.corrections, public.test_results to authenticated;
grant update (finished_at, points, max_points) on public.test_results to authenticated;
grant select, insert, update on public.progress to authenticated;
grant select on public.parent_child, public.teacher_student, public.subscriptions to authenticated;

grant execute on function public.owns_attempt(uuid) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- =====================================================================================
-- Row Level Security
-- =====================================================================================

alter table public.curricula          enable row level security;
alter table public.topics             enable row level security;
alter table public.subtopics          enable row level security;
alter table public.learning_materials enable row level security;
alter table public.exercises          enable row level security;
alter table public.solutions          enable row level security;
alter table public.hints              enable row level security;
alter table public.tests              enable row level security;
alter table public.test_exercises     enable row level security;
alter table public.profiles           enable row level security;
alter table public.parent_child       enable row level security;
alter table public.teacher_student    enable row level security;
alter table public.student_topics     enable row level security;
alter table public.attempts           enable row level security;
alter table public.submissions        enable row level security;
alter table public.corrections        enable row level security;
alter table public.progress           enable row level security;
alter table public.test_results       enable row level security;
alter table public.subscriptions      enable row level security;

-- A) Inhalte: lesen für angemeldete Nutzer, keine Schreib-Policies (=> nur service_role)
create policy content_read on public.curricula          for select to authenticated using (true);
create policy content_read on public.topics             for select to authenticated using (true);
create policy content_read on public.subtopics          for select to authenticated using (true);
create policy content_read on public.learning_materials for select to authenticated using (true);
create policy content_read on public.exercises          for select to authenticated using (true);
create policy content_read on public.solutions          for select to authenticated using (true);
create policy content_read on public.hints              for select to authenticated using (true);
create policy content_read on public.tests              for select to authenticated using (review_status = 'approved');
create policy content_read on public.test_exercises     for select to authenticated
  using (exists (select 1 from public.tests t where t.id = test_id and t.review_status = 'approved'));

-- B) Profile: nur das eigene
create policy profiles_own_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Aktive Themen
create policy st_own_select on public.student_topics for select to authenticated using (user_id = auth.uid());
create policy st_own_insert on public.student_topics for insert to authenticated with check (user_id = auth.uid());
create policy st_own_update on public.student_topics for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy st_own_delete on public.student_topics for delete to authenticated using (user_id = auth.uid());

-- Versuche (append-only)
create policy attempts_own_select on public.attempts for select to authenticated using (user_id = auth.uid());
create policy attempts_own_insert on public.attempts for insert to authenticated with check (user_id = auth.uid());

-- Einreichungen
create policy subm_own_select on public.submissions for select to authenticated using (user_id = auth.uid());
create policy subm_own_insert on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and public.owns_attempt(attempt_id));

-- Korrekturen: Client darf nur deterministische/Selbst-Korrekturen anlegen; 'ai'/'teacher' nur serverseitig.
create policy corr_own_select on public.corrections for select to authenticated using (public.owns_attempt(attempt_id));
create policy corr_own_insert on public.corrections for insert to authenticated
  with check (public.owns_attempt(attempt_id) and source in ('auto', 'self'));

-- Fortschritts-Snapshot
create policy progress_own_select on public.progress for select to authenticated using (user_id = auth.uid());
create policy progress_own_insert on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy progress_own_update on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Testergebnisse
create policy tr_own_select on public.test_results for select to authenticated using (user_id = auth.uid());
create policy tr_own_insert on public.test_results for insert to authenticated with check (user_id = auth.uid());
create policy tr_own_update on public.test_results for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Eltern/Lehrer/Abos: RESTRIKTIV – nur eigene Zeilen lesen, Schreiben ausschließlich via service_role.
-- Phase 3 ergänzt Lese-Policies auf Schülerdaten, z. B.:
--   using (user_id = auth.uid() or public.is_approved_parent_of(user_id) or public.is_approved_teacher_of(user_id))
create policy pc_own_select on public.parent_child    for select to authenticated using (parent_id = auth.uid() or child_id = auth.uid());
create policy ts_own_select on public.teacher_student for select to authenticated using (teacher_id = auth.uid() or student_id = auth.uid());
create policy sub_own_select on public.subscriptions  for select to authenticated using (user_id = auth.uid());

-- =====================================================================================
-- Storage: privater Bucket für Handschrift/Fotos. Pfad: <user_id>/<attempt_id>.png
-- =====================================================================================

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

create policy subm_files_own_read on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy subm_files_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
