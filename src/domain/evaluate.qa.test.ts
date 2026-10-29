/**
 * QA – fachliche Stichprobe und Schreibweisen (Tester).
 * 1) Erwartete Lösungen werden UNABHÄNGIG nachgerechnet (Math.*) und mit `exercise.answer` verglichen.
 * 2) Übliche Schülerschreibweisen gegen `evaluateAnswer`.
 * 3) Regressionstests für die behobenen Befunde BUG-01 … BUG-06 (Fix in c00f8c6, Re-Test durch Tester).
 * 4) Regressionslauf über ALLE Aufgaben: jede Aufgabe akzeptiert ihre eigene Soll-Antwort.
 * 5) Offene Befunde sind als `it.fails` mit Bug-ID markiert: Sie bleiben grün, solange der Fehler besteht,
 *    und schlagen an, sobald er behoben ist (dann `.fails` entfernen = Re-Test).
 */
import { describe, expect, it } from 'vitest';
import { topics } from '../content';
import type { Exercise } from '../types';
import { evaluateAnswer, evaluateHandwriting, parseNumber, parseNumberSet } from './evaluate';

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

// ------------------------------------------------------------------ 3) Regressionstests behobener Befunde
describe('Regressionstests: behobene Befunde BUG-01 … BUG-06', () => {
  // BUG-01 (behoben): Ursache war normalize('NFKC') VOR der Umwandlung von „²“ ⇒ „a² + b²“ wurde zu „a2+b2“ (rot).
  it('BUG-01 (Regression): „a² + b²“ (hochgestellt, iPad-Tastatur) wird als richtig erkannt', () => {
    expect(verdict('pyth-herleitung-3', 'a² + b²')).toBe('correct');
  });
  it('BUG-01 (Regression): „b²+a²“ wird als richtig erkannt', () => {
    expect(verdict('pyth-herleitung-3', 'b²+a²')).toBe('correct');
  });

  // BUG-02 (behoben): Ursache war, dass „±“ verworfen wurde ⇒ nur {7} ⇒ partial 0,5 und gespeicherter Versuch.
  it('BUG-02 (Regression): „±7“ für x² = 49 ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '±7')).toBe('correct');
  });
  it('BUG-02 (Regression): „x = ±7“ ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', 'x = ±7')).toBe('correct');
  });

  // BUG-03 (behoben): Ursache war, dass parseNumber alle Ziffern einer Eingabe zu einer Zahl zusammenklebte.
  it('BUG-03 (Regression): „c = √289 = 17“ ist richtig oder zumindest nicht falsch', () => {
    expect(verdict('pyth-hypotenuse-4', 'c = √289 = 17')).not.toBe('incorrect');
  });
  it('BUG-03 (Regression): „x1 = x2 = 5“ (doppelte Lösung) ist nicht falsch', () => {
    expect(verdict('quad-pq-formel-4', 'x1 = x2 = 5')).not.toBe('incorrect');
  });
  it('BUG-03 (Regression): „100 cm^2“ ist richtig (früher als 1002 gelesen)', () => {
    expect(verdict('pyth-grundlagen-3', '100 cm^2')).toBe('correct');
  });
  it('BUG-03 (Regression): „5/2“ wird nicht als 52 gelesen (Bruch ⇒ 2,5 oder unclear)', () => {
    expect(parseNumber('5/2')).not.toBe(52);
  });
  it('BUG-03 (Regression): „√65“ wird nicht als 65 gelesen', () => {
    expect(parseNumber('√65')).not.toBe(65);
  });

  // BUG-04 (behoben): deutscher Tausenderpunkt wurde als Dezimalpunkt gelesen.
  it('BUG-04 (Regression): „1.000“ ist 1000 (oder unclear), nicht 1', () => {
    expect(parseNumber('1.000')).not.toBe(1);
  });
  it('BUG-04 (Regression): „1.200 €“ ist 1200 (oder unclear), nicht 1,2', () => {
    expect(parseNumber('1.200 €')).not.toBe(1.2);
  });

  // BUG-05 (behoben): Gedankenstrich „–“ (U+2013) wurde entfernt ⇒ Vorzeichen ging verloren.
  it('BUG-05 (Regression): „7; –7“ (Halbgeviertstrich) ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '7; –7')).toBe('correct');
  });

  // BUG-06 (behoben): übliche Schreibweisen führten zu einer unnötigen gelben Rückfrage.
  it('BUG-06 (Regression): „x1=7, x2=-7“ (Komma als Trenner) ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', 'x1=7, x2=-7')).toBe('correct');
  });
  it('BUG-06 (Regression): „7, -7“ ist richtig', () => {
    expect(verdict('quad-reinquadratisch-1', '7, -7')).toBe('correct');
  });
  it('BUG-06 (Regression): „8,1 cm.“ (Satzpunkt am Ende) ist richtig', () => {
    expect(verdict('pyth-hypotenuse-3', '8,1 cm.')).toBe('correct');
  });
  it('BUG-06 (Regression): „ca. 8,1 cm“ ist richtig', () => {
    expect(verdict('pyth-hypotenuse-3', 'ca. 8,1 cm')).toBe('correct');
  });
  it('BUG-06 (Regression): „70,– €“ (Preisschreibweise) ist richtig', () => {
    expect(verdict('prozent-prozentwert-1', '70,– €')).toBe('correct');
  });

  // BUG-03 (Regression, Re-Test-Auftrag): Nicht eindeutige Eingaben ⇒ gelbe Rückfrage statt Rot/Grün.
  // Dass dabei KEIN Versuch gespeichert wird, prüft e2e/dod.spec.ts („BUG-03 (Regression): …“).
  it.each([
    ['pyth-hypotenuse-3', '√65'],
    ['pyth-hypotenuse-3', 'sqrt(65)'],
    ['pyth-hypotenuse-3', '5 oder 12'], // Aufgabe mit genau einer Zahl
    ['pyth-hypotenuse-4', '10^2'],
    ['pyth-hypotenuse-4', '10²'],
    ['pyth-hypotenuse-4', '2*5'],
  ])('BUG-03 (Regression): %s %j ⇒ unclear (gelb)', (id, raw) => {
    const r = evaluateAnswer(ex(id), raw);
    expect(r.verdict).toBe('unclear');
    expect(r.points).toBe(0);
    expect(r.marks.map((m) => m.color)).toEqual(['yellow']);
  });
  it('BUG-03 (Regression): Handschrift-Endergebnis „√65“ ⇒ unclear, keine zusätzliche Rechenweg-Markierung', () => {
    const hw = all.find((e) => e.type === 'handwriting' && e.answer.kind === 'numeric')!;
    const r = evaluateHandwriting(hw, '√65', true);
    expect(r.verdict).toBe('unclear');
    expect(r.marks).toHaveLength(1);
  });

  // Inhaltliche Beobachtungen (keine Bugs im Code, Entscheidung Redaktion/Req eng): heute als FALSCH gewertet.
  it.todo('INHALT: „Grundwert G“, „Seite c“, „Ja, es ist rechtwinklig“ – Antwortlisten (accepted) erweitern oder Freitext-Toleranz');
  it.todo('INHALT: pyth-gemischt-4 „x = 5 oder x = −12“ ⇒ 0 Punkte/rot; Teilpunkt + Hinweis „x > 0 beachten“ wäre didaktisch fairer');
  it.todo('INHALT: quad-pq-formel-4 „5; 5“ (doppelte Lösung zweimal genannt) ⇒ 0 Punkte/rot');
});

// ------------------------------------------------------------------ 4) Regressionslauf über alle Aufgaben
const de = (n: number) => String(n).replace('.', ',');

/** Alle Eingaben, die für eine Aufgabe aus ihrer eigenen Soll-Antwort folgen (Schülersicht). */
function ownAnswers(e: Exercise): string[] {
  const a = e.answer;
  switch (a.kind) {
    case 'choice':
      return [a.correct];
    case 'numeric': {
      const out = [String(a.value), de(a.value)];
      if (a.unit) out.push(`${de(a.value)} ${a.unit}`, `${de(a.value)}${a.unit}`);
      return out;
    }
    case 'numeric-set': {
      if (a.values.length === 0) return ['keine Lösung', 'L = {}'];
      const out = [a.values.map(de).join('; '), a.values.map(String).join('; '), `L = {${a.values.map(de).join('; ')}}`];
      out.push(a.values.map((v) => `x = ${de(v)}`).join(' oder '));
      out.push([...a.values].reverse().map(de).join('; ')); // Reihenfolge egal
      return out;
    }
    case 'text':
      return [...a.accepted, ...a.accepted.map((s) => s.toUpperCase()), ...a.accepted.map((s) => ` ${s} `)];
  }
}

describe('Regression neuer Parser: jede Aufgabe akzeptiert ihre eigene Soll-Antwort', () => {
  it('Inhaltsbasis hat 55 Aufgaben (sonst Testumfang prüfen)', () => {
    expect(all).toHaveLength(55);
  });

  const cases = all.flatMap((e) => ownAnswers(e).map((raw) => [e.id, e.answer.kind, raw] as const));
  it.each(cases)('%s (%s): %j ⇒ correct', (id, _kind, raw) => {
    const r = evaluateAnswer(ex(id), raw);
    expect(r.verdict).toBe('correct');
    expect(r.points).toBe(1);
  });

  it('Handschrift-Aufgaben: eigenes Endergebnis ⇒ correct + gelbe Rechenweg-Markierung (nie nur grün)', () => {
    const hw = all.filter((e) => e.type === 'handwriting');
    expect(hw.length).toBeGreaterThan(0);
    for (const e of hw) {
      const r = evaluateHandwriting(e, ownAnswers(e)[0], true);
      expect(r.verdict, e.id).toBe('correct');
      expect(r.marks.some((m) => m.color === 'yellow'), e.id).toBe(true);
    }
  });

  it('Typische Fehler (commonMistakes.answers) werden nie als richtig gewertet', () => {
    const wrongCorrect: string[] = [];
    for (const e of all)
      for (const m of e.commonMistakes)
        for (const raw of m.answers ?? []) if (evaluateAnswer(e, raw).verdict === 'correct') wrongCorrect.push(`${e.id}: ${raw}`);
    expect(wrongCorrect).toEqual([]);
  });

  it.each([
    ['8,1', 8.1],
    ['8.1', 8.1],
    [' 8 , 1 ', 8.1],
    ['0,5', 0.5],
    ['0.5', 0.5],
    ['0.125', 0.125],
    ['0,125', 0.125],
    ['12,50 €', 12.5],
    ['12.50 €', 12.5],
    ['-8,1', -8.1],
    ['−8,1', -8.1],
    ['1.200,50 €', 1200.5], // eindeutig (Tausenderpunkt + Dezimalkomma); „1.000“ allein ⇒ siehe ENTSCHEIDUNG unten
  ])('Dezimal-/Tausenderfall %j ⇒ %d', (raw, n) => {
    expect(parseNumber(raw)).toBeCloseTo(n, 9);
  });
});

// ------------------------------------------------------------------ 5) Offene Befunde aus dem Re-Test
describe('Offene Befunde (Re-Test c00f8c6)', () => {
  // BUG-10 (Major): parseNumber wertet nur den Teil nach dem LETZTEN „=“. Enthält die Eingabe mehrere Werte
  // („oder“, „und“, „;“, Komma-Liste), entscheidet die Reihenfolge über Grün/Rot, statt gelb nachzufragen (Konzept §9).
  // evaluate.ts parseNumber: `s.split(/[=≈~]/).pop()` vor der Prüfung auf mehrere Zahlengruppen.
  it('BUG-10: „c = 15 oder c = 17“ (Soll 17) ist nicht grün, sondern unclear', () => {
    expect(verdict('pyth-hypotenuse-4', 'c = 15 oder c = 17')).toBe('unclear');
  });
  it('BUG-10: „c = 17 oder c = 15“ (Soll 17) ist nicht rot, sondern unclear', () => {
    expect(verdict('pyth-hypotenuse-4', 'c = 17 oder c = 15')).toBe('unclear');
  });
  it('BUG-10: „c = 17, a = 8“ (Soll c = 17) ist nicht rot, sondern unclear', () => {
    expect(verdict('pyth-hypotenuse-4', 'c = 17, a = 8')).toBe('unclear');
  });
  it('BUG-10: parseNumber(„x = 5 oder x = 12“) ist null (mehrdeutig), nicht 12', () => {
    expect(parseNumber('x = 5 oder x = 12')).toBeNull();
  });
  it('BUG-10 Abgrenzung: Gleichungskette „c = √289 = 17“ bleibt eindeutig 17', () => {
    expect(parseNumber('c = √289 = 17')).toBe(17);
  });

  // BUG-11 (Minor): Eine Eingabe nur aus Trennern („;“, „und“) wird als LEERE Lösungsmenge gelesen ⇒ rot + gespeicherter Versuch.
  // Erwartet: unclear (keine Zahl erkannt). „L = {}“ / „keine Lösung“ bleiben gültige Antworten.
  it('BUG-11: „;“ bei x² = 49 ⇒ unclear statt incorrect', () => {
    expect(verdict('quad-reinquadratisch-1', ';')).toBe('unclear');
  });
  it('BUG-11: „und“ bei x² = 49 ⇒ unclear statt incorrect', () => {
    expect(verdict('quad-reinquadratisch-1', 'und')).toBe('unclear');
  });
  it('BUG-11 Abgrenzung: „keine Lösung“ und „L = {}“ sind bewusst die leere Menge', () => {
    expect(parseNumberSet('keine Lösung')).toEqual([]);
    expect(parseNumberSet('L = {}')).toEqual([]);
  });

  // ENTSCHEIDUNG (vorläufig, Koordination nach Empfehlung Tester; Auftraggeber kann ändern):
  // Genau EIN Punkt mit genau drei Ziffern und ohne Komma (1.125, 12.500, 1.000) ⇒ gelbe Rückfrage.
  // Umsetzung: evaluate.ts `SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS`.
  it.each(['1.125', '12.500', '1.000', '1.000 €', '1.125 cm', '-1.125', 'c = 1.125'])(
    'ENTSCHEIDUNG 1.125: parseNumber(%j) ist null (mehrdeutig)',
    (raw) => {
      expect(parseNumber(raw)).toBeNull();
    },
  );
  it.each<[string, number]>([
    ['1.000.000', 1000000],
    ['1.200,50', 1200.5],
    ['1.200,50 €', 1200.5],
    ['0.125', 0.125],
    ['8.1', 8.1],
    ['12.50', 12.5],
    ['1,125', 1.125],
  ])('ENTSCHEIDUNG 1.125: eindeutige Form %j ⇒ %d', (raw, n) => {
    expect(parseNumber(raw)).toBeCloseTo(n, 9);
  });
  it('ENTSCHEIDUNG 1.125: Aufgabe mit genau einer Zahl ⇒ unclear (gelb), nicht rot', () => {
    expect(verdict('pyth-hypotenuse-4', '1.125')).toBe('unclear');
  });
});
