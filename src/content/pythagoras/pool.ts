/** Aufgabenpool Satz des Pythagoras: Vorlagen je Kapitel (die handgeschriebenen Aufgaben stehen in basis.ts). */
import type { AuthoredExercise } from '../../types';
import { fromTemplate, num, round, type Rng, shuffledChoices, txt } from '../templates';

const OBJ = ['Satz des Pythagoras anwenden'];
const YES_NO = [
  { id: 'a', label: 'Ja' },
  { id: 'b', label: 'Nein' },
];
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [6, 8, 10],
  [12, 16, 20],
  [9, 12, 15],
  [15, 20, 25],
];
const TRIANGLES = ['ABC', 'DEF', 'KLM', 'PQR', 'RST', 'UVW', 'XYZ', 'GHI', 'EFG', 'LMN'];
const sq = (v: number) => `${num(v)}^2`;
const pick3 = (r: Rng) => r.pick(TRIPLES);

/** Dreieck mit rechtem Winkel an einer Ecke: Hypotenuse = die beiden anderen Ecken. */
function rightTriangle(r: Rng) {
  const name = r.pick(TRIANGLES);
  const i = r.int(0, 2);
  const vertex = name[i];
  const others = name.replace(vertex, '');
  return { name, vertex, hyp: others, legs: [`${vertex}${others[0]}`, `${vertex}${others[1]}`] };
}

const grundlagen: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-gl-hyp',
    subtopicId: 'pyth-grundlagen',
    count: 12,
    type: 'text',
    requirement: 'knowledge',
    difficulty: 1,
    objectives: ['Hypotenuse und Katheten erkennen'],
    params: (r) => rightTriangle(r),
    build: ({ name, vertex, hyp, legs }) => ({
      prompt: `Im Dreieck $${name}$ liegt der rechte Winkel bei $${vertex}$. Wie heißt die Hypotenuse? (z. B. „AB“)`,
      answer: { kind: 'text', accepted: [hyp, hyp.split('').reverse().join('')] },
      hints: ['Die Hypotenuse liegt dem rechten Winkel gegenüber.', `Sie berührt die Ecke $${vertex}$ nicht.`, `Sie verbindet die beiden anderen Ecken.`],
      solution: { steps: [{ text: `Gegenüber von $${vertex}$ liegt die Seite $${hyp}$. Die Katheten sind $${legs[0]}$ und $${legs[1]}$.` }], finalAnswer: `$${hyp}$` },
      commonMistakes: [{ description: 'Kathete genannt', feedback: 'Die Katheten bilden den rechten Winkel – die Hypotenuse liegt ihm gegenüber.', answers: [legs[0], legs[1]] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-gl-gleichung',
    subtopicId: 'pyth-grundlagen',
    count: 10,
    type: 'multiple-choice',
    requirement: 'knowledge',
    difficulty: 1,
    objectives: ['Satz des Pythagoras aufstellen'],
    params: (r) => ({ name: r.pick(TRIANGLES), i: r.int(0, 2) }),
    build: ({ name, i }, r) => {
      const s = name.toLowerCase().split('');
      const hyp = s[i];
      const [k1, k2] = s.filter((_, j) => j !== i);
      const right = `$${k1}^2 + ${k2}^2 = ${hyp}^2$`;
      const { choices, correctId } = shuffledChoices(r, right, [`$${hyp}^2 + ${k1}^2 = ${k2}^2$`, `$${hyp}^2 + ${k2}^2 = ${k1}^2$`, `$${k1} + ${k2} = ${hyp}$`]);
      return {
        prompt: `Im Dreieck $${name}$ liegt der rechte Winkel bei $${name[i]}$. Die Seiten heißen wie üblich $${s[0]}$, $${s[1]}$, $${s[2]}$ (gegenüber der gleichnamigen Ecke). Welche Gleichung gilt?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: [`Die Hypotenuse liegt dem rechten Winkel bei $${name[i]}$ gegenüber: $${hyp}$.`, 'Hypotenusenquadrat = Summe der Kathetenquadrate.', `$${hyp}^2$ steht allein.`],
        solution: { steps: [{ text: `Hypotenuse ist $${hyp}$, also ${right}.` }], finalAnswer: right },
        commonMistakes: [{ description: 'Hypotenuse falsch erkannt', feedback: 'Die Hypotenuse ist die Seite gegenüber dem rechten Winkel.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-gl-c2',
    subtopicId: 'pyth-grundlagen',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: OBJ,
    params: (r) => ({ a: r.int(2, 12), b: r.int(2, 12) }),
    build: ({ a, b }) => ({
      prompt: `Die Katheten eines rechtwinkligen Dreiecks sind $a = ${a}$ cm und $b = ${b}$ cm. Berechne $c^2$ (in cm²).`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001, unit: 'cm²' },
      hints: ['$c^2 = a^2 + b^2$', `$${a}^2 = ${a * a}$`, `$${b}^2 = ${b * b}$`],
      solution: { steps: [{ text: 'Einsetzen:', math: `c^2 = ${sq(a)} + ${sq(b)} = ${a * a} + ${b * b} = ${a * a + b * b}` }], finalAnswer: `$c^2 = ${a * a + b * b}$ cm²` },
      commonMistakes: [{ description: 'Nicht quadriert', feedback: 'Die Seiten werden erst quadriert, dann addiert.', answers: [String(a + b), String((a + b) ** 2)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-gl-quadrate',
    subtopicId: 'pyth-grundlagen',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Flächen über den Seiten'],
    params: (r) => ({ a: r.int(2, 9), b: r.int(3, 12), what: r.pick(['Fliesen', 'Rasenstücke', 'Holzplatten']) }),
    build: ({ a, b, what }) => ({
      prompt: `An die Katheten eines rechtwinkligen Dreiecks ($${a}$ m und $${b}$ m) werden quadratische ${what} gelegt. Wie groß muss die quadratische Fläche an der Hypotenuse sein (in m²)?`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001, unit: 'm²' },
      hints: ['Die Fläche eines Quadrats über einer Seite ist das Quadrat der Seitenlänge.', 'Hypotenusenquadrat = Summe der Kathetenquadrate.', `$${a * a} + ${b * b}$`],
      solution: { steps: [{ text: 'Kathetenquadrate addieren:', math: `${sq(a)} + ${sq(b)} = ${a * a + b * b}` }], finalAnswer: `$${a * a + b * b}$ m²` },
      commonMistakes: [{ description: 'Seiten addiert', feedback: 'Es werden die Flächen (Quadrate) addiert, nicht die Seiten.', answers: [String(a + b)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-gl-quadrat-rest',
    subtopicId: 'pyth-grundlagen',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Flächen über den Seiten'],
    params: (r) => {
      const [a, b, c] = pick3(r);
      return { ka: a * a, c2: c * c, b2: b * b };
    },
    build: ({ ka, c2, b2 }) => ({
      prompt: `Über der Hypotenuse eines rechtwinkligen Dreiecks liegt ein Quadrat mit $${c2}$ cm², über einer Kathete eines mit $${ka}$ cm². Wie groß ist das Quadrat über der anderen Kathete (in cm²)?`,
      answer: { kind: 'numeric', value: b2, tolerance: 0.001, unit: 'cm²' },
      hints: ['$c^2 = a^2 + b^2$', `$b^2 = c^2 - a^2$`, `$${c2} - ${ka}$`],
      solution: { steps: [{ text: 'Umstellen:', math: `b^2 = ${c2} - ${ka} = ${b2}` }], finalAnswer: `$${b2}$ cm²` },
      commonMistakes: [{ description: 'Addiert statt subtrahiert', feedback: 'Die Hypotenusenfläche ist die größte – ziehe die bekannte Kathetenfläche ab.', answers: [String(c2 + ka)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-gl-gilt',
    subtopicId: 'pyth-grundlagen',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 3,
    objectives: ['Satz des Pythagoras richtig anwenden'],
    params: (r) => ({ name: r.pick(TRIANGLES), i: r.int(0, 2), j: r.int(0, 2) }),
    build: ({ name, i, j }) => {
      const s = name.toLowerCase().split('');
      const hyp = s[j];
      const [k1, k2] = s.filter((_, x) => x !== j);
      const ok = i === j;
      return {
        prompt: `Im Dreieck $${name}$ liegt der rechte Winkel bei $${name[i]}$. Gilt $${k1}^2 + ${k2}^2 = ${hyp}^2$?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: [`Welche Seite liegt dem rechten Winkel bei $${name[i]}$ gegenüber?`, `Das ist $${s[i]}$ – die Hypotenuse.`, 'Nur das Quadrat der Hypotenuse steht allein.'],
        solution: { steps: [{ text: `Hypotenuse ist $${s[i]}$. ${ok ? 'Die Gleichung stimmt.' : `Richtig wäre ${s.filter((_, x) => x !== i).map((v) => `$${v}^2$`).join(' + ')} $= ${s[i]}^2$.`}` }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Immer c als Hypotenuse angenommen', feedback: 'Die Hypotenuse heißt nicht immer $c$ – sie liegt dem rechten Winkel gegenüber.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
];

const erkennen: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-er-winkelsumme',
    subtopicId: 'pyth-erkennen',
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Winkelsumme im Dreieck'],
    params: (r) => {
      const a = r.int(20, 80);
      return { a, b: r.int(20, 150 - a) };
    },
    build: ({ a, b }) => ({
      prompt: `In einem Dreieck sind $\\alpha = ${a}^\\circ$ und $\\beta = ${b}^\\circ$. Wie groß ist $\\gamma$ (in Grad)?`,
      answer: { kind: 'numeric', value: 180 - a - b, tolerance: 0.001, unit: '°' },
      hints: ['Die Winkelsumme im Dreieck beträgt $180^\\circ$.', `$\\gamma = 180^\\circ - ${a}^\\circ - ${b}^\\circ$`, `$${a} + ${b} = ${a + b}$`],
      solution: { steps: [{ text: 'Winkelsumme:', math: `\\gamma = 180^\\circ - ${a}^\\circ - ${b}^\\circ = ${180 - a - b}^\\circ` }], finalAnswer: `$\\gamma = ${180 - a - b}^\\circ$` },
      commonMistakes: [{ description: 'Mit 360° gerechnet', feedback: 'Im Dreieck ist die Winkelsumme $180^\\circ$ (360° gilt im Viereck).', answers: [String(360 - a - b)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-er-rechtwinklig',
    subtopicId: 'pyth-erkennen',
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: ['Rechtwinklige Dreiecke erkennen'],
    params: (r) => {
      const a = r.int(15, 75);
      const right = r.int(0, 1) === 1;
      return { a, b: right ? 90 - a : 90 - a + r.pick([-5, 5, 10, -10]) };
    },
    build: ({ a, b }) => {
      const g = 180 - a - b;
      return {
        prompt: `Ein Dreieck hat die Winkel $${a}^\\circ$ und $${b}^\\circ$. Ist es rechtwinklig?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: g === 90 ? 'a' : 'b' },
        hints: ['Berechne den dritten Winkel.', `$180^\\circ - ${a}^\\circ - ${b}^\\circ$`, 'Rechtwinklig heißt: ein Winkel ist genau $90^\\circ$.'],
        solution: { steps: [{ text: `Dritter Winkel: $${g}^\\circ$ ⇒ ${g === 90 ? 'rechtwinklig' : 'nicht rechtwinklig'}.` }], finalAnswer: g === 90 ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Dritten Winkel nicht berechnet', feedback: 'Prüfe alle drei Winkel – der rechte Winkel kann auch der dritte sein.', answers: [g === 90 ? 'b' : 'a'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-er-hyp',
    subtopicId: 'pyth-erkennen',
    count: 10,
    type: 'text',
    requirement: 'knowledge',
    difficulty: 1,
    objectives: ['Hypotenuse erkennen'],
    params: (r) => rightTriangle(r),
    build: ({ name, vertex, hyp, legs }) => ({
      prompt: `Das Dreieck $${name}$ hat bei $${vertex}$ einen $90^\\circ$-Winkel. Welche Seite ist die längste? (z. B. „AB“)`,
      answer: { kind: 'text', accepted: [hyp, hyp.split('').reverse().join('')] },
      hints: ['Die längste Seite im rechtwinkligen Dreieck ist die Hypotenuse.', 'Sie liegt dem rechten Winkel gegenüber.', `Sie berührt $${vertex}$ nicht.`],
      solution: { steps: [{ text: `Die Hypotenuse $${hyp}$ liegt dem rechten Winkel gegenüber und ist die längste Seite.` }], finalAnswer: `$${hyp}$` },
      commonMistakes: [{ description: 'Kathete genannt', feedback: 'Die Katheten liegen am rechten Winkel an und sind kürzer.', answers: legs }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-er-spitz',
    subtopicId: 'pyth-erkennen',
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: ['Winkel im rechtwinkligen Dreieck'],
    params: (r) => ({ a: r.int(12, 78) }),
    build: ({ a }) => ({
      prompt: `In einem rechtwinkligen Dreieck ist einer der spitzen Winkel $${a}^\\circ$ groß. Wie groß ist der andere spitze Winkel?`,
      answer: { kind: 'numeric', value: 90 - a, tolerance: 0.001, unit: '°' },
      hints: ['Ein Winkel ist $90^\\circ$.', 'Zusammen mit den beiden anderen ergibt das $180^\\circ$.', `Die spitzen Winkel ergeben zusammen $90^\\circ$.`],
      solution: { steps: [{ text: 'Spitze Winkel ergänzen sich zu $90^\\circ$:', math: `90^\\circ - ${a}^\\circ = ${90 - a}^\\circ` }], finalAnswer: `$${90 - a}^\\circ$` },
      commonMistakes: [{ description: 'Von 180° abgezogen', feedback: 'Der rechte Winkel ($90^\\circ$) gehört auch zur Winkelsumme.', answers: [String(180 - a)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-er-leiter',
    subtopicId: 'pyth-erkennen',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Winkel im rechtwinkligen Dreieck'],
    params: (r) => ({ a: r.int(55, 80), thing: r.pick(['Eine Leiter lehnt an einer senkrechten Wand', 'Ein Brett lehnt an einer senkrechten Mauer', 'Eine Rutsche führt vom senkrechten Turm zum Boden']) }),
    build: ({ a, thing }) => ({
      prompt: `${thing}. Mit dem waagerechten Boden bildet sie einen Winkel von $${a}^\\circ$. Wie groß ist der Winkel oben zwischen ${thing.includes('Rutsche') ? 'Rutsche und Turm' : 'Leiter bzw. Brett und Wand'}?`,
      answer: { kind: 'numeric', value: 90 - a, tolerance: 0.001, unit: '°' },
      hints: ['Wand und Boden bilden einen rechten Winkel.', 'Es entsteht ein rechtwinkliges Dreieck.', `$180^\\circ - 90^\\circ - ${a}^\\circ$`],
      solution: { steps: [{ text: 'Rechtwinkliges Dreieck:', math: `180^\\circ - 90^\\circ - ${a}^\\circ = ${90 - a}^\\circ` }], finalAnswer: `$${90 - a}^\\circ$` },
      commonMistakes: [{ description: 'Rechten Winkel vergessen', feedback: 'Wand und Boden stehen senkrecht – dort ist ein $90^\\circ$-Winkel.', answers: [String(180 - a)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-er-dach',
    subtopicId: 'pyth-erkennen',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Winkelsumme im Dreieck'],
    params: (r) => ({ a: r.pick([25, 30, 35, 38, 40, 42, 45, 48, 50]) }),
    build: ({ a }) => ({
      prompt: `Ein Satteldach hat auf beiden Seiten dieselbe Dachneigung von $${a}^\\circ$ gegen die Waagerechte. Wie groß ist der Winkel am First (oben)?`,
      answer: { kind: 'numeric', value: 180 - 2 * a, tolerance: 0.001, unit: '°' },
      hints: ['Der Giebel ist ein gleichschenkliges Dreieck.', 'Die beiden Basiswinkel sind gleich.', `$180^\\circ - 2 \\cdot ${a}^\\circ$`],
      solution: { steps: [{ text: 'Winkelsumme:', math: `180^\\circ - 2 \\cdot ${a}^\\circ = ${180 - 2 * a}^\\circ` }, { text: 180 - 2 * a === 90 ? 'Der Giebel ist rechtwinklig.' : 'Der Giebel ist nicht rechtwinklig.' }], finalAnswer: `$${180 - 2 * a}^\\circ$` },
      commonMistakes: [{ description: 'Nur einmal abgezogen', feedback: 'Beide Dachseiten haben den Winkel – zweimal abziehen.', answers: [String(180 - a)] }],
    }),
  }),
];

const herleitung: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-hl-flaechen',
    subtopicId: 'pyth-herleitung',
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Flächen über den Seiten'],
    params: (r) => ({ a: r.int(2, 12), b: r.int(2, 12) }),
    build: ({ a, b }) => ({
      prompt: `Über den Katheten eines rechtwinkligen Dreiecks liegen Quadrate mit $${a * a}$ cm² und $${b * b}$ cm². Wie groß ist das Quadrat über der Hypotenuse (in cm²)?`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001, unit: 'cm²' },
      hints: ['Satz des Pythagoras als Flächenaussage.', 'Die Hypotenusenfläche ist die Summe der Kathetenflächen.', `$${a * a} + ${b * b}$`],
      solution: { steps: [{ text: 'Flächen addieren:', math: `${a * a} + ${b * b} = ${a * a + b * b}` }], finalAnswer: `$${a * a + b * b}$ cm²` },
      commonMistakes: [{ description: 'Wurzel gezogen', feedback: 'Gefragt ist die Fläche, nicht die Seitenlänge.', answers: [txt(round(Math.sqrt(a * a + b * b), 2))] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-hl-kathetenflaeche',
    subtopicId: 'pyth-herleitung',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: ['Flächen über den Seiten'],
    params: (r) => {
      const [a, b, c] = pick3(r);
      return { a2: a * a, b2: b * b, c2: c * c };
    },
    build: ({ a2, b2, c2 }) => ({
      prompt: `Das Quadrat über der Hypotenuse hat $${c2}$ cm², das über einer Kathete $${b2}$ cm². Wie groß ist das Quadrat über der anderen Kathete?`,
      answer: { kind: 'numeric', value: a2, tolerance: 0.001, unit: 'cm²' },
      hints: ['$A_c = A_a + A_b$', 'Umstellen nach der gesuchten Fläche.', `$${c2} - ${b2}$`],
      solution: { steps: [{ text: 'Umstellen:', math: `A_a = ${c2} - ${b2} = ${a2}` }], finalAnswer: `$${a2}$ cm²` },
      commonMistakes: [{ description: 'Addiert', feedback: 'Die Hypotenusenfläche ist die Summe – also abziehen.', answers: [String(c2 + b2)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-hl-passt',
    subtopicId: 'pyth-herleitung',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: ['Flächen über den Seiten'],
    params: (r) => ({ t: pick3(r), d: r.pick([1, 2, 3, -1, -2]) }),
    build: ({ t: [a, b, c], d }, r) => {
      const right = `$${a * a}$, $${b * b}$ und $${c * c}$ cm²`;
      const { choices, correctId } = shuffledChoices(r, right, [`$${a * a}$, $${b * b}$ und $${c * c + d}$ cm²`, `$${a * a}$, $${b * b}$ und $${(a + b) ** 2}$ cm²`, `$${a * a + d}$, $${b * b}$ und $${c * c}$ cm²`]);
      return {
        prompt: 'Über den drei Seiten eines Dreiecks liegen Quadrate. Bei welchen Flächeninhalten ist das Dreieck rechtwinklig?',
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Rechtwinklig, wenn die größte Fläche die Summe der beiden anderen ist.', 'Addiere jeweils die beiden kleineren Flächen.', 'Vergleiche mit der größten.'],
        solution: { steps: [{ text: `$${a * a} + ${b * b} = ${c * c}$ ⇒ rechtwinklig.` }], finalAnswer: right },
        commonMistakes: [{ description: 'Seiten addiert statt Flächen', feedback: 'Es müssen die Flächen der kleinen Quadrate zusammen die große ergeben.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-hl-term',
    subtopicId: 'pyth-herleitung',
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 3,
    objectives: ['Ergänzungsbeweis'],
    params: (r) => ({ a: r.int(2, 9), b: r.int(2, 9) }),
    build: ({ a, b }) => ({
      prompt: `Ergänzungsbeweis mit Zahlen: Ein Quadrat hat die Seitenlänge $a + b = ${a} + ${b}$. Davon werden vier rechtwinklige Dreiecke mit den Katheten $${a}$ und $${b}$ abgezogen. Wie groß ist die Restfläche, also $(a+b)^2 - 4 \\cdot \\frac{a \\cdot b}{2}$?`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001 },
      hints: [`$(${a} + ${b})^2 = ${(a + b) ** 2}$`, `$4 \\cdot \\frac{${a} \\cdot ${b}}{2} = ${2 * a * b}$`, 'Die Restfläche ist das Quadrat über der Hypotenuse.'],
      solution: { steps: [{ text: 'Rechnen:', math: `${(a + b) ** 2} - ${2 * a * b} = ${a * a + b * b} = ${a}^2 + ${b}^2` }, { text: 'Genau $a^2 + b^2$ – das ist $c^2$.' }], finalAnswer: `$${a * a + b * b}$` },
      commonMistakes: [{ description: 'Dreiecksfläche nicht halbiert', feedback: 'Ein rechtwinkliges Dreieck hat die Fläche $\\frac{a \\cdot b}{2}$.', answers: [String((a + b) ** 2 - 4 * a * b)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-hl-beete',
    subtopicId: 'pyth-herleitung',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Flächen über den Seiten'],
    params: (r) => ({ a: r.int(2, 8), b: r.int(3, 10) }),
    build: ({ a, b }) => ({
      prompt: `In einem Park bilden drei quadratische Beete ein rechtwinkliges Dreieck in der Mitte. Die Beete an den Katheten haben Seitenlängen von $${a}$ m und $${b}$ m. Wie groß ist das Beet an der Hypotenuse (in m²)?`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001, unit: 'm²' },
      hints: ['Fläche eines quadratischen Beets: Seite mal Seite.', `$${a * a}$ m² und $${b * b}$ m²`, 'Summe der beiden Flächen.'],
      solution: { steps: [{ text: 'Flächen addieren:', math: `${sq(a)} + ${sq(b)} = ${a * a + b * b}` }], finalAnswer: `$${a * a + b * b}$ m²` },
      commonMistakes: [{ description: 'Seitenlängen addiert', feedback: 'Addiert werden die Flächen, nicht die Seiten.', answers: [String(a + b)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-hl-seite',
    subtopicId: 'pyth-herleitung',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Flächen über den Seiten'],
    params: (r) => pick3(r),
    build: ([a, b, c]) => ({
      prompt: `Das quadratische Beet an der Hypotenuse hat $${c * c}$ m², eines an einer Kathete $${a * a}$ m². Wie lang ist die Seite des dritten quadratischen Beets (in m)?`,
      answer: { kind: 'numeric', value: b, tolerance: 0.001, unit: 'm' },
      hints: [`Fläche des dritten Beets: $${c * c} - ${a * a}$`, `$= ${b * b}$ m²`, 'Seitenlänge = Wurzel aus der Fläche.'],
      solution: { steps: [{ text: 'Fläche und Seite:', math: `${c * c} - ${a * a} = ${b * b} \\;\\Rightarrow\\; \\sqrt{${b * b}} = ${b}` }], finalAnswer: `$${b}$ m` },
      commonMistakes: [{ description: 'Wurzel vergessen', feedback: 'Die Fläche ist $' + b * b + '$ m² – die Seite ist die Wurzel daraus.', answers: [String(b * b)] }],
    }),
  }),
];

/** Hypotenuse aus Katheten: ganzzahlig (Tripel) oder gerundet. */
function hypTemplate(id: string, sub: string, difficulty: 1 | 2 | 3, count: number, gen: (r: Rng) => [number, number], unit = 'cm') {
  return fromTemplate({
    id,
    subtopicId: sub,
    count,
    type: 'numeric',
    requirement: 'calculation',
    difficulty,
    objectives: OBJ,
    params: (r) => gen(r),
    build: ([a, b]) => {
      const c = Math.sqrt(a * a + b * b);
      const exact = Number.isInteger(round(c, 6));
      return {
        prompt: `Berechne die Hypotenuse $c$ für $a = ${num(a)}$ ${unit} und $b = ${num(b)}$ ${unit}.${exact ? '' : ' Runde auf eine Nachkommastelle.'}`,
        answer: { kind: 'numeric', value: c, tolerance: exact ? 0.001 : 0.06, unit },
        hints: ['$c = \\sqrt{a^2 + b^2}$', `$${sq(a)} + ${sq(b)} = ${num(a * a + b * b)}$`, 'Wurzel ziehen.'],
        solution: { steps: [{ text: 'Satz des Pythagoras:', math: `c = \\sqrt{${sq(a)} + ${sq(b)}} = \\sqrt{${num(a * a + b * b)}} ${exact ? `= ${num(c)}` : `\\approx ${num(round(c, 1), 1)}`}` }], finalAnswer: `$c ${exact ? '=' : '\\approx'} ${num(round(c, 1), 1)}$ ${unit}` },
        commonMistakes: [{ description: 'Wurzel vergessen', feedback: '$a^2 + b^2$ ist $c^2$ – zieh noch die Wurzel.', answers: [txt(a * a + b * b)] }, { description: 'Seiten addiert', feedback: 'Die Hypotenuse ist nicht $a + b$.', answers: [txt(a + b)] }],
      };
    },
  });
}

/** Kathete aus Hypotenuse und Kathete. */
function legTemplate(id: string, sub: string, difficulty: 1 | 2 | 3, count: number, gen: (r: Rng) => [number, number], unit = 'cm') {
  return fromTemplate({
    id,
    subtopicId: sub,
    count,
    type: 'numeric',
    requirement: 'calculation',
    difficulty,
    objectives: OBJ,
    params: (r) => gen(r),
    build: ([c, a]) => {
      const b = Math.sqrt(c * c - a * a);
      const exact = Number.isInteger(round(b, 6));
      return {
        prompt: `Gegeben sind die Hypotenuse $c = ${num(c)}$ ${unit} und die Kathete $a = ${num(a)}$ ${unit}. Berechne $b$.${exact ? '' : ' Runde auf eine Nachkommastelle.'}`,
        answer: { kind: 'numeric', value: b, tolerance: exact ? 0.001 : 0.06, unit },
        hints: ['$b = \\sqrt{c^2 - a^2}$', `$${sq(c)} - ${sq(a)} = ${num(c * c - a * a)}$`, 'Wurzel ziehen.'],
        solution: { steps: [{ text: 'Umgestellter Satz:', math: `b = \\sqrt{${sq(c)} - ${sq(a)}} = \\sqrt{${num(c * c - a * a)}} ${exact ? `= ${num(b)}` : `\\approx ${num(round(b, 1), 1)}`}` }], finalAnswer: `$b ${exact ? '=' : '\\approx'} ${num(round(b, 1), 1)}$ ${unit}` },
        commonMistakes: [{ description: 'Addiert statt subtrahiert', feedback: 'Für eine Kathete wird subtrahiert: $b^2 = c^2 - a^2$.', answers: [txt(round(Math.sqrt(c * c + a * a), 1))] }],
      };
    },
  });
}

const scaled = (r: Rng): [number, number, number] => {
  const [a, b, c] = pick3(r);
  const k = r.pick([1, 2, 3]);
  return [a * k, b * k, c * k];
};

const hypotenuse: AuthoredExercise[] = [
  ...hypTemplate('pyth-hy-tripel', 'pyth-hypotenuse', 1, 12, (r) => {
    const [a, b] = scaled(r);
    return [a, b];
  }),
  ...hypTemplate('pyth-hy-gerundet', 'pyth-hypotenuse', 2, 12, (r) => [r.int(2, 12), r.int(2, 12)]),
  ...hypTemplate('pyth-hy-dezimal', 'pyth-hypotenuse', 3, 8, (r) => [r.pick([1.5, 2.4, 3.2, 4.5, 5.6, 6.3]), r.pick([2.5, 3.6, 4.8, 7.2, 8.1])]),
  ...fromTemplate({
    id: 'pyth-hy-diagonale',
    subtopicId: 'pyth-hypotenuse',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Diagonalen berechnen'],
    params: (r) => {
      const [a, b] = scaled(r);
      return { a, b, thing: r.pick(['Ein rechteckiger Bildschirm', 'Ein Tischtennistisch (vereinfacht)', 'Eine rechteckige Wiese', 'Ein rechteckiges Fenster']), unit: r.pick(['cm', 'dm']) };
    },
    build: ({ a, b, thing, unit }) => {
      const c = Math.sqrt(a * a + b * b);
      return {
        prompt: `${thing} hat die Seitenlängen $${a}$ ${unit} und $${b}$ ${unit}. Wie lang ist die Diagonale (in ${unit})?`,
        answer: { kind: 'numeric', value: c, tolerance: 0.001, unit },
        hints: ['Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke.', 'Sie ist die Hypotenuse.', `$d = \\sqrt{${sq(a)} + ${sq(b)}}$`],
        solution: { steps: [{ text: 'Pythagoras:', math: `d = \\sqrt{${sq(a)} + ${sq(b)}} = \\sqrt{${a * a + b * b}} = ${num(c)}` }], finalAnswer: `$${num(c)}$ ${unit}` },
        commonMistakes: [{ description: 'Wurzel vergessen', feedback: 'Zieh am Ende die Wurzel.', answers: [String(a * a + b * b)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-hy-abkuerzung',
    subtopicId: 'pyth-hypotenuse',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Diagonalen berechnen'],
    params: (r) => scaled(r).map((v) => v * 10) as [number, number, number],
    build: ([a, b, c]) => ({
      prompt: `Ein rechteckiger Platz ist $${a}$ m lang und $${b}$ m breit. Wie viele Meter spart man, wenn man diagonal über den Platz geht statt außen an zwei Seiten entlang?`,
      answer: { kind: 'numeric', value: a + b - c, tolerance: 0.001, unit: 'm' },
      hints: [`Außen herum: $${a} + ${b} = ${a + b}$ m`, `Diagonal: $\\sqrt{${sq(a)} + ${sq(b)}}$`, 'Differenz bilden.'],
      solution: { steps: [{ text: 'Diagonale:', math: `d = \\sqrt{${sq(a)} + ${sq(b)}} = ${c}` }, { text: 'Ersparnis:', math: `${a + b} - ${c} = ${a + b - c}` }], finalAnswer: `$${a + b - c}$ m` },
      commonMistakes: [{ description: 'Nur die Diagonale berechnet', feedback: 'Gefragt ist die Ersparnis: Umweg minus Diagonale.', answers: [String(c)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-hy-punkte',
    subtopicId: 'pyth-hypotenuse',
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Abstand zweier Punkte'],
    params: (r) => {
      const [dx, dy] = pick3(r);
      const x1 = r.int(-5, 5);
      const y1 = r.int(-5, 5);
      return { x1, y1, x2: x1 + dx * r.sign(), y2: y1 + dy * r.sign() };
    },
    build: ({ x1, y1, x2, y2 }) => {
      const d = Math.hypot(x2 - x1, y2 - y1);
      return {
        prompt: `Wie weit sind die Punkte $A(${x1}\\,|\\,${y1})$ und $B(${x2}\\,|\\,${y2})$ im Koordinatensystem voneinander entfernt (in Längeneinheiten)?`,
        answer: { kind: 'numeric', value: d, tolerance: 0.001 },
        hints: ['Zeichne ein Steigungsdreieck – es ist rechtwinklig.', `Katheten: $|${x2} - ${x1 < 0 ? `(${x1})` : x1}| = ${Math.abs(x2 - x1)}$ und $|${y2} - ${y1 < 0 ? `(${y1})` : y1}| = ${Math.abs(y2 - y1)}$`, 'Die Strecke $AB$ ist die Hypotenuse.'],
        solution: { steps: [{ text: 'Pythagoras:', math: `\\overline{AB} = \\sqrt{${sq(Math.abs(x2 - x1))} + ${sq(Math.abs(y2 - y1))}} = ${num(d)}` }], finalAnswer: `$${num(d)}$` },
        commonMistakes: [{ description: 'Differenzen addiert', feedback: 'Die Entfernung ist die Hypotenuse, nicht die Summe der Katheten.', answers: [String(Math.abs(x2 - x1) + Math.abs(y2 - y1))] }],
      };
    },
  }),
];

const kathete: AuthoredExercise[] = [
  ...legTemplate('pyth-ka-tripel', 'pyth-kathete', 1, 12, (r) => {
    const [a, , c] = scaled(r);
    return [c, a];
  }),
  ...legTemplate('pyth-ka-gerundet', 'pyth-kathete', 2, 12, (r) => {
    const c = r.int(6, 20);
    return [c, r.int(2, c - 1)];
  }),
  ...legTemplate('pyth-ka-dezimal', 'pyth-kathete', 3, 8, (r) => [r.pick([6.5, 7.5, 8.4, 9.6, 12.5]), r.pick([2.5, 3.2, 4.4, 5.1])]),
  ...fromTemplate({
    id: 'pyth-ka-leiter',
    subtopicId: 'pyth-kathete',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Kathete im Sachzusammenhang'],
    params: (r) => ({ L: r.pick([3, 4, 5, 6, 7, 8]), a: r.pick([0.8, 1, 1.2, 1.5, 2]) }),
    build: ({ L, a }) => {
      const h = Math.sqrt(L * L - a * a);
      return {
        prompt: `Eine $${L}$ m lange Leiter lehnt an einer Wand. Ihr Fuß steht $${num(a)}$ m von der Wand entfernt. In welcher Höhe berührt sie die Wand? Runde auf zwei Nachkommastellen.`,
        answer: { kind: 'numeric', value: h, tolerance: 0.006, unit: 'm' },
        hints: ['Die Leiter ist die Hypotenuse.', `$h = \\sqrt{${sq(L)} - ${sq(a)}}$`, `$${L * L} - ${num(a * a)} = ${num(L * L - a * a)}$`],
        solution: { steps: [{ text: 'Kathete berechnen:', math: `h = \\sqrt{${sq(L)} - ${sq(a)}} = \\sqrt{${num(L * L - a * a)}} \\approx ${num(round(h, 2))}` }], finalAnswer: `$\\approx ${num(round(h, 2))}$ m` },
        commonMistakes: [{ description: 'Addiert', feedback: 'Die Leiter ist die längste Seite – subtrahieren.', answers: [txt(round(Math.sqrt(L * L + a * a), 2))] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-ka-rampe',
    subtopicId: 'pyth-kathete',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Kathete im Sachzusammenhang'],
    params: (r) => ({ s: r.pick([4, 5, 6, 8, 10]), h: r.pick([0.3, 0.4, 0.5, 0.6, 0.8]) }),
    build: ({ s, h }) => {
      const w = Math.sqrt(s * s - h * h);
      return {
        prompt: `Eine Rampe ist $${s}$ m lang (schräge Fläche) und überwindet $${num(h)}$ m Höhe. Wie weit reicht sie waagerecht? Runde auf zwei Nachkommastellen.`,
        answer: { kind: 'numeric', value: w, tolerance: 0.006, unit: 'm' },
        hints: ['Die schräge Rampe ist die Hypotenuse.', `$w = \\sqrt{${sq(s)} - ${sq(h)}}$`, 'Wurzel ziehen und runden.'],
        solution: { steps: [{ text: 'Kathete:', math: `w = \\sqrt{${sq(s)} - ${sq(h)}} \\approx ${num(round(w, 2))}` }], finalAnswer: `$\\approx ${num(round(w, 2))}$ m` },
        commonMistakes: [{ description: 'Höhe einfach abgezogen', feedback: 'Es werden die Quadrate abgezogen, nicht die Längen.', answers: [txt(s - h)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-ka-rechnung',
    subtopicId: 'pyth-kathete',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: OBJ,
    params: (r) => scaled(r),
    build: ([a, b, c], r) => {
      const right = `$\\sqrt{${c}^2 - ${a}^2}$`;
      const { choices, correctId } = shuffledChoices(r, right, [`$\\sqrt{${c}^2 + ${a}^2}$`, `$${c} - ${a}$`, `$\\sqrt{${a}^2 - ${c}^2}$`]);
      return {
        prompt: `Ein rechtwinkliges Dreieck hat die Hypotenuse $${c}$ cm und eine Kathete $${a}$ cm. Welche Rechnung liefert die andere Kathete?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['$a^2 + b^2 = c^2$ nach $b$ umstellen.', '$b^2 = c^2 - a^2$', 'Hypotenuse zuerst.'],
        solution: { steps: [{ text: `$b = \\sqrt{${c}^2 - ${a}^2} = ${b}$` }], finalAnswer: right },
        commonMistakes: [{ description: 'Addiert', feedback: 'Für eine Kathete wird die Hypotenuse quadriert und die bekannte Kathete abgezogen.' }],
      };
    },
  }),
];

const umkehrung: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-uk-pruefen',
    subtopicId: 'pyth-umkehrung',
    count: 12,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 1,
    objectives: ['Umkehrung des Satzes anwenden'],
    params: (r) => {
      const [a, b, c] = scaled(r);
      const ok = r.int(0, 1) === 1;
      return { a, b, c: ok ? c : c + r.pick([1, -1, 2]) };
    },
    build: ({ a, b, c }) => {
      const ok = a * a + b * b === c * c;
      return {
        prompt: `Ein Dreieck hat die Seiten $${a}$ cm, $${b}$ cm und $${c}$ cm. Ist es rechtwinklig?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: ['Prüfe, ob $a^2 + b^2 = c^2$ für die längste Seite $c$ gilt.', `$${sq(a)} + ${sq(b)} = ${a * a + b * b}$`, `$${sq(c)} = ${c * c}$`],
        solution: { steps: [{ text: 'Vergleich:', math: `${a * a + b * b} ${ok ? '=' : '\\neq'} ${c * c}` }, { text: ok ? 'Gleich ⇒ rechtwinklig.' : 'Ungleich ⇒ nicht rechtwinklig.' }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Nicht mit der längsten Seite verglichen', feedback: 'Auf der rechten Seite steht immer das Quadrat der längsten Seite.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-uk-summe',
    subtopicId: 'pyth-umkehrung',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Umkehrung des Satzes anwenden'],
    params: (r) => ({ a: r.int(3, 20), b: r.int(3, 25) }),
    build: ({ a, b }) => ({
      prompt: `Für die Prüfung, ob ein Dreieck rechtwinklig ist, brauchst du $a^2 + b^2$. Berechne es für $a = ${a}$ und $b = ${b}$.`,
      answer: { kind: 'numeric', value: a * a + b * b, tolerance: 0.001 },
      hints: [`$${a}^2 = ${a * a}$`, `$${b}^2 = ${b * b}$`, 'Addieren.'],
      solution: { steps: [{ text: 'Rechnen:', math: `${sq(a)} + ${sq(b)} = ${a * a} + ${b * b} = ${a * a + b * b}` }], finalAnswer: `$${a * a + b * b}$` },
      commonMistakes: [{ description: 'Summe quadriert', feedback: '$a^2 + b^2$ ist nicht $(a + b)^2$.', answers: [String((a + b) ** 2)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-uk-auswahl',
    subtopicId: 'pyth-umkehrung',
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: ['Umkehrung des Satzes anwenden'],
    params: (r) => ({ t: scaled(r), u: r.pick([[4, 5, 6], [5, 6, 8], [6, 7, 9], [7, 8, 10], [5, 7, 9], [8, 9, 12]]) as number[], v: r.int(1, 2) }),
    build: ({ t: [a, b, c], u, v }, r) => {
      const right = `$${a}$, $${b}$, $${c}$`;
      const { choices, correctId } = shuffledChoices(r, right, [`$${u[0]}$, $${u[1]}$, $${u[2]}$`, `$${a}$, $${b}$, $${c + v}$`, `$${a + v}$, $${b}$, $${c}$`]);
      return {
        prompt: 'Welche Seitenlängen (in cm) ergeben ein rechtwinkliges Dreieck?',
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Prüfe für jede Auswahl $a^2 + b^2 = c^2$ mit der längsten Seite $c$.', 'Quadrate der beiden kürzeren Seiten addieren.', 'Mit dem Quadrat der längsten vergleichen.'],
        solution: { steps: [{ text: `$${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$ ⇒ rechtwinklig.` }], finalAnswer: right },
        commonMistakes: [{ description: 'Ungeprüft gewählt', feedback: 'Rechne für jede Auswahl nach – „fast“ reicht nicht.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-uk-dezimal',
    subtopicId: 'pyth-umkehrung',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 3,
    objectives: ['Umkehrung des Satzes anwenden'],
    params: (r) => {
      const [a, b, c] = pick3(r);
      const k = r.pick([0.5, 1.5, 2.5, 0.2]);
      const ok = r.int(0, 1) === 1;
      return { a: a * k, b: b * k, c: ok ? c * k : c * k + 0.1 };
    },
    build: ({ a, b, c }) => {
      const ok = Math.abs(a * a + b * b - c * c) < 1e-9;
      return {
        prompt: `Ein Dreieck hat die Seiten $${num(a)}$ m, $${num(b)}$ m und $${num(c)}$ m. Ist es rechtwinklig?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: ['Umkehrung: Gilt $a^2 + b^2 = c^2$?', `$${sq(a)} + ${sq(b)} = ${num(a * a + b * b, 4)}$`, `$${sq(c)} = ${num(c * c, 4)}$`],
        solution: { steps: [{ text: 'Vergleich:', math: `${num(a * a + b * b, 4)} ${ok ? '=' : '\\neq'} ${num(c * c, 4)}` }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Gerundet verglichen', feedback: 'Vergleiche genau – schon kleine Unterschiede bedeuten „nicht rechtwinklig“.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-uk-ecke',
    subtopicId: 'pyth-umkehrung',
    count: 10,
    type: 'multiple-choice',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Umkehrung im Alltag'],
    params: (r) => {
      const [a, b, c] = pick3(r);
      const k = r.pick([0.1, 0.2, 0.5, 1]);
      const ok = r.int(0, 1) === 1;
      return { a: round(a * k, 2), b: round(b * k, 2), c: round(ok ? c * k : c * k + r.pick([0.1, -0.1, 0.2]), 2), who: r.pick(['Eine Gärtnerin', 'Ein Maurer', 'Ein Tischler', 'Eine Fliesenlegerin']) };
    },
    build: ({ a, b, c, who }) => {
      const ok = Math.abs(a * a + b * b - c * c) < 1e-9;
      return {
        prompt: `${who} prüft eine Ecke: Auf der einen Kante misst ${who.startsWith('Eine') ? 'sie' : 'er'} $${num(a)}$ m, auf der anderen $${num(b)}$ m ab. Die Diagonale zwischen den Markierungen ist $${num(c)}$ m lang. Ist die Ecke rechtwinklig?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: ['Umkehrung des Satzes des Pythagoras.', `$${sq(a)} + ${sq(b)} = ${num(a * a + b * b, 4)}$`, `Vergleiche mit $${sq(c)} = ${num(c * c, 4)}$.`],
        solution: { steps: [{ text: 'Prüfen:', math: `${num(a * a + b * b, 4)} ${ok ? '=' : '\\neq'} ${num(c * c, 4)}` }, { text: ok ? 'Die Ecke ist rechtwinklig.' : 'Die Ecke ist nicht rechtwinklig.' }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Ohne Rechnung entschieden', feedback: 'Rechne die Quadrate genau nach.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-uk-diagonale',
    subtopicId: 'pyth-umkehrung',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Umkehrung im Alltag'],
    params: (r) => scaled(r),
    build: ([a, b, c]) => ({
      prompt: `Für ein rechteckiges Beet werden zwei Seiten von $${a}$ dm und $${b}$ dm abgesteckt. Wie lang muss die Diagonale sein, damit die Ecke genau rechtwinklig ist (in dm)?`,
      answer: { kind: 'numeric', value: c, tolerance: 0.001, unit: 'dm' },
      hints: ['Rechtwinklig ⇒ Pythagoras gilt.', `$d = \\sqrt{${sq(a)} + ${sq(b)}}$`, `$${a * a} + ${b * b} = ${c * c}$`],
      solution: { steps: [{ text: 'Diagonale:', math: `d = \\sqrt{${a * a + b * b}} = ${c}` }], finalAnswer: `$${c}$ dm` },
      commonMistakes: [{ description: 'Seiten addiert', feedback: 'Die Diagonale ist kürzer als beide Seiten zusammen.', answers: [String(a + b)] }],
    }),
  }),
];

const anwendung: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-aw-diagonale',
    subtopicId: 'pyth-anwendung',
    count: 12,
    type: 'numeric',
    requirement: 'application',
    difficulty: 1,
    objectives: [...OBJ, 'Sachaufgaben'],
    params: (r) => {
      const [a, b] = scaled(r);
      return { a, b, thing: r.pick(['Ein Fußballtor (Rechteck aus Breite und Höhe, vereinfacht in dm)', 'Ein Bilderrahmen (in cm)', 'Eine Tischplatte (in cm)', 'Ein Handy-Display (in mm)']) };
    },
    build: ({ a, b, thing }) => {
      const unit = thing.match(/in (\w+)\)/)![1];
      return {
        prompt: `${thing} ist $${a}$ ${unit} breit und $${b}$ ${unit} hoch. Wie lang ist die Diagonale (in ${unit})?`,
        answer: { kind: 'numeric', value: Math.sqrt(a * a + b * b), tolerance: 0.001, unit },
        hints: ['Die Diagonale ist die Hypotenuse.', `$d = \\sqrt{${sq(a)} + ${sq(b)}}$`, `$${a * a + b * b}$`],
        solution: { steps: [{ text: 'Pythagoras:', math: `d = \\sqrt{${a * a + b * b}} = ${num(Math.sqrt(a * a + b * b))}` }], finalAnswer: `$${num(Math.sqrt(a * a + b * b))}$ ${unit}` },
        commonMistakes: [{ description: 'Wurzel vergessen', feedback: 'Zieh am Ende die Wurzel.', answers: [String(a * a + b * b)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-aw-leiter',
    subtopicId: 'pyth-anwendung',
    count: 12,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Sachaufgaben'],
    params: (r) => ({ L: r.pick([2.5, 3, 3.5, 4, 5, 6]), h: r.pick([2, 2.4, 2.8, 3, 3.2, 4.5]) }),
    build: ({ L, h }) => {
      const hh = Math.min(h, L - 0.3);
      const a = Math.sqrt(L * L - hh * hh);
      return {
        prompt: `Eine $${num(L)}$ m lange Leiter soll eine Wand in $${num(hh)}$ m Höhe erreichen. Wie weit muss ihr Fuß von der Wand entfernt stehen? Runde auf zwei Nachkommastellen.`,
        answer: { kind: 'numeric', value: a, tolerance: 0.006, unit: 'm' },
        hints: ['Leiter = Hypotenuse.', `$a = \\sqrt{${sq(L)} - ${sq(hh)}}$`, 'Wurzel ziehen, runden.'],
        solution: { steps: [{ text: 'Kathete:', math: `a = \\sqrt{${sq(L)} - ${sq(hh)}} \\approx ${num(round(a, 2))}` }], finalAnswer: `$\\approx ${num(round(a, 2))}$ m` },
        commonMistakes: [{ description: 'Addiert', feedback: 'Die Leiter ist die längste Seite – subtrahieren.', answers: [txt(round(Math.sqrt(L * L + hh * hh), 2))] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-aw-rampe',
    subtopicId: 'pyth-anwendung',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Sachaufgaben'],
    params: (r) => ({ w: r.pick([3, 4, 5, 6, 8]), h: r.pick([0.4, 0.5, 0.6, 1, 1.2]), what: r.pick(['eine Skaterrampe', 'eine Rollstuhlrampe', 'eine Fahrradrampe']) }),
    build: ({ w, h, what }) => {
      const s = Math.sqrt(w * w + h * h);
      return {
        prompt: `Für ${what} wird auf $${w}$ m waagerechter Strecke eine Höhe von $${num(h)}$ m überwunden. Wie lang ist die schräge Fläche? Runde auf zwei Nachkommastellen.`,
        answer: { kind: 'numeric', value: s, tolerance: 0.006, unit: 'm' },
        hints: ['Die schräge Fläche ist die Hypotenuse.', `$s = \\sqrt{${sq(w)} + ${sq(h)}}$`, 'Wurzel ziehen.'],
        solution: { steps: [{ text: 'Hypotenuse:', math: `s = \\sqrt{${sq(w)} + ${sq(h)}} \\approx ${num(round(s, 2))}` }], finalAnswer: `$\\approx ${num(round(s, 2))}$ m` },
        commonMistakes: [{ description: 'Längen addiert', feedback: 'Die Hypotenuse ist kürzer als beide Katheten zusammen.', answers: [txt(w + h)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-aw-feld',
    subtopicId: 'pyth-anwendung',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Sachaufgaben'],
    params: (r) => ({ a: r.pick([60, 80, 100, 120, 150]), b: r.pick([40, 50, 70, 90]) }),
    build: ({ a, b }) => {
      const d = Math.sqrt(a * a + b * b);
      return {
        prompt: `Ein Feld ist $${a}$ m lang und $${b}$ m breit. Ein Hund läuft diagonal hinüber, sein Besitzer außen herum an zwei Seiten entlang. Wie viele Meter läuft der Besitzer mehr? Runde auf eine Nachkommastelle.`,
        answer: { kind: 'numeric', value: a + b - d, tolerance: 0.06, unit: 'm' },
        hints: [`Umweg: $${a + b}$ m`, `Diagonale: $\\sqrt{${sq(a)} + ${sq(b)}}$`, 'Differenz.'],
        solution: { steps: [{ text: 'Diagonale:', math: `d = \\sqrt{${a * a + b * b}} \\approx ${num(round(d, 2))}` }, { text: 'Unterschied:', math: `${a + b} - ${num(round(d, 2))} \\approx ${num(round(a + b - d, 1), 1)}` }], finalAnswer: `$\\approx ${num(round(a + b - d, 1), 1)}$ m` },
        commonMistakes: [{ description: 'Nur die Diagonale', feedback: 'Gefragt ist der Unterschied der beiden Wege.', answers: [txt(round(d, 1), 1)] }],
      };
    },
  }),
  ...hypTemplate('pyth-aw-rechnen', 'pyth-anwendung', 1, 8, (r) => {
    const [a, b] = scaled(r);
    return [a, b];
  }, 'm'),
  ...fromTemplate({
    id: 'pyth-aw-tuer',
    subtopicId: 'pyth-anwendung',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: [...OBJ, 'Sachaufgaben'],
    params: (r) => ({ w: r.pick([0.8, 0.9, 1]), h: r.pick([2, 2.1]), L: r.pick([2.1, 2.2, 2.25, 2.3, 2.4]) }),
    build: ({ w, h, L }) => {
      const d = Math.sqrt(w * w + h * h);
      const ok = L <= d;
      return {
        prompt: `Eine Tür ist $${num(w)}$ m breit und $${num(h)}$ m hoch. Passt eine $${num(L)}$ m breite, sehr dünne Platte schräg (diagonal) durch die Türöffnung?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: ['Berechne die Diagonale der Türöffnung.', `$d = \\sqrt{${sq(w)} + ${sq(h)}}$`, `Vergleiche $d$ mit $${num(L)}$ m.`],
        solution: { steps: [{ text: 'Diagonale:', math: `d = \\sqrt{${sq(w)} + ${sq(h)}} \\approx ${num(round(d, 3), 3)}` }, { text: ok ? 'Die Platte ist nicht länger als die Diagonale – sie passt.' : 'Die Platte ist länger als die Diagonale – sie passt nicht.' }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Nur mit der Höhe verglichen', feedback: 'Schräg steht die Diagonale zur Verfügung – die ist länger als die Höhe.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
];

const gemischt: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'pyth-gm-quadrat',
    subtopicId: 'pyth-gemischt',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Diagonale im Quadrat'],
    params: (r) => ({ a: r.pick([2, 3, 4, 6, 7, 8, 9, 10, 12, 15]) }),
    build: ({ a }) => ({
      prompt: `Wie lang ist die Diagonale eines Quadrats mit der Seitenlänge $${a}$ cm? Runde auf eine Nachkommastelle.`,
      answer: { kind: 'numeric', value: a * Math.SQRT2, tolerance: 0.06, unit: 'cm' },
      hints: ['Die Diagonale teilt das Quadrat in zwei rechtwinklige Dreiecke.', `$d = \\sqrt{${sq(a)} + ${sq(a)}}$`, `$= ${a}\\sqrt{2}$`],
      solution: { steps: [{ text: 'Pythagoras:', math: `d = \\sqrt{${a * a} + ${a * a}} = ${a}\\sqrt{2} \\approx ${num(round(a * Math.SQRT2, 1), 1)}` }], finalAnswer: `$\\approx ${num(round(a * Math.SQRT2, 1), 1)}$ cm` },
      commonMistakes: [{ description: 'Seite verdoppelt', feedback: 'Die Diagonale ist $a\\sqrt{2} \\approx 1{,}41a$, nicht $2a$.', answers: [String(2 * a)] }],
    }),
  }),
  ...fromTemplate({
    id: 'pyth-gm-hoehe',
    subtopicId: 'pyth-gemischt',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Höhe im gleichseitigen Dreieck'],
    params: (r) => ({ a: r.pick([2, 4, 5, 8, 10, 12, 3, 7, 9, 14]) }),
    build: ({ a }) => {
      const h = (a / 2) * Math.sqrt(3);
      return {
        prompt: `Berechne die Höhe eines gleichseitigen Dreiecks mit der Seitenlänge $${a}$ cm. Runde auf eine Nachkommastelle.`,
        answer: { kind: 'numeric', value: h, tolerance: 0.06, unit: 'cm' },
        hints: ['Die Höhe teilt das Dreieck in zwei rechtwinklige Hälften.', `Hypotenuse $${a}$, Kathete $${num(a / 2)}$`, `$h = \\sqrt{${sq(a)} - ${sq(a / 2)}}$`],
        solution: { steps: [{ text: 'Kathete berechnen:', math: `h = \\sqrt{${a * a} - ${num((a / 2) ** 2)}} \\approx ${num(round(h, 1), 1)}` }], finalAnswer: `$\\approx ${num(round(h, 1), 1)}$ cm` },
        commonMistakes: [{ description: 'Mit ganzer Seite gerechnet', feedback: 'Die Höhe trifft die Grundseite in der Mitte – nimm die halbe Seite.', answers: ['0'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-gm-raum',
    subtopicId: 'pyth-gemischt',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 3,
    objectives: [...OBJ, 'Raumdiagonale'],
    params: (r) => r.pick([[2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [6, 6, 7], [2, 10, 11], [3, 4, 12], [2, 5, 14], [4, 8, 19], [6, 10, 15], [3, 6, 9], [5, 5, 5]] as const),
    build: ([a, b, c]) => {
      const d = Math.sqrt(a * a + b * b + c * c);
      const exact = Number.isInteger(round(d, 6));
      return {
        prompt: `Ein Quader hat die Kanten $${a}$ cm, $${b}$ cm und $${c}$ cm. Wie lang ist seine Raumdiagonale?${exact ? '' : ' Runde auf eine Nachkommastelle.'}`,
        answer: { kind: 'numeric', value: d, tolerance: exact ? 0.001 : 0.06, unit: 'cm' },
        hints: ['Erst die Diagonale der Grundfläche, dann die Raumdiagonale.', `$d = \\sqrt{${sq(a)} + ${sq(b)} + ${sq(c)}}$`, `$${a * a} + ${b * b} + ${c * c} = ${a * a + b * b + c * c}$`],
        solution: { steps: [{ text: 'Zweimal Pythagoras:', math: `d = \\sqrt{${a * a} + ${b * b} + ${c * c}} = \\sqrt{${a * a + b * b + c * c}} ${exact ? '=' : '\\approx'} ${num(round(d, 1), 1)}` }], finalAnswer: `$${exact ? '' : '\\approx '}${num(round(d, 1), 1)}$ cm` },
        commonMistakes: [{ description: 'Nur Flächendiagonale', feedback: 'Die Raumdiagonale braucht alle drei Kanten.', answers: [txt(round(Math.sqrt(a * a + b * b), 1), 1)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-gm-kiste',
    subtopicId: 'pyth-gemischt',
    count: 8,
    type: 'multiple-choice',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Raumdiagonale'],
    params: (r) => ({ k: r.pick([[30, 40, 120], [20, 30, 60], [40, 40, 70], [30, 60, 90]] as const), L: r.pick([70, 80, 100, 110, 120, 130, 140]) }),
    build: ({ k: [a, b, c], L }) => {
      const d = Math.sqrt(a * a + b * b + c * c);
      const ok = L <= d;
      return {
        prompt: `Passt ein $${L}$ cm langer, dünner Stab in eine Kiste mit den Innenmaßen $${a}$ cm × $${b}$ cm × $${c}$ cm?`,
        choices: YES_NO,
        answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
        hints: ['Der längste Platz in der Kiste ist die Raumdiagonale.', `$d = \\sqrt{${sq(a)} + ${sq(b)} + ${sq(c)}}$`, `Vergleiche mit $${L}$ cm.`],
        solution: { steps: [{ text: 'Raumdiagonale:', math: `d = \\sqrt{${a * a + b * b + c * c}} \\approx ${num(round(d, 1), 1)}` }, { text: ok ? 'Der Stab passt.' : 'Der Stab ist zu lang.' }], finalAnswer: ok ? 'Ja' : 'Nein' },
        commonMistakes: [{ description: 'Nur die längste Kante verglichen', feedback: 'Schräg in der Kiste ist mehr Platz als entlang einer Kante.', answers: [ok ? 'b' : 'a'] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'pyth-gm-flaeche',
    subtopicId: 'pyth-gemischt',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Flächen mit Pythagoras'],
    params: (r) => scaled(r),
    build: ([a, b, c]) => ({
      prompt: `Ein rechteckiges Grundstück hat eine Diagonale von $${c}$ m, eine Seite ist $${a}$ m lang. Wie groß ist seine Fläche (in m²)?`,
      answer: { kind: 'numeric', value: a * b, tolerance: 0.001, unit: 'm²' },
      hints: ['Berechne zuerst die zweite Seite.', `$b = \\sqrt{${sq(c)} - ${sq(a)}} = ${b}$`, `Fläche $= ${a} \\cdot ${b}$`],
      solution: { steps: [{ text: 'Zweite Seite:', math: `b = \\sqrt{${c * c} - ${a * a}} = ${b}` }, { text: 'Fläche:', math: `A = ${a} \\cdot ${b} = ${a * b}` }], finalAnswer: `$${a * b}$ m²` },
      commonMistakes: [{ description: 'Diagonale als Seite genommen', feedback: 'Die Diagonale ist keine Seite – berechne erst die zweite Seite.', answers: [String(a * c)] }],
    }),
  }),
  ...hypTemplate('pyth-gm-basis', 'pyth-gemischt', 1, 10, (r) => {
    const [a, b] = scaled(r);
    return [a, b];
  }),
];

export const POOL: Record<string, AuthoredExercise[]> = {
  'pyth-grundlagen': grundlagen,
  'pyth-erkennen': erkennen,
  'pyth-herleitung': herleitung,
  'pyth-hypotenuse': hypotenuse,
  'pyth-kathete': kathete,
  'pyth-umkehrung': umkehrung,
  'pyth-anwendung': anwendung,
  'pyth-gemischt': gemischt,
};
