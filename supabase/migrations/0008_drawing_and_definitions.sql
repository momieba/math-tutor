-- Zeichenaufgaben (Graph ins vorgegebene Koordinatensystem zeichnen): neues Antwortformat 'drawing'.
-- Bewertet wird allein von der KI-Korrektur in grade-attempt (src/domain/aiGrading.ts, drawingEvaluation).
alter table public.exercises drop constraint exercises_answer_format_kind;
alter table public.exercises
  add constraint exercises_answer_format_kind check (answer_format ->> 'kind' in ('choice', 'numeric', 'numeric-set', 'text', 'point', 'linear', 'drawing'));

-- Definitionsfragen im Lernpfad (aus den Regeln eines Kapitels erzeugt, src/content/definitions.ts).
alter table public.exercises drop constraint exercises_checkpoint_check;
alter table public.exercises
  add constraint exercises_checkpoint_check check (checkpoint is null or checkpoint in ('formula', 'concept', 'definition'));
