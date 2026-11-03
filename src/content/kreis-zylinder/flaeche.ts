import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num } from '../templates';
import { approx, circleFigure, piTol, RADIUS_DIAMETER_MISTAKE, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-flaeche';
const OBJ = ['Flächeninhalt eines Kreises berechnen'];

export const flaeche: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 2,
  title: 'Flächeninhalt des Kreises',
  description: 'Kreisfläche aus Radius oder Durchmesser berechnen, Radius aus der Fläche bestimmen.',
  objective: 'Du berechnest den Flächeninhalt eines Kreises und bestimmst den Radius aus dem Flächeninhalt.',
  intro:
    'Zerschneidet man einen Kreis in viele schmale Tortenstücke und legt sie abwechselnd nebeneinander, entsteht fast ein Rechteck: so breit wie der halbe Umfang ($\\pi r$) und so hoch wie der Radius ($r$). Sein Flächeninhalt ist $\\pi r \\cdot r = \\pi r^2$.',
  rules: [
    { term: 'Flächeninhalt', explanation: '', math: 'A = \\pi r^2' },
    { term: 'Mit dem Durchmesser', explanation: 'Erst $r = \\frac{d}{2}$ berechnen, dann einsetzen.' },
    { term: 'Radius aus der Fläche', explanation: '', math: 'r = \\sqrt{\\frac{A}{\\pi}}' },
    { term: 'Achtung', explanation: 'Verdoppelt man den Radius, vervierfacht sich die Fläche.' },
  ],
  materials: [videoPlaceholder('kz-flaeche-v1', 'Flächeninhalt des Kreises')],
  example: {
    problem: 'Berechne den Flächeninhalt eines Kreises mit $d = 10$ cm.',
    steps: [
      { text: 'Radius:', math: 'r = \\frac{10}{2} = 5\\,\\text{cm}' },
      { text: 'Fläche:', math: 'A = \\pi \\cdot 5^2 = 25\\pi \\approx 78{,}5\\,\\text{cm}^2' },
    ],
    result: '$A \\approx 78{,}5$ cm²',
  },
  summary: ['$A = \\pi r^2$', 'Bei gegebenem Durchmesser erst halbieren.', '$r = \\sqrt{A : \\pi}$'],
  exercises: [
    {
      id: 'kz-fl-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Formel gibt den Flächeninhalt eines Kreises an?',
      choices: [
        { id: 'a', label: '$A = \\pi r^2$' },
        { id: 'b', label: '$A = 2\\pi r$' },
        { id: 'c', label: '$A = \\pi d^2$' },
        { id: 'd', label: '$A = (\\pi r)^2$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Flächen haben die Einheit cm² – in der Formel muss eine Länge quadriert werden.', 'Nur $r$ wird quadriert, nicht $\\pi$.', '$A = \\pi \\cdot r \\cdot r$'],
      solution: { steps: [{ text: '$A = \\pi r^2$. ($2\\pi r$ ist der Umfang.)' }], finalAnswer: '$A = \\pi r^2$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Umfang verwechselt', feedback: '$2\\pi r$ ist eine Länge (Umfang), keine Fläche.', answers: ['b'] }],
    },
    {
      id: 'kz-fl-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Eine Pizza mit $30$ cm Durchmesser kostet $10$ €, eine mit $40$ cm Durchmesser $16$ €. Welche ist im Verhältnis günstiger?',
      choices: [
        { id: 'a', label: 'Die große – sie hat fast $78\\,\\%$ mehr Fläche, kostet aber nur $60\\,\\%$ mehr.' },
        { id: 'b', label: 'Die kleine – sie ist $6$ € billiger.' },
        { id: 'c', label: 'Beide gleich – der Durchmesser ist nur um ein Drittel größer.' },
        { id: 'd', label: 'Das kann man nicht vergleichen.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche die Flächen, nicht die Durchmesser.', '$\\pi \\cdot 15^2 \\approx 707$ cm², $\\pi \\cdot 20^2 \\approx 1257$ cm²', 'Berechne den Preis pro cm².'],
      solution: { steps: [{ text: 'Flächen: $\\approx 707$ cm² und $\\approx 1257$ cm² (Faktor $\\frac{16}{9} \\approx 1{,}78$).' }, { text: 'Preis pro 100 cm²: klein $\\approx 1{,}41$ €, groß $\\approx 1{,}27$ € ⇒ die große ist günstiger.' }], finalAnswer: 'Die große' },
      objectives: [...OBJ, 'Flächen vergleichen'],
      commonMistakes: [{ description: 'Nur Durchmesser verglichen', feedback: 'Die Fläche wächst mit dem Quadrat des Radius – nicht im selben Verhältnis wie der Durchmesser.', answers: ['c'] }],
    },
    {
      id: 'kz-fl-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Warum ist die Fläche eines Kreises mit $r = 1$ m genau $\\pi$ m², sein Umfang aber $2\\pi$ m?',
      choices: [
        { id: 'a', label: 'Weil $A = \\pi \\cdot 1^2 = \\pi$ und $u = 2\\pi \\cdot 1 = 2\\pi$ – zwei verschiedene Formeln.' },
        { id: 'b', label: 'Weil man sich bei einer der beiden Rechnungen verrechnet hat.' },
        { id: 'c', label: 'Weil Fläche und Umfang immer gleich sind.' },
        { id: 'd', label: 'Weil $\\pi$ für Flächen halb so groß ist.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Setze $r = 1$ in beide Formeln ein.', '$1^2 = 1$', 'Fläche und Umfang sind verschiedene Größen mit verschiedenen Einheiten.'],
      solution: { steps: [{ text: '$A = \\pi r^2 = \\pi$ m², $u = 2\\pi r = 2\\pi$ m. Es sind verschiedene Größen (Fläche, Länge).' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Fläche und Umfang gleichgesetzt', feedback: 'Fläche (m²) und Umfang (m) kann man nicht direkt vergleichen.', answers: ['c'] }],
    },
    {
      id: 'kz-fl-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Rasensprenger bewässert einen Kreis mit $6$ m Radius. Wie viele Quadratmeter Rasen bewässern $3$ solcher Sprenger, wenn sich ihre Kreise nicht überlappen? Runde auf eine ganze Zahl.',
      answer: { kind: 'numeric', value: 3 * Math.PI * 36, tolerance: Math.max(0.6, 3 * Math.PI * 36 * 0.001), unit: 'm²' },
      hints: ['Ein Sprenger: $A = \\pi \\cdot 6^2$.', '$\\pi \\cdot 36 \\approx 113{,}1$ m²', 'Mal $3$.'],
      solution: { steps: [{ text: 'Ein Kreis:', math: 'A = \\pi \\cdot 6^2 = 36\\pi \\approx 113{,}1\\,\\text{m}^2' }, { text: 'Drei Kreise:', math: '3 \\cdot 36\\pi = 108\\pi \\approx 339\\,\\text{m}^2' }], finalAnswer: '$\\approx 339$ m²' },
      objectives: [...OBJ, 'Kreisfläche im Sachzusammenhang'],
      commonMistakes: [{ description: 'Nur ein Sprenger gerechnet', feedback: 'Es sind drei Sprenger – die Fläche dreifach nehmen.', answers: ['113'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-fl-r',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 1.5, 2.5]), unit: r.pick(['cm', 'm']) }),
      build: ({ rad, unit }) => {
        const a = Math.PI * rad * rad;
        return {
          prompt: `Berechne den Flächeninhalt eines Kreises mit dem Radius $r = ${num(rad)}$ ${unit}. ${ROUND1}`,
          figure: circleFigure(`Kreis mit Radius ${num(rad)} ${unit}.`, { r: `r = ${rounded(rad)} ${unit}` }),
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: `${unit}²` },
          hints: ['$A = \\pi r^2$', `$r^2 = ${num(rad * rad)}$`, 'Multipliziere mit $\\pi$.'],
          solution: { steps: [{ text: 'Formel:', math: `A = \\pi \\cdot ${num(rad)}^2 = ${num(rad * rad)}\\pi ${approx(a)}` }], finalAnswer: `$A ${approx(a)}$ ${unit}²` },
          commonMistakes: [{ description: 'Mit 2πr gerechnet', feedback: '$2\\pi r$ ist der Umfang. Für die Fläche: $\\pi r^2$.', answers: [rounded(2 * Math.PI * rad)] }, { description: 'π mitquadriert', feedback: 'Nur $r$ wird quadriert.', answers: [rounded((Math.PI * rad) ** 2)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-fl-d',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ d: r.pick([4, 6, 8, 10, 12, 14, 16, 20, 24, 30, 5, 9]), unit: r.pick(['cm', 'm', 'dm']) }),
      build: ({ d, unit }) => {
        const a = Math.PI * (d / 2) ** 2;
        return {
          prompt: `Ein Kreis hat den Durchmesser $d = ${d}$ ${unit}. Berechne seinen Flächeninhalt. ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: `${unit}²` },
          hints: ['Berechne zuerst den Radius.', `$r = ${num(d / 2)}$ ${unit}`, '$A = \\pi r^2$'],
          solution: { steps: [{ text: 'Radius:', math: `r = \\frac{${d}}{2} = ${num(d / 2)}` }, { text: 'Fläche:', math: `A = \\pi \\cdot ${num(d / 2)}^2 ${approx(a)}` }], finalAnswer: `$A ${approx(a)}$ ${unit}²` },
          commonMistakes: [RADIUS_DIAMETER_MISTAKE(Math.PI * d * d)],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-fl-radius',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([50, 100, 150, 200, 300, 500, 78.5, 28.3, 1000]), unit: r.pick(['cm', 'm']) }),
      build: ({ a, unit }) => {
        const rad = Math.sqrt(a / Math.PI);
        return {
          prompt: `Ein Kreis hat den Flächeninhalt $A = ${num(a)}$ ${unit}². Berechne seinen Radius. ${ROUND1}`,
          answer: { kind: 'numeric', value: rad, tolerance: piTol(rad), unit },
          hints: ['Stelle $A = \\pi r^2$ nach $r$ um.', '$r^2 = \\frac{A}{\\pi}$', 'Ziehe am Ende die Wurzel.'],
          solution: { steps: [{ text: 'Umstellen:', math: `r^2 = \\frac{${num(a)}}{\\pi} ${approx(a / Math.PI, 2)}` }, { text: 'Wurzel ziehen:', math: `r ${approx(rad)}` }], finalAnswer: `$r ${approx(rad)}$ ${unit}` },
          commonMistakes: [{ description: 'Wurzel vergessen', feedback: '$\\frac{A}{\\pi}$ ist $r^2$ – du musst noch die Wurzel ziehen.', answers: [rounded(a / Math.PI)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-fl-sach',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Kreisfläche im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { text: 'Ein runder Teppich hat einen Durchmesser von ${v}$ m. Wie groß ist seine Fläche (in m²)?', v: r.pick([1.2, 1.6, 2, 2.4, 3]), diameter: true, unit: 'm²' },
          { text: 'Eine Pizza hat einen Durchmesser von ${v}$ cm. Wie groß ist ihre Fläche (in cm²)?', v: r.pick([26, 28, 30, 32, 36]), diameter: true, unit: 'cm²' },
          { text: 'Ein kreisrunder Teich hat einen Radius von ${v}$ m. Wie groß ist seine Wasseroberfläche (in m²)?', v: r.pick([2.5, 3, 4, 5]), diameter: false, unit: 'm²' },
          { text: 'Eine Ziege ist an einem $${v}$ m langen Seil an einem Pflock angebunden. Wie viele Quadratmeter Wiese kann sie abgrasen?', v: r.pick([3, 4, 5, 6]), diameter: false, unit: 'm²' },
        ]),
      build: ({ text, v, diameter, unit }) => {
        const rad = diameter ? v / 2 : v;
        const a = Math.PI * rad * rad;
        return {
          prompt: `${text.replace('{v}', num(v))} ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit },
          hints: [diameter ? 'Halbiere zuerst den Durchmesser.' : 'Der Radius ist gegeben.', `$r = ${num(rad)}$`, '$A = \\pi r^2$'],
          solution: { steps: [{ text: 'Fläche:', math: `A = \\pi \\cdot ${num(rad)}^2 ${approx(a)}` }], finalAnswer: `$A ${approx(a)}$ ${unit}` },
          commonMistakes: [diameter ? RADIUS_DIAMETER_MISTAKE(Math.PI * v * v) : { description: 'Umfang berechnet', feedback: 'Gefragt ist eine Fläche: $\\pi r^2$.', answers: [rounded(2 * Math.PI * v)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-fl-vergleich',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Flächen vergleichen'],
      params: (r) => ({ d1: r.pick([24, 26, 28]), d2: r.pick([32, 34, 36, 40]) }),
      build: ({ d1, d2 }) => {
        const diff = Math.PI * ((d2 / 2) ** 2 - (d1 / 2) ** 2);
        return {
          prompt: `Eine kleine Pizza hat $${d1}$ cm Durchmesser, eine große $${d2}$ cm. Wie viele Quadratzentimeter mehr Pizza bekommt man bei der großen? Runde auf eine ganze Zahl.`,
          answer: { kind: 'numeric', value: diff, tolerance: Math.max(0.6, diff * 0.001), unit: 'cm²' },
          hints: ['Berechne beide Flächen.', `Radien: $${d1 / 2}$ cm und $${d2 / 2}$ cm`, 'Bilde die Differenz.'],
          solution: {
            steps: [
              { text: 'Flächen:', math: `A_1 = \\pi \\cdot ${d1 / 2}^2 ${approx(Math.PI * (d1 / 2) ** 2)},\\quad A_2 = \\pi \\cdot ${d2 / 2}^2 ${approx(Math.PI * (d2 / 2) ** 2)}` },
              { text: 'Differenz:', math: `A_2 - A_1 ${approx(diff, 0)}\\,\\text{cm}^2` },
            ],
            finalAnswer: `$${approx(diff, 0)}$ cm²`,
          },
          commonMistakes: [{ description: 'Durchmesser statt Radius eingesetzt', feedback: 'Mit dem Durchmesser erhält man das Vierfache – erst halbieren.', answers: [rounded(4 * diff, 0)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-fl-faktor',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Flächen vergleichen'],
      params: (r) => ({ k: r.pick([2, 3, 4, 5, 10]), what: r.pick(['Radius', 'Durchmesser']) }),
      build: ({ k, what }) => ({
        prompt: `Der ${what} eines Kreises wird ver-$${k}$-facht. Um welchen Faktor ändert sich sein Flächeninhalt?`,
        answer: { kind: 'numeric', value: k * k, tolerance: 0.001 },
        hints: ['$A = \\pi r^2$ – der Radius wird quadriert.', `Setze $${k}r$ ein: $\\pi (${k}r)^2$.`, `$(${k}r)^2 = ${k * k}r^2$`],
        solution: { steps: [{ text: 'Einsetzen:', math: `\\pi (${k}r)^2 = ${k * k} \\cdot \\pi r^2` }], finalAnswer: `Faktor $${k * k}$` },
        commonMistakes: [{ description: 'Linear gedacht', feedback: 'Die Fläche wächst mit dem Quadrat: Faktor ' + k + ' beim Radius ⇒ Faktor ' + k * k + ' bei der Fläche.', answers: [String(k)] }],
      }),
    }),
    ...fromTemplate({
      id: 'kz-fl-aus-umfang',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Umfang und Fläche verknüpfen'],
      params: (r) => ({ u: r.pick([20, 25, 30, 40, 50, 62.8, 75, 100, 120]) }),
      build: ({ u }) => {
        const rad = u / (2 * Math.PI);
        const a = Math.PI * rad * rad;
        return {
          prompt: `Ein Kreis hat den Umfang $${num(u)}$ cm. Berechne seinen Flächeninhalt. ${ROUND1}`,
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: 'cm²' },
          hints: ['Berechne zuerst den Radius aus dem Umfang.', `$r = \\frac{${num(u)}}{2\\pi} ${approx(rad, 2)}$`, '$A = \\pi r^2$ – rechne mit dem ungerundeten Radius weiter.'],
          solution: { steps: [{ text: 'Radius:', math: `r = \\frac{${num(u)}}{2\\pi} ${approx(rad, 3)}` }, { text: 'Fläche:', math: `A = \\pi r^2 ${approx(a)}` }], finalAnswer: `$A ${approx(a)}$ cm²` },
          commonMistakes: [{ description: 'Mit dem Durchmesser gerechnet', feedback: '$\\frac{u}{\\pi}$ ist der Durchmesser – halbieren!', answers: [rounded(4 * a)] }],
        };
      },
    }),
  ],
};
