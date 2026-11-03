import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round } from '../templates';
import { approx, piTol, ROUND1, rounded, TOPIC_ID } from './shared';

const S = 'kz-zusammengesetzt';
const OBJ = ['Volumen zusammengesetzter Körper berechnen'];

export const zusammengesetzt: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 7,
  title: 'Zusammengesetzte Körper',
  description: 'Rohre, Bohrungen und Bauwerke aus Quadern, Prismen und Zylindern berechnen.',
  objective: 'Du zerlegst Körper in Prismen und Zylinder bzw. ergänzt sie und berechnest so ihr Volumen und ihre Masse.',
  intro:
    'Viele Gegenstände sind aus einfachen Körpern zusammengesetzt: ein Haus aus Quader und Prisma, ein Rohr aus zwei Zylindern, ein Werkstück mit einer Bohrung. Man berechnet die Teilkörper einzeln und addiert (zusammengesetzt) oder subtrahiert (ausgeschnitten) die Volumen.',
  rules: [
    { term: 'Zusammensetzen', explanation: 'Volumen der Teilkörper addieren.' },
    { term: 'Aushöhlen', explanation: 'Volumen des herausgenommenen Teils abziehen, z. B. Rohr:', math: 'V = \\pi (R^2 - r^2) h' },
    { term: 'Masse', explanation: 'Volumen mal Dichte:', math: 'm = V \\cdot \\rho' },
  ],
  materials: [videoPlaceholder('kz-zusammengesetzt-v1', 'Zusammengesetzte Körper')],
  example: {
    problem: 'Ein Rohr ist $2$ m lang, außen $R = 5$ cm und innen $r = 4$ cm. Wie groß ist das Materialvolumen?',
    steps: [{ text: 'Großer minus kleiner Zylinder (alles in cm):', math: 'V = \\pi (5^2 - 4^2) \\cdot 200 = 1800\\pi \\approx 5655\\,\\text{cm}^3' }],
    result: '$V \\approx 5655$ cm³ $\\approx 5{,}7$ Liter',
  },
  summary: ['Zerlegen oder ergänzen.', 'Teilvolumen addieren bzw. subtrahieren.', 'Einheiten vorher angleichen.'],
  exercises: [
    {
      id: 'kz-zg-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie berechnet man das Volumen eines Quaders, in den ein zylindrisches Loch gebohrt wurde?',
      choices: [
        { id: 'a', label: 'Quadervolumen minus Zylindervolumen' },
        { id: 'b', label: 'Quadervolumen plus Zylindervolumen' },
        { id: 'c', label: 'Quadervolumen mal Zylindervolumen' },
        { id: 'd', label: 'Nur das Quadervolumen' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Durch die Bohrung wird Material entfernt.', 'Entferntes Material muss man …', '… abziehen.'],
      solution: { steps: [{ text: 'Das Loch ist kein Material mehr: $V = V_{\\text{Quader}} - V_{\\text{Zylinder}}$.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Addiert statt subtrahiert', feedback: 'Eine Bohrung nimmt Material weg.', answers: ['b'] }],
    },
    {
      id: 'kz-zg-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Ein Haus besteht aus einem Quader mit einem Satteldach (dreiseitiges Prisma) obendrauf. Welche Zerlegung ist sinnvoll?',
      choices: [
        { id: 'a', label: 'Quader + dreiseitiges Prisma' },
        { id: 'b', label: 'Quader + Zylinder' },
        { id: 'c', label: 'Zwei Quader' },
        { id: 'd', label: 'Quader − Prisma' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Welche Form hat das Dach im Querschnitt?', 'Ein Dreieck.', 'Das Dach ist ein Prisma, das auf dem Quader sitzt.'],
      solution: { steps: [{ text: 'Unten ein Quader, oben ein dreiseitiges Prisma – die Volumen werden addiert.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Subtrahiert', feedback: 'Das Dach kommt dazu, es wird nichts herausgeschnitten.', answers: ['d'] }],
    },
    {
      id: 'kz-zg-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Stahlrohr ist $3$ m lang, hat außen $8$ cm und innen $7$ cm Durchmesser. Stahl hat die Dichte $7{,}85$ g/cm³. Wie schwer ist das Rohr in kg? Runde auf eine Nachkommastelle.',
      answer: { kind: 'numeric', value: (Math.PI * (16 - 12.25) * 300 * 7.85) / 1000, tolerance: 0.06, unit: 'kg' },
      hints: ['Radien: $R = 4$ cm, $r = 3{,}5$ cm; Länge $300$ cm.', '$V = \\pi (4^2 - 3{,}5^2) \\cdot 300$', 'Masse $= V \\cdot 7{,}85$ g, dann durch $1000$.'],
      solution: { steps: [{ text: 'Volumen:', math: 'V = \\pi (16 - 12{,}25) \\cdot 300 = 1125\\pi \\approx 3534{,}3\\,\\text{cm}^3' }, { text: 'Masse:', math: '3534{,}3 \\cdot 7{,}85 \\approx 27\\,744\\,\\text{g} \\approx 27{,}7\\,\\text{kg}' }], finalAnswer: '$\\approx 27{,}7$ kg' },
      objectives: [...OBJ, 'Masse berechnen'],
      commonMistakes: [{ description: 'Durchmesser statt Radien', feedback: 'Halbiere die Durchmesser, bevor du quadrierst.', answers: ['111'] }],
    },
    {
      id: 'kz-zg-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Wann ist es geschickter, einen Körper zu **ergänzen** statt zu zerlegen?',
      choices: [
        { id: 'a', label: 'Wenn der Körper ein einfacher Körper mit einem fehlenden Stück ist (z. B. L-Form als Quader minus Quader).' },
        { id: 'b', label: 'Nie, Zerlegen ist immer einfacher.' },
        { id: 'c', label: 'Nur bei Zylindern.' },
        { id: 'd', label: 'Wenn der Körper keine Grundfläche hat.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Denke an eine L-förmige Stufe.', 'Man kann sie zu einem großen Quader ergänzen.', 'Dann zieht man das ergänzte Stück wieder ab.'],
      solution: { steps: [{ text: 'Ist ein Körper ein einfacher Körper mit „fehlender Ecke“, ist großer Körper minus fehlendes Stück oft schneller als mehrere Teilkörper.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Ergänzen ausgeschlossen', feedback: 'Beide Wege sind richtig – manchmal ist Ergänzen kürzer.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'kz-zg-turm',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([10, 12, 15, 20]), hq: r.pick([4, 5, 6, 8]), rad: r.pick([2, 3, 4]), hz: r.pick([6, 8, 10]) }),
      build: ({ a, hq, rad, hz }) => {
        const v = a * a * hq + Math.PI * rad * rad * hz;
        return {
          prompt: `Auf einem quadratischen Sockel ($${a}$ cm × $${a}$ cm, $${hq}$ cm hoch) steht ein Zylinder mit $r = ${rad}$ cm und $h = ${hz}$ cm. Berechne das Gesamtvolumen. ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: 'cm³' },
          hints: [`Sockel: $${a} \\cdot ${a} \\cdot ${hq}$ cm³`, `Zylinder: $\\pi \\cdot ${rad}^2 \\cdot ${hz}$ cm³`, 'Beide addieren.'],
          solution: { steps: [{ text: 'Teilvolumen:', math: `V_Q = ${a * a * hq},\\quad V_Z = \\pi \\cdot ${rad}^2 \\cdot ${hz} ${approx(Math.PI * rad * rad * hz)}` }, { text: 'Summe:', math: `V ${approx(v)}\\,\\text{cm}^3` }], finalAnswer: `$V ${approx(v)}$ cm³` },
          commonMistakes: [{ description: 'Zylinder vergessen', feedback: 'Der Zylinder gehört auch zum Körper.', answers: [String(a * a * hq)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-rohr',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const R = r.pick([3, 4, 5, 6, 8, 10]);
        return { R, r0: R - r.pick([0.5, 1, 1.5, 2]), l: r.pick([20, 50, 80, 100, 150]) };
      },
      build: ({ R, r0, l }) => {
        const v = Math.PI * (R * R - r0 * r0) * l;
        return {
          prompt: `Ein Rohr ist $${l}$ cm lang, sein Außenradius beträgt $${num(R)}$ cm, sein Innenradius $${num(r0)}$ cm. Berechne das Volumen des Materials. ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: 'cm³' },
          hints: ['Großer Zylinder minus kleiner Zylinder.', '$V = \\pi (R^2 - r^2) \\cdot l$', `$${num(R)}^2 - ${num(r0)}^2 = ${num(R * R - r0 * r0)}$`],
          solution: { steps: [{ text: 'Hohlzylinder:', math: `V = \\pi (${num(R)}^2 - ${num(r0)}^2) \\cdot ${l} ${approx(v)}` }], finalAnswer: `$V ${approx(v)}$ cm³` },
          commonMistakes: [{ description: 'Hohlraum nicht abgezogen', feedback: 'Das Innere des Rohrs ist hohl.', answers: [rounded(Math.PI * R * R * l)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-bohrung',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([6, 8, 10, 12]), b: r.pick([5, 6, 8]), c: r.pick([4, 5, 6]), d: r.pick([1, 2, 3]) }),
      build: ({ a, b, c, d }) => {
        const v = a * b * c - Math.PI * (d / 2) ** 2 * c;
        return {
          prompt: `In einen Holzquader ($${a}$ cm × $${b}$ cm × $${c}$ cm) wird senkrecht durch die Höhe von $${c}$ cm ein Loch mit $${d}$ cm Durchmesser gebohrt. Wie groß ist das Restvolumen? ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: 'cm³' },
          hints: [`Quader: $${a * b * c}$ cm³`, `Bohrung: Zylinder mit $r = ${num(d / 2)}$ cm und $h = ${c}$ cm`, 'Quader minus Bohrung.'],
          solution: { steps: [{ text: 'Bohrung:', math: `V_Z = \\pi \\cdot ${num(d / 2)}^2 \\cdot ${c} ${approx(Math.PI * (d / 2) ** 2 * c, 2)}` }, { text: 'Rest:', math: `V = ${a * b * c} - ${num(round(Math.PI * (d / 2) ** 2 * c, 2))} ${approx(v)}` }], finalAnswer: `$V ${approx(v)}$ cm³` },
          commonMistakes: [{ description: 'Durchmesser als Radius eingesetzt', feedback: 'Der Radius der Bohrung ist der halbe Durchmesser.', answers: [rounded(a * b * c - Math.PI * d * d * c)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-haus',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ l: r.pick([8, 10, 12]), b: r.pick([6, 8, 10]), hw: r.pick([3, 5, 6]), hd: r.pick([2, 3, 4]) }),
      build: ({ l, b, hw, hd }) => {
        const v = l * b * hw + ((b * hd) / 2) * l;
        return {
          prompt: `Ein Haus ist $${l}$ m lang, $${b}$ m breit und bis zum Dachansatz $${hw}$ m hoch. Das Satteldach ist $${hd}$ m hoch (dreieckiger Giebel über die Breite). Berechne den umbauten Raum (in m³).`,
          answer: { kind: 'numeric', value: v, tolerance: 0.001, unit: 'm³' },
          hints: [`Quader: $${l} \\cdot ${b} \\cdot ${hw}$`, `Dach: Prisma mit Dreieck $\\frac{${b} \\cdot ${hd}}{2}$ und Länge $${l}$`, 'Addieren.'],
          solution: { steps: [{ text: 'Quader:', math: `${l} \\cdot ${b} \\cdot ${hw} = ${l * b * hw}` }, { text: 'Dach:', math: `\\frac{${b} \\cdot ${hd}}{2} \\cdot ${l} = ${num(((b * hd) / 2) * l)}` }, { text: 'Summe:', math: `V = ${num(v)}\\,\\text{m}^3` }], finalAnswer: `$${num(v)}$ m³` },
          commonMistakes: [{ description: 'Dachdreieck nicht halbiert', feedback: 'Die Giebelfläche ist ein Dreieck: halbe Breite mal Höhe.', answers: [String(l * b * hw + b * hd * l)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-masse',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Masse berechnen'],
      params: (r) =>
        r.pick([
          { what: 'Ein Betonrohr', R: r.pick([30, 40, 50]), w: r.pick([5, 8, 10]), l: r.pick([100, 200]), rho: 2.4, mat: 'Beton' },
          { what: 'Ein Kupferrohr', R: r.pick([1, 1.5, 2]), w: r.pick([0.1, 0.2]), l: r.pick([100, 200, 300]), rho: 8.9, mat: 'Kupfer' },
          { what: 'Ein Aluminiumrohr', R: r.pick([2, 2.5, 3]), w: r.pick([0.2, 0.3, 0.5]), l: r.pick([100, 150, 200]), rho: 2.7, mat: 'Aluminium' },
        ]),
      build: ({ what, R, w, l, rho, mat }) => {
        const r0 = R - w;
        const v = Math.PI * (R * R - r0 * r0) * l;
        const kg = (v * rho) / 1000;
        return {
          prompt: `${what} ist $${l}$ cm lang, hat den Außenradius $${num(R)}$ cm und eine Wandstärke von $${num(w)}$ cm. ${mat} hat die Dichte $${num(rho)}$ g/cm³. Wie schwer ist es (in kg)? ${ROUND1}`,
          answer: { kind: 'numeric', value: kg, tolerance: piTol(kg), unit: 'kg' },
          hints: [`Innenradius: $${num(R)} - ${num(w)} = ${num(r0)}$ cm`, '$V = \\pi (R^2 - r^2) \\cdot l$', `Masse $= V \\cdot ${num(rho)}$ g, dann durch $1000$.`],
          solution: { steps: [{ text: 'Volumen:', math: `V = \\pi (${num(R)}^2 - ${num(r0)}^2) \\cdot ${l} ${approx(v)}\\,\\text{cm}^3` }, { text: 'Masse:', math: `m ${approx(v * rho, 0)}\\,\\text{g} ${approx(kg)}\\,\\text{kg}` }], finalAnswer: `$${approx(kg)}$ kg` },
          commonMistakes: [{ description: 'Nicht in kg umgerechnet', feedback: 'Gramm durch $1000$ ergibt Kilogramm.', answers: [rounded(v * rho)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-pool',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ l: r.pick([6, 8, 10]), b: r.pick([3, 4, 5]), t: r.pick([1.2, 1.4, 1.5]) }),
      build: ({ l, b, t }) => {
        const area = l * b + Math.PI * (b / 2) ** 2;
        const v = area * t;
        return {
          prompt: `Ein Pool besteht aus einem Rechteck ($${l}$ m × $${b}$ m) mit je einem Halbkreis an beiden schmalen Seiten (Durchmesser $${b}$ m). Er ist überall $${num(t)}$ m tief. Wie viele Kubikmeter Wasser passen hinein? ${ROUND1}`,
          answer: { kind: 'numeric', value: v, tolerance: piTol(v), unit: 'm³' },
          hints: [`Zwei Halbkreise ergeben einen ganzen Kreis mit $r = ${num(b / 2)}$ m.`, `Grundfläche: $${l} \\cdot ${b} + \\pi \\cdot ${num(b / 2)}^2$`, `Mal Tiefe $${num(t)}$ m.`],
          solution: { steps: [{ text: 'Grundfläche:', math: `G = ${l * b} + \\pi \\cdot ${num(b / 2)}^2 ${approx(area, 2)}\\,\\text{m}^2` }, { text: 'Volumen:', math: `V = G \\cdot ${num(t)} ${approx(v)}\\,\\text{m}^3` }], finalAnswer: `$${approx(v)}$ m³` },
          commonMistakes: [{ description: 'Halbkreise vergessen', feedback: 'Die runden Enden gehören auch zum Becken.', answers: [rounded(l * b * t)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'kz-zg-l-form',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([6, 8, 10]), b: r.pick([4, 5, 6]), h: r.pick([3, 4, 5]), cut: r.pick([2, 3]) }),
      build: ({ a, b, h, cut }) => {
        const v = a * b * h - cut * cut * h;
        return {
          prompt: `Aus einem Quader ($${a}$ cm × $${b}$ cm, Höhe $${h}$ cm) wird an einer Ecke ein Quader mit der Grundfläche $${cut}$ cm × $${cut}$ cm über die ganze Höhe herausgeschnitten. Berechne das Restvolumen (in cm³).`,
          answer: { kind: 'numeric', value: v, tolerance: 0.001, unit: 'cm³' },
          hints: [`Großer Quader: $${a * b * h}$ cm³`, `Ausschnitt: $${cut} \\cdot ${cut} \\cdot ${h} = ${cut * cut * h}$ cm³`, 'Abziehen.'],
          solution: { steps: [{ text: 'Ergänzen und abziehen:', math: `V = ${a * b * h} - ${cut * cut * h} = ${v}\\,\\text{cm}^3` }], finalAnswer: `$${v}$ cm³` },
          commonMistakes: [{ description: 'Ausschnitt addiert', feedback: 'Herausgeschnittenes Material wird abgezogen.', answers: [String(a * b * h + cut * cut * h)] }],
        };
      },
    }),
  ],
};
