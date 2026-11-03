-- Hilfen gelten nur für den aktuellen Bearbeitungsdurchgang einer Aufgabe:
-- - Überspringen bzw. Verlassen über die App verwirft sie (discard_exercise_session).
-- - Nach 30 Minuten ohne Aktivität verfallen sie (z. B. Tablet zugeklappt).
-- Neuladen innerhalb der Frist behält sie weiterhin (sonst ließe sich der Punktabzug umgehen).

create or replace function public.drop_stale_session(p_uid uuid, p_exercise text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.exercise_sessions
  where user_id = p_uid and exercise_id = p_exercise and updated_at < now() - interval '30 minutes';
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
  perform public.drop_stale_session(p_uid, p_exercise);
  insert into public.exercise_sessions (user_id, exercise_id) values (p_uid, p_exercise) on conflict do nothing;
  select * into v from public.exercise_sessions where user_id = p_uid and exercise_id = p_exercise for update;
  return v;
end;
$$;

-- Nicht mehr STABLE: räumt eine abgelaufene Bearbeitung vorher ab.
create or replace function public.get_exercise_session(p_exercise text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.require_uid();
  v public.exercise_sessions;
begin
  perform public.drop_stale_session(v_uid, p_exercise);
  select * into v from public.exercise_sessions where user_id = v_uid and exercise_id = p_exercise;
  return jsonb_build_object(
    'hints', public.hints_up_to(p_exercise, coalesce(v.hints_used, 0)),
    'solution', case when coalesce(v.solution_viewed, false) then public.solution_json(p_exercise) end
  );
end;
$$;

-- Aufgabe ohne Abgabe verlassen: genutzte Hilfen verwerfen, beim nächsten Mal beginnt sie von vorn.
create or replace function public.discard_exercise_session(p_exercise text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.exercise_sessions where user_id = public.require_uid() and exercise_id = p_exercise;
$$;

revoke execute on function public.drop_stale_session(uuid, text), public.discard_exercise_session(text) from public, anon, authenticated;
grant execute on function public.discard_exercise_session(text) to authenticated;
