# ADR-0003: Labels statt fester Klasse am Thema

- **Status:** akzeptiert
- **Datum:** 2026-11-13
- **Entscheider:** Moritz

## Kontext
Bisher hatte jedes Thema genau eine Klasse (`Topic.grade`), und die Lehrplan-Zuordnung hing nur am Thema (`curriculumId`). Für den Ausbau auf Klasse 5–13 reicht das nicht:
- Kapitel eines Themas liegen oft in verschiedenen Klassen. *Prismen* (in *Kreis und Zylinder*) ist in NRW Klasse 8, die übrigen Kapitel Klasse 9. *Wahrscheinlichkeit* zieht sich von Klasse 7 bis 11.
- Andere Bundesländer und Schulformen ordnen dieselben Themen anderen Klassen zu.

## Entscheidung
Themen sind fachliche Einheiten ohne feste Klasse. Wo ein Thema oder Unterthema vorkommt, sagen **Labels** `{ state, schoolType, grade }` (Bundesland × Schulform × Klasse):
- Jedes Unterthema hat mindestens ein Label. Beim Schreiben sind sie optional, dann gelten die Labels des Themas (`src/content/labels.ts`, `withLabels`).
- Die Labels eines Themas sind die Vereinigung der Labels seiner Unterthemen. Sie werden berechnet, nicht von Hand gepflegt.
- `schoolType` wird klein geschrieben, wie in `profiles.school_type` und im `LearnerContext`.
- Die Anzeige „Klasse 8–9 · Geometrie“ kommt aus `domain/labels.ts` (`topicCaption`) für den `LearnerContext`.
- In der Datenbank liegen die Labels als `jsonb` an `topics` und `subtopics` (Migration `0009`, GIN-Index für spätere Filter). `topics.grade` wird nicht mehr genutzt und später entfernt.

## Alternativen
| Option | Vorteile | Nachteile |
|---|---|---|
| `grade` am Thema behalten, zusätzlich am Unterthema | kleine Änderung | nur ein Land und eine Schulform, keine Mehrfachzuordnung |
| Eigene Tabelle `content_labels` (n:m) | streng normalisiert, Fremdschlüssel | mehr Joins, eigene RLS-Policies, Seed komplizierter; Labels sind kleine, öffentliche Metadaten |
| Labels als `jsonb` an Thema und Unterthema | einfach, Seed und Repository fast unverändert, filterbar per `@>` | keine Fremdschlüssel (Gültigkeit prüft `content.test.ts`) |

## Konsequenzen
- Neue Themen werden mit Labels angelegt (`nrwGym(…)` in `src/content/helpers.ts`).
- Filtern der Themen nach Klasse und Schulform aus dem Profil ist als Folgeschritt möglich, ohne das Datenmodell erneut zu ändern.
- Eine spätere Migration entfernt `topics.grade`.
