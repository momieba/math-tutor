import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, shuffledChoices } from '../templates';
import { approx, circleFigure, piTol, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-ausschnitt';
const OBJ = ['Kreisbogen und Kreisausschnitt berechnen'];
const ANGLES = [30, 45, 60, 72, 90, 120, 135, 150, 180, 210, 240, 270, 300];

export const ausschnitt: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 3,
  title: 'Kreisbogen und Kreisausschnitt',
  description: 'Teile eines Kreises berechnen: Bogenlänge und Fläche eines „Tortenstücks“ mit dem Mittelpunktswinkel α.',
  objective: 'Du berechnest Bogenlänge und Flächeninhalt von Kreisausschnitten und bestimmst den Mittelpunktswinkel.',
  intro:
    'Ein Kreisausschnitt ist wie ein Tortenstück. Sein Mittelpunktswinkel $\\alpha$ verrät, welcher Anteil des ganzen Kreises es ist: $\\frac{\\alpha}{360^\\circ}$. Genau dieser Anteil vom Umfang ist die Bogenlänge, und dieser Anteil von der Kreisfläche ist die Fläche des Ausschnitts.',
  rules: [
    { term: 'Anteil am Kreis', explanation: '', math: '\\frac{\\alpha}{360^\\circ}' },
    { term: 'Bogenlänge', explanation: '', math: 'b = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r' },
    { term: 'Fläche des Kreisausschnitts', explanation: '', math: 'A_S = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2' },
    { term: 'Winkel aus der Bogenlänge', explanation: '', math: '\\alpha = \\frac{b}{2\\pi r} \\cdot 360^\\circ' },
  ],
  materials: [videoPlaceholder('kz-ausschnitt-v1', 'Kreisbogen und Kreisausschnitt')],
  example: {
    problem: 'Berechne Bogenlänge und Fläche eines Kreisausschnitts mit $r = 6$ cm und $\\alpha = 60^\\circ$.',
    steps: [
      { text: 'Anteil:', math: '\\frac{60^\\circ}{360^\\circ} = \\frac{1}{6}' },
      { text: 'Bogen:', math: 'b = \\frac{1}{6} \\cdot 2\\pi \\cdot 6 = 2\\pi \\approx 6{,}3\\,\\text{cm}' },
      { text: 'Fläche:', math: 'A_S = \\frac{1}{6} \\cdot \\pi \\cdot 36 = 6\\pi \\approx 18{,}8\\,\\text{cm}^2' },
    ],
    result: '$b \\approx 6{,}3$ cm, $A_S \\approx 18{,}8$ cm²',
  },
  summary: ['Anteil $\\frac{\\alpha}{360^\\circ}$ vom ganzen Kreis.', '$b = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$', '$A_S = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$'],
  exercises: [
    {
      id: 'kz-as-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welchen Anteil der Kreisfläche hat ein Kreisausschnitt mit $\\alpha = 90^\\circ$?',
      choices: [
        { id: 'a', label: 'ein Viertel' },
        { id: 'b', label: 'die Hälfte' },
        { id: 'c', label: 'ein Drittel' },
        { id: 'd', label: 'ein Neuntel' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Ein ganzer Kreis hat $360^\\circ$.', '$\\frac{90}{360}$ kürzen.', '$\\frac{90}{360} = \\frac{1}{4}$'],
      solution: { steps: [{ text: '$\\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}$ – ein Viertelkreis.' }], finalAnswer: 'ein Viertel' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit 100 statt 360 gerechnet', feedback: 'Der Vollwinkel hat $360^\\circ$, nicht $100^\\circ$.', answers: ['d'] }],
    },
    {
      id: 'kz-as-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Wie ändert sich die Fläche eines Kreisausschnitts, wenn man nur den Winkel $\\alpha$ verdoppelt?',
      choices: [
        { id: 'a', label: 'Sie verdoppelt sich.' },
        { id: 'b', label: 'Sie vervierfacht sich.' },
        { id: 'c', label: 'Sie bleibt gleich.' },
        { id: 'd', label: 'Sie halbiert sich.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$A_S = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$', '$\\alpha$ steht im Zähler, nicht im Quadrat.', 'Doppelter Anteil ⇒ doppelte Fläche.'],
      solution: { steps: [{ text: '$A_S$ ist proportional zu $\\alpha$ – doppelter Winkel, doppelte Fläche.' }], finalAnswer: 'Sie verdoppelt sich.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit Verdopplung des Radius verwechselt', feedback: 'Vervierfachen würde sich die Fläche, wenn man den Radius verdoppelt.', answers: ['b'] }],
    },
    {
      id: 'kz-as-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Der Minutenzeiger einer Turmuhr ist $1{,}5$ m lang. Welchen Weg legt seine Spitze in $20$ Minuten zurück (in m)? Runde auf eine Nachkommastelle.',
      answer: { kind: 'numeric', value: (1 / 3) * 2 * Math.PI * 1.5, tolerance: piTol((1 / 3) * 2 * Math.PI * 1.5) },
      hints: ['In $60$ Minuten dreht sich der Zeiger einmal ganz herum.', '$20$ Minuten sind ein Drittel davon ($120^\\circ$).', '$b = \\frac{1}{3} \\cdot 2\\pi \\cdot 1{,}5$'],
      solution: { steps: [{ text: 'Anteil: $\\frac{20}{60} = \\frac{1}{3}$', math: 'b = \\frac{1}{3} \\cdot 2\\pi \\cdot 1{,}5\\,\\text{m} = \\pi\\,\\text{m} \\approx 3{,}1\\,\\text{m}' }], finalAnswer: '$\\approx 3{,}1$ m' },
      objectives: [...OBJ, 'Kreisbogen im Sachzusammenhang'],
      commonMistakes: [{ description: 'Ganzen Umfang berechnet', feedback: 'In 20 Minuten legt der Zeiger nur ein Drittel des Kreises zurück.', answers: ['9,4'] }],
    },
    {
      id: 'kz-as-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      prompt: 'Ein Halbkreis hat den Radius $r = 5$ cm. Berechne seinen **gesamten** Umfang (Bogen und Durchmesser). Runde auf eine Nachkommastelle.',
      answer: { kind: 'numeric', value: Math.PI * 5 + 10, tolerance: piTol(Math.PI * 5 + 10) },
      hints: ['Der Bogen ist der halbe Kreisumfang.', '$b = \\pi r = 5\\pi$', 'Dazu kommt die gerade Seite: der Durchmesser $10$ cm.'],
      solution: { steps: [{ text: 'Bogen + Durchmesser:', math: 'u = \\pi \\cdot 5 + 10 \\approx 15{,}7 + 10 = 25{,}7\\,\\text{cm}' }], finalAnswer: '$\\approx 25{,}7$ cm' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Durchmesser vergessen', feedback: 'Zum Umfang des Halbkreises gehört auch die gerade Kante.', answers: ['15,7'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-as-anteil',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => r.pick([[30, '1/12'], [36, '1/10'], [40, '1/9'], [45, '1/8'], [60, '1/6'], [72, '1/5'], [120, '1/3'], [180, '1/2'], [270, '3/4'], [240, '2/3'], [144, '2/5']] as const),
      build: ([alpha, frac], r) => {
        const tex = (f: string) => `$\\frac{${f.split('/')[0]}}{${f.split('/')[1]}}$`;
        const others = ['1/12', '1/10', '1/9', '1/8', '1/6', '1/5', '1/4', '1/3', '1/2', '2/3', '3/4', '2/5'].filter((f) => f !== frac);
        const { choices, correctId } = shuffledChoices(r, tex(frac), r.shuffle(others).slice(0, 3).map(tex));
        return {
          prompt: `Welchen Anteil des Kreises hat ein Kreisausschnitt mit dem Mittelpunktswinkel $\\alpha = ${alpha}^\\circ$?`,
          figure: circleFigure(`Kreisausschnitt mit ${alpha}°.`, { angle: `${alpha}°` }, alpha),
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Anteil $= \\frac{\\alpha}{360^\\circ}$', `$\\frac{${alpha}}{360}$`, 'Kürze den Bruch.'],
          solution: { steps: [{ text: `$\\frac{${alpha}}{360} = ${tex(frac).slice(1, -1)}$` }], finalAnswer: tex(frac) },
          commonMistakes: [{ description: 'Falsch gekürzt', feedback: 'Teile Zähler und Nenner durch dieselbe Zahl.' }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-as-bogen',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([3, 4, 5, 6, 8, 10, 12]), alpha: r.pick(ANGLES) }),
      build: ({ rad, alpha }) => {
        const b = (alpha / 360) * 2 * Math.PI * rad;
        return {
          prompt: `Berechne die Länge des Kreisbogens für $r = ${rad}$ cm und $\\alpha = ${alpha}^\\circ$. ${ROUND1}`,
          figure: circleFigure(`Kreisausschnitt mit r = ${rad} cm und α = ${alpha}°.`, { r: `r = ${rad} cm`, angle: `${alpha}°` }, alpha),
          answer: { kind: 'numeric', value: b, tolerance: piTol(b), unit: 'cm' },
          hints: ['$b = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$', `Anteil: $\\frac{${alpha}}{360}$`, `Ganzer Umfang: $2\\pi \\cdot ${rad} ${approx(2 * Math.PI * rad)}$ cm`],
          solution: { steps: [{ text: 'Formel:', math: `b = \\frac{${alpha}}{360} \\cdot 2\\pi \\cdot ${rad} ${approx(b)}` }], finalAnswer: `$b ${approx(b)}$ cm` },
          commonMistakes: [{ description: 'Ganzen Umfang berechnet', feedback: 'Nur der Anteil $\\frac{\\alpha}{360^\\circ}$ des Umfangs gehört zum Bogen.', answers: [rounded(2 * Math.PI * rad)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-as-flaeche',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([2, 3, 4, 5, 6, 7, 9, 10]), alpha: r.pick(ANGLES) }),
      build: ({ rad, alpha }) => {
        const a = (alpha / 360) * Math.PI * rad * rad;
        return {
          prompt: `Berechne den Flächeninhalt des Kreisausschnitts mit $r = ${rad}$ cm und $\\alpha = ${alpha}^\\circ$. ${ROUND1}`,
          figure: circleFigure(`Kreisausschnitt mit r = ${rad} cm und α = ${alpha}°.`, { r: `r = ${rad} cm`, angle: `${alpha}°` }, alpha),
          answer: { kind: 'numeric', value: a, tolerance: piTol(a), unit: 'cm²' },
          hints: ['$A_S = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$', `Kreisfläche: $\\pi \\cdot ${rad}^2 ${approx(Math.PI * rad * rad)}$ cm²`, `Davon der Anteil $\\frac{${alpha}}{360}$.`],
          solution: { steps: [{ text: 'Formel:', math: `A_S = \\frac{${alpha}}{360} \\cdot \\pi \\cdot ${rad}^2 ${approx(a)}` }], finalAnswer: `$A_S ${approx(a)}$ cm²` },
          commonMistakes: [{ description: 'Mit der Bogenformel gerechnet', feedback: 'Für die Fläche brauchst du $\\pi r^2$, nicht $2\\pi r$.', answers: [rounded((alpha / 360) * 2 * Math.PI * rad)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-as-winkel',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Mittelpunktswinkel bestimmen'],
      params: (r) => ({ rad: r.pick([4, 5, 6, 8, 10, 12]), alpha: r.pick(ANGLES) }),
      build: ({ rad, alpha }) => {
        const b = (alpha / 360) * 2 * Math.PI * rad;
        const shown = Math.round(b * 100) / 100;
        return {
          prompt: `Ein Kreisbogen hat bei $r = ${rad}$ cm die Länge $b = ${num(shown)}$ cm. Wie groß ist der Mittelpunktswinkel $\\alpha$? Runde auf ganze Grad.`,
          answer: { kind: 'numeric', value: alpha, tolerance: 0.6, unit: '°' },
          hints: ['$\\alpha = \\frac{b}{2\\pi r} \\cdot 360^\\circ$', `Ganzer Umfang: $2\\pi \\cdot ${rad} ${approx(2 * Math.PI * rad, 2)}$ cm`, 'Welcher Anteil davon ist der Bogen?'],
          solution: { steps: [{ text: 'Umstellen:', math: `\\alpha = \\frac{${num(shown)}}{2\\pi \\cdot ${rad}} \\cdot 360^\\circ \\approx ${alpha}^\\circ` }], finalAnswer: `$\\alpha \\approx ${alpha}^\\circ$` },
          commonMistakes: [{ description: 'Mit 100 statt 360 gerechnet', feedback: 'Der Vollwinkel hat $360^\\circ$.', answers: [rounded((alpha / 360) * 100, 0)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-as-sach',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Kreisausschnitt im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { text: 'Eine runde Torte ($d = {d}$ cm) wird in {n} gleich große Stücke geschnitten. Wie groß ist die Oberseite eines Stücks (in cm²)?', d: r.pick([24, 26, 28, 30]), n: r.pick([8, 12, 16]), area: true },
          { text: 'Eine Pizza ($d = {d}$ cm) wird in {n} gleich große Stücke geteilt. Wie lang ist der Rand (Bogen) eines Stücks (in cm)?', d: r.pick([26, 30, 32]), n: r.pick([6, 8]), area: false },
          { text: 'Ein Glücksrad ($d = {d}$ cm) hat {n} gleich große Felder. Wie groß ist die Fläche eines Feldes (in cm²)?', d: r.pick([40, 50, 60]), n: r.pick([10, 12, 20]), area: true },
        ]),
      build: ({ text, d, n, area }) => {
        const rad = d / 2;
        const v = area ? (Math.PI * rad * rad) / n : (2 * Math.PI * rad) / n;
        return {
          prompt: `${text.replace('{d}', String(d)).replace('{n}', `$${n}$`)} ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: area ? 'cm²' : 'cm' },
          hints: [`Ein Stück ist $\\frac{1}{${n}}$ des Kreises (Winkel $${num(360 / n)}^\\circ$).`, `Radius: $${num(rad)}$ cm`, area ? `Kreisfläche durch $${n}$ teilen.` : `Umfang durch $${n}$ teilen.`],
          solution: { steps: [{ text: area ? 'Fläche eines Stücks:' : 'Bogen eines Stücks:', math: `${area ? `\\frac{\\pi \\cdot ${num(rad)}^2}{${n}}` : `\\frac{2\\pi \\cdot ${num(rad)}}{${n}}`} ${approx(v)}` }], finalAnswer: `$${approx(v)}$ ${area ? 'cm²' : 'cm'}` },
          commonMistakes: [{ description: 'Durchmesser als Radius verwendet', feedback: 'Halbiere zuerst den Durchmesser.', answers: [rounded(area ? 4 * v : 2 * v)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-as-wischer',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Kreisausschnitt im Sachzusammenhang'],
      params: (r) => ({ R: r.pick([50, 55, 60]), r0: r.pick([10, 12, 15]), alpha: r.pick([90, 100, 110, 120]) }),
      build: ({ R, r0, alpha }) => {
        const a = (alpha / 360) * Math.PI * (R * R - r0 * r0);
        return {
          prompt: `Ein Scheibenwischer ist am Drehpunkt befestigt. Das Wischblatt reicht von $${r0}$ cm bis $${R}$ cm Abstand vom Drehpunkt und dreht sich um $${alpha}^\\circ$. Welche Fläche wischt es (in cm²)? Runde auf eine ganze Zahl.`,
          answer: { kind: 'numeric', value: a, tolerance: Math.max(0.6, a * 0.001), unit: 'cm²' },
          hints: ['Die gewischte Fläche ist ein Ausschnitt eines Kreisrings.', `Großer Ausschnitt minus kleiner Ausschnitt, beide mit $${alpha}^\\circ$.`, `$\\frac{${alpha}}{360} \\cdot \\pi \\cdot (${R}^2 - ${r0}^2)$`],
          solution: { steps: [{ text: 'Ausschnitt des Kreisrings:', math: `A = \\frac{${alpha}}{360} \\cdot \\pi \\cdot (${R}^2 - ${r0}^2) ${approx(a, 0)}` }], finalAnswer: `$${approx(a, 0)}$ cm²` },
          commonMistakes: [{ description: 'Inneren Teil nicht abgezogen', feedback: 'Zwischen Drehpunkt und Wischblatt wird nicht gewischt.', answers: [rounded((alpha / 360) * Math.PI * R * R, 0)] }],
        };
      },
    }),
  ],
};
