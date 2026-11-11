import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round, txt } from '../templates';
import { fx, generalTerm, mc, pt, ptInput, vertexTerm, TOPIC_ID } from './shared';

const S = 'qf-allgemeine-form';
const OBJ = ['Zwischen allgemeiner Form und Scheitelpunktform umrechnen', 'Den Scheitelpunkt aus der allgemeinen Form bestimmen'];

/** Quadratische Ergänzung für x² + px + q als Rechenschritte. */
function completeSquare(p: number, q: number) {
  const h = p / 2;
  return [
    { text: 'Quadratische Ergänzung: $\\left(\\frac{p}{2}\\right)^2$ addieren und wieder abziehen:', math: `x^2 ${p < 0 ? '-' : '+'} ${num(Math.abs(p))}x + ${num(h * h)} - ${num(h * h)}${q === 0 ? '' : q > 0 ? ` + ${num(q)}` : ` - ${num(-q)}`}` },
    { text: 'Binomische Formel anwenden und zusammenfassen:', math: vertexTerm(1, -h, q - h * h) },
    { text: 'Scheitelpunkt ablesen:', math: pt(-h, q - h * h) },
  ];
}

export const allgemeineForm: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 3,
  title: 'Allgemeine Form und Scheitelpunkt',
  description: 'Von $f(x) = x^2 + px + q$ zur Scheitelpunktform – mit der quadratischen Ergänzung.',
  objective: 'Du formst zwischen allgemeiner Form und Scheitelpunktform um und bestimmst so den Scheitelpunkt.',
  intro:
    'Oft ist eine Parabel in der allgemeinen Form $f(x) = ax^2 + bx + c$ gegeben. Den Schnittpunkt mit der $y$-Achse liest man sofort ab: $(0\\,|\\,c)$. Für den Scheitelpunkt formt man mit der quadratischen Ergänzung in die Scheitelpunktform um – oder nutzt die Formel $x_S = -\\frac{p}{2}$. Damit lassen sich zum Beispiel größte Gewinne oder größte Flächen berechnen.',
  rules: [
    { term: 'Allgemeine Form', explanation: 'Schnittpunkt mit der $y$-Achse: $(0\\,|\\,c)$.', math: 'f(x) = ax^2 + bx + c' },
    { term: 'Scheitelpunkt bei $a = 1$', explanation: 'Für $f(x) = x^2 + px + q$:', math: 'S\\left(-\\frac{p}{2}\\,\\middle|\\,q - \\left(\\frac{p}{2}\\right)^2\\right)' },
    { term: 'Quadratische Ergänzung', explanation: '$\\left(\\frac{p}{2}\\right)^2$ addieren und abziehen, dann binomische Formel:', math: 'x^2 + px + q = \\left(x + \\frac{p}{2}\\right)^2 + q - \\left(\\frac{p}{2}\\right)^2' },
    { term: 'Scheitelpunkt allgemein', explanation: 'Für $f(x) = ax^2 + bx + c$:', math: 'x_S = -\\frac{b}{2a},\\quad y_S = f(x_S)' },
  ],
  materials: [videoPlaceholder('qf-allgemeine-form-v1', 'Quadratische Ergänzung')],
  example: {
    problem: 'Bestimme den Scheitelpunkt von $f(x) = x^2 - 6x + 5$.',
    steps: [
      { text: '$p = -6$, also $\\frac{p}{2} = -3$ und $\\left(\\frac{p}{2}\\right)^2 = 9$.' },
      { text: 'Ergänzen:', math: 'x^2 - 6x + 9 - 9 + 5 = (x - 3)^2 - 4' },
      { text: 'Ablesen:', math: 'S(3\\,|\\,-4)' },
    ],
    result: 'Der Scheitelpunkt ist $S(3\\,|\\,-4)$.',
  },
  summary: ['$y$-Achsenabschnitt der allgemeinen Form: $c$.', '$x_S = -\\frac{p}{2}$ bzw. $x_S = -\\frac{b}{2a}$.', 'Quadratische Ergänzung führt zur Scheitelpunktform.'],
  exercises: [
    {
      id: 'qf-af-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wo schneidet der Graph von $f(x) = 2x^2 - 3x + 7$ die $y$-Achse?',
      choices: [
        { id: 'a', label: '$(0\\,|\\,7)$' },
        { id: 'b', label: '$(7\\,|\\,0)$' },
        { id: 'c', label: '$(0\\,|\\,2)$' },
        { id: 'd', label: '$(0\\,|\\,-3)$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Auf der $y$-Achse ist $x = 0$.', 'Berechne $f(0)$.', 'Alle Summanden mit $x$ fallen weg.'],
      solution: { steps: [{ text: '$f(0) = 2 \\cdot 0 - 3 \\cdot 0 + 7 = 7$ ⇒ $(0\\,|\\,7)$.' }], finalAnswer: '$(0\\,|\\,7)$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Auf der $y$-Achse ist die $x$-Koordinate $0$.', answers: ['b'] }],
    },
    {
      id: 'qf-af-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Welche Zahl muss man bei $x^2 + 8x$ ergänzen, um eine binomische Formel zu erhalten?',
      choices: [
        { id: 'a', label: '$16$' },
        { id: 'b', label: '$8$' },
        { id: 'c', label: '$64$' },
        { id: 'd', label: '$4$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$(x + b)^2 = x^2 + 2bx + b^2$', '$2b = 8$, also $b = 4$.', 'Ergänzt wird $b^2$.'],
      solution: { steps: [{ text: '$2b = 8 \\Rightarrow b = 4$; ergänzt wird $b^2 = 16$: $x^2 + 8x + 16 = (x + 4)^2$.' }], finalAnswer: '$16$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'p² statt (p/2)²', feedback: 'Ergänzt wird $\\left(\\frac{p}{2}\\right)^2 = 4^2$, nicht $8^2$.', answers: ['c'] }],
    },
    {
      id: 'qf-af-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Bauer will mit $40$ m Zaun ein rechteckiges Gehege abstecken. Für die Seitenlänge $x$ ist der Flächeninhalt $A(x) = x(20 - x)$. Wie groß ist der größtmögliche Flächeninhalt (in m²)?',
      answer: { kind: 'numeric', value: 100, tolerance: 0.001, unit: 'm²' },
      hints: ['$A(x) = -x^2 + 20x$', 'Der größte Wert liegt im Scheitelpunkt: $x_S = -\\frac{20}{2 \\cdot (-1)} = 10$.', 'Berechne $A(10)$.'],
      solution: { steps: [{ text: 'Ausmultiplizieren:', math: 'A(x) = -x^2 + 20x' }, { text: 'Scheitelstelle:', math: 'x_S = -\\frac{20}{2 \\cdot (-1)} = 10' }, { text: 'Größte Fläche:', math: 'A(10) = 10 \\cdot 10 = 100' }], finalAnswer: '$100$ m²' },
      objectives: [...OBJ, 'Extremwertprobleme lösen'],
      commonMistakes: [{ description: 'Seitenlänge statt Fläche', feedback: '$10$ m ist die beste Seitenlänge – gefragt ist der Flächeninhalt.', answers: ['10'] }],
    },
    {
      id: 'qf-af-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Max formt $f(x) = x^2 + 4x + 1$ um zu $(x + 2)^2 + 1$. Was hat er falsch gemacht?',
      choices: [
        { id: 'a', label: 'Er hat die ergänzte $4$ nicht wieder abgezogen; richtig ist $(x + 2)^2 - 3$.' },
        { id: 'b', label: 'Nichts, die Umformung stimmt.' },
        { id: 'c', label: 'In der Klammer muss $x - 2$ stehen.' },
        { id: 'd', label: 'In der Klammer muss $x + 4$ stehen.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Multipliziere $(x + 2)^2 + 1$ aus.', '$(x + 2)^2 = x^2 + 4x + 4$', 'Die ergänzte Zahl muss wieder abgezogen werden.'],
      solution: { steps: [{ text: '$(x + 2)^2 + 1 = x^2 + 4x + 5 \\neq f(x)$. Richtig: $x^2 + 4x + 4 - 4 + 1 = (x + 2)^2 - 3$.' }], finalAnswer: 'Ergänzung nicht abgezogen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Probe nicht gemacht', feedback: 'Multipliziere zur Probe aus: Es muss wieder $f(x)$ herauskommen.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'qf-af-yachse',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([1, 2, -1, 3, -2, 0.5]), b: r.int(-6, 6), c: r.int(1, 12) * r.sign() }),
      build: ({ a, b, c }) => ({
        prompt: `Gib den Schnittpunkt des Graphen von $${fx(generalTerm(a, b, c))}$ mit der $y$-Achse an.`,
        answer: { kind: 'point', x: 0, y: c, tolerance: 0.001 },
        hints: ['Auf der $y$-Achse ist $x = 0$.', 'Berechne $f(0)$.', `Schreibe den Punkt als $(0\\,|\\,${num(c)})$.`],
        solution: { steps: [{ text: `$f(0) = ${num(c)}$ ⇒ Schnittpunkt $(0\\,|\\,${num(c)})$.` }], finalAnswer: `$(0\\,|\\,${num(c)})$` },
        commonMistakes: [{ description: 'Koordinaten vertauscht', feedback: 'Zuerst die $x$-Koordinate ($0$), dann die $y$-Koordinate.', answers: [ptInput(c, 0)] }],
      }),
    }),
    ...fromTemplate({
      id: 'qf-af-xs',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ p: r.int(1, 7) * 2 * r.sign(), q: r.int(-9, 9) }),
      build: ({ p, q }) => ({
        prompt: `An welcher Stelle $x_S$ liegt der Scheitelpunkt von $${fx(generalTerm(1, p, q))}$?`,
        answer: { kind: 'numeric', value: -p / 2, tolerance: 0.001 },
        hints: ['Es gilt $x_S = -\\frac{p}{2}$.', `Hier ist $p = ${num(p)}$.`, 'Vorzeichen beachten!'],
        solution: { steps: [{ text: 'Formel für die Scheitelstelle:', math: `x_S = -\\frac{${num(p)}}{2} = ${num(-p / 2)}` }], finalAnswer: `$x_S = ${num(-p / 2)}$` },
        commonMistakes: [{ description: 'Vorzeichen vergessen', feedback: 'Die Formel lautet $x_S = -\\frac{p}{2}$ – mit Minus.', answers: [txt(p / 2)] }],
      }),
    }),
    ...fromTemplate({
      id: 'qf-af-scheitel',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ p: r.int(1, 6) * 2 * r.sign(), q: r.int(-10, 10) }),
      build: ({ p, q }) => {
        const xs = -p / 2;
        const ys = q - (p / 2) ** 2;
        return {
          prompt: `Bestimme den Scheitelpunkt von $${fx(generalTerm(1, p, q))}$.`,
          answer: { kind: 'point', x: xs, y: ys, tolerance: 0.001 },
          hints: [`Ergänze $\\left(\\frac{${num(p)}}{2}\\right)^2 = ${num((p / 2) ** 2)}$.`, `$x^2 ${p < 0 ? '-' : '+'} ${num(Math.abs(p))}x + ${num((p / 2) ** 2)} = ${vertexTerm(1, xs, 0)}$`, 'Lies den Scheitelpunkt aus der Scheitelpunktform ab.'],
          solution: { steps: completeSquare(p, q), finalAnswer: `$${pt(xs, ys)}$` },
          commonMistakes: [
            { description: 'Vorzeichen der x-Koordinate', feedback: 'Aus $(x + 3)^2$ folgt $x_S = -3$: Das Vorzeichen dreht sich.', answers: [ptInput(-xs, ys)] },
            { description: 'Ergänzung nicht abgezogen', feedback: 'Die ergänzte Zahl muss wieder abgezogen werden.', answers: [ptInput(xs, q)] },
          ],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-af-ausmulti',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ d: r.int(1, 6) * r.sign(), e: r.int(-8, 8) }),
      build: ({ d, e }, rng) => {
        const correct = `$${generalTerm(1, -2 * d, d * d + e)}$`;
        const noDouble = `$${generalTerm(1, -d, d * d + e)}$`;
        const { choices, answer, idOf } = mc(rng, correct, [noDouble, `$${generalTerm(1, 2 * d, d * d + e)}$`, `$${generalTerm(1, -2 * d, e - d * d)}$`]);
        return {
          prompt: `Welche allgemeine Form gehört zu $f(x) = ${vertexTerm(1, d, e)}$?`,
          choices,
          answer,
          hints: ['Binomische Formel: $(x - d)^2 = x^2 - 2dx + d^2$.', `$${vertexTerm(1, d, 0)} = ${generalTerm(1, -2 * d, d * d)}$`, `Dann $${num(e)}$ addieren.`],
          solution: { steps: [{ text: 'Binomische Formel anwenden:', math: `${vertexTerm(1, d, e)} = ${generalTerm(1, -2 * d, d * d)}${e === 0 ? '' : e > 0 ? ` + ${num(e)}` : ` - ${num(-e)}`} = ${generalTerm(1, -2 * d, d * d + e)}` }], finalAnswer: correct },
          commonMistakes: [{ description: 'Mittleren Term nicht verdoppelt', feedback: 'Der mittlere Term der binomischen Formel ist $2 \\cdot x \\cdot d$.', answers: [idOf(noDouble)!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-af-ergaenzen',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ p: r.int(1, 6) * 2 * r.sign(), q: r.int(-10, 10) }),
      build: ({ p, q }, rng) => {
        const h = p / 2;
        const correct = `$${vertexTerm(1, -h, q - h * h)}$`;
        const notSubtracted = `$${vertexTerm(1, -h, q)}$`;
        const { choices, answer, idOf } = mc(rng, correct, [notSubtracted, `$${vertexTerm(1, h, q - h * h)}$`, `$${vertexTerm(1, -h, q + h * h)}$`]);
        return {
          prompt: `Welche Scheitelpunktform gehört zu $f(x) = ${generalTerm(1, p, q)}$?`,
          choices,
          answer,
          hints: [`Ergänze $\\left(\\frac{${num(p)}}{2}\\right)^2 = ${num(h * h)}$ und ziehe es wieder ab.`, `$x^2 ${p < 0 ? '-' : '+'} ${num(Math.abs(p))}x + ${num(h * h)} = ${vertexTerm(1, -h, 0)}$`, `Fasse $${num(q)} - ${num(h * h)}$ zusammen.`],
          solution: { steps: completeSquare(p, q).slice(0, 2), finalAnswer: correct },
          commonMistakes: [{ description: 'Ergänzung nicht abgezogen', feedback: 'Was man ergänzt, muss man auch wieder abziehen – sonst ändert sich die Funktion.', answers: [idOf(notSubtracted)!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-af-allg',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Scheitelpunkt bei a ≠ 1 bestimmen'],
      params: (r) => ({ a: r.pick([2, -2, 3, -1, 0.5, -3]), xs: r.int(1, 4) * r.sign(), ys: r.int(-8, 8) }),
      build: ({ a, xs, ys }) => {
        const b = -2 * a * xs;
        const c = a * xs * xs + ys;
        return {
          prompt: `Bestimme den Scheitelpunkt von $${fx(generalTerm(a, b, c))}$.`,
          answer: { kind: 'point', x: xs, y: ys, tolerance: 0.001 },
          hints: ['$x_S = -\\frac{b}{2a}$', `$x_S = -\\frac{${num(b)}}{2 \\cdot ${a < 0 ? `(${num(a)})` : num(a)}} = ${num(xs)}$`, `Berechne $y_S = f(${num(xs)})$.`],
          solution: {
            steps: [
              { text: 'Scheitelstelle:', math: `x_S = -\\frac{${num(b)}}{2 \\cdot ${a < 0 ? `(${num(a)})` : num(a)}} = ${num(xs)}` },
              { text: 'Funktionswert:', math: `y_S = f(${num(xs)}) = ${num(ys)}` },
            ],
            finalAnswer: `$${pt(xs, ys)}$`,
          },
          commonMistakes: [{ description: 'Durch a nicht geteilt', feedback: 'Bei $a \\neq 1$ gilt $x_S = -\\frac{b}{2a}$ – der Faktor $a$ gehört in den Nenner.', answers: [ptInput(-b / 2, round(a * (b / 2) ** 2 + b * (-b / 2) + c, 4))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-af-gewinn',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Extremwertprobleme lösen'],
      params: (r) => ({ xs: r.int(3, 15), g: r.int(2, 9) * 10, ask: r.pick(['menge', 'gewinn'] as const), what: r.pick(['Fahrräder', 'Kopfhörer', 'Rucksäcke', 'Skateboards']) }),
      build: ({ xs, g, ask, what }) => {
        const p = 2 * xs;
        const q = g - xs * xs;
        return {
          prompt: `Ein Betrieb verkauft ${what}. Der Tagesgewinn (in 100 €) bei $x$ verkauften Stück pro Tag ist $G(x) = ${generalTerm(-1, p, q)}$. ${ask === 'menge' ? 'Bei wie vielen Stück ist der Gewinn am größten?' : 'Wie groß ist der größtmögliche Gewinn (in 100 €)?'}`,
          answer: { kind: 'numeric', value: ask === 'menge' ? xs : g, tolerance: 0.001 },
          hints: ['Der größte Gewinn liegt im Scheitelpunkt (Parabel nach unten geöffnet).', `$x_S = -\\frac{${p}}{2 \\cdot (-1)} = ${xs}$`, ask === 'menge' ? 'Gefragt ist die Stückzahl $x_S$.' : `Berechne $G(${xs})$.`],
          solution: { steps: [{ text: 'Scheitelstelle:', math: `x_S = -\\frac{${p}}{2 \\cdot (-1)} = ${xs}` }, { text: 'Größter Gewinn:', math: `G(${xs}) = -${xs * xs} + ${p * xs}${q === 0 ? '' : q > 0 ? ` + ${q}` : ` - ${-q}`} = ${g}` }], finalAnswer: ask === 'menge' ? `$${xs}$ Stück` : `$${g}$ (also $${g * 100}$ €)` },
          commonMistakes: [{ description: 'Stückzahl und Gewinn verwechselt', feedback: 'Die $x$-Koordinate des Scheitels ist die Stückzahl, die $y$-Koordinate der Gewinn.', answers: [String(ask === 'menge' ? g : xs)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-af-flaeche',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Extremwertprobleme lösen'],
      params: (r) => ({ u: r.pick([12, 16, 20, 24, 28, 32, 36, 48, 60]), what: r.pick(['ein rechteckiges Beet', 'eine rechteckige Weide', 'ein rechteckiger Spielplatz']) }),
      build: ({ u, what }) => {
        const half = u / 2;
        const side = u / 4;
        return {
          prompt: `Mit $${u}$ m Zaun soll ${what} umzäunt werden. Für die Seitenlänge $x$ gilt $A(x) = x(${half} - x)$. Wie groß kann der Flächeninhalt höchstens werden (in m²)?`,
          answer: { kind: 'numeric', value: side * side, tolerance: 0.001, unit: 'm²' },
          hints: [`$A(x) = -x^2 + ${half}x$`, `$x_S = -\\frac{${half}}{2 \\cdot (-1)} = ${num(side)}$`, `Berechne $A(${num(side)})$.`],
          solution: { steps: [{ text: 'Ausmultiplizieren:', math: `A(x) = -x^2 + ${half}x` }, { text: 'Scheitelstelle:', math: `x_S = ${num(side)}` }, { text: 'Größte Fläche:', math: `A(${num(side)}) = ${num(side)} \\cdot ${num(half - side)} = ${num(side * side)}` }], finalAnswer: `$${num(side * side)}$ m² (Quadrat mit $${num(side)}$ m Seitenlänge)` },
          commonMistakes: [{ description: 'Seitenlänge statt Fläche', feedback: 'Die Scheitelstelle ist die beste Seitenlänge – gefragt ist der Flächeninhalt.', answers: [txt(side)] }],
        };
      },
    }),
  ],
};
