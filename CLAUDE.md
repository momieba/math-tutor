# math-mvp – MatheMentor

Tablet-first Mathe-Nachhilfe für Klasse 7–9 (Gymnasium NRW). React 19 · Vite 8 · TypeScript strict · Tailwind 4 · react-router 7 · Supabase (Auth, Postgres EU, Storage, Edge Functions/Deno) · Vercel (nur statisches Hosting).
Ausführlich: [README.md](README.md) (Befehle, Go-Live), [ARCHITECTURE.md](ARCHITECTURE.md) (Aufbau, Regeln, Datenmodell), [docs/TODO.md](docs/TODO.md) (offene Aufgaben).

## Prozess (devflow)
- Feature: `/devflow:feature <Beschreibung | #Issue | Punkt aus docs/TODO.md>`
- Bugfix: `/devflow:fix …` · Review: `/devflow:review [PR]` · Release: `/devflow:release`
- Doku: `/devflow:docs-sync` · Social Media: `/devflow:social-post draft …` · Video: `/devflow:demo-video …`
- Konfiguration und projektspezifische Sperren: `.devflow/config.json`. Hooks: `.devflow/hooks/`.

**Aufgabenquelle ist `docs/TODO.md`.** Der Planer liest sie und ordnet Anforderungen dort ein. Erledigte Punkte werden gelöscht (nicht abgehakt), neue Punkte in der passenden Gruppe mit 🔴/🟡/⚪ ergänzt.

## Befehle
| Zweck | Befehl |
|---|---|
| Typen | `npm run typecheck` |
| Unit-Tests | `npm test` |
| Build | `npm run build` |
| Inhalts-Seed neu erzeugen (nach jeder Änderung in `src/content`) | `npm run seed:sql` |
| Schema + Seed + RLS/RPCs gegen PGlite prüfen (nach jeder Migration) | `npm run db:check` |
| Bewertungslogik in Edge Functions kopieren (nach Änderung an `src/domain/evaluate.ts` oder geteilten Typen) | `npm run functions:sync` |
| Edge Functions prüfen | `npm run test:functions` |
| E2E (iPad, lokaler Modus) | `npm run test:e2e` |
| Lokal starten (lokaler Modus ohne .env) | `npm run dev` |

Vor einem PR muss alles laufen, was die CI (`.github/workflows/ci.yml`) prüft: typecheck, test, seed aktuell (`git diff --exit-code supabase/`), db:check, test:functions, build, test:e2e.

## Architekturregeln (aus ARCHITECTURE.md – verbindlich)
- Seiten nutzen nur `services.*` und `domain/*`, **nie** Supabase oder localStorage direkt.
- `src/domain/` ist reine Logik ohne I/O und importiert nichts aus `services/`.
- Bewertungslogik gibt es genau einmal: `src/domain/evaluate.ts`. `supabase/functions/_shared/` ist eine **Kopie** → nie direkt bearbeiten, sondern `npm run functions:sync`.
- Lerninhalte sind eine geprüfte, versionierte Wissensbasis in `src/content` und kommen **nie ungeprüft zu Schülern**: KI-Entwürfe nur auf `content/…`-Branches, gemergt erst nach fachlicher Freigabe im PR (ADR-0002). Freigegebene Inhalte nur auf ausdrücklichen Auftrag ändern. Neue Inhalte: Muster wie `src/content/lineare-funktionen/` (ein Ordner je Thema, eine Datei je Kapitel). Regeln nur hinten anfügen (IDs hängen an der Reihenfolge).
- `supabase/seeds/content-<prüfsumme>.sql` ist **generiert** → nie von Hand bearbeiten, sondern `npm run seed:sql`.
- Der Browser kennt keine Lösungen. Lösungen, Hinweise, typische Fehler nur serverseitig (RLS, protokollierende RPCs, Edge Function `grade-attempt`). Jede neue Tabelle braucht RLS-Policies und einen Test in `db:check`.
- Beide Modi (Supabase und lokal) bleiben funktionsgleich. Production-Builds ohne Supabase-Konfiguration zeigen einen Konfigurationsfehler, außer `VITE_DATA_MODE=local`.

## Datenbank & Migrationen
- Neue Migrationen fortlaufend nummeriert: `supabase/migrations/000N_<name>.sql`. **Bestehende Migrationen nie ändern** (sie sind in der Cloud schon angewendet).
- Nach jeder Migration: `npm run db:check`.
- In die Cloud spielt **nur** der Workflow *Supabase deploy* nach Merge auf `main` ein. Claude führt kein `supabase db push`, `functions deploy`, `secrets set` oder `config push` aus (per Hook gesperrt).
- Supabase-MCP ist **nur lesend** angebunden. Erlaubt: Schema, Migrationen-Stand, Logs, Advisors. **Keine Abfragen auf personenbezogene Daten** (Profile, Abgaben, Handschrift-Bilder, Einwilligungen) – es geht um Daten von Kindern (DSGVO).

## Datenschutz & Sicherheit
- Nutzer sind Minderjährige. Keine echten Nutzerdaten in Logs, Tests, Screenshots, Videos, Doku oder Marketing. Demos immer im lokalen Modus mit Demo-Konto.
- Kein `service_role`-Key im Frontend oder Repo. Frontend-Variablen nur mit `VITE_`-Präfix und nur öffentliche Werte.
- `GEMINI_API_KEY` nie ins Frontend. KI-Korrektur nur für Nutzer in `AI_GRADING_USERS`.
- CSP/Security-Header in `vercel.json` nicht lockern ohne ausdrückliche Freigabe.
- `.env*` (außer `.env.example`) nie lesen oder ändern (per Hook gesperrt).

## Git
- Nie direkt auf `main` committen oder pushen: `main` löst Vercel-Production und den Supabase-Deploy aus. Branches: `feat/…`, `fix/…`, `chore/…`, `content/…` (Inhalte).
- Commits: Conventional-Commits-Präfix + deutsche Beschreibung, z. B. `feat: Kapitel-Test zeigt ausführliche Lösung`.
- Jede nutzerrelevante Änderung → `CHANGELOG.md` unter `[Unreleased]`. Architekturentscheidung → ADR in `docs/adr/` und Abschnitt in ARCHITECTURE.md aktualisieren.

## Sprache & Stil
- UI-Texte, Doku, Commits: Deutsch. Mathe-Darstellung über KaTeX (`MathText`, Inline `$…$`).
- Tablet-first: Touch-Ziele groß genug, iPad-Profil in Playwright.

## Gelernte Lektionen
<!-- Wenn Claude etwas wiederholt falsch macht: hier eine Regel ergänzen. -->
