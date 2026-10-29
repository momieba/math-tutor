/**
 * QA – fachliche Stichprobe und Schreibweisen (Tester).
 * 1) Erwartete Lösungen werden UNABHÄNGIG nachgerechnet (Math.*) und mit `exercise.answer` verglichen.
 * 2) Übliche Schülerschreibweisen gegen `evaluateAnswer`.
 * Bekannte Abweichungen sind als `it.fails` mit Bug-ID markiert: Sie bleiben grün, solange der Fehler besteht,
 * und schlagen an, sobald er behoben ist (dann `.fails` entfernen = Re-Test).
 */
import { describe, expect, it } from 'vitest';
import { topics } from '../content';
import type { Exercise } from '../types';
import { evaluateAnswer, parseNumber } from './evaluate';

const all = topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises));
const ex = (id: string): Exercise => {
  const e = all.find((x) => x.id === id);
  if (!e) throw new Error(`Aufgabe ${id} fehlt`);
  return e;
};
const verdict = (id: string, raw: string) => evaluateAnswer(ex(id), raw).verdict;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Lösungsmenge einer quadratischen Gleichung ax² + bx + c = 0 (reell, aufsteigend). */
function solveQuadratic(a: number, b: number, c: number): number[] {
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  if (d === 0) return [-b / (2 * a)];
  return [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort((x, y) => x - y);
}
const sorted = (v: number[]) => [...v].sort((x, y) => x - y);

// ------------------------------------------------------------------ 1) Nachrechnen
describe('Fachliche Stichprobe: erwartete Lösungen stimmen', () => {
  const numeric: [id: string, expected: number, rechnung: string][] = [
    ['pyth-hypotenuse-1', Math.hypot(9, 12), 'c = √(9² + 12²) = √225 = 15'],
    ['pyth-hypotenuse-3', round1(Math.hypot(4, 7)), 'c = √65 ≈ 8,06 → 8,1'],
    ['pyth-hypotenuse-4', Math.hypot(8, 15), 'c = √(64 + 225) = √289 = 17'],
    ['pyth-kathete-3', round1(Math.sqrt(9 ** 2 - 5 ** 2)), 'a = √(81 − 25) = √56 ≈ 7,48 → 7,5'],
    ['pyth-kathete-4', 7 + Math.sqrt(25 ** 2 - 7 ** 2) + 25, 'b = √576 = 24; U = 7 + 24 + 25 = 56'],
    ['pyth-anwendung-2', Math.sqrt(6.5 ** 2 - 2.5 ** 2), 'h = √(42,25 − 6,25) = √36 = 6'],
    ['pyth-gemischt-2', round1(Math.sqrt(6 ** 2 - 3 ** 2)), 'h = √27 ≈ 5,196 → 5,2'],
    ['pyth-gemischt-5', Math.sqrt(3 ** 2 + 4 ** 2 + 12 ** 2), 'd = √(9 + 16 + 144) = √169 = 13'],
    ['pyth-umkehrung-3', 20 ** 2 + 21 ** 2, '400 + 441 = 841 = 29²'],
    ['prozent-prozentwert-3', 60 * (1 - 0.3), '60 € · 0,7 = 42 €'],
    ['prozent-satz-grundwert-2', 14 / 0.2, 'G = 14 € : 0,2 = 70 €'],
    ['prozent-satz-grundwert-3', 45 / 0.75, 'G = 45 € : 0,75 = 60 €'],
    ['prozent-satz-grundwert-1', (34 / 40) * 100, 'p = 34 : 40 = 0,85 = 85 %'],
  ];
  it.each(numeric)('%s = %d  (%s)', (id, expected) => {
    const a = ex(id).answer;
    expect(a.kind).toBe('numeric');
    if (a.kind !== 'numeric') return;
    expect(Math.abs(a.value - expected)).toBeLessThanOrEqual(a.tolerance + 1e-9);
    expect(evaluateAnswer(ex(id), String(expected).replace('.', ',')).verdict).toBe('correct');
  });

  const sets: [id: string, coeffs: [number, number, number], rechnung: string][] = [
    ['quad-reinquadratisch-1', [1, 0, -49], 'x² = 49 ⇒ x = ±7'],
    ['quad-reinquadratisch-4', [1, -4, -12], '(x − 2)² = 16 ⇒ x − 2 = ±4 ⇒ 6; −2'],
    ['quad-nullprodukt-4', [2, -8, 0], '2x(x − 4) = 0 ⇒ 0; 4'],
    ['quad-pq-formel-1', [1, 2, -15], 'p = 2, q = −15 ⇒ −1 ± 4 ⇒ 3; −5'],
    ['quad-pq-formel-3', [2, -4, -6], ':2 ⇒ x² − 2x − 3 = 0 ⇒ 3; −1'],
    ['quad-pq-formel-4', [1, -10, 25], '(x − 5)² = 0 ⇒ doppelte Lösung 5'],
  ];
  it.each(sets)('%s  (%s)', (id, [a, b, c]) => {
    const ans = ex(id).answer;
    expect(ans.kind).toBe('numeric-set');
    if (ans.kind !== 'numeric-set') return;
    expect(sorted(ans.values)).toEqual(solveQuadratic(a, b, c));
  });

  it('pyth-gemischt-4: x² + (x + 7)² = 13² ⇒ x² + 7x − 60 = 0 ⇒ x = 5 (x > 0)', () => {
    const ans = ex('pyth-gemischt-4').answer;
    const positive = solveQuadratic(1, 7, -60).filter((x) => x > 0);
    expect(ans.kind === 'numeric-set' && ans.values).toEqual(positive);
  });

  it('jede Aufgabe: Musterlösung hat Schritte und finalAnswer', () => {
    for (const e of all) {
      expect(e.solution.steps.length, e.id).toBeGreaterThan(0);
      expect(e.solution.finalAnswer.trim(), e.id).not.toBe('');
    }
  });
});

// ------------------------------------------------------------------ 2) Schreibweisen
describe('Schreibweisen, die akzeptiert werden (Ist = Soll)', () => {
  const ok: [id: string, raw: string][] = [
    ['pyth-hypotenuse-3', '8,1'],
    ['pyth-hypotenuse-3', '8.1'],
    ['pyth-hypotenuse-3', '8,1 cm'],
    ['pyth-hypotenuse-3', '8,1cm'],
    ['pyth-hypotenuse-3', ' 8 , 1 '],
    ['pyth-hypotenuse-3', '≈ 8,1'],
    ['pyth-hypotenuse-3', '8,06'], // innerhalb der Toleranz 0,05
    ['pyth-hypotenuse-4', 'c = 17 cm'],
    ['pyth-hypotenuse-4', 'c=17'],
    ['pyth-grundlagen-3', '100 cm²'],
    ['prozent-satz-grundwert-1', '85 %'],
    ['prozent-satz-grundwert-1', '85%'],
    ['prozent-satz-grundwert-1', '85 Prozent'],
    ['prozent-satz-grundwert-1', 'p = 85 %'],
    ['prozent-prozentwert-1', '70 €'],
    ['prozent-prozentwert-1', '70,00 €'],
    ['prozent-prozentwert-1', '€ 70'],
    ['prozent-grundbegriffe-2', '0,35'],
    ['prozent-grundbegriffe-2', ',35'],
    ['prozent-grundbegriffe-3', 'Grundwert'],
    ['prozent-grundbegriffe-3', 'der Grundwert'],
    ['pyth-grundlagen-4', 'PR'],
    ['pyth-grundlagen-4', 'rp'],
    ['pyth-umkehrung-4', 'Ja.'],
    ['pyth-herleitung-3', 'a^2+b^2'],
    ['pyth-herleitung-3', 'b^2 + a^2'],
    ['quad-reinquadratisch-1', '7; -7'],
    ['quad-reinquadratisch-1', '-7;7'],
    ['quad-reinquadratisch-1', 'x=7 oder x=-7'],
    ['quad-reinquadratisch-1', '7 und -7'],
    ['quad-reinquadratisch-1', 'x1=7; x2=-7'],
    ['quad-reinquadratisch-1', 'x₁ = 7; x₂ = −7'], // Unicode-Minus + tiefgestellte Indizes
    ['quad-reinquadratisch-1', 'L = {7; -7}'],
    ['quad-reinquadratisch-1', '7\n-7'],
    ['quad-pq-formel-4', '5'],
    ['pyth-gemischt-4', 'x = 5'],
  ];
  it.each(ok)('%s: %j → correct', (id, raw) => expect(verdict(id, raw)).toBe('correct'));

  const wrong: [id: string, raw: string][] = [
    ['pyth-hypotenuse-3', '8'],
    ['pyth-hypotenuse-1', '21'], // Seiten addiert statt quadriert
    ['quad-reinquadratisch-1', '7'], // eine Lösung fehlt ⇒ teilweise
    ['prozent-grundbegriffe-2', '35'],
  ];
  it.each(wrong)('%s: %j → nicht correct', (id, raw) => expect(verdict(id, raw)).not.toBe('correct'));

  it('nicht lesbare Eingabe ⇒ unclear (gelbe Rückfrage) statt falsch', () => {
    expect(verdict('pyth-hypotenuse-3', 'acht komma eins')).toBe('unclear');
    expect(verdict('pyth-hypotenuse-3', '   ')).toBe('unclear');
    expect(verdict('quad-reinquadratisch-1', 'sieben')).toBe('unclear');
  });

  it('fehlende zweite Lösung ⇒ partial 0,5 (Teilpunkte)', () => {
    const r = evaluateAnswer(ex('quad-reinquadratisch-1'), '7');
    expect(r.verdict).toBe('partial');
    expect(r.points).toBe(0.5);
  });
});

// ------------------------------------------------------------------ 3) Befunde
describe('Befunde (bekannte Abweichungen)', () => {
  // BUG-01 (Major): normalizeText ruft normalize('NFKC') VOR replace(/²/) auf. NFKC macht aus „²“ eine „2“,
  // dadurch wird „a² + b²“ zu „a2+b2“ und als FALSCH (rot) gewertet. evaluate.ts Z. 20–21.
  it.fails('BUG-01: „a² + b²“ (hochgestellt, iPad-Tastatur) wird als richtig erkannt', () => {
    expect(verdict('pyth-herleitung-3', 'a² + b²')).toBe('correct');
  });
  it.fails('BUG-01: „b²+a²“ wird als richtig erkannt', () => {
    expect(verdict('pyth-herleitung-3', 'b²+a²')).toBe('correct');
  });

  // BUG-02 (Major): „±“ wird verworfen ⇒ nur {7} ⇒ partial 0,5 und als Versuch gespeichert. evaluate.ts parseNumberSet Z. 41–47.
  it.fails('BUG-02: „±7“ für x² = 49 ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '±7')).toBe('correct');
  });
  it.fails('BUG-02: „x = ±7“ ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', 'x = ±7')).toBe('correct');
  });

  // BUG-03 (Major): parseNumber entfernt alle Nicht-Ziffern und klebt alle Ziffern zusammen (Z. 28–37).
  // Korrekte Antworten mit Zwischenschritt, mehreren Gleichheitszeichen oder Hochzahl werden ROT.
  it.fails('BUG-03: „c = √289 = 17“ ist richtig oder zumindest nicht falsch', () => {
    expect(verdict('pyth-hypotenuse-4', 'c = √289 = 17')).not.toBe('incorrect');
  });
  it.fails('BUG-03: „x1 = x2 = 5“ (doppelte Lösung) ist nicht falsch', () => {
    expect(verdict('quad-pq-formel-4', 'x1 = x2 = 5')).not.toBe('incorrect');
  });
  it.fails('BUG-03: „100 cm^2“ ist richtig (wird als 1002 gelesen)', () => {
    expect(verdict('pyth-grundlagen-3', '100 cm^2')).toBe('correct');
  });
  it.fails('BUG-03: „5/2“ wird nicht als 52 gelesen (Bruch ⇒ 2,5 oder unclear)', () => {
    expect(parseNumber('5/2')).not.toBe(52);
  });
  it.fails('BUG-03: „√65“ wird nicht als 65 gelesen', () => {
    expect(parseNumber('√65')).not.toBe(65);
  });

  // BUG-04 (Minor, latent): deutscher Tausenderpunkt. Aktuell keine Aufgabe ≥ 1000, ab neuen Prozentaufgaben relevant.
  it.fails('BUG-04: „1.000“ ist 1000 (oder unclear), nicht 1', () => {
    expect(parseNumber('1.000')).not.toBe(1);
  });
  it.fails('BUG-04: „1.200 €“ ist 1200 (oder unclear), nicht 1,2', () => {
    expect(parseNumber('1.200 €')).not.toBe(1.2);
  });

  // BUG-05 (Minor): Gedankenstrich „–“ (U+2013, Autokorrektur/Kopieren) wird entfernt ⇒ Vorzeichen geht verloren ⇒ ROT.
  it.fails('BUG-05: „7; –7“ (Halbgeviertstrich) ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '7; –7')).toBe('correct');
  });

  // BUG-06 (Minor): sichere Rückfrage (gelb, kein Versuch gespeichert), aber übliche Schreibweisen werden nicht verstanden.
  it.fails('BUG-06: „x1=7, x2=-7“ (Komma als Trenner) ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', 'x1=7, x2=-7')).toBe('correct');
  });
  it.fails('BUG-06: „7, -7“ ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '7, -7')).toBe('correct');
  });
  it.fails('BUG-06: „8,1 cm.“ (Satzpunkt am Ende) ist richtig', () => {
    expect(verdict('pyth-hypotenuse-3', '8,1 cm.')).toBe('correct');
  });
  it.fails('BUG-06: „ca. 8,1 cm“ ist richtig', () => {
    expect(verdict('pyth-hypotenuse-3', 'ca. 8,1 cm')).toBe('correct');
  });
  it.fails('BUG-06: „70,– €“ (Preisschreibweise) ist richtig', () => {
    expect(verdict('prozent-prozentwert-1', '70,– €')).toBe('correct');
  });

  // Inhaltliche Beobachtungen (keine Bugs im Code, Entscheidung Redaktion/Req eng): heute als FALSCH gewertet.
  it.todo('INHALT: „Grundwert G“, „Seite c“, „Ja, es ist rechtwinklig“ – Antwortlisten (accepted) erweitern oder Freitext-Toleranz');
  it.todo('INHALT: pyth-gemischt-4 „x = 5 oder x = −12“ ⇒ 0 Punkte/rot; Teilpunkt + Hinweis „x > 0 beachten“ wäre didaktisch fairer');
  it.todo('INHALT: quad-pq-formel-4 „5; 5“ (doppelte Lösung zweimal genannt) ⇒ 0 Punkte/rot');
});
