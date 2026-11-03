import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round } from '../templates';
import { approx, circleFigure, piTol, RADIUS_DIAMETER_MISTAKE, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-umfang';
const OBJ = ['Kreisumfang berechnen', 'Die Kreiszahl π kennen'];

export const umfang: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 1,
  title: 'Kreisumfang und die Zahl π',
  description: 'Umfang aus Radius oder Durchmesser berechnen – und umgekehrt.',
  objective: 'Du berechnest den Umfang eines Kreises und bestimmst Radius oder Durchmesser aus dem Umfang.',
  intro:
    'Bei jedem Kreis ist der Umfang etwas mehr als dreimal so lang wie der Durchmesser. Das Verhältnis $\\frac{u}{d}$ ist immer gleich – die Kreiszahl $\\pi \\approx 3{,}14159$. Daraus folgt die Umfangsformel.',
  rules: [
    { term: 'Kreiszahl $\\pi$', explanation: 'Verhältnis von Umfang zu Durchmesser, $\\pi \\approx 3{,}14$. Rechne mit der $\\pi$-Taste.' },
    { term: 'Umfang', explanation: '', math: 'u = \\pi \\cdot d = 2 \\pi r' },
    { term: 'Radius aus dem Umfang', explanation: '', math: 'r = \\frac{u}{2\\pi}' },
    { term: 'Durchmesser', explanation: '$d = 2r$' },
  ],
  materials: [videoPlaceholder('kz-umfang-v1', 'Kreisumfang und π')],
  example: {
    problem: 'Ein Kreis hat den Radius $r = 4$ cm. Berechne den Umfang.',
    steps: [{ text: 'Formel anwenden:', math: 'u = 2 \\pi \\cdot 4\\,\\text{cm} = 8\\pi\\,\\text{cm} \\approx 25{,}1\\,\\text{cm}' }],
    result: '$u \\approx 25{,}1$ cm',
  },
  summary: ['$u = \\pi d = 2\\pi r$', '$\\pi \\approx 3{,}14$ – mit der $\\pi$-Taste rechnen.', '$r = \\frac{u}{2\\pi}$'],
  exercises: [
    {
      id: 'kz-um-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was gibt die Kreiszahl $\\pi$ an?',
      choices: [
        { id: 'a', label: 'Das Verhältnis von Umfang zu Durchmesser' },
        { id: 'b', label: 'Das Verhältnis von Radius zu Durchmesser' },
        { id: 'c', label: 'Den Flächeninhalt eines Kreises mit $r = 1$ m in m²' },
        { id: 'd', label: 'Den Umfang eines Kreises mit $r = 1$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Teilt man den Umfang eines Kreises durch seinen Durchmesser, erhält man immer dieselbe Zahl.', 'Diese Zahl ist etwa $3{,}14$.', '$\\pi = \\frac{u}{d}$'],
      solution: { steps: [{ text: '$\\pi = \\frac{u}{d}$ – für jeden Kreis gleich, etwa $3{,}14$. (Der Flächeninhalt bei $r = 1$ ist zwar auch $\\pi$, aber das ist eine Folgerung.)' }], finalAnswer: '$\\pi = \\frac{u}{d}$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Umfang bei r = 1 verwechselt', feedback: 'Bei $r = 1$ ist der Umfang $2\\pi$, nicht $\\pi$.', answers: ['d'] }],
    },
    {
      id: 'kz-um-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Formel beschreibt den Umfang eines Kreises?',
      choices: [
        { id: 'a', label: '$u = 2\\pi r$' },
        { id: 'b', label: '$u = \\pi r^2$' },
        { id: 'c', label: '$u = 2r$' },
        { id: 'd', label: '$u = \\pi r$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$u = \\pi \\cdot d$', 'Der Durchmesser ist $2r$.', 'Setze $d = 2r$ ein.'],
      solution: { steps: [{ text: '$u = \\pi d = \\pi \\cdot 2r = 2\\pi r$. ($\\pi r^2$ ist der Flächeninhalt.)' }], finalAnswer: '$u = 2\\pi r$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit der Flächenformel verwechselt', feedback: '$\\pi r^2$ ist der Flächeninhalt – der Umfang ist eine Länge: $2\\pi r$.', answers: ['b'] }],
    },
    {
      id: 'kz-um-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Der Radius eines Kreises wird verdoppelt. Was passiert mit dem Umfang?',
      choices: [
        { id: 'a', label: 'Er verdoppelt sich.' },
        { id: 'b', label: 'Er vervierfacht sich.' },
        { id: 'c', label: 'Er wächst um $2\\pi$.' },
        { id: 'd', label: 'Er bleibt gleich.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$u = 2\\pi r$ – der Umfang ist proportional zu $r$.', 'Setze $2r$ statt $r$ ein.', '$2\\pi \\cdot 2r = 2 \\cdot (2\\pi r)$'],
      solution: { steps: [{ text: '$u$ ist proportional zu $r$: $2\\pi \\cdot (2r) = 2 \\cdot 2\\pi r$ – der Umfang verdoppelt sich.' }], finalAnswer: 'Er verdoppelt sich.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit der Fläche verwechselt', feedback: 'Die Fläche vervierfacht sich – der Umfang nur verdoppelt.', answers: ['b'] }],
    },
    {
      id: 'kz-um-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Seil wird straff um den Äquator der Erde gelegt ($r \\approx 6370$ km). Dann wird es um $1$ m verlängert und gleichmäßig angehoben. Wie viele Zentimeter Abstand entstehen zwischen Seil und Erde? Runde auf eine ganze Zahl.',
      answer: { kind: 'numeric', value: 100 / (2 * Math.PI), tolerance: 0.6, unit: 'cm' },
      hints: ['Neuer Umfang: $u + 1$ m. Neuer Radius: $r + \\Delta r$.', '$2\\pi(r + \\Delta r) = 2\\pi r + 1$', 'Der Erdradius fällt weg: $\\Delta r = \\frac{1}{2\\pi}$ m.'],
      solution: { steps: [{ text: 'Aus $2\\pi(r + \\Delta r) = 2\\pi r + 1$ folgt:', math: '\\Delta r = \\frac{1\\,\\text{m}}{2\\pi} \\approx 0{,}16\\,\\text{m} = 16\\,\\text{cm}' }, { text: 'Überraschend: Das Ergebnis hängt gar nicht von der Größe der Erde ab.' }], finalAnswer: '$\\approx 16$ cm' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Für winzig gehalten', feedback: 'Der Erdradius kürzt sich heraus: $\\Delta r = \\frac{1}{2\\pi}$ m – unabhängig von der Größe des Kreises.', answers: ['0'] }],
    },
    {
      id: 'kz-um-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Gib $\\pi$ auf zwei Nachkommastellen gerundet an.',
      answer: { kind: 'numeric', value: 3.14, tolerance: 0.001 },
      hints: ['$\\pi = 3{,}14159\\ldots$', 'Die dritte Nachkommastelle ist eine $1$.', 'Also wird abgerundet.'],
      solution: { steps: [{ text: '$\\pi = 3{,}14159\\ldots \\approx 3{,}14$' }], finalAnswer: '$3{,}14$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit 22/7 oder 3,15 verwechselt', feedback: '$\\pi = 3{,}14159\\ldots$, auf zwei Stellen gerundet $3{,}14$.', answers: ['3,15', '3,1'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-um-r',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 2.5, 3.5, 4.5]), unit: r.pick(['cm', 'm', 'mm']) }),
      build: ({ rad, unit }) => {
        const u = 2 * Math.PI * rad;
        return {
          prompt: `Ein Kreis hat den Radius $r = ${num(rad)}$ ${unit}. Berechne seinen Umfang. ${ROUND1}`,
          figure: circleFigure(`Kreis mit Radius ${num(rad)} ${unit}.`, { r: `r = ${rounded(rad)} ${unit}` }),
          answer: { kind: 'numeric', value: u, tolerance: piTol(u), unit },
          hints: ['$u = 2\\pi r$', `Setze $r = ${num(rad)}$ ein.`, 'Nutze die $\\pi$-Taste.'],
          solution: { steps: [{ text: 'Formel:', math: `u = 2\\pi \\cdot ${num(rad)} = ${num(2 * rad)}\\pi ${approx(u)}` }], finalAnswer: `$u ${approx(u)}$ ${unit}` },
          commonMistakes: [{ description: 'Mit πr gerechnet', feedback: 'Der Umfang ist $2\\pi r$ (oder $\\pi d$), nicht $\\pi r$.', answers: [rounded(Math.PI * rad)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-d',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ d: r.pick([3, 5, 7, 8, 10, 12, 14, 18, 20, 25, 30, 1.5]), unit: r.pick(['cm', 'm', 'dm']) }),
      build: ({ d, unit }) => {
        const u = Math.PI * d;
        return {
          prompt: `Ein Kreis hat den Durchmesser $d = ${num(d)}$ ${unit}. Berechne seinen Umfang. ${ROUND1}`,
          answer: { kind: 'numeric', value: u, tolerance: piTol(u), unit },
          hints: ['$u = \\pi \\cdot d$', `Setze $d = ${num(d)}$ ein.`, 'Nutze die $\\pi$-Taste.'],
          solution: { steps: [{ text: 'Formel:', math: `u = \\pi \\cdot ${num(d)} ${approx(u)}` }], finalAnswer: `$u ${approx(u)}$ ${unit}` },
          commonMistakes: [RADIUS_DIAMETER_MISTAKE(2 * Math.PI * d)],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-radius',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ u: r.pick([10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 12.5]), unit: r.pick(['cm', 'm']) }),
      build: ({ u, unit }) => {
        const rad = u / (2 * Math.PI);
        return {
          prompt: `Ein Kreis hat den Umfang $u = ${num(u)}$ ${unit}. Berechne seinen Radius. ${ROUND1}`,
          answer: { kind: 'numeric', value: rad, tolerance: piTol(rad), unit },
          hints: ['Stelle $u = 2\\pi r$ nach $r$ um.', '$r = \\frac{u}{2\\pi}$', `Rechne $${num(u)} : (2\\pi)$.`],
          solution: { steps: [{ text: 'Umstellen und einsetzen:', math: `r = \\frac{${num(u)}}{2\\pi} ${approx(rad)}` }], finalAnswer: `$r ${approx(rad)}$ ${unit}` },
          commonMistakes: [{ description: 'Durchmesser statt Radius berechnet', feedback: '$\\frac{u}{\\pi}$ ist der Durchmesser – für den Radius noch halbieren.', answers: [rounded(u / Math.PI)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-durchmesser',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ u: r.pick([31.4, 47.1, 62.8, 94.2, 120, 150, 200, 80]), unit: r.pick(['cm', 'mm']) }),
      build: ({ u, unit }) => {
        const d = u / Math.PI;
        return {
          prompt: `Der Umfang einer kreisrunden Scheibe beträgt $${num(u)}$ ${unit}. Wie groß ist ihr Durchmesser? ${ROUND1}`,
          answer: { kind: 'numeric', value: d, tolerance: piTol(d), unit },
          hints: ['$u = \\pi d$', 'Stelle nach $d$ um.', `$d = \\frac{${num(u)}}{\\pi}$`],
          solution: { steps: [{ text: 'Umstellen:', math: `d = \\frac{u}{\\pi} = \\frac{${num(u)}}{\\pi} ${approx(d)}` }], finalAnswer: `$d ${approx(d)}$ ${unit}` },
          commonMistakes: [{ description: 'Radius berechnet', feedback: 'Gefragt ist der Durchmesser: $d = \\frac{u}{\\pi}$.', answers: [rounded(u / (2 * Math.PI))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-rad-strecke',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Umfang im Sachzusammenhang'],
      params: (r) => {
        const [thing, ds] = r.pick([
          ['Ein Fahrradreifen', [60, 66, 70, 71]],
          ['Ein Kinderfahrrad-Reifen', [40, 45, 50]],
          ['Das Rad eines Bollerwagens', [25, 30, 35]],
          ['Das Messrad eines Bauarbeiters', [32, 40]],
        ] as const);
        return { thing, d: r.pick(ds), n: r.pick([10, 20, 50, 100, 250, 500]) };
      },
      build: ({ thing, d, n }) => {
        const s = (Math.PI * d * n) / 100;
        return {
          prompt: `${thing} hat einen Durchmesser von $${d}$ cm. Welche Strecke legt das Rad bei $${n}$ Umdrehungen zurück (in m)? ${ROUND1}`,
          answer: { kind: 'numeric', value: s, tolerance: piTol(s), unit: 'm' },
          hints: ['Bei einer Umdrehung rollt das Rad seinen Umfang ab.', `$u = \\pi \\cdot ${d}$ cm`, `Mal $${n}$ und in Meter umrechnen ($: 100$).`],
          solution: { steps: [{ text: 'Umfang:', math: `u = \\pi \\cdot ${d}\\,\\text{cm} ${approx(Math.PI * d)}\\,\\text{cm}` }, { text: 'Strecke:', math: `${n} \\cdot ${num(round(Math.PI * d, 2))}\\,\\text{cm} ${approx(s * 100, 0)}\\,\\text{cm} ${approx(s)}\\,\\text{m}` }], finalAnswer: `$${approx(s).replace('\\approx ', '\\approx ')}$ m` },
          commonMistakes: [{ description: 'Nicht in Meter umgerechnet', feedback: 'Das Ergebnis in cm noch durch $100$ teilen.', answers: [rounded(s * 100)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-umdrehungen',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Umfang im Sachzusammenhang'],
      params: (r) => ({ d: r.pick([56, 60, 66, 70, 71]), km: r.pick([1, 2, 5, 0.5, 1.5]) }),
      build: ({ d, km }) => {
        const n = (km * 100000) / (Math.PI * d);
        return {
          prompt: `Ein Fahrradreifen hat einen Durchmesser von $${d}$ cm. Wie viele Umdrehungen macht er auf einer Strecke von $${num(km)}$ km? Runde auf ganze Umdrehungen.`,
          answer: { kind: 'numeric', value: n, tolerance: Math.max(0.6, n * 0.001) },
          hints: ['Rechne die Strecke in Zentimeter um.', `$${num(km)}$ km $= ${num(km * 100000)}$ cm`, `Teile durch den Umfang $\\pi \\cdot ${d}$ cm.`],
          solution: { steps: [{ text: 'Umfang:', math: `u = \\pi \\cdot ${d} ${approx(Math.PI * d)}\\,\\text{cm}` }, { text: 'Umdrehungen:', math: `\\frac{${num(km * 100000)}}{${num(round(Math.PI * d, 2))}} ${approx(n, 0)}` }], finalAnswer: `$${approx(n, 0)}$ Umdrehungen` },
          commonMistakes: [{ description: 'Einheiten nicht angeglichen', feedback: 'Strecke und Umfang müssen in derselben Einheit sein.', answers: [rounded(km / (Math.PI * d), 0)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-sach',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Umfang im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { text: 'Um ein kreisrundes Beet mit $r = {v}$ m soll ein Zaun gebaut werden. Wie viele Meter Zaun braucht man?', v: r.pick([1.5, 2, 2.5, 3, 4]), radius: true, unit: 'm' },
          { text: 'Ein runder Tisch hat einen Durchmesser von ${v}$ cm. Wie lang muss eine Zierborte für den Rand sein (in cm)?', v: r.pick([80, 90, 100, 120]), radius: false, unit: 'cm' },
          { text: 'Ein Riesenrad hat einen Durchmesser von ${v}$ m. Welche Strecke legt eine Gondel bei einer Umdrehung zurück?', v: r.pick([40, 50, 60]), radius: false, unit: 'm' },
          { text: 'Eine Laufbahn in einer Sporthalle ist ein Kreis mit $r = {v}$ m. Wie lang ist eine Runde?', v: r.pick([12, 15, 18, 20]), radius: true, unit: 'm' },
        ]),
      build: ({ text, v, radius, unit }) => {
        const u = radius ? 2 * Math.PI * v : Math.PI * v;
        return {
          prompt: `${text.replace('{v}', num(v))} ${ROUND1}`,
          answer: { kind: 'numeric', value: u, tolerance: piTol(u), unit },
          hints: ['Gesucht ist der Umfang.', radius ? '$u = 2\\pi r$' : '$u = \\pi d$', 'Nutze die $\\pi$-Taste.'],
          solution: { steps: [{ text: 'Umfang:', math: `u = ${radius ? `2\\pi \\cdot ${num(v)}` : `\\pi \\cdot ${num(v)}`} ${approx(u)}` }], finalAnswer: `$${approx(u)}$ ${unit}` },
          commonMistakes: [radius ? RADIUS_DIAMETER_MISTAKE(Math.PI * v) : RADIUS_DIAMETER_MISTAKE(2 * Math.PI * v)],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-um-vergleich',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ k: r.pick([2, 3, 4, 5, 10]), what: r.pick(['Radius', 'Durchmesser']) }),
      build: ({ k, what }) => ({
        prompt: `Der ${what} eines Kreises wird ver-$${k}$-facht. Um welchen Faktor ändert sich der Umfang?`,
        answer: { kind: 'numeric', value: k, tolerance: 0.001 },
        hints: ['$u = 2\\pi r = \\pi d$', 'Der Umfang ist proportional zu $r$ und zu $d$.', `Setze $${k}r$ ein.`],
        solution: { steps: [{ text: `Der Umfang ist proportional zum ${what}: Er wird ebenfalls ver-$${k}$-facht.` }], finalAnswer: `Faktor $${k}$` },
        commonMistakes: [{ description: 'Quadriert', feedback: 'Quadratisch wächst nur der Flächeninhalt, nicht der Umfang.', answers: [String(k * k)] }],
      }),
    }),
  ],
};
