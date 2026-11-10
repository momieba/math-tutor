-- 1) Testmodus: Versuche im Kapitel-Test werden mit mode = 'test' gespeichert (zählen im Score stärker, domain/score.ts).
-- 2) KI-Korrektur: Stammen die Markierungen des Rechenwegs von der KI, steht in corrections.source 'ai' statt 'auto'.
-- 3) Lernpfad: „Einstieg/Erklärung gesehen“ je Kapitel serverseitig, damit es auf allen Geräten gilt.

-- ---------------------------------------------------------------- record_graded_attempt mit Modus und Quelle
drop function public.record_graded_attempt(uuid, text, uuid, text, public.verdict, numeric, jsonb, text, timestamptz, public.submission_kind, text, jsonb);

create function public.record_graded_attempt(
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
  p_strokes         jsonb default null,
  p_mode            public.attempt_mode default 'practice',
  p_source          public.correction_source default 'auto'
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
  if p_source not in ('auto', 'ai') then raise exception 'Ungültige Quelle der Korrektur.'; end if;
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
    p_attempt_id, p_user, p_exercise, v_sub, v_topic, coalesce(p_mode, 'practice'), left(p_answer_raw, 500), p_points, p_verdict = 'correct',
    coalesce(v.hints_used, 0), coalesce(v.solution_viewed, false), least(coalesce(v.started_at, p_started_at, now()), now())
  );
  insert into public.corrections (attempt_id, source, verdict, points, marks, feedback)
  values (p_attempt_id, coalesce(p_source, 'auto'), p_verdict, p_points, coalesce(p_marks, '[]'::jsonb), coalesce(p_feedback, ''));
  if p_submission_kind is not null then
    insert into public.submissions (attempt_id, user_id, kind, storage_path, strokes)
    values (p_attempt_id, p_user, p_submission_kind, p_storage_path, p_strokes);
  end if;
  delete from public.exercise_sessions where user_id = p_user and exercise_id = p_exercise;
  return p_attempt_id;
end;
$$;

revoke execute on function
  public.record_graded_attempt(uuid, text, uuid, text, public.verdict, numeric, jsonb, text, timestamptz, public.submission_kind, text, jsonb, public.attempt_mode, public.correction_source)
  from public, anon, authenticated;
grant execute on function
  public.record_graded_attempt(uuid, text, uuid, text, public.verdict, numeric, jsonb, text, timestamptz, public.submission_kind, text, jsonb, public.attempt_mode, public.correction_source)
  to service_role;

-- ---------------------------------------------------------------- Lernpfad: gesehene Schritte je Kapitel
create table public.learning_path_seen (
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subtopic_id  text not null references public.subtopics(id) on delete cascade,
  intro_seen   boolean not null default false,
  explain_seen boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (user_id, subtopic_id)
);

alter table public.learning_path_seen enable row level security;
revoke all on public.learning_path_seen from anon, authenticated;
grant select, insert on public.learning_path_seen to authenticated;
grant update (user_id, subtopic_id, intro_seen, explain_seen, updated_at) on public.learning_path_seen to authenticated; -- für upsert (ON CONFLICT DO UPDATE)

create policy lps_own_select on public.learning_path_seen for select to authenticated using (user_id = auth.uid());
create policy lps_own_insert on public.learning_path_seen for insert to authenticated with check (user_id = auth.uid());
create policy lps_own_update on public.learning_path_seen for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
