import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, shuffledChoices } from '../templates';
import { additionSteps, eq, PAIR_INPUT, sysLatex, SWAP_MISTAKE, systemFor, TOPIC_ID, wordProblemExercises } from './shared';

const S = 'lgs-addition';
const OBJ = ['Gleichungssysteme mit dem Additionsverfahren lösen'];

type R = { int(a: number, b: number): number; sign(): 1 | -1; pick<T>(a: readonly T[]): T };

/** System, bei dem y durch Addition (ggf. nach Multiplikation) wegfällt. `mode`: 0 = Gegenzahlen, 1 = eine Gleichung multiplizieren, 2 = beide. */
function eliminationSystem(r: R, mode: 0 | 1 | 2) {
  const x0 = r.int(-5, 6);
  const y0 = r.int(-5, 6);
  const a1 = r.int(1, 5) * r.sign();
  let a2 = r.int(1, 5) * r.sign();
  let b1: number;
  let b2: number;
  if (mode === 0) {
    b1 = r.int(1, 5) * r.sign();
    b2 = -b1;
  } else if (mode === 1) {
    b1 = r.int(1, 3) * r.sign();
    b2 = b1 * r.pick([2, 3, -2, -3]);
  } else {
    const [p, q] = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 3]]);
    b1 = p * r.sign();
    b2 = q * r.sign();
  }
  if (a1 * b2 === a2 * b1) a2 = a2 + (a2 > 0 ? 1 : -1);
  return { x0, y0, s: systemFor(x0, y0, a1, b1, a2, b2) };
}

export const addition: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 5,
  title: 'Additionsverfahren',
  description: 'Gleichungen so vervielfachen und addieren, dass eine Variable wegfällt.',
  objective: 'Du löst lineare Gleichungssysteme rechnerisch mit dem Additionsverfahren.',
  intro:
    'Addiert man zwei Gleichungen, bleibt die Gleichheit erhalten. Stehen vor $y$ Gegenzahlen wie $+3y$ und $-3y$, fällt $y$ beim Addieren weg. Ist das nicht so, multipliziert man vorher eine oder beide Gleichungen mit passenden Zahlen.',
  rules: [
    { term: 'Schritt 1', explanation: 'Gleichungen so multiplizieren, dass vor einer Variablen Gegenzahlen (oder gleiche Zahlen) stehen.' },
    { term: 'Schritt 2', explanation: 'Gleichungen addieren (bei Gegenzahlen) bzw. subtrahieren (bei gleichen Zahlen) – die Variable fällt weg.' },
    { term: 'Schritt 3', explanation: 'Die entstandene Gleichung lösen.' },
    { term: 'Schritt 4', explanation: 'Ergebnis in eine Ausgangsgleichung einsetzen; Probe machen.' },
  ],
  materials: [videoPlaceholder('lgs-addition-v1', 'Das Additionsverfahren')],
  example: {
    problem: 'Löse $\\text{I: } 2x + 3y = 12$ und $\\text{II: } 4x - 3y = 6$.',
    steps: [
      { text: 'I + II: $y$ fällt weg.', math: '6x = 18 \\;\\Rightarrow\\; x = 3' },
      { text: 'In I einsetzen:', math: '6 + 3y = 12 \\;\\Rightarrow\\; y = 2' },
    ],
    result: 'Lösung: $(3\\,|\\,2)$',
  },
  summary: ['Ziel: Gegenzahlen vor einer Variablen.', 'Gleichungen addieren – eine Variable fällt weg.', 'Ganze Gleichung multiplizieren (beide Seiten, alle Summanden!).'],
  exercises: [
    {
      id: 'lgs-ad-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wann kann man zwei Gleichungen direkt addieren, sodass $y$ wegfällt?',
      choices: [
        { id: 'a', label: 'Wenn vor $y$ Gegenzahlen stehen, z. B. $+2y$ und $-2y$' },
        { id: 'b', label: 'Wenn vor $y$ dieselbe Zahl steht, z. B. $+2y$ und $+2y$' },
        { id: 'c', label: 'Wenn beide rechten Seiten gleich sind' },
        { id: 'd', label: 'Immer' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was ergibt $2y + (-2y)$?', 'Und was ergibt $2y + 2y$?', 'Nur bei Gegenzahlen kommt $0$ heraus.'],
      solution: { steps: [{ text: '$2y + (-2y) = 0$ – bei Gegenzahlen fällt $y$ beim Addieren weg. Bei gleichen Zahlen müsste man subtrahieren.' }], finalAnswer: 'Bei Gegenzahlen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gleiche statt entgegengesetzte Zahlen', feedback: 'Bei gleichen Zahlen fällt $y$ nur beim Subtrahieren weg.', answers: ['b'] }],
    },
    {
      id: 'lgs-ad-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Jonas multipliziert $2x + y = 5$ mit $3$ und schreibt $6x + 3y = 5$. Was ist falsch?',
      choices: [
        { id: 'a', label: 'Auch die rechte Seite muss mit $3$ multipliziert werden: $15$.' },
        { id: 'b', label: 'Man darf Gleichungen nicht multiplizieren.' },
        { id: 'c', label: 'Nur $x$ hätte multipliziert werden dürfen.' },
        { id: 'd', label: 'Nichts, das ist richtig.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Eine Gleichung ist wie eine Waage.', 'Was man links macht, muss man auch rechts machen.', '$5 \\cdot 3 = 15$'],
      solution: { steps: [{ text: 'Alle Summanden auf beiden Seiten werden multipliziert: $6x + 3y = 15$.' }], finalAnswer: 'Rechte Seite vergessen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Fehler nicht erkannt', feedback: 'Die Gleichung bleibt nur richtig, wenn beide Seiten mit $3$ multipliziert werden.', answers: ['d'] }],
    },
    {
      id: 'lgs-ad-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Im System $\\text{I: } 3x + 4y = 10$, $\\text{II: } 5x - 6y = 4$ soll $y$ wegfallen. Womit multipliziert man am geschicktesten?',
      choices: [
        { id: 'a', label: 'I mit $3$ und II mit $2$, dann addieren' },
        { id: 'b', label: 'I mit $6$ und II mit $4$, dann subtrahieren' },
        { id: 'c', label: 'I mit $5$ und II mit $3$, dann subtrahieren' },
        { id: 'd', label: 'Nur II mit $4$, dann addieren' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Gesucht ist das kleinste gemeinsame Vielfache von $4$ und $6$.', 'kgV $= 12$', '$4y \\cdot 3 = 12y$, $-6y \\cdot 2 = -12y$'],
      solution: { steps: [{ text: 'kgV von $4$ und $6$ ist $12$: I · 3 ergibt $12y$, II · 2 ergibt $-12y$. Addieren – $y$ fällt weg.' }, { text: 'b) geht auch (mit $24y$ und $-24y$, dann aber addieren), ist aber umständlicher.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'x-Koeffizienten benutzt', feedback: 'Mit $5$ und $3$ würde man $x$ angleichen – gefragt war $y$.', answers: ['c'] }],
    },
    {
      id: 'lgs-ad-4',
      subtopicId: S,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      prompt: `Löse mit dem Additionsverfahren: $\\text{I: } x + y = 10$, $\\text{II: } x - y = 4$. ${PAIR_INPUT}`,
      answer: { kind: 'point', x: 7, y: 3, tolerance: 0.001 },
      hints: ['Addiere die beiden Gleichungen.', '$2x = 14$', 'Setze $x = 7$ in I ein.'],
      solution: { steps: [{ text: 'I + II:', math: '2x = 14 \\;\\Rightarrow\\; x = 7' }, { text: 'In I:', math: '7 + y = 10 \\;\\Rightarrow\\; y = 3' }], finalAnswer: '$(7\\,|\\,3)$' },
      objectives: OBJ,
      commonMistakes: [SWAP_MISTAKE(7, 3)],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-ad-direkt',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => eliminationSystem(r, 0),
      build: ({ x0, y0, s }) => ({
        prompt: `Löse mit dem Additionsverfahren: $\\text{I: } ${eq(s.a1, s.b1, s.c1)}$, $\\text{II: } ${eq(s.a2, s.b2, s.c2)}$. ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: ['Vor $y$ stehen Gegenzahlen.', 'Addiere die beiden Gleichungen.', 'Berechne $x$ und setze es in I ein.'],
        solution: { steps: additionSteps(s, x0, y0), finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-ad-summe',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => eliminationSystem(r, 0),
      build: ({ s }, r) => {
        const A = s.a1 + s.a2;
        const right = `$${A === 1 ? '' : A === -1 ? '-' : num(A)}x = ${num(s.c1 + s.c2)}$`;
        const { choices, correctId } = shuffledChoices(r, right, [`$${num(s.a1 - s.a2)}x = ${num(s.c1 - s.c2)}$`, `$${num(A)}x ${s.b1 > 0 ? '+' : '-'} ${num(2 * Math.abs(s.b1))}y = ${num(s.c1 + s.c2)}$`, `$${num(A)}x = ${num(s.c1 - s.c2)}$`]);
        return {
          prompt: `Welche Gleichung entsteht, wenn man $\\text{I: } ${eq(s.a1, s.b1, s.c1)}$ und $\\text{II: } ${eq(s.a2, s.b2, s.c2)}$ addiert?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Addiere die $x$-Terme, die $y$-Terme und die rechten Seiten jeweils für sich.', `$${num(s.b1)}y + (${num(s.b2)}y) = 0$`, `$${num(s.c1)} + (${num(s.c2)}) = ${num(s.c1 + s.c2)}$`],
          solution: { steps: [{ text: 'Spaltenweise addieren:', math: `${num(A)}x + 0y = ${num(s.c1 + s.c2)}` }], finalAnswer: right },
          commonMistakes: [{ description: 'Subtrahiert statt addiert', feedback: 'Gefragt ist die Summe beider Gleichungen.', answers: choices.filter((c) => c.label.startsWith(`$${num(s.a1 - s.a2)}x = ${num(s.c1 - s.c2)}`)).map((c) => c.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-ad-einfach-mult',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => eliminationSystem(r, 1),
      build: ({ x0, y0, s }) => ({
        prompt: `Löse mit dem Additionsverfahren: $\\text{I: } ${eq(s.a1, s.b1, s.c1)}$, $\\text{II: } ${eq(s.a2, s.b2, s.c2)}$. ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: ['Multipliziere eine Gleichung so, dass vor $y$ gleich große Zahlen stehen.', `Mit welcher Zahl wird aus $${num(s.b1)}y$ ein Vielfaches von $${num(s.b2)}y$?`, 'Dann addieren bzw. subtrahieren.'],
        solution: { steps: additionSteps(s, x0, y0), finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-ad-doppelt-mult',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => eliminationSystem(r, 2),
      build: ({ x0, y0, s }) => ({
        prompt: `Löse mit dem Additionsverfahren: $${sysLatex(s)}$ ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: [`Bilde das kgV von $${Math.abs(s.b1)}$ und $${Math.abs(s.b2)}$.`, 'Multipliziere beide Gleichungen passend.', 'Achte beim Addieren bzw. Subtrahieren auf die Vorzeichen.'],
        solution: { steps: additionSteps(s, x0, y0), finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-ad-faktor',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const b1 = r.pick([1, 2, 3]);
        const k = r.pick([2, 3, 4, 5]);
        return { a1: r.int(1, 6), b1, c1: r.int(1, 20), a2: r.int(1, 6), b2: -k * b1, c2: r.int(1, 20), k };
      },
      build: ({ a1, b1, c1, a2, b2, c2, k }) => ({
        prompt: `Mit welcher Zahl muss man Gleichung I multiplizieren, damit beim Addieren von $\\text{I: } ${eq(a1, b1, c1)}$ und $\\text{II: } ${eq(a2, b2, c2)}$ die Variable $y$ wegfällt?`,
        answer: { kind: 'numeric', value: k, tolerance: 0.001 },
        hints: [`Vor $y$ steht in I $${b1}$, in II $${b2}$.`, `Aus $${b1}y$ soll $${-b2}y$ werden.`, `$${-b2} : ${b1}$`],
        solution: { steps: [{ text: `$${b1} \\cdot ${k} = ${-b2}$ – Gegenzahl zu $${b2}$.` }], finalAnswer: `$${k}$` },
        commonMistakes: [{ description: 'Vorzeichen falsch', feedback: 'Es sollen Gegenzahlen entstehen, damit $y$ beim Addieren wegfällt.', answers: [String(-k)] }],
      }),
    }),
    ...wordProblemExercises({ id: 'lgs-ad-sach', subtopicId: S, count: 10, difficulty: 2, keys: ['eintritt', 'schreibwaren', 'tiere'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Additionsverfahren' }),
    ...wordProblemExercises({ id: 'lgs-ad-sach-schwer', subtopicId: S, count: 8, difficulty: 3, keys: ['konzert', 'saft'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Additionsverfahren' }),
  ],
};
