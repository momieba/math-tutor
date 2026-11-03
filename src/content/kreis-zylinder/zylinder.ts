import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num } from '../templates';
import { approx, piTol, RADIUS_DIAMETER_MISTAKE, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-zylinder';
const OBJ = ['Volumen und Oberfläche von Zylindern berechnen'];

export const zylinder: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 6,
  title: 'Zylinder',
  description: 'Volumen, Mantel und Oberfläche von Kreiszylindern – Dosen, Rohre, Säulen.',
  objective: 'Du berechnest Volumen, Mantelfläche und Oberfläche von Zylindern und bestimmst fehlende Größen.',
  intro:
    'Ein Zylinder ist wie ein Prisma mit kreisförmiger Grundfläche: Volumen gleich Grundfläche mal Höhe. Rollt man den Mantel ab, entsteht ein Rechteck – so lang wie der Umfang des Kreises und so hoch wie der Zylinder.',
  rules: [
    { term: 'Volumen', explanation: '', math: 'V = \\pi r^2 h' },
    { term: 'Mantelfläche', explanation: 'Abgerollt ein Rechteck:', math: 'M = 2\\pi r h' },
    { term: 'Oberfläche', explanation: 'Zwei Kreise plus Mantel:', math: 'O = 2\\pi r^2 + 2\\pi r h' },
    { term: 'Höhe aus dem Volumen', explanation: '', math: 'h = \\frac{V}{\\pi r^2}' },
  ],
  materials: [videoPlaceholder('kz-zylinder-v1', 'Volumen und Oberfläche des Zylinders')],
  example: {
    problem: 'Eine Dose hat $r = 4$ cm und $h = 10$ cm. Berechne Volumen und Oberfläche.',
    steps: [
      { text: 'Volumen:', math: 'V = \\pi \\cdot 4^2 \\cdot 10 = 160\\pi \\approx 502{,}7\\,\\text{cm}^3' },
      { text: 'Oberfläche:', math: 'O = 2\\pi \\cdot 16 + 2\\pi \\cdot 4 \\cdot 10 = 112\\pi \\approx 351{,}9\\,\\text{cm}^2' },
    ],
    result: '$V \\approx 502{,}7$ cm³ (gut ein halber Liter), $O \\approx 351{,}9$ cm²',
  },
  summary: ['$V = \\pi r^2 h$', '$M = 2\\pi r h$', '$O = 2\\pi r^2 + 2\\pi r h$'],
  exercises: [
    {
      id: 'kz-zy-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Form hat der Mantel eines Zylinders, wenn man ihn abrollt?',
      choices: [
        { id: 'a', label: 'ein Rechteck' },
        { id: 'b', label: 'ein Kreis' },
        { id: 'c', label: 'ein Dreieck' },
        { id: 'd', label: 'ein Trapez' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Denke an das Etikett einer Konservendose.', 'Nimmt man es ab, ist es flach …', '… und hat vier rechte Winkel.'],
      solution: { steps: [{ text: 'Abgerollt ist der Mantel ein Rechteck mit den Seiten $2\\pi r$ (Umfang) und $h$.' }], finalAnswer: 'ein Rechteck' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit Grundfläche verwechselt', feedback: 'Kreise sind Grund- und Deckfläche, nicht der Mantel.', answers: ['b'] }],
    },
    {
      id: 'kz-zy-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Zylinder A hat $r = 2$ cm und $h = 8$ cm, Zylinder B hat $r = 4$ cm und $h = 2$ cm. Was stimmt?',
      choices: [
        { id: 'a', label: 'Beide haben dasselbe Volumen.' },
        { id: 'b', label: 'A hat das größere Volumen.' },
        { id: 'c', label: 'B hat das doppelte Volumen von A.' },
        { id: 'd', label: 'B hat das vierfache Volumen von A.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Berechne $r^2 h$ für beide.', 'A: $4 \\cdot 8 = 32$', 'B: $16 \\cdot 2 = 32$'],
      solution: { steps: [{ text: '$V_A = \\pi \\cdot 4 \\cdot 8 = 32\\pi$, $V_B = \\pi \\cdot 16 \\cdot 2 = 32\\pi$ – gleich groß.' }], finalAnswer: 'gleiches Volumen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Radius nur linear berücksichtigt', feedback: 'Der Radius geht quadratisch ein: doppelter Radius ⇒ vierfache Grundfläche.', answers: ['b'] }],
    },
    {
      id: 'kz-zy-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Eine zylinderförmige Regentonne ($d = 60$ cm) ist $90$ cm hoch. Wie viele Liter fasst sie? Runde auf ganze Liter.',
      answer: { kind: 'numeric', value: (Math.PI * 30 * 30 * 90) / 1000, tolerance: 0.6, unit: 'ℓ' },
      hints: ['Radius: $30$ cm', '$V = \\pi \\cdot 30^2 \\cdot 90$ cm³', '$1000$ cm³ $= 1$ Liter'],
      solution: { steps: [{ text: 'Volumen:', math: 'V = \\pi \\cdot 30^2 \\cdot 90 \\approx 254\\,469\\,\\text{cm}^3 \\approx 254\\,\\ell' }], finalAnswer: '$\\approx 254$ Liter' },
      objectives: [...OBJ, 'Zylinder im Sachzusammenhang'],
      commonMistakes: [{ description: 'Durchmesser eingesetzt', feedback: 'In die Formel gehört der Radius $30$ cm.', answers: ['1018'] }],
    },
    {
      id: 'kz-zy-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Formel gilt für das Volumen eines Zylinders?',
      choices: [
        { id: 'a', label: '$V = \\pi r^2 h$' },
        { id: 'b', label: '$V = 2\\pi r h$' },
        { id: 'c', label: '$V = \\pi r h^2$' },
        { id: 'd', label: '$V = \\frac{1}{3}\\pi r^2 h$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Volumen = Grundfläche mal Höhe.', 'Die Grundfläche ist ein Kreis: $\\pi r^2$.', 'Mal $h$.'],
      solution: { steps: [{ text: '$V = G \\cdot h = \\pi r^2 \\cdot h$. ($2\\pi r h$ ist die Mantelfläche, $\\frac{1}{3}\\pi r^2 h$ das Kegelvolumen.)' }], finalAnswer: '$V = \\pi r^2 h$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mantelfläche gewählt', feedback: '$2\\pi r h$ ist eine Fläche (der Mantel), kein Volumen.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-zy-v',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([2, 3, 4, 5, 6, 8, 10, 1.5, 2.5]), h: r.pick([3, 5, 6, 8, 10, 12, 15, 20]) }),
      build: ({ rad, h }) => {
        const v = Math.PI * rad * rad * h;
        return {
          prompt: `Berechne das Volumen eines Zylinders mit $r = ${num(rad)}$ cm und $h = ${h}$ cm. ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: 'cm³' },
          hints: ['$V = \\pi r^2 h$', `Grundfläche: $\\pi \\cdot ${num(rad)}^2 ${approx(Math.PI * rad * rad)}$ cm²`, `Mal $${h}$ cm.`],
          solution: { steps: [{ text: 'Formel:', math: `V = \\pi \\cdot ${num(rad)}^2 \\cdot ${h} = ${num(rad * rad * h)}\\pi ${approx(v)}` }], finalAnswer: `$V ${approx(v)}$ cm³` },
          commonMistakes: [{ description: 'Mit 2πrh gerechnet', feedback: '$2\\pi r h$ ist die Mantelfläche. Volumen: $\\pi r^2 h$.', answers: [rounded(2 * Math.PI * rad * h)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-m',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ rad: r.pick([2, 3, 4, 5, 6, 7, 1.5]), h: r.pick([4, 5, 8, 10, 12, 15]) }),
      build: ({ rad, h }) => {
        const m = 2 * Math.PI * rad * h;
        return {
          prompt: `Ein Zylinder hat $r = ${num(rad)}$ cm und $h = ${h}$ cm. Berechne seine Mantelfläche. ${ROUND1}`,
          answer: { kind: 'numeric', value: m, tolerance: piTol(m), unit: 'cm²' },
          hints: ['Der Mantel ist abgerollt ein Rechteck.', `Länge = Umfang $2\\pi \\cdot ${num(rad)}$, Breite = $${h}$`, '$M = 2\\pi r h$'],
          solution: { steps: [{ text: 'Mantelfläche:', math: `M = 2\\pi \\cdot ${num(rad)} \\cdot ${h} ${approx(m)}` }], finalAnswer: `$M ${approx(m)}$ cm²` },
          commonMistakes: [{ description: 'Mit πrh gerechnet', feedback: 'Die Rechtecklänge ist der volle Umfang $2\\pi r$.', answers: [rounded(Math.PI * rad * h)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-o',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ d: r.pick([4, 6, 8, 10, 12, 16, 20]), h: r.pick([5, 8, 10, 12, 15]) }),
      build: ({ d, h }) => {
        const rad = d / 2;
        const o = 2 * Math.PI * rad * rad + 2 * Math.PI * rad * h;
        return {
          prompt: `Ein Zylinder hat den Durchmesser $${d}$ cm und die Höhe $${h}$ cm. Berechne seine Oberfläche. ${ROUND1}`,
          answer: { kind: 'numeric', value: o, tolerance: piTol(o), unit: 'cm²' },
          hints: [`Radius: $${num(rad)}$ cm`, '$O = 2\\pi r^2 + 2\\pi r h$', `Zwei Kreise: $${approx(2 * Math.PI * rad * rad)}$ cm², Mantel: $${approx(2 * Math.PI * rad * h)}$ cm²`],
          solution: { steps: [{ text: 'Oberfläche:', math: `O = 2\\pi \\cdot ${num(rad)}^2 + 2\\pi \\cdot ${num(rad)} \\cdot ${h} ${approx(o)}` }], finalAnswer: `$O ${approx(o)}$ cm²` },
          commonMistakes: [{ description: 'Nur eine Kreisfläche gezählt', feedback: 'Ein Zylinder hat Boden und Deckel.', answers: [rounded(Math.PI * rad * rad + 2 * Math.PI * rad * h)] }, RADIUS_DIAMETER_MISTAKE(2 * Math.PI * d * d + 2 * Math.PI * d * h)],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-hoehe',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Fehlende Größen bestimmen'],
      params: (r) => ({ rad: r.pick([3, 4, 5, 6, 7.5]), v: r.pick([500, 750, 1000, 1500, 2000]) }),
      build: ({ rad, v }) => {
        const h = v / (Math.PI * rad * rad);
        return {
          prompt: `Ein zylinderförmiger Behälter mit $r = ${num(rad)}$ cm soll $${v}$ cm³ fassen. Wie hoch muss sie sein? ${ROUND1}`,
          answer: { kind: 'numeric', value: h, tolerance: piTol(h), unit: 'cm' },
          hints: ['$V = \\pi r^2 h$ nach $h$ umstellen.', '$h = \\frac{V}{\\pi r^2}$', `$\\pi \\cdot ${num(rad)}^2 ${approx(Math.PI * rad * rad, 2)}$`],
          solution: { steps: [{ text: 'Umstellen:', math: `h = \\frac{${v}}{\\pi \\cdot ${num(rad)}^2} ${approx(h)}` }], finalAnswer: `$h ${approx(h)}$ cm` },
          commonMistakes: [{ description: 'Radius nicht quadriert', feedback: 'Im Nenner steht $\\pi r^2$.', answers: [rounded(v / (Math.PI * rad))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-radius',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Fehlende Größen bestimmen'],
      params: (r) => ({ h: r.pick([8, 10, 12, 15, 20]), v: r.pick([1000, 1500, 2000, 3000]) }),
      build: ({ h, v }) => {
        const rad = Math.sqrt(v / (Math.PI * h));
        return {
          prompt: `Ein Zylinder ist $${h}$ cm hoch und hat das Volumen $${v}$ cm³. Wie groß ist sein Radius? ${ROUND1}`,
          answer: { kind: 'numeric', value: rad, tolerance: piTol(rad), unit: 'cm' },
          hints: ['$V = \\pi r^2 h$ nach $r^2$ umstellen.', `$r^2 = \\frac{${v}}{\\pi \\cdot ${h}}$`, 'Wurzel ziehen.'],
          solution: { steps: [{ text: 'Umstellen:', math: `r^2 = \\frac{${v}}{\\pi \\cdot ${h}} ${approx(v / (Math.PI * h), 2)}` }, { text: 'Wurzel:', math: `r ${approx(rad)}` }], finalAnswer: `$r ${approx(rad)}$ cm` },
          commonMistakes: [{ description: 'Wurzel vergessen', feedback: 'Du hast $r^2$ – zieh noch die Wurzel.', answers: [rounded(v / (Math.PI * h))] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-liter',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Zylinder im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { what: 'Ein zylinderförmiger Messbecher', d: r.pick([8, 10, 12]), h: r.pick([12, 15, 18]) },
          { what: 'Ein Kochtopf', d: r.pick([20, 24, 28]), h: r.pick([12, 15, 18]) },
          { what: 'Eine Getränkedose', d: r.pick([6, 6.6, 7]), h: r.pick([11, 12, 15]) },
          { what: 'Ein Blumentopf (innen)', d: r.pick([16, 20, 25]), h: r.pick([15, 18, 20]) },
        ]),
      build: ({ what, d, h }) => {
        const liters = (Math.PI * (d / 2) ** 2 * h) / 1000;
        return {
          prompt: `${what} hat innen den Durchmesser $${num(d)}$ cm und die Höhe $${h}$ cm. Wie viele Liter passen hinein? ${'Runde auf zwei Nachkommastellen.'}`,
          answer: { kind: 'numeric', value: liters, tolerance: piTol(liters, 2), unit: 'ℓ' },
          hints: [`Radius: $${num(d / 2)}$ cm`, `$V = \\pi \\cdot ${num(d / 2)}^2 \\cdot ${h}$ cm³`, '$1000$ cm³ $= 1$ Liter'],
          solution: { steps: [{ text: 'Volumen:', math: `V = \\pi \\cdot ${num(d / 2)}^2 \\cdot ${h} ${approx(liters * 1000, 0)}\\,\\text{cm}^3 ${approx(liters, 2)}\\,\\ell` }], finalAnswer: `$${approx(liters, 2)}$ Liter` },
          commonMistakes: [{ description: 'Nicht in Liter umgerechnet', feedback: 'cm³ durch $1000$ teilen.', answers: [rounded(liters * 1000, 0)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-sach',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Zylinder im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { kind: 'etikett', d: r.pick([7, 8, 10]), h: r.pick([10, 11, 12]), n: r.pick([500, 1000, 2000]) },
          { kind: 'saeule', d: r.pick([0.8, 1, 1.2]), h: r.pick([3, 4, 5]), n: r.pick([4, 6, 8]) },
          { kind: 'blech', d: r.pick([8, 10]), h: r.pick([12, 15]), n: r.pick([100, 250]) },
        ]),
      build: ({ kind, d, h, n }) => {
        const rad = d / 2;
        const m = 2 * Math.PI * rad * h;
        const o = 2 * Math.PI * rad * rad + m;
        const value = kind === 'etikett' ? (m * n) / 10000 : kind === 'saeule' ? m * n : (o * n) / 10000;
        const unit = 'm²';
        const text =
          kind === 'etikett'
            ? `Für $${n}$ Konservendosen ($d = ${d}$ cm, $h = ${h}$ cm) werden Etiketten gedruckt, die den ganzen Mantel bedecken. Wie viele Quadratmeter Papier braucht man (ohne Überlappung)?`
            : kind === 'saeule'
              ? `$${n}$ zylinderförmige Säulen ($d = ${num(d)}$ m, $h = ${h}$ m) sollen rundherum gestrichen werden (ohne Boden und Deckfläche). Wie groß ist die zu streichende Fläche?`
              : `Für $${n}$ geschlossene Blechdosen ($d = ${d}$ cm, $h = ${h}$ cm) wird Blech benötigt. Wie viele Quadratmeter sind das (ohne Verschnitt)?`;
        return {
          prompt: `${text} ${ROUND1}`,
          answer: { kind: 'numeric', value, tolerance: piTol(value), unit },
          hints: [kind === 'blech' ? 'Gesucht ist die ganze Oberfläche $O = 2\\pi r^2 + 2\\pi r h$.' : 'Gesucht ist die Mantelfläche $M = 2\\pi r h$.', `Radius: $${num(rad)}$`, kind === 'saeule' ? `Mal $${n}$ Säulen.` : `Mal $${n}$ und von cm² in m² umrechnen ($: 10\\,000$).`],
          solution: { steps: [{ text: kind === 'blech' ? 'Oberfläche einer Dose:' : 'Mantel:', math: `${kind === 'blech' ? `O ${approx(o)}\\,\\text{cm}^2` : `M = 2\\pi \\cdot ${num(rad)} \\cdot ${h} ${approx(m)}${kind === 'saeule' ? '\\,\\text{m}^2' : '\\,\\text{cm}^2'}`}` }, { text: 'Insgesamt:', math: `${approx(value)}\\,\\text{m}^2` }], finalAnswer: `$${approx(value)}$ m²` },
          commonMistakes: [{ description: 'Nicht in m² umgerechnet', feedback: '$1\\,\\text{m}^2 = 10\\,000\\,\\text{cm}^2$.', answers: kind === 'saeule' ? [] : [rounded(value * 10000)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zy-vergleich',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ k: r.pick([2, 3, 4, 5, 10]), which: r.pick(['Radius', 'Höhe']) }),
      build: ({ k, which }) => {
        const f = which === 'Radius' ? k * k : k;
        return {
          prompt: `Bei einem Zylinder wird nur ${which === 'Radius' ? 'der Radius' : 'die Höhe'} ver-$${k}$-facht. Um welchen Faktor ändert sich das Volumen?`,
          answer: { kind: 'numeric', value: f, tolerance: 0.001 },
          hints: ['$V = \\pi r^2 h$', which === 'Radius' ? 'Der Radius steht im Quadrat.' : 'Die Höhe geht einfach ein.', `Setze $${k}${which === 'Radius' ? 'r' : 'h'}$ ein.`],
          solution: { steps: [{ text: which === 'Radius' ? `$\\pi (${k}r)^2 h = ${k * k} \\cdot \\pi r^2 h$` : `$\\pi r^2 (${k}h) = ${k} \\cdot \\pi r^2 h$` }], finalAnswer: `Faktor $${f}$` },
          commonMistakes: [{ description: which === 'Radius' ? 'Quadrat übersehen' : 'Fälschlich quadriert', feedback: 'Nur der Radius geht quadratisch ein, die Höhe linear.', answers: [String(which === 'Radius' ? k : k * k)] }],
        };
      },
    }),
  ],
};
