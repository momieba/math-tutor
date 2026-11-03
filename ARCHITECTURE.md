# Architektur – MatheMentor

## 1. Überblick
Tablet-first Single-Page-App (React/Vite/TS) für Mathe Klasse 7–9. Lerninhalte sind eine **geprüfte, versionierte Wissensbasis** in `src/content` und werden nie von einer KI erzeugt.

```mermaid
flowchart LR
  B[Browser / iPad<br/>Vite-SPA] -->|statische Dateien| V[Vercel<br/>nur Hosting]
  B -->|supabase-js + JWT, RLS| PG[(Supabase Postgres EU<br/>Inhalte + Nutzerdaten)]
  B -->|Anmeldung| AU[Supabase Auth<br/>E-Mail, Google]
  B -->|Abgabe, Konto löschen| EF[Edge Functions<br/>grade-attempt, delete-account]
  EF --> PG
  EF --> ST[(Storage<br/>Handschrift-Bilder)]
  B -->|signierte URLs| ST
```

- **Supabase-Modus (Produktion):** Inhalte und Nutzerdaten liegen in Postgres, geschützt per RLS. Der Browser kennt keine Lösungen. Bewertet wird in der Edge Function `grade-attempt`, Hinweise und Musterlösung gibt es nur über protokollierende RPCs (§5).
- **Lokaler Modus (Entwicklung, E2E, Demo):** ohne Supabase-Konfiguration; localStorage und Mock-Auth, gleiche Regeln im Browser. Production-Builds verlangen dafür ausdrücklich `VITE_DATA_MODE=local`, sonst zeigen sie einen Konfigurationsfehler, statt Kinderdaten still im Browser zu speichern.

## 2. Stack
| Bereich | Wahl |
|---|---|
| UI | React 19, Vite 8, TypeScript (strict), Tailwind 4, react-router 7 |
| Mathe | KaTeX (`MathText`, Inline-`$…$`) |
| Backend | Supabase: Auth (E-Mail + Google), Postgres, Storage, Edge Functions (Deno), Region Frankfurt |
| Hosting | Vercel (nur statische Dateien, Security-Header in `vercel.json`) |
| Tests | Vitest (Domain/Content/Services), PGlite (`npm run db:check`: Schema, RLS, RPCs), Deno (`npm run test:functions`), Playwright (E2E, iPad); alles in CI |

## 3. Ordnerstruktur
```
src/
  config/       brand.ts (Produktname), legal.ts (CONSENT_VERSION)
  types/        content.ts (Exercise = öffentlich, ExerciseKey = Lösungsschlüssel, Authored* = Wissensbasis), learner.ts
  content/      Wissensbasis (prozent, pythagoras, quadratisch), publicView.ts (entfernt Lösungen)
  domain/       reine Logik ohne I/O: evaluate.ts (Antwortprüfung), score.ts, topicMatcher.ts, progressView.ts, gradingContract.ts
  services/     types.ts (Interfaces), config.ts (Modus-Wahl), index.ts (Composition Root)
    shared/  local/  supabase/   Implementierungen je Modus
  context/ components/ pages/
supabase/
  migrations/   0001_init.sql (Schema, RLS), 0002_production.sql (Lösungsschutz, RPCs, Einwilligung)
  seed.sql      ERZEUGT aus src/content (`npm run seed:sql`)
  functions/    grade-attempt, delete-account (index.ts = Verdrahtung, handler.ts = Logik + Tests)
    _shared/    domain/ + types/ KOPIERT aus src (`npm run functions:sync`)
  config.toml   Auth-Einstellungen (`supabase config push`)
```
**Regeln:** Seiten nutzen nur `services.*` und `domain/*`, nie Supabase oder localStorage direkt. `domain/` importiert nichts aus `services/`. Die Bewertungslogik gibt es genau einmal (`src/domain/evaluate.ts`); die Edge Function nutzt eine Kopie, deren Gleichstand CI prüft.

## 4. Routen
| Route | Seite | Schutz |
|---|---|---|
| `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/legal/:page` | Landing, Anmeldung, Passwort, Rechtstexte | öffentlich |
| `/app` | Dashboard | angemeldet |
| `/app/topics/:topicId` · `…/chapters/:subtopicId` | Thema · Lernkapitel | angemeldet |
| `/app/exercises/:exerciseId` | Aufgabe | angemeldet |
| `/app/history` | Verlauf | angemeldet |
| `/app/account` | Konto: Passwort, Datenexport, Konto löschen | angemeldet |

`ProtectedRoute` regelt nur die Navigation, autorisiert wird per RLS. Ohne aktuelle Einwilligung (`profile.consentVersion ≠ CONSENT_VERSION`, z. B. erste Google-Anmeldung) zeigt sie zuerst die Einwilligungsseite.

## 5. Bewertung und Hilfen
Kernidee: **Der Score lässt sich nicht fälschen, und die Lösung ist vor der Abgabe nicht abrufbar, ohne dass es zählt.**

1. Der Client lädt Aufgaben **ohne** Antwort, Hinweise, Musterlösung und typische Fehler (`Exercise` mit `answerFormat`).
2. Hinweise (`reveal_hint`, nur der Reihe nach) und Musterlösung (`reveal_solution`) werden einzeln angefordert und pro Nutzer und Aufgabe in `exercise_sessions` vermerkt. `get_exercise_session` zeigt sie nach dem Neuladen wieder an.
3. Abgabe: `services.attempts.submit()` → Edge Function `grade-attempt` → `evaluate.ts` → bei `unclear` nur Rückfrage, nichts gespeichert → sonst `record_graded_attempt()`. Das übernimmt die vermerkten Hilfen in den Versuch, speichert Korrektur und Bild atomar und beendet die Bearbeitung.
4. Die Antwort enthält die Lösung zum Nachlesen. Im Verlauf liefert `get_exercise_review` sie nur bei eigenem Versuch.
5. Schlägt das Speichern fehl (Netz, Speicher voll), sichert `attemptSubmissionService` die Eingabe als Entwurf im Browser. Die Aufgabenseite bietet dann „erneut senden“ oder „verwerfen“ an.

Lokal setzt `localGradingService` dieselben Regeln im Browser um.

**Handschrift (Phase 1):** Bewertet wird nur das eingetippte Endergebnis. Der Rechenweg wird als PNG (≤ 1000 px) plus Strichdaten gespeichert, aber nicht gelesen und deshalb immer gelb als „nicht automatisch geprüft“ markiert.

## 6. Datenmodell
**Inhalte** (Text-Slug-IDs; Clients dürfen nur lesen, schreiben darf nur `service_role` über `seed.sql`):
`curricula → topics → subtopics → {learning_materials, exercises → {exercise_keys, solutions, hints}}`, dazu `tests → test_exercises` (Phase 2).
`exercise_keys`, `solutions` und `hints` sind für Clients **nicht lesbar**, Themen mit `review_status = 'draft'` sind unsichtbar.

**Nutzerdaten** (UUID, an `auth.users` mit `on delete cascade`, kein Zugriff für `anon`):
| Tabelle | Inhalt / Regel |
|---|---|
| `profiles` | per Trigger angelegt; Rolle immer `student` (Client darf sie nicht ändern); Einwilligung `consent_version`, `consented_at` |
| `student_topics` | aktive Themen-Kacheln (Client darf schreiben) |
| `attempts`, `corrections`, `submissions` | Client darf nur lesen; geschrieben nur über `record_graded_attempt()` (nur `service_role`) |
| `exercise_sessions` | laufende Bearbeitung (genutzte Hilfen); nur über RPCs beschreibbar |
| Bucket `submissions/<uid>/<attemptId>.png` | privat, nur PNG ≤ 1,5 MB; Upload nur durch die Edge Function, Lesen per signierter URL |
| `progress`, `test_results`, `parent_child`, `teacher_student`, `subscriptions` | angelegt für spätere Phasen; Client darf höchstens eigene Zeilen lesen |

## 7. Score-Formel (`domain/score.ts`, Konstanten in `SCORE_CONFIG`)
Pro Versuch: `credit = points × f`, mit `f = 0,25`, wenn die Musterlösung vor der Abgabe angesehen wurde, sonst `f = 1 − 0,15 × hintsUsed` (0–3 Hinweise ⇒ 1 / 0,85 / 0,70 / 0,55).
Pro Aufgabe e (Stabilität): `q_e = 0,7 × credit(letzter) + 0,3 × credit(vorletzter)`. Bei nur einem Versuch ist `q_e = credit`, ohne Versuch `q_e = 0`.
Pro Kapitel:
- `M = Σ w_e·q_e / Σ w_e` über **alle** Aufgaben des Kapitels, mit `w = {1: 1, 2: 1,5, 3: 2}` je Schwierigkeit
- `T = |Typen mit q_e ≥ 0,6| / |Typen im Kapitel|`
- `roh = 100 × (0,8·M + 0,2·T)`
- **Deckel** (es gilt das Minimum): `T < 1` ⇒ **max. 79** · keine Aufgabe höchster Schwierigkeit mit q ≥ 0,8 gelöst ⇒ **max. 89** · keine Bestätigung (gleiche Aufgabe zweimal mit credit ≥ 0,8 im Abstand von ≥ 20 h) ⇒ **max. 94**
- `score = round(min(roh, Deckel))`
- Status: kein Versuch ⇒ `not_started` · score ≥ 80 und T = 1 ⇒ `mastered` · ≥ 2 Aufgaben bearbeitet und Ø q < 0,5 ⇒ `needs_practice` · sonst `in_progress`

Thema: `score = round(Ø Kapitel-Scores)` (ungewichtet), `completion = bearbeitete / alle Aufgaben`. Status: alle `not_started` ⇒ `not_started`, alle `mastered` ⇒ `mastered`, eins `needs_practice` ⇒ `needs_practice`, sonst `in_progress`.
Die aktiven Deckel erklärt `CAP_EXPLANATION` dem Schüler.

## 8. Topic-Matching (`domain/topicMatcher.ts`, deterministisch)
1. Normalisieren (Kleinschreibung, ä→ae, ß→ss, `%`→„prozent“, Satzzeichen und Stoppwörter entfernen).
2. Pro Thema: **+3** je Keyword-Phrase, **+1** je Keyword-Token (Präfix-Toleranz ab 5 Zeichen), **+1** bei Treffer im Titel, **+0,5** je Token-Treffer im besten Kapiteltitel.
3. `match`, wenn bester Score ≥ 2 (oder ≥ 1 ohne Konkurrenz) **und** ≥ 1,5 × Zweitbester; sonst `ambiguous` (Top 3) oder `none`. Ein Thema wird **nie** neu erfunden.

## 9. Entscheidungen
- **Serverlogik in Supabase Edge Functions, nicht in Vercel Functions:** Sie laufen in der EU neben der Datenbank (Vercel Functions standardmäßig in den USA). Der `service_role`-Key bleibt bei Supabase. Vercel bleibt reines Hosting und ist austauschbar (z. B. Cloudflare Pages).
- **Inhalte im Git, Datenbank als Auslieferung:** Inhalte werden als typgeprüfte TS-Dateien mit Review und `content.test.ts` gepflegt und per idempotentem `seed.sql` (UPSERT) eingespielt. Vorhandene Versuche bleiben dabei erhalten. Eine Redaktions-UI kommt später.
- **Unklare Eingaben werden nie gespeichert** (`verdict = 'unclear'`): gelbe Rückfrage statt eines Versuchs, der den Score senkt.
- **Annahme Lehrplan:** „DE/Gymnasium Kl. 7–9“, orientiert an den KMK-Standards. Länderspezifische Varianten folgen über `curricula`.

## 10. Erweiterungspunkte
| Feature | Ansatz |
|---|---|
| **KI-Korrektur Handschrift** (Ph. 2) | Edge Function `grade-submission` lädt das Bild, ruft die KI auf und schreibt `corrections` (`source='ai'`, Markierungen je Schritt). Bei Unsicherheit `unclear`. |
| **Foto-Upload** (Ph. 2) | `Submission.kind='photo'`, gleicher Bucket und Pfad. |
| **Eltern/Lehrer** (Ph. 3) | Edge Function schreibt `parent_child` bzw. `teacher_student` (Einladungscode + Einwilligung). Zusätzliche Lese-Policies über `is_approved_parent_of(uid)` / `is_approved_teacher_of(uid)`. `progress` wird dann serverseitig befüllt. |
| **Abos** (Ph. 3) | Stripe Checkout/Portal über Edge Function, Webhook schreibt `subscriptions`. Zugriff über `has_active_subscription(uid)`. Keine Zahlungsdaten in der DB. |
| **Kapitelseiten aus Blöcken** | Tabelle `subtopic_blocks` (`block_type` + `content jsonb`, z. B. intro, rules, video, example, exercise_set, summary) und eine Block-Registry in der `ChapterPage`. Damit lassen sich neue Themen ohne Code-Änderung anlegen. |
| **Wiederholung** (Ph. 4) | `RecommendationService` aus Domain-Logik; Bausteine: `attempts.submitted_at`, Deckel `no-confirmation`. |

Offene Aufgaben und Entscheidungen: [docs/TODO.md](./docs/TODO.md).
