/** Entwickler-Tests für den Antwort-Parser (BUG-01 … BUG-06, BUG-10 … BUG-14, Entscheidung 1.125). Ergänzen evaluate.qa.test.ts (Tester). */
import { describe, expect, it } from 'vitest';
import { normalizeText, parseNumber, parseNumberSet } from './evaluate';

describe('normalizeText: Hochzahlen und Striche (BUG-01, BUG-05)', () => {
  it.each([
    ['a² + b²', 'a^2+b^2'],
    ['x³', 'x^3'],
    ['10¹²', '10^12'],
    ['x⁻¹', 'x^-1'],
    ['a^2 + b^2', 'a^2+b^2'],
    ['x₁', 'x1'],
    ['a – b', 'a-b'],
    ['a − b', 'a-b'],
  ])('%j → %j', (raw, expected) => expect(normalizeText(raw)).toBe(expected));
});

describe('parseNumber', () => {
  it.each<[string, number]>([
    ['c = √289 = 17', 17],
    ['x1 = x2 = 5', 5],
    ['100 cm^2', 100],
    ['100 cm²', 100],
    ['8 m³', 8],
    ['5/2', 2.5],
    ['-3/4', -0.75],
    ['1.000.000', 1000000], // mehrere Punktgruppen ⇒ eindeutig deutsch
    ['1.200,5 €', 1200.5], // Punkt + Komma ⇒ eindeutig deutsch
    ['1.234.567,5', 1234567.5],
    ['1000.125', 1000.125], // vier Ziffern vor dem Punkt ⇒ kein Tausenderpunkt
    // BUG-10: Gleichungskette ohne Listentrenner bleibt eindeutig
    ['c = 17', 17],
    ['x1 = x2 = 5 cm', 5],
    [' 8 , 1 ', 8.1],
    ['3,5', 3.5],
    ['3, 5', 3.5], // Einzelzahl: Komma + Leerzeichen + Ziffer bleibt Dezimalkomma
    ['70,– €', 70],
    // Punkt 4: Einheiten bleiben Einheiten
    ['8,1cm', 8.1],
    ['85%', 85],
    ['70€', 70],
    ['6 m', 6],
    ['6m', 6],
    ['5 kg', 5],
    ['2 l', 2],
    ['85 Prozent', 85],
    ['0.125', 0.125], // führende 0 ⇒ kein Tausenderpunkt
    ['–7', -7],
    ['- 7', -7],
    ['8,1 cm.', 8.1],
    ['ca. 8,1 cm', 8.1],
    ['etwa 8,1', 8.1],
    ['70,– €', 70],
    ['70,-', 70],
    ['90°', 90],
    ['c ≈ 8,1 cm', 8.1],
  ])('%j → %d', (raw, expected) => expect(parseNumber(raw)).toBeCloseTo(expected, 10));

  it.each([
    '√65', // Wurzel nicht ausgerechnet
    'sqrt(65)',
    '5 2', // zwei Zahlengruppen
    '5 oder 12',
    '10^2',
    '1,234.5', // Trenner gemischt
    '5/0',
    '2*3',
    'acht',
    'x =',
    '',
    // BUG-10: mehrere Werte ⇒ mehrdeutig, unabhängig von der Reihenfolge
    'c = 15 oder c = 17',
    'c = 17 oder c = 15',
    'c = 17, a = 8',
    'x = 5 oder x = 12',
    'x = 5 und x = 12',
    'c = 17; 15',
    'c = 17\nc = 15',
    '7, -7',
    'c = 17,a = 8',
    // Entscheidung 1.125
    '1.125',
    '12.500',
    '1.000',
    '1.200 €',
    // Punkt 4: Variable direkt an Ziffer ist ein Term
    '2x',
    'x5',
    '5x^2',
    '5x²',
    '-3a',
  ])('%j → null (gelbe Rückfrage statt geraten)', (raw) => expect(parseNumber(raw)).toBeNull());
});

describe('parseNumberSet', () => {
  it.each<[string, number[]]>([
    ['±7', [7, -7]],
    ['x = ±7', [7, -7]],
    ['x = +-7', [7, -7]],
    ['x = 2 ± 3', [5, -1]],
    ['x1=7, x2=-7', [7, -7]],
    ['7, -7', [7, -7]],
    ['3, 5', [3, 5]],
    ['7,-7', [7, -7]],
    ['7; –7', [7, -7]],
    ['x1 = x2 = 5', [5]],
    ['8,1; 2', [8.1, 2]], // Dezimalkomma zwischen Ziffern bleibt erhalten
    ['L = {}', []],
    // BUG-11: bewusst leere Menge bleibt []
    ['{}', []],
    ['L = { }', []],
    ['L = ∅', []],
    ['∅', []],
    ['keine Lösung', []],
    ['Keine', []],
    // BUG-10 betrifft Lösungsmengen nicht: Listen bleiben Listen
    ['x = 5 oder x = 12', [5, 12]],
    ['x1 = 1.5; x2 = 2', [1.5, 2]],
  ])('%j → %j', (raw, expected) => expect(parseNumberSet(raw)).toEqual(expected));

  it.each([
    '±',
    'x = ±√5',
    '7; sieben',
    // BUG-11: nur Trenner ⇒ keine Zahl erkannt
    ';',
    ';;',
    'und',
    'oder',
    ',',
    ' ; und ; ',
    '',
    'L =',
    // Entscheidung 1.125 gilt auch in Mengen
    '1.125; 2',
  ])('%j → null', (raw) => expect(parseNumberSet(raw)).toBeNull());
});

describe('BUG-12/13: mehrere Aussagen am Aufbau erkennen', () => {
  it.each([
    // Einzelzahl: zwei Aussagen ⇒ null, egal welche Reihenfolge oder welcher Trenner
    'c = 15 bzw. c = 17',
    'c = 17 bzw. c = 15',
    'c = 15 / c = 17',
    'c = 15 sowie c = 17',
    'c = 15 c = 17',
    'c=15 c=17',
    'c=15|c=17',
    'c = 15 & c = 17',
    'c = 15 → c = 17',
    'x = 3 x2 = 5',
    'A = 100 cm^2 = 1 dm^2', // Einheitenumrechnung in der Kette: bewusst Rückfrage
    'c = 17 cm = 0,17 m',
    // BUG-13: „bzw.“ klebt keine Zahlen mehr zusammen
    '15 bzw. 17',
    '15 bzw 17',
    // Potenz am Ende der Kette bleibt Rückfrage
    'c² = 289 = 17^2',
  ])('parseNumber(%j) → null', (raw) => expect(parseNumber(raw)).toBeNull());

  it.each<[string, number]>([
    // Gleichungsketten bleiben eindeutig
    ['c = √289 = 17', 17],
    ['c = √(64+225) = 17', 17],
    ['c = sqrt(289) = 17', 17],
    ['x1 = x2 = 5', 5],
    ['x₁ = x₂ = 5', 5],
    ['x_1 = x_2 = 5', 5],
    ['c = 30/2 = 15', 15],
    ['c ≈ 8,06 ≈ 8,1', 8.1],
    ['c = 17', 17],
    ['c=17 cm', 17],
    ['p = 85 %', 85],
    ['8,1 cm', 8.1],
  ])('parseNumber(%j) → %d', (raw, n) => expect(parseNumber(raw)).toBeCloseTo(n, 9));

  it.each<[string, number[]]>([
    // Lösungsmengen: neue Aussage „<Variable>(Index) =“ nach einem Wert trennt
    ['x1=7 x2=-7', [7, -7]],
    ['x1 = 7 x2 = -7', [7, -7]],
    ['x₁=7 x₂=-7', [7, -7]],
    ['x_1 = 7 x_2 = -7', [7, -7]],
    ['x = 7 x = -7', [7, -7]],
    ['x1 = 7 bzw. x2 = -7', [7, -7]],
    ['7 bzw. -7', [7, -7]],
    ['x = 7 sowie x = -7', [7, -7]], // Füllwort vor neuer Aussage wird wie eine Einheit entfernt
    // Ketten werden nicht zerteilt
    ['x1 = x2 = 5', [5]],
    ['x1 = 7; x2 = -7', [7, -7]],
    ['x_1 = 7; x_2 = -7', [7, -7]],
    ['x = ±7', [7, -7]],
  ])('parseNumberSet(%j) → %j', (raw, expected) => expect(parseNumberSet(raw)).toEqual(expected));

  it.each(['x = 7 / x = -7', 'x=7|x=-7', 'x = 7 & x = -7'])(
    'parseNumberSet(%j) → null (Aussagen ohne bekannten Trenner ⇒ Rückfrage statt „letztes = gewinnt“)',
    (raw) => expect(parseNumberSet(raw)).toBeNull(),
  );
});

describe('BUG-14: Beschriftung mit Doppelpunkt vor der Antwort', () => {
  it.each<[string, number]>([
    ['Ergebnis: 17 cm', 17],
    ['Ergebnis:17cm', 17],
    ['Antwort: 17', 17],
    ['Lösung: 17', 17],
    ['LÖSUNG : 17', 17],
    ['c: 17', 17],
    ['c : 17 cm', 17],
    ['Ergebnis: 85 %', 85],
    ['Ergebnis: c = 17 cm', 17],
    ['Antwort: c = √289 = 17', 17],
    ['  Ergebnis:   8,1 cm.', 8.1],
    ['Ergebnis: ca. 8,1 cm', 8.1],
    ['Lösung: 1.200,50 €', 1200.5],
    ['34 : 40 = 0,85 = 85 %', 85],
    ['Ergebnis: 34 : 40 = 0,85', 0.85],
  ])('parseNumber(%j) → %d', (raw, expected) => expect(parseNumber(raw)).toBeCloseTo(expected, 9));

  it.each([
    '34 : 40', // echte Division ohne Ergebnis
    '34:40',
    'Ergebnis: 34 : 40',
    'Ergebnis:', // nur Beschriftung
    'Ergebnis: 1.125', // Entscheidung 1.125 gilt auch nach Beschriftung
    'Ergebnis: 2x', // Variable an Ziffer
    'Ergebnis: √65',
    'Ergebnis: c = 15 oder c = 17', // BUG-10
    'Ergebnis: c = 15 bzw. c = 17', // BUG-12
    'Ergebnis: 15 bzw. 17', // BUG-13
  ])('parseNumber(%j) → null', (raw) => expect(parseNumber(raw)).toBeNull());

  it.each<[string, number[]]>([
    ['Lösung: 7; -7', [7, -7]],
    ['Lösung: x1 = 7; x2 = -7', [7, -7]],
    ['Antwort: x = ±7', [7, -7]],
    ['L: {7; -7}', [7, -7]],
    ['Lösung: L = {7; -7}', [7, -7]],
    ['Lösung: keine Lösung', []],
    ['Lösung: {}', []],
  ])('parseNumberSet(%j) → %j', (raw, expected) => expect(parseNumberSet(raw)).toEqual(expected));

  it.each(['Lösung:', 'Lösung: ;', 'Lösung: x = 7 / x = -7'])('parseNumberSet(%j) → null', (raw) =>
    expect(parseNumberSet(raw)).toBeNull(),
  );
});
