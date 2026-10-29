/** Entwickler-Tests für den Antwort-Parser (BUG-01 … BUG-06). Ergänzen evaluate.qa.test.ts (Tester). */
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
    ['1.000', 1000],
    ['1.200 €', 1200],
    ['1.234.567,5', 1234567.5],
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
  ])('%j → %j', (raw, expected) => expect(parseNumberSet(raw)).toEqual(expected));

  it.each(['±', 'x = ±√5', '7; sieben'])('%j → null', (raw) => expect(parseNumberSet(raw)).toBeNull());
});
