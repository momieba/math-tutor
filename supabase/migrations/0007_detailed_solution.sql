-- Ausführliche Lösung mit allen Denkschritten (DetailedStep[], src/types/content.ts), zusätzlich zur knappen Musterlösung.
-- Wie die Musterlösung erst nach der Abgabe bzw. nach „Lösung anzeigen“ sichtbar (solution_json).

alter table public.solutions add column detailed jsonb check (detailed is null or jsonb_typeof(detailed) = 'array');

create or replace function public.solution_json(p_exercise text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_strip_nulls(jsonb_build_object('steps', steps, 'finalAnswer', final_answer, 'alternative', alternative, 'detailed', detailed))
  from public.solutions where exercise_id = p_exercise;
$$;

revoke execute on function public.solution_json(text) from public, anon, authenticated;
