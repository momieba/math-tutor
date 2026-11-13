# Plan: Themen und Unterthemen Klasse 5–13 (Gymnasium NRW, G9)

- **Status:** Entwurf zur Freigabe
- **Datum:** 2026-11-13
- **Grundlage:** ADR-0002 (KI-Entwürfe mit fachlicher Freigabe), [Labels für Themen und Unterthemen](./2026-11-13-themen-labels.md)

## Ziel
Eine vollständige Themenliste für die Inhalte von Klasse 5–13 als Gerüst für den Ausbau. Themen sind **fachliche Einheiten ohne feste Klasse**. Wo ein Thema und jedes seiner Unterthemen im Unterricht vorkommt, sagen Labels (Bundesland × Schulform × Klasse). Nach der Freigabe entstehen die Aufgaben paketweise: zunächst **5 Aufgaben je Unterthema mit Musterlösung** (Lösungsschritte `solution.steps` und ausführliche Lösung `solution.detailed`).

## Nicht-Ziele (für diesen Schritt)
- Keine Aufgaben, keine Code-Änderungen. Das hier ist nur die Liste.
- Keine Aufgabenpools (≥ 50 Aufgaben je Kapitel) für neue Themen. Sie kommen nicht in `POOL_TOPIC_IDS`.
- Bestehende Themen werden nicht umgebaut. Neue Unterthemen werden nur hinten angefügt und sind als Vorschlag markiert.

## Quellen und offene Punkte
- **Sek I:** Kernlehrplan Mathematik Gymnasium Sek I (G9), NRW 2019. Er legt Kompetenzen nur bis **Ende Klasse 6, Ende Klasse 8 und Ende Sek I** fest. Die Klassen in den Labels folgen der üblichen Verteilung in schulinternen Lehrplänen und Lehrwerken. Schulen weichen davon ab.
- **Sek II:** Kernlehrplan Mathematik Sek II Gymnasium/Gesamtschule NRW, in Kraft seit 01.08.2023, aufsteigend ab EF. Für G9 ist **EF = 11, Q1 = 12, Q2 = 13**. Es gibt einen Entwurf für eine Neufassung (Beteiligungsverfahren 2025). ⚠️ **Vor den Oberstufen-Aufgaben prüfen**, welche Fassung gilt und wie sich GK und LK unterscheiden.

## Lesart
- **Alle Labels sind vorerst NRW · Gymnasium.** In den Tabellen steht deshalb nur die Klasse.
- **Thema-Labels** = Vereinigung der Labels seiner Unterthemen (siehe Labels-Plan, Regel 3).
- Die Zahl in Klammern hinter einem Unterthema ist sein Label, zum Beispiel *Baumdiagramme (8)*. Mehrere Zahlen bedeuten mehrere Labels, zum Beispiel *Bedingte Wahrscheinlichkeit (10, 11)*. Steht beim Thema nur eine Klasse, gilt sie für alle Unterthemen.
- ✅ vorhandenes Thema · 🆕 neues Thema · ➕ neues Unterthema in einem vorhandenen Thema (Vorschlag)

---

## Zahlen und Rechnen

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Natürliche Zahlen | 5 | Stellenwertsystem und große Zahlen · Runden und Überschlagen · Zahlenstrahl und Anordnen · Schriftlich addieren und subtrahieren · Schriftlich multiplizieren · Schriftlich dividieren · Rechengesetze und Rechenvorteile · Klammern und Punkt vor Strich |
| 🆕 Größen und Einheiten | 5 | Geld, Zeit, Länge · Masse · Umrechnen und Kommaschreibweise · Maßstab |
| 🆕 Teilbarkeit | 5 | Teiler und Vielfache · Teilbarkeitsregeln · Primzahlen und Primfaktorzerlegung · ggT und kgV |
| 🆕 Brüche | 6 | Bruchteile darstellen · Erweitern und Kürzen · Vergleichen und Ordnen · Gemischte Zahlen · Bruchteile von Größen · Addieren und Subtrahieren · Multiplizieren · Dividieren · Verbindung der Rechenarten |
| 🆕 Dezimalzahlen | 6 | Dezimalschreibweise und Stellenwerte · Brüche und Dezimalzahlen umwandeln · Periodische Dezimalzahlen · Runden · Addieren und Subtrahieren · Multiplizieren · Dividieren · Sachaufgaben |
| ✅ Prozentrechnung | 6, 7 | vorhandene Unterthemen (7) · ➕ Anteile als Bruch, Dezimalzahl und Prozent (6) · ➕ Einfache Prozentangaben deuten (6) |
| 🆕 Zinsrechnung | 7 | Zinsen, Kapital, Zinssatz · Tages- und Monatszinsen · Zinseszins (Einstieg) |
| 🆕 Rationale Zahlen | 7 | Negative Zahlen und Zahlengerade · Betrag und Gegenzahl · Addieren und Subtrahieren · Multiplizieren und Dividieren · Koordinatensystem (alle Quadranten) |
| 🆕 Terme und Variablen | 7, 8 | Terme aufstellen und deuten (7) · Terme vereinfachen (7) · Ausmultiplizieren und Ausklammern (7) · Termwerte berechnen (7) · Summen multiplizieren (8) · Binomische Formeln (8) · Faktorisieren mit binomischen Formeln (8) |
| 🆕 Lineare Gleichungen | 7 | Probieren und Umkehren · Äquivalenzumformungen · Gleichungen mit Klammern · Sachaufgaben mit Gleichungen |
| 🆕 Reelle Zahlen und Wurzeln | 9 | Quadratwurzeln · Irrationale Zahlen · Rechnen mit Wurzeln · Wurzeln vereinfachen (teilweise Radizieren) |
| 🆕 Potenzen | 5, 10 | Potenzen mit natürlichen Exponenten (5) · Potenzen mit ganzzahligen Exponenten (10) · Potenzgesetze (10) · Wissenschaftliche Schreibweise (10) · n-te Wurzeln und rationale Exponenten (10) |

## Funktionen

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Zuordnungen | 7 | Zuordnungen darstellen · Proportionale Zuordnungen und Dreisatz · Antiproportionale Zuordnungen · Sachaufgaben |
| ✅ Lineare Funktionen | 8 | vorhanden |
| ✅ Lineare Gleichungssysteme | 8 | vorhanden |
| ✅ Quadratische Funktionen | 9 | vorhanden |
| ✅ Quadratische Gleichungen | 9 | vorhanden |
| 🆕 Exponentielles Wachstum | 10 | Lineares und exponentielles Wachstum vergleichen · Wachstumsfaktor und Prozentsatz · Exponentialfunktionen · Exponentialgleichungen (Logarithmus) · Sachaufgaben (Zinsen, Zerfall) |
| 🆕 Potenzfunktionen | 10 | Graphen von $y = x^n$ · Verschieben und Strecken · Eigenschaften (Symmetrie, Verlauf) |

## Geometrie

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Geometrische Grundbegriffe | 5 | Strecke, Gerade, Strahl · Senkrecht und parallel · Koordinatensystem (1. Quadrant) · Achsen- und Punktsymmetrie · Vierecke und ihre Eigenschaften |
| 🆕 Flächen | 5, 8 | Flächen vergleichen und messen (5) · Flächeneinheiten umrechnen (5) · Rechteck und Quadrat (5) · Zusammengesetzte Flächen (5) · Parallelogramm (8) · Dreieck (8) · Trapez (8) · Vielecke zerlegen (8) |
| 🆕 Körper | 5, 10 | Körper erkennen und benennen (5) · Netze und Schrägbilder (5) · Oberfläche von Quader und Würfel (5) · Volumen von Quader und Würfel (5) · Pyramide (10) · Kegel (10) · Kugel (10) · Körper aus Pyramide, Kegel und Kugel (10) |
| 🆕 Winkel und Kreis | 6 | Winkel messen und zeichnen · Winkelarten · Kreis zeichnen, Radius und Durchmesser · Winkel an Geradenkreuzungen |
| 🆕 Dreiecke und Konstruktionen | 7 | Winkelsumme im Dreieck · Dreiecksarten · Kongruenzsätze · Dreiecke konstruieren · Mittelsenkrechte, Winkelhalbierende, Umkreis und Inkreis |
| ✅ Kreis und Zylinder | 8, 9 | Prismen (8) · alle übrigen Unterthemen (9) |
| ✅ Satz des Pythagoras | 9 | vorhanden |
| 🆕 Ähnlichkeit | 9 | Zentrische Streckung · Ähnliche Figuren · Strahlensätze · Sachaufgaben (Höhen, Entfernungen) |
| 🆕 Trigonometrie | 10 | Sinus, Kosinus, Tangens im rechtwinkligen Dreieck · Seiten und Winkel berechnen · Sinus- und Kosinusfunktion am Einheitskreis · Sachaufgaben |

> Prismen: Ein eigenes Prismen-Thema gibt es nicht mehr. Das vorhandene Unterthema in *Kreis und Zylinder* bekommt das Label 8.

## Daten und Zufall

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Daten und Statistik | 5, 6, 9 | Diagramme lesen und zeichnen (5) · Daten erheben und darstellen (6) · Absolute und relative Häufigkeit (6) · Mittelwert, Median, Spannweite (6) · Boxplot (6) · Datenauswertung und Diagrammkritik (9) |
| 🆕 Wahrscheinlichkeit | 7, 8, 9, 10, 11 | Zufallsexperimente (7) · Laplace-Wahrscheinlichkeit (7) · Relative Häufigkeit und Wahrscheinlichkeit (7) · Baumdiagramme (8) · Pfadregeln (8) · Sachaufgaben zu mehrstufigen Zufallsexperimenten (8) · Vierfeldertafel und bedingte Häufigkeiten (9) · Bedingte Wahrscheinlichkeit (10, 11) · Simulationen (10) · Stochastische Unabhängigkeit (11) |
| 🆕 Zufallsgrößen und Verteilungen | 13 | Zufallsgröße, Erwartungswert, Standardabweichung · Bernoulli-Kette und Binomialverteilung · Sachaufgaben (LK: Normalverteilung, Hypothesentests) |

## Analysis (Oberstufe)

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Funktionen und ihre Eigenschaften | 11 | Ganzrationale Funktionen · Symmetrie und Verhalten im Unendlichen · Transformationen von Funktionsgraphen · Exponential- und Sinusfunktionen |
| 🆕 Differentialrechnung | 11, 12, 13 | Mittlere und momentane Änderungsrate (11) · Ableitung als Tangentensteigung (11) · Ableitungsregeln: Potenz-, Summen-, Faktorregel (11) · Ableitungsfunktion grafisch (11) · Monotonie (11) · Extrempunkte (11) · Tangentengleichungen (11) · Notwendige und hinreichende Bedingungen (12) · Wendepunkte (12) · Steckbriefaufgaben (12) · Extremwertprobleme (12) · Produkt- und Kettenregel (13) |
| 🆕 Integralrechnung | 12 | Rekonstruktion von Beständen · Stammfunktionen · Hauptsatz der Differential- und Integralrechnung · Flächen zwischen Graphen · Mittelwerte (LK: uneigentliche Integrale, Rotationskörper) |
| 🆕 Exponential- und Logarithmusfunktionen | 13 | Natürliche Exponentialfunktion · Natürlicher Logarithmus · Wachstumsmodelle (LK: Funktionenscharen) |

## Analytische Geometrie (Oberstufe)

| Thema | Labels | Unterthemen |
|---|---|---|
| 🆕 Vektoren | 11, 12 | Punkte im räumlichen Koordinatensystem (11) · Vektoren (11) · Rechnen mit Vektoren (11) · Länge von Vektoren (11) · Skalarprodukt und Orthogonalität (12) · Winkel zwischen Vektoren (12) |
| 🆕 Geraden und Ebenen | 12, 13 | Geradengleichungen (12) · Lagebeziehungen von Geraden (12) · Ebenengleichungen (12) · Normalenform (12) · Lineare Gleichungssysteme mit dem Gauß-Verfahren (12) · Gerade und Ebene (13) · Ebene und Ebene (13) · Abstände (13, LK-Schwerpunkt) |

---

## Umfang

| Themengebiet | neue Themen | neue Unterthemen | Aufgaben (5 je Unterthema) |
|---|---|---|---|
| Zahlen und Rechnen | 11 | 63 (davon 2 ➕) | 315 |
| Funktionen | 3 | 12 | 60 |
| Geometrie | 7 | 38 | 190 |
| Daten und Zufall | 3 | 19 | 95 |
| Analysis | 4 | 24 | 120 |
| Analytische Geometrie | 2 | 14 | 70 |
| **Summe** | **30** | **170** | **≈ 850** |

Unterthemen je Klasse (für die Pakete): 5 → 31 · 6 → 27 · 7 → 28 · 8 → 10 · 9 → 10 · 10 → 22 · 11 → 17 · 12 → 16 · 13 → 10. Ein Unterthema mit zwei Labels (*Bedingte Wahrscheinlichkeit*) zählt bei 10 und 11, deshalb ergeben die Werte zusammen 171 statt 170.

## Vorgehen nach Freigabe
1. Zuerst wird der [Labels-Plan](./2026-11-13-themen-labels.md) umgesetzt, damit neue Themen gleich mit Labels entstehen.
2. Danach Inhalte **je Klassen-Label ein PR** (`content/klasse-7`, …): Jeder PR enthält alle neuen Unterthemen mit diesem Label, auch wenn das Thema Unterthemen anderer Klassen hat (die kommen in deren PR). Reihenfolge: 7 → 8 → 9 → 10 (Kernzielgruppe), dann 5 → 6, dann 11 → 13.
3. Je Unterthema 5 Aufgaben, gemischt nach Stufe (1–3) und Anforderungsart, mindestens eine Sachaufgabe. Jede Aufgabe mit Soll-Antwort, Lösungsschritten und ausführlicher Lösung. Rechenaufgaben bevorzugt über Vorlagen, damit die Zahlen gerechnet sind.
4. Je PR: `npm run seed:sql`, `npm run db:check`, alle CI-Prüfungen. Danach fachliche Freigabe durch Moritz.

## Akzeptanzkriterien für diese Liste
- [ ] Moritz hat Themen, Unterthemen und Labels geprüft und angepasst.
- [x] Die ➕-Vorschläge für *Prozentrechnung* (Klasse 6) sind bestätigt (Branch `content/prozent-klasse-6`). *Proportionale Funktionen* hat zusätzlich das Label Klasse 7.
- [ ] Geltende Fassung des KLP Sek II und die Abgrenzung GK/LK sind geklärt.
- [ ] Reihenfolge der Pakete ist bestätigt.
