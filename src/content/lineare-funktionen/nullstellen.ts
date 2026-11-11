import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, txt } from '../templates';
import { fx, plane, TOPIC_ID } from './shared';

const S = 'lf-nullstellen';
const OBJ = ['Nullstellen berechnen', 'Schnittpunkte von Geraden bestimmen'];

/** Rechenweg Nullstelle: mx + b = 0 ⇒ x = −b/m. */
function zeroSteps(m: number, b: number) {
  const x0 = -b / m;
  return [
    { text: 'Funktionswert null setzen:', math: `${linearTerm(m, b)} = 0` },
    { text: `${b > 0 ? `$-${num(b)}$` : `$+${num(-b)}$`} auf beiden Seiten:`, math: `${linearTerm(m, 0)} = ${num(-b)}` },
    { text: `Durch $${num(m)}$ teilen:`, math: `x = ${num(x0)}` },
  ];
}

export const nullstellen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 5,
  title: 'Nullstellen und Schnittpunkte',
  description: 'Wo schneidet eine Gerade die Achsen? Wo schneiden sich zwei Geraden?',
  objective: 'Du berechnest Nullstellen, Achsenschnittpunkte und den Schnittpunkt zweier Geraden.',
  intro:
    'Die Nullstelle ist die Stelle, an der der Graph die $x$-Achse schneidet – dort ist $f(x) = 0$. Zwei Geraden schneiden sich dort, wo beide denselben $y$-Wert haben: Man setzt die Funktionsterme gleich.',
  rules: [
    { term: 'Nullstelle', explanation: 'Löse $f(x) = 0$. Für $f(x) = mx + b$ mit $m \\neq 0$:', math: 'x_0 = -\\frac{b}{m}' },
    { term: 'Schnittpunkt mit der $y$-Achse', explanation: '$S_y(0\\,|\\,b)$' },
    { term: 'Schnittpunkt zweier Geraden', explanation: 'Terme gleichsetzen, nach $x$ auflösen, $x$ in eine Gleichung einsetzen:', math: 'm_1 x + b_1 = m_2 x + b_2' },
    { term: 'Parallele Geraden', explanation: 'Gleiche Steigung, verschiedenes $b$ ⇒ kein Schnittpunkt.' },
  ],
  materials: [videoPlaceholder('lf-nullstellen-v1', 'Nullstellen und Schnittpunkte')],
  example: {
    problem: 'Bestimme den Schnittpunkt von $f(x) = 2x - 1$ und $g(x) = -x + 5$.',
    steps: [
      { text: 'Gleichsetzen:', math: '2x - 1 = -x + 5' },
      { text: 'Auflösen:', math: '3x = 6 \\;\\Rightarrow\\; x = 2' },
      { text: 'Einsetzen:', math: 'f(2) = 2 \\cdot 2 - 1 = 3' },
    ],
    result: 'Der Schnittpunkt ist $S(2\\,|\\,3)$.',
  },
  summary: ['Nullstelle: $f(x) = 0$ lösen.', 'Schnittpunkt mit der $y$-Achse: $(0\\,|\\,b)$.', 'Schnittpunkt zweier Geraden: gleichsetzen, $x$ berechnen, $y$ durch Einsetzen.'],
  exercises: [
    {
      id: 'lf-ns-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was ist eine Nullstelle einer Funktion?',
      choices: [
        { id: 'a', label: 'Eine Stelle $x$, an der $f(x) = 0$ ist' },
        { id: 'b', label: 'Der Funktionswert $f(0)$' },
        { id: 'c', label: 'Ein Punkt mit $x = 0$' },
        { id: 'd', label: 'Die kleinste Zahl der Definitionsmenge' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Wo schneidet der Graph die $x$-Achse?', 'Auf der $x$-Achse ist der $y$-Wert …', '… null.'],
      solution: { steps: [{ text: 'An einer Nullstelle schneidet der Graph die $x$-Achse: Dort gilt $f(x) = 0$.' }], finalAnswer: 'Stelle mit $f(x) = 0$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem y-Achsenabschnitt verwechselt', feedback: '$f(0)$ ist der Schnittpunkt mit der $y$-Achse, nicht die Nullstelle.', answers: ['b', 'c'] }],
    },
    {
      id: 'lf-ns-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'In welchem Punkt schneidet der Graph von $f(x) = 4x - 7$ die $y$-Achse?',
      choices: [
        { id: 'a', label: '$(0\\,|\\,-7)$' },
        { id: 'b', label: '$(-7\\,|\\,0)$' },
        { id: 'c', label: '$(0\\,|\\,4)$' },
        { id: 'd', label: '$(1{,}75\\,|\\,0)$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Auf der $y$-Achse ist $x = 0$.', 'Berechne $f(0)$.', '$f(0) = -7$'],
      solution: { steps: [{ text: '$f(0) = 4 \\cdot 0 - 7 = -7$ ⇒ Schnittpunkt $(0\\,|\\,-7)$.' }], finalAnswer: '$(0\\,|\\,-7)$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Auf der $y$-Achse ist die $x$-Koordinate $0$: $(0\\,|\\,b)$.', answers: ['b'] }, { description: 'Nullstelle gewählt', feedback: '$(1{,}75\\,|\\,0)$ ist der Schnittpunkt mit der $x$-Achse.', answers: ['d'] }],
    },
    {
      id: 'lf-ns-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Wie viele Schnittpunkte haben $f(x) = 2x + 1$ und $g(x) = 2x - 4$?',
      choices: [
        { id: 'a', label: 'keinen' },
        { id: 'b', label: 'genau einen' },
        { id: 'c', label: 'zwei' },
        { id: 'd', label: 'unendlich viele' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche die Steigungen.', 'Gleiche Steigung heißt …', '… parallel. Sind die Geraden gleich?'],
      solution: { steps: [{ text: 'Gleiche Steigung $2$, aber verschiedene Achsenabschnitte: Die Geraden sind parallel und schneiden sich nie.' }, { text: 'Rechnerisch: $2x + 1 = 2x - 4$ führt auf $1 = -4$ – ein Widerspruch.' }], finalAnswer: 'keinen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Parallele übersehen', feedback: 'Bei gleicher Steigung laufen die Geraden parallel – kein Schnittpunkt.', answers: ['b'] }],
    },
    {
      id: 'lf-ns-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Hat die Funktion $f(x) = 3$ eine Nullstelle?',
      choices: [
        { id: 'a', label: 'Nein, ihr Graph verläuft parallel zur $x$-Achse.' },
        { id: 'b', label: 'Ja, bei $x = 3$.' },
        { id: 'c', label: 'Ja, bei $x = 0$.' },
        { id: 'd', label: 'Ja, bei $x = -3$.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Für welches $x$ wäre $f(x) = 0$?', 'Der Funktionswert ist immer $3$.', 'Eine waagerechte Gerade oberhalb der $x$-Achse …'],
      solution: { steps: [{ text: '$f(x) = 3$ für alle $x$, also nie $0$. Der Graph ist eine Parallele zur $x$-Achse – keine Nullstelle.' }], finalAnswer: 'Nein' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Funktionswert als Nullstelle genommen', feedback: 'Bei $x = 3$ ist $f(3) = 3$, nicht $0$.', answers: ['b'] }],
    },
    {
      id: 'lf-ns-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Eine Kerze ist $24$ cm hoch und brennt pro Stunde $1{,}5$ cm ab. Nach wie vielen Stunden ist sie ganz abgebrannt?',
      answer: { kind: 'numeric', value: 16, tolerance: 0.001, unit: 'h' },
      hints: ['$h(t) = 24 - 1{,}5t$', 'Abgebrannt heißt $h(t) = 0$.', '$24 : 1{,}5$'],
      solution: { steps: [{ text: 'Nullstelle von $h(t) = 24 - 1{,}5t$:', math: '24 - 1{,}5t = 0 \\;\\Rightarrow\\; t = \\frac{24}{1{,}5} = 16' }], finalAnswer: 'nach $16$ Stunden' },
      objectives: [...OBJ, 'Nullstellen im Sachzusammenhang'],
      commonMistakes: [{ description: 'Multipliziert statt geteilt', feedback: 'Gesucht ist, wie oft $1{,}5$ cm in $24$ cm passen: teilen.', answers: ['36'] }],
    },
    {
      id: 'lf-ns-6',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Tarif A kostet $10$ € Grundgebühr und $0{,}20$ € pro Minute, Tarif B $4$ € Grundgebühr und $0{,}50$ € pro Minute. Bei wie vielen Minuten kosten beide gleich viel?',
      answer: { kind: 'numeric', value: 20, tolerance: 0.001, unit: 'min' },
      hints: ['$A(x) = 0{,}2x + 10$, $B(x) = 0{,}5x + 4$', 'Setze $A(x) = B(x)$.', '$6 = 0{,}3x$'],
      solution: { steps: [{ text: 'Gleichsetzen:', math: '0{,}2x + 10 = 0{,}5x + 4' }, { text: 'Auflösen:', math: '6 = 0{,}3x \\;\\Rightarrow\\; x = 20' }], finalAnswer: 'bei $20$ Minuten' },
      objectives: [...OBJ, 'Schnittpunkte im Sachzusammenhang'],
      commonMistakes: [{ description: 'Grundgebühren falsch verrechnet', feedback: 'Bringe alle $x$ auf eine Seite und alle Zahlen auf die andere: $10 - 4 = 0{,}5x - 0{,}2x$.', answers: ['46,67'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-ns-ganz',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const m = r.int(2, 6) * r.sign();
        const x0 = r.int(1, 7) * r.sign();
        return { m, b: -m * x0 };
      },
      build: ({ m, b }) => ({
        prompt: `Berechne die Nullstelle von $${fx(m, b)}$.`,
        answer: { kind: 'numeric', value: -b / m, tolerance: 0.001 },
        hints: ['Setze $f(x) = 0$.', `Bringe $${num(b)}$ auf die andere Seite.`, `Teile durch $${num(m)}$.`],
        solution: { steps: zeroSteps(m, b), finalAnswer: `$x_0 = ${num(-b / m)}$` },
        commonMistakes: [{ description: 'Vorzeichenfehler', feedback: 'Beim Herüberbringen wechselt das Vorzeichen: $x_0 = -\\frac{b}{m}$.', answers: [txt(b / m)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-ns-dez',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([2, 4, -2, -4, 0.5, -0.5, 5, -5]), b: r.int(1, 9) * r.sign() }),
      build: ({ m, b }) => ({
        prompt: `Berechne die Nullstelle von $${fx(m, b)}$. Gib sie als Dezimalzahl an.`,
        answer: { kind: 'numeric', value: -b / m, tolerance: 0.001 },
        hints: ['$f(x) = 0$ setzen.', `$${linearTerm(m, 0)} = ${num(-b)}$`, 'Das Ergebnis darf eine Dezimalzahl sein.'],
        solution: { steps: zeroSteps(m, b), finalAnswer: `$x_0 = ${num(-b / m)}$` },
        commonMistakes: [{ description: 'Vorzeichenfehler', feedback: 'Beim Herüberbringen wechselt das Vorzeichen.', answers: [txt(b / m)] }, { description: 'Kehrwert', feedback: 'Es ist $x_0 = -\\frac{b}{m}$, nicht $-\\frac{m}{b}$.', answers: [txt(-m / b)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-ns-sy',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ m: r.int(2, 6) * r.sign(), b: r.int(1, 12) * r.sign() }),
      build: ({ m, b }) => ({
        prompt: `Gib den Schnittpunkt des Graphen von $${fx(m, b)}$ mit der $y$-Achse an.`,
        answer: { kind: 'point', x: 0, y: b, tolerance: 0.001 },
        hints: ['Auf der $y$-Achse gilt $x = 0$.', 'Berechne $f(0)$.', `Schreibe den Punkt als $(0\\,|\\,${b})$.`],
        solution: { steps: [{ text: `$f(0) = ${b}$ ⇒ $S_y(0\\,|\\,${b})$` }], finalAnswer: `$S_y(0\\,|\\,${b})$` },
        commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Zuerst kommt die $x$-Koordinate ($0$), dann die $y$-Koordinate.', answers: [`(${b}|0)`] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-ns-schnitt',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => {
        const m1 = r.int(1, 4) * r.sign();
        let m2 = r.int(1, 4) * r.sign();
        if (m2 === m1) m2 = -m1;
        const x = r.int(-4, 4);
        const y = r.int(-6, 6);
        return { m1, b1: y - m1 * x, m2, b2: y - m2 * x, x, y };
      },
      build: ({ m1, b1, m2, b2, x, y }) => ({
        prompt: `Berechne den Schnittpunkt der Geraden $${fx(m1, b1)}$ und $${fx(m2, b2, 'g')}$.`,
        answer: { kind: 'point', x, y, tolerance: 0.001 },
        hints: ['Setze die Funktionsterme gleich.', `$${linearTerm(m1, b1)} = ${linearTerm(m2, b2)}$`, 'Setze das berechnete $x$ in eine der beiden Gleichungen ein.'],
        solution: {
          steps: [
            { text: 'Gleichsetzen:', math: `${linearTerm(m1, b1)} = ${linearTerm(m2, b2)}` },
            { text: 'Nach $x$ auflösen:', math: `${linearTerm(m1 - m2, 0)} = ${num(b2 - b1)} \\;\\Rightarrow\\; x = ${x}` },
            { text: 'In $f$ einsetzen:', math: `f(${x}) = ${y}` },
          ],
          finalAnswer: `$S(${x}\\,|\\,${y})$`,
        },
        commonMistakes: [{ description: 'Nur x angegeben oder Koordinaten vertauscht', feedback: 'Ein Schnittpunkt hat zwei Koordinaten: $(x\\,|\\,y)$.', answers: [`(${y}|${x})`] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-ns-graph',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      objectives: [...OBJ, 'Schnittpunkte ablesen'],
      params: (r) => {
        const x = r.pick([-3, -2, -1, 1, 2, 3]); // nicht 0: sonst verrät der Achsenabschnitt im Text die Lösung
        const y = r.int(-3, 3);
        const m1 = r.pick([1, 2, 0.5, -1]);
        let m2 = r.pick([-1, -2, -0.5, 1, 3]);
        if (m2 === m1) m2 = -2;
        return { x, y, m1, m2 };
      },
      build: ({ x, y, m1, m2 }) => {
        const b1 = y - m1 * x;
        const b2 = y - m2 * x;
        return {
          prompt: `Lies den Schnittpunkt der beiden abgebildeten Geraden $f$ und $g$ ab. (Gerade $f$ schneidet die $y$-Achse bei $${num(b1)}$, Gerade $g$ bei $${num(b2)}$.)`,
          figure: plane(`Zwei Geraden f und g, die sich im Punkt (${x}|${y}) schneiden.`, [{ m: m1, b: b1, label: 'f' }, { m: m2, b: b2, label: 'g' }], [], 6),
          answer: { kind: 'point', x, y, tolerance: 0.001 },
          hints: ['Suche den Punkt, an dem sich die Geraden kreuzen.', 'Lies zuerst den $x$-Wert ab, dann den $y$-Wert.', `Probe: Setze deinen Punkt in $${fx(m1, b1)}$ ein.`],
          solution: { steps: [{ text: `Die Geraden kreuzen sich bei $x = ${x}$ und $y = ${y}$.` }, { text: 'Probe:', math: `f(${x}) = ${num(m1)} \\cdot ${x < 0 ? `(${x})` : x} ${b1 < 0 ? '-' : '+'} ${num(Math.abs(b1))} = ${y}` }], finalAnswer: `$S(${x}\\,|\\,${y})$` },
          commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Zuerst die $x$-Koordinate, dann die $y$-Koordinate.', answers: x === y ? [] : [`(${y}|${x})`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-ns-leer',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Nullstellen im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { text: 'Ein Heizöltank enthält {a} Liter. Pro Tag werden {r} Liter verbraucht. Nach wie vielen Tagen ist er leer?', unit: 'Tage', rate: r.pick([12, 15, 20, 25]), t: r.int(20, 60) },
          { text: 'Ein Akku ist zu {a} % geladen und verliert pro Stunde {r} %. Nach wie vielen Stunden ist er leer?', unit: 'h', rate: 5, t: r.int(8, 20) }, // höchstens 100 %
          { text: 'Auf einer Prepaid-Karte sind {a} €. Jeden Monat werden {r} € abgebucht. Nach wie vielen Monaten ist das Guthaben aufgebraucht?', unit: 'Monate', rate: r.pick([5, 7.5, 10, 12.5]), t: r.int(3, 10) },
        ]),
      build: ({ text, unit, rate, t }) => ({
        prompt: text.replace('{a}', `$${num(rate * t)}$`).replace('{r}', `$${num(rate)}$`),
        answer: { kind: 'numeric', value: t, tolerance: 0.001, unit },
        hints: [`Stelle eine Funktion auf: $y = ${num(rate * t)} - ${num(rate)}x$.`, 'Leer heißt $y = 0$.', `Teile $${num(rate * t)}$ durch $${num(rate)}$.`],
        solution: { steps: [{ text: 'Nullstelle bestimmen:', math: `${num(rate * t)} - ${num(rate)}x = 0 \\;\\Rightarrow\\; x = \\frac{${num(rate * t)}}{${num(rate)}} = ${t}` }], finalAnswer: `nach $${t}$ ${unit === 'h' ? 'Stunden' : unit}` },
        commonMistakes: [{ description: 'Multipliziert statt geteilt', feedback: 'Gesucht ist, wie oft der Verbrauch in den Vorrat passt.', answers: [txt(rate * t * rate)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-ns-tarif',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Schnittpunkte im Sachzusammenhang'],
      params: (r) => {
        const p1 = r.pick([0.1, 0.15, 0.2, 0.25]);
        const p2 = p1 + r.pick([0.1, 0.15, 0.2, 0.25]);
        const x = r.pick([20, 30, 40, 50, 60]);
        const g2 = r.pick([0, 2, 3, 5]);
        return { p1, p2, g2, g1: g2 + (p2 - p1) * x, x, what: r.pick(['Minute', 'SMS', 'Kilometer']) };
      },
      build: ({ p1, p2, g1, g2, x, what }) => ({
        prompt: `Tarif A kostet $${num(g1)}$ € Grundgebühr und $${num(p1)}$ € pro ${what}, Tarif B $${num(g2)}$ € Grundgebühr und $${num(p2)}$ € pro ${what}. Für welche Anzahl kosten beide Tarife gleich viel?`,
        answer: { kind: 'numeric', value: x, tolerance: 0.001 },
        hints: [`$A(x) = ${num(p1)}x + ${num(g1)}$, $B(x) = ${num(p2)}x${g2 ? ` + ${num(g2)}` : ''}$`, 'Setze $A(x) = B(x)$.', `$${num(g1 - g2)} = ${num(p2 - p1)}x$`],
        solution: {
          steps: [
            { text: 'Gleichsetzen:', math: `${num(p1)}x + ${num(g1)} = ${num(p2)}x${g2 ? ` + ${num(g2)}` : ''}` },
            { text: 'Auflösen:', math: `${num(g1 - g2)} = ${num(p2 - p1)}x \\;\\Rightarrow\\; x = ${x}` },
          ],
          finalAnswer: `$${x}$`,
        },
        commonMistakes: [{ description: 'Grundgebühren addiert', feedback: 'Bringe die Grundgebühren auf eine Seite: $g_A - g_B$.', answers: [txt((g1 + g2) / (p2 - p1))] }],
      }),
    }),
  ],
};
