-- Aufgabenpools (ARCHITECTURE.md, „Aufgabenpools und adaptives Üben“):
-- Anforderungsart je Aufgabe, abweichende Schweregrade je Bundesland/Schulart, Land und Schulart im Profil.

create type public.requirement as enum ('knowledge', 'calculation', 'application', 'reasoning', 'construction');

-- Bestehende Zeilen bekommen vorübergehend 'calculation'; der Seed setzt danach für jede Aufgabe den echten Wert.
alter table public.exercises
  add column requirement public.requirement not null default 'calculation',
  add column levels jsonb check (levels is null or jsonb_typeof(levels) = 'array'); -- ExerciseLevel[]
alter table public.exercises alter column requirement drop default;

-- Neue Antwortformate: Zahlenpaar (x|y) und lineare Funktionsgleichung (src/types/content.ts, ExpectedAnswer).
alter table public.exercises drop constraint exercises_answer_format_kind;
alter table public.exercises
  add constraint exercises_answer_format_kind check (answer_format ->> 'kind' in ('choice', 'numeric', 'numeric-set', 'text', 'point', 'linear'));

-- Für die Auswahl des Schweregrads. Bis es mehr als NRW-Gymnasium gibt, gibt es in der App noch keine Auswahl.
alter table public.profiles
  add column state text not null default 'NW' check (length(state) between 2 and 8),
  add column school_type text not null default 'gymnasium' check (length(school_type) between 2 and 32);
grant update (state, school_type) on public.profiles to authenticated;
