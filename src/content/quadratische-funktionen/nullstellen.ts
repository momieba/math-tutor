import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num } from '../templates';
import { fx, generalTerm, mc, TOPIC_ID } from './shared';

const S = 'qf-nullstellen';
const OBJ = ['Nullstellen quadratischer Funktionen berechnen', 'Schnittpunkte von Parabel und Gerade bestimmen'];

/** pq-Formel für x² + px + q = 0 mit ganzzahligen Lösungen r1 < r2 als Rechenschritte. */
function pqSteps(p: number, q: number, r1: number, r2: number, v = 'x') {
  const h = p / 2;
  return [
    { text: 'pq-Formel:', math: `${v}_{1,2} = ${num(-h)} \\pm \\sqrt{${num(h * h)} ${q < 0 ? '+' : '-'} ${num(Math.abs(q))}}` },
    { text: 'Wurzel berechnen:', math: `${v}_{1,2} = ${num(-h)} \\pm \\sqrt{${num(h * h - q)}} = ${num(-h)} \\pm ${num(Math.sqrt(h * h - q))}` },
    { text: 'Lösungen:', math: `${v}_1 = ${num(r1)},\\; ${v}_2 = ${num(r2)}` },
  ];
}

/** Zwei verschiedene ganze Nullstellen. */
const roots = (r: { int(min: number, max: number): number }) => {
  const a = r.int(-7, 7);
  let b = r.int(-7, 7);
  if (b === a) b = a + r.int(1, 4);
  return [Math.min(a, b), Math.max(a, b)] as const;
};

export const nullstellen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 4,
  title: 'Nullstellen und Anwendungen',
  description: 'Wo schneidet eine Parabel die $x$-Achse – und wo eine Gerade?',
  objective: 'Du berechnest Nullstellen und Schnittpunkte quadratischer Funktionen und nutzt sie in Sachaufgaben.',
  intro:
    'Die Nullstellen einer quadratischen Funktion sind die Lösungen der Gleichung $f(x) = 0$ – hier hilft dein Wissen über quadratische Gleichungen, vor allem die pq-Formel. Eine Parabel hat keine, eine oder zwei Nullstellen. Um Schnittpunkte mit einer Geraden zu finden, setzt man die Funktionsterme gleich. So lässt sich etwa berechnen, wann ein geworfener Ball landet.',
  rules: [
    { term: 'Nullstellen', explanation: 'Löse $f(x) = 0$. Für $x^2 + px + q = 0$:', math: 'x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}' },
    { term: 'Anzahl der Nullstellen', explanation: 'Diskriminante $D = \\left(\\frac{p}{2}\\right)^2 - q$: $D > 0$ zwei, $D = 0$ eine, $D < 0$ keine.' },
    { term: 'Linearfaktorform', explanation: 'Nullstellen direkt ablesen:', math: 'f(x) = a(x - x_1)(x - x_2)' },
    { term: 'Schnittpunkt mit einer Geraden', explanation: 'Terme gleichsetzen, auf eine Seite bringen und die quadratische Gleichung lösen.' },
  ],
  materials: [videoPlaceholder('qf-nullstellen-v1', 'Nullstellen quadratischer Funktionen')],
  example: {
    problem: 'Berechne die Nullstellen von $f(x) = 2x^2 - 4x - 6$.',
    steps: [
      { text: 'Null setzen und durch $2$ teilen:', math: 'x^2 - 2x - 3 = 0' },
      { text: 'pq-Formel mit $p = -2$, $q = -3$:', math: 'x_{1,2} = 1 \\pm \\sqrt{1 + 3} = 1 \\pm 2' },
      { text: 'Lösungen:', math: 'x_1 = -1,\\; x_2 = 3' },
    ],
    result: 'Die Nullstellen sind $x_1 = -1$ und $x_2 = 3$.',
  },
  summary: ['Nullstellen: $f(x) = 0$ lösen, bei $a \\neq 1$ erst durch $a$ teilen.', 'Diskriminante entscheidet über die Anzahl.', 'Schnittpunkt Parabel–Gerade: gleichsetzen.'],
  exercises: [
    {
      id: 'qf-ns-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Nullstellen hat $f(x) = (x - 2)(x + 5)$?',
      choices: [
        { id: 'a', label: '$x_1 = 2$ und $x_2 = -5$' },
        { id: 'b', label: '$x_1 = -2$ und $x_2 = 5$' },
        { id: 'c', label: '$x_1 = 2$ und $x_2 = 5$' },
        { id: 'd', label: 'nur $x = -10$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Ein Produkt ist null, wenn ein Faktor null ist.', '$x - 2 = 0$ oder $x + 5 = 0$', 'Löse beide Gleichungen.'],
      solution: { steps: [{ text: 'Satz vom Nullprodukt: $x - 2 = 0 \\Rightarrow x = 2$; $x + 5 = 0 \\Rightarrow x = -5$.' }], finalAnswer: '$x_1 = 2$, $x_2 = -5$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Vorzeichen übernommen', feedback: 'Aus $x + 5 = 0$ folgt $x = -5$: Das Vorzeichen dreht sich.', answers: ['b'] }],
    },
    {
      id: 'qf-ns-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Eine nach unten geöffnete Parabel hat den Scheitelpunkt $S(1\\,|\\,4)$. Wie viele Nullstellen hat sie?',
      choices: [
        { id: 'a', label: 'zwei' },
        { id: 'b', label: 'genau eine' },
        { id: 'c', label: 'keine' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Skizziere den Scheitel und die Öffnung.', 'Der Scheitel liegt oberhalb der $x$-Achse.', 'Die Parabel fällt nach beiden Seiten.'],
      solution: { steps: [{ text: 'Der höchste Punkt liegt oberhalb der $x$-Achse, nach beiden Seiten fällt die Parabel: Sie schneidet die $x$-Achse zweimal.' }], finalAnswer: 'zwei' },
      objectives: [...OBJ, 'Anzahl der Nullstellen begründen'],
      commonMistakes: [{ description: 'Öffnung nicht beachtet', feedback: 'Bei einer nach unten geöffneten Parabel mit Scheitel oberhalb der $x$-Achse gibt es zwei Nullstellen.', answers: ['c'] }],
    },
    {
      id: 'qf-ns-3',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Ein Ball wird senkrecht nach oben geworfen. Seine Höhe ist $h(t) = -5t^2 + 20t$ ($t$ in s, $h$ in m). Nach wie vielen Sekunden landet er wieder?',
      answer: { kind: 'numeric', value: 4, tolerance: 0.001, unit: 's' },
      hints: ['Gelandet heißt $h(t) = 0$.', 'Klammere aus: $-5t(t - 4) = 0$.', '$t = 0$ ist der Abwurf.'],
      solution: { steps: [{ text: 'Null setzen und ausklammern:', math: '-5t^2 + 20t = -5t(t - 4) = 0' }, { text: '$t = 0$ (Abwurf) oder $t = 4$ (Landung).' }], finalAnswer: 'nach $4$ s' },
      objectives: [...OBJ, 'Nullstellen im Sachzusammenhang deuten'],
      commonMistakes: [{ description: 'Abwurfzeitpunkt angegeben', feedback: '$t = 0$ ist der Moment des Abwurfs – gefragt ist die Landung.', answers: ['0'] }],
    },
    {
      id: 'qf-ns-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Für welchen Wert von $q$ hat $f(x) = x^2 - 6x + q$ genau eine Nullstelle?',
      choices: [
        { id: 'a', label: '$q = 9$' },
        { id: 'b', label: '$q = 6$' },
        { id: 'c', label: '$q = -9$' },
        { id: 'd', label: '$q = 36$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Genau eine Nullstelle heißt: Diskriminante $= 0$.', '$\\left(\\frac{-6}{2}\\right)^2 - q = 0$', '$9 - q = 0$'],
      solution: { steps: [{ text: '$D = (-3)^2 - q = 9 - q = 0 \\Rightarrow q = 9$. Dann ist $f(x) = (x - 3)^2$ mit der einzigen Nullstelle $3$.' }], finalAnswer: '$q = 9$' },
      objectives: [...OBJ, 'Anzahl der Nullstellen begründen'],
      commonMistakes: [{ description: 'p² statt (p/2)²', feedback: 'In der Diskriminante steht $\\left(\\frac{p}{2}\\right)^2 = 9$, nicht $p^2 = 36$.', answers: ['d'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'qf-ns-linear',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: [...OBJ, 'Nullstellen aus der Linearfaktorform ablesen'],
      params: (r) => ({ rs: roots(r), a: r.pick([1, 2, -1, 3, -2]) }),
      build: ({ rs: [r1, r2], a }) => {
        const factor = (r: number) => (r === 0 ? 'x' : r > 0 ? `(x - ${r})` : `(x + ${-r})`);
        return {
          prompt: `Gib die Nullstellen von $f(x) = ${a === 1 ? '' : a === -1 ? '-' : num(a)}${factor(r1)}${factor(r2)}$ an.`,
          answer: { kind: 'numeric-set', values: [r1, r2], tolerance: 0.001 },
          hints: ['Ein Produkt ist null, wenn ein Faktor null ist.', 'Setze jeden Faktor mit $x$ einzeln gleich null.', 'Der Faktor vorne ändert die Nullstellen nicht.'],
          solution: { steps: [{ text: `Satz vom Nullprodukt: $x = ${r1}$ oder $x = ${r2}$.` }], finalAnswer: `$x_1 = ${r1}$, $x_2 = ${r2}$` },
          commonMistakes: [{ description: 'Vorzeichen übernommen', feedback: 'Aus $x - 3 = 0$ folgt $x = 3$, aus $x + 3 = 0$ folgt $x = -3$.', answers: [`${-r1}; ${-r2}`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-pq',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ rs: roots(r) }),
      build: ({ rs: [r1, r2] }) => {
        const p = -(r1 + r2);
        const q = r1 * r2;
        return {
          prompt: `Berechne die Nullstellen von $${fx(generalTerm(1, p, q))}$.`,
          answer: { kind: 'numeric-set', values: [r1, r2], tolerance: 0.001 },
          hints: ['Setze $f(x) = 0$.', `pq-Formel mit $p = ${num(p)}$ und $q = ${num(q)}$.`, 'Es gibt zwei Lösungen: $+$ und $-$ vor der Wurzel.'],
          solution: { steps: pqSteps(p, q, r1, r2), finalAnswer: `$x_1 = ${r1}$, $x_2 = ${r2}$` },
          commonMistakes: [{ description: 'Vorzeichen bei −p/2', feedback: 'In der pq-Formel steht $-\\frac{p}{2}$: Das Vorzeichen von $p$ dreht sich.', answers: [`${-r1}; ${-r2}`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-anzahl',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Anzahl der Nullstellen begründen'],
      params: (r) => {
        const h = r.int(1, 5) * r.sign();
        const kind = r.pick([0, 1, 2] as const);
        const q = kind === 1 ? h * h : kind === 2 ? h * h - r.pick([1, 4, 9, 5, 7]) : h * h + r.pick([1, 3, 4, 6]);
        return { p: 2 * h, q };
      },
      build: ({ p, q }, rng) => {
        const D = (p / 2) ** 2 - q;
        const labels = ['keine', 'genau eine', 'zwei'];
        const correct = labels[D < 0 ? 0 : D === 0 ? 1 : 2];
        const { choices, answer, idOf } = mc(rng, correct, labels.filter((l) => l !== correct));
        return {
          prompt: `Wie viele Nullstellen hat $${fx(generalTerm(1, p, q))}$?`,
          choices,
          answer,
          hints: ['Berechne die Diskriminante $D = \\left(\\frac{p}{2}\\right)^2 - q$.', `$D = ${num((p / 2) ** 2)} ${q < 0 ? '+' : '-'} ${num(Math.abs(q))}$`, '$D > 0$: zwei, $D = 0$: eine, $D < 0$: keine.'],
          solution: { steps: [{ text: 'Diskriminante:', math: `D = ${num((p / 2) ** 2)} ${q < 0 ? '+' : '-'} ${num(Math.abs(q))} = ${num(D)}` }, { text: `$D ${D < 0 ? '< 0' : D === 0 ? '= 0' : '> 0'}$: ${correct}.` }], finalAnswer: correct },
          commonMistakes: [{ description: 'Diskriminante falsch gedeutet', feedback: 'Aus einer negativen Zahl kann man keine Wurzel ziehen ⇒ keine Nullstelle; $D = 0$ ⇒ genau eine.', answers: [idOf(labels[D < 0 ? 2 : D === 0 ? 2 : 0])!] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-faktor',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Nullstellen bei a ≠ 1 berechnen'],
      params: (r) => ({ rs: roots(r), a: r.pick([2, 3, -1, -2, 0.5, -3]) }),
      build: ({ rs: [r1, r2], a }) => {
        const p = -(r1 + r2);
        const q = r1 * r2;
        return {
          prompt: `Berechne die Nullstellen von $${fx(generalTerm(a, a * p, a * q))}$.`,
          answer: { kind: 'numeric-set', values: [r1, r2], tolerance: 0.001 },
          hints: ['Setze $f(x) = 0$.', `Teile zuerst durch $${num(a)}$.`, `Dann pq-Formel mit $p = ${num(p)}$, $q = ${num(q)}$.`],
          solution: { steps: [{ text: `Null setzen und durch $${num(a)}$ teilen:`, math: `${generalTerm(1, p, q)} = 0` }, ...pqSteps(p, q, r1, r2)], finalAnswer: `$x_1 = ${r1}$, $x_2 = ${r2}$` },
          commonMistakes: [{ description: 'Nicht durch a geteilt', feedback: 'Die pq-Formel gilt nur, wenn vor $x^2$ eine $1$ steht: Teile zuerst durch $a$.', answers: [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-gerade',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => ({ rs: roots(r), m: r.int(-3, 3), n: r.int(-5, 5) }),
      build: ({ rs: [r1, r2], m, n }) => {
        // x² + bx + c = mx + n soll die Lösungen r1, r2 haben: x² + (b − m)x + (c − n) = (x − r1)(x − r2)
        const b = -(r1 + r2) + m;
        const c = r1 * r2 + n;
        const line = m === 0 ? num(n) : `${m === 1 ? '' : m === -1 ? '-' : num(m)}x${n === 0 ? '' : n > 0 ? ` + ${n}` : ` - ${-n}`}`;
        return {
          prompt: `An welchen Stellen $x$ schneiden sich die Parabel $${fx(generalTerm(1, b, c))}$ und die Gerade $g(x) = ${line}$? Gib die $x$-Werte an.`,
          answer: { kind: 'numeric-set', values: [r1, r2], tolerance: 0.001 },
          hints: ['Setze $f(x) = g(x)$.', `Bringe alles auf eine Seite: $${generalTerm(1, b - m, c - n)} = 0$.`, 'Löse mit der pq-Formel.'],
          solution: { steps: [{ text: 'Gleichsetzen und umformen:', math: `${generalTerm(1, b, c)} = ${line} \\;\\Rightarrow\\; ${generalTerm(1, b - m, c - n)} = 0` }, ...pqSteps(b - m, c - n, r1, r2)], finalAnswer: `$x_1 = ${r1}$, $x_2 = ${r2}$` },
          commonMistakes: [{ description: 'Gerade nicht abgezogen', feedback: 'Bringe auch den Term der Geraden auf die linke Seite, bevor du die pq-Formel nutzt.', answers: [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-wurf',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Nullstellen im Sachzusammenhang deuten'],
      params: (r) => ({ t2: r.pick([2, 3, 4, 5, 6]), t1: r.pick([0, 0, 1]), what: r.pick(['Ein Ball', 'Ein Stein', 'Ein Schneeball', 'Ein Tennisball']) }),
      build: ({ t2, t1, what }) => {
        // h(t) = −5(t − t2)(t + t1): landet bei t2, wird bei t1 > 0 aus der Höhe 5·t1·t2 geworfen
        const b = 5 * (t2 - t1);
        const c = 5 * t1 * t2;
        return {
          prompt: `${what} wird ${c ? `aus $${c}$ m Höhe ` : ''}nach oben geworfen. Seine Höhe ist $h(t) = ${generalTerm(-5, b, c, 't')}$ ($t$ in s, $h$ in m). Nach wie vielen Sekunden schlägt er auf dem Boden auf?`,
          answer: { kind: 'numeric', value: t2, tolerance: 0.001, unit: 's' },
          hints: ['Auf dem Boden ist $h(t) = 0$.', `Teile durch $-5$: $${generalTerm(1, -b / 5, -c / 5, 't')} = 0$.`, 'Nur die positive Lösung ergibt Sinn.'],
          solution: {
            steps: [
              { text: 'Null setzen und durch $-5$ teilen:', math: `${generalTerm(1, -b / 5, -c / 5, 't')} = 0` },
              { text: c ? 'Lösen (pq-Formel oder Linearfaktoren):' : 'Ausklammern:', math: c ? `(t - ${t2})(t + ${t1}) = 0` : `t(t - ${t2}) = 0` },
              { text: c ? `$t = -${t1}$ ist negativ und entfällt.` : '$t = 0$ ist der Abwurf.', math: `t = ${t2}` },
            ],
            finalAnswer: `nach $${t2}$ s`,
          },
          commonMistakes: [{ description: 'Falsche Lösung gewählt', feedback: c ? 'Eine negative Zeit ergibt keinen Sinn.' : '$t = 0$ ist der Abwurf, nicht die Landung.', answers: [c ? String(-t1) : '0'] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'qf-ns-hoehe',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Quadratische Gleichungen im Sachzusammenhang lösen'],
      params: (r) => {
        const t1 = r.int(1, 3);
        const t2 = t1 + r.int(1, 4);
        return { t1, t2, ...r.pick([{ dat: 'einer Feuerwerksrakete', pron: 'sie' }, { dat: 'einer Signalrakete', pron: 'sie' }, { dat: 'einer Modellrakete', pron: 'sie' }]) };
      },
      build: ({ t1, t2, dat, pron }) => {
        // h(t) = −5t² + 5(t1 + t2)t erreicht die Höhe H = 5·t1·t2 zu den Zeiten t1 und t2
        const v = 5 * (t1 + t2);
        const H = 5 * t1 * t2;
        return {
          prompt: `Die Höhe von ${dat} ist $h(t) = -5t^2 + ${v}t$ ($t$ in s, $h$ in m). Zu welchen Zeitpunkten ist ${pron} genau $${H}$ m hoch? Gib beide Zeitpunkte an.`,
          answer: { kind: 'numeric-set', values: [t1, t2], tolerance: 0.001 },
          hints: [`Setze an: $-5t^2 + ${v}t = ${H}$.`, `Alles auf eine Seite und durch $-5$ teilen: $t^2 - ${v / 5}t + ${H / 5} = 0$.`, 'Beim Steigen und beim Fallen wird die Höhe je einmal erreicht.'],
          solution: { steps: [{ text: 'Gleichung aufstellen und umformen:', math: `-5t^2 + ${v}t - ${H} = 0 \\;\\Rightarrow\\; t^2 - ${v / 5}t + ${H / 5} = 0` }, ...pqSteps(-v / 5, H / 5, t1, t2, 't')], finalAnswer: `nach $${t1}$ s und nach $${t2}$ s` },
          commonMistakes: [{ description: 'Nur einen Zeitpunkt angegeben', feedback: 'Die Höhe wird beim Steigen und beim Fallen erreicht: zwei Zeitpunkte.', answers: [String(t1)] }],
        };
      },
    }),
  ],
};
