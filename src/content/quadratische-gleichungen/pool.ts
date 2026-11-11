/** Aufgabenpool Quadratische Gleichungen: Vorlagen je Kapitel (die handgeschriebenen Aufgaben stehen in basis.ts). */
import type { AuthoredExercise } from '../../types';
import { fromTemplate, linearTerm, num, round, shuffledChoices, txt } from '../templates';

const OBJ = ['Quadratische Gleichungen lösen'];
const SET_HINT = 'Gib alle Lösungen an.';
const COUNT = [
  { id: 'a', label: 'keine Lösung' },
  { id: 'b', label: 'genau eine Lösung' },
  { id: 'c', label: 'zwei Lösungen' },
];

/** Quadratischer Term x² + px + q als KaTeX. */
const quadTerm = (a: number, p: number, q: number) => {
  const head = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${num(a)}x^2`;
  const mid = p === 0 ? '' : p > 0 ? ` + ${p === 1 ? '' : num(p)}x` : ` - ${p === -1 ? '' : num(-p)}x`;
  const end = q === 0 ? '' : q > 0 ? ` + ${num(q)}` : ` - ${num(-q)}`;
  return `${head}${mid}${end}`;
};
const setText = (values: number[]) => `$L = \\{${[...values].sort((a, b) => a - b).map((v) => num(v)).join(';\\, ')}\\}$`;
const setInput = (values: number[]) => values.map((v) => txt(v)).join('; ');

const reinquadratisch: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'quad-rq-x2',
    subtopicId: 'quad-reinquadratisch',
    count: 12,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 1,
    objectives: OBJ,
    params: (r) => ({ k: r.int(2, 15) }),
    build: ({ k }) => ({
      prompt: `Löse $x^2 = ${k * k}$. ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [k, -k], tolerance: 0.001 },
      hints: ['Ziehe auf beiden Seiten die Wurzel.', 'Es gibt eine positive und eine negative Lösung.', `$\\sqrt{${k * k}} = ${k}$`],
      solution: { steps: [{ text: 'Wurzel ziehen:', math: `x = \\pm\\sqrt{${k * k}} = \\pm ${k}` }], finalAnswer: setText([k, -k]) },
      commonMistakes: [{ description: 'Negative Lösung vergessen', feedback: `Auch $(-${k})^2 = ${k * k}$ – es gibt zwei Lösungen.`, answers: [String(k)] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-rq-ax2',
    subtopicId: 'quad-reinquadratisch',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 2,
    objectives: OBJ,
    params: (r) => ({ a: r.int(2, 5), k: r.int(2, 9) }),
    build: ({ a, k }) => ({
      prompt: `Löse $${a}x^2 - ${a * k * k} = 0$. ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [k, -k], tolerance: 0.001 },
      hints: [`Bringe $${a * k * k}$ auf die rechte Seite.`, `Teile durch $${a}$.`, 'Dann die Wurzel ziehen.'],
      solution: { steps: [{ text: 'Umformen:', math: `${a}x^2 = ${a * k * k} \\;\\Rightarrow\\; x^2 = ${k * k}` }, { text: 'Wurzel:', math: `x = \\pm ${k}` }], finalAnswer: setText([k, -k]) },
      commonMistakes: [{ description: 'Nicht durch a geteilt', feedback: `Erst durch $${a}$ teilen, dann die Wurzel ziehen.`, answers: [setInput([round(Math.sqrt(a * k * k), 2), -round(Math.sqrt(a * k * k), 2)])] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-rq-klammer',
    subtopicId: 'quad-reinquadratisch',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 2,
    objectives: OBJ,
    params: (r) => ({ d: r.int(1, 8) * r.sign(), e: r.int(1, 7) }),
    build: ({ d, e }) => {
      const sol = [d + e, d - e];
      return {
        prompt: `Löse $(x ${d < 0 ? '+' : '-'} ${Math.abs(d)})^2 = ${e * e}$. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: sol, tolerance: 0.001 },
        hints: ['Ziehe die Wurzel – die Klammer bleibt zunächst stehen.', `$x ${d < 0 ? '+' : '-'} ${Math.abs(d)} = \\pm ${e}$`, 'Löse beide Fälle einzeln.'],
        solution: {
          steps: [
            { text: 'Wurzel ziehen:', math: `x ${d < 0 ? '+' : '-'} ${Math.abs(d)} = \\pm ${e}` },
            { text: 'Zwei Fälle:', math: `x = ${num(d)} + ${e} = ${d + e} \\quad\\text{oder}\\quad x = ${num(d)} - ${e} = ${d - e}` },
          ],
          finalAnswer: setText(sol),
        },
        commonMistakes: [{ description: 'Nur einen Fall gelöst', feedback: 'Aus $(\\ldots)^2 = ' + e * e + '$ folgen zwei Fälle: $+' + e + '$ und $-' + e + '$.', answers: [String(d + e)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-rq-anzahl',
    subtopicId: 'quad-reinquadratisch',
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 1,
    objectives: [...OBJ, 'Anzahl der Lösungen'],
    params: (r) => ({ c: r.pick([-25, -9, -4, -1, 0, 1, 4, 16, 36, 49, 7, 12]), a: r.pick([1, 2, 3]) }),
    build: ({ c, a }) => {
      const correct = c > 0 ? 'c' : c === 0 ? 'b' : 'a';
      return {
        prompt: `Wie viele Lösungen hat die Gleichung $${a === 1 ? '' : a}x^2 = ${a * c}$?`,
        choices: COUNT,
        answer: { kind: 'choice', correct },
        hints: [a === 1 ? 'Kann ein Quadrat negativ sein?' : `Teile zuerst durch $${a}$.`, `$x^2 = ${c}$`, 'Positiv ⇒ zwei, null ⇒ eine, negativ ⇒ keine.'],
        solution: { steps: [{ text: `$x^2 = ${c}$: ${c > 0 ? `zwei Lösungen ($\\pm\\sqrt{${c}}$)` : c === 0 ? 'genau eine Lösung ($x = 0$)' : 'kein Quadrat ist negativ ⇒ keine Lösung'}.` }], finalAnswer: COUNT.find((x) => x.id === correct)!.label },
        commonMistakes: [{ description: 'Quadrat negativ gedacht', feedback: 'Ein Quadrat ist nie negativ – $x^2 = -4$ hat keine Lösung.', answers: c < 0 ? ['c'] : [] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-rq-quadrat',
    subtopicId: 'quad-reinquadratisch',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Quadratische Gleichungen im Sachzusammenhang'],
    params: (r) => ({ s: r.pick([3, 4, 5, 6, 7, 8, 9, 12, 15, 2.5, 1.5]), thing: r.pick(['Ein quadratisches Beet', 'Ein quadratischer Teppich', 'Eine quadratische Terrasse', 'Ein quadratisches Grundstück']) }),
    build: ({ s, thing }) => ({
      prompt: `${thing} hat eine Fläche von $${num(s * s)}$ m². Wie lang ist eine Seite (in m)?`,
      answer: { kind: 'numeric', value: s, tolerance: 0.001, unit: 'm' },
      hints: ['$A = s^2$', `$s^2 = ${num(s * s)}$`, 'Eine Länge ist positiv – nur die positive Wurzel zählt.'],
      solution: { steps: [{ text: 'Wurzel ziehen:', math: `s = \\sqrt{${num(s * s)}} = ${num(s)}` }, { text: 'Die negative Lösung entfällt, weil Längen positiv sind.' }], finalAnswer: `$${num(s)}$ m` },
      commonMistakes: [{ description: 'Durch 4 geteilt', feedback: 'Die Fläche eines Quadrats ist $s^2$, nicht $4s$.', answers: [txt((s * s) / 4)] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-rq-fall',
    subtopicId: 'quad-reinquadratisch',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Quadratische Gleichungen im Sachzusammenhang'],
    params: (r) => ({ t: r.pick([1, 2, 3, 4, 5, 1.5, 2.5, 0.5]), what: r.pick(['Ein Stein', 'Ein Apfel', 'Ein Schlüssel', 'Ein Ball']) }),
    build: ({ t, what }) => {
      const s = 5 * t * t;
      return {
        prompt: `${what} fällt aus $${num(s)}$ m Höhe. Für die Fallstrecke gilt näherungsweise $s = 5t^2$ ($s$ in m, $t$ in s). Nach wie vielen Sekunden kommt er unten an?`,
        answer: { kind: 'numeric', value: t, tolerance: 0.001, unit: 's' },
        hints: [`Setze $s = ${num(s)}$ ein: $${num(s)} = 5t^2$.`, `$t^2 = ${num(s / 5)}$`, 'Nur die positive Lösung ist sinnvoll.'],
        solution: { steps: [{ text: 'Gleichung lösen:', math: `5t^2 = ${num(s)} \\;\\Rightarrow\\; t^2 = ${num(s / 5)} \\;\\Rightarrow\\; t = ${num(t)}` }], finalAnswer: `nach $${num(t)}$ s` },
        commonMistakes: [{ description: 'Wurzel vergessen', feedback: `$${num(s / 5)}$ ist $t^2$ – zieh noch die Wurzel.`, answers: [txt(s / 5)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-rq-wurzel',
    subtopicId: 'quad-reinquadratisch',
    count: 8,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 3,
    objectives: OBJ,
    params: (r) => ({ c: r.pick([2, 3, 5, 6, 7, 10, 11, 13, 15, 20]) }),
    build: ({ c }) => {
      const v = round(Math.sqrt(c), 2);
      return {
        prompt: `Löse $x^2 = ${c}$. Runde auf zwei Nachkommastellen. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: [Math.sqrt(c), -Math.sqrt(c)], tolerance: 0.006 },
        hints: ['Wurzel ziehen.', `$\\sqrt{${c}} \\approx ${num(v)}$`, 'Die negative Lösung nicht vergessen.'],
        solution: { steps: [{ text: 'Wurzel ziehen:', math: `x = \\pm\\sqrt{${c}} \\approx \\pm ${num(v)}` }], finalAnswer: `$L = \\{-${num(v)};\\, ${num(v)}\\}$` },
        commonMistakes: [{ description: 'Negative Lösung vergessen', feedback: 'Es gibt zwei Lösungen: $\\pm\\sqrt{' + c + '}$.', answers: [txt(v)] }],
      };
    },
  }),
];

const nullprodukt: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'quad-np-faktoren',
    subtopicId: 'quad-nullprodukt',
    count: 12,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Satz vom Nullprodukt'],
    params: (r) => {
      const a = r.int(-9, 9);
      let b = r.int(-9, 9);
      if (b === a) b = a + 1;
      return { a, b };
    },
    build: ({ a, b }) => {
      const f = (v: number) => (v === 0 ? 'x' : `(x ${v > 0 ? '-' : '+'} ${Math.abs(v)})`);
      return {
        prompt: `Löse $${f(a)} \\cdot ${f(b)} = 0$. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: [a, b], tolerance: 0.001 },
        hints: ['Ein Produkt ist null, wenn ein Faktor null ist.', 'Setze jeden Faktor einzeln gleich null.', `${f(a)} = 0 oder ${f(b)} = 0`.replace(/x/g, '$x$')],
        solution: { steps: [{ text: 'Satz vom Nullprodukt:', math: `x = ${a} \\quad\\text{oder}\\quad x = ${b}` }], finalAnswer: setText([a, b]) },
        commonMistakes: [{ description: 'Vorzeichen übernommen', feedback: 'Aus $x - 3 = 0$ folgt $x = 3$, nicht $-3$.', answers: [setInput([-a, -b])] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-np-px',
    subtopicId: 'quad-nullprodukt',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Ausklammern'],
    params: (r) => ({ p: r.int(1, 12) * r.sign() }),
    build: ({ p }) => ({
      prompt: `Löse $${quadTerm(1, p, 0)} = 0$. ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [0, -p], tolerance: 0.001 },
      hints: ['Klammere $x$ aus.', `$x(x ${p > 0 ? '+' : '-'} ${Math.abs(p)}) = 0$`, 'Satz vom Nullprodukt.'],
      solution: { steps: [{ text: 'Ausklammern:', math: `x(x ${p > 0 ? '+' : '-'} ${Math.abs(p)}) = 0` }, { text: 'Nullprodukt:', math: `x = 0 \\quad\\text{oder}\\quad x = ${-p}` }], finalAnswer: setText([0, -p]) },
      commonMistakes: [{ description: 'Lösung x = 0 vergessen', feedback: 'Auch der Faktor $x$ kann null sein: $x = 0$ ist eine Lösung.', answers: [String(-p)] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-np-ax',
    subtopicId: 'quad-nullprodukt',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Ausklammern'],
    params: (r) => {
      const a = r.int(2, 5) * r.sign();
      const x2 = r.pick([1, 2, 3, 4, 5, 6, 0.5, 1.5, 2.5]) * r.sign();
      return { a, b: -a * x2, x2 };
    },
    build: ({ a, b, x2 }) => ({
      prompt: `Löse $${quadTerm(a, b, 0)} = 0$. ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [0, x2], tolerance: 0.001 },
      hints: ['Klammere $x$ aus.', `$x(${linearTerm(a, b)}) = 0$`, `Löse $${linearTerm(a, b)} = 0$.`],
      solution: { steps: [{ text: 'Ausklammern:', math: `x(${linearTerm(a, b)}) = 0` }, { text: 'Nullprodukt:', math: `x = 0 \\quad\\text{oder}\\quad x = ${num(x2)}` }], finalAnswer: setText([0, x2]) },
      commonMistakes: [{ description: 'Durch x geteilt', feedback: 'Wer durch $x$ teilt, verliert die Lösung $x = 0$.', answers: [txt(x2)] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-np-drei',
    subtopicId: 'quad-nullprodukt',
    count: 8,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 3,
    objectives: [...OBJ, 'Satz vom Nullprodukt'],
    params: (r) => ({ a: r.int(1, 7), b: r.int(1, 7) }),
    build: ({ a, b }) => ({
      prompt: `Löse $x \\cdot (x - ${a}) \\cdot (x + ${b}) = 0$. ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [0, a, -b], tolerance: 0.001 },
      hints: ['Drei Faktoren – jeder kann null sein.', 'Setze jeden Faktor gleich null.', 'Es gibt drei Lösungen.'],
      solution: { steps: [{ text: 'Nullprodukt:', math: `x = 0 \\quad\\text{oder}\\quad x = ${a} \\quad\\text{oder}\\quad x = ${-b}` }], finalAnswer: setText([0, a, -b]) },
      commonMistakes: [{ description: 'Faktor x übersehen', feedback: 'Auch der erste Faktor $x$ liefert eine Lösung: $x = 0$.', answers: [setInput([a, -b])] }],
    }),
  }),
  ...fromTemplate({
    id: 'quad-np-auswahl',
    subtopicId: 'quad-nullprodukt',
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 1,
    objectives: [...OBJ, 'Satz vom Nullprodukt'],
    params: (r) => ({ a: r.int(1, 9), b: r.int(1, 9) }),
    build: ({ a, b }, r) => {
      const right = `$x = ${a}$ oder $x = ${-b}$`;
      const { choices, correctId } = shuffledChoices(r, right, [`$x = ${-a}$ oder $x = ${b}$`, `$x = ${a}$ und $x = ${b}$`, `nur $x = ${a - b}$`]);
      return {
        prompt: `Für welche $x$ gilt $(x - ${a})(x + ${b}) = 0$?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Ein Produkt ist null, wenn ein Faktor null ist.', `$x - ${a} = 0$ oder $x + ${b} = 0$`, 'Achte auf die Vorzeichen.'],
        solution: { steps: [{ text: `$x - ${a} = 0 \\Rightarrow x = ${a}$; $x + ${b} = 0 \\Rightarrow x = ${-b}$.` }], finalAnswer: right },
        commonMistakes: [{ description: 'Vorzeichen vertauscht', feedback: 'Aus $x - a = 0$ folgt $x = a$.', answers: choices.filter((c) => c.label.startsWith(`$x = ${-a}$`)).map((c) => c.id) }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-np-wurf',
    subtopicId: 'quad-nullprodukt',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Quadratische Gleichungen im Sachzusammenhang'],
    params: (r) => ({ v: r.pick([10, 15, 20, 25, 30]), what: r.pick(['Ein Ball', 'Ein Pfeil', 'Ein Tennisball', 'Ein Federball']) }),
    build: ({ v, what }) => {
      const t = v / 5;
      return {
        prompt: `${what} wird senkrecht nach oben geschossen. Seine Höhe ist $h(t) = ${v}t - 5t^2$ ($h$ in m, $t$ in s). Nach wie vielen Sekunden ist er wieder am Boden?`,
        answer: { kind: 'numeric', value: t, tolerance: 0.001, unit: 's' },
        hints: ['Am Boden ist $h(t) = 0$.', `$t(${v} - 5t) = 0$`, '$t = 0$ ist der Abwurf – gesucht ist die andere Lösung.'],
        solution: { steps: [{ text: 'Nullstellen:', math: `${v}t - 5t^2 = t(${v} - 5t) = 0 \\;\\Rightarrow\\; t = 0 \\text{ oder } t = ${num(t)}` }, { text: '$t = 0$ ist der Start, also landet er nach $' + num(t) + '$ s.' }], finalAnswer: `nach $${num(t)}$ s` },
        commonMistakes: [{ description: 'Abwurfzeitpunkt angegeben', feedback: '$t = 0$ ist der Moment des Abwurfs.', answers: ['0'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-np-raetsel',
    subtopicId: 'quad-nullprodukt',
    count: 8,
    type: 'equation',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Zahlenrätsel'],
    params: (r) => ({ k: r.int(2, 15) }),
    build: ({ k }) => ({
      prompt: `Das Quadrat einer Zahl ist $${k}$-mal so groß wie die Zahl selbst. Welche Zahlen kommen in Frage? ${SET_HINT}`,
      answer: { kind: 'numeric-set', values: [0, k], tolerance: 0.001 },
      hints: [`Gleichung: $x^2 = ${k}x$`, `Alles auf eine Seite: $x^2 - ${k}x = 0$`, 'Ausklammern – nicht durch $x$ teilen!'],
      solution: { steps: [{ text: 'Gleichung aufstellen und lösen:', math: `x^2 = ${k}x \\;\\Rightarrow\\; x(x - ${k}) = 0 \\;\\Rightarrow\\; x = 0 \\text{ oder } x = ${k}` }], finalAnswer: setText([0, k]) },
      commonMistakes: [{ description: 'Durch x geteilt', feedback: 'Teilen durch $x$ verliert die Lösung $x = 0$.', answers: [String(k)] }],
    }),
  }),
];

const pqFormel: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'quad-pq-ganz',
    subtopicId: 'quad-pq-formel',
    count: 12,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'pq-Formel'],
    params: (r) => {
      const x1 = r.int(-8, 8);
      let x2 = r.int(-8, 8);
      if (x2 === x1) x2 = x1 + 2;
      return { x1, x2 };
    },
    build: ({ x1, x2 }) => {
      const p = -(x1 + x2);
      const q = x1 * x2;
      const d = (p / 2) ** 2 - q;
      return {
        prompt: `Löse $${quadTerm(1, p, q)} = 0$ mit der pq-Formel. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: [x1, x2], tolerance: 0.001 },
        hints: [`$p = ${p}$, $q = ${q}$`, '$x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$', `Unter der Wurzel steht $${num(d)}$.`],
        solution: {
          steps: [
            { text: 'pq-Formel:', math: `x = ${num(-p / 2)} \\pm \\sqrt{${num((p / 2) ** 2)} ${q < 0 ? '+' : '-'} ${Math.abs(q)}} = ${num(-p / 2)} \\pm ${num(Math.sqrt(d))}` },
            { text: 'Lösungen:', math: `x_1 = ${Math.max(x1, x2)},\\; x_2 = ${Math.min(x1, x2)}` },
          ],
          finalAnswer: setText([x1, x2]),
        },
        commonMistakes: [{ description: 'Vorzeichen von p/2 falsch', feedback: 'In der pq-Formel steht $-\\frac{p}{2}$.', answers: [setInput([-x1, -x2])] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-normieren',
    subtopicId: 'quad-pq-formel',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Normalform herstellen'],
    params: (r) => {
      const a = r.pick([2, 3, -2, 4, -1]);
      const x1 = r.int(-6, 6);
      let x2 = r.int(-6, 6);
      if (x2 === x1) x2 = x1 - 3;
      return { a, x1, x2 };
    },
    build: ({ a, x1, x2 }) => {
      const p = -(x1 + x2);
      const q = x1 * x2;
      return {
        prompt: `Löse $${quadTerm(a, a * p, a * q)} = 0$. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: [x1, x2], tolerance: 0.001 },
        hints: [`Teile zuerst durch $${a}$ (Normalform).`, `$${quadTerm(1, p, q)} = 0$`, 'Dann die pq-Formel anwenden.'],
        solution: { steps: [{ text: `Durch $${a}$ teilen:`, math: `${quadTerm(1, p, q)} = 0` }, { text: 'pq-Formel:', math: `x = ${num(-p / 2)} \\pm ${num(Math.sqrt((p / 2) ** 2 - q))}` }], finalAnswer: setText([x1, x2]) },
        commonMistakes: [{ description: 'Nicht normiert', feedback: 'Die pq-Formel gilt nur, wenn vor $x^2$ eine $1$ steht.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-diskriminante',
    subtopicId: 'quad-pq-formel',
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Diskriminante'],
    params: (r) => ({ p: r.int(1, 8) * 2 * r.sign(), q: r.int(-12, 12) }),
    build: ({ p, q }) => {
      const d = (p / 2) ** 2 - q;
      return {
        prompt: `Berechne den Term unter der Wurzel der pq-Formel, $\\left(\\frac{p}{2}\\right)^2 - q$, für $${quadTerm(1, p, q)} = 0$.`,
        answer: { kind: 'numeric', value: d, tolerance: 0.001 },
        hints: [`$p = ${p}$, also $\\frac{p}{2} = ${p / 2}$.`, `$\\left(${p / 2}\\right)^2 = ${(p / 2) ** 2}$`, `Ziehe $q = ${q}$ ab.`],
        solution: { steps: [{ text: 'Einsetzen:', math: `\\left(${p / 2}\\right)^2 - ${q < 0 ? `(${q})` : q} = ${(p / 2) ** 2} ${q < 0 ? '+' : '-'} ${Math.abs(q)} = ${d}` }], finalAnswer: `$${d}$` },
        commonMistakes: [{ description: 'Vorzeichen von q', feedback: 'Bei negativem $q$ wird aus $-q$ ein Plus.', answers: [String((p / 2) ** 2 + q)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-anzahl',
    subtopicId: 'quad-pq-formel',
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: [...OBJ, 'Anzahl der Lösungen'],
    params: (r) => {
      const p = r.int(1, 6) * 2 * r.sign();
      const kind = r.pick(['two', 'one', 'none']);
      const base = (p / 2) ** 2;
      const q = kind === 'one' ? base : kind === 'two' ? base - r.pick([1, 4, 9, 7]) : base + r.pick([1, 3, 5]);
      return { p, q };
    },
    build: ({ p, q }) => {
      const d = (p / 2) ** 2 - q;
      const correct = d > 0 ? 'c' : d === 0 ? 'b' : 'a';
      return {
        prompt: `Wie viele Lösungen hat $${quadTerm(1, p, q)} = 0$?`,
        choices: COUNT,
        answer: { kind: 'choice', correct },
        hints: ['Entscheidend ist der Term unter der Wurzel.', `$\\left(\\frac{p}{2}\\right)^2 - q = ${(p / 2) ** 2} ${q < 0 ? '+' : '-'} ${Math.abs(q)}$`, 'Positiv ⇒ zwei, null ⇒ eine, negativ ⇒ keine.'],
        solution: { steps: [{ text: 'Diskriminante:', math: `D = ${d}` }, { text: d > 0 ? '$D > 0$ ⇒ zwei Lösungen.' : d === 0 ? '$D = 0$ ⇒ genau eine Lösung.' : '$D < 0$ ⇒ keine Lösung.' }], finalAnswer: COUNT.find((x) => x.id === correct)!.label },
        commonMistakes: [{ description: 'Diskriminante falsch gedeutet', feedback: 'Aus einer negativen Zahl kann man keine Wurzel ziehen ⇒ keine Lösung.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-gerundet',
    subtopicId: 'quad-pq-formel',
    count: 10,
    type: 'equation',
    requirement: 'calculation',
    difficulty: 3,
    objectives: [...OBJ, 'pq-Formel'],
    params: (r) => {
      // Zwei Lösungen, aber keine glatten: Diskriminante positiv und keine Quadratzahl
      for (;;) {
        const p = r.int(-7, 7);
        const q = r.pick([-11, -7, -5, -3, -2, 1, 2]);
        const d = (p / 2) ** 2 - q;
        if (d > 0 && !Number.isInteger(Math.sqrt(d))) return { p, q };
      }
    },
    build: ({ p, q }) => {
      const d = (p / 2) ** 2 - q;
      const s = Math.sqrt(d);
      const x1 = -p / 2 + s;
      const x2 = -p / 2 - s;
      return {
        prompt: `Löse $${quadTerm(1, p, q)} = 0$ mit der pq-Formel. Runde auf zwei Nachkommastellen. ${SET_HINT}`,
        answer: { kind: 'numeric-set', values: [x1, x2], tolerance: 0.006 },
        hints: [`$p = ${p}$, $q = ${q}$`, `Unter der Wurzel: $${num(d)}$`, `$\\sqrt{${num(d)}} \\approx ${num(round(s, 3), 3)}$`],
        solution: { steps: [{ text: 'pq-Formel:', math: `x = ${num(-p / 2)} \\pm \\sqrt{${num(d)}} \\approx ${num(-p / 2)} \\pm ${num(round(s, 3), 3)}` }], finalAnswer: `$x_1 \\approx ${num(round(x1, 2))},\\; x_2 \\approx ${num(round(x2, 2))}$` },
        commonMistakes: [{ description: 'Nur eine Lösung angegeben', feedback: 'Bei positiver Diskriminante gibt es zwei Lösungen ($\\pm$).', answers: [txt(round(x1, 2))] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-rechteck',
    subtopicId: 'quad-pq-formel',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Quadratische Gleichungen im Sachzusammenhang'],
    params: (r) => ({ b: r.int(3, 12), d: r.int(1, 6), thing: r.pick(['Ein rechteckiges Beet', 'Ein rechteckiges Grundstück', 'Ein rechteckiges Banner', 'Ein rechteckiges Spielfeld']) }),
    build: ({ b, d, thing }) => {
      const A = b * (b + d);
      return {
        prompt: `${thing} ist $${d}$ m länger als breit und hat die Fläche $${A}$ m². Wie breit ist es (in m)?`,
        answer: { kind: 'numeric', value: b, tolerance: 0.001, unit: 'm' },
        hints: [`Breite $x$, Länge $x + ${d}$: $x(x + ${d}) = ${A}$`, `$x^2 + ${d}x - ${A} = 0$`, 'pq-Formel; nur die positive Lösung ist eine Länge.'],
        solution: {
          steps: [
            { text: 'Gleichung:', math: `x^2 + ${d}x - ${A} = 0` },
            { text: 'pq-Formel:', math: `x = ${num(-d / 2)} \\pm \\sqrt{${num((d / 2) ** 2)} + ${A}} = ${num(-d / 2)} \\pm ${num(b + d / 2)}` },
            { text: `Positive Lösung: $x = ${b}$ (die negative entfällt).` },
          ],
          finalAnswer: `$${b}$ m breit`,
        },
        commonMistakes: [{ description: 'Länge statt Breite', feedback: 'Gefragt ist die Breite (die kürzere Seite).', answers: [String(b + d)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'quad-pq-folge',
    subtopicId: 'quad-pq-formel',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Zahlenrätsel'],
    params: (r) => ({ n: r.int(4, 25) }),
    build: ({ n }) => {
      const P = n * (n + 1);
      return {
        prompt: `Das Produkt zweier aufeinanderfolgender natürlicher Zahlen ist $${P}$. Wie heißt die kleinere Zahl?`,
        answer: { kind: 'numeric', value: n, tolerance: 0.001 },
        hints: [`Zahlen $x$ und $x + 1$: $x(x + 1) = ${P}$`, `$x^2 + x - ${P} = 0$`, 'pq-Formel; natürliche Zahlen sind positiv.'],
        solution: { steps: [{ text: 'Gleichung:', math: `x^2 + x - ${P} = 0` }, { text: 'pq-Formel:', math: `x = -0{,}5 \\pm \\sqrt{0{,}25 + ${P}} = -0{,}5 \\pm ${num(n + 0.5)}` }, { text: `Natürliche Lösung: $x = ${n}$.` }], finalAnswer: `$${n}$` },
        commonMistakes: [{ description: 'Größere Zahl angegeben', feedback: 'Gefragt ist die kleinere der beiden Zahlen.', answers: [String(n + 1)] }],
      };
    },
  }),
];

export const POOL: Record<string, AuthoredExercise[]> = {
  'quad-reinquadratisch': reinquadratisch,
  'quad-nullprodukt': nullprodukt,
  'quad-pq-formel': pqFormel,
};
