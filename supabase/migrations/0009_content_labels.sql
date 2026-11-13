-- Labels an Themen und Unterthemen: wo ein Thema/Kapitel im Unterricht vorkommt (Bundesland × Schulform × Klasse).
-- Themen haben keine feste Klasse mehr (ADR-0003). Format: [{"state":"NW","schoolType":"gymnasium","grade":8}, …]
-- Öffentliche Metadaten: Lesen über die bestehenden Policies content_read; Schreiben nur über den Seed.

alter table public.topics
  add column labels jsonb not null default '[]' check (jsonb_typeof(labels) = 'array');
alter table public.subtopics
  add column labels jsonb not null default '[]' check (jsonb_typeof(labels) = 'array');

create index topics_labels_idx on public.topics using gin (labels jsonb_path_ops);
create index subtopics_labels_idx on public.subtopics using gin (labels jsonb_path_ops);

-- topics.grade wird nicht mehr gelesen oder vom Seed geschrieben. Die Spalte bleibt vorerst (nullable) und wird
-- in einer späteren Migration entfernt, wenn alles in Produktion läuft.
alter table public.topics alter column grade drop not null;

-- Schulform einheitlich klein (wie profiles.school_type und die Labels).
update public.curricula set school_type = lower(school_type) where school_type <> lower(school_type);
