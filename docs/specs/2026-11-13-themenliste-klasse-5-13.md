# Plan: Themen und Unterthemen Klasse 5–13 (Gymnasium NRW, G9)

- **Status:** Entwurf zur Freigabe
- **Datum:** 2026-11-13
- **Grundlage:** ADR-0002 (KI-Entwürfe mit fachlicher Freigabe)

## Ziel
Eine vollständige Themenliste für Klasse 5–13 als Gerüst für den Ausbau. Nach der Freigabe dieser Liste entstehen die Aufgaben **paketweise**: zunächst **5 Aufgaben je Unterthema mit Musterlösung** (Lösungsschritte `solution.steps` und ausführliche Lösung `solution.detailed`).

## Nicht-Ziele (für diesen Schritt)
- Keine Aufgaben, keine Code-Änderungen. Das hier ist nur die Liste.
- Keine Aufgabenpools (≥ 50 Aufgaben je Kapitel) für neue Themen. Die bleiben vorerst bei 5 Aufgaben je Unterthema und kommen nicht in `POOL_TOPIC_IDS`.
- Bestehende Themen werden nicht umgebaut.

## Quellen und offene Punkte
- **Sek I:** Kernlehrplan Mathematik Gymnasium Sek I (G9), NRW 2019. Er legt Kompetenzen nur bis **Ende Klasse 6, Ende Klasse 8 und Ende Sek I** fest. Die Zuordnung zu einzelnen Klassen folgt der üblichen Verteilung in schulinternen Lehrplänen und Lehrwerken. Schulen weichen davon ab.
- **Sek II:** Kernlehrplan Mathematik Sek II Gymnasium/Gesamtschule NRW, in Kraft seit 01.08.2023, aufsteigend ab EF. Für G9 ist **EF = Klasse 11, Q1 = 12, Q2 = 13**. Es gibt einen Entwurf für eine Neufassung (Beteiligungsverfahren 2025). ⚠️ **Vor dem Schreiben der Oberstufen-Aufgaben prüfen**, welche Fassung für den ersten G9-Jahrgang gilt und wie sich Grundkurs (GK) und Leistungskurs (LK) unterscheiden.
- In der Tabelle bedeutet ✅ ein vorhandenes Thema (bleibt, wie es ist) und 🆕 ein neues Thema. „LK“ steht für LK-Inhalte, die gesondert gekennzeichnet werden.

## Datenmodell (Auswirkungen bei Umsetzung)
- Der Lehrplan `gradeFrom: 5, gradeTo: 10` deckt Sek I ab. Für Klasse 11–13 kommt ein **zweiter Eintrag in `curricula`** dazu (KLP Sek II), gegebenenfalls mit einer Kennzeichnung GK/LK an Themen oder Unterthemen. Ob dafür eine Migration nötig ist, klärt der Planer im Umsetzungsplan.
- Je Thema ein Ordner, je Kapitel eine Datei (Muster `src/content/lineare-funktionen/`). Regeln nur hinten anfügen.
- `content.test.ts` muss Themen ohne Pool (5 Aufgaben je Unterthema) zulassen. Die Mindestregeln für Pools gelten nur für `POOL_TOPIC_IDS`.

---

## Klasse 5

| Thema | Unterthemen |
|---|---|
| 🆕 Natürliche Zahlen | Stellenwertsystem und große Zahlen · Runden und Überschlagen · Zahlenstrahl und Anordnen · Diagramme lesen und zeichnen |
| 🆕 Rechnen mit natürlichen Zahlen | Schriftlich addieren und subtrahieren · Schriftlich multiplizieren · Schriftlich dividieren · Rechengesetze und Rechenvorteile · Klammern und Punkt vor Strich · Potenzen mit natürlichen Exponenten |
| 🆕 Größen und Einheiten | Geld, Zeit, Länge · Masse · Umrechnen und Kommaschreibweise · Maßstab |
| 🆕 Geometrische Grundbegriffe | Strecke, Gerade, Strahl · Senkrecht und parallel · Koordinatensystem (1. Quadrant) · Achsen- und Punktsymmetrie · Vierecke und ihre Eigenschaften |
| 🆕 Flächen und Umfang | Flächen vergleichen und messen · Flächeneinheiten umrechnen · Umfang und Flächeninhalt von Rechteck und Quadrat · Zusammengesetzte Flächen |
| 🆕 Körper | Körper erkennen und benennen · Netze und Schrägbilder · Oberfläche von Quader und Würfel · Volumen von Quader und Würfel, Volumeneinheiten |
| 🆕 Teilbarkeit | Teiler und Vielfache · Teilbarkeitsregeln · Primzahlen und Primfaktorzerlegung · ggT und kgV |

## Klasse 6

| Thema | Unterthemen |
|---|---|
| 🆕 Brüche | Bruchteile darstellen · Erweitern und Kürzen · Brüche vergleichen und ordnen · Gemischte Zahlen · Bruchteile von Größen |
| 🆕 Rechnen mit Brüchen | Addieren und subtrahieren · Multiplizieren · Dividieren · Verbindung der Rechenarten |
| 🆕 Dezimalzahlen | Dezimalschreibweise und Stellenwerte · Brüche und Dezimalzahlen umwandeln · Periodische Dezimalzahlen · Runden |
| 🆕 Rechnen mit Dezimalzahlen | Addieren und subtrahieren · Multiplizieren · Dividieren · Sachaufgaben |
| 🆕 Anteile und Prozente (Einstieg) | Anteile als Bruch, Dezimalzahl und Prozent · Einfache Prozentangaben deuten |
| 🆕 Winkel und Kreis | Winkel messen und zeichnen · Winkelarten · Kreis zeichnen, Radius und Durchmesser · Winkel an Geradenkreuzungen |
| 🆕 Daten und Zufall (Einstieg) | Daten erheben und darstellen · Absolute und relative Häufigkeit · Mittelwert, Median, Spannweite · Boxplot |

## Klasse 7

| Thema | Unterthemen |
|---|---|
| 🆕 Zuordnungen | Zuordnungen darstellen · Proportionale Zuordnungen und Dreisatz · Antiproportionale Zuordnungen · Sachaufgaben |
| ✅ Prozentrechnung | (vorhanden) |
| 🆕 Zinsrechnung | Zinsen, Kapital, Zinssatz · Tages- und Monatszinsen · Zinseszins (Einstieg) |
| 🆕 Rationale Zahlen | Negative Zahlen und Zahlengerade · Betrag und Gegenzahl · Addieren und subtrahieren · Multiplizieren und dividieren · Koordinatensystem (alle Quadranten) |
| 🆕 Terme und Variablen | Terme aufstellen und deuten · Terme vereinfachen · Ausmultiplizieren und Ausklammern · Termwerte berechnen |
| 🆕 Lineare Gleichungen | Gleichungen durch Probieren und Umkehren · Äquivalenzumformungen · Gleichungen mit Klammern · Sachaufgaben mit Gleichungen |
| 🆕 Dreiecke und Konstruktionen | Winkelsumme im Dreieck · Dreiecksarten · Kongruenzsätze · Dreiecke konstruieren · Mittelsenkrechte, Winkelhalbierende, Umkreis und Inkreis |
| 🆕 Wahrscheinlichkeit (Einstieg) | Zufallsexperimente · Laplace-Wahrscheinlichkeit · Relative Häufigkeit und Wahrscheinlichkeit |

## Klasse 8

| Thema | Unterthemen |
|---|---|
| ✅ Lineare Funktionen | (vorhanden) |
| ✅ Lineare Gleichungssysteme | (vorhanden) |
| 🆕 Terme mit Klammern | Summen multiplizieren · Binomische Formeln · Faktorisieren mit binomischen Formeln |
| 🆕 Flächen von Vielecken | Parallelogramm · Dreieck · Trapez · Vielecke zerlegen |
| 🆕 Prismen | Netz und Schrägbild · Oberfläche · Volumen · Sachaufgaben |
| 🆕 Mehrstufige Zufallsexperimente | Baumdiagramme · Pfadregeln · Sachaufgaben |

> Hinweis: `kreis-zylinder` enthält schon ein Kapitel „Prismen“. Bitte entscheiden: neues Thema „Prismen“ in Klasse 8 **oder** das vorhandene Kapitel genügt (dann entfällt die Zeile).

## Klasse 9

| Thema | Unterthemen |
|---|---|
| ✅ Satz des Pythagoras | (vorhanden) |
| ✅ Quadratische Funktionen | (vorhanden) |
| ✅ Quadratische Gleichungen | (vorhanden) |
| ✅ Kreis und Zylinder | (vorhanden) |
| 🆕 Reelle Zahlen und Wurzeln | Quadratwurzeln · Irrationale Zahlen · Rechnen mit Wurzeln · Wurzeln vereinfachen (teilweise Radizieren) |
| 🆕 Ähnlichkeit | Zentrische Streckung · Ähnliche Figuren · Strahlensätze · Sachaufgaben (Höhen, Entfernungen) |
| 🆕 Daten und Zufall | Vierfeldertafel · Bedingte Häufigkeiten · Datenauswertung und Diagrammkritik |

## Klasse 10

| Thema | Unterthemen |
|---|---|
| 🆕 Potenzen | Potenzen mit ganzzahligen Exponenten · Potenzgesetze · Wissenschaftliche Schreibweise · n-te Wurzeln und rationale Exponenten |
| 🆕 Exponentielles Wachstum | Lineares und exponentielles Wachstum vergleichen · Wachstumsfaktor und Prozentsatz · Exponentialfunktionen · Exponentialgleichungen (Logarithmus) · Sachaufgaben (Zinsen, Zerfall) |
| 🆕 Trigonometrie | Sinus, Kosinus, Tangens im rechtwinkligen Dreieck · Seiten und Winkel berechnen · Sinus- und Kosinusfunktion am Einheitskreis · Sachaufgaben |
| 🆕 Pyramide, Kegel, Kugel | Pyramide · Kegel · Kugel · Zusammengesetzte Körper |
| 🆕 Potenzfunktionen | Graphen von $y = x^n$ · Verschieben und Strecken · Eigenschaften (Symmetrie, Verlauf) |
| 🆕 Stochastik | Bedingte Wahrscheinlichkeit · Baumdiagramm und Vierfeldertafel · Simulationen |

## Klasse 11 (EF)

| Thema | Unterthemen |
|---|---|
| 🆕 Funktionen | Ganzrationale Funktionen · Symmetrie und Verhalten im Unendlichen · Transformationen von Funktionsgraphen · Exponential- und Sinusfunktionen |
| 🆕 Einführung in die Differentialrechnung | Mittlere und momentane Änderungsrate · Ableitung als Tangentensteigung · Ableitungsregeln (Potenz-, Summen-, Faktorregel) · Ableitungsfunktion grafisch |
| 🆕 Funktionsuntersuchung (Einstieg) | Monotonie · Extrempunkte · Tangentengleichungen · Sachaufgaben |
| 🆕 Vektoren und Raum | Punkte im räumlichen Koordinatensystem · Vektoren · Rechnen mit Vektoren · Länge von Vektoren |
| 🆕 Stochastik | Mehrstufige Zufallsexperimente · Bedingte Wahrscheinlichkeit · Stochastische Unabhängigkeit |

## Klasse 12 (Q1)

| Thema | Unterthemen |
|---|---|
| 🆕 Funktionsuntersuchungen | Notwendige und hinreichende Bedingungen · Wendepunkte · Steckbriefaufgaben (Funktionen bestimmen) · Extremwertprobleme |
| 🆕 Integralrechnung | Rekonstruktion von Beständen · Stammfunktionen · Hauptsatz der Differential- und Integralrechnung · Flächen zwischen Graphen · Mittelwerte (LK: uneigentliche Integrale, Rotationskörper) |
| 🆕 Geraden und Ebenen | Geradengleichungen · Lagebeziehungen von Geraden · Ebenengleichungen · Lineare Gleichungssysteme (Gauß-Verfahren) |
| 🆕 Skalarprodukt | Orthogonalität · Winkel zwischen Vektoren · Normalenform (LK: Abstände) |

## Klasse 13 (Q2)

| Thema | Unterthemen |
|---|---|
| 🆕 Exponentialfunktionen und e | Natürliche Exponentialfunktion · Natürlicher Logarithmus · Produkt- und Kettenregel · Wachstumsmodelle (LK: Funktionenscharen, Quotientenregel) |
| 🆕 Lagebeziehungen und Abstände | Gerade und Ebene · Ebene und Ebene · Abstände (LK-Schwerpunkt) |
| 🆕 Zufallsgrößen und Verteilungen | Zufallsgröße, Erwartungswert, Standardabweichung · Bernoulli-Kette und Binomialverteilung · Sachaufgaben (LK: Normalverteilung, Hypothesentests) |

---

## Umfang

| Stufe | neue Themen | neue Unterthemen | Aufgaben (5 je Unterthema) |
|---|---|---|---|
| Kl. 5 | 7 | 31 | 155 |
| Kl. 6 | 7 | 27 | 135 |
| Kl. 7 | 6 | 28 | 140 |
| Kl. 8 | 4 | 14 | 70 |
| Kl. 9 | 3 | 11 | 55 |
| Kl. 10 | 6 | 23 | 115 |
| Kl. 11 | 5 | 19 | 95 |
| Kl. 12 | 4 | 16 | 80 |
| Kl. 13 | 3 | 10 | 50 |
| **Summe** | **45** | **179** | **≈ 895** |

## Vorgehen nach Freigabe
1. Umsetzungsplan (devflow-Planer) für die Technik: Themen ohne Pool, zweiter Lehrplan Sek II, Anzeige der Klassenstufen in der App.
2. Inhalte **je Klassenstufe ein PR** (`content/klasse-5`, …), Reihenfolge: 7 → 8 → 9 → 10 (Kernzielgruppe), dann 5 → 6, dann 11 → 13.
3. Je Unterthema 5 Aufgaben, gemischt nach Stufe (1–3) und Anforderungsart, mindestens eine Sachaufgabe. Jede Aufgabe mit Soll-Antwort, Lösungsschritten und ausführlicher Lösung. Rechenaufgaben bevorzugt über Vorlagen, damit die Zahlen gerechnet sind.
4. Je PR: `npm run seed:sql`, `npm run db:check`, alle CI-Prüfungen. Danach fachliche Freigabe durch Moritz.

## Akzeptanzkriterien für diese Liste
- [ ] Moritz hat die Themen und Unterthemen je Klasse geprüft und angepasst.
- [ ] Entscheidung zu „Prismen“ (Kl. 8 neu oder vorhandenes Kapitel).
- [ ] Geltende Fassung des KLP Sek II und die Abgrenzung GK/LK sind geklärt.
- [ ] Reihenfolge der Pakete ist bestätigt.
