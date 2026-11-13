import type { AuthoredSubtopic } from '../../types';
import { nrwGym, videoPlaceholder } from '../helpers';
import { fromTemplate, num, round, txt } from '../templates';
import { TOPIC_ID } from './shared';

const S = 'kz-prisma';
const OBJ = ['Volumen und Oberfläche von Prismen berechnen'];

export const prisma: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 5,
  title: 'Prismen',
  labels: nrwGym(8), // NRW G9: Prismen in Klasse 8, die übrigen Kapitel in Klasse 9
  description: 'Netz, Oberfläche und Volumen von Prismen mit dreieckiger, rechteckiger oder trapezförmiger Grundfläche.',
  objective: 'Du berechnest Volumen und Oberfläche von Prismen und bestimmst fehlende Größen.',
  intro:
    'Ein Prisma hat zwei gleiche, parallele Grundflächen (z. B. Dreiecke) und rechteckige Seitenflächen. Stell dir vor, die Grundfläche wird gleichmäßig nach oben „geschoben“: Das Volumen ist dann Grundfläche mal Höhe. Die Oberfläche besteht aus den beiden Grundflächen und dem Mantel.',
  rules: [
    { term: 'Volumen', explanation: '', math: 'V = G \\cdot h' },
    { term: 'Oberfläche', explanation: 'Zwei Grundflächen plus Mantel:', math: 'O = 2G + M' },
    { term: 'Mantel', explanation: 'Umfang der Grundfläche mal Höhe:', math: 'M = u_G \\cdot h' },
    { term: 'Einheiten', explanation: '$1\\,\\text{dm}^3 = 1$ Liter, $1\\,\\text{m}^3 = 1000$ Liter.' },
  ],
  materials: [videoPlaceholder('kz-prisma-v1', 'Volumen und Oberfläche von Prismen')],
  example: {
    problem: 'Ein Prisma hat als Grundfläche ein rechtwinkliges Dreieck mit den Katheten $3$ cm und $4$ cm (Hypotenuse $5$ cm) und die Höhe $10$ cm.',
    steps: [
      { text: 'Grundfläche:', math: 'G = \\frac{3 \\cdot 4}{2} = 6\\,\\text{cm}^2' },
      { text: 'Volumen:', math: 'V = 6 \\cdot 10 = 60\\,\\text{cm}^3' },
      { text: 'Oberfläche:', math: 'O = 2 \\cdot 6 + (3 + 4 + 5) \\cdot 10 = 132\\,\\text{cm}^2' },
    ],
    result: '$V = 60$ cm³, $O = 132$ cm²',
  },
  summary: ['$V = G \\cdot h$', '$O = 2G + u_G \\cdot h$', 'Liter: $1$ dm³ $= 1$ ℓ'],
  exercises: [
    {
      id: 'kz-pr-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welcher Körper ist **kein** Prisma?',
      choices: [
        { id: 'a', label: 'Pyramide' },
        { id: 'b', label: 'Quader' },
        { id: 'c', label: 'Würfel' },
        { id: 'd', label: 'Dreiseitige Säule (z. B. Toblerone-Form)' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Ein Prisma hat zwei gleiche, parallele Grundflächen.', 'Hat eine Pyramide eine Deckfläche?', 'Die Pyramide läuft oben spitz zu.'],
      solution: { steps: [{ text: 'Die Pyramide hat nur eine Grundfläche und eine Spitze – kein Prisma. Quader und Würfel sind Prismen mit rechteckiger Grundfläche.' }], finalAnswer: 'Pyramide' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Würfel nicht als Prisma erkannt', feedback: 'Auch ein Würfel hat zwei gleiche, parallele Grundflächen.', answers: ['c'] }],
    },
    {
      id: 'kz-pr-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Aus welchen Flächen besteht das Netz eines dreiseitigen Prismas?',
      choices: [
        { id: 'a', label: '2 Dreiecke und 3 Rechtecke' },
        { id: 'b', label: '3 Dreiecke und 2 Rechtecke' },
        { id: 'c', label: '1 Dreieck und 3 Rechtecke' },
        { id: 'd', label: '6 Rechtecke' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Grund- und Deckfläche sind Dreiecke.', 'Jede Dreiecksseite gehört zu einer Seitenfläche.', 'Seitenflächen sind Rechtecke.'],
      solution: { steps: [{ text: 'Zwei dreieckige Grundflächen und drei rechteckige Seitenflächen.' }], finalAnswer: '2 Dreiecke, 3 Rechtecke' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Deckfläche vergessen', feedback: 'Ein Prisma hat oben und unten je eine Grundfläche.', answers: ['c'] }],
    },
    {
      id: 'kz-pr-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Alle Kanten eines Würfels werden verdoppelt. Wie ändert sich sein Volumen?',
      choices: [
        { id: 'a', label: 'Es wird $8$-mal so groß.' },
        { id: 'b', label: 'Es wird $2$-mal so groß.' },
        { id: 'c', label: 'Es wird $4$-mal so groß.' },
        { id: 'd', label: 'Es wird $6$-mal so groß.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['$V = a^3$', 'Setze $2a$ ein.', '$(2a)^3 = 8a^3$'],
      solution: { steps: [{ text: '$(2a)^3 = 2^3 \\cdot a^3 = 8a^3$ – das Volumen verachtfacht sich (die Oberfläche vervierfacht sich).' }], finalAnswer: '$8$-mal' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit der Oberfläche verwechselt', feedback: 'Die Oberfläche wächst mit Faktor $4$, das Volumen mit $2^3 = 8$.', answers: ['c'] }],
    },
    {
      id: 'kz-pr-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Schwimmbecken ist $25$ m lang und $10$ m breit. Es ist auf der einen Seite $1{,}2$ m und auf der anderen $2{,}0$ m tief (der Boden fällt gleichmäßig ab). Wie viele Kubikmeter Wasser passen hinein?',
      answer: { kind: 'numeric', value: 400, tolerance: 0.001, unit: 'm³' },
      hints: ['Das Becken ist ein Prisma mit trapezförmiger Grundfläche (Seitenansicht).', 'Trapez: $G = \\frac{1{,}2 + 2{,}0}{2} \\cdot 25$', 'Mal Breite $10$ m.'],
      solution: { steps: [{ text: 'Grundfläche (Trapez, Seitenansicht):', math: 'G = \\frac{1{,}2 + 2{,}0}{2} \\cdot 25 = 40\\,\\text{m}^2' }, { text: 'Volumen:', math: 'V = 40 \\cdot 10 = 400\\,\\text{m}^3' }], finalAnswer: '$400$ m³' },
      objectives: [...OBJ, 'Prismen im Sachzusammenhang'],
      commonMistakes: [{ description: 'Nur mit einer Tiefe gerechnet', feedback: 'Nimm den Mittelwert der Tiefen (Trapezformel).', answers: ['300', '500'] }],
    },
    {
      id: 'kz-pr-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie viele Liter sind $1$ m³?',
      answer: { kind: 'numeric', value: 1000, tolerance: 0.001, unit: 'ℓ' },
      hints: ['$1$ Liter $= 1$ dm³.', '$1$ m $= 10$ dm', '$1\\,\\text{m}^3 = 10 \\cdot 10 \\cdot 10\\,\\text{dm}^3$'],
      solution: { steps: [{ text: '$1\\,\\text{m}^3 = 1000\\,\\text{dm}^3 = 1000$ Liter.' }], finalAnswer: '$1000$ Liter' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Faktor 100 verwendet', feedback: 'Bei Raumeinheiten ist der Umrechnungsfaktor $1000$.', answers: ['100', '10'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-pr-quader',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.int(2, 12), b: r.int(2, 10), c: r.pick([3, 4, 5, 6, 8, 10, 2.5, 1.5]) }),
      build: ({ a, b, c }) => {
        const v = a * b * c;
        return {
          prompt: `Berechne das Volumen eines Quaders mit den Kantenlängen $${a}$ cm, $${b}$ cm und $${num(c)}$ cm.`,
          answer: { kind: 'numeric', value: v, tolerance: 0.001, unit: 'cm³' },
          hints: ['Grundfläche mal Höhe.', `$G = ${a} \\cdot ${b} = ${a * b}$ cm²`, `$V = ${a * b} \\cdot ${num(c)}$`],
          solution: { steps: [{ text: 'Volumen:', math: `V = ${a} \\cdot ${b} \\cdot ${num(c)} = ${num(v)}\\,\\text{cm}^3` }], finalAnswer: `$${num(v)}$ cm³` },
          commonMistakes: [{ description: 'Kanten addiert', feedback: 'Das Volumen ist ein Produkt: Länge · Breite · Höhe.', answers: [txt(a + b + c)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-quader-o',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ a: r.int(2, 12), b: r.int(2, 10), c: r.int(2, 9) }),
      build: ({ a, b, c }) => {
        const o = 2 * (a * b + a * c + b * c);
        return {
          prompt: `Berechne die Oberfläche eines Quaders mit $a = ${a}$ cm, $b = ${b}$ cm und $c = ${c}$ cm.`,
          answer: { kind: 'numeric', value: o, tolerance: 0.001, unit: 'cm²' },
          hints: ['Ein Quader hat sechs Rechtecke, je zwei gleiche.', '$O = 2(ab + ac + bc)$', `$${a * b} + ${a * c} + ${b * c} = ${a * b + a * c + b * c}$`],
          solution: { steps: [{ text: 'Oberfläche:', math: `O = 2 \\cdot (${a * b} + ${a * c} + ${b * c}) = ${o}\\,\\text{cm}^2` }], finalAnswer: `$${o}$ cm²` },
          commonMistakes: [{ description: 'Jede Fläche nur einmal gezählt', feedback: 'Jede Rechteckfläche kommt zweimal vor (gegenüberliegende Seiten).', answers: [String(o / 2)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-dreieck',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ g: r.int(3, 12), hg: r.int(2, 10), h: r.int(4, 20) }),
      build: ({ g, hg, h }) => {
        const G = (g * hg) / 2;
        const v = G * h;
        return {
          prompt: `Die Grundfläche eines Prismas ist ein Dreieck mit der Grundseite $${g}$ cm und der zugehörigen Höhe $${hg}$ cm. Das Prisma ist $${h}$ cm hoch. Berechne sein Volumen.`,
          answer: { kind: 'numeric', value: v, tolerance: 0.001, unit: 'cm³' },
          hints: ['Dreiecksfläche: $G = \\frac{g \\cdot h_g}{2}$', `$G = \\frac{${g} \\cdot ${hg}}{2} = ${num(G)}$ cm²`, `$V = G \\cdot ${h}$`],
          solution: { steps: [{ text: 'Grundfläche:', math: `G = \\frac{${g} \\cdot ${hg}}{2} = ${num(G)}\\,\\text{cm}^2` }, { text: 'Volumen:', math: `V = ${num(G)} \\cdot ${h} = ${num(v)}\\,\\text{cm}^3` }], finalAnswer: `$${num(v)}$ cm³` },
          commonMistakes: [{ description: 'Halbieren vergessen', feedback: 'Die Dreiecksfläche ist die Hälfte von Grundseite mal Höhe.', answers: [txt(2 * v)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-hoehe',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Fehlende Größen bestimmen'],
      params: (r) => ({ a: r.int(3, 10), b: r.int(2, 8), h: r.pick([2, 3, 4, 5, 6, 7.5, 12]), tri: r.int(0, 1) === 1 }),
      build: ({ a, b, h, tri }) => {
        const G = tri ? (a * b) / 2 : a * b;
        const v = G * h;
        return {
          prompt: `Ein Prisma hat ${tri ? `als Grundfläche ein rechtwinkliges Dreieck mit den Katheten $${a}$ cm und $${b}$ cm` : `eine rechteckige Grundfläche von $${a}$ cm × $${b}$ cm`} und das Volumen $${num(v)}$ cm³. Wie hoch ist es (in cm)?`,
          answer: { kind: 'numeric', value: h, tolerance: 0.001, unit: 'cm' },
          hints: ['$V = G \\cdot h$ nach $h$ umstellen.', `$G = ${num(G)}$ cm²`, `$h = \\frac{${num(v)}}{${num(G)}}$`],
          solution: { steps: [{ text: 'Grundfläche:', math: `G = ${tri ? `\\frac{${a} \\cdot ${b}}{2}` : `${a} \\cdot ${b}`} = ${num(G)}` }, { text: 'Höhe:', math: `h = \\frac{V}{G} = \\frac{${num(v)}}{${num(G)}} = ${num(h)}` }], finalAnswer: `$${num(h)}$ cm` },
          commonMistakes: [{ description: 'Dreiecksfläche nicht halbiert', feedback: 'Die Fläche eines rechtwinkligen Dreiecks ist das halbe Produkt der Katheten.', answers: tri ? [txt(h / 2)] : [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-dreieck-o',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ tri: r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]] as const), h: r.int(5, 15) }),
      build: ({ tri: [a, b, c], h }) => {
        const G = (a * b) / 2;
        const o = 2 * G + (a + b + c) * h;
        return {
          prompt: `Ein Prisma hat als Grundfläche ein rechtwinkliges Dreieck mit den Seiten $${a}$ cm, $${b}$ cm und $${c}$ cm (Hypotenuse). Es ist $${h}$ cm hoch. Berechne seine Oberfläche.`,
          answer: { kind: 'numeric', value: o, tolerance: 0.001, unit: 'cm²' },
          hints: ['$O = 2G + u_G \\cdot h$', `$G = \\frac{${a} \\cdot ${b}}{2} = ${G}$ cm², $u_G = ${a + b + c}$ cm`, `Mantel: $${a + b + c} \\cdot ${h}$`],
          solution: { steps: [{ text: 'Grundfläche und Umfang:', math: `G = ${G}\\,\\text{cm}^2,\\quad u_G = ${a + b + c}\\,\\text{cm}` }, { text: 'Oberfläche:', math: `O = 2 \\cdot ${G} + ${a + b + c} \\cdot ${h} = ${o}\\,\\text{cm}^2` }], finalAnswer: `$${o}$ cm²` },
          commonMistakes: [{ description: 'Nur eine Grundfläche gezählt', feedback: 'Ein Prisma hat zwei Grundflächen.', answers: [String(o - G)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-liter',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Prismen im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { what: 'Ein Aquarium', a: r.pick([60, 80, 100, 120]), b: r.pick([30, 35, 40, 50]), c: r.pick([35, 40, 45, 50]) },
          { what: 'Ein Blumenkasten', a: r.pick([60, 80, 100]), b: r.pick([15, 18, 20]), c: r.pick([15, 18, 20]) },
          { what: 'Eine Kühlbox (innen)', a: r.pick([40, 45, 50]), b: r.pick([25, 30]), c: r.pick([30, 35, 40]) },
        ]),
      build: ({ what, a, b, c }) => {
        const liters = (a * b * c) / 1000;
        return {
          prompt: `${what} ist $${a}$ cm lang, $${b}$ cm breit und $${c}$ cm hoch. Wie viele Liter passen hinein?`,
          answer: { kind: 'numeric', value: liters, tolerance: 0.01, unit: 'ℓ' },
          hints: ['Volumen in cm³ berechnen.', `$V = ${a} \\cdot ${b} \\cdot ${c} = ${a * b * c}$ cm³`, '$1000$ cm³ $= 1$ Liter'],
          solution: { steps: [{ text: 'Volumen:', math: `V = ${a} \\cdot ${b} \\cdot ${c} = ${a * b * c}\\,\\text{cm}^3 = ${num(liters)}\\,\\ell` }], finalAnswer: `$${num(liters)}$ Liter` },
          commonMistakes: [{ description: 'Nicht in Liter umgerechnet', feedback: 'Teile die cm³ durch $1000$.', answers: [String(a * b * c)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-sach',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Prismen im Sachzusammenhang'],
      params: (r) =>
        r.pick([
          { kind: 'zelt', b: r.pick([2, 2.4, 3]), hz: r.pick([1.5, 1.8, 2]), l: r.pick([2.5, 3, 4]) },
          { kind: 'dach', b: r.pick([8, 10, 12]), hz: r.pick([3, 4, 5]), l: r.pick([10, 12, 15]) },
          { kind: 'rinne', b: r.pick([0.4, 0.5, 0.6]), hz: r.pick([0.2, 0.3]), l: r.pick([5, 8, 10]) },
        ]),
      build: ({ kind, b, hz, l }) => {
        const v = round(((b * hz) / 2) * l, 4);
        const text =
          kind === 'zelt'
            ? `Ein Zelt hat die Form eines dreiseitigen Prismas: Die dreieckige Vorderseite ist unten $${num(b)}$ m breit und $${num(hz)}$ m hoch, das Zelt ist $${num(l)}$ m lang. Wie groß ist das Volumen (in m³)?`
            : kind === 'dach'
              ? `Ein Dachboden hat einen dreieckigen Querschnitt ($${b}$ m breit, $${hz}$ m hoch) und ist $${l}$ m lang. Wie groß ist sein Rauminhalt (in m³)?`
              : `Eine Regenrinne hat einen dreieckigen Querschnitt (oben $${num(b)}$ m breit, $${num(hz)}$ m tief) und ist $${l}$ m lang. Wie viele Liter Wasser fasst sie?`;
        const value = kind === 'rinne' ? v * 1000 : v;
        return {
          prompt: `${text} Runde auf eine Nachkommastelle.`,
          answer: { kind: 'numeric', value, tolerance: 0.06, unit: kind === 'rinne' ? 'ℓ' : 'm³' },
          hints: ['Die Grundfläche ist ein Dreieck: $G = \\frac{g \\cdot h}{2}$.', `$G = \\frac{${num(b)} \\cdot ${num(hz)}}{2} = ${num((b * hz) / 2, 3)}$ m²`, kind === 'rinne' ? 'Volumen in m³ mal $1000$ ergibt Liter.' : `Mal Länge $${num(l)}$ m.`],
          solution: { steps: [{ text: 'Grundfläche:', math: `G = \\frac{${num(b)} \\cdot ${num(hz)}}{2} = ${num((b * hz) / 2, 3)}\\,\\text{m}^2` }, { text: 'Volumen:', math: `V = ${num((b * hz) / 2, 3)} \\cdot ${num(l)} = ${num(v, 3)}\\,\\text{m}^3${kind === 'rinne' ? ` = ${num(value, 1)}\\,\\ell` : ''}` }], finalAnswer: `$${num(value, 1)}$ ${kind === 'rinne' ? 'Liter' : 'm³'}` },
          commonMistakes: [{ description: 'Dreieck nicht halbiert', feedback: 'Die Querschnittsfläche ist ein Dreieck – halbiere Breite mal Höhe.', answers: [txt(2 * value, 1)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-pr-farbe',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Prismen im Sachzusammenhang'],
      params: (r) => ({ a: r.pick([40, 50, 60]), b: r.pick([30, 40]), c: r.pick([40, 50, 80]), dose: r.pick([5000, 8000, 10000]) }),
      build: ({ a, b, c, dose }) => {
        const o = 2 * (a * b + a * c + b * c);
        const n = Math.ceil(o / dose);
        return {
          prompt: `Eine Holzkiste ($${a}$ cm × $${b}$ cm × $${c}$ cm) soll rundherum lackiert werden. Eine Dose Lack reicht für $${num(dose)}$ cm². Wie viele Dosen braucht man mindestens?`,
          answer: { kind: 'numeric', value: n, tolerance: 0.001 },
          hints: ['Berechne die Oberfläche des Quaders.', `$O = 2(${a * b} + ${a * c} + ${b * c}) = ${o}$ cm²`, `Teile durch $${dose}$ und runde auf.`],
          solution: { steps: [{ text: 'Oberfläche:', math: `O = ${o}\\,\\text{cm}^2` }, { text: 'Dosen:', math: `${o} : ${dose} \\approx ${num(o / dose, 2)} \\;\\Rightarrow\\; ${n}` }], finalAnswer: `$${n}$ Dosen` },
          commonMistakes: [{ description: 'Abgerundet', feedback: 'Bei Material immer aufrunden – sonst reicht es nicht.', answers: n > 1 ? [String(n - 1)] : [] }],
        };
      },
    }),
  ],
};
