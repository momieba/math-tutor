/**
 * Prozentrechnung, Klasse 6: Anteile in drei Schreibweisen und einfache Prozentangaben deuten.
 * KI-Entwurf (ADR-0002) – fachliche Freigabe im Pull Request. Zahlen kommen aus Vorlagen und werden gerechnet.
 * Die Kapitel stehen hinten im Thema (Positionen 4 und 5), damit vorhandene IDs und Positionen unverändert bleiben.
 */
import type { AuthoredExercise, AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';
import { nrwGym, videoPlaceholder } from '../helpers';
import { fromTemplate, num, shuffledChoices, txt } from '../templates';

const T = 'prozentrechnung';
const A = 'prozent-anteile';
const D = 'prozent-deuten';

type Frac = readonly [number, number];
/** Brüche mit endlicher Dezimalzahl und „glattem“ Prozentsatz. */
const NICE: Frac[] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 25], [1, 8], [3, 8]];
const pct = ([z, n]: Frac) => (z / n) * 100;
const frac = ([z, n]: Frac) => `\\frac{${z}}{${n}}`;
const dec = ([z, n]: Frac) => num(z / n, 4);
const pctTex = (p: number) => `${num(p)}\\,\\%`;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// ================================================================ Kapitel 4: Anteile als Bruch, Dezimalzahl und Prozent

const anteileExercises: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'prz-an-anzahl',
    subtopicId: A,
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Anteile in Prozent angeben'],
    params: (r) => {
      const n = r.pick([10, 20, 25, 50]);
      return { n, k: r.int(1, n - 1), ctx: r.pick([['Kugeln in einer Tüte', 'rot'], ['Kästchen', 'gefärbt'], ['Murmeln', 'blau'], ['Bonbons', 'sauer']] as const) };
    },
    build: ({ n, k, ctx: [things, adj] }) => {
      const f = 100 / n;
      const p = k * f;
      return {
        prompt: `Von $${n}$ ${things} sind $${k}$ ${adj}. Wie viel Prozent sind das?`,
        answer: { kind: 'numeric', value: p, tolerance: 0.0001, unit: '%' },
        hints: ['Schreibe den Anteil als Bruch: Teil durch Ganzes.', `$\\frac{${k}}{${n}}$ – erweitere auf den Nenner $100$.`, `Erweitere mit $${f}$.`],
        solution: {
          steps: [
            { text: 'Anteil als Bruch (Teil durch Ganzes):', math: `\\frac{${k}}{${n}}` },
            { text: `Auf Hundertstel erweitern (Zähler und Nenner mal $${f}$):`, math: `\\frac{${k}}{${n}} = \\frac{${p}}{100} = ${p}\\,\\%` },
          ],
          finalAnswer: `$${p}\\,\\%$`,
        },
        commonMistakes: [{ description: 'Anzahl als Prozentsatz gelesen', feedback: 'Die Anzahl allein ist noch kein Prozentsatz – setze sie erst ins Verhältnis zum Ganzen.', answers: [String(k)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-bruch',
    subtopicId: A,
    count: 10,
    type: 'multiple-choice',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Bruch und Dezimalzahl zuordnen'],
    params: (_r, i) => NICE[i],
    build: (f, r) => {
      const others = r.shuffle(NICE.filter((g) => pct(g) !== pct(f))).slice(0, 3);
      const { choices, correctId } = shuffledChoices(r, `$${frac(f)}$`, others.map((g) => `$${frac(g)}$`));
      return {
        prompt: `Welcher Bruch gehört zur Dezimalzahl $${dec(f)}$?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Ein Bruch ist eine Division: Zähler geteilt durch Nenner.', 'Rechne für jeden Bruch Zähler durch Nenner.', `Welcher Bruch ergibt $${dec(f)}$?`],
        solution: { steps: [{ text: 'Zähler durch Nenner teilen:', math: `${frac(f)} = ${f[0]} : ${f[1]} = ${dec(f)}` }], finalAnswer: `$${frac(f)}$` },
        commonMistakes: [{ description: 'Bruch und Dezimalzahl falsch zugeordnet', feedback: 'Teile den Zähler durch den Nenner und vergleiche mit der Dezimalzahl.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-groesster',
    subtopicId: A,
    count: 10,
    type: 'multiple-choice',
    requirement: 'calculation',
    difficulty: 2,
    objectives: ['Anteile vergleichen'],
    params: (r) => ({ fs: r.shuffle(NICE).slice(0, 4), forms: r.shuffle(['bruch', 'dezimal', 'prozent', 'bruch'] as const) }),
    build: ({ fs, forms }, r) => {
      const shown = fs.map((f, i) => ({ f, tex: forms[i] === 'bruch' ? frac(f) : forms[i] === 'dezimal' ? dec(f) : pctTex(pct(f)) }));
      const max = shown.reduce((a, b) => (pct(b.f) > pct(a.f) ? b : a));
      const { choices, correctId } = shuffledChoices(r, `$${max.tex}$`, shown.filter((s) => s !== max).map((s) => `$${s.tex}$`));
      return {
        prompt: 'Welcher Anteil ist am größten?',
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Bring alle Anteile in dieselbe Schreibweise.', 'Am einfachsten ist Prozent: Bruch → Zähler durch Nenner → mal $100$.', 'Vergleiche dann die Prozentsätze.'],
        solution: {
          steps: [
            { text: 'Alle Anteile in Prozent umrechnen:', math: shown.map((s) => (s.tex === pctTex(pct(s.f)) ? s.tex : `${s.tex} = ${pctTex(pct(s.f))}`)).join(',\\quad ') },
            { text: `Der größte Prozentsatz ist $${pctTex(pct(max.f))}$, also ist $${max.tex}$ am größten.` },
          ],
          finalAnswer: `$${max.tex}$`,
        },
        commonMistakes: [{ description: 'Schreibweisen direkt verglichen', feedback: 'Zahlen in verschiedenen Schreibweisen lassen sich nicht direkt vergleichen – rechne erst alle in Prozent um.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-klassen',
    subtopicId: A,
    count: 10,
    type: 'multiple-choice',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Anteile vergleichen'],
    params: (r) => {
      const [n1, n2] = r.shuffle([10, 20, 25, 50]).slice(0, 2);
      const k1 = r.int(1, n1 - 1);
      const p1 = (k1 * 100) / n1;
      const same = r.int(1, 5) === 1 && Number.isInteger((p1 * n2) / 100);
      const k2 = same ? (p1 * n2) / 100 : r.int(1, n2 - 1);
      return { n1, n2, k1, k2, ctx: r.pick([['haben', 'ein Haustier'], ['spielen', 'ein Instrument'], ['sind', 'im Sportverein'], ['fahren', 'mit dem Rad zur Schule']] as const) };
    },
    build: ({ n1, n2, k1, k2, ctx: [verb, rest] }, r) => {
      const p1 = (k1 * 100) / n1;
      const p2 = (k2 * 100) / n2;
      const label = (a: number, b: number) => (a > b ? 'in der 6a' : b > a ? 'in der 6b' : 'in beiden gleich');
      const correct = label(p1, p2);
      const { choices, correctId } = shuffledChoices(r, correct, ['in der 6a', 'in der 6b', 'in beiden gleich']);
      const byCount = choices.find((c) => c.label === label(k1, k2))!.id;
      return {
        prompt: `In der 6a ${verb} $${k1}$ von $${n1}$ Kindern ${rest}, in der 6b $${k2}$ von $${n2}$ Kindern. In welcher Klasse ist der Anteil größer?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Die Klassen sind verschieden groß – vergleiche nicht die Anzahlen.', 'Berechne für jede Klasse den Anteil in Prozent.', `$\\frac{${k1}}{${n1}}$ und $\\frac{${k2}}{${n2}}$ in Prozent umrechnen.`],
        solution: {
          steps: [
            { text: 'Beide Anteile in Prozent:', math: `\\text{6a: } \\frac{${k1}}{${n1}} = ${pctTex(p1)} \\qquad \\text{6b: } \\frac{${k2}}{${n2}} = ${pctTex(p2)}` },
            { text: p1 === p2 ? 'Beide Anteile sind gleich groß.' : `Der Anteil ist ${correct} größer.` },
          ],
          finalAnswer: correct,
        },
        commonMistakes: [{ description: 'Anzahlen statt Anteile verglichen', feedback: 'Mehr Kinder heißt nicht größerer Anteil – die Klassen sind unterschiedlich groß.', answers: [byCount] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-umfrage',
    subtopicId: A,
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Anteile in Prozent angeben'],
    params: (r) => {
      const n = r.pick([40, 80, 200, 300, 400, 500]);
      const p = 5 * r.int(1, 19);
      return { n, p, who: r.pick(['Jugendlichen', 'Kindern', 'Gästen', 'Fans']), ans: r.pick(['Ja', 'Nein']) };
    },
    build: ({ n, p, who, ans }) => {
      const k = (p * n) / 100;
      return {
        prompt: `Bei einer Umfrage unter $${n}$ ${who} antworten $${k}$ mit „${ans}“. Wie viel Prozent sind das?`,
        answer: { kind: 'numeric', value: p, tolerance: 0.0001, unit: '%' },
        hints: ['Anteil = Teil durch Ganzes.', `$\\frac{${k}}{${n}}$ – kürze oder erweitere auf den Nenner $100$.`, `Oder rechne $${k} : ${n}$ und dann mal $100$.`],
        solution: {
          steps: [
            { text: 'Anteil als Bruch:', math: `\\frac{${k}}{${n}}` },
            { text: 'Auf Hundertstel bringen:', math: `\\frac{${k}}{${n}} = \\frac{${p}}{100} = ${p}\\,\\%` },
          ],
          finalAnswer: `$${p}\\,\\%$`,
        },
        commonMistakes: [{ description: 'Anzahl als Prozentsatz gelesen', feedback: `$${k}$ ist die Anzahl, nicht der Prozentsatz – teile erst durch alle Befragten.`, answers: [String(k)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-rest',
    subtopicId: A,
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Anteile in Prozent angeben'],
    params: (r) => {
      const f = r.pick([[1, 4], [1, 5], [1, 10], [3, 10], [2, 5], [1, 2], [1, 20]] as Frac[]);
      const p1 = 5 * r.int(2, Math.floor((95 - pct(f)) / 5));
      return { p1, f };
    },
    build: ({ p1, f }) => {
      const q = pct(f);
      const rest = 100 - p1 - q;
      return {
        prompt: `$${p1}\\,\\%$ der Kinder einer Schule kommen mit dem Bus, $${frac(f)}$ kommt zu Fuß, alle anderen fahren mit dem Rad. Wie viel Prozent fahren mit dem Rad?`,
        answer: { kind: 'numeric', value: rest, tolerance: 0.0001, unit: '%' },
        hints: ['Alle Kinder zusammen sind $100\\,\\%$.', `Rechne $${frac(f)}$ in Prozent um.`, 'Ziehe beide Anteile von $100\\,\\%$ ab.'],
        solution: {
          steps: [
            { text: 'Den Bruch in Prozent umrechnen:', math: `${frac(f)} = ${pctTex(q)}` },
            { text: 'Alle zusammen sind $100\\,\\%$:', math: `100\\,\\% - ${pctTex(p1)} - ${pctTex(q)} = ${pctTex(rest)}` },
          ],
          finalAnswer: `$${pctTex(rest)}$`,
        },
        commonMistakes: [
          { description: 'Bruch nicht in Prozent umgerechnet', feedback: `$${frac(f)}$ sind nicht $${f[0]}\\,\\%$ – rechne erst in Prozent um.`, answers: [txt(100 - p1 - f[0])] },
          { description: 'Nur den Bus-Anteil abgezogen', feedback: 'Auch die Kinder, die zu Fuß kommen, fahren nicht mit dem Rad.', answers: [txt(100 - p1)] },
        ],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-gekuerzt',
    subtopicId: A,
    count: 8,
    type: 'multiple-choice',
    requirement: 'calculation',
    difficulty: 3,
    objectives: ['Prozent in Bruch umwandeln'],
    params: (_r, i) => [35, 15, 45, 65, 12, 24, 36, 48, 55, 95, 85, 64][i],
    build: (p, r) => {
      const g = gcd(p, 100);
      const [z, n] = [p / g, 100 / g];
      const { choices, correctId } = shuffledChoices(r, `$\\frac{${z}}{${n}}$`, [`$\\frac{${p}}{100}$`, `$\\frac{${n}}{${z}}$`, `$\\frac{${z + 1}}{${n}}$`]);
      return {
        prompt: `Welcher vollständig gekürzte Bruch entspricht $${p}\\,\\%$?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Prozent heißt „Hundertstel“.', `Schreibe $${p}\\,\\%$ als $\\frac{${p}}{100}$.`, 'Kürze mit dem größten gemeinsamen Teiler von Zähler und Nenner.'],
        solution: {
          steps: [
            { text: 'Als Hundertstel schreiben:', math: `${p}\\,\\% = \\frac{${p}}{100}` },
            { text: `Mit $${g}$ kürzen (größter gemeinsamer Teiler von $${p}$ und $100$):`, math: `\\frac{${p}}{100} = \\frac{${z}}{${n}}` },
          ],
          finalAnswer: `$\\frac{${z}}{${n}}$`,
        },
        commonMistakes: [{ description: 'Nicht vollständig gekürzt oder Bruch umgedreht', feedback: 'Prozentsatz im Zähler, $100$ im Nenner – und so lange kürzen, bis es keinen gemeinsamen Teiler mehr gibt.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-an-ueber100',
    subtopicId: A,
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 3,
    objectives: ['Anteile in Prozent angeben'],
    params: (_r, i) => ([[5, 4], [3, 2], [6, 5], [7, 4], [7, 5], [11, 10], [9, 4], [5, 2], [13, 10], [8, 5]] as Frac[])[i],
    build: (f) => {
      const p = pct(f);
      return {
        prompt: `Schreibe $${frac(f)}$ in Prozent.`,
        answer: { kind: 'numeric', value: p, tolerance: 0.0001, unit: '%' },
        hints: ['Ein Bruch größer als $1$ ergibt mehr als $100\\,\\%$.', `Teile $${f[0]} : ${f[1]}$.`, 'Multipliziere das Ergebnis mit $100$.'],
        solution: { steps: [{ text: 'Als Dezimalzahl und dann in Prozent:', math: `${frac(f)} = ${dec(f)} = ${pctTex(p)}` }], finalAnswer: `$${pctTex(p)}$` },
        commonMistakes: [{ description: 'Das Ganze vergessen', feedback: 'Der ganze Teil zählt mit: $1 = 100\\,\\%$.', answers: [txt(p - 100)] }],
      };
    },
  }),
];

const anteile: AuthoredSubtopic = withChecks(
  {
    id: A,
    topicId: T,
    order: 4,
    title: 'Anteile als Bruch, Dezimalzahl und Prozent',
    labels: nrwGym(6),
    description: 'Denselben Anteil als Bruch, als Dezimalzahl und in Prozent schreiben und Anteile vergleichen.',
    objective: 'Du gibst Anteile als Bruch, Dezimalzahl und in Prozent an und vergleichst Anteile verschieden großer Gruppen.',
    intro: '„12 von 20 Kindern“ und „15 von 25 Kindern“ – wo ist der Anteil größer? Wenn du Anteile in Prozent umrechnest, kannst du sie direkt vergleichen.',
    rules: [
      { term: 'Anteil', explanation: 'Gibt an, welcher Teil eines Ganzen gemeint ist:', math: '\\text{Anteil} = \\frac{\\text{Teil}}{\\text{Ganzes}}' },
      { term: 'Drei Schreibweisen', explanation: 'Derselbe Anteil als Bruch, als Dezimalzahl und in Prozent, z. B.', math: '\\frac{3}{4} = 0{,}75 = 75\\,\\%' },
      { term: 'Hunderterfeld', explanation: 'Ein Quadrat aus $100$ gleich großen Kästchen: Jedes Kästchen ist $1\\,\\%$ des Ganzen.' },
      { term: 'Anteile vergleichen', explanation: 'Alle Anteile in dieselbe Schreibweise bringen (am einfachsten in Prozent) und dann vergleichen.' },
    ],
    materials: [videoPlaceholder('prozent-anteile-v1', 'Bruch, Dezimalzahl, Prozent – dreimal derselbe Anteil')],
    example: {
      problem: 'In der 6a haben $12$ von $20$ Kindern ein Haustier, in der 6b $15$ von $25$. Wo ist der Anteil größer?',
      steps: [
        { text: '6a als Bruch und in Prozent:', math: '\\frac{12}{20} = \\frac{60}{100} = 60\\,\\%' },
        { text: '6b als Bruch und in Prozent:', math: '\\frac{15}{25} = \\frac{60}{100} = 60\\,\\%' },
      ],
      result: 'Beide Anteile sind gleich groß: jeweils $60\\,\\%$.',
    },
    summary: ['Anteil = Teil durch Ganzes.', 'Bruch → Dezimalzahl: Zähler durch Nenner. Dezimalzahl → Prozent: mal $100$.', 'Anteile vergleichen: alle in Prozent umrechnen.'],
    exercises: anteileExercises,
  },
  {
    add: [
      formulaChoice({
        id: 'prz-an-fc-1',
        subtopicId: A,
        prompt: 'Wie berechnest du einen Anteil?',
        correct: '$\\frac{\\text{Teil}}{\\text{Ganzes}}$',
        wrong: ['$\\frac{\\text{Ganzes}}{\\text{Teil}}$', '$\\text{Teil} \\cdot \\text{Ganzes}$', '$\\text{Ganzes} - \\text{Teil}$'],
        hints: ['Ein Anteil ist ein Teil vom Ganzen.', 'Der Teil steht oben im Bruch.', 'Das Ganze steht unten im Bruch.'],
        explanation: 'Anteil $= \\frac{\\text{Teil}}{\\text{Ganzes}}$, z. B. $12$ von $20$ Kindern: $\\frac{12}{20}$.',
      }),
      formulaChoice({
        id: 'prz-an-fc-2',
        subtopicId: A,
        prompt: 'In welcher Zeile steht dreimal derselbe Anteil?',
        correct: '$\\frac{3}{4} = 0{,}75 = 75\\,\\%$',
        wrong: ['$\\frac{3}{4} = 0{,}34 = 34\\,\\%$', '$\\frac{3}{4} = 0{,}75 = 7{,}5\\,\\%$', '$\\frac{1}{4} = 0{,}4 = 40\\,\\%$'],
        hints: ['Bruch → Dezimalzahl: Zähler durch Nenner.', '$3 : 4 = 0{,}75$', 'Dezimalzahl → Prozent: mal $100$.'],
        explanation: '$\\frac{3}{4} = 3 : 4 = 0{,}75$ und $0{,}75 \\cdot 100 = 75$, also $75\\,\\%$.',
      }),
      formulaChoice({
        id: 'prz-an-fc-3',
        subtopicId: A,
        checkpoint: 'concept',
        prompt: 'Ein Hunderterfeld hat $100$ gleich große Kästchen. Wie viel Prozent ist ein Kästchen?',
        correct: '$1\\,\\%$',
        wrong: ['$10\\,\\%$', '$100\\,\\%$', '$0{,}1\\,\\%$'],
        hints: ['Alle Kästchen zusammen sind $100\\,\\%$.', 'Es gibt $100$ Kästchen.', '$100\\,\\% : 100$'],
        explanation: 'Alle $100$ Kästchen sind $100\\,\\%$, ein Kästchen ist also $1\\,\\%$.',
      }),
    ],
  },
);

// ================================================================ Kapitel 5: Einfache Prozentangaben deuten

/** Prozentsatz → Bruch und Wort. */
const PARTS: { p: number; f: Frac; word: string }[] = [
  { p: 50, f: [1, 2], word: 'die Hälfte' },
  { p: 25, f: [1, 4], word: 'ein Viertel' },
  { p: 10, f: [1, 10], word: 'ein Zehntel' },
  { p: 20, f: [1, 5], word: 'ein Fünftel' },
  { p: 75, f: [3, 4], word: 'drei Viertel' },
  { p: 100, f: [1, 1], word: 'das Ganze' },
  { p: 40, f: [2, 5], word: 'zwei Fünftel' },
  { p: 30, f: [3, 10], word: 'drei Zehntel' },
  { p: 5, f: [1, 20], word: 'ein Zwanzigstel' },
  { p: 1, f: [1, 100], word: 'ein Hundertstel' },
  { p: 60, f: [3, 5], word: 'drei Fünftel' },
  { p: 80, f: [4, 5], word: 'vier Fünftel' },
];
const part = (p: number) => PARTS.find((x) => x.p === p)!;
const fracOf = (p: number) => (p === 100 ? '1' : frac(part(p).f));
/** Glatter Grundwert für p %: ein Vielfaches des Nenners. */
const baseFor = (p: number, max: number, r: { int(a: number, b: number): number }) => part(p).f[1] * r.int(2, Math.floor(max / part(p).f[1]));

/** Rechenweg „p % von G“ über den Bruchteil. */
function viaFraction(p: number, G: number) {
  const [z, n] = part(p).f;
  const W = (G * z) / n;
  const math = z === 1 ? `${p}\\,\\% \\text{ von } ${G} = ${fracOf(p)} \\cdot ${G} = ${G} : ${n} = ${W}` : `${p}\\,\\% \\text{ von } ${G} = ${fracOf(p)} \\cdot ${G} = (${G} : ${n}) \\cdot ${z} = ${G / n} \\cdot ${z} = ${W}`;
  return { W, step: { text: `$${p}\\,\\%$ ist ${part(p).word}:`, math } };
}

const deutenExercises: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'prz-de-bruchteil',
    subtopicId: D,
    count: 10,
    type: 'multiple-choice',
    requirement: 'knowledge',
    difficulty: 1,
    objectives: ['Prozentsätze als Bruchteil deuten'],
    params: (_r, i) => PARTS[i],
    build: ({ p, word }, r) => {
      const others = r.shuffle(PARTS.filter((x) => x.p !== p)).slice(0, 3).map((x) => x.word);
      const { choices, correctId } = shuffledChoices(r, word, others);
      return {
        prompt: `Welcher Bruchteil sind $${p}\\,\\%$?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Prozent heißt „Hundertstel“.', `Schreibe $${p}\\,\\%$ als $\\frac{${p}}{100}$.`, 'Kürze den Bruch so weit wie möglich.'],
        solution: { steps: [{ text: 'Als Hundertstel schreiben und kürzen:', math: p === 100 ? '100\\,\\% = \\frac{100}{100} = 1' : `${p}\\,\\% = \\frac{${p}}{100} = ${fracOf(p)}` }, { text: `Das ist ${word}.` }], finalAnswer: word },
        commonMistakes: [{ description: 'Bruchteil verwechselt', feedback: 'Schreibe den Prozentsatz als Hundertstel und kürze – dann siehst du den Bruchteil.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-kopf',
    subtopicId: D,
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: ['Einfache Prozentwerte im Kopf berechnen'],
    params: (r) => {
      const p = r.pick([50, 25, 10, 20]);
      return { p, G: baseFor(p, 200, r) };
    },
    build: ({ p, G }) => {
      const { W, step } = viaFraction(p, G);
      return {
        prompt: `Berechne im Kopf: $${p}\\,\\%$ von $${G}$.`,
        answer: { kind: 'numeric', value: W, tolerance: 0.0001 },
        hints: [`Welcher Bruchteil sind $${p}\\,\\%$?`, `$${p}\\,\\%$ ist ${part(p).word}.`, `Teile $${G}$ durch $${part(p).f[1]}$.`],
        solution: { steps: [step], finalAnswer: `$${W}$` },
        commonMistakes: [{ description: 'Den Rest statt des Anteils berechnet', feedback: `Gefragt sind $${p}\\,\\%$, nicht der Rest bis $100\\,\\%$.`, answers: [String(G - W)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-kopf2',
    subtopicId: D,
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: ['Einfache Prozentwerte im Kopf berechnen'],
    params: (r) => {
      const p = r.pick([75, 40, 30, 60, 5, 1]);
      return { p, G: baseFor(p, p === 1 ? 900 : 300, r) };
    },
    build: ({ p, G }) => {
      const { W, step } = viaFraction(p, G);
      const [, n] = part(p).f;
      return {
        prompt: `Berechne im Kopf: $${p}\\,\\%$ von $${G}$.`,
        answer: { kind: 'numeric', value: W, tolerance: 0.0001 },
        hints: [`$${p}\\,\\% = ${fracOf(p)}$`, `Berechne zuerst $\\frac{1}{${n}}$ von $${G}$.`, part(p).f[0] === 1 ? 'Das ist schon das Ergebnis.' : `Nimm das Ergebnis mal $${part(p).f[0]}$.`],
        solution: { steps: [step], finalAnswer: `$${W}$` },
        commonMistakes: [{ description: 'Nur den Stammbruch berechnet', feedback: `$${fracOf(p)}$ heißt: erst durch $${n}$ teilen, dann mal Zähler.`, answers: [String(G / n)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-aussage',
    subtopicId: D,
    count: 10,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 2,
    objectives: ['Prozentangaben beurteilen'],
    params: (r) => {
      const kind = r.pick(['haelfte', 'viertel', 'vergleich'] as const);
      if (kind === 'haelfte') return { kind, p: r.pick([45, 50, 55, 60, 48, 52, 70, 30]), G: 0, X: 0 };
      if (kind === 'viertel') return { kind, p: r.pick([20, 24, 25, 26, 30, 10]), G: 0, X: 0 };
      const p = r.pick([10, 20, 25, 50]);
      const G = baseFor(p, 200, r);
      const W = (G * p) / 100;
      return { kind, p, G, X: W + r.pick([-2, -1, 0, 1, 2]) * Math.max(1, Math.round(W / 4)) };
    },
    build: ({ kind, p, G, X }, r) => {
      const W = (G * p) / 100;
      const statement =
        kind === 'haelfte' ? `$${p}\\,\\%$ der Kinder sind mehr als die Hälfte der Klasse.` : kind === 'viertel' ? `$${p}\\,\\%$ sind weniger als ein Viertel.` : `$${p}\\,\\%$ von $${G}$ sind mehr als $${X}$.`;
      const isTrue = kind === 'haelfte' ? p > 50 : kind === 'viertel' ? p < 25 : W > X;
      const correct = isTrue ? 'Die Aussage stimmt.' : 'Die Aussage stimmt nicht.';
      const { choices, correctId } = shuffledChoices(r, correct, ['Die Aussage stimmt.', 'Die Aussage stimmt nicht.']);
      const reason =
        kind === 'haelfte'
          ? `Die Hälfte sind $50\\,\\%$. $${p}\\,\\%$ ist ${p > 50 ? 'mehr' : p === 50 ? 'genau die Hälfte, also nicht mehr' : 'weniger'}.`
          : kind === 'viertel'
            ? `Ein Viertel sind $25\\,\\%$. $${p}\\,\\%$ ist ${p < 25 ? 'weniger' : p === 25 ? 'genau ein Viertel, also nicht weniger' : 'mehr'}.`
            : `$${p}\\,\\%$ von $${G}$ sind $${W}$. $${W}$ ist ${W > X ? 'mehr' : W === X ? 'genauso viel, also nicht mehr' : 'weniger'} als $${X}$.`;
      return {
        prompt: `Stimmt die Aussage? „${statement}“`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Übersetze die Prozentangabe in einen Bruchteil.', 'Die Hälfte sind $50\\,\\%$, ein Viertel sind $25\\,\\%$.', 'Achte auf „mehr als“ und „weniger als“ – genau gleich zählt nicht.'],
        solution: { steps: [{ text: reason }], finalAnswer: correct },
        commonMistakes: [{ description: 'Grenzfall falsch beurteilt', feedback: '„Mehr als“ bzw. „weniger als“ schließt „genau gleich“ aus.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-sach',
    subtopicId: D,
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: ['Prozentangaben im Alltag deuten'],
    params: (r) => {
      const kind = r.pick(['rabatt', 'akku', 'klasse'] as const);
      const p = kind === 'klasse' ? r.pick([25, 50, 10, 20]) : r.pick([50, 25, 10, 20]);
      const G = kind === 'klasse' ? part(p).f[1] * r.int(Math.ceil(20 / part(p).f[1]), Math.floor(32 / part(p).f[1])) : kind === 'akku' ? part(p).f[1] * r.int(3, Math.floor(600 / part(p).f[1])) : baseFor(p, 120, r);
      return { kind, p, G };
    },
    build: ({ kind, p, G }) => {
      const { W, step } = viaFraction(p, G);
      const text = {
        rabatt: { prompt: `Ein Pullover kostet $${G}$ €. Im Schlussverkauf gibt es $${p}\\,\\%$ Rabatt. Um wie viel Euro wird er billiger?`, unit: '€', answer: `$${W}$ €` },
        akku: { prompt: `Ein voll geladener Akku hält $${G}$ Minuten. Er ist noch zu $${p}\\,\\%$ geladen. Wie viele Minuten hält er noch?`, unit: 'min', answer: `$${W}$ Minuten` },
        klasse: { prompt: `In einer Klasse sind $${G}$ Kinder. $${p}\\,\\%$ davon haben im Sommer Geburtstag. Wie viele Kinder sind das?`, unit: undefined, answer: `$${W}$ Kinder` },
      }[kind];
      return {
        prompt: text.prompt,
        answer: { kind: 'numeric', value: W, tolerance: 0.0001, ...(text.unit ? { unit: text.unit } : {}) },
        hints: [`Welcher Bruchteil sind $${p}\\,\\%$?`, `$${p}\\,\\%$ ist ${part(p).word}.`, `Teile $${G}$ durch $${part(p).f[1]}$.`],
        solution: { steps: [step], finalAnswer: text.answer },
        commonMistakes: [{ description: 'Den Rest statt des Anteils berechnet', feedback: `Gefragt sind die $${p}\\,\\%$, nicht der Rest.`, answers: [String(G - W)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-rest',
    subtopicId: D,
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Prozentangaben im Alltag deuten'],
    params: (r) => {
      const kind = r.pick(['preis', 'saft'] as const);
      const p = kind === 'saft' ? r.pick([75, 25, 50, 20]) : r.pick([25, 10, 20, 50, 75]);
      return { kind, p, G: kind === 'saft' ? part(p).f[1] * 50 * r.int(1, 4) : baseFor(p, 120, r) };
    },
    build: ({ kind, p, G }) => {
      const { W, step } = viaFraction(p, G);
      const rest = G - W;
      const t =
        kind === 'preis'
          ? { prompt: `Ein Spiel kostet $${G}$ €. Es wird um $${p}\\,\\%$ billiger. Was kostet es jetzt?`, unit: '€', after: 'Neuer Preis:', fin: `$${rest}$ €`, wrong: 'Nur den Rabatt berechnet' }
          : { prompt: `Eine Flasche enthält $${G}$ ml Saft. $${p}\\,\\%$ davon sind schon ausgetrunken. Wie viele Milliliter sind noch in der Flasche?`, unit: undefined, after: 'Noch in der Flasche:', fin: `$${rest}$ ml`, wrong: 'Die ausgetrunkene Menge berechnet' };
      return {
        prompt: t.prompt,
        answer: { kind: 'numeric', value: rest, tolerance: 0.0001, ...(t.unit ? { unit: t.unit } : {}) },
        hints: [`Berechne zuerst $${p}\\,\\%$ von $${G}$ über den Bruchteil.`, `$${p}\\,\\%$ ist ${part(p).word}.`, 'Ziehe das Ergebnis vom Ganzen ab.'],
        solution: { steps: [step, { text: t.after, math: `${G} - ${W} = ${rest}` }], finalAnswer: t.fin },
        commonMistakes: [{ description: t.wrong, feedback: 'Das ist der Teil, der wegfällt. Gefragt ist, was übrig bleibt.', answers: [String(W)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-de-ganzes',
    subtopicId: D,
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: ['Vom Teil auf das Ganze schließen'],
    params: (r) => ({
      p: r.pick([50, 25, 10, 20]),
      W: r.int(3, 40),
      ctx: r.pick([
        ['einer Wanderstrecke', 'km', 'Wie viele Kilometer ist die ganze Strecke lang?', 'km'],
        ['eines Buches', 'Seiten', 'Wie viele Seiten hat das ganze Buch?', 'Seiten'],
        ['einer Tüte Gummibärchen', 'Gummibärchen', 'Wie viele Gummibärchen waren in der ganzen Tüte?', 'Gummibärchen'],
      ] as const),
    }),
    build: ({ p, W, ctx: [of, unit, question, fin] }) => {
      const n = part(p).f[1];
      const G = W * n;
      return {
        prompt: `$${p}\\,\\%$ ${of} sind $${W}$ ${unit}. ${question}`,
        answer: { kind: 'numeric', value: G, tolerance: 0.0001 },
        hints: [`$${p}\\,\\%$ ist ${part(p).word}.`, `Das Ganze ist also ${n}-mal so groß wie der Teil.`, `Rechne $${W} \\cdot ${n}$.`],
        solution: {
          steps: [
            { text: `$${p}\\,\\%$ ist ${part(p).word}, das Ganze besteht also aus $${n}$ solchen Teilen:`, math: `${W} \\cdot ${n} = ${G}` },
          ],
          finalAnswer: `$${G}$ ${fin}`,
        },
        commonMistakes: [{ description: 'Geteilt statt multipliziert', feedback: 'Das Ganze ist größer als der Teil – also malnehmen, nicht teilen.', answers: [txt(W / n)] }],
      };
    },
  }),
];

const deuten: AuthoredSubtopic = withChecks(
  {
    id: D,
    topicId: T,
    order: 5,
    title: 'Einfache Prozentangaben deuten',
    labels: nrwGym(6),
    description: '$50\\,\\%$ ist die Hälfte, $25\\,\\%$ ein Viertel: Prozentangaben als Bruchteile verstehen und im Kopf rechnen.',
    objective: 'Du übersetzt einfache Prozentsätze in Bruchteile, rechnest damit im Kopf und beurteilst Prozentangaben im Alltag.',
    intro: '„$50\\,\\%$ Rabatt“, „Akku $25\\,\\%$“ – solche Angaben kannst du ohne Formel verstehen: $50\\,\\%$ ist die Hälfte, $25\\,\\%$ ein Viertel.',
    rules: [
      { term: 'Hälfte', explanation: '$50\\,\\%$ eines Ganzen, also $\\frac{1}{2}$.' },
      { term: 'Viertel', explanation: '$25\\,\\%$ eines Ganzen, also $\\frac{1}{4}$. Drei Viertel sind $75\\,\\%$.' },
      { term: 'Zehntel', explanation: '$10\\,\\%$ eines Ganzen, also $\\frac{1}{10}$.' },
      { term: 'Fünftel', explanation: '$20\\,\\%$ eines Ganzen, also $\\frac{1}{5}$.' },
      { term: 'Das Ganze', explanation: 'Alles, also $100\\,\\%$. $0\\,\\%$ bedeutet: nichts.' },
      { term: 'Prozent im Kopf rechnen', explanation: 'Den Prozentsatz als Bruch schreiben und diesen Bruchteil berechnen:', math: '25\\,\\% \\text{ von } 80 = \\frac{1}{4} \\cdot 80 = 20' },
    ],
    materials: [videoPlaceholder('prozent-deuten-v1', 'Hälfte, Viertel, Zehntel – Prozent im Kopf')],
    example: {
      problem: 'Ein Spiel kostet $40$ €. Es gibt $25\\,\\%$ Rabatt. Wie viel Euro sparst du?',
      steps: [
        { text: '$25\\,\\%$ ist ein Viertel:', math: '25\\,\\% = \\frac{1}{4}' },
        { text: 'Ein Viertel von $40$ €:', math: '40 : 4 = 10' },
      ],
      result: 'Du sparst $10$ €.',
    },
    summary: ['$50\\,\\% = \\frac{1}{2}$, $25\\,\\% = \\frac{1}{4}$, $75\\,\\% = \\frac{3}{4}$, $20\\,\\% = \\frac{1}{5}$, $10\\,\\% = \\frac{1}{10}$.', '$100\\,\\%$ ist das Ganze.', 'Im Kopf: Prozentsatz → Bruchteil → durch den Nenner teilen, mal den Zähler.'],
    exercises: deutenExercises,
  },
  {
    add: [
      formulaChoice({
        id: 'prz-de-fc-1',
        subtopicId: D,
        prompt: 'Welche Rechnung passt zu $10\\,\\%$ von $70$?',
        correct: '$\\frac{1}{10} \\cdot 70$',
        wrong: ['$\\frac{1}{100} \\cdot 70$', '$10 \\cdot 70$', '$70 - 10$'],
        hints: ['$10\\,\\%$ ist ein Zehntel.', 'Ein Zehntel von $70$ …', '… ist $\\frac{1}{10} \\cdot 70 = 7$.'],
        explanation: '$10\\,\\% = \\frac{1}{10}$, also $10\\,\\%$ von $70 = \\frac{1}{10} \\cdot 70 = 7$.',
      }),
      formulaChoice({
        id: 'prz-de-fc-2',
        subtopicId: D,
        prompt: 'Welche Rechnung passt zu $75\\,\\%$ von $40$?',
        correct: '$\\frac{3}{4} \\cdot 40$',
        wrong: ['$\\frac{1}{4} \\cdot 40$', '$\\frac{7}{5} \\cdot 40$', '$75 \\cdot 40$'],
        hints: ['$75\\,\\%$ sind drei Viertel.', 'Drei Viertel als Bruch: $\\frac{3}{4}$.', 'Bruchteil mal Ganzes.'],
        explanation: '$75\\,\\% = \\frac{3}{4}$, also $\\frac{3}{4} \\cdot 40 = 30$.',
      }),
      formulaChoice({
        id: 'prz-de-fc-3',
        subtopicId: D,
        checkpoint: 'concept',
        prompt: 'Was bedeutet $100\\,\\%$?',
        correct: 'alles, das Ganze',
        wrong: ['die Hälfte', 'nichts', 'genau hundert Stück'],
        hints: ['Prozent heißt „von Hundert“.', '$100$ von $100$ …', '… ist alles.'],
        explanation: '$100\\,\\% = \\frac{100}{100} = 1$: das Ganze.',
      }),
    ],
  },
);

/** Neue Kapitel für Klasse 6, hinten an das Thema angehängt. */
export const klasse6Subtopics: AuthoredSubtopic[] = [anteile, deuten];
