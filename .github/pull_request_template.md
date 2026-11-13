## Ziel
<!-- Warum gibt es diesen PR? -->

Plan: `docs/specs/…` · TODO-Punkt: <!-- aus docs/TODO.md --> · Closes #

## Akzeptanzkriterien
- [ ] 

## Checkliste
- [ ] `npm run typecheck` und `npm test` grün
- [ ] Inhalte geändert → `npm run seed:sql` ausgeführt und neuer Seed committet
- [ ] `src/domain/evaluate.ts` oder geteilte Typen geändert → `npm run functions:sync` + `npm run test:functions`
- [ ] Neue Migration (fortlaufend nummeriert, keine bestehende geändert) → `npm run db:check`, RLS für neue Tabellen
- [ ] Keine Lösungen/Hinweise im Client, keine Kinderdaten in Logs/Tests/Screenshots
- [ ] Beide Modi (Supabase + lokal) funktionieren
- [ ] `CHANGELOG.md` `[Unreleased]` ergänzt · `docs/TODO.md` aktualisiert (Erledigtes gelöscht)
- [ ] ADR / ARCHITECTURE.md aktualisiert (falls Architekturentscheidung)

## Deploy-Hinweis
<!-- Merge auf main deployt Vercel-Production; Änderungen unter supabase/ lösen den Workflow „Supabase deploy“ aus. Was ist nach dem Merge zu prüfen? -->
