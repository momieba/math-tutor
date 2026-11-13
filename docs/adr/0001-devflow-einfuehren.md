# ADR-0001: devflow als Entwicklungsprozess einführen

- **Status:** akzeptiert
- **Datum:** 2026-11-13
- **Entscheider:** Moritz

## Kontext
MatheMentor wird überwiegend mit Claude Code entwickelt. Bisher wurde direkt auf `main` committet; jeder Push auf `main` deployt aber sofort auf Vercel-Production und (bei Änderungen unter `supabase/`) in die Supabase-Cloud. Das Projekt hat strenge Regeln (generierter Seed, kopierte Bewertungslogik, Lösungsschutz, Daten von Minderjährigen), die bisher nur in README/ARCHITECTURE.md stehen.

## Entscheidung
Wir nutzen das Claude-Code-Plugin **devflow**:
- feste Phasen Planen → Freigabe → Umsetzen → Testen → Review → Doku → Pull Request; gemergt wird von Moritz,
- spezialisierte Subagents (Planer, Implementierer, Tester, Reviewer, Doku, Marketing, Video),
- Hooks in `.devflow/hooks/` (Node, plattformunabhängig): Schutz von `.env*`, generiertem Seed und `_shared/`-Kopien; Sperre von Cloud-Deploys, Force-Push, Commits/Pushes auf `main`; Qualitäts-Gate (`typecheck` + `test`) vor jedem Rundenende,
- Projektregeln in `CLAUDE.md`, Konfiguration in `.devflow/config.json`,
- zusätzlich zur bestehenden CI ein automatisches Claude-Review je Pull Request (über das Claude-Abo).

## Alternativen
| Option | Vorteile | Nachteile |
|---|---|---|
| Weiter direkt auf `main` | schnell | jeder Fehler sofort in Produktion, kein Review |
| Nur Branch-Schutz in GitHub | einfach | keine Regeln für Claude selbst, keine Pläne/Doku |
| devflow | reproduzierbar, nachvollziehbar, Regeln technisch erzwungen | etwas mehr Ablauf pro Änderung |

## Konsequenzen
- Pläne liegen unter `docs/specs/`, Entscheidungen unter `docs/adr/`, Änderungen in `CHANGELOG.md`.
- Deploys passieren nur noch nach Merge eines Pull Requests.
- Empfohlen: in GitHub Branch-Schutz für `main` aktivieren (PR + grüne CI erforderlich).
