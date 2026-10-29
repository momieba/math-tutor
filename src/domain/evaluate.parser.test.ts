/** Entwickler-Tests für den Antwort-Parser (BUG-01 … BUG-06, BUG-10, BUG-11, Entscheidung 1.125). Ergänzen evaluate.qa.test.ts (Tester). */
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
