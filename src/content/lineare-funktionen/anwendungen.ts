import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, round, shuffledChoices, txt } from '../templates';
import { TOPIC_ID, yx } from './shared';

const S = 'lf-anwendungen';
const OBJ = ['Lineare Modelle aufstellen und deuten', 'Sachaufgaben mit linearen Funktionen lösen'];

/** Sachkontexte mit fester Gebühr b und Preis m pro Einheit. */
const TARIFFS = [
  { name: 'Ein Taxiunternehmen', base: 'Grundgebühr', unit: 'km', unitLong: 'Kilometer', ms: [1.8, 2, 2.2, 2.5], bs: [3.5, 4, 4.5] },
  { name: 'Ein Handwerksbetrieb', base: 'Anfahrtspauschale', unit: 'h', unitLong: 'Stunde', ms: [42, 48, 55, 60], bs: [25, 30, 35] },
  { name: 'Ein Fahrradverleih', base: 'Leihgebühr', unit: 'h', unitLong: 'Stunde', ms: [3, 3.5, 4, 5], bs: [5, 6, 8] },
  { name: 'Ein Wasserversorger', base: 'Grundpreis', unit: 'm³', unitLong: 'Kubikmeter', ms: [2, 2.5, 3], bs: [8, 10, 12] },
  { name: 'Ein Parkhaus', base: 'Einfahrtsgebühr', unit: 'h', unitLong: 'Stunde', ms: [1.5, 2, 2.5], bs: [1, 2] },
] as const;

export const anwendungen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 6,
  title: 'Anwendungen',
  description: 'Tarife, Füllvorgänge und Bewegungen mit linearen Funktionen beschreiben, vergleichen und deuten.',
  objective: 'Du beschreibst Sachsituationen mit linearen Funktionen, deutest $m$ und $b$ im Sachzusammenhang und vergleichst Angebote.',
  intro:
    'Viele Situationen im Alltag sind linear: ein fester Betrag plus ein gleichbleibender Betrag pro Einheit, ein gleichmäßig gefüllter Behälter, eine Fahrt mit konstanter Geschwindigkeit. Dann ist $b$ der Startwert und $m$ die Änderung pro Einheit.',
  rules: [
    { term: 'Startwert $b$', explanation: 'Wert zu Beginn bzw. bei $x = 0$: Grundgebühr, Anfangsfüllung, Startposition.' },
    { term: 'Änderungsrate $m$', explanation: 'Änderung pro Einheit: Preis pro Kilometer, Liter pro Minute, Kilometer pro Stunde.' },
    { term: 'Angebote vergleichen', explanation: 'Funktionen gleichsetzen: Am Schnittpunkt sind beide gleich teuer; davor und danach ist jeweils ein anderes günstiger.' },
    { term: 'Modellgrenzen', explanation: 'Ein lineares Modell gilt nur in einem sinnvollen Bereich, z. B. nicht für negative Zeiten oder einen überlaufenden Tank.' },
  ],
  materials: [videoPlaceholder('lf-anwendungen-v1', 'Lineare Funktionen im Alltag')],
  example: {
    problem: 'Anbieter A: $5$ € Grundgebühr, $0{,}50$ € pro km. Anbieter B: keine Grundgebühr, $0{,}75$ € pro km. Ab wie vielen Kilometern ist A günstiger?',
    steps: [
      { text: 'Funktionen:', math: 'A(x) = 0{,}5x + 5,\\quad B(x) = 0{,}75x' },
      { text: 'Gleichsetzen:', math: '0{,}5x + 5 = 0{,}75x \\;\\Rightarrow\\; x = 20' },
      { text: 'Für $x > 20$ wächst B schneller, also ist dann A günstiger.' },
    ],
    result: 'Ab $20$ km ist Anbieter A günstiger.',
  },
  summary: ['$b$ = Startwert, $m$ = Änderung pro Einheit.', 'Angebote vergleichen: gleichsetzen, Schnittpunkt deuten.', 'Auf den sinnvollen Bereich des Modells achten.'],
  exercises: [
    {
      id: 'lf-aw-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 1,
      prompt: 'Die Kosten eines Stromtarifs sind $K(x) = 0{,}30x + 12$ (in €, $x$ in kWh). Was bedeutet die $12$?',
      choices: [
        { id: 'a', label: 'Der monatliche Grundpreis von $12$ €' },
        { id: 'b', label: 'Der Preis pro Kilowattstunde' },
        { id: 'c', label: 'Der Verbrauch von $12$ kWh' },
        { id: 'd', label: 'Die Kosten für $30$ kWh' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was zahlt man bei $x = 0$?', '$K(0) = 12$', 'Der feste Betrag ist unabhängig vom Verbrauch.'],
      solution: { steps: [{ text: '$K(0) = 12$: Auch ohne Verbrauch fallen $12$ € an – der Grundpreis.' }], finalAnswer: 'Grundpreis' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit der Steigung verwechselt', feedback: 'Der Preis pro kWh steht vor dem $x$: $0{,}30$ €.', answers: ['b'] }],
    },
    {
      id: 'lf-aw-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Ein Pool wird gefüllt: $h(t) = 4t + 20$ ($h$ in cm, $t$ in Minuten). Was bedeutet die $4$?',
      choices: [
        { id: 'a', label: 'Das Wasser steigt pro Minute um $4$ cm.' },
        { id: 'b', label: 'Zu Beginn stehen $4$ cm Wasser im Pool.' },
        { id: 'c', label: 'Nach $4$ Minuten ist der Pool voll.' },
        { id: 'd', label: 'Der Pool ist $4$ m tief.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Die $4$ steht vor dem $t$.', 'Sie gibt die Änderung pro Minute an.', 'Vergleiche $h(0)$ und $h(1)$.'],
      solution: { steps: [{ text: '$4$ ist die Steigung: Pro Minute steigt der Wasserstand um $4$ cm. Zu Beginn stehen $20$ cm Wasser im Pool.' }], finalAnswer: 'Anstieg um $4$ cm pro Minute' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Startwert verwechselt', feedback: 'Der Startwert ist $h(0) = 20$ cm.', answers: ['b'] }],
    },
    {
      id: 'lf-aw-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Ein Tank mit $60$ Litern wird mit $5$ Litern pro Minute geleert: $V(t) = 60 - 5t$. Für welche Zeiten $t$ ist das Modell sinnvoll?',
      choices: [
        { id: 'a', label: '$0 \\le t \\le 12$' },
        { id: 'b', label: 'für alle $t$' },
        { id: 'c', label: '$t \\ge 0$' },
        { id: 'd', label: '$0 \\le t \\le 60$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Wann beginnt der Vorgang?', 'Wann ist der Tank leer? Löse $V(t) = 0$.', 'Negative Füllmengen gibt es nicht.'],
      solution: { steps: [{ text: 'Der Vorgang beginnt bei $t = 0$. Leer ist der Tank bei $60 - 5t = 0$, also $t = 12$.' }, { text: 'Danach würde das Modell negative Liter liefern – das ist sinnlos.' }], finalAnswer: '$0 \\le t \\le 12$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Modellgrenzen übersehen', feedback: 'Nach $12$ Minuten ist der Tank leer – das Modell gilt nur bis dahin.', answers: ['b', 'c'] }],
    },
    {
      id: 'lf-aw-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: 'Ein Zug fährt um 9:00 Uhr in Köln ab und fährt mit $120$ km/h Richtung Hamburg (Entfernung $420$ km). Wie viele Kilometer ist er um 11:30 Uhr noch von Hamburg entfernt?',
      answer: { kind: 'numeric', value: 120, tolerance: 0.001, unit: 'km' },
      hints: ['Fahrzeit bis 11:30 Uhr: $2{,}5$ Stunden.', 'Zurückgelegt: $120 \\cdot 2{,}5$ km.', 'Restweg: $420 - 300$'],
      solution: { steps: [{ text: 'Entfernung zu Hamburg:', math: 'd(t) = 420 - 120t' }, { text: 'Nach $2{,}5$ h:', math: 'd(2{,}5) = 420 - 300 = 120' }], finalAnswer: '$120$ km' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gefahrene statt verbleibende Strecke', feedback: 'Gefragt ist, wie weit es noch bis Hamburg ist.', answers: ['300'] }],
    },
    {
      id: 'lf-aw-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Anna startet um 8:00 Uhr zu Hause und joggt mit $9$ km/h. Ihr Bruder fährt um 8:20 Uhr mit dem Rad mit $15$ km/h hinterher. Nach wie vielen Minuten ab 8:00 Uhr holt er sie ein?',
      answer: { kind: 'numeric', value: 50, tolerance: 0.001, unit: 'min' },
      hints: ['Rechne in Stunden: 8:20 Uhr ist $t = \\frac{1}{3}$.', 'Anna: $s(t) = 9t$, Bruder: $s(t) = 15\\left(t - \\frac{1}{3}\\right)$', 'Gleichsetzen: $9t = 15t - 5$.'],
      solution: { steps: [{ text: 'Gleichsetzen:', math: '9t = 15t - 5 \\;\\Rightarrow\\; t = \\frac{5}{6}\\,\\text{h}' }, { text: 'In Minuten:', math: '\\frac{5}{6} \\cdot 60 = 50' }], finalAnswer: 'nach $50$ Minuten (um 8:50 Uhr)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Ab Start des Bruders gerechnet', feedback: 'Gefragt ist die Zeit ab 8:00 Uhr – der Bruder ist erst $30$ Minuten unterwegs.', answers: ['30'] }],
    },
    {
      id: 'lf-aw-6',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Welche Situation lässt sich **nicht** gut mit einer linearen Funktion beschreiben?',
      choices: [
        { id: 'a', label: 'Die Größe eines Kindes in Abhängigkeit vom Alter (0 bis 18 Jahre)' },
        { id: 'b', label: 'Taxikosten in Abhängigkeit von der Strecke' },
        { id: 'c', label: 'Füllhöhe eines Aquariums bei gleichmäßigem Zulauf' },
        { id: 'd', label: 'Weg eines Autos bei konstanter Geschwindigkeit' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Linear heißt: pro Einheit immer dieselbe Änderung.', 'Wächst ein Kind jedes Jahr gleich viel?', 'Babys wachsen schnell, Jugendliche irgendwann gar nicht mehr.'],
      solution: { steps: [{ text: 'Kinder wachsen nicht jedes Jahr gleich viel – das Wachstum ist nicht gleichmäßig. Die anderen Situationen haben eine konstante Änderungsrate.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Grundgebühr als „nicht linear“ angesehen', feedback: 'Ein fester Betrag plus gleicher Preis pro Kilometer ist linear: $K(x) = mx + b$.', answers: ['b'] }],
    },
    {
      id: 'lf-aw-7',
      subtopicId: S,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      prompt: 'Für einen Fahrradverleih gilt $K(x) = 4x + 6$ ($K$ in €, $x$ in Stunden). Was kostet eine Leihe über $3$ Stunden?',
      answer: { kind: 'numeric', value: 18, tolerance: 0.001, unit: '€' },
      hints: ['Gesucht ist $K(3)$.', '$4 \\cdot 3 = 12$', 'Die Leihgebühr kommt dazu.'],
      solution: { steps: [{ text: 'Einsetzen:', math: 'K(3) = 4 \\cdot 3 + 6 = 18' }], finalAnswer: '$18$ €' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Leihgebühr vergessen', feedback: 'Die $6$ € fallen zusätzlich an.', answers: ['12'] }],
    },
    {
      id: 'lf-aw-8',
      subtopicId: S,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Aquarium enthält $40$ Liter und wird mit $6$ Litern pro Minute gefüllt; gleichzeitig laufen durch ein Leck $1{,}5$ Liter pro Minute ab. Stelle die Gleichung für die Wassermenge $y$ (in Litern) nach $x$ Minuten auf.',
      answer: { kind: 'linear', m: 4.5, b: 40, tolerance: 0.001 },
      hints: ['Wie viel Wasser kommt pro Minute netto dazu?', '$6 - 1{,}5 = 4{,}5$', 'Startwert sind die $40$ Liter.'],
      solution: { steps: [{ text: 'Netto-Zufluss pro Minute: $6 - 1{,}5 = 4{,}5$ Liter ⇒ $m = 4{,}5$. Start: $b = 40$.' }], finalAnswer: '$y = 4{,}5x + 40$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Abfluss nicht berücksichtigt', feedback: 'Das Leck verringert die Zunahme pro Minute.', answers: ['y = 6x + 40'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-aw-kosten',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const t = r.pick(TARIFFS);
        return { t, m: r.pick(t.ms), b: r.pick(t.bs), x: r.int(2, 12) };
      },
      build: ({ t, m, b, x }) => {
        const k = round(m * x + b);
        return {
          prompt: `${t.name} verlangt $${num(b)}$ € ${t.base} und $${num(m)}$ € pro ${t.unitLong}. Was kosten $${x}$ ${t.unit} (in €)?`,
          answer: { kind: 'numeric', value: k, tolerance: 0.001, unit: '€' },
          hints: [`$K(x) = ${num(m)}x + ${num(b)}$`, `Setze $x = ${x}$ ein.`, `$${num(m)} \\cdot ${x} = ${num(m * x)}$`],
          solution: { steps: [{ text: 'Einsetzen:', math: `K(${x}) = ${num(m)} \\cdot ${x} + ${num(b)} = ${num(k)}` }], finalAnswer: `$${num(k)}$ €` },
          commonMistakes: [{ description: 'Fester Betrag vergessen', feedback: `Die ${t.base} kommt immer dazu.`, answers: [txt(m * x)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-aw-aufstellen',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'application',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const t = r.pick(TARIFFS);
        return { t, m: r.pick(t.ms), b: r.pick(t.bs) };
      },
      build: ({ t, m, b }) => ({
        prompt: `${t.name} berechnet $${num(m)}$ € pro ${t.unitLong} und zusätzlich $${num(b)}$ € ${t.base}. Gib die Kostenfunktion $y$ (in €) in Abhängigkeit von $x$ (in ${t.unit}) an.`,
        answer: { kind: 'linear', m, b, tolerance: 0.001 },
        hints: ['Der Preis pro Einheit ist die Steigung.', 'Der feste Betrag ist der $y$-Achsenabschnitt.', `$y = ${num(m)}x + \\ldots$`],
        solution: { steps: [{ text: `$m = ${num(m)}$ (pro ${t.unitLong}), $b = ${num(b)}$ (${t.base}).` }], finalAnswer: `$${yx(m, b)}$` },
        commonMistakes: [{ description: 'm und b vertauscht', feedback: 'Was pro Einheit anfällt, steht vor dem $x$.', answers: [`y = ${txt(b)}x + ${txt(m)}`] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-aw-bewegung',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => {
        const who = r.pick([
          { name: 'Ein Radfahrer', v: [12, 15, 18, 20] },
          { name: 'Eine Wandergruppe', v: [3, 4, 5] },
          { name: 'Ein Lkw', v: [60, 70, 80] },
          { name: 'Ein Inlineskater', v: [10, 12, 14] },
        ]);
        return { name: who.name, v: r.pick(who.v), s0: r.pick([2, 5, 8, 10, 15]), t: r.pick([1.5, 2, 2.5, 3, 4]) };
      },
      build: ({ name, v, s0, t }) => {
        const s = round(s0 + v * t);
        return {
          prompt: `${name} ist zu Beginn $${s0}$ km vom Startort entfernt und entfernt sich gleichmäßig mit $${v}$ km/h weiter. Wie weit ist ${name.toLowerCase().startsWith('eine') ? 'sie' : 'er'} nach $${num(t)}$ Stunden vom Startort entfernt (in km)?`,
          answer: { kind: 'numeric', value: s, tolerance: 0.001, unit: 'km' },
          hints: [`$s(t) = ${v}t + ${s0}$`, `Setze $t = ${num(t)}$ ein.`, `$${v} \\cdot ${num(t)} = ${num(v * t)}$`],
          solution: { steps: [{ text: 'Einsetzen:', math: `s(${num(t)}) = ${v} \\cdot ${num(t)} + ${s0} = ${num(s)}` }], finalAnswer: `$${num(s)}$ km` },
          commonMistakes: [{ description: 'Startentfernung vergessen', feedback: `Zu Beginn ist die Entfernung schon $${s0}$ km.`, answers: s0 ? [txt(v * t)] : [] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-aw-vergleich',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Angebote vergleichen'],
      params: (r) => {
        const pB = r.pick([0.4, 0.5, 0.6, 0.8, 1]);
        const pA = round(pB - r.pick([0.1, 0.2, 0.25]), 2);
        const x = r.pick([20, 25, 40, 50, 60, 80]);
        return { pA, pB, gA: round((pB - pA) * x, 2), x, unit: r.pick(['km', 'Minuten', 'kWh']) };
      },
      build: ({ pA, pB, gA, x, unit }) => ({
        prompt: `Angebot A kostet $${num(gA)}$ € Grundgebühr und $${num(pA)}$ € pro Einheit, Angebot B hat keine Grundgebühr und kostet $${num(pB)}$ € pro Einheit. Ab wie vielen ${unit} ist Angebot A günstiger? (Gib die Anzahl an, bei der beide gleich viel kosten.)`,
        answer: { kind: 'numeric', value: x, tolerance: 0.001 },
        hints: [`$A(x) = ${num(pA)}x + ${num(gA)}$, $B(x) = ${num(pB)}x$`, 'Setze $A(x) = B(x)$.', `$${num(gA)} = ${num(round(pB - pA, 2))}x$`],
        solution: {
          steps: [
            { text: 'Gleichsetzen:', math: `${num(pA)}x + ${num(gA)} = ${num(pB)}x` },
            { text: 'Auflösen:', math: `${num(gA)} = ${num(round(pB - pA, 2))}x \\;\\Rightarrow\\; x = ${x}` },
            { text: 'Danach steigt B schneller, also ist A ab dort günstiger.' },
          ],
          finalAnswer: `ab $${x}$ ${unit}`,
        },
        commonMistakes: [{ description: 'Durch den Preis von A geteilt', feedback: 'Teile die Grundgebühr durch den Preisunterschied pro Einheit.', answers: [txt(round(gA / pA, 2))] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-aw-b-deuten',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const t = r.pick(TARIFFS);
        return { t, m: r.pick(t.ms), b: r.pick(t.bs) };
      },
      build: ({ t, m, b }, r) => {
        const { choices, correctId } = shuffledChoices(r, `die ${t.base} von $${num(b)}$ €`, [`den Preis von $${num(b)}$ € pro ${t.unitLong}`, `die Kosten für $${num(m)}$ ${t.unit}`, `$${num(b)}$ ${t.unit} kostenlos`]);
        return {
          prompt: `${t.name} rechnet mit $K(x) = ${num(m)}x + ${num(b)}$ ($K$ in €, $x$ in ${t.unit}). Was beschreibt die Zahl $${num(b)}$?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Berechne $K(0)$.', 'Dieser Betrag fällt an, bevor überhaupt etwas genutzt wurde.', 'Der Preis pro Einheit steht vor dem $x$.'],
          solution: { steps: [{ text: `$K(0) = ${num(b)}$: der feste Betrag, also die ${t.base}.` }], finalAnswer: `die ${t.base}` },
          commonMistakes: [{ description: 'Mit dem Preis pro Einheit verwechselt', feedback: `Der Preis pro ${t.unitLong} ist $${num(m)}$ € (vor dem $x$).`, answers: choices.filter((c) => c.label.startsWith('den Preis')).map((c) => c.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-aw-m-deuten',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      objectives: OBJ,
      params: (r) =>
        r.pick([
          { f: 'h(t) = {m}t + {b}', what: 'die Füllhöhe eines Beckens in cm nach $t$ Minuten', right: 'Die Füllhöhe steigt pro Minute um {m} cm.', m: r.pick([2, 3, 5]), b: r.pick([10, 20, 30]) },
          { f: 's(t) = {m}t + {b}', what: 'die Entfernung eines Busses vom Depot in km nach $t$ Stunden', right: 'Der Bus fährt {m} km pro Stunde.', m: r.pick([40, 50, 60]), b: r.pick([5, 10, 15]) },
          { f: 'V(t) = {b} - {m}t', what: 'die Heizölmenge in Litern nach $t$ Tagen', right: 'Pro Tag werden {m} Liter verbraucht.', m: r.pick([15, 20, 25]), b: r.pick([2000, 2500, 3000]) },
          { f: 'G(x) = {m}x + {b}', what: 'das Gewicht eines Pakets in kg mit $x$ Büchern', right: 'Jedes Buch wiegt {m} kg.', m: r.pick([0.4, 0.5, 0.8]), b: r.pick([1, 1.5, 2]) },
        ]),
      build: ({ f, what, right, m, b }, r) => {
        const fill = (s: string) => s.replace(/\{m\}/g, num(m)).replace(/\{b\}/g, num(b));
        const rightText = right.replace('{m}', `$${num(m)}$`);
        const { choices, correctId } = shuffledChoices(r, rightText, [`Zu Beginn beträgt der Wert $${num(m)}$.`, `Nach $${num(m)}$ Einheiten ist der Vorgang beendet.`, `Der Wert ändert sich pro Einheit um $${num(b)}$.`]);
        return {
          prompt: `Die Funktion $${fill(f)}$ beschreibt ${what}. Was bedeutet die Zahl $${num(m)}$?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Die Zahl vor der Variablen ist die Änderungsrate.', 'Vergleiche den Wert nach $0$ und nach $1$ Einheit.', 'Der feste Summand ist der Startwert.'],
          solution: { steps: [{ text: `$${num(m)}$ ist die Änderung pro Einheit: ${rightText}` }], finalAnswer: rightText },
          commonMistakes: [{ description: 'Mit dem Startwert verwechselt', feedback: `Der Startwert ist $${num(b)}$ – die Zahl ohne Variable.`, answers: choices.filter((c) => c.label.startsWith('Zu Beginn')).map((c) => c.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-aw-fuellen',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: OBJ,
      params: (r) => {
        const rate = r.pick([2, 2.5, 3, 4, 5]);
        const t = r.pick([8, 10, 12, 16, 20]);
        const h0 = r.pick([10, 15, 20, 25]);
        return { rate, t, h0, what: r.pick(['Ein Planschbecken', 'Ein Aquarium', 'Eine Regentonne']) };
      },
      build: ({ rate, t, h0, what }) => {
        const H = round(h0 + rate * t);
        return {
          prompt: `${what} ist $${num(H)}$ cm hoch. Zu Beginn steht das Wasser $${h0}$ cm hoch, und es steigt pro Minute um $${num(rate)}$ cm. Nach wie vielen Minuten ist es voll?`,
          answer: { kind: 'numeric', value: t, tolerance: 0.001, unit: 'min' },
          hints: [`$h(t) = ${num(rate)}t + ${h0}$`, `Gesucht ist $t$ mit $h(t) = ${num(H)}$.`, `$${num(rate)}t = ${num(H - h0)}$`],
          solution: { steps: [{ text: 'Gleichung:', math: `${num(rate)}t + ${h0} = ${num(H)}` }, { text: 'Auflösen:', math: `${num(rate)}t = ${num(H - h0)} \\;\\Rightarrow\\; t = ${t}` }], finalAnswer: `nach $${t}$ Minuten` },
          commonMistakes: [{ description: 'Anfangsfüllung vergessen', feedback: `Es fehlen nur noch $${num(H - h0)}$ cm, weil schon $${h0}$ cm Wasser drin sind.`, answers: [txt(round(H / rate, 2))] }],
        };
      },
    }),
  ],
};
