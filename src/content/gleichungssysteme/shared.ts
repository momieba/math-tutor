import type { AuthoredExercise, CommonMistake, Difficulty, SolutionStep } from '../../types';
import { fromTemplate, linearTerm, num, type Rng, signedTerm, twoVarTerm } from '../templates';

export const TOPIC_ID = 'lineare-gleichungssysteme';

/** a₁x + b₁y = c₁, a₂x + b₂y = c₂ */
export interface System {
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
}

/** Gleichungssystem als KaTeX (mit römischer Nummerierung). */
export function sysLatex(s: System): string {
  return `\\begin{aligned} \\text{I:}\\;\\; & ${twoVarTerm(s.a1, s.b1)} = ${num(s.c1)} \\\\ \\text{II:}\\;\\; & ${twoVarTerm(s.a2, s.b2)} = ${num(s.c2)} \\end{aligned}`;
}

/** Gleichung in Normalform als KaTeX. */
export const eq = (a: number, b: number, c: number) => `${twoVarTerm(a, b)} = ${num(c)}`;

/** System mit gegebener ganzzahliger Lösung (x0|y0) aus Koeffizienten. */
export function systemFor(x0: number, y0: number, a1: number, b1: number, a2: number, b2: number): System {
  return { a1, b1, c1: a1 * x0 + b1 * y0, a2, b2, c2: a2 * x0 + b2 * y0 };
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

/**
 * Lösungsweg mit dem Additionsverfahren (y wird eliminiert). Multipliziert nur, wenn nötig,
 * und addiert bzw. subtrahiert je nach Vorzeichen der y-Koeffizienten.
 */
export function additionSteps(s: System, x0: number, y0: number): SolutionStep[] {
  const l = lcm(s.b1, s.b2);
  const f1 = l / Math.abs(s.b1);
  const f2 = l / Math.abs(s.b2);
  const add = Math.sign(s.b1) !== Math.sign(s.b2);
  const A = f1 * s.a1 + (add ? 1 : -1) * f2 * s.a2;
  const C = f1 * s.c1 + (add ? 1 : -1) * f2 * s.c2;
  const steps: SolutionStep[] = [];
  if (f1 !== 1 || f2 !== 1) {
    steps.push({
      text: `Gleichungen so multiplizieren, dass vor $y$ gleich große Zahlen stehen${f1 !== 1 ? ` (I · ${f1})` : ''}${f2 !== 1 ? ` (II · ${f2})` : ''}:`,
      math: `\\begin{aligned} & ${eq(f1 * s.a1, f1 * s.b1, f1 * s.c1)} \\\\ & ${eq(f2 * s.a2, f2 * s.b2, f2 * s.c2)} \\end{aligned}`,
    });
  }
  steps.push({ text: add ? 'Gleichungen addieren – $y$ fällt weg:' : 'Gleichung II von I abziehen – $y$ fällt weg:', math: `${linearTerm(A, 0)} = ${num(C)}` });
  steps.push({ text: 'Nach $x$ auflösen:', math: `x = ${num(x0)}` });
  steps.push({ text: '$x$ in Gleichung I einsetzen:', math: `${num(s.a1 * x0)} ${signedTerm(s.b1, 'y')} = ${num(s.c1)} \\;\\Rightarrow\\; y = ${num(y0)}` });
  return steps;
}

/** Lösungsweg mit dem Einsetzungsverfahren für I: y = mx + n und II: ax + by = c. */
export function substitutionSteps(m: number, n: number, a: number, b: number, c: number, x0: number, y0: number): SolutionStep[] {
  const A = a + b * m;
  return [
    { text: 'Den Term für $y$ aus I in II einsetzen:', math: `${linearTerm(a, 0)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : num(Math.abs(b))}(${linearTerm(m, n)}) = ${num(c)}` },
    { text: 'Klammer auflösen und zusammenfassen:', math: `${linearTerm(A, b * n)} = ${num(c)}` },
    { text: 'Nach $x$ auflösen:', math: `${linearTerm(A, 0)} = ${num(c - b * n)} \\;\\Rightarrow\\; x = ${num(x0)}` },
    { text: '$x$ in I einsetzen:', math: `y = ${num(m)} \\cdot ${x0 < 0 ? `(${num(x0)})` : num(x0)} ${n < 0 ? '-' : '+'} ${num(Math.abs(n))} = ${num(y0)}` },
  ];
}

/** Lösungsweg mit dem Gleichsetzungsverfahren für I: y = m₁x + n₁ und II: y = m₂x + n₂. */
export function equateSteps(m1: number, n1: number, m2: number, n2: number, x0: number, y0: number): SolutionStep[] {
  return [
    { text: 'Die beiden Terme für $y$ gleichsetzen:', math: `${linearTerm(m1, n1)} = ${linearTerm(m2, n2)}` },
    { text: 'Alle $x$ auf eine Seite, alle Zahlen auf die andere:', math: `${linearTerm(m1 - m2, 0)} = ${num(n2 - n1)}` },
    { text: 'Nach $x$ auflösen:', math: `x = ${num(x0)}` },
    { text: '$x$ in I einsetzen:', math: `y = ${num(m1)} \\cdot ${x0 < 0 ? `(${num(x0)})` : num(x0)} ${n1 < 0 ? '-' : '+'} ${num(Math.abs(n1))} = ${num(y0)}` },
  ];
}

export const SWAP_MISTAKE = (x0: number, y0: number): CommonMistake => ({
  description: 'x und y vertauscht',
  feedback: 'Gib das Paar in der Reihenfolge $(x\\,|\\,y)$ an.',
  answers: x0 === y0 ? [] : [`(${String(y0).replace('.', ',')}|${String(x0).replace('.', ',')})`],
});

/** Geldbetrag für KaTeX: 13.7 → „13{,}70“, 12 → „12“. */
export const euro = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', '{,}'));

/** Prompt-Zusatz für die Eingabe. */
export const PAIR_INPUT = 'Gib die Lösung als $(x\\,|\\,y)$ an.';

// ---------------------------------------------------------------- Sachkontexte mit zwei Unbekannten

export interface WordProblem {
  /** Kurzname für IDs/Abwechslung. */
  key: string;
  prompt: string;
  /** Bedeutung von x und y, z. B. „x = Preis für Erwachsene in €“. */
  vars: string;
  system: System;
  x: number;
  y: number;
}

/** Erzeugt eine Sachaufgabe mit ganzzahliger bzw. glatter Lösung. `keys` begrenzt die Kontexte (Abwechslung je Kapitel). */
export function wordProblem(r: Rng, keys: readonly string[]): WordProblem {
  const key = r.pick(keys);
  switch (key) {
    case 'eintritt': {
      const x = r.pick([6, 7, 8, 9, 10, 12]);
      const y = r.pick([3, 4, 4.5, 5]);
      const [a1, b1, a2, b2] = [r.int(2, 3), r.int(2, 5), r.int(2, 4), r.int(2, 3)];
      if (a1 * b2 === a2 * b1) return wordProblem(r, keys);
      const s = systemFor(x, y, a1, b1, a2, b2);
      return { key, x, y, system: s, vars: '$x$ = Eintritt für Erwachsene, $y$ = Eintritt für Kinder (in €)', prompt: `Im Zoo zahlt Familie Kaya für $${a1}$ Erwachsene und $${b1}$ Kinder $${euro(s.c1)}$ €, Familie Novak für $${a2}$ Erwachsene und $${b2}$ Kinder $${euro(s.c2)}$ €. Wie teuer ist der Eintritt für einen Erwachsenen ($x$) und für ein Kind ($y$)?` };
    }
    case 'tiere': {
      const x = r.int(5, 20);
      const y = r.int(3, 15);
      const s = systemFor(x, y, 1, 1, 2, 4);
      return { key, x, y, system: s, vars: '$x$ = Anzahl Hühner, $y$ = Anzahl Kaninchen', prompt: `Auf einem Bauernhof gibt es Hühner und Kaninchen, zusammen $${s.c1}$ Köpfe und $${s.c2}$ Beine. Wie viele Hühner ($x$) und wie viele Kaninchen ($y$) sind es?` };
    }
    case 'muenzen': {
      const x = r.int(4, 15);
      const y = r.int(3, 12);
      const s = systemFor(x, y, 1, 1, 1, 2);
      return { key, x, y, system: s, vars: '$x$ = Anzahl 1-€-Münzen, $y$ = Anzahl 2-€-Münzen', prompt: `In einer Spardose liegen nur 1-€- und 2-€-Münzen, insgesamt $${s.c1}$ Stück im Wert von $${s.c2}$ €. Wie viele 1-€-Münzen ($x$) und wie viele 2-€-Münzen ($y$) sind es?` };
    }
    case 'alter': {
      const y = r.int(8, 16);
      const d = r.int(24, 34);
      const x = y + d;
      const s = systemFor(x, y, 1, 1, 1, -1);
      return { key, x, y, system: s, vars: '$x$ = Alter der Mutter, $y$ = Alter der Tochter', prompt: `Eine Mutter und ihre Tochter sind zusammen $${s.c1}$ Jahre alt. Die Mutter ist $${d}$ Jahre älter als die Tochter. Wie alt sind die Mutter ($x$) und die Tochter ($y$)?` };
    }
    case 'schreibwaren': {
      const x = r.pick([1.5, 2, 2.5, 3]);
      const y = r.pick([0.5, 0.8, 1, 1.2]);
      const [a1, b1, a2, b2] = [r.int(2, 5), r.int(2, 4), r.int(2, 3), r.int(3, 6)];
      if (a1 * b2 === a2 * b1) return wordProblem(r, keys);
      const s = systemFor(x, y, a1, b1, a2, b2);
      return { key, x, y, system: s, vars: '$x$ = Preis eines Hefts, $y$ = Preis eines Stifts (in €)', prompt: `Lea kauft $${a1}$ Hefte und $${b1}$ Stifte für $${euro(s.c1)}$ €. Tom kauft $${a2}$ Hefte und $${b2}$ Stifte für $${euro(s.c2)}$ €. Was kostet ein Heft ($x$) und was ein Stift ($y$)?` };
    }
    case 'zahlen': {
      const x = r.int(10, 60);
      const y = r.int(2, x - 1);
      const s = systemFor(x, y, 1, 1, 1, -1);
      return { key, x, y, system: s, vars: '$x$ = größere Zahl, $y$ = kleinere Zahl', prompt: `Die Summe zweier Zahlen ist $${s.c1}$, ihre Differenz ist $${s.c2}$. Bestimme die größere Zahl $x$ und die kleinere Zahl $y$.` };
    }
    case 'rechteck': {
      const y = r.int(3, 15);
      const d = r.int(2, 9);
      const x = y + d;
      const s = systemFor(x, y, 2, 2, 1, -1);
      return { key, x, y, system: s, vars: '$x$ = Länge, $y$ = Breite (in cm)', prompt: `Ein Rechteck hat den Umfang $${s.c1}$ cm. Seine Länge ist $${d}$ cm größer als seine Breite. Wie lang ($x$) und wie breit ($y$) ist es (in cm)?` };
    }
    case 'konzert': {
      const x = r.pick([25, 30, 35, 40]);
      const y = r.pick([15, 18, 20, 22]);
      const n1 = r.int(80, 200);
      const n2 = r.int(50, 300);
      const s = systemFor(n1, n2, 1, 1, x, y);
      return { key, x: n1, y: n2, system: s, vars: '$x$ = Anzahl Sitzplatzkarten, $y$ = Anzahl Stehplatzkarten', prompt: `Für ein Konzert wurden $${s.c1}$ Karten verkauft: Sitzplätze zu $${x}$ € und Stehplätze zu $${y}$ €. Die Einnahmen betrugen $${num(s.c2)}$ €. Wie viele Sitzplatzkarten ($x$) und Stehplatzkarten ($y$) wurden verkauft?` };
    }
    default: {
      // 'saft': Mischungsaufgabe
      const x = r.pick([2, 3, 4, 5, 6]);
      const y = r.pick([4, 5, 6, 8, 10]);
      const p1 = r.pick([1.5, 2, 2.5]);
      const p2 = r.pick([0.5, 1]);
      const s = systemFor(x, y, 1, 1, p1, p2);
      return { key, x, y, system: s, vars: `$x$ = Liter Saft, $y$ = Liter Wasser`, prompt: `Für ein Fest werden $${num(s.c1)}$ Liter Schorle aus Saft (Literpreis $${num(p1)}$ €) und Mineralwasser (Literpreis $${num(p2)}$ €) gemischt. Die Zutaten kosten zusammen $${euro(s.c2)}$ €. Wie viele Liter Saft ($x$) und Wasser ($y$) werden verwendet?` };
    }
  }
}

export const WORD_KEYS = ['eintritt', 'tiere', 'muenzen', 'alter', 'schreibwaren', 'zahlen', 'rechteck', 'konzert', 'saft'] as const;

/** Sachaufgaben als Vorlage: Aufstellen und Lösen, Antwort als Zahlenpaar (x|y). */
export function wordProblemExercises(o: {
  id: string;
  subtopicId: string;
  count: number;
  difficulty: Difficulty;
  keys: readonly string[];
  objectives: string[];
  method: string;
}): AuthoredExercise[] {
  return fromTemplate({
    id: o.id,
    subtopicId: o.subtopicId,
    count: o.count,
    type: 'equation',
    requirement: 'application',
    difficulty: o.difficulty,
    objectives: o.objectives,
    params: (r) => wordProblem(r, o.keys),
    build: (w) => ({
      prompt: `${w.prompt} ${PAIR_INPUT}`,
      answer: { kind: 'point', x: w.x, y: w.y, tolerance: 0.001 },
      hints: [`Lege die Variablen fest: ${w.vars}.`, 'Stelle aus jeder Information eine Gleichung auf.', `Löse das Gleichungssystem ${o.method}: $${sysLatex(w.system)}$`],
      solution: {
        steps: [{ text: `Variablen: ${w.vars}. Gleichungssystem:`, math: sysLatex(w.system) }, ...additionSteps(w.system, w.x, w.y), { text: 'Probe mit Gleichung II bestätigt das Ergebnis.' }],
        finalAnswer: `$x = ${num(w.x)}$, $y = ${num(w.y)}$`,
      },
      commonMistakes: [SWAP_MISTAKE(w.x, w.y)],
    }),
  });
}
