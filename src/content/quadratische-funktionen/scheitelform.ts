import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round, txt } from '../templates';
import { fx, mc, paren, pt, ptInput, vertexTerm, TOPIC_ID } from './shared';

const S = 'qf-scheitelform';
const OBJ = ['Die Scheitelpunktform deuten', 'Parabeln verschieben'];

/** „um 2 nach rechts und um 3 nach unten“ */
function shiftText(d: number, e: number): string {
  const h = d === 0 ? '' : `um $${num(Math.abs(d))}$ nach ${d > 0 ? 'rechts' : 'links'}`;
  const v = e === 0 ? '' : `um $${num(Math.abs(e))}$ nach ${e > 0 ? 'oben' : 'unten'}`;
  return [h, v].filter(Boolean).join(' und ');
}

export const scheitelform: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 2,
  title: 'Scheitelpunktform',
  description: 'Parabeln verschieben und den Scheitelpunkt aus $f(x) = a(x - d)^2 + e$ ablesen.',
  objective: 'Du liest den Scheitelpunkt aus der Scheitelpunktform ab, beschreibst Verschiebungen und stellst Gleichungen auf.',
  intro:
    'Verschiebt man eine Parabel, wandert ihr Scheitelpunkt mit. In der Scheitelpunktform $f(x) = a(x - d)^2 + e$ steht er direkt drin: $S(d\\,|\\,e)$. Achtung beim Vorzeichen in der Klammer – $(x - 2)^2$ verschiebt nach rechts, $(x + 2)^2$ nach links. Mit der Scheitelpunktform beschreibt man zum Beispiel Flugbahnen und Brückenbögen.',
  rules: [
    { term: 'Scheitelpunktform', explanation: 'Scheitelpunkt $S(d\\,|\\,e)$, Streckfaktor $a$:', math: 'f(x) = a(x - d)^2 + e' },
    { term: 'Verschiebung', explanation: '$d > 0$: nach rechts, $d < 0$: nach links; $e > 0$: nach oben, $e < 0$: nach unten.' },
    { term: 'Vorzeichen in der Klammer', explanation: '$(x + 3)^2 = (x - (-3))^2$, also $d = -3$.', math: '(x + 3)^2 \\;\\Rightarrow\\; d = -3' },
    { term: 'Kleinster bzw. größter Wert', explanation: '$a > 0$: kleinster Funktionswert $e$; $a < 0$: größter Funktionswert $e$.' },
  ],
  materials: [videoPlaceholder('qf-scheitelform-v1', 'Scheitelpunktform und Verschiebung')],
  example: {
    problem: 'Gib den Scheitelpunkt von $f(x) = -2(x + 1)^2 + 4$ an und beschreibe die Parabel.',
    steps: [
      { text: 'Klammer umschreiben:', math: '(x + 1)^2 = (x - (-1))^2 \\;\\Rightarrow\\; d = -1' },
      { text: 'Der Summand hinten ist $e = 4$.', math: 'S(-1\\,|\\,4)' },
      { text: '$a = -2$: nach unten geöffnet und gestreckt. Der größte Funktionswert ist $4$.' },
    ],
    result: '$S(-1\\,|\\,4)$, nach unten geöffnet, gestreckt.',
  },
  summary: ['$f(x) = a(x - d)^2 + e$ hat den Scheitelpunkt $S(d\\,|\\,e)$.', 'Vorzeichen in der Klammer umdrehen: $(x + 3)^2 \\Rightarrow d = -3$.', '$e$ verschiebt nach oben bzw. unten.'],
  exercises: [
    {
      id: 'qf-sf-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welchen Scheitelpunkt hat $f(x) = (x + 3)^2 - 2$?',
      choices: [
        { id: 'a', label: '$S(-3\\,|\\,-2)$' },
        { id: 'b', label: '$S(3\\,|\\,-2)$' },
        { id: 'c', label: '$S(-2\\,|\\,-3)$' },
        { id: 'd', label: '$S(3\\,|\\,2)$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche mit $a(x - d)^2 + e$.', '$(x + 3) = (x - (-3))$', 'Der Summand hinten ist $e$.'],
      solution: { steps: [{ text: '$(x + 3)^2 = (x - (-3))^2$, also $d = -3$; $e = -2$.' }], finalAnswer: '$S(-3\\,|\\,-2)$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Vorzeichen in der Klammer übernommen', feedback: 'In der Klammer steht $x - d$: Aus $x + 3$ wird $d = -3$.', answers: ['b'] }],
    },
    {
      id: 'qf-sf-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Wie entsteht die Parabel $f(x) = (x - 2)^2 + 1$ aus der Normalparabel?',
      choices: [
        { id: 'a', label: 'Verschiebung um $2$ nach rechts und um $1$ nach oben' },
        { id: 'b', label: 'Verschiebung um $2$ nach links und um $1$ nach oben' },
        { id: 'c', label: 'Verschiebung um $1$ nach rechts und um $2$ nach oben' },
        { id: 'd', label: 'Streckung mit dem Faktor $2$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Wo liegt der Scheitelpunkt?', '$S(2\\,|\\,1)$', 'Vom Ursprung zu $S$: wie weit nach rechts, wie weit nach oben?'],
      solution: { steps: [{ text: 'Scheitelpunkt $S(2\\,|\\,1)$: Der Scheitel der Normalparabel wandert von $(0\\,|\\,0)$ um $2$ nach rechts und $1$ nach oben.' }], finalAnswer: '$2$ nach rechts, $1$ nach oben' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Richtung vertauscht', feedback: '$(x - 2)^2$ ist bei $x = 2$ null: Der Scheitel liegt rechts vom Ursprung.', answers: ['b'] }],
    },
    {
      id: 'qf-sf-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Wie viele Nullstellen hat $f(x) = 2(x - 1)^2 + 3$?',
      choices: [
        { id: 'a', label: 'keine' },
        { id: 'b', label: 'genau eine' },
        { id: 'c', label: 'zwei' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Wo liegt der Scheitelpunkt?', 'In welche Richtung ist die Parabel geöffnet?', 'Scheitel oberhalb der $x$-Achse und nach oben geöffnet …'],
      solution: { steps: [{ text: '$S(1\\,|\\,3)$ liegt oberhalb der $x$-Achse, und wegen $a = 2 > 0$ ist die Parabel nach oben geöffnet. Sie erreicht die $x$-Achse nie.' }], finalAnswer: 'keine' },
      objectives: [...OBJ, 'Anzahl der Nullstellen am Scheitelpunkt erkennen'],
      commonMistakes: [{ description: 'Jede Parabel hat zwei Nullstellen gedacht', feedback: 'Liegt der Scheitel oberhalb der $x$-Achse und ist die Parabel nach oben geöffnet, gibt es keine Nullstelle.', answers: ['c'] }],
    },
    {
      id: 'qf-sf-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Ein Wasserstrahl folgt der Kurve $h(x) = -0{,}5(x - 3)^2 + 4{,}5$ ($x$, $h$ in m). Wie hoch steigt der Strahl höchstens?',
      answer: { kind: 'numeric', value: 4.5, tolerance: 0.001, unit: 'm' },
      hints: ['Der höchste Punkt ist der Scheitelpunkt.', 'Lies $S(d\\,|\\,e)$ ab.', 'Gefragt ist die Höhe, also $e$.'],
      solution: { steps: [{ text: 'Scheitelpunkt $S(3\\,|\\,4{,}5)$; wegen $a < 0$ ist das der höchste Punkt.' }], finalAnswer: '$4{,}5$ m' },
      objectives: [...OBJ, 'Scheitelpunkt im Sachzusammenhang deuten'],
      commonMistakes: [{ description: 'x-Koordinate genommen', feedback: '$3$ m ist die Entfernung, in der der Strahl am höchsten ist – gefragt ist die Höhe.', answers: ['3'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'qf-sf-ablesen',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ a: r.pick([1, 1, 2, -1, -2, 0.5, 3]), d: r.int(1, 6) * r.sign(), e: r.int(-6, 6) }),
      build: ({ a, d, e }) => ({
        prompt: `Gib den Scheitelpunkt der Parabel $${fx(vertexTerm(a, d, e))}$ an.`,
        answer: { kind: 'point', x: d, y: e, tolerance: 0.001 },
        hints: ['Vergleiche mit $a(x - d)^2 + e$.', d < 0 ? `$(x + ${num(-d)}) = (x - (${num(d)}))$` : `In der Klammer steht $x - ${num(d)}$.`, `Eingabe z. B. als $(${num(d)}|${num(e)})$.`],
        solution: { steps: [{ text: `Aus der Klammer: $d = ${num(d)}$, der Summand hinten: $e = ${num(e)}$.` }], finalAnswer: `$${pt(d, e)}$` },
        commonMistakes: [
          { description: 'Vorzeichen in der Klammer übernommen', feedback: 'In der Form $(x - d)$ dreht sich das Vorzeichen: $(x + 2)^2 \\Rightarrow d = -2$.', answers: [ptInput(-d, e)] },
          { description: 'Koordinaten vertauscht', feedback: 'Zuerst die $x$-Koordinate $d$, dann die $y$-Koordinate $e$.', answers: d === e ? [] : [ptInput(e, d)] },
        ],
      }),
    }),
    ...fromTemplate({
      id: 'qf-sf-verschieben',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ d: r.int(1, 5) * r.sign(), e: r.int(1, 5) * r.sign() }),
      build: ({ d, e }, rng) => {
        const label = (dd: number, ee: number) => `Um $${Math.abs(dd)}$ nach ${dd > 0 ? 'rechts' : 'links'} und um $${Math.abs(ee)}$ nach ${ee > 0 ? 'oben' : 'unten'}`;
        const correct = label(d, e);
        const { choices, answer, idOf } = mc(rng, correct, [label(-d, e), label(d, -e), label(e, d)]);
        return {
          prompt: `Wie muss man die Normalparabel verschieben, um den Graphen von $f(x) = ${vertexTerm(1, d, e)}$ zu erhalten?`,
          choices,
          answer,
          hints: ['Bestimme zuerst den Scheitelpunkt.', `$S(${num(d)}\\,|\\,${num(e)})$`, 'Der Scheitel der Normalparabel liegt im Ursprung.'],
          solution: { steps: [{ text: `Scheitelpunkt $${pt(d, e)}$: vom Ursprung ${shiftText(d, e)}.` }], finalAnswer: correct },
          commonMistakes: [{ description: 'Links und rechts vertauscht', feedback: `$${vertexTerm(1, d, 0)}$ ist bei $x = ${num(d)}$ null – dort liegt der Scheitel.`, answers: [idOf(label(-d, e))!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-sf-aufstellen',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Funktionsgleichungen in Scheitelpunktform aufstellen'],
      params: (r) => ({ a: r.pick([1, -1, 2, -2, 0.5]), d: r.int(1, 5) * r.sign(), e: r.int(1, 6) * r.sign() }),
      build: ({ a, d, e }, rng) => {
        const correct = `$f(x) = ${vertexTerm(a, d, e)}$`;
        const { choices, answer, idOf } = mc(rng, correct, [`$f(x) = ${vertexTerm(a, -d, e)}$`, `$f(x) = ${vertexTerm(a, e, d)}$`, `$f(x) = ${vertexTerm(-a, d, e)}$`]);
        return {
          prompt: `Eine Parabel hat den Scheitelpunkt $${pt(d, e)}$ und ist ${a > 0 ? 'nach oben' : 'nach unten'} geöffnet mit dem Streckfaktor $a = ${num(a)}$. Welche Gleichung gehört zu ihr?`,
          choices,
          answer,
          hints: ['Setze in $f(x) = a(x - d)^2 + e$ ein.', `$d = ${num(d)}$, $e = ${num(e)}$`, `$x - (${num(d)})$ vereinfachen.`],
          solution: { steps: [{ text: 'Einsetzen in die Scheitelpunktform:', math: `f(x) = ${num(a)}(x - ${paren(d)})^2 ${e < 0 ? '-' : '+'} ${num(Math.abs(e))} = ${vertexTerm(a, d, e)}` }], finalAnswer: correct },
          commonMistakes: [{ description: 'Vorzeichen in der Klammer', feedback: 'In der Klammer steht $x - d$: Für $d = -2$ wird daraus $x + 2$.', answers: [idOf(`$f(x) = ${vertexTerm(a, -d, e)}$`)!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-sf-wert',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Funktionswerte berechnen'],
      params: (r) => ({ a: r.pick([1, -1, 2, -2, 0.5]), d: r.int(1, 4) * r.sign(), e: r.int(-5, 5), x: r.int(-4, 4) }),
      build: ({ a, d, e, x }) => {
        const v = round(a * (x - d) ** 2 + e, 4);
        return {
          prompt: `Berechne $f(${num(x)})$ für $${fx(vertexTerm(a, d, e))}$.`,
          answer: { kind: 'numeric', value: v, tolerance: 0.001 },
          hints: [`Setze $${num(x)}$ für $x$ ein.`, `Zuerst die Klammer: $${paren(x)} - ${paren(d)} = ${num(x - d)}$.`, 'Dann quadrieren, mit $a$ multiplizieren und $e$ addieren.'],
          solution: { steps: [{ text: 'Einsetzen, Klammer zuerst:', math: `f(${num(x)}) = ${num(a)} \\cdot (${num(x - d)})^2 ${e < 0 ? '-' : '+'} ${num(Math.abs(e))} = ${num(a)} \\cdot ${num((x - d) ** 2)} ${e < 0 ? '-' : '+'} ${num(Math.abs(e))} = ${num(v)}` }], finalAnswer: `$${num(v)}$` },
          commonMistakes: [{ description: 'Vorzeichen in der Klammer falsch', feedback: 'In die Klammer $(x - d)$ einsetzen und das Vorzeichen von $d$ beachten.', answers: [txt(a * (x + d) ** 2 + e)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-sf-extremwert',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Kleinsten bzw. größten Funktionswert bestimmen'],
      params: (r) => ({ a: r.pick([1, -1, 2, -2, 0.5, -0.5, 3]), d: r.int(1, 5) * r.sign(), e: r.int(1, 9) * r.sign() }),
      build: ({ a, d, e }) => ({
        prompt: `Welchen ${a > 0 ? 'kleinsten' : 'größten'} Wert nimmt die Funktion $${fx(vertexTerm(a, d, e))}$ an?`,
        answer: { kind: 'numeric', value: e, tolerance: 0.001 },
        hints: ['Der Scheitelpunkt ist der tiefste bzw. höchste Punkt.', `$S(${num(d)}\\,|\\,${num(e)})$`, 'Gefragt ist der Funktionswert, also die $y$-Koordinate.'],
        solution: { steps: [{ text: `$a = ${num(a)}$ ${a > 0 ? '> 0: Der Scheitel ist der tiefste Punkt' : '< 0: Der Scheitel ist der höchste Punkt'}. $S(${num(d)}\\,|\\,${num(e)})$, also ist $${num(e)}$ der ${a > 0 ? 'kleinste' : 'größte'} Wert.` }], finalAnswer: `$${num(e)}$` },
        commonMistakes: [{ description: 'x-Koordinate angegeben', feedback: `Bei $x = ${num(d)}$ wird der Wert angenommen – der Wert selbst ist die $y$-Koordinate.`, answers: d === e ? [] : [String(d)] }],
      }),
    }),
    ...fromTemplate({
      id: 'qf-sf-nullstellen',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Nullstellen aus der Scheitelpunktform berechnen'],
      params: (r) => ({ a: r.pick([1, 1, 2, -1, 0.5]), d: r.int(-4, 4), k: r.int(1, 5) }),
      build: ({ a, d, k }) => {
        const e = round(-a * k * k, 4);
        return {
          prompt: `Berechne die Nullstellen von $${fx(vertexTerm(a, d, e))}$.`,
          answer: { kind: 'numeric-set', values: [d - k, d + k], tolerance: 0.001 },
          hints: ['Setze $f(x) = 0$.', `Bringe $${num(e)}$ auf die andere Seite und teile durch $${num(a)}$.`, 'Wurzel ziehen: Es gibt zwei Lösungen.'],
          solution: {
            steps: [
              { text: 'Null setzen und umstellen:', math: `${vertexTerm(a, d, 0)} = ${num(-e)} \\;\\Rightarrow\\; ${vertexTerm(1, d, 0)} = ${k * k}` },
              { text: 'Wurzel ziehen:', math: `${d === 0 ? 'x' : `x ${d > 0 ? '-' : '+'} ${num(Math.abs(d))}`} = \\pm ${k}` },
              { text: 'Lösungen:', math: `x_1 = ${num(d - k)},\\; x_2 = ${num(d + k)}` },
            ],
            finalAnswer: `$x_1 = ${num(d - k)}$, $x_2 = ${num(d + k)}$`,
          },
          commonMistakes: [{ description: 'Nur eine Lösung', feedback: 'Beim Wurzelziehen gibt es $+$ und $-$: zwei Nullstellen, symmetrisch zum Scheitel.', answers: [String(d + k)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-sf-wurf',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Scheitelpunkt im Sachzusammenhang deuten'],
      params: (r) => ({ a: r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), d: r.int(3, 12), e: r.int(3, 15), ask: r.pick(['hoehe', 'weite'] as const), what: r.pick(['Ein Ball', 'Ein Fußball', 'Ein Wasserstrahl', 'Ein Basketball']) }),
      build: ({ a, d, e, ask, what }) => ({
        prompt: `${what} folgt der Bahn $h(x) = ${vertexTerm(-a, d, e)}$ ($x$: waagerechte Entfernung, $h$: Höhe, beides in m). ${ask === 'hoehe' ? 'Welche größte Höhe wird erreicht?' : 'In welcher waagerechten Entfernung ist die Bahn am höchsten?'}`,
        answer: { kind: 'numeric', value: ask === 'hoehe' ? e : d, tolerance: 0.001, unit: 'm' },
        hints: ['Der höchste Punkt der Bahn ist der Scheitelpunkt.', `$S(${num(d)}\\,|\\,${num(e)})$`, ask === 'hoehe' ? 'Die Höhe ist die $y$-Koordinate.' : 'Die Entfernung ist die $x$-Koordinate.'],
        solution: { steps: [{ text: `Scheitelpunkt $${pt(d, e)}$; wegen $a < 0$ ist er der höchste Punkt.` }, { text: ask === 'hoehe' ? `Größte Höhe: $${num(e)}$ m.` : `Am höchsten bei $x = ${num(d)}$ m.` }], finalAnswer: `$${num(ask === 'hoehe' ? e : d)}$ m` },
        commonMistakes: [{ description: 'Koordinaten verwechselt', feedback: 'Die $x$-Koordinate des Scheitels ist die Entfernung, die $y$-Koordinate die Höhe.', answers: d === e ? [] : [String(ask === 'hoehe' ? d : e)] }],
      }),
    }),
    ...fromTemplate({
      id: 'qf-sf-bogen',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Parabeln im Sachzusammenhang'],
      params: (r) => ({ a: r.pick([0.25, 0.5, 1, 0.125, 2]), w: r.pick([2, 3, 4, 5, 6]), what: r.pick(['Torbogen', 'Brückenbogen', 'Tunneleingang']) }),
      build: ({ a, w, what }) => {
        const h = round(a * w * w, 4);
        return {
          prompt: `Ein ${what} hat die Form $h(x) = ${vertexTerm(-a, 0, h)}$ ($x$ und $h$ in m, der Boden liegt bei $h = 0$). Wie breit ist der ${what} am Boden?`,
          answer: { kind: 'numeric', value: 2 * w, tolerance: 0.01, unit: 'm' },
          hints: ['Am Boden ist $h(x) = 0$.', `$${num(a)}x^2 = ${num(h)}$ ⇒ $x = \\pm ${w}$`, 'Die Breite ist der Abstand der beiden Nullstellen.'],
          solution: { steps: [{ text: 'Nullstellen:', math: `${vertexTerm(-a, 0, h)} = 0 \\;\\Rightarrow\\; x^2 = ${w * w} \\;\\Rightarrow\\; x = \\pm ${w}` }, { text: 'Breite:', math: `${w} - (-${w}) = ${2 * w}` }], finalAnswer: `$${2 * w}$ m` },
          commonMistakes: [{ description: 'Nur halbe Breite', feedback: 'Die Nullstellen liegen bei $-x$ und $+x$: Die Breite ist doppelt so groß.', answers: [String(w)] }],
        };
      },
    }),
  ],
};
