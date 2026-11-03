import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, txt } from '../templates';
import { fx, SIGN_MISTAKE, substitution, TOPIC_ID } from './shared';

const S = 'lf-funktionsbegriff';
const OBJ = ['Funktionsbegriff verstehen', 'Funktionswerte berechnen'];
const YES_NO = [
  { id: 'a', label: 'Ja' },
  { id: 'b', label: 'Nein' },
];

export const funktionsbegriff: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 1,
  title: 'Funktionen und ihre Darstellung',
  description: 'Was ist eine Funktion? Wertetabelle, Graph, Funktionsgleichung und Funktionswerte.',
  objective: 'Du erkennst Funktionen, liest und berechnest Funktionswerte und wechselst zwischen Tabelle, Gleichung und Graph.',
  intro:
    'Eine Funktion ordnet jedem Eingabewert $x$ **genau einen** Ausgabewert $y$ zu – wie ein Automat: Du wirfst $x$ ein, heraus kommt immer dasselbe $y$. Funktionen kann man als Wertetabelle, als Graph oder als Gleichung darstellen.',
  rules: [
    { term: 'Funktion', explanation: 'Eine Zuordnung, die jedem $x$ aus der Definitionsmenge genau ein $y$ zuordnet.' },
    { term: 'Funktionsgleichung', explanation: 'Beschreibt die Zuordnung als Rechenvorschrift, z. B.', math: 'f(x) = 2x + 1' },
    { term: 'Funktionswert', explanation: '$f(3)$ ist der $y$-Wert, der zu $x = 3$ gehört: $3$ einsetzen und ausrechnen.' },
    { term: 'Definitionsmenge $D$', explanation: 'Alle $x$-Werte, die man einsetzen darf.' },
    { term: 'Graph', explanation: 'Alle Punkte $(x\\,|\\,f(x))$ im Koordinatensystem.' },
  ],
  materials: [videoPlaceholder('lf-funktionsbegriff-v1', 'Was ist eine Funktion?')],
  example: {
    problem: 'Berechne $f(4)$ für $f(x) = 3x - 5$.',
    steps: [{ text: 'Setze $4$ für $x$ ein:', math: 'f(4) = 3 \\cdot 4 - 5 = 12 - 5 = 7' }],
    result: '$f(4) = 7$, also liegt der Punkt $(4\\,|\\,7)$ auf dem Graphen.',
  },
  summary: [
    'Funktion: jedem $x$ genau ein $y$.',
    'Funktionswert $f(a)$: $a$ einsetzen und ausrechnen.',
    'Verschiedene $x$ dürfen dasselbe $y$ haben – ein $x$ aber nie zwei verschiedene $y$.',
  ],
  exercises: [
    {
      id: 'lf-fb-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was zeichnet eine Funktion aus?',
      choices: [
        { id: 'a', label: 'Jedem $x$ wird genau ein $y$ zugeordnet.' },
        { id: 'b', label: 'Jedem $y$ wird genau ein $x$ zugeordnet.' },
        { id: 'c', label: 'Der Graph ist immer eine Gerade.' },
        { id: 'd', label: 'Die $y$-Werte werden immer größer.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Denke an einen Automaten: Was muss passieren, wenn du zweimal dasselbe einwirfst?', 'Es geht um die Richtung $x \\to y$.', 'Zu jedem Eingabewert gibt es genau einen Ausgabewert.'],
      solution: { steps: [{ text: 'Eine Funktion ordnet jedem $x$ genau ein $y$ zu. Graphen müssen keine Geraden sein und dürfen auch fallen.' }], finalAnswer: 'Jedem $x$ genau ein $y$.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Richtung vertauscht', feedback: 'Verschiedene $x$ dürfen dasselbe $y$ haben. Entscheidend ist: Ein $x$ hat nie zwei $y$.', answers: ['b'] }],
    },
    {
      id: 'lf-fb-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Welche Wertetabelle gehört **nicht** zu einer Funktion?',
      choices: [
        { id: 'a', label: '$x$: 1, 2, 3 → $y$: 5, 5, 5' },
        { id: 'b', label: '$x$: 1, 2, 2 → $y$: 4, 6, 8' },
        { id: 'c', label: '$x$: −1, 0, 1 → $y$: 1, 0, 1' },
        { id: 'd', label: '$x$: 0, 1, 2 → $y$: 3, 2, 1' },
      ],
      answer: { kind: 'choice', correct: 'b' },
      hints: ['Suche einen $x$-Wert, der zweimal vorkommt.', 'Kommt ein $x$ doppelt vor, schau auf die zugehörigen $y$-Werte.', 'Bei b) gehören zu $x = 2$ die Werte $6$ und $8$.'],
      solution: { steps: [{ text: 'In b) gehören zu $x = 2$ zwei verschiedene $y$-Werte ($6$ und $8$). Das ist bei einer Funktion verboten.' }, { text: 'In a) und c) haben verschiedene $x$ dasselbe $y$ – das ist erlaubt.' }], finalAnswer: 'Tabelle b)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gleiche y-Werte für unzulässig gehalten', feedback: 'Gleiche $y$-Werte bei verschiedenen $x$ sind erlaubt (z. B. $f(x) = 5$).', answers: ['a', 'c'] }],
    },
    {
      id: 'lf-fb-3',
      subtopicId: S,
      type: 'text',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie heißt die Menge aller $x$-Werte, die man in eine Funktion einsetzen darf?',
      answer: { kind: 'text', accepted: ['Definitionsmenge', 'Definitionsbereich', 'D'] },
      hints: ['Der Begriff beginnt mit „Defini…“.', 'Man kürzt sie mit $D$ ab.', 'Definitions…menge'],
      solution: { steps: [{ text: 'Die erlaubten $x$-Werte bilden die Definitionsmenge $D$.' }], finalAnswer: 'Definitionsmenge' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Wertemenge genannt', feedback: 'Die Wertemenge enthält die $y$-Werte. Gesucht ist die Menge der $x$-Werte.', answers: ['Wertemenge', 'Wertebereich', 'W'] }],
    },
    {
      id: 'lf-fb-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Welche Zuordnung ist eine Funktion?',
      choices: [
        { id: 'a', label: 'Jeder Person in deiner Klasse wird ihre Körpergröße zugeordnet.' },
        { id: 'b', label: 'Jeder Körpergröße wird eine Person deiner Klasse zugeordnet.' },
        { id: 'c', label: 'Jeder Zahl wird eine Zahl zugeordnet, deren Quadrat sie ist.' },
        { id: 'd', label: 'Jedem Monat wird ein Tag zugeordnet, an dem es regnet.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Prüfe jeweils: Kann es zu einem Eingabewert zwei Ergebnisse geben?', 'Zwei Personen können gleich groß sein. Was bedeutet das für b)?', 'Jede Person hat genau eine Körpergröße.'],
      solution: { steps: [{ text: 'a) Jede Person hat genau eine Körpergröße ⇒ Funktion.' }, { text: 'b) Zwei Personen können gleich groß sein ⇒ keine Funktion. c) $4$ ist Quadrat von $2$ und $-2$ ⇒ keine Funktion. d) In einem Monat regnet es oft an mehreren Tagen.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Umkehrung gewählt', feedback: 'Bei b) kann eine Körpergröße zu mehreren Personen gehören – das ist keine Funktion.', answers: ['b'] }],
    },
    {
      id: 'lf-fb-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Eine Taxifahrt kostet $f(x) = 2{,}5x + 4$ Euro, wobei $x$ die gefahrenen Kilometer sind. Was kostet eine Fahrt über $8$ km?',
      answer: { kind: 'numeric', value: 24, tolerance: 0.001, unit: '€' },
      hints: ['Gesucht ist $f(8)$.', 'Setze $8$ für $x$ ein.', '$2{,}5 \\cdot 8 = 20$'],
      solution: { steps: [{ text: 'Setze $x = 8$ ein:', math: 'f(8) = 2{,}5 \\cdot 8 + 4 = 20 + 4 = 24' }], finalAnswer: '$24$ €' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Grundgebühr vergessen', feedback: 'Die $4$ € Grundgebühr kommen immer dazu.', answers: ['20'] }],
    },
    {
      id: 'lf-fb-6',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      prompt: 'Eine Kerze ist $20$ cm hoch und brennt pro Stunde $2$ cm ab. Ihre Höhe nach $t$ Stunden ist $h(t) = 20 - 2t$. Wie hoch ist sie nach $3$ Stunden (in cm)?',
      answer: { kind: 'numeric', value: 14, tolerance: 0.001, unit: 'cm' },
      hints: ['Gesucht ist $h(3)$.', 'Setze $t = 3$ ein.', '$20 - 2 \\cdot 3$'],
      solution: { steps: [{ text: 'Einsetzen:', math: 'h(3) = 20 - 2 \\cdot 3 = 14' }], finalAnswer: '$14$ cm' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Nur abgebrannte Länge berechnet', feedback: 'Nach 3 Stunden sind $6$ cm abgebrannt – gefragt ist die Resthöhe.', answers: ['6'] }],
    },
    {
      id: 'lf-fb-7',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was bedeutet die Schreibweise $f(3) = 7$?',
      choices: [
        { id: 'a', label: 'Zu $x = 3$ gehört der Funktionswert $y = 7$.' },
        { id: 'b', label: 'Zu $x = 7$ gehört der Funktionswert $y = 3$.' },
        { id: 'c', label: '$f$ mal $3$ ergibt $7$.' },
        { id: 'd', label: 'Die Funktion hat die Steigung $3$.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['In der Klammer steht der Eingabewert.', 'Rechts vom Gleichheitszeichen steht das Ergebnis.', 'Der Punkt $(3\\,|\\,7)$ liegt auf dem Graphen.'],
      solution: { steps: [{ text: '$f(3) = 7$ heißt: Setzt man $x = 3$ ein, kommt $7$ heraus. Der Punkt $(3\\,|\\,7)$ liegt auf dem Graphen.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'x und y vertauscht', feedback: 'In der Klammer steht der $x$-Wert, das Ergebnis ist der $y$-Wert.', answers: ['b'] }],
    },
    {
      id: 'lf-fb-8',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Für $f(x) = x^2$ gilt $f(2) = 4$ und $f(-2) = 4$. Ist $f$ trotzdem eine Funktion?',
      choices: [
        { id: 'a', label: 'Ja, verschiedene $x$ dürfen denselben Funktionswert haben.' },
        { id: 'b', label: 'Nein, jeder Funktionswert darf nur einmal vorkommen.' },
        { id: 'c', label: 'Nein, weil negative Zahlen nicht erlaubt sind.' },
        { id: 'd', label: 'Nur, wenn man $x = -2$ weglässt.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was verlangt die Definition – für jedes $x$ oder für jedes $y$?', 'Hat ein $x$-Wert hier zwei verschiedene $y$-Werte?', 'Zu jedem $x$ gibt es genau ein Quadrat.'],
      solution: { steps: [{ text: 'Jedem $x$ wird genau ein Quadrat zugeordnet. Dass $2$ und $-2$ dasselbe Ergebnis haben, ist erlaubt.' }], finalAnswer: 'Ja.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Definition umgedreht', feedback: 'Die Bedingung gilt für die $x$-Werte: Jedes $x$ hat genau ein $y$. Gleiche $y$ sind erlaubt.', answers: ['b'] }],
    },
    {
      id: 'lf-fb-9',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Handytarif kostet $f(x) = 0{,}09x + 4{,}95$ Euro im Monat ($x$ = Gesprächsminuten). Lena zahlt diesen Monat $13{,}05$ €. Wie viele Minuten hat sie telefoniert?',
      answer: { kind: 'numeric', value: 90, tolerance: 0.001, unit: 'min' },
      hints: ['Gesucht ist das $x$ mit $f(x) = 13{,}05$.', 'Ziehe zuerst die Grundgebühr ab.', '$8{,}10 : 0{,}09$'],
      solution: { steps: [{ text: 'Gleichung aufstellen:', math: '0{,}09x + 4{,}95 = 13{,}05' }, { text: 'Grundgebühr abziehen und teilen:', math: '0{,}09x = 8{,}10 \\;\\Rightarrow\\; x = 90' }], finalAnswer: '$90$ Minuten' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Grundgebühr nicht abgezogen', feedback: 'Zieh zuerst die $4{,}95$ € Grundgebühr ab, bevor du durch $0{,}09$ teilst.', answers: ['145'] }],
    },
    {
      id: 'lf-fb-10',
      subtopicId: S,
      type: 'text',
      requirement: 'knowledge',
      difficulty: 2,
      prompt: 'Wie heißt die Menge aller Funktionswerte ($y$-Werte), die eine Funktion annimmt?',
      answer: { kind: 'text', accepted: ['Wertemenge', 'Wertebereich', 'W'] },
      hints: ['Gegenstück zur Definitionsmenge.', 'Sie wird mit $W$ abgekürzt.', 'Werte…menge'],
      solution: { steps: [{ text: 'Alle $y$-Werte zusammen bilden die Wertemenge $W$.' }], finalAnswer: 'Wertemenge' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Definitionsmenge genannt', feedback: 'Die Definitionsmenge enthält die $x$-Werte. Gesucht ist die Menge der $y$-Werte.', answers: ['Definitionsmenge', 'D'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-fb-wert',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => ({ m: r.int(2, 6) * r.sign(), b: r.int(-9, 9), x: r.int(1, 6) }),
      build: ({ m, b, x }) => ({
        prompt: `Berechne $f(${x})$ für $${fx(m, b)}$.`,
        answer: { kind: 'numeric', value: m * x + b, tolerance: 0.001 },
        hints: [`Setze $${x}$ für $x$ ein.`, `Rechne zuerst $${num(m)} \\cdot ${x}$.`, `$${num(m)} \\cdot ${x} = ${num(m * x)}$`],
        solution: { steps: [{ text: 'Einsetzen und ausrechnen:', math: substitution(m, b, x) }], finalAnswer: `$f(${x}) = ${num(m * x + b)}$` },
        commonMistakes: [{ description: 'Punkt- vor Strichrechnung missachtet', feedback: 'Erst multiplizieren, dann addieren bzw. subtrahieren.', answers: [txt(m * (x + b))] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-fb-wert-neg',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([-3, -2, -1.5, -0.5, 0.5, 1.5, 2.5, 3]), b: r.int(-6, 6), x: r.int(-6, -1) * 2 }),
      build: ({ m, b, x }) => ({
        prompt: `Berechne $f(${x})$ für $${fx(m, b)}$.`,
        answer: { kind: 'numeric', value: m * x + b, tolerance: 0.001 },
        hints: [`Setze $(${x})$ mit Klammer für $x$ ein.`, 'Minus mal minus ergibt plus.', `$${num(m)} \\cdot (${x}) = ${num(m * x)}$`],
        solution: { steps: [{ text: 'Einsetzen (mit Klammer) und ausrechnen:', math: substitution(m, b, x) }], finalAnswer: `$f(${x}) = ${num(m * x + b)}$` },
        commonMistakes: [{ ...SIGN_MISTAKE, answers: [txt(-m * x + b)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-fb-quadrat',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ c: r.int(-9, 9), x: r.int(2, 7) * r.sign() }),
      build: ({ c, x }) => ({
        prompt: `Gegeben ist $f(x) = x^2 ${c < 0 ? `- ${-c}` : `+ ${c}`}$. Berechne $f(${x})$.`,
        answer: { kind: 'numeric', value: x * x + c, tolerance: 0.001 },
        hints: [`Setze $${x < 0 ? `(${x})` : x}$ für $x$ ein.`, 'Das Quadrat einer negativen Zahl ist positiv.', `$${x < 0 ? `(${x})` : x}^2 = ${x * x}$`],
        solution: { steps: [{ text: 'Einsetzen:', math: `f(${x}) = ${x < 0 ? `(${x})` : x}^2 ${c < 0 ? `- ${-c}` : `+ ${c}`} = ${x * x} ${c < 0 ? `- ${-c}` : `+ ${c}`} = ${x * x + c}` }], finalAnswer: `$${x * x + c}$` },
        commonMistakes: [{ description: 'Quadrat einer negativen Zahl negativ gerechnet', feedback: '$(-3)^2 = (-3) \\cdot (-3) = 9$, nicht $-9$.', answers: x < 0 ? [String(-x * x + c)] : [String(2 * x + c)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-fb-urbild',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Gleichungen lösen'],
      params: (r) => ({ m: r.int(2, 7) * r.sign(), b: r.int(1, 10) * r.sign(), x: r.int(-8, 8) }),
      build: ({ m, b, x }) => {
        const y = m * x + b;
        return {
          prompt: `Für welchen Wert von $x$ gilt $f(x) = ${y}$, wenn $${fx(m, b)}$ ist?`,
          answer: { kind: 'numeric', value: x, tolerance: 0.001 },
          hints: [`Stelle die Gleichung $${num(m)}x ${b < 0 ? `- ${-b}` : `+ ${b}`} = ${y}$ auf.`, `Bringe die $${b}$ auf die andere Seite.`, `Teile am Ende durch $${m}$.`],
          solution: {
            steps: [
              { text: 'Gleichung aufstellen:', math: `${num(m)}x ${b < 0 ? `- ${-b}` : `+ ${b}`} = ${y}` },
              { text: `${b < 0 ? `+ ${-b}` : `- ${b}`} auf beiden Seiten:`, math: `${num(m)}x = ${y - b}` },
              { text: `Durch $${m}$ teilen:`, math: `x = ${x}` },
            ],
            finalAnswer: `$x = ${x}$`,
          },
          commonMistakes: [{ description: 'Funktionswert statt x berechnet', feedback: 'Gesucht ist der $x$-Wert, nicht $f(' + y + ')$.', answers: [String(m * y + b)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-fb-kerze',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      objectives: [...OBJ, 'Funktionen im Sachzusammenhang'],
      params: (r) => {
        const rate = r.pick([1, 1.5, 2, 2.5, 3]);
        const t = r.int(2, 6);
        return { h0: r.int(4, 8) * 5, rate, t, thing: r.pick(['Kerze', 'Teelicht-Kerze', 'Stumpenkerze']) };
      },
      build: ({ h0, rate, t, thing }) => ({
        prompt: `Eine ${thing} ist $${h0}$ cm hoch und brennt pro Stunde $${num(rate)}$ cm ab: $h(t) = ${h0} - ${num(rate)}t$. Wie hoch ist sie nach $${t}$ Stunden (in cm)?`,
        answer: { kind: 'numeric', value: h0 - rate * t, tolerance: 0.001, unit: 'cm' },
        hints: [`Gesucht ist $h(${t})$.`, `Setze $t = ${t}$ ein.`, `In $${t}$ Stunden brennen $${num(rate * t)}$ cm ab.`],
        solution: { steps: [{ text: 'Einsetzen:', math: `h(${t}) = ${h0} - ${num(rate)} \\cdot ${t} = ${num(h0 - rate * t)}` }], finalAnswer: `$${num(h0 - rate * t)}$ cm` },
        commonMistakes: [{ description: 'Abgebrannte Länge statt Resthöhe', feedback: 'Gefragt ist, wie hoch die Kerze noch ist.', answers: [txt(rate * t)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-fb-tank',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Funktionen im Sachzusammenhang'],
      params: (r) => {
        const rate = r.pick([4, 5, 6, 8, 12, 15]);
        const t = r.int(3, 12);
        const rest = r.int(2, 10) * 10;
        return { rate, t, rest, v0: rest + rate * t, what: r.pick(['Ein Pool', 'Ein Wassertank', 'Ein Regenfass']) };
      },
      build: ({ rate, t, rest, v0, what }) => ({
        prompt: `${what} enthält $${v0}$ Liter Wasser. Pro Minute fließen $${rate}$ Liter ab: $V(t) = ${v0} - ${rate}t$. Nach wie vielen Minuten sind nur noch $${rest}$ Liter darin?`,
        answer: { kind: 'numeric', value: t, tolerance: 0.001, unit: 'min' },
        hints: [`Gesucht ist das $t$ mit $V(t) = ${rest}$.`, `Wie viele Liter müssen abfließen? $${v0} - ${rest}$`, `Teile die abgeflossene Menge durch $${rate}$.`],
        solution: {
          steps: [
            { text: 'Gleichung aufstellen:', math: `${v0} - ${rate}t = ${rest}` },
            { text: 'Umformen:', math: `${rate}t = ${v0 - rest} \\;\\Rightarrow\\; t = ${t}` },
          ],
          finalAnswer: `nach $${t}$ Minuten`,
        },
        commonMistakes: [{ description: 'Restmenge durch Abflussrate geteilt', feedback: 'Teile die Menge, die abfließen muss, nicht die Restmenge.', answers: [txt(rest / rate)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-fb-punktprobe',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: [...OBJ, 'Punktprobe'],
      params: (r) => {
        const m = r.int(1, 5) * r.sign();
        const b = r.int(-6, 6);
        const x = r.int(-4, 5);
        const onGraph = r.int(0, 1) === 1;
        return { m, b, x, y: m * x + b + (onGraph ? 0 : r.pick([-2, -1, 1, 2])) };
      },
      build: ({ m, b, x, y }) => {
        const on = m * x + b === y;
        return {
          prompt: `Liegt der Punkt $P(${x}\\,|\\,${y})$ auf dem Graphen von $${fx(m, b)}$?`,
          choices: YES_NO,
          answer: { kind: 'choice', correct: on ? 'a' : 'b' },
          hints: ['Setze den $x$-Wert des Punktes in die Funktion ein.', `Berechne $f(${x})$.`, `Vergleiche $f(${x})$ mit dem $y$-Wert $${y}$.`],
          solution: { steps: [{ text: 'Punktprobe:', math: substitution(m, b, x) }, { text: on ? `$f(${x}) = ${y}$ ⇒ der Punkt liegt auf dem Graphen.` : `$${m * x + b} \\neq ${y}$ ⇒ der Punkt liegt nicht auf dem Graphen.` }], finalAnswer: on ? 'Ja' : 'Nein' },
          commonMistakes: [{ description: 'Ergebnis nicht mit dem y-Wert verglichen', feedback: 'Der Punkt liegt nur dann auf dem Graphen, wenn $f(x)$ genau den $y$-Wert ergibt.', answers: [on ? 'b' : 'a'] }],
        };
      },
    }),
  ],
};
