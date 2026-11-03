-- Lernpfad (ARCHITECTURE.md, „Lernpfad“): Aufgaben für den Formel-Check (Schritt 3) markieren.
alter table public.exercises
  add column checkpoint text check (checkpoint is null or checkpoint in ('formula', 'concept'));
