import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, round, shuffledChoices } from '../templates';
import { additionSteps, eq, euro, systemFor, TOPIC_ID } from './shared';

const S = 'lgs-sonderfaelle';
const OBJ = ['Lösbarkeit linearer Gleichungssysteme beurteilen'];
const COUNT = [
  { id: 'a', label: 'keine Lösung' },
  { id: 'b', label: 'genau eine Lösung' },
  { id: 'c', label: 'unendlich viele Lösungen' },
];
const COUNT_ID = { none: 'a', one: 'b', many: 'c' } as const;
const COUNT_LABEL = { none: 'keine Lösung', one: 'genau eine Lösung', many: 'unendlich viele Lösungen' } as const;

type Kind = keyof typeof COUNT_ID;

export const sonderfaelle: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 6,
  title: 'Sonderfälle',
  description: 'Gleichungssysteme ohne Lösung oder mit unendlich vielen Lösungen erkennen und deuten.',
  objective: 'Du erkennst rechnerisch und am Gleichungssystem, ob es keine, genau eine oder unendlich viele Lösungen gibt.',
  intro:
    'Nicht jedes Gleichungssystem hat genau eine Lösung. Fallen beim Rechnen **beide** Variablen weg, bleibt eine Aussage ohne Variable übrig: Ist sie falsch (z. B. $0 = 5$), gibt es keine Lösung – die Geraden sind parallel. Ist sie wahr ($0 = 0$), gibt es unendlich viele Lösungen – die Geraden sind identisch.',
  rules: [
    { term: 'Falsche Aussage', explanation: 'z. B. $0 = 5$ ⇒ keine Lösung, $L = \\{\\}$ (parallele Geraden).' },
    { term: 'Wahre Aussage', explanation: '$0 = 0$ ⇒ unendlich viele Lösungen (identische Geraden).' },
    { term: 'Ohne Rechnen erkennen', explanation: 'Ist die linke Seite von II ein Vielfaches der linken Seite von I, gibt es keine oder unendlich viele Lösungen – je nachdem, ob die rechte Seite im selben Verhältnis steht.' },
  ],
  materials: [videoPlaceholder('lgs-sonderfaelle-v1', 'Keine oder unendlich viele Lösungen')],
  example: {
    problem: 'Löse $\\text{I: } x + 2y = 4$, $\\text{II: } 2x + 4y = 10$.',
    steps: [
      { text: 'II − 2 · I:', math: '0x + 0y = 2' },
      { text: '$0 = 2$ ist eine falsche Aussage.' },
    ],
    result: 'Das Gleichungssystem hat keine Lösung ($L = \\{\\}$); die Geraden sind parallel.',
  },
  summary: ['$0 = $ Zahl $\\neq 0$ ⇒ keine Lösung.', '$0 = 0$ ⇒ unendlich viele Lösungen.', 'Linke Seiten Vielfache voneinander ⇒ Sonderfall prüfen.'],
  exercises: [
    {
      id: 'lgs-sf-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Beim Lösen eines Gleichungssystems erhältst du $0 = 7$. Was bedeutet das?',
      choices: COUNT,
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Ist $0 = 7$ wahr oder falsch?', 'Eine falsche Aussage kann kein Zahlenpaar erfüllen.', 'Geometrisch: parallele Geraden.'],
      solution: { steps: [{ text: '$0 = 7$ ist immer falsch – kein Paar $(x\\,|\\,y)$ erfüllt das System. Die Geraden sind parallel.' }], finalAnswer: 'keine Lösung' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Als Lösung x = 7 gedeutet', feedback: 'Es ist keine Variable mehr übrig – die Aussage ist einfach falsch.', answers: ['b'] }],
    },
    {
      id: 'lgs-sf-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Beim Lösen eines Gleichungssystems erhältst du $0 = 0$. Was bedeutet das?',
      choices: COUNT,
      answer: { kind: 'choice', correct: 'c' },
      hints: ['Ist $0 = 0$ wahr oder falsch?', 'Die Aussage gilt immer – egal, welche Zahlen man wählt.', 'Beide Gleichungen beschreiben dieselbe Gerade.'],
      solution: { steps: [{ text: '$0 = 0$ ist immer wahr. Beide Gleichungen sind gleichwertig; jedes Paar auf der gemeinsamen Geraden ist eine Lösung.' }], finalAnswer: 'unendlich viele Lösungen' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Als „keine Lösung“ gedeutet', feedback: 'Eine wahre Aussage schließt keine Paare aus – im Gegenteil.', answers: ['a'] }],
    },
    {
      id: 'lgs-sf-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Was bedeutet es geometrisch, wenn ein Gleichungssystem unendlich viele Lösungen hat?',
      choices: [
        { id: 'a', label: 'Die beiden Geraden liegen aufeinander.' },
        { id: 'b', label: 'Die beiden Geraden sind parallel.' },
        { id: 'c', label: 'Die Geraden schneiden sich im Ursprung.' },
        { id: 'd', label: 'Die Geraden stehen senkrecht aufeinander.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Jeder gemeinsame Punkt ist eine Lösung.', 'Wann haben zwei Geraden unendlich viele gemeinsame Punkte?', 'Wenn sie gleich sind.'],
      solution: { steps: [{ text: 'Unendlich viele gemeinsame Punkte gibt es nur, wenn beide Gleichungen dieselbe Gerade beschreiben.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit parallelen Geraden verwechselt', feedback: 'Parallele, verschiedene Geraden haben gar keinen gemeinsamen Punkt.', answers: ['b'] }],
    },
    {
      id: 'lgs-sf-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      prompt: 'Für welchen Wert von $c$ hat das System $\\text{I: } x + 2y = 4$, $\\text{II: } 3x + 6y = c$ unendlich viele Lösungen?',
      answer: { kind: 'numeric', value: 12, tolerance: 0.001 },
      hints: ['Die linke Seite von II ist das Dreifache der linken Seite von I.', 'Für unendlich viele Lösungen muss II genau das Dreifache von I sein.', '$3 \\cdot 4$'],
      solution: { steps: [{ text: 'II muss das Dreifache von I sein: $3x + 6y = 12$, also $c = 12$.' }], finalAnswer: '$c = 12$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Rechte Seite nicht vervielfacht', feedback: 'Auch die rechte Seite muss mit $3$ multipliziert werden.', answers: ['4'] }],
    },
    {
      id: 'lgs-sf-5',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Taxi A: $3$ € Grundgebühr und $2$ € pro km. Taxi B: $5$ € Grundgebühr und $2$ € pro km. Bei welcher Strecke kosten beide gleich viel?',
      choices: [
        { id: 'a', label: 'Nie – B ist immer $2$ € teurer.' },
        { id: 'b', label: 'Bei $2$ km' },
        { id: 'c', label: 'Bei jeder Strecke' },
        { id: 'd', label: 'Bei $1$ km' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Stelle beide Kostenfunktionen auf.', '$y = 2x + 3$ und $y = 2x + 5$', 'Gleiche Steigung, verschiedene Achsenabschnitte …'],
      solution: { steps: [{ text: 'Gleichsetzen: $2x + 3 = 2x + 5$ ⇒ $3 = 5$, falsch. Die Geraden sind parallel – B ist immer $2$ € teurer.' }], finalAnswer: 'Nie' },
      objectives: [...OBJ, 'Sonderfälle im Sachzusammenhang deuten'],
      commonMistakes: [{ description: 'Differenz als Strecke gedeutet', feedback: 'Die Preise pro km sind gleich – der Unterschied bleibt immer $2$ €.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-sf-aussage',
      subtopicId: S,
      count: 12,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const kind: Kind = r.pick(['none', 'none', 'many', 'one']);
        return { kind, k: r.int(1, 12) * r.sign(), v: r.pick(['x', 'y']), method: r.pick(['Additionsverfahren', 'Einsetzungsverfahren', 'Gleichsetzungsverfahren']), who: r.pick(['Pia', 'Emil', 'Sara', 'Noah', 'Lio']) };
      },
      build: ({ kind, k, v, method, who }) => {
        const statement = kind === 'none' ? `0 = ${k}` : kind === 'many' ? '0 = 0' : `${k < 0 ? '-' : ''}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v} = ${3 * k}`;
        return {
          prompt: `${who} löst ein Gleichungssystem mit dem ${method} und erhält am Ende $${statement}$. Wie viele Lösungen hat das System?`,
          choices: COUNT,
          answer: { kind: 'choice', correct: COUNT_ID[kind] },
          hints: ['Steht noch eine Variable da?', 'Wenn nicht: Ist die Aussage wahr oder falsch?', 'Falsch ⇒ keine Lösung, wahr ⇒ unendlich viele.'],
          solution: {
            steps: [{ text: kind === 'none' ? `$${statement}$ ist falsch ⇒ keine Lösung.` : kind === 'many' ? '$0 = 0$ ist immer wahr ⇒ unendlich viele Lösungen.' : `Hier steht noch eine Variable: $${v} = 3$. Mit dem zweiten Wert ergibt sich genau eine Lösung.` }],
            finalAnswer: COUNT_LABEL[kind],
          },
          commonMistakes: [{ description: 'Wahre und falsche Aussage verwechselt', feedback: '$0 = 0$ ist wahr (unendlich viele), $0 = 5$ ist falsch (keine).', answers: kind === 'one' ? [] : [kind === 'none' ? 'c' : 'a'] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sf-erkennen',
      subtopicId: S,
      count: 12,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const kind: Kind = r.pick(['none', 'many', 'one', 'none', 'many']);
        const a = r.int(1, 5) * r.sign();
        const b = r.int(1, 4);
        const c = r.int(-10, 12);
        const k = r.pick([2, 3, -2, 4, -3]);
        const d = r.pick([1, 2, -1, 3]);
        return { kind, s: kind === 'one' ? [a, b, c, k * a + d, k * b, r.int(-10, 12)] : [a, b, c, k * a, k * b, kind === 'many' ? k * c : k * c + d] };
      },
      build: ({ kind, s: [a1, b1, c1, a2, b2, c2] }) => ({
        prompt: `Wie viele Lösungen hat $\\text{I: } ${eq(a1, b1, c1)}$, $\\text{II: } ${eq(a2, b2, c2)}$?`,
        choices: COUNT,
        answer: { kind: 'choice', correct: COUNT_ID[kind] },
        hints: ['Vergleiche die linken Seiten: Ist II ein Vielfaches von I?', `Probiere den Faktor $${round(b2 / b1, 3)}$ (Verhältnis der $y$-Koeffizienten).`, 'Prüfe dann, ob die rechten Seiten im selben Verhältnis stehen.'],
        solution: {
          steps: [
            { text: kind === 'one' ? `Die linken Seiten sind keine Vielfachen voneinander ($${a2} : ${a1} \\neq ${b2} : ${b1}$) ⇒ genau eine Lösung.` : `Die linke Seite von II ist das $${num(b2 / b1)}$-Fache der linken Seite von I.` },
            ...(kind === 'one' ? [] : [{ text: kind === 'many' ? `Auch $${c2} = ${num(b2 / b1)} \\cdot ${c1 < 0 ? `(${c1})` : c1}$ ⇒ gleiche Gerade ⇒ unendlich viele Lösungen.` : `Aber $${c2} \\neq ${num(b2 / b1)} \\cdot ${c1 < 0 ? `(${c1})` : c1}$ ⇒ parallele Geraden ⇒ keine Lösung.` }]),
          ],
          finalAnswer: COUNT_LABEL[kind],
        },
        commonMistakes: [{ description: 'Rechte Seite nicht verglichen', feedback: 'Sind die linken Seiten Vielfache, entscheidet die rechte Seite zwischen „keine“ und „unendlich viele“.', answers: kind === 'one' ? [] : [kind === 'none' ? 'c' : 'a'] }],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-sf-loesen',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const kind: Kind = r.pick(['one', 'one', 'none', 'many']);
        const x0 = r.int(-4, 5);
        const y0 = r.int(-4, 5);
        const a1 = r.int(1, 4);
        const b1 = r.int(1, 3) * r.sign();
        const k = r.pick([2, 3, -2]);
        if (kind === 'one') return { kind, x0, y0, s: systemFor(x0, y0, a1, b1, a1 + r.pick([1, 2]), -b1) };
        const s = systemFor(x0, y0, a1, b1, k * a1, k * b1);
        return { kind, x0, y0, s: kind === 'many' ? s : { ...s, c2: s.c2 + r.pick([1, 3, -2]) } };
      },
      build: ({ kind, x0, y0, s }, r) => {
        const pair = `$(${x0}\\,|\\,${y0})$`;
        const correct = kind === 'one' ? pair : COUNT_LABEL[kind];
        const { choices, correctId } = shuffledChoices(r, correct, [kind === 'one' ? `$(${y0}\\,|\\,${x0})$` : `$(${x0}\\,|\\,${y0 + 1})$`, ...Object.values(COUNT_LABEL).filter((l) => l !== correct && l !== 'genau eine Lösung')]);
        return {
          prompt: `Löse das Gleichungssystem $\\text{I: } ${eq(s.a1, s.b1, s.c1)}$, $\\text{II: } ${eq(s.a2, s.b2, s.c2)}$. Was ist die Lösung?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Versuche, eine Variable mit dem Additionsverfahren zu eliminieren.', 'Fallen beide Variablen weg, prüfe die übrig gebliebene Aussage.', 'Mache bei einem Zahlenpaar die Probe.'],
          solution: {
            steps:
              kind === 'one'
                ? additionSteps(s, x0, y0)
                : [{ text: `II − ${num(s.a2 / s.a1)} · I:`, math: `0 = ${num(s.c2 - (s.a2 / s.a1) * s.c1)}` }, { text: kind === 'many' ? 'Wahre Aussage ⇒ unendlich viele Lösungen.' : 'Falsche Aussage ⇒ keine Lösung.' }],
            finalAnswer: correct,
          },
          commonMistakes: [{ description: 'Ohne Probe ein Paar gewählt', feedback: 'Setze ein Paar immer in beide Gleichungen ein.' }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sf-parameter-a',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Parameter bestimmen'],
      params: (r) => ({ a1: r.int(1, 5) * r.sign(), b1: r.int(1, 4), c1: r.int(1, 10), k: r.pick([2, 3, 4, -2]), d: r.pick([1, 2, 5, -3]) }),
      build: ({ a1, b1, c1, k, d }) => {
        const a = k * a1;
        return {
          prompt: `Für welchen Wert von $a$ hat das System $\\text{I: } ${eq(a1, b1, c1)}$, $\\text{II: } ax ${b1 * k < 0 ? '-' : '+'} ${num(Math.abs(b1 * k))}y = ${k * c1 + d}$ keine Lösung?`,
          answer: { kind: 'numeric', value: a, tolerance: 0.001 },
          hints: ['Keine Lösung gibt es bei parallelen Geraden.', `Vergleiche die $y$-Koeffizienten: $${num(b1 * k)} = ${k} \\cdot ${b1}$.`, `Dann muss auch $a = ${k} \\cdot ${a1 < 0 ? `(${a1})` : a1}$ sein – prüfe die rechte Seite.`],
          solution: {
            steps: [{ text: `Die $y$-Koeffizienten stehen im Verhältnis $${k}$. Für parallele Geraden braucht es dasselbe Verhältnis bei $x$: $a = ${k} \\cdot ${a1 < 0 ? `(${a1})` : a1} = ${a}$.` }, { text: `Rechte Seite: $${k * c1 + d} \\neq ${k} \\cdot ${c1} = ${k * c1}$ ⇒ tatsächlich keine Lösung.` }],
            finalAnswer: `$a = ${a}$`,
          },
          commonMistakes: [{ description: 'Kehrwert des Verhältnisses', feedback: 'Multipliziere den $x$-Koeffizienten von I mit demselben Faktor wie bei $y$.', answers: [num(a1 / k).replace('{,}', ',')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sf-parameter-c',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Parameter bestimmen'],
      params: (r) => ({ a1: r.int(1, 5) * r.sign(), b1: r.int(1, 4) * r.sign(), c1: r.int(-9, 12), k: r.pick([2, 3, 5, -2]) }),
      build: ({ a1, b1, c1, k }) => ({
        prompt: `Für welchen Wert von $c$ hat das System $\\text{I: } ${eq(a1, b1, c1)}$, $\\text{II: } ${eq(k * a1, k * b1, 0).replace(/= 0$/, '= c')}$ unendlich viele Lösungen?`,
        answer: { kind: 'numeric', value: k * c1, tolerance: 0.001 },
        hints: ['Unendlich viele Lösungen: II ist ein Vielfaches von I.', `Der Faktor ist $${k}$.`, `Also $c = ${k} \\cdot ${c1 < 0 ? `(${c1})` : c1}$.`],
        solution: { steps: [{ text: `Linke Seite von II = $${k}$ · linke Seite von I. Dann muss $c = ${k} \\cdot ${c1 < 0 ? `(${c1})` : c1} = ${k * c1}$ sein.` }], finalAnswer: `$c = ${k * c1}$` },
        commonMistakes: [{ description: 'Rechte Seite nicht vervielfacht', feedback: 'Auch die rechte Seite muss mit dem Faktor multipliziert werden.', answers: c1 === k * c1 ? [] : [String(c1)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lgs-sf-tarif',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Sonderfälle im Sachzusammenhang deuten'],
      params: (r) => {
        const kind: Kind = r.pick(['none', 'many', 'one']);
        const p = r.pick([0.2, 0.3, 0.5, 1.5, 2]);
        const g = r.pick([3, 4, 5, 8, 10]);
        const x = r.pick([10, 20, 40]);
        return { kind, p, g, x, what: r.pick(['Stromtarife', 'Handytarife', 'Mietwagenangebote']) };
      },
      build: ({ kind, p, g, x, what }, r) => {
        const pB = kind === 'one' ? round(p + 0.1, 2) : p;
        const gB = kind === 'one' ? round(g - 0.1 * x, 2) : kind === 'many' ? g : g + 2;
        const right = kind === 'none' ? 'nie' : kind === 'many' ? 'immer – beide Angebote sind gleich' : `bei $${x}$ Einheiten`;
        const { choices, correctId } = shuffledChoices(r, right, ['nie', 'immer – beide Angebote sind gleich', `bei $${x}$ Einheiten`, `bei $${x + 10}$ Einheiten`].filter((c) => c !== right));
        return {
          prompt: `Zwei ${what}: A kostet $${euro(g)}$ € Grundgebühr und $${euro(p)}$ € pro Einheit, B kostet $${euro(gB)}$ € Grundgebühr und $${euro(pB)}$ € pro Einheit. Wann kosten beide gleich viel?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: [`A: $y = ${linearTerm(p, g)}$, B: $y = ${linearTerm(pB, gB)}$`, 'Setze die Terme gleich.', 'Fällt $x$ weg, prüfe die übrig gebliebene Aussage.'],
          solution: {
            steps: [
              { text: 'Gleichsetzen:', math: `${linearTerm(p, g)} = ${linearTerm(pB, gB)}` },
              { text: kind === 'none' ? `$${num(g)} = ${num(gB)}$ ist falsch: B ist immer $2$ € teurer.` : kind === 'many' ? 'Beide Seiten sind gleich – die Angebote kosten immer gleich viel.' : `$${num(round(pB - p, 2))}x = ${num(round(g - gB, 2))}$ ⇒ $x = ${x}$.` },
            ],
            finalAnswer: right,
          },
          commonMistakes: [{ description: 'Sonderfall übersehen', feedback: 'Bei gleichem Preis pro Einheit hängt alles von der Grundgebühr ab.' }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sf-sach',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Sonderfälle im Sachzusammenhang deuten'],
      params: (r) => {
        const kind: 'none' | 'many' = r.pick(['none', 'many']);
        const e = r.pick([8, 9, 10, 12]);
        const k = r.pick([4, 5, 6]);
        const n = r.int(1, 3);
        return { kind, e, k, n, f: r.pick([2, 3]) };
      },
      build: ({ kind, e, k, n, f }, r) => {
        const one = n * (e + k);
        const total = f * one + (kind === 'none' ? r.pick([2, 4, -3]) : 0);
        const right = kind === 'none' ? 'Die Angaben widersprechen sich – es gibt keine Lösung.' : 'Die Preise lassen sich nicht eindeutig bestimmen – es gibt unendlich viele Lösungen.';
        const { choices, correctId } = shuffledChoices(r, right, [kind === 'none' ? 'Die Preise lassen sich nicht eindeutig bestimmen – es gibt unendlich viele Lösungen.' : 'Die Angaben widersprechen sich – es gibt keine Lösung.', `Erwachsene zahlen $${e}$ €, Kinder $${k}$ €.`, 'Kinder haben freien Eintritt.']);
        return {
          prompt: `Gruppe A zahlt für $${n}$ Erwachsene und $${n}$ Kinder $${one}$ €. Gruppe B zahlt für $${f * n}$ Erwachsene und $${f * n}$ Kinder $${total}$ €. Was lässt sich über die Eintrittspreise sagen?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: [`I: $${n}x + ${n}y = ${one}$, II: $${f * n}x + ${f * n}y = ${total}$`, `II ist links das $${f}$-Fache von I.`, `Vergleiche die rechte Seite mit $${f} \\cdot ${one}$.`],
          solution: { steps: [{ text: `Links ist II das $${f}$-Fache von I. ${kind === 'none' ? `Rechts steht aber $${total} \\neq ${f * one}$ ⇒ Widerspruch.` : `Auch rechts: $${total} = ${f} \\cdot ${one}$ ⇒ beide Gleichungen sagen dasselbe; nur die Summe $x + y = ${e + k}$ ist bekannt.`}` }], finalAnswer: right },
          commonMistakes: [{ description: 'Konkrete Preise geraten', feedback: 'Aus diesen Angaben folgt nur etwas über die Summe der Preise – nicht über einzelne Preise.' }],
        };
      },
    }),
  ],
};
