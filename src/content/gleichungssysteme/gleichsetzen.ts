import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, round, shuffledChoices } from '../templates';
import { eq, equateSteps, PAIR_INPUT, SWAP_MISTAKE, TOPIC_ID, wordProblemExercises } from './shared';

const S = 'lgs-gleichsetzen';
const OBJ = ['Gleichungssysteme mit dem Gleichsetzungsverfahren lösen'];

/** I: y = m1·x + n1, II: y = m2·x + n2 mit ganzzahliger Lösung. */
function twoLines(r: { int(a: number, b: number): number; pick<T>(a: readonly T[]): T }, ms: number[]) {
  const x0 = r.int(-5, 6);
  const y0 = r.int(-8, 8);
  const m1 = r.pick(ms);
  let m2 = r.pick(ms);
  if (m2 === m1) m2 = m1 + r.pick([1, 2, -1]);
  return { x0, y0, m1, n1: y0 - m1 * x0, m2, n2: y0 - m2 * x0 };
}

export const gleichsetzen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 4,
  title: 'Gleichsetzungsverfahren',
  description: 'Beide Gleichungen nach derselben Variablen auflösen und die Terme gleichsetzen.',
  objective: 'Du löst lineare Gleichungssysteme rechnerisch mit dem Gleichsetzungsverfahren.',
  intro:
    'Sind beide Gleichungen nach derselben Variablen aufgelöst, etwa $y = 2x + 1$ und $y = -x + 7$, müssen die rechten Seiten gleich sein – sonst wäre $y$ nicht derselbe Wert. Man setzt die Terme gleich und erhält eine Gleichung mit nur einer Variablen.',
  rules: [
    { term: 'Schritt 1', explanation: 'Beide Gleichungen nach derselben Variablen auflösen.' },
    { term: 'Schritt 2', explanation: 'Die beiden Terme gleichsetzen.' },
    { term: 'Schritt 3', explanation: 'Die Gleichung lösen.' },
    { term: 'Schritt 4', explanation: 'Das Ergebnis in eine der Gleichungen einsetzen; Probe machen.' },
  ],
  materials: [videoPlaceholder('lgs-gleichsetzen-v1', 'Das Gleichsetzungsverfahren')],
  example: {
    problem: 'Löse $\\text{I: } y = 2x + 1$ und $\\text{II: } y = -x + 7$.',
    steps: [
      { text: 'Gleichsetzen:', math: '2x + 1 = -x + 7' },
      { text: 'Lösen:', math: '3x = 6 \\;\\Rightarrow\\; x = 2' },
      { text: 'Einsetzen:', math: 'y = 2 \\cdot 2 + 1 = 5' },
    ],
    result: 'Lösung: $(2\\,|\\,5)$',
  },
  summary: ['Beide nach derselben Variablen auflösen, dann gleichsetzen.', 'Besonders günstig, wenn beide schon in der Form $y = \\ldots$ vorliegen.', 'Das entspricht dem Schnittpunkt zweier Geraden.'],
  exercises: [
    {
      id: 'lgs-gs-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wann bietet sich das Gleichsetzungsverfahren an?',
      choices: [
        { id: 'a', label: 'Wenn beide Gleichungen nach derselben Variablen aufgelöst sind' },
        { id: 'b', label: 'Wenn die Koeffizienten vor $y$ Gegenzahlen sind' },
        { id: 'c', label: 'Nur wenn keine Lösung existiert' },
        { id: 'd', label: 'Wenn eine Gleichung keine Variable enthält' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['„Gleichsetzen“ – was wird gleichgesetzt?', 'Zwei Terme für dieselbe Variable.', 'Zum Beispiel $y = \\ldots$ und $y = \\ldots$'],
      solution: { steps: [{ text: 'Liegen beide Gleichungen als $y = \\ldots$ (oder $x = \\ldots$) vor, setzt man die rechten Seiten direkt gleich.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Additionsverfahren verwechselt', feedback: 'Gegenzahlen vor $y$ sind der typische Fall für das Additionsverfahren.', answers: ['b'] }],
    },
    {
      id: 'lgs-gs-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Warum entspricht das Gleichsetzen von $y = m_1 x + n_1$ und $y = m_2 x + n_2$ der Suche nach dem Schnittpunkt der Geraden?',
      choices: [
        { id: 'a', label: 'Im Schnittpunkt haben beide Geraden bei gleichem $x$ denselben $y$-Wert.' },
        { id: 'b', label: 'Weil beide Geraden dieselbe Steigung haben.' },
        { id: 'c', label: 'Weil man dabei die Nullstellen berechnet.' },
        { id: 'd', label: 'Das hat mit dem Schnittpunkt nichts zu tun.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was gilt für einen Punkt, der auf beiden Geraden liegt?', 'Gleiches $x$, gleiches $y$.', 'Also $m_1 x + n_1 = m_2 x + n_2$.'],
      solution: { steps: [{ text: 'Ein gemeinsamer Punkt hat für beide Geraden dasselbe $x$ und dasselbe $y$ – genau das drückt die Gleichung $m_1 x + n_1 = m_2 x + n_2$ aus.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit Nullstellen verwechselt', feedback: 'Für Nullstellen setzt man $y = 0$ – hier werden zwei Terme gleichgesetzt.', answers: ['c'] }],
    },
    {
      id: 'lgs-gs-3',
      subtopicId: S,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      prompt: `Löse mit dem Gleichsetzungsverfahren: $\\text{I: } x = 3y - 2$, $\\text{II: } x = -y + 6$. ${PAIR_INPUT}`,
      answer: { kind: 'point', x: 4, y: 2, tolerance: 0.001 },
      hints: ['Beide Gleichungen sind nach $x$ aufgelöst.', '$3y - 2 = -y + 6$', '$4y = 8$'],
      solution: { steps: [{ text: 'Gleichsetzen:', math: '3y - 2 = -y + 6 \\;\\Rightarrow\\; 4y = 8 \\;\\Rightarrow\\; y = 2' }, { text: 'Einsetzen in II:', math: 'x = -2 + 6 = 4' }], finalAnswer: '$(4\\,|\\,2)$' },
      objectives: OBJ,
      commonMistakes: [SWAP_MISTAKE(4, 2)],
    },
    {
      id: 'lgs-gs-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Handytarif A: $y = 0{,}1x + 8$, Tarif B: $y = 0{,}3x$ ($x$ = Minuten, $y$ = Kosten in €). Bei wie vielen Minuten kosten beide gleich viel?',
      answer: { kind: 'numeric', value: 40, tolerance: 0.001, unit: 'min' },
      hints: ['Setze die beiden Terme gleich.', '$0{,}1x + 8 = 0{,}3x$', '$8 = 0{,}2x$'],
      solution: { steps: [{ text: 'Gleichsetzen:', math: '0{,}1x + 8 = 0{,}3x \\;\\Rightarrow\\; 8 = 0{,}2x \\;\\Rightarrow\\; x = 40' }], finalAnswer: '$40$ Minuten' },
      objectives: [...OBJ, 'Sachaufgaben mit LGS'],
      commonMistakes: [{ description: 'Durch den falschen Preis geteilt', feedback: 'Teile die $8$ € durch den Preisunterschied $0{,}2$ €.', answers: ['80', '26,67'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-gs-y',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => twoLines(r, [1, 2, 3, -1, -2, -3]),
      build: ({ x0, y0, m1, n1, m2, n2 }) => ({
        prompt: `Löse mit dem Gleichsetzungsverfahren: $\\text{I: } y = ${linearTerm(m1, n1)}$, $\\text{II: } y = ${linearTerm(m2, n2)}$. ${PAIR_INPUT}`,
        answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
        hints: ['Setze die beiden rechten Seiten gleich.', `$${linearTerm(m1, n1)} = ${linearTerm(m2, n2)}$`, 'Berechne $x$ und setze es in I ein.'],
        solution: { steps: equateSteps(m1, n1, m2, n2, x0, y0), finalAnswer: `$(${x0}\\,|\\,${y0})$` },
        commonMistakes: [SWAP_MISTAKE(x0, y0)],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-gs-ansatz',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => twoLines(r, [2, 3, -1, -2, 4]),
      build: ({ m1, n1, m2, n2 }, r) => {
        const right = `$${linearTerm(m1, n1)} = ${linearTerm(m2, n2)}$`;
        const { choices, correctId } = shuffledChoices(r, right, [`$${linearTerm(m1 + m2, n1 + n2)} = 0$`, `$${linearTerm(m1, n1)} = 0$`, `$${linearTerm(m1, n2)} = ${linearTerm(m2, n1)}$`]);
        return {
          prompt: `Welcher Ansatz gehört zum Gleichsetzungsverfahren für $\\text{I: } y = ${linearTerm(m1, n1)}$ und $\\text{II: } y = ${linearTerm(m2, n2)}$?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Beide Gleichungen beginnen mit $y = $.', 'Die rechten Seiten müssen gleich sein.', 'Schreibe sie mit einem Gleichheitszeichen zusammen.'],
          solution: { steps: [{ text: `Rechte Seiten gleichsetzen: ${right}` }], finalAnswer: right },
          commonMistakes: [{ description: 'Nullstelle statt Gleichsetzen', feedback: 'Hier wird nicht null gesetzt, sondern Term gleich Term.' }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gs-umformen',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ ...twoLines(r, [1, 2, 3, -1, -2]), form: r.int(0, 1) }),
      build: ({ x0, y0, m1, n1, m2, n2, form }) => {
        // I bleibt y = …, II wird als „y − m₂x = n₂“ bzw. „−m₂x + y = n₂“ angegeben
        const second = form === 0 ? `y ${m2 < 0 ? '+' : '-'} ${Math.abs(m2) === 1 ? '' : num(Math.abs(m2))}x = ${num(n2)}` : eq(-m2, 1, n2);
        return {
          prompt: `Löse mit dem Gleichsetzungsverfahren: $\\text{I: } y = ${linearTerm(m1, n1)}$, $\\text{II: } ${second}$. ${PAIR_INPUT}`,
          answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
          hints: ['Löse zuerst II nach $y$ auf.', `II: $y = ${linearTerm(m2, n2)}$`, 'Setze dann die Terme gleich.'],
          solution: { steps: [{ text: 'II nach $y$ auflösen:', math: `y = ${linearTerm(m2, n2)}` }, ...equateSteps(m1, n1, m2, n2, x0, y0)], finalAnswer: `$(${x0}\\,|\\,${y0})$` },
          commonMistakes: [SWAP_MISTAKE(x0, y0)],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gs-normalform',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ ...twoLines(r, [1, 2, -1, -2, 0.5, -0.5]), k1: r.pick([2, 3]), k2: r.pick([2, -2, 4]) }),
      build: ({ x0, y0, m1, n1, m2, n2, k1, k2 }) => {
        const e1 = eq(round(-k1 * m1, 4), k1, round(k1 * n1, 4));
        const e2 = eq(round(-k2 * m2, 4), k2, round(k2 * n2, 4));
        return {
          prompt: `Löse mit dem Gleichsetzungsverfahren: $\\text{I: } ${e1}$, $\\text{II: } ${e2}$. ${PAIR_INPUT}`,
          answer: { kind: 'point', x: x0, y: y0, tolerance: 0.001 },
          hints: ['Löse beide Gleichungen nach $y$ auf.', `I: $y = ${linearTerm(m1, n1)}$, II: $y = ${linearTerm(m2, n2)}$`, 'Setze die Terme gleich.'],
          solution: { steps: [{ text: 'Beide nach $y$ auflösen:', math: `\\text{I: } y = ${linearTerm(m1, n1)}, \\quad \\text{II: } y = ${linearTerm(m2, n2)}` }, ...equateSteps(m1, n1, m2, n2, x0, y0)], finalAnswer: `$(${x0}\\,|\\,${y0})$` },
          commonMistakes: [SWAP_MISTAKE(x0, y0)],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gs-fehler',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => twoLines(r, [2, 3, 4, 5]), // nur positive Steigungen: m₁ + m₂ ≠ 0
      build: ({ m1, n1, m2, n2 }, r) => {
        const wrongA = m1 + m2; // Vorzeichenfehler beim Herüberbringen
        const right = 'Beim Herüberbringen von $x$ wurde das Vorzeichen nicht gewechselt.';
        const { choices, correctId } = shuffledChoices(r, right, ['Man hätte die Terme addieren müssen.', 'Man hätte nach $x$ statt nach $y$ auflösen müssen.', 'Die Rechnung ist richtig.']);
        return {
          prompt: `Mia löst $\\text{I: } y = ${linearTerm(m1, n1)}$, $\\text{II: } y = ${linearTerm(m2, n2)}$ und schreibt: $${linearTerm(m1, n1)} = ${linearTerm(m2, n2)} \\;\\Rightarrow\\; ${linearTerm(wrongA, 0)} = ${num(n2 - n1)}$. Was ist falsch?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: [`Bringe $${linearTerm(m2, 0)}$ auf die linke Seite.`, `Dabei wird aus $${linearTerm(m2, 0)}$ ein $${linearTerm(-m2, 0)}$.`, `Richtig wäre $${linearTerm(m1 - m2, 0)} = ${num(n2 - n1)}$.`],
          solution: { steps: [{ text: `Richtig: $${linearTerm(m1 - m2, 0)} = ${num(n2 - n1)}$. Mia hat $${linearTerm(m2, 0)}$ addiert statt abgezogen.` }], finalAnswer: right },
          commonMistakes: [{ description: 'Fehler nicht gefunden', feedback: 'Prüfe, was beim Herüberbringen mit dem Vorzeichen passiert.', answers: choices.filter((c) => c.label === 'Die Rechnung ist richtig.').map((c) => c.id) }],
        };
      },
    }),
    ...wordProblemExercises({ id: 'lgs-gs-sach', subtopicId: S, count: 10, difficulty: 2, keys: ['zahlen', 'alter', 'muenzen'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Gleichsetzungsverfahren (beide Gleichungen nach $y$ auflösen)' }),
    ...wordProblemExercises({ id: 'lgs-gs-sach-schwer', subtopicId: S, count: 8, difficulty: 3, keys: ['schreibwaren', 'saft', 'rechteck'], objectives: [...OBJ, 'Sachaufgaben mit LGS'], method: 'z. B. mit dem Gleichsetzungsverfahren' }),
  ],
};
