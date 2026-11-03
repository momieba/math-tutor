import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, round, txt } from '../templates';
import { plane, READABLE_SLOPES, slopeFraction, TOPIC_ID, yx } from './shared';

const S = 'lf-aufstellen';
const OBJ = ['Funktionsgleichungen aufstellen'];

/** Rechnung b = y − m·x als KaTeX. */
const bFromPoint = (m: number, x: number, y: number) =>
  `b = ${num(y)} - ${m < 0 ? `(${num(m)})` : num(m)} \\cdot ${x < 0 ? `(${x})` : x} = ${num(y - m * x)}`;

export const aufstellen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 4,
  title: 'Funktionsgleichungen aufstellen',
  description: 'Gleichung einer Geraden aus Steigung und Punkt, aus zwei Punkten oder aus einem Graphen bestimmen.',
  objective: 'Du stellst die Gleichung einer Geraden auf – aus Steigung und Punkt, aus zwei Punkten und aus Sachsituationen.',
  intro:
    'Durch zwei verschiedene Punkte geht genau eine Gerade. Um ihre Gleichung $y = mx + b$ zu finden, bestimmst du zuerst die Steigung $m$ und setzt dann einen Punkt ein, um $b$ zu berechnen.',
  rules: [
    { term: 'Aus Steigung und Punkt', explanation: 'Punkt $P(x_P\\,|\\,y_P)$ einsetzen und nach $b$ auflösen:', math: 'b = y_P - m \\cdot x_P' },
    { term: 'Aus zwei Punkten', explanation: 'Erst die Steigung, dann wie oben $b$:', math: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
    { term: 'Probe', explanation: 'Setze den zweiten Punkt ein – die Gleichung muss stimmen.' },
  ],
  materials: [videoPlaceholder('lf-aufstellen-v1', 'Geradengleichung aufstellen')],
  example: {
    problem: 'Bestimme die Gleichung der Geraden durch $A(1\\,|\\,3)$ und $B(3\\,|\\,7)$.',
    steps: [
      { text: 'Steigung:', math: 'm = \\frac{7 - 3}{3 - 1} = \\frac{4}{2} = 2' },
      { text: '$A$ einsetzen:', math: '3 = 2 \\cdot 1 + b \\;\\Rightarrow\\; b = 1' },
      { text: 'Probe mit $B$:', math: '2 \\cdot 3 + 1 = 7 \\;\\checkmark' },
    ],
    result: '$y = 2x + 1$',
  },
  summary: ['Erst $m$, dann $b$ durch Einsetzen eines Punktes.', '$b = y_P - m \\cdot x_P$', 'Mit dem zweiten Punkt die Probe machen.'],
  exercises: [
    {
      id: 'lf-af-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Eine Gerade hat die Steigung $m$ und geht durch $P(x_P\\,|\\,y_P)$. Wie berechnet man $b$?',
      choices: [
        { id: 'a', label: '$b = y_P - m \\cdot x_P$' },
        { id: 'b', label: '$b = x_P - m \\cdot y_P$' },
        { id: 'c', label: '$b = m \\cdot x_P + y_P$' },
        { id: 'd', label: '$b = \\frac{y_P}{x_P}$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Setze $P$ in $y = mx + b$ ein.', '$y_P = m \\cdot x_P + b$', 'Löse nach $b$ auf.'],
      solution: { steps: [{ text: 'Aus $y_P = m \\cdot x_P + b$ folgt $b = y_P - m \\cdot x_P$.' }], finalAnswer: '$b = y_P - m \\cdot x_P$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'x und y vertauscht', feedback: 'Der $y$-Wert des Punktes steht links: $y_P = m \\cdot x_P + b$.', answers: ['b'] }],
    },
    {
      id: 'lf-af-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie viele Geraden gehen durch zwei verschiedene Punkte?',
      choices: [
        { id: 'a', label: 'genau eine' },
        { id: 'b', label: 'keine' },
        { id: 'c', label: 'genau zwei' },
        { id: 'd', label: 'unendlich viele' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Lege ein Lineal an zwei Punkte.', 'Kannst du das Lineal noch drehen, ohne einen Punkt zu verlassen?', 'Zwei Punkte legen eine Gerade fest.'],
      solution: { steps: [{ text: 'Zwei verschiedene Punkte legen genau eine Gerade fest.' }], finalAnswer: 'genau eine' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit einem Punkt verwechselt', feedback: 'Durch einen Punkt gehen unendlich viele Geraden, durch zwei nur eine.', answers: ['d'] }],
    },
    {
      id: 'lf-af-3',
      subtopicId: S,
      type: 'equation',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Ein Handwerker berechnet $30$ € Anfahrt und $45$ € pro Arbeitsstunde. Stelle die Gleichung für die Kosten $y$ (in €) nach $x$ Stunden auf.',
      answer: { kind: 'linear', m: 45, b: 30, tolerance: 0.001 },
      hints: ['Was kommt pro Stunde dazu? Das ist die Steigung.', 'Was zahlt man auch bei $0$ Stunden?', '$y = m \\cdot x + b$'],
      solution: { steps: [{ text: 'Pro Stunde $45$ € ⇒ $m = 45$. Fester Betrag $30$ € ⇒ $b = 30$.' }], finalAnswer: '$y = 45x + 30$' },
      objectives: [...OBJ, 'Sachsituationen modellieren'],
      commonMistakes: [{ description: 'Steigung und Achsenabschnitt vertauscht', feedback: 'Der Betrag pro Stunde gehört vor das $x$, die Anfahrt ist der feste Summand.', answers: ['y = 30x + 45'] }],
    },
    {
      id: 'lf-af-4',
      subtopicId: S,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Der Wasserstand eines Teichs sinkt gleichmäßig. Nach $2$ Stunden beträgt er $150$ cm, nach $5$ Stunden $120$ cm. Stelle die Gleichung für den Wasserstand $h$ (in cm) nach $t$ Stunden auf (Eingabe mit $x$ statt $t$).',
      answer: { kind: 'linear', m: -10, b: 170, tolerance: 0.001 },
      hints: ['Die Punkte sind $(2\\,|\\,150)$ und $(5\\,|\\,120)$.', '$m = \\frac{120 - 150}{5 - 2}$', 'Setze danach $(2\\,|\\,150)$ ein, um $b$ zu bestimmen.'],
      solution: {
        steps: [
          { text: 'Steigung:', math: 'm = \\frac{120 - 150}{5 - 2} = \\frac{-30}{3} = -10' },
          { text: 'Punkt einsetzen:', math: '150 = -10 \\cdot 2 + b \\;\\Rightarrow\\; b = 170' },
        ],
        finalAnswer: '$h(t) = -10t + 170$',
      },
      objectives: [...OBJ, 'Sachsituationen modellieren'],
      commonMistakes: [{ description: 'Vorzeichen der Steigung', feedback: 'Der Wasserstand sinkt – die Steigung muss negativ sein.', answers: ['y = 10x + 130'] }],
    },
    {
      id: 'lf-af-5',
      subtopicId: S,
      type: 'equation',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Eine Gerade ist parallel zu $y = 3x - 2$ und schneidet die $y$-Achse bei $5$. Gib ihre Gleichung an.',
      answer: { kind: 'linear', m: 3, b: 5, tolerance: 0.001 },
      hints: ['Parallel heißt: gleiche Steigung.', 'Also $m = 3$.', 'Der $y$-Achsenabschnitt ist $5$.'],
      solution: { steps: [{ text: 'Parallel ⇒ $m = 3$; Schnitt mit der $y$-Achse bei $5$ ⇒ $b = 5$.' }], finalAnswer: '$y = 3x + 5$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Achsenabschnitt übernommen', feedback: 'Von der parallelen Geraden übernimmst du nur die Steigung, nicht $b$.', answers: ['y = 3x - 2'] }],
    },
    {
      id: 'lf-af-6',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Warum gehört die senkrechte Gerade durch $(3\\,|\\,0)$ zu keiner Funktion?',
      choices: [
        { id: 'a', label: 'Weil zu $x = 3$ unendlich viele $y$-Werte gehören.' },
        { id: 'b', label: 'Weil ihre Steigung $0$ ist.' },
        { id: 'c', label: 'Weil sie die $x$-Achse schneidet.' },
        { id: 'd', label: 'Weil sie nicht durch den Ursprung geht.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Welche Punkte liegen auf dieser Geraden?', '$(3\\,|\\,0)$, $(3\\,|\\,1)$, $(3\\,|\\,2)$, …', 'Wie viele $y$-Werte hat $x = 3$?'],
      solution: { steps: [{ text: 'Alle Punkte $(3\\,|\\,y)$ liegen auf ihr – einem $x$ wären unendlich viele $y$ zugeordnet.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit waagerechter Geraden verwechselt', feedback: 'Steigung $0$ haben waagerechte Geraden – die sind Funktionen.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-af-mb',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([-4, -3, -2, -1, 2, 3, 4, 5, 0.5, -0.5]), b: r.int(1, 9) * r.sign() }),
      build: ({ m, b }) => ({
        prompt: `Eine Gerade hat die Steigung $${num(m)}$ und schneidet die $y$-Achse im Punkt $(0\\,|\\,${b})$. Gib ihre Gleichung an.`,
        answer: { kind: 'linear', m, b, tolerance: 0.001 },
        hints: ['Die Form ist $y = mx + b$.', `$m = ${num(m)}$`, `$b = ${b}$`],
        solution: { steps: [{ text: 'Einsetzen in $y = mx + b$:', math: yx(m, b) }], finalAnswer: `$${yx(m, b)}$` },
        commonMistakes: [{ description: 'm und b vertauscht', feedback: 'Die Steigung steht vor dem $x$, der Achsenabschnitt ist der feste Summand.', answers: [`y = ${b}x ${m < 0 ? '-' : '+'} ${txt(Math.abs(m))}`] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-af-punkt',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([-3, -2, -1, 2, 3, 4, 0.5, -0.5, 1.5]), b: r.int(-8, 8), x: r.int(1, 6) * r.sign() }),
      build: ({ m, b, x }) => {
        const y = m * x + b;
        return {
          prompt: `Eine Gerade hat die Steigung $m = ${num(m)}$ und geht durch $P(${x}\\,|\\,${num(y)})$. Bestimme ihre Gleichung.`,
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: ['Setze $P$ in $y = mx + b$ ein.', `$${num(y)} = ${num(m)} \\cdot ${x < 0 ? `(${x})` : x} + b$`, 'Löse nach $b$ auf.'],
          solution: { steps: [{ text: 'Punkt einsetzen und nach $b$ auflösen:', math: bFromPoint(m, x, y) }, { text: 'Gleichung:', math: yx(m, b) }], finalAnswer: `$${yx(m, b)}$` },
          commonMistakes: [{ description: 'Beim Auflösen addiert statt subtrahiert', feedback: '$b = y_P - m \\cdot x_P$ – das Produkt wird abgezogen.', answers: [`y = ${txt(m)}x + ${txt(y + m * x)}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-af-zwei-punkte',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Steigung aus zwei Punkten'],
      params: (r) => {
        const m = r.pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5, 1.5, -1.5]);
        const x1 = r.int(-4, 3);
        return { m, b: r.int(-6, 6), x1, x2: x1 + r.pick([2, 4]) };
      },
      build: ({ m, b, x1, x2 }) => {
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        return {
          prompt: `Bestimme die Gleichung der Geraden durch $A(${x1}\\,|\\,${num(y1)})$ und $B(${x2}\\,|\\,${num(y2)})$.`,
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: ['Berechne zuerst die Steigung $m = \\frac{y_2 - y_1}{x_2 - x_1}$.', `$m = ${num(m)}$`, 'Setze dann $A$ ein und bestimme $b$.'],
          solution: {
            steps: [
              { text: 'Steigung:', math: slopeFraction(x1, y1, x2, y2) },
              { text: '$A$ einsetzen:', math: bFromPoint(m, x1, y1) },
              { text: 'Gleichung:', math: yx(m, b) },
            ],
            finalAnswer: `$${yx(m, b)}$`,
          },
          commonMistakes: [{ description: 'Steigung als Kehrwert berechnet', feedback: 'Die $y$-Differenz steht oben, die $x$-Differenz unten.', answers: [`y = ${txt(round(1 / m, 4))}x + ${txt(b)}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-af-graph',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      objectives: [...OBJ, 'Funktionsgleichung aus dem Graphen ablesen'],
      params: (r) => {
        const [p, q] = r.pick(READABLE_SLOPES.filter(([pp, qq]) => qq <= 2 && Math.abs(pp) <= 2));
        const x1 = r.int(-3, 0);
        const y1 = r.int(-2, 2);
        return { p, q, x1, y1 };
      },
      build: ({ p, q, x1, y1 }) => {
        const m = p / q;
        const b = y1 - m * x1;
        const x2 = x1 + 2 * q;
        const y2 = y1 + 2 * p;
        return {
          prompt: `Die abgebildete Gerade geht durch $A(${x1}\\,|\\,${y1})$ und $B(${x2}\\,|\\,${y2})$. Bestimme ihre Gleichung.`,
          figure: plane(`Koordinatensystem mit einer Geraden durch A(${x1}|${y1}) und B(${x2}|${y2}).`, [{ m, b }], [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }], 6),
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: ['Lies die Steigung mit einem Steigungsdreieck zwischen $A$ und $B$ ab.', `$m = \\frac{${y2 - y1}}{${x2 - x1}} = ${num(m)}$`, 'Wo schneidet die Gerade die $y$-Achse? Oder rechne $b$ mit einem Punkt aus.'],
          solution: { steps: [{ text: 'Steigung:', math: slopeFraction(x1, y1, x2, y2) }, { text: 'Achsenabschnitt:', math: bFromPoint(m, x1, y1) }], finalAnswer: `$${yx(m, b)}$` },
          commonMistakes: [{ description: 'Nur die Steigung bestimmt', feedback: 'Vergiss den $y$-Achsenabschnitt nicht.', answers: [`y = ${txt(m)}x`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-af-tarif',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Sachsituationen modellieren'],
      params: (r) =>
        r.pick([
          { ctx: 'Ein Fitnessstudio verlangt eine einmalige Aufnahmegebühr von {b} € und {m} € pro Monat.', x: 'Monaten', one: 'Monat', m: r.pick([19, 24, 29, 35]), b: r.pick([20, 25, 40, 50]) },
          { ctx: 'Ein Carsharing-Anbieter berechnet {b} € pro Fahrt plus {m} € pro Kilometer.', x: 'Kilometern', one: 'Kilometer', m: r.pick([0.3, 0.35, 0.4, 0.45]), b: r.pick([2, 3, 4]) },
          { ctx: 'Ein Stromanbieter verlangt {b} € Grundpreis im Monat und {m} € pro Kilowattstunde.', x: 'Kilowattstunden', one: 'Kilowattstunde', m: r.pick([0.28, 0.32, 0.35]), b: r.pick([9, 12, 15]) },
          { ctx: 'Eine Kletterhalle kostet {b} € Leihgebühr für die Ausrüstung und {m} € pro Stunde.', x: 'Stunden', one: 'Stunde', m: r.pick([6, 7, 8]), b: r.pick([4, 5, 6]) },
          { ctx: 'Ein Paketdienst berechnet {b} € pro Paket plus {m} € pro Kilogramm.', x: 'Kilogramm', one: 'Kilogramm', m: r.pick([0.5, 0.8, 1.2]), b: r.pick([3, 4, 5]) },
        ]),
      build: ({ ctx, x, one, m, b }) => ({
        prompt: `${ctx.replace('{b}', `$${num(b)}$`).replace('{m}', `$${num(m)}$`)} Stelle die Gleichung für die Kosten $y$ (in €) bei $x$ ${x} auf.`,
        answer: { kind: 'linear', m, b, tolerance: 0.001 },
        hints: [`Was kommt pro ${one} dazu? Das ist die Steigung.`, 'Welcher Betrag fällt immer an, auch bei $x = 0$?', `$y = ${num(m)}x + ${num(b)}$ – prüfe es mit $x = 1$.`],
        solution: { steps: [{ text: `Betrag pro Einheit: $m = ${num(m)}$; fester Betrag: $b = ${num(b)}$.` }], finalAnswer: `$${yx(m, b)}$` },
        commonMistakes: [{ description: 'Grundbetrag und Preis pro Einheit vertauscht', feedback: 'Der Preis pro Einheit gehört vor das $x$.', answers: [`y = ${txt(b)}x + ${txt(m)}`] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-af-messwerte',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Sachsituationen modellieren'],
      params: (r) => {
        const setting = r.pick([
          { text: 'Eine Kerze brennt gleichmäßig ab. Nach {t1} Stunden ist sie {y1} cm hoch, nach {t2} Stunden noch {y2} cm.', m: -r.pick([1, 1.5, 2, 2.5]), b: r.pick([20, 24, 30]), unit: 'Höhe in cm' },
          { text: 'Ein Becken wird gleichmäßig gefüllt. Nach {t1} Minuten steht das Wasser {y1} cm hoch, nach {t2} Minuten {y2} cm.', m: r.pick([2, 3, 4, 5]), b: r.pick([10, 15, 20]), unit: 'Wasserhöhe in cm' },
          { text: 'Ein Wanderer entfernt sich gleichmäßig von der Hütte. Nach {t1} Stunden ist er {y1} km entfernt, nach {t2} Stunden {y2} km.', m: r.pick([3, 4, 5]), b: r.pick([1, 2, 3]), unit: 'Entfernung in km' },
        ]);
        const t1 = r.int(1, 3);
        return { ...setting, t1, t2: t1 + r.pick([2, 3, 4]) };
      },
      build: ({ text, m, b, unit, t1, t2 }) => {
        const y1 = m * t1 + b;
        const y2 = m * t2 + b;
        return {
          prompt: `${text.replace('{t1}', `$${t1}$`).replace('{t2}', `$${t2}$`).replace('{y1}', `$${num(y1)}$`).replace('{y2}', `$${num(y2)}$`)} Stelle eine Gleichung für die ${unit} auf (Zeit als $x$).`,
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: [`Die Messwerte sind die Punkte $(${t1}\\,|\\,${num(y1)})$ und $(${t2}\\,|\\,${num(y2)})$.`, `$m = \\frac{${num(y2)} - ${num(y1)}}{${t2} - ${t1}}$`, 'Setze einen Punkt ein und bestimme $b$.'],
          solution: {
            steps: [
              { text: 'Steigung:', math: slopeFraction(t1, y1, t2, y2) },
              { text: 'Achsenabschnitt:', math: bFromPoint(m, t1, y1) },
            ],
            finalAnswer: `$y = ${linearTerm(m, b)}$`,
          },
          commonMistakes: [{ description: 'Ersten Messwert als Anfangswert genommen', feedback: 'Der Anfangswert gehört zu $x = 0$, nicht zum ersten Messzeitpunkt.', answers: [`y = ${txt(m)}x + ${txt(y1)}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-af-parallel',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Parallele Geraden'],
      params: (r) => {
        const b0 = r.int(-5, 5);
        return { m: r.int(2, 4) * r.sign(), b0, b: b0 + r.int(1, 6) * r.sign(), x: r.int(1, 4) * r.sign() }; // b ≠ b0: echte Parallele
      },
      build: ({ m, b0, b, x }) => {
        const y = m * x + b;
        return {
          prompt: `Die Gerade $g$ ist parallel zu $${yx(m, b0)}$ und geht durch $P(${x}\\,|\\,${y})$. Bestimme die Gleichung von $g$.`,
          answer: { kind: 'linear', m, b, tolerance: 0.001 },
          hints: [`Parallel ⇒ gleiche Steigung $m = ${m}$.`, `Setze $P$ ein: $${y} = ${m} \\cdot ${x < 0 ? `(${x})` : x} + b$.`, 'Löse nach $b$ auf.'],
          solution: { steps: [{ text: `Steigung übernehmen: $m = ${m}$.` }, { text: 'Punkt einsetzen:', math: bFromPoint(m, x, y) }], finalAnswer: `$${yx(m, b)}$` },
          commonMistakes: [{ description: 'Achsenabschnitt der gegebenen Geraden übernommen', feedback: 'Nur die Steigung wird übernommen. $b$ musst du mit dem Punkt neu bestimmen.', answers: [`y = ${m}x + ${b0}`.replace('+ -', '- ')] }],
        };
      },
    }),
  ],
};
