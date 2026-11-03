-- =====================================================================================
-- 0002_production.sql – Produktionsreife: Bewertung serverseitig, Lösungen geschützt, Einwilligung
--
-- 1) Lösungsschlüssel (Antwort, typische Fehler, Hinweise, Musterlösung) sind für Clients NICHT mehr lesbar.
--    Hinweise/Lösung gibt es nur über RPCs, die jede Nutzung in `exercise_sessions` protokollieren.
-- 2) Versuche, Korrekturen, Einreichungen und Bilder schreibt nur noch der Server
--    (Edge Function `grade-attempt` mit service_role → record_graded_attempt). Der Score ist damit nicht fälschbar.
-- 3) Einwilligung (Datenschutz/Nutzungsbedingungen) mit Version am Profil.
--
-- Supabase vergibt für neue Tabellen/Funktionen im Schema public standardmäßig Rechte an anon/authenticated.
-- Deshalb wird hier alles ausdrücklich entzogen und nur das Nötige wieder gewährt.
-- =====================================================================================

-- ---------------------------------------------------------------- 1) Lösungsschlüssel herauslösen
create table public.exercise_keys (
  exercise_id     text primary key references public.exercises(id) on delete cascade,
  answer          jsonb not null,             -- ExpectedAnswer
  common_mistakes jsonb not null default '[]' -- CommonMistake[]
);

insert into public.exercise_keys (exercise_id, answer, common_mistakes)
select id, answer, common_mistakes from public.exercises
on conflict (exercise_id) do nothing;

-- Nur das Eingabeformat bleibt öffentlich (Antwortfeld: Zahl mit Einheit, Lösungsmenge, Auswahl, Text).
alter table public.exercises add column answer_format jsonb;
update public.exercises
set answer_format = case
  when answer ->> 'kind' = 'numeric' and answer ? 'unit' then jsonb_build_object('kind', answer ->> 'kind', 'unit', answer ->> 'unit')
  else jsonb_build_object('kind', answer ->> 'kind')
end;
alter table public.exercises
  alter column answer_format set not null,
  add constraint exercises_answer_format_kind check (answer_format ->> 'kind' in ('choice', 'numeric', 'numeric-set', 'text'));
alter table public.exercises drop column answer, drop column common_mistakes;

alter table public.exercise_keys enable row level security; -- keine Policies: nur service_role / security definer
revoke all on public.exercise_keys from anon, authenticated;

drop policy content_read on public.solutions;
drop policy content_read on public.hints;
revoke all on public.solutions, public.hints from anon, authenticated;

-- Themen im Entwurf sind für Schüler unsichtbar (Freigabe: review_status 'internal-review' oder 'approved').
drop policy content_read on public.topics;
create policy content_read on public.topics for select to authenticated using (review_status <> 'draft');

-- ---------------------------------------------------------------- 2) Schreiben nur serverseitig
drop policy attempts_own_insert on public.attempts;
drop policy subm_own_insert on public.submissions;
drop policy corr_own_insert on public.corrections;
revoke insert on public.attempts, public.submissions, public.corrections from authenticated;

-- Fortschritts-Snapshot: wird künftig serverseitig geschrieben (Eltern/Lehrer, Phase 3), nicht vom Client.
drop policy progress_own_insert on public.progress;
drop policy progress_own_update on public.progress;
revoke insert, update on public.progress from authenticated;

-- Bilder lädt nur die Edge Function hoch (service_role). Lesen eigener Bilder per signierter URL bleibt.
drop policy subm_files_own_insert on storage.objects;
update storage.buckets set file_size_limit = 1500000, allowed_mime_types = array['image/png'] where id = 'submissions';

-- Laufende Bearbeitung einer Aufgabe: welche Hilfen wurden seit dem letzten bewerteten Versuch genutzt?
create table public.exercise_sessions (
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     text not null references public.exercises(id) on delete cascade,
  hints_used      smallint not null default 0 check (hints_used between 0 and 3),
  solution_viewed boolean not null default false,
  started_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
alter table public.exercise_sessions enable row level security;
revoke all on public.exercise_sessions from anon, authenticated;
grant select on public.exercise_sessions to authenticated;
create policy es_own_select on public.exercise_sessions for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------- 3) Einwilligung
alter table public.profiles add column consent_version text check (length(consent_version) <= 32), add column consented_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consent text := left(new.raw_user_meta_data ->> 'consent_version', 32);
begin
  insert into public.profiles (id, display_name, consent_version, consented_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    v_consent,
    case when v_consent is not null then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- =====================================================================================
-- Funktionen für den Client (authenticated)
-- =====================================================================================

create or replace function public.require_uid()
returns uuid
language plpgsql
stable
set search_path = public
as $$
declare
  v uuid := auth.uid();
begin
  if v is null then raise exception 'Nicht angemeldet.' using errcode = '28000'; end if;
  return v;
end;
$$;

create or replace function public.solution_json(p_exercise text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_strip_nulls(jsonb_build_object('steps', steps, 'finalAnswer', final_answer, 'alternative', alternative))
  from public.solutions where exercise_id = p_exercise;
$$;

create or replace function public.hints_up_to(p_exercise text, p_level int)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(text order by level), '[]'::jsonb) from public.hints where exercise_id = p_exercise and level <= p_level;
$$;

create or replace function public.ensure_exercise_session(p_uid uuid, p_exercise text)
returns public.exercise_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.exercise_sessions;
begin
  if not exists (select 1 from public.exercises where id = p_exercise) then raise exception 'Diese Aufgabe gibt es nicht.'; end if;
  insert into public.exercise_sessions (user_id, exercise_id) values (p_uid, p_exercise) on conflict do nothing;
  select * into v from public.exercise_sessions where user_id = p_uid and exercise_id = p_exercise for update;
  return v;
end;
$$;

-- Hinweis aufdecken: nur der Reihe nach; liefert alle Hinweise bis einschließlich p_level.
create or replace function public.reveal_hint(p_exercise text, p_level int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.require_uid();
  v public.exercise_sessions;
begin
  if p_level not between 1 and 3 then raise exception 'Ungültige Hinweisstufe.'; end if;
  v := public.ensure_exercise_session(v_uid, p_exercise);
  if p_level > v.hints_used + 1 then raise exception 'Hinweise werden der Reihe nach freigeschaltet.'; end if;
  update public.exercise_sessions set hints_used = greatest(hints_used, p_level), updated_at = now()
  where user_id = v_uid and exercise_id = p_exercise
  returning * into v;
  return public.hints_up_to(p_exercise, v.hints_used);
end;
$$;

-- Musterlösung VOR der Abgabe: wird als „Lösung angesehen“ für den nächsten Versuch vermerkt.
create or replace function public.reveal_solution(p_exercise text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.require_uid();
begin
  perform public.ensure_exercise_session(v_uid, p_exercise);
  update public.exercise_sessions set solution_viewed = true, updated_at = now() where user_id = v_uid and exercise_id = p_exercise;
  return public.solution_json(p_exercise);
end;
$$;

-- Bereits aufgedeckte Hilfen (nach Neuladen oder auf einem anderen Gerät wieder anzeigen).
create or replace function public.get_exercise_session(p_exercise text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.require_uid();
  v public.exercise_sessions;
begin
  select * into v from public.exercise_sessions where user_id = v_uid and exercise_id = p_exercise;
  return jsonb_build_object(
    'hints', public.hints_up_to(p_exercise, coalesce(v.hints_used, 0)),
    'solution', case when coalesce(v.solution_viewed, false) then public.solution_json(p_exercise) end
  );
end;
$$;

-- Nachlesen (Verlauf): Hinweise, Lösung und typische Fehler – nur für Aufgaben mit eigenem Versuch.
create or replace function public.get_exercise_review(p_exercise text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.require_uid();
begin
  if not exists (select 1 from public.attempts where user_id = v_uid and exercise_id = p_exercise) then return null; end if;
  return (
    select jsonb_build_object('hints', public.hints_up_to(p_exercise, 3), 'solution', public.solution_json(p_exercise), 'commonMistakes', k.common_mistakes)
    from public.exercise_keys k where k.exercise_id = p_exercise
  );
end;
$$;

create or replace function public.accept_terms(p_version text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_version is null or length(p_version) not between 1 and 32 then raise exception 'Ungültige Version.'; end if;
  update public.profiles set consent_version = p_version, consented_at = now() where id = public.require_uid();
end;
$$;

-- =====================================================================================
-- Funktionen nur für die Edge Function (service_role)
-- =====================================================================================

-- Alles, was die Bewertung braucht: Aufgabe, Lösungsschlüssel und die Lösung zum Nachlesen.
create or replace function public.grading_context(p_exercise text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'exercise', jsonb_build_object('id', e.id, 'type', e.type),
    'key', jsonb_build_object('answer', k.answer, 'commonMistakes', k.common_mistakes),
    'review', jsonb_build_object('hints', public.hints_up_to(e.id, 3), 'solution', public.solution_json(e.id), 'commonMistakes', k.common_mistakes)
  )
  from public.exercises e join public.exercise_keys k on k.exercise_id = e.id
  where e.id = p_exercise;
$$;

-- Bewerteten Versuch atomar speichern: Hilfen aus der laufenden Bearbeitung übernehmen, danach Bearbeitung beenden.
create or replace function public.record_graded_attempt(
  p_user            uuid,
  p_exercise        text,
  p_attempt_id      uuid,
  p_answer_raw      text,
  p_verdict         public.verdict,
  p_points          numeric,
  p_marks           jsonb,
  p_feedback        text,
  p_started_at      timestamptz default null,
  p_submission_kind public.submission_kind default null,
  p_storage_path    text default null,
  p_strokes         jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub text;
  v_topic text;
  v public.exercise_sessions;
begin
  if p_verdict = 'unclear' then raise exception 'Unklare Eingaben werden nicht gespeichert.'; end if;
  if p_storage_path is not null and p_storage_path <> p_user::text || '/' || p_attempt_id::text || '.png' then
    raise exception 'Ungültiger Speicherpfad.';
  end if;
  select e.subtopic_id, s.topic_id into v_sub, v_topic
  from public.exercises e join public.subtopics s on s.id = e.subtopic_id
  where e.id = p_exercise;
  if v_sub is null then raise exception 'Diese Aufgabe gibt es nicht.'; end if;

  select * into v from public.exercise_sessions where user_id = p_user and exercise_id = p_exercise for update;

  insert into public.attempts (id, user_id, exercise_id, subtopic_id, topic_id, mode, answer_raw, points, is_correct, hints_used, solution_viewed, started_at)
  values (
    p_attempt_id, p_user, p_exercise, v_sub, v_topic, 'practice', left(p_answer_raw, 500), p_points, p_verdict = 'correct',
    coalesce(v.hints_used, 0), coalesce(v.solution_viewed, false), least(coalesce(v.started_at, p_started_at, now()), now())
  );
  insert into public.corrections (attempt_id, source, verdict, points, marks, feedback)
  values (p_attempt_id, 'auto', p_verdict, p_points, coalesce(p_marks, '[]'::jsonb), coalesce(p_feedback, ''));
  if p_submission_kind is not null then
    insert into public.submissions (attempt_id, user_id, kind, storage_path, strokes)
    values (p_attempt_id, p_user, p_submission_kind, p_storage_path, p_strokes);
  end if;
  delete from public.exercise_sessions where user_id = p_user and exercise_id = p_exercise;
  return p_attempt_id;
end;
$$;

-- ---------------------------------------------------------------- Ausführungsrechte
revoke execute on function
  public.require_uid(), public.solution_json(text), public.hints_up_to(text, int), public.ensure_exercise_session(uuid, text),
  public.reveal_hint(text, int), public.reveal_solution(text), public.get_exercise_session(text), public.get_exercise_review(text),
  public.accept_terms(text), public.grading_context(text),
  public.record_graded_attempt(uuid, text, uuid, text, public.verdict, numeric, jsonb, text, timestamptz, public.submission_kind, text, jsonb)
  from public, anon, authenticated;

grant execute on function
  public.reveal_hint(text, int), public.reveal_solution(text), public.get_exercise_session(text), public.get_exercise_review(text),
  public.accept_terms(text)
  to authenticated;

grant execute on function
  public.grading_context(text),
  public.record_graded_attempt(uuid, text, uuid, text, public.verdict, numeric, jsonb, text, timestamptz, public.submission_kind, text, jsonb)
  to service_role;
