import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, round, shuffledChoices, txt } from '../templates';
import { fx, plane, READABLE_SLOPES, slopeFraction, TOPIC_ID, yx } from './shared';
import { lineDrawing } from '../drawing';

const S = 'lf-steigung';
const OBJ = ['Steigung und y-Achsenabschnitt deuten', 'Steigungsdreieck nutzen'];

/** Gerade y = mx + b in verschiedenen Schreibweisen, damit nicht nur die Normalform geübt wird. */
function written(m: number, b: number, form: number): string {
  if (form === 1 && b !== 0) return `f(x) = ${num(b)} ${m < 0 ? '-' : '+'} ${Math.abs(m) === 1 ? '' : num(Math.abs(m))}x`;
  if (form === 2) return `y = ${linearTerm(m, b)}`;
  return fx(m, b);
}

export const steigung: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 3,
  title: 'Steigung und y-Achsenabschnitt',
  description: 'Was $m$ und $b$ in $f(x) = mx + b$ bedeuten: Steigungsdreieck, Steigung aus zwei Punkten, Steigung in Prozent.',
  objective: 'Du liest Steigung und $y$-Achsenabschnitt ab, berechnest die Steigung aus zwei Punkten und deutest sie.',
  intro:
    'Der Graph von $f(x) = mx + b$ ist eine Gerade. $b$ verrät, wo sie die $y$-Achse schneidet. $m$ verrät, wie steil sie ist: Gehst du $1$ nach rechts, geht es $m$ nach oben (oder bei negativem $m$ nach unten).',
  rules: [
    { term: 'Lineare Funktion', explanation: '', math: 'f(x) = mx + b' },
    { term: '$y$-Achsenabschnitt $b$', explanation: 'Die Gerade schneidet die $y$-Achse im Punkt $(0\\,|\\,b)$.' },
    { term: 'Steigung $m$', explanation: '$m > 0$: steigend, $m < 0$: fallend, $m = 0$: waagerecht.' },
    { term: 'Steigung aus zwei Punkten', explanation: '', math: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
    { term: 'Steigung in Prozent', explanation: '$m = 0{,}08$ entspricht $8\\,\\%$: $8$ m Höhe auf $100$ m waagerechte Strecke.' },
  ],
  materials: [videoPlaceholder('lf-steigung-v1', 'Steigung und Steigungsdreieck')],
  example: {
    problem: 'Bestimme die Steigung der Geraden durch $A(1\\,|\\,2)$ und $B(4\\,|\\,8)$.',
    steps: [{ text: 'Differenzen bilden:', math: 'm = \\frac{8 - 2}{4 - 1} = \\frac{6}{3} = 2' }],
    result: 'Die Steigung ist $m = 2$: pro Schritt nach rechts geht es $2$ nach oben.',
  },
  summary: ['$b$: Schnittpunkt mit der $y$-Achse $(0\\,|\\,b)$.', '$m = \\frac{y_2 - y_1}{x_2 - x_1}$', 'Gleiche Steigung ⇒ parallele Geraden.'],
  exercises: [
    {
      id: 'lf-st-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was gibt $b$ in $f(x) = mx + b$ an?',
      choices: [
        { id: 'a', label: 'Den Schnittpunkt mit der $y$-Achse' },
        { id: 'b', label: 'Den Schnittpunkt mit der $x$-Achse' },
        { id: 'c', label: 'Wie steil die Gerade ist' },
        { id: 'd', label: 'Den größten Funktionswert' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Setze $x = 0$ ein.', '$f(0) = m \\cdot 0 + b$', 'Der Punkt $(0\\,|\\,b)$ liegt auf der $y$-Achse.'],
      solution: { steps: [{ text: '$f(0) = b$, also schneidet die Gerade die $y$-Achse im Punkt $(0\\,|\\,b)$.' }], finalAnswer: '$y$-Achsenabschnitt' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit Nullstelle verwechselt', feedback: 'Der Schnittpunkt mit der $x$-Achse ist die Nullstelle – die erhält man aus $f(x) = 0$.', answers: ['b'] }],
    },
    {
      id: 'lf-st-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Die Steigung einer Geraden ist negativ. Was bedeutet das?',
      choices: [
        { id: 'a', label: 'Die Gerade fällt von links nach rechts.' },
        { id: 'b', label: 'Die Gerade steigt von links nach rechts.' },
        { id: 'c', label: 'Die Gerade liegt unterhalb der $x$-Achse.' },
        { id: 'd', label: 'Die Gerade ist waagerecht.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Gehe $1$ nach rechts. In welche Richtung geht es dann bei $m < 0$?', 'Bei $m = -2$ geht es $2$ nach unten.', 'Von links nach rechts gelesen …'],
      solution: { steps: [{ text: 'Bei $m < 0$ wird $y$ kleiner, wenn $x$ größer wird: Die Gerade fällt.' }], finalAnswer: 'Sie fällt.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Lage mit Richtung verwechselt', feedback: 'Eine fallende Gerade kann trotzdem oberhalb der $x$-Achse beginnen.', answers: ['c'] }],
    },
    {
      id: 'lf-st-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Welche Geraden sind zueinander parallel?',
      choices: [
        { id: 'a', label: '$y = 2x + 1$ und $y = 2x - 3$' },
        { id: 'b', label: '$y = 2x + 1$ und $y = -2x + 1$' },
        { id: 'c', label: '$y = 2x + 1$ und $y = x + 2$' },
        { id: 'd', label: '$y = 2x + 1$ und $y = \\frac{1}{2}x + 1$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Parallele Geraden sind gleich steil.', 'Vergleiche die Zahlen vor dem $x$.', 'Gleiche Steigung, verschiedener $y$-Achsenabschnitt.'],
      solution: { steps: [{ text: 'Parallele Geraden haben die gleiche Steigung. Nur in a) ist beide Male $m = 2$.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gleichen y-Achsenabschnitt gewählt', feedback: 'Gleiches $b$ heißt nur: gleicher Schnittpunkt mit der $y$-Achse. Für parallel braucht es gleiches $m$.', answers: ['b', 'd'] }],
    },
    {
      id: 'lf-st-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 2,
      prompt: 'Wie zeichnet man ein Steigungsdreieck für $m = \\frac{2}{3}$?',
      choices: [
        { id: 'a', label: '$3$ nach rechts, $2$ nach oben' },
        { id: 'b', label: '$2$ nach rechts, $3$ nach oben' },
        { id: 'c', label: '$3$ nach rechts, $2$ nach unten' },
        { id: 'd', label: '$2$ nach links, $3$ nach unten' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$m = \\frac{\\text{Höhe}}{\\text{Breite}}$', 'Der Nenner gibt die Schritte nach rechts an.', 'Der Zähler ist positiv – also nach oben.'],
      solution: { steps: [{ text: '$m = \\frac{2}{3}$: Nenner $3$ = nach rechts, Zähler $2$ = nach oben.' }], finalAnswer: '$3$ nach rechts, $2$ nach oben' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Zähler und Nenner vertauscht', feedback: 'Zuerst nach rechts (Nenner), dann nach oben (Zähler).', answers: ['b'] }],
    },
    {
      id: 'lf-st-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Eine Rollstuhlrampe hat eine Steigung von $6\\,\\%$. Wie viele Zentimeter steigt sie auf $5$ m waagerechter Länge?',
      answer: { kind: 'numeric', value: 30, tolerance: 0.001, unit: 'cm' },
      hints: ['$6\\,\\%$ bedeutet $m = 0{,}06$.', '$5$ m sind $500$ cm.', 'Rechne $0{,}06 \\cdot 500$.'],
      solution: { steps: [{ text: 'Steigung als Dezimalzahl: $m = 0{,}06$.' }, { text: 'Höhe:', math: '0{,}06 \\cdot 500\\,\\text{cm} = 30\\,\\text{cm}' }], finalAnswer: '$30$ cm' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Einheiten nicht umgerechnet', feedback: 'Rechne die $5$ m in Zentimeter um, bevor du mit $0{,}06$ multiplizierst.', answers: ['0,3'] }],
    },
    {
      id: 'lf-st-6',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Eine Gerade hat die Steigung $m = 0$ und geht durch $(0\\,|\\,2)$. Was stimmt?',
      choices: [
        { id: 'a', label: 'Sie verläuft parallel zur $x$-Achse.' },
        { id: 'b', label: 'Sie verläuft parallel zur $y$-Achse.' },
        { id: 'c', label: 'Sie geht durch den Ursprung.' },
        { id: 'd', label: 'Sie hat keinen Schnittpunkt mit der $y$-Achse.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Die Gleichung lautet $y = 0 \\cdot x + 2$.', 'Welchen Wert hat $y$ für jedes $x$?', 'Immer $y = 2$.'],
      solution: { steps: [{ text: '$y = 2$ für alle $x$: Die Gerade ist waagerecht, also parallel zur $x$-Achse.' }], finalAnswer: 'parallel zur $x$-Achse' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Achsen verwechselt', feedback: 'Eine Gerade parallel zur $y$-Achse wäre senkrecht – das ist gar keine Funktion.', answers: ['b'] }],
    },
    {
      id: 'lf-st-7',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Straßenschild warnt vor $12\\,\\%$ Steigung. Wie viele Meter Höhenunterschied sind das auf $2{,}5$ km waagerechter Strecke?',
      answer: { kind: 'numeric', value: 300, tolerance: 0.001, unit: 'm' },
      hints: ['$12\\,\\% = 0{,}12$', '$2{,}5$ km $= 2500$ m', '$0{,}12 \\cdot 2500$'],
      solution: { steps: [{ text: 'Höhe = Steigung · waagerechte Strecke:', math: '0{,}12 \\cdot 2500\\,\\text{m} = 300\\,\\text{m}' }], finalAnswer: '$300$ m' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Kilometer nicht umgerechnet', feedback: 'Rechne die Strecke zuerst in Meter um.', answers: ['0,3'] }],
    },
    {
      id: 'lf-st-8',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was bedeutet $b = 0$ in $f(x) = mx + b$?',
      choices: [
        { id: 'a', label: 'Die Gerade geht durch den Ursprung.' },
        { id: 'b', label: 'Die Gerade ist waagerecht.' },
        { id: 'c', label: 'Die Gerade fällt.' },
        { id: 'd', label: 'Es gibt keine Gerade.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was ist $f(0)$ für $b = 0$?', '$f(0) = 0$', 'Der Punkt $(0\\,|\\,0)$ …'],
      solution: { steps: [{ text: 'Mit $b = 0$ ist $f(0) = 0$: Die Gerade geht durch den Ursprung (proportionale Funktion).' }], finalAnswer: 'durch den Ursprung' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit m = 0 verwechselt', feedback: 'Waagerecht ist eine Gerade bei $m = 0$, nicht bei $b = 0$.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-st-m-ablesen',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([-4, -3, -2, -1, 2, 3, 4, 5, 0.5, -0.5, 1.5]), b: r.int(1, 9) * r.sign(), form: r.int(0, 2) }),
      build: ({ m, b, form }) => ({
        prompt: `Gib die Steigung $m$ von $${written(m, b, form)}$ an.`,
        answer: { kind: 'numeric', value: m, tolerance: 0.001 },
        hints: ['Die Steigung ist die Zahl vor dem $x$.', 'Das Vorzeichen gehört dazu.', 'Die Reihenfolge der Summanden spielt keine Rolle.'],
        solution: { steps: [{ text: `Zahl vor dem $x$: $m = ${num(m)}$.` }], finalAnswer: `$m = ${num(m)}$` },
        commonMistakes: [{ description: 'y-Achsenabschnitt genannt', feedback: 'Die Zahl ohne $x$ ist der $y$-Achsenabschnitt $b$.', answers: [txt(b)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-st-b-ablesen',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ m: r.int(2, 6) * r.sign(), b: r.pick([-7, -5, -4, -2, -1, 1, 3, 4, 6, 8, 1.5, -2.5]), form: r.int(0, 2) }),
      build: ({ m, b, form }) => ({
        prompt: `In welchem Punkt $(0\\,|\\,b)$ schneidet der Graph von $${written(m, b, form)}$ die $y$-Achse? Gib $b$ an.`,
        answer: { kind: 'numeric', value: b, tolerance: 0.001 },
        hints: ['Setze $x = 0$ ein.', 'Der Summand ohne $x$ ist der $y$-Achsenabschnitt.', 'Das Vorzeichen gehört dazu.'],
        solution: { steps: [{ text: `$f(0) = ${num(b)}$, also $b = ${num(b)}$.` }], finalAnswer: `$b = ${num(b)}$` },
        commonMistakes: [{ description: 'Steigung genannt', feedback: 'Die Zahl vor dem $x$ ist die Steigung, nicht der Achsenabschnitt.', answers: [txt(m)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-st-graph',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      objectives: [...OBJ, 'Funktionsgleichung aus dem Graphen ablesen'],
      params: (r) => {
        const slope = r.pick(READABLE_SLOPES.filter(([p, q]) => q <= 2 && Math.abs(p) <= 3));
        return { slope, b: r.int(Math.max(-3, -4 - slope[0]), Math.min(3, 4 - slope[0])) }; // Q bleibt im Ausschnitt −5 … 5
      },
      build: ({ slope: [p, q], b }) => {
        const m = p / q;
        return {
          prompt: `Die abgebildete Gerade schneidet die $y$-Achse bei $${b}$ und geht durch $Q(${q}\\,|\\,${b + p})$. Gib ihre Gleichung in der Form $y = mx + b$ an.`,
          figure: plane(`Koordinatensystem mit einer Geraden durch (0|${b}) und (${q}|${b + p}).`, [{ m, b }], [{ x: 0, y: b }, { x: q, y: b + p, label: 'Q' }]),
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: [`Der $y$-Achsenabschnitt ist $b = ${b}$.`, `Von $(0\\,|\\,${b})$ nach $Q$: $${q}$ nach rechts, $${Math.abs(p)}$ nach ${p > 0 ? 'oben' : 'unten'}.`, `$m = \\frac{${p}}{${q}}$`],
          solution: { steps: [{ text: 'Achsenabschnitt ablesen:', math: `b = ${b}` }, { text: 'Steigungsdreieck:', math: `m = \\frac{${p}}{${q}} = ${num(m)}` }], finalAnswer: `$${yx(m, b)}$` },
          commonMistakes: [{ description: 'Steigungsdreieck falsch herum', feedback: 'Steigung = Höhe geteilt durch Breite (nach rechts).', answers: [`y = ${txt(round(q / p, 4))}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-st-zwei-punkte',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Steigung aus zwei Punkten'],
      params: (r) => {
        const m = r.pick([-3, -2, -1, 1, 2, 3, 4, 0.5, -0.5, 1.5]);
        const x1 = r.int(-5, 3);
        const dx = r.pick([2, 4, 6]);
        const y1 = r.int(-6, 6);
        return { x1, y1, x2: x1 + dx, y2: y1 + m * dx };
      },
      build: ({ x1, y1, x2, y2 }) => {
        const m = (y2 - y1) / (x2 - x1);
        return {
          prompt: `Berechne die Steigung der Geraden durch $A(${x1}\\,|\\,${y1})$ und $B(${x2}\\,|\\,${num(y2)})$.`,
          answer: { kind: 'numeric', value: m, tolerance: 0.001 },
          hints: ['$m = \\frac{y_2 - y_1}{x_2 - x_1}$', `Oben: $${num(y2)} - ${y1 < 0 ? `(${y1})` : y1}$, unten: $${x2} - ${x1 < 0 ? `(${x1})` : x1}$.`, 'Klammern um negative Zahlen setzen.'],
          solution: { steps: [{ text: 'Formel anwenden:', math: slopeFraction(x1, y1, x2, y2) }], finalAnswer: `$m = ${num(m)}$` },
          commonMistakes: [{ description: 'x- und y-Differenz vertauscht', feedback: 'Die $y$-Differenz steht im Zähler, die $x$-Differenz im Nenner.', answers: [txt(round(1 / m, 4))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-st-graph-bruch',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'construction',
      difficulty: 3,
      objectives: [...OBJ, 'Steigung aus dem Graphen ablesen'],
      params: (r) => ({ slope: r.pick(READABLE_SLOPES.filter(([, q]) => q >= 2)), b: r.int(-2, 2) }),
      build: ({ slope: [p, q], b }) => {
        const m = p / q;
        return {
          prompt: `Die abgebildete Gerade geht durch $A(0\\,|\\,${b})$ und $B(${q}\\,|\\,${b + p})$. Bestimme ihre Steigung (als Bruch oder Dezimalzahl).`,
          figure: plane(`Koordinatensystem mit einer Geraden durch A(0|${b}) und B(${q}|${b + p}).`, [{ m, b }], [{ x: 0, y: b, label: 'A' }, { x: q, y: b + p, label: 'B' }]),
          answer: { kind: 'numeric', value: m, tolerance: 0.01 },
          hints: ['Zeichne ein Steigungsdreieck von $A$ nach $B$.', `Nach rechts: $${q}$, nach ${p > 0 ? 'oben' : 'unten'}: $${Math.abs(p)}$.`, `$m = \\frac{${p}}{${q}}$ – als Eingabe geht auch ${p}/${q}.`],
          solution: { steps: [{ text: 'Steigungsdreieck:', math: `m = \\frac{${p}}{${q}} \\approx ${num(m)}` }], finalAnswer: `$m = ${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}$` },
          commonMistakes: [{ description: 'Kehrwert', feedback: 'Höhe geteilt durch Breite – nicht umgekehrt.', answers: [`${q}/${p}`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-st-prozent',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Steigung in Prozent'],
      params: (r) => {
        const percent = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
        const run = r.pick([50, 80, 100, 120, 150, 200, 250, 400]);
        return { percent, run, what: r.pick(['Eine Straße', 'Ein Radweg', 'Eine Zufahrt', 'Ein Wanderweg']) };
      },
      build: ({ percent, run, what }) => {
        const rise = (percent * run) / 100;
        return {
          prompt: `${what} steigt auf $${run}$ m waagerechter Strecke um $${num(rise)}$ m an. Wie groß ist die Steigung in Prozent?`,
          answer: { kind: 'numeric', value: percent, tolerance: 0.001, unit: '%' },
          hints: ['Steigung = Höhenunterschied : waagerechte Strecke.', `$m = \\frac{${num(rise)}}{${run}}$`, 'Multipliziere mit $100$ für Prozent.'],
          solution: { steps: [{ text: 'Steigung berechnen:', math: `m = \\frac{${num(rise)}}{${run}} = ${num(percent / 100)} = ${percent}\\,\\%` }], finalAnswer: `$${percent}\\,\\%$` },
          commonMistakes: [{ description: 'Nicht in Prozent umgerechnet', feedback: 'Das Ergebnis als Dezimalzahl noch mit $100$ multiplizieren.', answers: [txt(percent / 100)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-st-hoehe',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Steigung in Prozent'],
      params: (r) => ({ percent: r.pick([3, 6, 7, 8, 9, 14, 16, 18]), km: r.pick([0.5, 1.2, 1.5, 2, 2.5, 3.5]) }),
      build: ({ percent, km }) => {
        const rise = round((percent / 100) * km * 1000, 2);
        return {
          prompt: `Eine Bergstraße hat durchgehend $${percent}\\,\\%$ Steigung. Wie viele Höhenmeter überwindet man auf $${num(km)}$ km waagerechter Strecke?`,
          answer: { kind: 'numeric', value: rise, tolerance: 0.01, unit: 'm' },
          hints: [`$${percent}\\,\\% = ${num(percent / 100)}$`, `$${num(km)}$ km $= ${num(km * 1000)}$ m`, `$${num(percent / 100)} \\cdot ${num(km * 1000)}$`],
          solution: { steps: [{ text: 'Höhe = Steigung · Strecke:', math: `${num(percent / 100)} \\cdot ${num(km * 1000)}\\,\\text{m} = ${num(rise)}\\,\\text{m}` }], finalAnswer: `$${num(rise)}$ m` },
          commonMistakes: [{ description: 'Kilometer nicht in Meter umgerechnet', feedback: 'Rechne die Strecke zuerst in Meter um.', answers: [txt(round((percent / 100) * km, 4))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-st-parallel',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      objectives: [...OBJ, 'Parallele Geraden erkennen'],
      params: (r) => ({ m: r.int(2, 5) * r.sign(), b: r.int(-5, 5), b2: r.int(1, 6) }),
      build: ({ m, b, b2 }, r) => {
        const c = b + b2;
        const { choices, correctId } = shuffledChoices(r, `$${yx(m, c)}$`, [`$${yx(-m, b)}$`, `$${yx(round(1 / m, 4), b)}$`, `$${yx(m + 1, c)}$`]);
        return {
          prompt: `Welche Gerade ist parallel zu $${yx(m, b)}$?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Parallele Geraden haben dieselbe Steigung.', `Gesucht ist eine Gerade mit $m = ${m}$.`, 'Der $y$-Achsenabschnitt darf anders sein.'],
          solution: { steps: [{ text: `Gleiche Steigung $m = ${m}$, anderer Achsenabschnitt ⇒ parallel: $${yx(m, c)}$.` }], finalAnswer: `$${yx(m, c)}$` },
          commonMistakes: [{ description: 'Gegenzahl der Steigung gewählt', feedback: '$m$ und $-m$ sind verschiedene Steigungen – solche Geraden schneiden sich.', answers: choices.filter((ch) => ch.label === `$${yx(-m, b)}$`).map((ch) => ch.id) }],
        };
      },
    }),
    // ------------------------------------------------------------ Graph zeichnen (KI-Korrektur)
    ...fromTemplate({
      id: 'lf-st-zeichnen',
      subtopicId: S,
      count: 10,
      type: 'handwriting',
      requirement: 'construction',
      difficulty: 2,
      objectives: ['Graphen linearer Funktionen zeichnen'],
      params: (r) => {
        const [rise, run] = r.pick([[1, 1], [2, 1], [-1, 1], [-2, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3]] as [number, number][]);
        return { rise, run, b: r.int(-3, 3) };
      },
      build: ({ rise, run, b }) => lineDrawing(rise / run, b, run, rise),
    }),
  ],
};
