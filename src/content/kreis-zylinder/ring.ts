import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num } from '../templates';
import { approx, circleFigure, piTol, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-ring';
const OBJ = ['Flächeninhalt eines Kreisrings berechnen'];

/** Kreisring-Rechnung als KaTeX. */
const ringMath = (R: number, r: number) => `A = \\pi \\cdot (${num(R)}^2 - ${num(r)}^2) = \\pi \\cdot ${num(R * R - r * r)} ${approx(Math.PI * (R * R - r * r))}`;

export const ring: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 4,
  title: 'Kreisring',
  description: 'Fläche zwischen zwei Kreisen mit gemeinsamem Mittelpunkt berechnen.',
  objective: 'Du berechnest den Flächeninhalt von Kreisringen und bestimmst fehlende Radien.',
  intro:
    'Ein Kreisring entsteht, wenn man aus einem großen Kreis einen kleineren Kreis mit demselben Mittelpunkt herausschneidet – wie bei einer Unterlegscheibe oder einem Donut. Seine Fläche ist die große Kreisfläche minus die kleine.',
  rules: [
    { term: 'Kreisring', explanation: 'Außenradius $R$, Innenradius $r$:', math: 'A = \\pi R^2 - \\pi r^2 = \\pi (R^2 - r^2)' },
    { term: 'Ringbreite', explanation: '$R - r$' },
    { term: 'Achtung', explanation: 'Nicht $\\pi (R - r)^2$ rechnen – das ist falsch!' },
  ],
  materials: [videoPlaceholder('kz-ring-v1', 'Der Kreisring')],
  example: {
    problem: 'Eine Unterlegscheibe hat außen $R = 5$ mm und innen $r = 2$ mm. Wie groß ist ihre Fläche?',
    steps: [{ text: 'Große minus kleine Kreisfläche:', math: 'A = \\pi (5^2 - 2^2) = 21\\pi \\approx 66{,}0\\,\\text{mm}^2' }],
    result: '$A \\approx 66{,}0$ mm²',
  },
  summary: ['$A = \\pi (R^2 - r^2)$', 'Erst quadrieren, dann subtrahieren.', 'Bei Durchmessern zuerst halbieren.'],
  exercises: [
    {
      id: 'kz-ri-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Formel liefert die Fläche eines Kreisrings mit Außenradius $R$ und Innenradius $r$?',
      choices: [
        { id: 'a', label: '$A = \\pi (R^2 - r^2)$' },
        { id: 'b', label: '$A = \\pi (R - r)^2$' },
        { id: 'c', label: '$A = 2\\pi (R - r)$' },
        { id: 'd', label: '$A = \\pi R^2 + \\pi r^2$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Großer Kreis minus kleiner Kreis.', '$\\pi R^2 - \\pi r^2$', '$\\pi$ ausklammern.'],
      solution: { steps: [{ text: '$A = \\pi R^2 - \\pi r^2 = \\pi (R^2 - r^2)$' }], finalAnswer: '$A = \\pi (R^2 - r^2)$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Differenz vor dem Quadrieren', feedback: '$(R - r)^2$ ist nicht dasselbe wie $R^2 - r^2$. Probiere es mit $R = 5$, $r = 3$ aus.', answers: ['b'] }],
    },
    {
      id: 'kz-ri-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Nina rechnet für einen Ring mit $R = 5$ cm und $r = 3$ cm: $\\pi \\cdot (5 - 3)^2 = 4\\pi$. Was stimmt?',
      choices: [
        { id: 'a', label: 'Falsch: Richtig ist $\\pi (25 - 9) = 16\\pi$.' },
        { id: 'b', label: 'Richtig.' },
        { id: 'c', label: 'Falsch: Richtig ist $\\pi (5 + 3)^2$.' },
        { id: 'd', label: 'Falsch: Richtig ist $2\\pi \\cdot 2$.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Berechne beide Kreisflächen einzeln.', '$\\pi \\cdot 25$ und $\\pi \\cdot 9$', 'Ziehe ab.'],
      solution: { steps: [{ text: '$\\pi \\cdot 25 - \\pi \\cdot 9 = 16\\pi \\approx 50{,}3$ cm². Nina hat die Klammer falsch gesetzt.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Fehler nicht erkannt', feedback: '$(5 - 3)^2 = 4$, aber $5^2 - 3^2 = 16$.', answers: ['b'] }],
    },
    {
      id: 'kz-ri-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Um einen runden Teich ($r = 4$ m) wird ein $1$ m breiter Kiesweg angelegt. Ein Sack Kies reicht für $2$ m². Wie viele Säcke braucht man mindestens?',
      answer: { kind: 'numeric', value: 15, tolerance: 0.001 },
      hints: ['Der Weg ist ein Kreisring mit $r = 4$ m und $R = 5$ m.', '$A = \\pi (25 - 16) = 9\\pi \\approx 28{,}3$ m²', 'Teile durch $2$ und runde auf.'],
      solution: { steps: [{ text: 'Wegfläche:', math: 'A = \\pi (5^2 - 4^2) = 9\\pi \\approx 28{,}3\\,\\text{m}^2' }, { text: 'Säcke:', math: '28{,}3 : 2 \\approx 14{,}1 \\;\\Rightarrow\\; 15\\ \\text{Säcke (aufrunden)}' }], finalAnswer: '$15$ Säcke' },
      objectives: [...OBJ, 'Kreisring im Sachzusammenhang'],
      commonMistakes: [{ description: 'Abgerundet', feedback: 'Mit 14 Säcken reicht der Kies nicht – aufrunden.', answers: ['14'] }],
    },
    {
      id: 'kz-ri-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Ein Kreisring hat die Breite $2$ cm. Sein Innenradius ist $r$. Um wie viel Quadratzentimeter wächst die Ringfläche, wenn $r$ um $1$ cm größer wird (Breite bleibt $2$ cm)? Runde auf eine Nachkommastelle (oder gib ein Vielfaches von $\\pi$ an).',
      answer: { kind: 'numeric', value: 4 * Math.PI, tolerance: piTol(4 * Math.PI) },
      hints: ['$A(r) = \\pi ((r + 2)^2 - r^2) = \\pi (4r + 4)$', 'Vergleiche $A(r + 1)$ und $A(r)$.', '$\\pi (4(r + 1) + 4) - \\pi (4r + 4)$'],
      solution: { steps: [{ text: 'Ringfläche:', math: 'A(r) = \\pi ((r+2)^2 - r^2) = \\pi (4r + 4)' }, { text: 'Zuwachs:', math: 'A(r + 1) - A(r) = 4\\pi \\approx 12{,}6\\,\\text{cm}^2' }], finalAnswer: '$4\\pi \\approx 12{,}6$ cm²' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Nur Breite betrachtet', feedback: 'Die Ringfläche hängt auch vom Innenradius ab: $\\pi(4r + 4)$.' }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-ri-radien',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const R = r.int(4, 12);
        return { R, r0: r.int(1, R - 1) };
      },
      build: ({ R, r0 }) => {
        const a = Math.PI * (R * R - r0 * r0);
        return {
          prompt: `Berechne die Fläche des Kreisrings mit $R = ${R}$ cm und $r = ${r0}$ cm. ${ROUND1}`,
          figure: circleFigure(`Kreisring mit Außenradius ${R} cm und Innenradius ${r0} cm.`, { r: `R = ${R} cm`, inner: `r = ${r0}` }, undefined, r0 / R),
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: 'cm²' },
          hints: ['$A = \\pi (R^2 - r^2)$', `$${R}^2 - ${r0}^2 = ${R * R - r0 * r0}$`, 'Mit $\\pi$ multiplizieren.'],
          solution: { steps: [{ text: 'Formel:', math: ringMath(R, r0) }], finalAnswer: `$A ${approx(a)}$ cm²` },
          commonMistakes: [{ description: 'Erst subtrahiert, dann quadriert', feedback: '$(R - r)^2 \\neq R^2 - r^2$.', answers: [rounded(Math.PI * (R - r0) ** 2)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-ri-durchmesser',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const D = r.int(5, 15) * 2;
        return { D, d: r.int(1, D / 2 - 1) * 2 };
      },
      build: ({ D, d }) => {
        const a = Math.PI * ((D / 2) ** 2 - (d / 2) ** 2);
        return {
          prompt: `Ein Kreisring hat den Außendurchmesser $${D}$ mm und den Innendurchmesser $${d}$ mm. Berechne seine Fläche. ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: 'mm²' },
          hints: ['Halbiere zuerst beide Durchmesser.', `$R = ${D / 2}$ mm, $r = ${d / 2}$ mm`, '$A = \\pi (R^2 - r^2)$'],
          solution: { steps: [{ text: 'Radien:', math: `R = ${D / 2},\\; r = ${d / 2}` }, { text: 'Fläche:', math: ringMath(D / 2, d / 2) }], finalAnswer: `$A ${approx(a)}$ mm²` },
          commonMistakes: [{ description: 'Mit Durchmessern gerechnet', feedback: 'In die Formel gehören die Radien – sonst erhältst du das Vierfache.', answers: [rounded(4 * a)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-ri-breite',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ R: r.int(5, 15), w: r.int(1, 4) }),
      build: ({ R, w }) => {
        const r0 = R - w;
        const a = Math.PI * (R * R - r0 * r0);
        return {
          prompt: `Ein Kreisring hat den Außenradius $${R}$ cm und ist $${w}$ cm breit. Berechne seine Fläche. ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: 'cm²' },
          hints: ['Innenradius = Außenradius − Breite.', `$r = ${R} - ${w} = ${r0}$ cm`, '$A = \\pi (R^2 - r^2)$'],
          solution: { steps: [{ text: 'Innenradius:', math: `r = ${R} - ${w} = ${r0}` }, { text: 'Fläche:', math: ringMath(R, r0) }], finalAnswer: `$A ${approx(a)}$ cm²` },
          commonMistakes: [{ description: 'Breite als Innenradius genommen', feedback: 'Die Breite ist der Abstand zwischen den Kreisen: $r = R - \\text{Breite}$.', answers: [rounded(Math.PI * (R * R - w * w))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-ri-innen',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Radien bestimmen'],
      params: (r) => {
        const R = r.int(6, 15);
        return { R, r0: r.int(2, R - 2) };
      },
      build: ({ R, r0 }) => {
        const a = Math.round(Math.PI * (R * R - r0 * r0) * 100) / 100;
        const inner = Math.sqrt(R * R - a / Math.PI);
        return {
          prompt: `Ein Kreisring hat den Außenradius $${R}$ cm und die Fläche $${num(a)}$ cm². Wie groß ist der Innenradius? ${ROUND1}`,
          answer: { kind: 'numeric', value: inner, tolerance: piTol(inner) },
          hints: ['$A = \\pi (R^2 - r^2)$ nach $r$ umstellen.', `$r^2 = R^2 - \\frac{A}{\\pi} = ${R * R} - \\frac{${num(a)}}{\\pi}$`, 'Wurzel ziehen.'],
          solution: { steps: [{ text: 'Umstellen:', math: `r^2 = ${R * R} - \\frac{${num(a)}}{\\pi} ${approx(R * R - a / Math.PI, 2)}` }, { text: 'Wurzel:', math: `r ${approx(inner)}` }], finalAnswer: `$r ${approx(inner)}$ cm` },
          commonMistakes: [{ description: 'Wurzel vergessen', feedback: 'Du hast $r^2$ berechnet – zieh noch die Wurzel.', answers: [rounded(R * R - a / Math.PI)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-ri-sach',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Kreisring im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { text: 'Eine CD hat $12$ cm Durchmesser und in der Mitte ein Loch mit $1{,}5$ cm Durchmesser. Wie groß ist eine Seite der CD (in cm²)?', R: 6, r0: 0.75, unit: 'cm²' },
          { text: 'Eine Unterlegscheibe hat außen $R = {R}$ mm und innen $r = {r}$ mm. Wie groß ist ihre Fläche (in mm²)?', R: r.pick([8, 10, 12]), r0: r.pick([3, 4, 5]), unit: 'mm²' },
          { text: 'Ein Donut hat von oben gesehen außen $R = {R}$ cm und innen $r = {r}$ cm. Wie viel Fläche muss mit Zuckerguss bedeckt werden (in cm²)?', R: r.pick([4, 4.5, 5]), r0: r.pick([1.5, 2]), unit: 'cm²' },
          { text: 'Ein runder Brunnen ($r = {r}$ m) bekommt einen $50$ cm breiten Rand aus Stein. Wie groß ist die Fläche des Randes (in m²)?', R: 0, r0: r.pick([1, 1.5, 2, 2.5]), unit: 'm²' },
        ]),
      build: ({ text, R: R0, r0, unit }) => {
        const R = R0 === 0 ? r0 + 0.5 : R0;
        const a = Math.PI * (R * R - r0 * r0);
        return {
          prompt: `${text.replace('{R}', num(R)).replace('{r}', num(r0))} ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit },
          hints: ['Die Fläche ist ein Kreisring.', `$R = ${num(R)}$, $r = ${num(r0)}$`, '$A = \\pi (R^2 - r^2)$'],
          solution: { steps: [{ text: 'Kreisring:', math: ringMath(R, r0) }], finalAnswer: `$A ${approx(a)}$ ${unit}` },
          commonMistakes: [{ description: 'Loch nicht abgezogen', feedback: 'Der innere Kreis gehört nicht zur Fläche.', answers: [rounded(Math.PI * R * R)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-ri-material',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Kreisring im Sachzusammenhang'],
      params: (r) => ({ r0: r.pick([3, 4, 5, 6]), w: r.pick([0.5, 0.8, 1, 1.2]), price: r.pick([12, 15, 18, 25]) }),
      build: ({ r0, w, price }) => {
        const R = r0 + w;
        const a = Math.PI * (R * R - r0 * r0);
        const cost = a * price;
        return {
          prompt: `Um ein rundes Beet ($r = ${r0}$ m) soll ein $${num(w)}$ m breiter Plattenweg gelegt werden. Ein Quadratmeter Platten kostet $${price}$ €. Wie teuer sind die Platten? Runde auf ganze Euro.`,
          answer: { kind: 'numeric', value: cost, tolerance: Math.max(0.6, cost * 0.002), unit: '€' },
          hints: [`Außenradius des Wegs: $${r0} + ${num(w)} = ${num(R)}$ m`, `Wegfläche: $\\pi (${num(R)}^2 - ${r0}^2)$`, `Mal $${price}$ €.`],
          solution: { steps: [{ text: 'Wegfläche:', math: ringMath(R, r0) + '\\,\\text{m}^2' }, { text: 'Kosten:', math: `${num(Math.round(a * 100) / 100)} \\cdot ${price} ${approx(cost, 0)}\\,€` }], finalAnswer: `$${approx(cost, 0)}$ €` },
          commonMistakes: [{ description: 'Ganze Fläche bepreist', feedback: 'Nur der Weg (Kreisring) wird gepflastert, nicht das Beet.', answers: [rounded(Math.PI * R * R * price, 0)] }],
        };
      },
    }),
  ],
};
