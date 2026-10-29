# MatheMentor – MVP

Tablet-first Mathe-Nachhilfe (Klasse 7–9): Lehrplan-Themen, Lernkapitel, Aufgaben mit gestuften Hinweisen, Musterlösungen und Verständnis-Score.
Architektur: siehe [ARCHITECTURE.md](./ARCHITECTURE.md).

## Schnellstart (lokaler Modus, ohne Cloud)
```bash
npm install
npm run dev          # http://localhost:5173
```
Ohne `.env` läuft die App automatisch im **lokalen Modus**: Konten und Lernstand liegen im `localStorage` des Browsers, die Anmeldung ist eine Mock-Auth. „Mit Google anmelden“ meldet dabei einen Demo-Nutzer an. Im Header steht dann das Badge „Lokaler Modus“. Zum Zurücksetzen die `localStorage`-Einträge mit dem Präfix `mathmvp:` löschen.

## Befehle
| Befehl | Zweck |
|---|---|
| `npm run build` | Typecheck + Produktions-Build |
| `npm test` | Unit-Tests (Content-Vollständigkeit, Bewertung, Score, Topic-Matching) |
| `npm run typecheck` | nur TypeScript |
| `npm run seed:sql` | `supabase/seed.sql` aus `src/content` erzeugen (nach jeder Inhaltsänderung) |
| `npm run db:check` | Migration + Seed + RLS-Regeln lokal gegen PGlite prüfen |

## Supabase-Modus (optional)
1. Supabase-Projekt anlegen und `supabase/migrations/0001_init.sql` ausführen, danach `supabase/seed.sql` (SQL-Editor oder `supabase db push`).
2. Unter Auth → Providers E-Mail und Google aktivieren, Redirect-URL `http://localhost:5173/app` eintragen.
3. `.env.example` nach `.env` kopieren und `VITE_SUPABASE_URL` sowie `VITE_SUPABASE_ANON_KEY` eintragen. **Nur den Anon-Key verwenden, niemals den service_role-Key.**
4. `npm run dev`. Mit `VITE_DATA_MODE=local` lässt sich der lokale Modus erzwingen.
