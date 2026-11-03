import type { AuthoredSubtopic, Figure } from '../../types';
import { videoPlaceholder } from '../helpers';
import { plane } from '../lineare-funktionen/shared';
import { fromTemplate, linearTerm, num, round, shuffledChoices } from '../templates';
import { eq, PAIR_INPUT, SWAP_MISTAKE, TOPIC_ID } from './shared';

const S = 'lgs-grafisch';
const OBJ = ['Lineare Gleichungssysteme grafisch lösen'];
const COUNT_CHOICES = [
  { id: 'a', label: 'keine Lösung' },
  { id: 'b', label: 'genau eine Lösung' },
  { id: 'c', label: 'unendlich viele Lösungen' },
];

/** Zwei Geraden mit ganzzahligem Schnittpunkt im Bereich −3 … 3. */
function crossingLines(r: { pick<T>(a: readonly T[]): T; int(a: number, b: number): number }) {
  const x = r.pick([-3, -2, -1, 1, 2, 3]);
  const y = r.int(-3, 3);
  const m1 = r.pick([1, 2, 0.5, -1, -0.5]);
  let m2 = r.pick([-2, -1, 1, 3, -0.5, 0]);
  if (m2 === m1) m2 = m1 === -1 ? 2 : -1;
  return { x, y, m1, n1: y - m1 * x, m2, n2: y - m2 * x };
}

export const grafisch: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 2,
  title: 'Grafisches Lösen',
  description: 'Beide Gleichungen als Geraden zeichnen und den Schnittpunkt ablesen – und erkennen, wann es keine oder unendlich viele Lösungen gibt.',
  objective: 'Du löst Gleichungssysteme zeichnerisch und erkennst an der Lage der Geraden die Anzahl der Lösungen.',
  intro:
    'Jede der beiden Gleichungen beschreibt eine Gerade. Ein Zahlenpaar, das **beide** Gleichungen erfüllt, liegt auf beiden Geraden – also im Schnittpunkt. Dazu stellt man beide Gleichungen nach $y$ um, zeichnet die Geraden und liest den Schnittpunkt ab.',
  rules: [
    { term: 'Lösung eines LGS', explanation: 'Der Schnittpunkt der beiden Geraden.' },
    { term: 'Vorgehen', explanation: 'Beide Gleichungen nach $y$ umstellen, Geraden zeichnen, Schnittpunkt ablesen, Probe machen.' },
    { term: 'Anzahl der Lösungen', explanation: 'Geraden schneiden sich: genau eine · parallel: keine · identisch: unendlich viele.' },
    { term: 'Grenzen', explanation: 'Ablesen ist ungenau, wenn der Schnittpunkt nicht auf Gitterpunkten liegt – dann rechnerisch lösen.' },
  ],
  materials: [videoPlaceholder('lgs-grafisch-v1', 'Gleichungssysteme grafisch lösen')],
  example: {
    problem: 'Löse grafisch: $\\text{I: } y = x + 1$, $\\text{II: } y = -x + 3$.',
    steps: [
      { text: 'Beide Geraden zeichnen: I schneidet die $y$-Achse bei $1$ (Steigung $1$), II bei $3$ (Steigung $-1$).' },
      { text: 'Schnittpunkt ablesen: $S(1\\,|\\,2)$.' },
      { text: 'Probe:', math: '\\text{I: } 1 + 1 = 2 \\;\\checkmark \\quad \\text{II: } -1 + 3 = 2 \\;\\checkmark' },
    ],
    result: 'Lösung: $(1\\,|\\,2)$',
  },
  summary: ['Lösung = Schnittpunkt der Geraden.', 'Parallel ⇒ keine Lösung, identisch ⇒ unendlich viele.', 'Immer eine Probe machen.'],
  exercises: [
    {
      id: 'lgs-gr-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was ist die Lösung eines linearen Gleichungssystems, wenn man es grafisch löst?',
      choices: [
        { id: 'a', label: 'Der Schnittpunkt der beiden Geraden' },
        { id: 'b', label: 'Der Schnittpunkt einer Geraden mit der $y$-Achse' },
        { id: 'c', label: 'Die Steigung der steileren Geraden' },
        { id: 'd', label: 'Die Nullstellen beider Geraden' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Die Lösung muss beide Gleichungen erfüllen.', 'Welcher Punkt liegt auf beiden Geraden?', 'Dort kreuzen sie sich.'],
      solution: { steps: [{ text: 'Nur der Schnittpunkt liegt auf beiden Geraden und erfüllt damit beide Gleichungen.' }], finalAnswer: 'Schnittpunkt' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Achsenabschnitt gewählt', feedback: 'Der $y$-Achsenabschnitt gehört nur zu einer Geraden.', answers: ['b'] }],
    },
    {
      id: 'lgs-gr-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Die Geraden eines Gleichungssystems sind parallel und verschieden. Wie viele Lösungen gibt es?',
      choices: COUNT_CHOICES,
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Schneiden sich parallele Geraden?', 'Es gibt keinen gemeinsamen Punkt.', 'Ohne gemeinsamen Punkt …'],
      solution: { steps: [{ text: 'Parallele, verschiedene Geraden haben keinen gemeinsamen Punkt ⇒ keine Lösung.' }], finalAnswer: 'keine Lösung' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit identischen Geraden verwechselt', feedback: 'Unendlich viele Lösungen gibt es nur, wenn beide Geraden aufeinanderliegen.', answers: ['c'] }],
    },
    {
      id: 'lgs-gr-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Warum ist das grafische Lösungsverfahren manchmal ungenau?',
      choices: [
        { id: 'a', label: 'Weil man Schnittpunkte zwischen Gitterlinien nur schätzen kann.' },
        { id: 'b', label: 'Weil Geraden sich nie genau schneiden.' },
        { id: 'c', label: 'Weil man immer nur eine Gerade zeichnen kann.' },
        { id: 'd', label: 'Weil es nur für proportionale Funktionen funktioniert.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Denke an einen Schnittpunkt wie $(1{,}37\\,|\\,2{,}84)$.', 'Kann man so etwas genau ablesen?', 'Zeichnungen haben eine begrenzte Genauigkeit.'],
      solution: { steps: [{ text: 'Liegt der Schnittpunkt nicht auf einem Gitterpunkt, kann man ihn nur ungefähr ablesen. Dann hilft ein rechnerisches Verfahren.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Falsche Vorstellung von Geraden', feedback: 'Zwei nicht parallele Geraden schneiden sich immer in genau einem Punkt – das Problem ist nur das Ablesen.', answers: ['b'] }],
    },
    {
      id: 'lgs-gr-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Das Gleichungssystem lautet $\\text{I: } 2x + y = 4$ und $\\text{II: } 4x + 2y = 8$. Wie viele Lösungen hat es?',
      choices: COUNT_CHOICES,
      answer: { kind: 'choice', correct: 'c' },
      hints: ['Stelle beide Gleichungen nach $y$ um.', 'I: $y = -2x + 4$. Und II?', 'II ist das Doppelte von I.'],
      solution: { steps: [{ text: 'Beide ergeben umgestellt $y = -2x + 4$. Die Geraden sind identisch ⇒ unendlich viele Lösungen.' }], finalAnswer: 'unendlich viele' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gleiche Steigung als „parallel“ gedeutet', feedback: 'Gleiche Steigung und gleicher Achsenabschnitt: Die Geraden liegen aufeinander.', answers: ['a'] }],
    },
    {
      id: 'lgs-gr-5',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Zwei Taxitarife werden als Geraden gezeichnet ($x$ = km, $y$ = Preis). Sie schneiden sich bei $(8\\,|\\,20)$. Was bedeutet das?',
      choices: [
        { id: 'a', label: 'Bei $8$ km kosten beide Tarife $20$ €.' },
        { id: 'b', label: 'Bei $20$ km kosten beide Tarife $8$ €.' },
        { id: 'c', label: 'Beide Tarife kosten $8$ € Grundgebühr.' },
        { id: 'd', label: 'Ab $8$ km ist Fahren kostenlos.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$x$ sind die Kilometer, $y$ der Preis.', 'Im Schnittpunkt haben beide Tarife denselben $y$-Wert.', '$(8\\,|\\,20)$: $x = 8$, $y = 20$.'],
      solution: { steps: [{ text: 'Im Schnittpunkt sind beide Preise gleich: Bei $8$ km kosten beide $20$ €.' }], finalAnswer: 'a)' },
      objectives: [...OBJ, 'Schnittpunkte deuten'],
      commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Die erste Koordinate ist $x$ (km), die zweite $y$ (Preis).', answers: ['b'] }],
    },
    {
      id: 'lgs-gr-6',
      subtopicId: S,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      prompt: `Löse grafisch: $\\text{I: } y = 2x - 1$ und $\\text{II: } y = -x + 5$. ${PAIR_INPUT}`,
      figure: plane('Zwei Geraden: I mit Steigung 2 durch (0|-1), II mit Steigung -1 durch (0|5).', [{ m: 2, b: -1, label: 'I' }, { m: -1, b: 5, label: 'II' }], [], 6),
      answer: { kind: 'point', x: 2, y: 3, tolerance: 0.001 },
      hints: ['Suche den Punkt, an dem sich die Geraden kreuzen.', 'Lies $x$ und $y$ ab.', 'Probe: $2 \\cdot 2 - 1 = 3$ und $-2 + 5 = 3$.'],
      solution: { steps: [{ text: 'Schnittpunkt ablesen: $(2\\,|\\,3)$.' }, { text: 'Probe:', math: '2 \\cdot 2 - 1 = 3, \\quad -2 + 5 = 3 \\;\\checkmark' }], finalAnswer: '$(2\\,|\\,3)$' },
      objectives: OBJ,
      commonMistakes: [SWAP_MISTAKE(2, 3)],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-gr-ablesen',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'construction',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => crossingLines(r),
      build: ({ x, y, m1, n1, m2, n2 }) => ({
        prompt: `Löse grafisch: $\\text{I: } y = ${linearTerm(m1, n1)}$ und $\\text{II: } y = ${linearTerm(m2, n2)}$. ${PAIR_INPUT}`,
        figure: plane(`Die Geraden I: y = ${linearTerm(m1, n1)} und II: y = ${linearTerm(m2, n2)}.`, [{ m: m1, b: n1, label: 'I' }, { m: m2, b: n2, label: 'II' }], [], 6),
        answer: { kind: 'point', x, y, tolerance: 0.001 },
        hints: ['Suche den Schnittpunkt der beiden Geraden.', 'Lies zuerst $x$, dann $y$ ab.', 'Mache die Probe in beiden Gleichungen.'],
        solution: { steps: [{ text: `Schnittpunkt: $(${x}\\,|\\,${y})$.` }, { text: 'Probe:', math: `${num(m1)} \\cdot ${x < 0 ? `(${x})` : x} ${n1 < 0 ? '-' : '+'} ${num(Math.abs(n1))} = ${y}, \\quad ${num(m2)} \\cdot ${x < 0 ? `(${x})` : x} ${n2 < 0 ? '-' : '+'} ${num(Math.abs(n2))} = ${y}` }], finalAnswer: `$(${x}\\,|\\,${y})$` },
        commonMistakes: [SWAP_MISTAKE(x, y)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-gr-normalform',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      objectives: [...OBJ, 'Gleichungen umstellen'],
      params: (r) => {
        const l = crossingLines(r);
        const k1 = r.pick([1, 2]);
        const k2 = r.pick([1, 2]);
        return { ...l, k1, k2 };
      },
      build: ({ x, y, m1, n1, m2, n2, k1, k2 }) => {
        // y = m x + n  ⇔  −k·m x + k y = k n
        const e1 = eq(round(-k1 * m1, 4), k1, round(k1 * n1, 4));
        const e2 = eq(round(-k2 * m2, 4), k2, round(k2 * n2, 4));
        return {
          prompt: `Löse grafisch: $\\text{I: } ${e1}$ und $\\text{II: } ${e2}$. Die Abbildung zeigt die zugehörigen Geraden. ${PAIR_INPUT}`,
          figure: plane(`Die Geraden zu I: ${e1} und II: ${e2}.`, [{ m: m1, b: n1, label: 'I' }, { m: m2, b: n2, label: 'II' }], [], 6),
          answer: { kind: 'point', x, y, tolerance: 0.001 },
          hints: ['Stelle beide Gleichungen nach $y$ um.', `I: $y = ${linearTerm(m1, n1)}$, II: $y = ${linearTerm(m2, n2)}$`, 'Lies den Schnittpunkt ab und mache die Probe.'],
          solution: { steps: [{ text: 'Umgestellt:', math: `\\text{I: } y = ${linearTerm(m1, n1)}, \\quad \\text{II: } y = ${linearTerm(m2, n2)}` }, { text: `Schnittpunkt: $(${x}\\,|\\,${y})$.` }], finalAnswer: `$(${x}\\,|\\,${y})$` },
          commonMistakes: [SWAP_MISTAKE(x, y)],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gr-umstellen',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Gleichungen umstellen'],
      params: (r) => ({ k: r.pick([1, 2, 3, -1]), m: r.pick([1, 2, 3, -1, -2, 0.5]), n: r.int(1, 6) * r.sign() }),
      build: ({ k, m, n }) => {
        const e = eq(round(-k * m, 4), k, k * n);
        return {
          prompt: `Um das Gleichungssystem grafisch zu lösen, stellst du die Gleichung $${e}$ nach $y$ um. Wie lautet die Geradengleichung?`,
          answer: { kind: 'linear', m, b: n, tolerance: 0.001 },
          hints: ['Bringe den $x$-Term auf die rechte Seite.', k === 1 ? '$y$ steht dann schon allein.' : `Teile durch $${k}$.`, 'Achte auf die Vorzeichen.'],
          solution: { steps: [{ text: 'Umformen:', math: `${k === 1 ? '' : k === -1 ? '-' : num(k)}y = ${linearTerm(k * m, k * n)}${k === 1 ? '' : ` \\;\\Rightarrow\\; y = ${linearTerm(m, n)}`}` }], finalAnswer: `$y = ${linearTerm(m, n)}$` },
          commonMistakes: [{ description: 'Vorzeichen von x nicht gewechselt', feedback: 'Beim Herüberbringen wechselt das Vorzeichen des $x$-Terms.', answers: [`y = ${String(-m).replace('.', ',')}x + ${n}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gr-lage-bild',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Anzahl der Lösungen erkennen'],
      params: (r) => ({ kind: r.pick(['schnitt', 'parallel', 'parallel', 'schnitt']), m: r.pick([1, 2, -1, 0.5, -2]), n1: r.int(-3, 1), d: r.int(2, 4), m2: r.pick([-1, 3, -0.5, 0]) }),
      build: ({ kind, m, n1, d, m2 }) => {
        const second = kind === 'parallel' ? { m, b: n1 + d } : { m: m2 === m ? -m : m2, b: n1 + d };
        const figure: Figure = plane(kind === 'parallel' ? 'Zwei parallele Geraden.' : 'Zwei Geraden, die sich schneiden.', [{ m, b: n1, label: 'I' }, { ...second, label: 'II' }], [], 6);
        const correct = kind === 'parallel' ? 'a' : 'b';
        return {
          prompt: `Die Abbildung zeigt die Geraden eines Gleichungssystems: $\\text{I: } y = ${linearTerm(m, n1)}$ und $\\text{II: } y = ${linearTerm(second.m, second.b)}$. Wie viele Lösungen hat es?`,
          figure,
          choices: COUNT_CHOICES,
          answer: { kind: 'choice', correct },
          hints: ['Schneiden sich die Geraden?', 'Vergleiche die Steigungen.', 'Gleiche Steigung und verschiedener Achsenabschnitt ⇒ parallel.'],
          solution: { steps: [{ text: kind === 'parallel' ? 'Gleiche Steigung, verschiedene Achsenabschnitte: parallel ⇒ keine Lösung.' : 'Verschiedene Steigungen: Die Geraden schneiden sich in genau einem Punkt.' }], finalAnswer: COUNT_CHOICES.find((c) => c.id === correct)!.label },
          commonMistakes: [{ description: 'Lage falsch gedeutet', feedback: 'Verschiedene Steigungen ⇒ genau ein Schnittpunkt; gleiche Steigung ⇒ parallel oder identisch.', answers: [correct === 'a' ? 'b' : 'a'] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gr-lage-rechnen',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      objectives: [...OBJ, 'Anzahl der Lösungen erkennen'],
      params: (r) => {
        const a = r.int(1, 4);
        const b = r.pick([1, 2, 3]);
        const c = r.int(2, 12);
        const k = r.pick([2, 3, -2]);
        const kind = r.pick(['identisch', 'parallel', 'schnitt']);
        if (kind === 'identisch') return { kind, s: [a, b, c, k * a, k * b, k * c] };
        if (kind === 'parallel') return { kind, s: [a, b, c, k * a, k * b, k * c + r.pick([1, 2, -3])] };
        return { kind, s: [a, b, c, k * a + 1, k * b, r.int(1, 15)] };
      },
      build: ({ kind, s: [a1, b1, c1, a2, b2, c2] }) => {
        const correct = kind === 'parallel' ? 'a' : kind === 'schnitt' ? 'b' : 'c';
        return {
          prompt: `Wie viele Lösungen hat das Gleichungssystem $\\text{I: } ${eq(a1, b1, c1)}$, $\\text{II: } ${eq(a2, b2, c2)}$? Entscheide ohne Zeichnung.`,
          choices: COUNT_CHOICES,
          answer: { kind: 'choice', correct },
          hints: ['Stelle beide Gleichungen nach $y$ um.', 'Vergleiche Steigungen und Achsenabschnitte.', 'Ist II vielleicht ein Vielfaches von I?'],
          solution: {
            steps: [
              { text: 'Umgestellt:', math: `\\text{I: } y = ${linearTerm(round(-a1 / b1, 4), round(c1 / b1, 4))}, \\quad \\text{II: } y = ${linearTerm(round(-a2 / b2, 4), round(c2 / b2, 4))}` },
              { text: kind === 'identisch' ? 'Gleiche Gerade ⇒ unendlich viele Lösungen.' : kind === 'parallel' ? 'Gleiche Steigung, verschiedener Achsenabschnitt ⇒ keine Lösung.' : 'Verschiedene Steigungen ⇒ genau eine Lösung.' },
            ],
            finalAnswer: COUNT_CHOICES.find((c) => c.id === correct)!.label,
          },
          commonMistakes: [{ description: 'Vielfaches nicht erkannt', feedback: 'Ist eine Gleichung ein Vielfaches der anderen, beschreiben beide dieselbe Gerade.', answers: kind === 'identisch' ? ['a', 'b'] : [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gr-tarif',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Schnittpunkte deuten'],
      params: (r) => {
        const x = r.pick([2, 4, 6]);
        const p2 = r.pick([1, 1.5, 2]);
        const p1 = p2 - r.pick([0.5, 1].filter((d) => d < p2));
        return { x, p1, p2, g: round((p2 - p1) * x, 2), what: r.pick(['Fahrradverleih', 'Kanuverleih', 'Bowlingbahn']) };
      },
      build: ({ x, p1, p2, g, what }) => {
        const y = round(p2 * x, 2);
        const figure: Figure = { kind: 'coordinate-plane', alt: `Zwei Geraden: A: y = ${p1}x + ${g}, B: y = ${p2}x. Sie schneiden sich bei (${x}|${y}).`, x: [0, 8], y: [0, Math.max(8, Math.ceil(y) + 2)], lines: [{ m: p1, b: g, label: 'A' }, { m: p2, b: 0, label: 'B' }] };
        return {
          prompt: `Ein ${what} hat zwei Tarife ($x$ in Stunden, $y$ in €): Tarif A $y = ${linearTerm(p1, g)}$, Tarif B $y = ${linearTerm(p2, 0)}$. Bei welcher Dauer kosten beide gleich viel, und wie viel? Lies den Schnittpunkt ab. ${PAIR_INPUT}`,
          figure,
          answer: { kind: 'point', x, y, tolerance: 0.001 },
          hints: ['Suche den Schnittpunkt der beiden Geraden.', '$x$ = Stunden, $y$ = Preis.', `Probe: $${num(p1)} \\cdot ${x} + ${num(g)} = ${num(p2)} \\cdot ${x}$`],
          solution: { steps: [{ text: `Schnittpunkt: $(${x}\\,|\\,${num(y)})$.` }, { text: 'Probe:', math: `${num(p1)} \\cdot ${x} + ${num(g)} = ${num(y)} = ${num(p2)} \\cdot ${x}` }], finalAnswer: `$(${x}\\,|\\,${num(y)})$: Nach $${x}$ Stunden kosten beide $${num(y)}$ €.` },
          commonMistakes: [SWAP_MISTAKE(x, y)],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gr-zahlen',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Sachsituationen grafisch lösen'],
      params: (r) => {
        const x = r.int(2, 5);
        const y = r.int(-3, x - 1);
        return { x, y };
      },
      build: ({ x, y }) => ({
        prompt: `Die Summe zweier Zahlen ist $${x + y}$, ihre Differenz ist $${x - y}$. Das führt auf $\\text{I: } y = -x + ${x + y}$ und $\\text{II: } y = x - ${x - y}$. Bestimme beide Zahlen mit der Zeichnung. ${PAIR_INPUT}`,
        figure: plane(`Die Geraden y = -x + ${x + y} und y = x - ${x - y}.`, [{ m: -1, b: x + y, label: 'I' }, { m: 1, b: -(x - y), label: 'II' }], [], 6),
        answer: { kind: 'point', x, y, tolerance: 0.001 },
        hints: ['Die Lösung ist der Schnittpunkt.', 'Lies $x$ und $y$ ab.', `Probe: $x + y = ${x + y}$ und $x - y = ${x - y}$.`],
        solution: { steps: [{ text: `Schnittpunkt $(${x}\\,|\\,${y})$.` }, { text: 'Probe:', math: `${x} + ${y < 0 ? `(${y})` : y} = ${x + y}, \\quad ${x} - ${y < 0 ? `(${y})` : y} = ${x - y}` }], finalAnswer: `$x = ${x}$, $y = ${y}$` },
        commonMistakes: [SWAP_MISTAKE(x, y)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-gr-sach-deuten',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 1,
      objectives: [...OBJ, 'Schnittpunkte deuten'],
      params: (r) => ({ x: r.pick([2, 3, 4, 5, 6, 10]), y: r.pick([12, 15, 18, 24, 30]), what: r.pick([['Stunden', '€'], ['Minuten', 'Liter'], ['Monaten', '€']] as const) }),
      build: ({ x, y, what: [ux, uy] }, r) => {
        const right = `Nach $${x}$ ${ux} haben beide den Wert $${y}$ ${uy}.`;
        const { choices, correctId } = shuffledChoices(r, right, [`Nach $${y}$ ${ux} haben beide den Wert $${x}$ ${uy}.`, `Beide beginnen bei $${y}$ ${uy}.`, `Nach $${x}$ ${ux} ist der Wert bei beiden null.`]);
        return {
          prompt: `Zwei Vorgänge werden als Geraden dargestellt ($x$ in ${ux}, $y$ in ${uy}). Die Geraden schneiden sich in $S(${x}\\,|\\,${y})$. Was bedeutet das?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Die erste Koordinate gehört zur $x$-Achse.', `$x = ${x}$ ${ux}, $y = ${y}$ ${uy}`, 'Im Schnittpunkt sind beide Werte gleich.'],
          solution: { steps: [{ text: right }], finalAnswer: right },
          commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Die erste Zahl ist der $x$-Wert.', answers: choices.filter((c) => c.label.startsWith(`Nach $${y}$`)).map((c) => c.id) }],
        };
      },
    }),
  ],
};
