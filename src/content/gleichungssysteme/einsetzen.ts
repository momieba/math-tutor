import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, shuffledChoices, signedTerm } from '../templates';
import { eq, PAIR_INPUT, substitutionSteps, SWAP_MISTAKE, TOPIC_ID, wordProblemExercises } from './shared';

const S = 'lgs-einsetzen';
const OBJ = ['Gleichungssysteme mit dem Einsetzungsverfahren lösen'];

/** I: y = mx + n, II: ax + by = c mit Lösung (x0|y0). */
function substitutionSystem(r: { int(a: number, b: number): number; sign(): 1 | -1; pick<T>(a: readonly T[]): T }, ms: number[]) {
  const x0 = r.int(-5, 6);
  const y0 = r.int(-6, 6);
  const m = r.pick(ms);
  const a = r.int(1, 5) * r.sign();
  let b = r.int(1, 4) * r.sign();
  if (a + b * m === 0) b = -b;
  return { x0, y0, m, n: y0 - m * x0, a, b, c: a * x0 + b * y0 };
}

export const einsetzen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 3,
  title: 'Einsetzungsverfahren',
  description: 'Eine Gleichung nach einer Variablen auflösen und den Term in die andere Gleichung einsetzen.',
  objective: 'Du löst lineare Gleichungssysteme rechnerisch mit dem Einsetzungsverfahren.',
  intro:
    'Ist eine Gleichung schon nach einer Variablen aufgelöst, z. B. $y = 2x + 1$, kannst du den Term $2x + 1$ für $y$ in die andere Gleichung einsetzen. Übrig bleibt eine Gleichung mit nur noch einer Variablen.',
  rules: [
    { term: 'Schritt 1', explanation: 'Eine Gleichung nach $x$ oder $y$ auflösen (am besten die, wo das ohne Brüche geht).' },
    { term: 'Schritt 2', explanation: 'Den Term in die andere Gleichung einsetzen – mit Klammern!' },
    { term: 'Schritt 3', explanation: 'Die entstandene Gleichung lösen.' },
    { term: 'Schritt 4', explanation: 'Das Ergebnis einsetzen, um die zweite Variable zu berechnen; Probe machen.' },
  ],
  materials: [videoPlaceholder('lgs-einsetzen-v1', 'Das Einsetzungsverfahren')],
  example: {
    problem: 'Löse $\\text{I: } y = 2x - 1$ und $\\text{II: } 3x + y = 9$.',
    steps: [
      { text: 'I in II einsetzen:', math: '3x + (2x - 1) = 9' },
      { text: 'Lösen:', math: '5x - 1 = 9 \\;\\Rightarrow\\; x = 2' },
      { text: 'In I einsetzen:', math: 'y = 2 \\cdot 2 - 1 = 3' },
    ],
    result: 'Lösung: $(2\\,|\\,3)$',
  },
  summary: ['Auflösen – einsetzen (mit Klammer) – lösen – zurückeinsetzen.', 'Günstig, wenn eine Variable schon allein steht oder den Faktor $1$ hat.', 'Probe in beiden Gleichungen.'],
  exercises: [
    {
      id: 'lgs-es-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wann ist das Einsetzungsverfahren besonders günstig?',
      choices: [
        { id: 'a', label: 'Wenn eine Gleichung schon nach einer Variablen aufgelöst ist' },
        { id: 'b', label: 'Wenn beide Gleichungen gleich aussehen' },
        { id: 'c', label: 'Nur bei Gleichungen ohne $y$' },
        { id: 'd', label: 'Wenn alle Koeffizienten negativ sind' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was braucht man, um etwas „einzusetzen“?', 'Einen Term für $x$ oder $y$.', 'Steht z. B. schon $y = \\ldots$ da, spart man sich das Umformen.'],
      solution: { steps: [{ text: 'Steht eine Variable schon allein (z. B. $y = 2x + 1$), kann man den Term direkt einsetzen.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Sonderfall verwechselt', feedback: 'Gleich aussehende Gleichungen deuten auf unendlich viele Lösungen hin – das hat mit der Verfahrenswahl nichts zu tun.', answers: ['b'] }],
    },
    {
      id: 'lgs-es-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Ben setzt $y = x + 4$ in $2x - 3y = 1$ ein und schreibt $2x - 3x + 4 = 1$. Was hat er falsch gemacht?',
      choices: [
        { id: 'a', label: 'Er hat die Klammer vergessen: richtig ist $2x - 3(x + 4) = 1$.' },
        { id: 'b', label: 'Er hätte in die erste Gleichung einsetzen müssen.' },
        { id: 'c', label: 'Nichts, das ist richtig.' },
        { id: 'd', label: 'Er hätte $x$ statt $y$ ersetzen müssen.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Ersetze $y$ durch den ganzen Term $x + 4$.', 'Was passiert mit dem Faktor $-3$?', '$-3(x + 4) = -3x - 12$'],
      solution: { steps: [{ text: 'Der eingesetzte Term braucht Klammern: $2x - 3(x + 4) = 1$, also $2x - 3x - 12 = 1$.' }], finalAnswer: 'Klammer vergessen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Fehler nicht erkannt', feedback: 'Ohne Klammer wird nur $x$ mit $-3$ multipliziert, nicht die $4$.', answers: ['c'] }],
    },
    {
      id: 'lgs-es-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Welche Gleichung löst man im System $\\text{I: } 4x + 6y = 2$, $\\text{II: } x - 3y = 5$ am besten zuerst auf?',
      choices: [
        { id: 'a', label: 'II nach $x$: $x = 3y + 5$' },
        { id: 'b', label: 'I nach $x$: $x = \\frac{2 - 6y}{4}$' },
        { id: 'c', label: 'I nach $y$: $y = \\frac{2 - 4x}{6}$' },
        { id: 'd', label: 'Es ist egal, alle sind gleich bequem.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Wo steht eine Variable mit dem Faktor $1$?', 'In II steht $x$ ohne Faktor.', 'So vermeidet man Brüche.'],
      solution: { steps: [{ text: 'In II hat $x$ den Faktor $1$: $x = 3y + 5$ – ohne Brüche. Das macht das Einsetzen am einfachsten.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Brüche in Kauf genommen', feedback: 'Möglich, aber umständlich: Wähle die Variable mit Faktor $1$.', answers: ['b', 'c'] }],
    },
    {
      id: 'lgs-es-4',
      subtopicId: S,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      prompt: `Löse mit dem Einsetzungsverfahren: $\\text{I: } x = 2y + 1$, $\\text{II: } 3x - 4y = 7$. ${PAIR_INPUT}`,
      answer: { kind: 'point', x: 5, y: 2, tolerance: 0.001 },
      hints: ['Setze $2y + 1$ für $x$ in II ein.', '$3(2y + 1) - 4y = 7$', '$2y + 3 = 7$'],
      solution: { steps: [{ text: 'I in II:', math: '3(2y + 1) - 4y = 7 \\;\\Rightarrow\\; 2y + 3 = 7 \\;\\Rightarrow\\; y = 2' }, { text: 'In I:', math: 'x = 2 \\cdot 2 + 1 = 5' }], finalAnswer: '$(5\\,|\\,2)$' },
      objectives: OBJ,
      commonMistakes: [SWAP_MISTAKE(5, 2)],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-es-y',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => substitutionSystem(r, [1, 2, 3, -1, -2]),
      build: ({ x0, y0, m, n, a, b, c }) => ({
        prompt: `Löse mit dem Einsetzungsverfahren: $\\text{I: } y = ${linearTerm(m, n)}$, $\\text{II: } ${eq(a, b, c)}$. ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: [`Ersetze $y$ in II durch $(${linearTerm(m, n)})$.`, 'Löse die Gleichung nach $x$ auf.', 'Setze $x$ in I ein, um $y$ zu erhalten.'],
        solution: { steps: substitutionSteps(m, n, a, b, c, x0, y0), finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-es-schritt',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => substitutionSystem(r, [2, 3, -2, 4]),
      build: ({ m, n, a, b, c }, r) => {
        const sub = `(${linearTerm(m, n)})`;
        const right = `$${linearTerm(a, 0)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : num(Math.abs(b))}${sub} = ${num(c)}$`;
        const noBracket = `$${linearTerm(a, 0)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : num(Math.abs(b))}${linearTerm(m, n)} = ${num(c)}$`;
        const { choices, correctId } = shuffledChoices(r, right, [noBracket, `$${linearTerm(a, 0)} ${signedTerm(b, 'y')} = ${linearTerm(m, n)}$`, `$${linearTerm(m, n)} = ${num(c)}$`]);
        return {
          prompt: `Im System $\\text{I: } y = ${linearTerm(m, n)}$, $\\text{II: } ${eq(a, b, c)}$ wird I in II eingesetzt. Welche Gleichung entsteht?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Ersetze in II jedes $y$ durch den Term aus I.', 'Der Term kommt in Klammern.', `Vor der Klammer steht der Faktor $${b}$.`],
          solution: { steps: [{ text: `$y$ in II durch $${sub}$ ersetzen: ${right}` }], finalAnswer: right },
          commonMistakes: [{ description: 'Klammer vergessen', feedback: 'Ohne Klammer wird nur der erste Summand mit dem Faktor multipliziert.', answers: choices.filter((ch) => ch.label === noBracket).map((ch) => ch.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-es-x',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const x0 = r.int(-5, 6);
        const y0 = r.int(-5, 6);
        const p = r.pick([2, 3, -2, -1, 4]);
        const a = r.int(1, 4) * r.sign();
        let b = r.int(1, 5) * r.sign();
        if (a * p + b === 0) b = -b;
        return { x0, y0, p, q: x0 - p * y0, a, b, c: a * x0 + b * y0 };
      },
      build: ({ x0, y0, p, q, a, b, c }) => {
        const B = a * p + b;
        return {
          prompt: `Löse mit dem Einsetzungsverfahren: $\\text{I: } x = ${linearTerm(p, q, 'y')}$, $\\text{II: } ${eq(a, b, c)}$. ${PAIR_INPUT}`,
          answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
          hints: [`Ersetze $x$ in II durch $(${linearTerm(p, q, 'y')})$.`, 'Löse nach $y$ auf.', 'Setze $y$ in I ein.'],
          solution: {
            steps: [
              { text: 'I in II einsetzen:', math: `${a === 1 ? '' : a === -1 ? '-' : num(a)}(${linearTerm(p, q, 'y')}) ${signedTerm(b, 'y')} = ${num(c)}` },
              { text: 'Ausmultiplizieren und zusammenfassen:', math: `${linearTerm(B, a * q, 'y')} = ${num(c)}` },
              { text: 'Nach $y$ auflösen:', math: `y = ${num(y0)}` },
              { text: 'In I einsetzen:', math: `x = ${num(p)} \\cdot ${y0 < 0 ? `(${y0})` : y0} ${q < 0 ? '-' : '+'} ${num(Math.abs(q))} = ${num(x0)}` },
            ],
            finalAnswer: `$(${x0}\\,|\\,${y0})$`,
          },
          commonMistakes: [SWAP_MISTAKE(x0, y0)],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-es-umformen',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => {
        const s = substitutionSystem(r, [2, 3, -2, -3, 4]);
        return { ...s, a1: -s.m }; // I: a1·x + y = n  ⇔  y = m x + n
      },
      build: ({ x0, y0, m, n, a, b, c, a1 }) => ({
        prompt: `Löse mit dem Einsetzungsverfahren: $\\text{I: } ${eq(a1, 1, n)}$, $\\text{II: } ${eq(a, b, c)}$. ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: ['Löse zuerst I nach $y$ auf.', `$y = ${linearTerm(m, n)}$`, 'Setze den Term in II ein.'],
        solution: { steps: [{ text: 'I nach $y$ auflösen:', math: `y = ${linearTerm(m, n)}` }, ...substitutionSteps(m, n, a, b, c, x0, y0)], finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0), { description: 'Vorzeichenfehler beim Auflösen', feedback: `Beim Auflösen von I wechselt das Vorzeichen: $y = ${linearTerm(m, n)}$.` }],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-es-wahl',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const which = r.pick(['I-x', 'I-y', 'II-x', 'II-y']);
        const big = () => r.pick([2, 3, 4, 5, 6]);
        const coefs = { a1: big(), b1: big(), a2: big(), b2: big() };
        const key = which === 'I-x' ? 'a1' : which === 'I-y' ? 'b1' : which === 'II-x' ? 'a2' : 'b2';
        coefs[key] = 1;
        return { ...coefs, c1: r.int(1, 20), c2: r.int(1, 20), which };
      },
      build: ({ a1, b1, a2, b2, c1, c2, which }, r) => {
        const labels: Record<string, string> = { 'I-x': 'I nach $x$ auflösen', 'I-y': 'I nach $y$ auflösen', 'II-x': 'II nach $x$ auflösen', 'II-y': 'II nach $y$ auflösen' };
        const { choices, correctId } = shuffledChoices(
          r,
          labels[which],
          Object.keys(labels)
            .filter((k) => k !== which)
            .map((k) => labels[k]),
        );
        return {
          prompt: `Gegeben ist $\\text{I: } ${eq(a1, b1, c1)}$, $\\text{II: } ${eq(a2, b2, c2)}$. Mit welchem ersten Schritt vermeidest du beim Einsetzungsverfahren Brüche?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Suche eine Variable mit dem Faktor $1$.', 'Diese kannst du ohne Teilen freistellen.', 'Sonst entstehen beim Teilen Brüche.'],
          solution: { steps: [{ text: `Nur dort steht eine Variable mit dem Faktor $1$: ${labels[which]}.` }], finalAnswer: labels[which] },
          commonMistakes: [{ description: 'Faktor übersehen', feedback: 'Löst man nach einer Variablen mit Faktor ≠ 1 auf, muss man teilen – es entstehen Brüche.' }],
        };
      },
    }),
    ...wordProblemExercises({ id: 'lgs-es-sach', subtopicId: S, count: 10, difficulty: 2, keys: ['alter', 'zahlen', 'rechteck', 'muenzen'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Einsetzungsverfahren' }),
    ...wordProblemExercises({ id: 'lgs-es-sach-schwer', subtopicId: S, count: 8, difficulty: 3, keys: ['tiere', 'eintritt', 'konzert'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Einsetzungsverfahren' }),
  ],
};
