# ADR-0002: KI-Entwürfe für Lerninhalte mit fachlicher Freigabe

- **Status:** vorgeschlagen
- **Datum:** 2026-11-13
- **Entscheider:** Moritz

## Kontext
Bisher galt: Lerninhalte in `src/content` werden nie von einer KI erzeugt (ARCHITECTURE.md, CLAUDE.md). Die App soll auf Klasse 5–13 wachsen. Das sind grob 40–50 Themen mit 150–200 Unterthemen. Alles von Hand zu schreiben, ist allein nicht zu schaffen. Der Kern der Regel ist aber richtig: Schüler dürfen nur fachlich geprüfte Aufgaben, Lösungen und Erklärungen sehen.

## Entscheidung
Claude darf Lerninhalte als **Entwurf** erzeugen. Für die Freigabe gilt:
- KI-Entwürfe entstehen nur auf einem `content/…`-Branch. Gemergt wird erst nach fachlicher Prüfung durch einen Menschen (Moritz). Der Pull Request ist der Nachweis der Freigabe.
- Jeder Inhalts-PR nennt im Titel oder in der Beschreibung „KI-Entwurf“ und listet die betroffenen Themen und Unterthemen. Prüfumfang: Aufgabe eindeutig, Soll-Antwort richtig, Musterlösung vollständig und altersgerecht, Bezug zum Kernlehrplan.
- Für jede Aufgabe gelten dieselben automatischen Prüfungen wie bisher (`content.test.ts`: Soll-Antwort wird als richtig gewertet, keine doppelten Texte, LaTeX vollständig). Zahlen in Aufgaben aus Vorlagen werden gerechnet, nicht von der KI geschätzt.
- Unverändert gilt: Lösungen bleiben serverseitig. Regeln werden nur hinten angefügt. Bestehende, freigegebene Inhalte ändert die KI nur auf ausdrücklichen Auftrag und ebenfalls per PR.

## Alternativen
| Option | Vorteile | Nachteile |
|---|---|---|
| Regel unverändert, alles von Hand | höchste Kontrolle | Ausbau auf Kl. 5–13 praktisch nicht machbar |
| KI-Entwürfe außerhalb von `src/content` (Markdown), Übertragung von Hand | Regel bleibt wörtlich bestehen | doppelte Arbeit, Übertragungsfehler, keine automatischen Prüfungen am Entwurf |
| KI-Entwürfe in `src/content` auf `content/`-Branch, PR als Freigabe | automatische Prüfungen greifen sofort, Freigabe nachvollziehbar, Schüler sehen nichts vor dem Merge | Prüfaufwand liegt beim Reviewer; Gefahr, große PRs nur zu überfliegen |

## Konsequenzen
- Inhalts-PRs werden klein geschnitten (ein Thema oder eine Klassenstufe je PR), damit die Prüfung gründlich bleibt.
- CLAUDE.md und ARCHITECTURE.md formulieren die Regel neu: „nie ungeprüft“ statt „nie von einer KI“.
- Fehler in freigegebenen Inhalten werden wie Bugs behandelt (`fix/…` bzw. `content/…`-Branch, Eintrag in `CHANGELOG.md`).
