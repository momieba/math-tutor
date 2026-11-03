# MatheMentor – MVP

Tablet-first Mathe-Nachhilfe (Klasse 7–9): Lehrplan-Themen, Lernkapitel, Aufgaben mit gestuften Hinweisen, Musterlösungen und Verständnis-Score.
Architektur: siehe [ARCHITECTURE.md](./ARCHITECTURE.md).

## Schnellstart (lokaler Modus, ohne Cloud)
```bash
npm install
npm run dev          # http://localhost:5173
```
Ohne `.env` läuft der Entwicklungsserver im **lokalen Modus**: Konten und Lernstand liegen im `localStorage` des Browsers, die Anmeldung ist eine Mock-Auth. „Mit Google anmelden“ meldet dabei einen Demo-Nutzer an. Im Header steht dann das Badge „Lokaler Modus“. Zum Zurücksetzen die `localStorage`-Einträge mit dem Präfix `mathmvp:` löschen.
**Production-Builds** starten ohne Supabase-Konfiguration nicht, sondern zeigen einen Konfigurationsfehler. Eine reine Demo ohne Cloud braucht ausdrücklich `VITE_DATA_MODE=local`.

## Befehle
| Befehl | Zweck |
|---|---|
| `npm run build` | Typecheck + Produktions-Build |
| `npm test` | Unit-Tests (Content-Vollständigkeit, Bewertung, Score, Topic-Matching, Abgabe/Hilfen) |
| `npm run typecheck` | nur TypeScript |
| `npm run seed:sql` | `supabase/seed.sql` aus `src/content` erzeugen (nach jeder Inhaltsänderung) |
| `npm run db:check` | alle Migrationen + Seed + RLS/RPC-Regeln lokal gegen PGlite prüfen (mit Supabase-Standardrechten) |
| `npm run functions:sync` | Bewertungslogik (`src/domain/evaluate.ts`, Typen) in die Edge Functions kopieren (nach Änderungen daran) |
| `npm run test:functions` | Edge Functions: Synchronität prüfen + Deno-Tests (lädt Deno per npx) |
| `npm run test:e2e` | Playwright-E2E (iPad-Profil, Touch, lokaler Modus); einmalig `npx playwright install chromium` |

CI (`.github/workflows/ci.yml`) führt all das bei jedem Push und Pull Request aus.

## Stand
**Produktionsreif im Code** (Supabase + Vercel), Klassen 7–9 mit den Themen Prozentrechnung, Satz des Pythagoras und quadratische Gleichungen (55 Aufgaben).
- **Inhalte in der Datenbank:** Im Supabase-Modus liest die App Themen, Kapitel und Aufgaben aus Postgres. Gepflegt werden sie geprüft in `src/content` und per `seed.sql` eingespielt.
- **Bewertung serverseitig:** Antworten, Hinweise, Musterlösungen und typische Fehler sind für Clients nicht lesbar. Bewertet wird in der Edge Function `grade-attempt`, Hinweise und Lösung gibt es nur über protokollierende RPCs. Der Score lässt sich nicht fälschen.
- **Konten:** E-Mail (mit Bestätigung) und Google, Einwilligung mit Version, Passwort vergessen/ändern, Datenexport (JSON), Konto löschen inkl. Bilder.
- **Betrieb:** Security-Header/CSP auf Vercel, lokaler Modus in Production gesperrt, CI, manueller Supabase-Deploy-Workflow.

Nicht getestet: Safari/WebKit, echtes iPad mit Apple Pencil, der Supabase-Modus gegen eine echte Instanz (Schema/RLS/RPCs sind per PGlite, Edge Functions per Deno-Tests abgedeckt). Offene Aufgaben und Entscheidungen: [docs/TODO.md](./docs/TODO.md).

## Go-Live (Supabase + Vercel)
Einmalig, je Umgebung (`staging`, `production`):

1. **Supabase-Projekt** in der Region **EU (Frankfurt)** anlegen. Für den Livebetrieb den Pro-Tarif wählen (Free pausiert Projekte und hat keine Backups).
2. **Datenbank, Inhalte, Functions** einspielen, entweder lokal:
   ```bash
   npx supabase@3.0.0 login
   npx supabase@3.0.0 link --project-ref <ref>
   npx supabase@3.0.0 db push --remote --include-seed
   npx supabase@3.0.0 functions deploy grade-attempt --use-api
   npx supabase@3.0.0 functions deploy delete-account --use-api
   ```
   oder automatisch über den GitHub-Workflow **Supabase deploy**: Er läuft bei jedem Push auf `main`, der etwas unter `supabase/` ändert (Migrationen, `seed.sql`, Edge Functions), erst nach grünen Prüfungen. Manuell startbar unter Actions → „Run workflow“.
   Einrichtung: GitHub-Repo → Settings → Environments → **New environment** `production`. Dort die Secrets `SUPABASE_ACCESS_TOKEN` (erzeugen unter supabase.com/dashboard/account/tokens) und `SUPABASE_DB_PASSWORD` anlegen, dazu die Variable `SUPABASE_PROJECT_REF` (die 20 Zeichen aus der Dashboard-URL).
3. **Auth konfigurieren** (Dashboard → Authentication):
   - URL Configuration: *Site URL* = Produktions-Domain; *Redirect URLs* = `https://<domain>/app`, `https://<domain>/reset-password` (Staging zusätzlich `https://*.vercel.app/**`).
   - E-Mail: Bestätigung an, Mindestlänge Passwort 8 mit Buchstaben + Ziffern (steht auch in `supabase/config.toml`, übertragbar mit `npx supabase@3.0.0 config push`).
   - **Eigener SMTP-Server** (z. B. ein EU-Anbieter): Der eingebaute Versand ist stark begrenzt und nur zum Testen gedacht. E-Mail-Vorlagen auf Deutsch übersetzen.
   - Google: OAuth-Client in der Google Cloud Console anlegen, Client-ID/Secret eintragen.
4. **Vercel:** Repo importieren (Einstellungen kommen aus `vercel.json`). Unter Settings → Environment Variables getrennt für *Preview* (→ staging) und *Production* (→ production) `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` setzen. **Nur den Anon-Key, nie den service_role-Key.** Vercel Hobby ist nur nichtkommerziell erlaubt, für ein Abo-Produkt Pro (oder z. B. Cloudflare Pages).
   Die CSP in `vercel.json` erlaubt Verbindungen zu `*.supabase.co`. Bei einer eigenen Supabase-Domain muss sie dort ergänzt werden.
5. **Rechtliches (Blocker):** Impressum, Datenschutzerklärung und Nutzungsbedingungen (`src/pages/LegalPage.tsx`, derzeit Platzhalter) mit echten Angaben füllen und prüfen lassen, AV-Verträge mit Supabase und Vercel abschließen. Bei geänderten Texten `CONSENT_VERSION` in `src/config/legal.ts` hochzählen, dann werden alle Nutzer erneut gefragt.
6. **Abnahme auf staging:** Registrieren (Bestätigungs-Mail), Google-Login, Aufgabe mit Hinweis + Handschrift abgeben, Verlauf mit Bild, Passwort zurücksetzen, Datenexport, Konto löschen.

**Inhalte ändern:** in `src/content` bearbeiten (neue Themen: ein Ordner je Thema, eine Datei je Kapitel, viele Aufgaben über Vorlagen, siehe ARCHITECTURE.md „Aufgabenpools“) → `npm test` → `npm run seed:sql` → Pull Request mit Review → nach dem Merge spielt der Workflow *Supabase deploy* die Inhalte automatisch ein. Der Seed ist idempotent (UPSERT), vorhandene Versuche bleiben erhalten.
**Bewertungslogik ändern:** `src/domain/evaluate.ts` bearbeiten → `npm run functions:sync` → committen und pushen; der Workflow deployt `grade-attempt` neu, damit Server und lokaler Modus gleich bewerten (CI prüft die Synchronität).
**Datenbank ändern:** nie eine bestehende Migration bearbeiten, sondern eine neue Datei `supabase/migrations/000N_<name>.sql` anlegen → `npm run db:check` → pushen. Supabase merkt sich, welche Migrationen schon angewendet sind, und spielt nur neue ein.
