import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round, txt } from '../templates';
import { fx, mc, paren, shapeOf, TOPIC_ID } from './shared';

const S = 'qf-normalparabel';
const OBJ = ['Die Normalparabel und gestreckte Parabeln kennen', 'Funktionswerte von f(x) = ax² berechnen'];

/** Streckfaktoren mit gut rechenbaren Werten. */
const FACTORS = [2, 3, -1, -2, 0.5, -0.5, 4, -3];

export const normalparabel: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 1,
  title: 'Normalparabel und Streckung',
  description: 'Der Graph von $f(x) = x^2$ und was der Faktor $a$ in $f(x) = ax^2$ bewirkt.',
  objective: 'Du kennst die Normalparabel, deutest den Faktor $a$ und berechnest Werte von $f(x) = ax^2$.',
  intro:
    'Quadriert man jede Zahl, entsteht die Normalparabel $f(x) = x^2$: ein U-förmiger Graph mit dem tiefsten Punkt im Ursprung, symmetrisch zur $y$-Achse. Ein Faktor $a$ davor streckt, staucht oder spiegelt die Parabel. So beschreibt man zum Beispiel Bremswege oder den freien Fall.',
  rules: [
    { term: 'Normalparabel', explanation: 'Scheitelpunkt $S(0\\,|\\,0)$, symmetrisch zur $y$-Achse:', math: 'f(x) = x^2' },
    { term: 'Faktor $a$', explanation: '$a > 0$: nach oben geöffnet, $a < 0$: nach unten geöffnet. $|a| > 1$: gestreckt (schmaler), $|a| < 1$: gestaucht (breiter).', math: 'f(x) = a \\cdot x^2' },
    { term: 'Faktor aus einem Punkt', explanation: 'Liegt $P(x_P\\,|\\,y_P)$ auf der Parabel, gilt:', math: 'a = \\frac{y_P}{x_P^2}' },
    { term: 'Symmetrie', explanation: '$f(-x) = f(x)$: Zu $x$ und $-x$ gehört derselbe Funktionswert.' },
  ],
  materials: [videoPlaceholder('qf-normalparabel-v1', 'Normalparabel und Streckfaktor')],
  example: {
    problem: 'Die Parabel $f(x) = a x^2$ geht durch $P(2\\,|\\,-6)$. Bestimme $a$ und beschreibe die Parabel.',
    steps: [
      { text: 'Punkt einsetzen:', math: '-6 = a \\cdot 2^2 = 4a' },
      { text: 'Nach $a$ auflösen:', math: 'a = \\frac{-6}{4} = -1{,}5' },
      { text: '$a < 0$ und $|a| > 1$: nach unten geöffnet und gestreckt.' },
    ],
    result: '$f(x) = -1{,}5x^2$, nach unten geöffnet und schmaler als die Normalparabel.',
  },
  summary: ['Normalparabel: $f(x) = x^2$, Scheitel $(0\\,|\\,0)$.', 'Vorzeichen von $a$: Öffnung nach oben oder unten.', '$|a| > 1$ gestreckt, $|a| < 1$ gestaucht.', '$a = \\frac{y}{x^2}$ aus einem Punkt.'],
  exercises: [
    {
      id: 'qf-np-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Eigenschaft hat die Normalparabel $f(x) = x^2$?',
      choices: [
        { id: 'a', label: 'Ihr Scheitelpunkt ist $(0\\,|\\,0)$ und sie ist symmetrisch zur $y$-Achse.' },
        { id: 'b', label: 'Sie ist nach unten geöffnet.' },
        { id: 'c', label: 'Sie schneidet die $x$-Achse in zwei Punkten.' },
        { id: 'd', label: 'Sie ist eine Gerade durch den Ursprung.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Berechne $f(-2)$ und $f(2)$.', 'Kann $x^2$ negativ werden?', 'Der kleinste Wert von $x^2$ ist $0$.'],
      solution: { steps: [{ text: '$x^2 \\geq 0$, der kleinste Wert $0$ wird bei $x = 0$ erreicht: Scheitel $(0\\,|\\,0)$.' }, { text: 'Wegen $(-x)^2 = x^2$ ist der Graph symmetrisch zur $y$-Achse.' }], finalAnswer: 'Scheitel $(0\\,|\\,0)$, symmetrisch zur $y$-Achse' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit einer Geraden verwechselt', feedback: '$x^2$ wächst nicht gleichmäßig: Der Graph ist gekrümmt (U-Form).', answers: ['d'] }],
    },
    {
      id: 'qf-np-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Lisa sagt: „Die Parabel $f(x) = 0{,}5x^2$ ist steiler als die Normalparabel, weil sie einen Faktor hat.“ Stimmt das?',
      choices: [
        { id: 'a', label: 'Nein, wegen $0 < a < 1$ ist sie gestaucht, also breiter.' },
        { id: 'b', label: 'Ja, jeder Faktor macht die Parabel schmaler.' },
        { id: 'c', label: 'Nein, sie ist nach unten geöffnet.' },
        { id: 'd', label: 'Ja, denn $0{,}5 > 0$.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche $f(2)$ mit $2^2$.', '$0{,}5 \\cdot 4 = 2 < 4$', 'Kleinere Werte heißt: Die Parabel steigt langsamer.'],
      solution: { steps: [{ text: '$f(2) = 0{,}5 \\cdot 4 = 2$, die Normalparabel hat dort $4$. Die Werte sind halb so groß: Die Parabel ist gestaucht und breiter.' }], finalAnswer: 'Nein, sie ist gestaucht.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Faktor immer als Streckung gedeutet', feedback: 'Nur $|a| > 1$ streckt; bei $|a| < 1$ wird die Parabel gestaucht.', answers: ['b', 'd'] }],
    },
    {
      id: 'qf-np-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Faustformel für den Bremsweg eines Autos: $s(v) = 0{,}01 \\cdot v^2$ ($v$ in km/h, $s$ in m). Wie lang ist der Bremsweg bei $80$ km/h?',
      answer: { kind: 'numeric', value: 64, tolerance: 0.001, unit: 'm' },
      hints: ['Setze $v = 80$ ein.', 'Zuerst quadrieren: $80^2 = 6400$.', '$0{,}01 \\cdot 6400$'],
      solution: { steps: [{ text: 'Einsetzen:', math: 's(80) = 0{,}01 \\cdot 80^2 = 0{,}01 \\cdot 6400 = 64' }], finalAnswer: '$64$ m' },
      objectives: [...OBJ, 'Quadratische Zusammenhänge im Alltag'],
      commonMistakes: [{ description: 'Nicht quadriert', feedback: 'Erst $v^2$ berechnen, dann mit $0{,}01$ multiplizieren.', answers: ['0,8'] }],
    },
    {
      id: 'qf-np-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Wie verändert sich der Bremsweg $s(v) = 0{,}01 v^2$, wenn sich die Geschwindigkeit verdoppelt?',
      choices: [
        { id: 'a', label: 'Er wird viermal so lang.' },
        { id: 'b', label: 'Er wird doppelt so lang.' },
        { id: 'c', label: 'Er wird um $0{,}02$ m länger.' },
        { id: 'd', label: 'Er bleibt gleich.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche $s(50)$ und $s(100)$.', '$(2v)^2 = 4v^2$', 'Der Faktor $2$ wird mit quadriert.'],
      solution: { steps: [{ text: '$s(2v) = 0{,}01 \\cdot (2v)^2 = 0{,}01 \\cdot 4v^2 = 4 \\cdot s(v)$.' }], finalAnswer: 'viermal so lang' },
      objectives: [...OBJ, 'Quadratische Zusammenhänge im Alltag'],
      commonMistakes: [{ description: 'Linear gedacht', feedback: 'Beim Quadrieren wird auch der Faktor $2$ quadriert: $2^2 = 4$.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'qf-np-wert',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick(FACTORS), x: r.int(1, 5) * r.sign() }),
      build: ({ a, x }) => ({
        prompt: `Berechne $f(${num(x)})$ für $${fx(`${a === 1 ? '' : a === -1 ? '-' : num(a)}x^2`)}$.`,
        answer: { kind: 'numeric', value: round(a * x * x, 4), tolerance: 0.001 },
        hints: [`Setze $${num(x)}$ für $x$ ein.`, `Zuerst quadrieren: $${paren(x)}^2 = ${num(x * x)}$.`, `Dann mit $${num(a)}$ multiplizieren.`],
        solution: { steps: [{ text: 'Einsetzen, erst quadrieren, dann multiplizieren:', math: `f(${num(x)}) = ${num(a)} \\cdot ${paren(x)}^2 = ${num(a)} \\cdot ${num(x * x)} = ${num(a * x * x)}` }], finalAnswer: `$${num(a * x * x)}$` },
        commonMistakes: [
          { description: 'Erst multipliziert, dann quadriert', feedback: 'Potenz vor Punktrechnung: Nur $x$ wird quadriert, nicht $a \\cdot x$.', answers: [txt((a * x) ** 2)] },
          { description: 'Vorzeichen beim Quadrieren', feedback: 'Das Quadrat einer negativen Zahl ist positiv: $(-3)^2 = 9$.', answers: x < 0 ? [txt(-a * x * x)] : [] },
        ],
      }),
    }),
    ...fromTemplate({
      id: 'qf-np-form',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([2, 3, 4, 1.5, 0.5, 0.25, 0.2, -2, -3, -0.5, -0.25, -1.5, -4]) }),
      build: ({ a }, rng) => {
        const all = [1, -1].flatMap((sgn) => [3, 0.5].map((m) => shapeOf(sgn * m)));
        const correct = shapeOf(a);
        const { choices, answer, idOf } = mc(rng, correct, all.filter((l) => l !== correct));
        const flipped = idOf(shapeOf(-a));
        return {
          prompt: `Wie verläuft die Parabel $f(x) = ${num(a)}x^2$ im Vergleich zur Normalparabel?`,
          choices,
          answer,
          hints: ['Das Vorzeichen von $a$ bestimmt die Öffnung.', 'Ist $|a|$ größer oder kleiner als $1$?', '$|a| > 1$: schmaler, $|a| < 1$: breiter.'],
          solution: { steps: [{ text: `$a = ${num(a)}$: ${a > 0 ? 'positiv, also nach oben' : 'negativ, also nach unten'} geöffnet; $|a| ${Math.abs(a) > 1 ? '> 1' : '< 1'}$, also ${Math.abs(a) > 1 ? 'gestreckt' : 'gestaucht'}.` }], finalAnswer: correct },
          commonMistakes: [{ description: 'Vorzeichen übersehen', feedback: 'Ein negatives $a$ spiegelt die Parabel an der $x$-Achse: Sie ist nach unten geöffnet.', answers: flipped ? [flipped] : [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-np-flaeche',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      objectives: [...OBJ, 'Quadratische Zusammenhänge im Alltag'],
      params: (r) => ({ s: r.pick([1.5, 2.5, 3, 4, 4.5, 6, 7, 8, 9, 12]), what: r.pick(['ein quadratisches Beet', 'eine quadratische Terrasse', 'ein quadratischer Teppich']) }),
      build: ({ s, what }) => ({
        prompt: `Der Flächeninhalt eines Quadrats ist $A(s) = s^2$. Wie groß ist ${what} mit der Seitenlänge $${num(s)}$ m (in m²)?`,
        answer: { kind: 'numeric', value: round(s * s, 4), tolerance: 0.001, unit: 'm²' },
        hints: ['Setze die Seitenlänge für $s$ ein.', 'Quadrieren heißt: mit sich selbst malnehmen.', `$${num(s)} \\cdot ${num(s)}$`],
        solution: { steps: [{ text: 'Einsetzen:', math: `A(${num(s)}) = ${num(s)}^2 = ${num(s * s)}` }], finalAnswer: `$${num(s * s)}$ m²` },
        commonMistakes: [{ description: 'Verdoppelt statt quadriert', feedback: '$s^2 = s \\cdot s$, nicht $2 \\cdot s$.', answers: [txt(2 * s)] }],
      }),
    }),
    ...fromTemplate({
      id: 'qf-np-faktor',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Den Streckfaktor aus einem Punkt bestimmen'],
      params: (r) => ({ a: r.pick([2, 3, -1, -2, 0.5, -0.5, 1.5, -3, 0.25]), x: r.int(1, 4) * r.sign() }),
      build: ({ a, x }) => {
        const y = round(a * x * x, 4);
        return {
          prompt: `Die Parabel $f(x) = a x^2$ geht durch den Punkt $P(${num(x)}\\,|\\,${num(y)})$. Bestimme $a$.`,
          answer: { kind: 'numeric', value: a, tolerance: 0.001 },
          hints: ['Setze die Koordinaten von $P$ ein.', `$${num(y)} = a \\cdot ${paren(x)}^2$`, `Teile durch $${num(x * x)}$.`],
          solution: { steps: [{ text: 'Einsetzen:', math: `${num(y)} = a \\cdot ${paren(x)}^2 = ${num(x * x)}a` }, { text: 'Auflösen:', math: `a = \\frac{${num(y)}}{${num(x * x)}} = ${num(a)}` }], finalAnswer: `$a = ${num(a)}$` },
          commonMistakes: [{ description: 'Durch x statt durch x² geteilt', feedback: 'In $f(x) = ax^2$ steht $x^2$: Teile durch $x_P^2$.', answers: [txt(y / x)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-np-probe',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Punktprobe durchführen'],
      params: (r) => {
        const a = r.pick([2, 3, -1, -2, 0.5, -0.5]);
        const x = r.int(1, 4) * r.sign();
        const on = r.int(0, 1) === 1;
        const y = round(on ? a * x * x : r.pick([-a * x * x, a * x * x + r.pick([1, -1, 2]), a * x]), 4);
        return { a, x, y: y === round(a * x * x, 4) && !on ? y + 1 : y };
      },
      build: ({ a, x, y }, rng) => {
        const on = Math.abs(a * x * x - y) < 1e-9;
        const yes = 'Ja, der Punkt liegt auf der Parabel.';
        const no = 'Nein, der Punkt liegt nicht auf der Parabel.';
        const { choices, answer, idOf } = mc(rng, on ? yes : no, [on ? no : yes]);
        return {
          prompt: `Liegt der Punkt $P(${num(x)}\\,|\\,${num(y)})$ auf der Parabel $f(x) = ${num(a)}x^2$?`,
          choices,
          answer,
          hints: [`Berechne $f(${num(x)})$.`, `$f(${num(x)}) = ${num(a)} \\cdot ${paren(x)}^2$`, `Vergleiche mit der $y$-Koordinate $${num(y)}$.`],
          solution: { steps: [{ text: 'Punktprobe:', math: `f(${num(x)}) = ${num(a)} \\cdot ${num(x * x)} = ${num(a * x * x)}` }, { text: on ? `Das ist die $y$-Koordinate von $P$: Der Punkt liegt auf der Parabel.` : `$${num(a * x * x)} \\neq ${num(y)}$: Der Punkt liegt nicht auf der Parabel.` }], finalAnswer: on ? 'Ja' : 'Nein' },
          commonMistakes: [{ description: 'Punktprobe falsch gedeutet', feedback: 'Ein Punkt liegt genau dann auf dem Graphen, wenn $f(x_P) = y_P$ ist.', answers: [idOf(on ? no : yes)!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-np-bremsweg',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Quadratische Zusammenhänge im Alltag'],
      params: (r) => ({ v: r.pick([30, 40, 50, 60, 70, 90, 100, 110, 120, 130]), wet: r.int(0, 1) === 1 }),
      build: ({ v, wet }) => {
        const k = wet ? 0.015 : 0.01;
        return {
          prompt: `Für den Bremsweg gilt ${wet ? 'auf nasser Straße' : 'als Faustformel'} $s(v) = ${num(k, 3)} \\cdot v^2$ ($v$ in km/h, $s$ in m). Berechne den Bremsweg bei $${v}$ km/h.`,
          answer: { kind: 'numeric', value: round(k * v * v, 4), tolerance: 0.01, unit: 'm' },
          hints: [`Setze $v = ${v}$ ein.`, `$${v}^2 = ${v * v}$`, `$${num(k, 3)} \\cdot ${v * v}$`],
          solution: { steps: [{ text: 'Einsetzen:', math: `s(${v}) = ${num(k, 3)} \\cdot ${v}^2 = ${num(k, 3)} \\cdot ${v * v} = ${num(k * v * v)}` }], finalAnswer: `$${num(k * v * v)}$ m` },
          commonMistakes: [{ description: 'Nicht quadriert', feedback: 'Erst $v^2$ berechnen, dann multiplizieren.', answers: [txt(k * v)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-np-gesucht',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Stellen zu einem Funktionswert bestimmen'],
      params: (r) => ({ a: r.pick([2, 3, -2, 0.5, -0.5, 4, -1]), k: r.int(1, 6) }),
      build: ({ a, k }) => {
        const y = round(a * k * k, 4);
        return {
          prompt: `Für welche $x$ gilt $f(x) = ${num(y)}$, wenn $f(x) = ${num(a)}x^2$ ist? Gib alle Lösungen an.`,
          answer: { kind: 'numeric-set', values: [k, -k], tolerance: 0.001 },
          hints: [`Setze an: $${num(a)}x^2 = ${num(y)}$.`, `Teile durch $${num(a)}$: $x^2 = ${k * k}$.`, 'Beim Wurzelziehen gibt es zwei Lösungen.'],
          solution: { steps: [{ text: 'Gleichung aufstellen und durch $a$ teilen:', math: `${num(a)}x^2 = ${num(y)} \\;\\Rightarrow\\; x^2 = ${k * k}` }, { text: 'Wurzel ziehen (Symmetrie!):', math: `x = ${k} \\;\\text{oder}\\; x = -${k}` }], finalAnswer: `$x = ${k}$ oder $x = -${k}$` },
          commonMistakes: [{ description: 'Negative Lösung vergessen', feedback: 'Die Parabel ist symmetrisch: Zu $x$ gehört auch $-x$ derselbe Wert.', answers: [String(k)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-np-fall',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Quadratische Zusammenhänge im Alltag'],
      params: (r) => ({ t: r.pick([1, 1.5, 2, 2.5, 3, 3.5, 4, 5]), what: r.pick(['ein Stein', 'ein Apfel', 'ein Schlüssel']) }),
      build: ({ t, what }) => {
        const s = round(5 * t * t, 4);
        return {
          prompt: `Für den freien Fall gilt näherungsweise $s(t) = 5t^2$ ($t$ in s, $s$ in m). Wie viele Sekunden braucht ${what}, um $${num(s)}$ m tief zu fallen?`,
          answer: { kind: 'numeric', value: t, tolerance: 0.01, unit: 's' },
          hints: [`Setze an: $5t^2 = ${num(s)}$.`, `Teile durch $5$: $t^2 = ${num(t * t)}$.`, 'Die Zeit ist positiv: nur die positive Wurzel.'],
          solution: { steps: [{ text: 'Gleichung aufstellen:', math: `5t^2 = ${num(s)} \\;\\Rightarrow\\; t^2 = ${num(t * t)}` }, { text: 'Positive Wurzel (Zeit):', math: `t = \\sqrt{${num(t * t)}} = ${num(t)}` }], finalAnswer: `$${num(t)}$ s` },
          commonMistakes: [{ description: 'Wurzel vergessen', feedback: '$t^2 = \\ldots$ heißt: Am Ende noch die Wurzel ziehen.', answers: [txt(t * t)] }],
        };
      },
    }),
  ],
};
