# Plan: Labels für Themen und Unterthemen (Bundesland × Schulform × Klasse)

- **Status:** Entwurf zur Freigabe
- **Datum:** 2026-11-13
- **Bezug:** [Themenliste](./2026-11-13-themenliste-klasse-5-13.md), ADR-0002

## Ziel
Themen werden unabhängig von einer Klasse definiert, so wie bisher als fachliche Einheit (Ordner in `src/content`). Wo ein Thema im Unterricht vorkommt, sagen **Labels**. Ein Label ist die Kombination **Bundesland × Schulform × Klasse**. Ein Thema kann mehrere Labels haben, zum Beispiel Klasse 8 in NRW und Klasse 7 in Bayern. Jedes Unterthema hat eigene Labels, weil Kapitel eines Themas oft in verschiedenen Klassen liegen. Beispiel: „Prismen“ in *Kreis und Zylinder* ist NRW Klasse 8, die übrigen Kapitel sind Klasse 9.

## Nicht-Ziele
- Die App filtert Themen noch nicht nach Klasse. Das ist ein eigener Schritt, siehe „Folgeschritte“.
- Keine Labels für Bundesländer außer NRW in diesem Schritt. Das Modell kann sie aber aufnehmen.
- Keine Unterscheidung Grundkurs/Leistungskurs (siehe „Offene Fragen“).

## Datenmodell

```ts
/** Wo ein Thema bzw. Unterthema im Unterricht vorkommt. */
export interface CurriculumLabel {
  state: string;       // Bundesland-Kürzel wie im LearnerContext, z. B. 'NW'
  schoolType: string;  // einheitlich klein: 'gymnasium', 'realschule', 'gesamtschule', …
  grade: number;       // 5–13
}

interface Topic {
  // grade: number  → entfällt
  labels: CurriculumLabel[];   // mindestens ein Label
  …
}

interface Subtopic {
  labels: CurriculumLabel[];   // mindestens ein Label
  …
}
```

**Regeln (geprüft in `content.test.ts`):**
1. Jedes Thema und jedes Unterthema hat mindestens ein Label. Es gibt keine doppelten Labels.
2. Beim Schreiben (`AuthoredSubtopic`) sind die Labels **optional**. Fehlen sie, übernimmt das Unterthema die Labels des Themas. Nach der Aufbereitung (`src/content/index.ts`) hat jedes Unterthema seine Labels ausdrücklich. App, Seed und Datenbank sehen also immer vollständige Labels.
3. Die Labels des Themas sind genau die **Vereinigung** der Labels seiner Unterthemen. So kann ein Thema nicht in einer Klasse auftauchen, für die es kein einziges Kapitel gibt. *Umgesetzt:* Die beim Schreiben angegebenen Labels des Themas sind die Vorgabe für Unterthemen ohne eigene Labels. `withLabels` ersetzt sie danach durch die berechnete Vereinigung, und der Test prüft das Ergebnis.
4. `schoolType` wird einheitlich klein geschrieben, wie im `LearnerContext`. Den Lehrplan-Eintrag (`'Gymnasium'`) gleiche ich mit an.

**Bestehende Felder:**
- `Topic.grade` entfällt. Die Anzeige „Klasse 8 · Funktionen“ auf Dashboard und Themenseite rechnet die Klasse aus den Labels zum `LearnerContext` aus, zum Beispiel „Klasse 9“ oder „Klasse 8–9“. Gibt es kein passendes Label, steht dort nur das Themengebiet.
- `Topic.curriculumId` und `curricula` bleiben als Angabe zur Lehrplanversion. Die Klassenzuordnung steckt nur noch in den Labels.
- `ExerciseLevel` (Schweregrad je Land/Schulform an der Aufgabe) bleibt unverändert.

## Datenbank (neue Migration `0009_content_labels.sql`)
- `topics.labels jsonb not null default '[]'` und `subtopics.labels jsonb not null default '[]'`, jeweils mit `check (jsonb_typeof(labels) = 'array')`. GIN-Index für spätere Filter (`labels @> '[{"state":"NW","schoolType":"gymnasium","grade":8}]'`).
- `topics.grade` bleibt vorerst in der Datenbank, wird aber nicht mehr gelesen. Die Spalte wird nullable (`alter column grade drop not null`). Entfernt wird sie in einer späteren Migration, wenn alles in Produktion läuft. Bestehende Migrationen bleiben unverändert.
- Labels sind öffentliche Metadaten. Es gelten dieselben RLS-Policies wie für `topics`/`subtopics` (Lesen für alle). Neuer Test in `db:check`: Labels werden aus dem Seed übernommen und sind lesbar.
- Seed-Generator (`npm run seed:sql`) schreibt die Labels.

## Bestehende Themen – Labels (alle NRW, Gymnasium)

| Thema | Thema-Labels | Abweichende Unterthemen |
|---|---|---|
| Prozentrechnung | 7 | – |
| Lineare Funktionen | 8 | – (*Proportionale Funktionen* ggf. 7: bitte entscheiden) |
| Lineare Gleichungssysteme | 8 | – |
| Satz des Pythagoras | 9 | – |
| Quadratische Gleichungen | 9 | – |
| Quadratische Funktionen | 9 | – |
| Kreis und Zylinder | 8, 9 | *Prismen*: 8 · alle anderen: 9 |

## Akzeptanzkriterien
- [ ] `CurriculumLabel` ist in `src/types/content.ts` definiert. `Topic.labels` und `Subtopic.labels` sind Pflicht, `Topic.grade` gibt es nicht mehr.
- [ ] Unterthemen ohne eigene Labels übernehmen die Labels des Themas. Der Test prüft die Regeln 1–4.
- [ ] Die sieben bestehenden Themen haben Labels laut Tabelle. Bei *Kreis und Zylinder* haben die Unterthemen unterschiedliche Labels.
- [ ] Dashboard und Themenseite zeigen die Klasse aus den Labels für den `LearnerContext` an. Die Darstellung bleibt wie bisher („Klasse 9 · Geometrie“).
- [ ] Migration `0009` legt die Spalten an, `db:check` testet sie, der Seed enthält die Labels, und der Supabase-Modus liest sie (`supabaseContentRepository`).
- [ ] Lokaler und Supabase-Modus verhalten sich gleich. Alle CI-Prüfungen sind grün.
- [ ] ARCHITECTURE.md (Datenmodell) ist ergänzt, dazu ADR-0003 „Labels statt Klasse am Thema“ und ein Eintrag in `CHANGELOG.md`.

## Schritte
1. Typen und Aufbereitung: `CurriculumLabel`, Labels an Themen/Unterthemen, Übernahme der Labels in `src/content/index.ts`, `schoolType` vereinheitlichen.
2. Labels für die sieben Themen eintragen, `grade` entfernen. Tests in `content.test.ts` ergänzen.
3. Hilfsfunktion in `src/domain/` (reine Logik): `gradesFor(labels, ctx)` → Klassen als Text („8–9“). Mit Unit-Test.
4. Dashboard und Themenseite auf die Hilfsfunktion umstellen.
5. Migration `0009`, Seed-Generator, `supabaseContentRepository`, Test in `db:check`. Dann `npm run seed:sql` und `npm run db:check`.
6. Doku: ADR-0003, ARCHITECTURE.md, CHANGELOG.

## Teststrategie
Unit-Tests für die Label-Regeln und `gradesFor`. `db:check` für Spalten, Seed und RLS. Die bestehenden E2E-Tests prüfen die Anzeige „Klasse …“ (anpassen, falls Texte sich ändern).

## Risiken
- **Labels in Produktion leer:** Die Datenbank-Spalten haben den Default `'[]'`. Der Seed füllt sie im selben Deploy. Das Frontend kommt mit leeren Labels zurecht und zeigt dann nur das Themengebiet.
- **Klasse aus dem Profil:** `profiles.grade` gibt es schon. Das Filtern nach Klasse ist bewusst nicht Teil dieses Plans.

## Offene Fragen
- **GK/LK in der Oberstufe:** als eigene `schoolType`-Werte (`gymnasium-gk`/`-lk`), als zusätzliches optionales Feld `course?: 'GK' | 'LK'` im Label, oder vorerst gar nicht? Mein Vorschlag ist das optionale Feld `course`, sobald Oberstufen-Inhalte kommen.

## Folgeschritte (nicht Teil dieses Plans)
- Themenübersicht nach Klasse und Schulform aus dem Profil filtern oder sortieren.
- Labels für weitere Bundesländer und Schulformen.
