import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, round, txt } from '../templates';
import { plane, READABLE_SLOPES, TOPIC_ID } from './shared';

const S = 'lf-proportional';
const OBJ = ['Proportionale Funktionen erkennen', 'Steigung einer Ursprungsgeraden bestimmen'];
const YES_NO = [
  { id: 'a', label: 'Ja' },
  { id: 'b', label: 'Nein' },
];

export const proportional: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 2,
  title: 'Proportionale Funktionen',
  description: 'Funktionen der Form $f(x) = mx$: Ursprungsgeraden, Quotientengleichheit, Preis pro Stück.',
  objective: 'Du erkennst proportionale Zusammenhänge, bestimmst den Faktor $m$ und rechnest damit.',
  intro:
    'Bei einer proportionalen Funktion gehört zum doppelten $x$ das doppelte $y$, zum dreifachen $x$ das dreifache $y$. Der Quotient $\\frac{y}{x}$ ist immer gleich – das ist die Steigung $m$. Der Graph ist eine Gerade durch den Ursprung.',
  rules: [
    { term: 'Proportionale Funktion', explanation: 'Funktionsgleichung der Form', math: 'f(x) = m \\cdot x' },
    { term: 'Steigung $m$', explanation: 'Quotient aus $y$ und $x$ für jeden Punkt außer dem Ursprung:', math: 'm = \\frac{y}{x}' },
    { term: 'Graph', explanation: 'Eine Gerade durch den Ursprung $(0\\,|\\,0)$.' },
    { term: 'Quotientengleichheit', explanation: 'In einer Wertetabelle ist $\\frac{y}{x}$ bei allen Paaren gleich.' },
  ],
  materials: [videoPlaceholder('lf-proportional-v1', 'Proportionale Funktionen')],
  example: {
    problem: 'Die Ursprungsgerade geht durch $P(4\\,|\\,6)$. Bestimme ihre Gleichung.',
    steps: [
      { text: 'Steigung als Quotient:', math: 'm = \\frac{6}{4} = 1{,}5' },
      { text: 'Gleichung:', math: 'f(x) = 1{,}5x' },
    ],
    result: '$f(x) = 1{,}5x$',
  },
  summary: ['$f(x) = mx$ – Graph ist eine Ursprungsgerade.', '$m = \\frac{y}{x}$ für jeden Punkt auf der Geraden.', 'Doppeltes $x$ ⇒ doppeltes $y$.'],
  exercises: [
    {
      id: 'lf-pr-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Funktion ist proportional?',
      choices: [
        { id: 'a', label: '$f(x) = 3x$' },
        { id: 'b', label: '$f(x) = 3x + 1$' },
        { id: 'c', label: '$f(x) = x^2$' },
        { id: 'd', label: '$f(x) = \\frac{3}{x}$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Proportional heißt: $f(x) = m \\cdot x$ ohne Summand.', 'Setze $x = 0$ ein: Was muss herauskommen?', 'Nur eine Gleichung hat die Form $mx$.'],
      solution: { steps: [{ text: 'Nur $f(x) = 3x$ hat die Form $mx$. Bei $3x + 1$ ist $f(0) = 1$, der Graph geht nicht durch den Ursprung.' }], finalAnswer: '$f(x) = 3x$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Lineare mit proportionaler Funktion verwechselt', feedback: '$3x + 1$ ist linear, aber nicht proportional: Der Graph geht nicht durch den Ursprung.', answers: ['b'] }],
    },
    {
      id: 'lf-pr-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie sieht der Graph einer proportionalen Funktion aus?',
      choices: [
        { id: 'a', label: 'Eine Gerade durch den Ursprung' },
        { id: 'b', label: 'Eine Gerade, die die $y$-Achse bei $1$ schneidet' },
        { id: 'c', label: 'Eine Parabel' },
        { id: 'd', label: 'Eine waagerechte Gerade' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was ist $f(0)$ bei $f(x) = mx$?', '$f(0) = m \\cdot 0 = 0$', 'Der Punkt $(0\\,|\\,0)$ liegt immer auf dem Graphen.'],
      solution: { steps: [{ text: 'Wegen $f(0) = 0$ geht der Graph immer durch den Ursprung; er ist eine Gerade.' }], finalAnswer: 'Ursprungsgerade' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Waagerechte Gerade gewählt', feedback: 'Eine waagerechte Gerade (außer der $x$-Achse) geht nicht durch den Ursprung.', answers: ['d'] }],
    },
    {
      id: 'lf-pr-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Die Wertetabelle lautet $x$: 1, 2, 4 und $y$: 3, 6, 12. Ist die Zuordnung proportional?',
      choices: [
        { id: 'a', label: 'Ja, mit $m = 3$' },
        { id: 'b', label: 'Ja, mit $m = \\frac{1}{3}$' },
        { id: 'c', label: 'Nein, weil die $y$-Werte nicht gleichmäßig wachsen' },
        { id: 'd', label: 'Nein, weil $x = 3$ fehlt' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Berechne für jedes Paar $\\frac{y}{x}$.', '$\\frac{3}{1}$, $\\frac{6}{2}$, $\\frac{12}{4}$', 'Alle Quotienten sind gleich.'],
      solution: { steps: [{ text: 'Quotienten: $\\frac{3}{1} = \\frac{6}{2} = \\frac{12}{4} = 3$. Alle gleich ⇒ proportional mit $m = 3$.' }], finalAnswer: 'Ja, $m = 3$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Kehrwert gebildet', feedback: 'Die Steigung ist $\\frac{y}{x}$, nicht $\\frac{x}{y}$.', answers: ['b'] }],
    },
    {
      id: 'lf-pr-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Die Wertetabelle lautet $x$: 2, 4, 6 und $y$: 5, 9, 13. Ist die Zuordnung proportional?',
      choices: [
        { id: 'a', label: 'Ja, denn $y$ wächst jedes Mal um $4$.' },
        { id: 'b', label: 'Nein, denn die Quotienten $\\frac{y}{x}$ sind verschieden.' },
        { id: 'c', label: 'Ja, mit $m = 2{,}5$.' },
        { id: 'd', label: 'Das kann man nicht entscheiden.' },
      ],
      answer: { kind: 'choice', correct: 'b' },
      hints: ['Berechne $\\frac{5}{2}$ und $\\frac{9}{4}$.', 'Gleichmäßiges Wachstum heißt noch nicht proportional.', 'Prüfe auch: Was wäre $f(0)$?'],
      solution: { steps: [{ text: '$\\frac{5}{2} = 2{,}5$, aber $\\frac{9}{4} = 2{,}25$ ⇒ nicht proportional.' }, { text: 'Die Zuordnung ist linear ($y = 2x + 1$), geht aber nicht durch den Ursprung.' }], finalAnswer: 'Nein' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Gleichmäßiges Wachstum für proportional gehalten', feedback: 'Gleich große Zuwächse bedeuten „linear“. Proportional ist es nur, wenn zusätzlich $f(0) = 0$ gilt.', answers: ['a', 'c'] }],
    },
    {
      id: 'lf-pr-5',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      prompt: '$4$ Brötchen kosten $1{,}60$ €. Was kosten $7$ Brötchen (in €)?',
      answer: { kind: 'numeric', value: 2.8, tolerance: 0.001, unit: '€' },
      hints: ['Berechne zuerst den Preis für ein Brötchen.', '$1{,}60 : 4 = 0{,}40$', 'Multipliziere mit $7$.'],
      solution: { steps: [{ text: 'Preis pro Brötchen:', math: 'm = \\frac{1{,}60}{4} = 0{,}40' }, { text: 'Für 7 Brötchen:', math: 'f(7) = 0{,}40 \\cdot 7 = 2{,}80' }], finalAnswer: '$2{,}80$ €' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Differenz statt Verhältnis', feedback: 'Bei proportionalen Zuordnungen rechnet man mit dem Preis pro Stück, nicht mit Differenzen.', answers: ['4,6'] }],
    },
    {
      id: 'lf-pr-6',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      prompt: 'Ein Liter Benzin kostet $1{,}80$ €, also $f(x) = 1{,}8x$. Was kosten $35$ Liter (in €)?',
      answer: { kind: 'numeric', value: 63, tolerance: 0.001, unit: '€' },
      hints: ['Gesucht ist $f(35)$.', 'Rechne $1{,}8 \\cdot 35$.', '$1{,}8 \\cdot 35 = 63$'],
      solution: { steps: [{ text: 'Einsetzen:', math: 'f(35) = 1{,}8 \\cdot 35 = 63' }], finalAnswer: '$63$ €' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Durch den Preis geteilt', feedback: 'Für mehr Liter zahlt man mehr: multiplizieren, nicht teilen.', answers: ['19,44'] }],
    },
    {
      id: 'lf-pr-7',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: 'Bei einer proportionalen Funktion wird $x$ verdreifacht. Was passiert mit $y$?',
      choices: [
        { id: 'a', label: '$y$ wird verdreifacht.' },
        { id: 'b', label: '$y$ wächst um $3$.' },
        { id: 'c', label: '$y$ wird gedrittelt.' },
        { id: 'd', label: 'Das hängt von $m$ ab.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Vergleiche $f(x) = mx$ und $f(3x)$.', '$f(3x) = m \\cdot 3x$', '$m \\cdot 3x = 3 \\cdot (mx)$'],
      solution: { steps: [{ text: '$f(3x) = m \\cdot 3x = 3 \\cdot mx = 3 \\cdot f(x)$ – für jedes $m$.' }], finalAnswer: '$y$ wird verdreifacht.' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Additiv gedacht', feedback: 'Proportional heißt: Vervielfachen von $x$ vervielfacht $y$ – nicht „plus 3“.', answers: ['b'] }],
    },
    {
      id: 'lf-pr-8',
      subtopicId: S,
      type: 'text',
      requirement: 'knowledge',
      difficulty: 2,
      prompt: 'Wie nennt man den Faktor $m$ in $f(x) = mx$? (ein Fachbegriff)',
      answer: { kind: 'text', accepted: ['Steigung', 'Proportionalitätsfaktor', 'Proportionalitaetsfaktor', 'Proportionalitätskonstante'] },
      hints: ['Er gibt an, wie steil der Graph ist.', 'Man liest ihn mit dem Steigungsdreieck ab.', 'Stei…'],
      solution: { steps: [{ text: '$m$ heißt Steigung (bei proportionalen Zuordnungen auch Proportionalitätsfaktor).' }], finalAnswer: 'Steigung' },
      objectives: OBJ,
      commonMistakes: [{ description: 'y-Achsenabschnitt genannt', feedback: 'Der $y$-Achsenabschnitt ist $b$ in $mx + b$. Bei proportionalen Funktionen ist er $0$.', answers: ['y-Achsenabschnitt', 'Achsenabschnitt'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lf-pr-m',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const m = r.int(2, 9) * r.sign();
        const x = r.int(1, 9) * r.sign();
        return { m, x };
      },
      build: ({ m, x }) => ({
        prompt: `Eine Ursprungsgerade geht durch $P(${x}\\,|\\,${m * x})$. Bestimme ihre Steigung $m$.`,
        answer: { kind: 'numeric', value: m, tolerance: 0.001 },
        hints: ['Bei Ursprungsgeraden gilt $m = \\frac{y}{x}$.', `Rechne $\\frac{${m * x}}{${x}}$.`, 'Achte auf das Vorzeichen.'],
        solution: { steps: [{ text: 'Quotient bilden:', math: `m = \\frac{${m * x}}{${x}} = ${m}` }], finalAnswer: `$m = ${m}$` },
        commonMistakes: [{ description: 'Kehrwert gebildet', feedback: 'Es heißt $m = \\frac{y}{x}$ – der $y$-Wert steht oben.', answers: [txt(round(x / (m * x), 4))] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-pr-m-dez',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([0.5, 1.5, 2.5, -0.5, -1.5, 0.25, 0.75, -2.5, 1.25]), x: r.int(1, 6) * 4 * r.sign() }),
      build: ({ m, x }) => ({
        prompt: `Eine Ursprungsgerade geht durch $P(${x}\\,|\\,${num(m * x)})$. Bestimme ihre Steigung $m$ als Dezimalzahl.`,
        answer: { kind: 'numeric', value: m, tolerance: 0.001 },
        hints: ['$m = \\frac{y}{x}$', `Rechne $${num(m * x)} : ${x < 0 ? `(${x})` : x}$.`, 'Das Ergebnis darf eine Dezimalzahl sein.'],
        solution: { steps: [{ text: 'Quotient bilden:', math: `m = \\frac{${num(m * x)}}{${x}} = ${num(m)}` }], finalAnswer: `$m = ${num(m)}$` },
        commonMistakes: [{ description: 'Kehrwert gebildet', feedback: 'Es heißt $m = \\frac{y}{x}$.', answers: [txt(round(1 / m, 4))] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-pr-x',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 2,
      objectives: OBJ,
      params: (r) => ({ m: r.pick([2, 3, 4, 5, 0.5, 2.5, -2, -4]), x: r.int(2, 12) * r.sign() }),
      build: ({ m, x }) => ({
        prompt: `Für $f(x) = ${linearTerm(m, 0)}$ gilt $f(x) = ${num(m * x)}$. Bestimme $x$.`,
        answer: { kind: 'numeric', value: x, tolerance: 0.001 },
        hints: [`Löse $${linearTerm(m, 0)} = ${num(m * x)}$.`, `Teile durch $${num(m)}$.`, 'Achte auf das Vorzeichen.'],
        solution: { steps: [{ text: 'Gleichung lösen:', math: `${linearTerm(m, 0)} = ${num(m * x)} \\;\\Rightarrow\\; x = \\frac{${num(m * x)}}{${num(m)}} = ${x}` }], finalAnswer: `$x = ${x}$` },
        commonMistakes: [{ description: 'Multipliziert statt geteilt', feedback: 'Um $x$ zu erhalten, teilst du durch $m$.', answers: [txt(m * m * x)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-pr-graph',
      subtopicId: S,
      count: 10,
      type: 'equation',
      requirement: 'construction',
      difficulty: 2,
      objectives: [...OBJ, 'Funktionsgleichung aus dem Graphen ablesen'],
      params: (r) => r.pick(READABLE_SLOPES.filter(([p, q]) => Math.abs(p) <= 4 && q <= 3)),
      build: ([p, q]) => {
        const m = p / q;
        return {
          prompt: `Die abgebildete Ursprungsgerade geht durch $P(${q}\\,|\\,${p})$. Lies ihre Gleichung ab und gib sie in der Form $y = mx$ ein.`,
          figure: plane(`Koordinatensystem mit einer Geraden durch den Ursprung und den Punkt (${q}|${p}).`, [{ m, b: 0 }], [{ x: q, y: p, label: `P(${q}|${p})` }]),
          answer: { kind: 'linear', m, b: 0, tolerance: 0.001 },
          hints: ['Die Gerade geht durch den Ursprung, also $y = mx$.', `Vom Ursprung zu $P$: $${q}$ nach rechts und $${p}$ nach ${p > 0 ? 'oben' : 'unten'}.`, `$m = \\frac{${p}}{${q}}$`],
          solution: { steps: [{ text: 'Steigung über den Punkt $P$:', math: `m = \\frac{${p}}{${q}}${q === 1 ? '' : ` = ${num(m, 3)}`}` }, { text: 'Gleichung:', math: `y = ${linearTerm(round(m, 4), 0)}` }], finalAnswer: `$y = ${q === 1 ? linearTerm(m, 0) : `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}x`}$` },
          commonMistakes: [{ description: 'Kehrwert abgelesen', feedback: 'Steigung = nach oben (bzw. unten) geteilt durch nach rechts.', answers: [`y = ${txt(round(q / p, 4))}x`] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-pr-preis',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 1,
      objectives: [...OBJ, 'Proportionale Zuordnungen im Alltag'],
      params: (r) => {
        const [thing, unit, price] = r.pick([
          ['Äpfel', 'kg', [1.5, 2, 2.5, 3]],
          ['Kartoffeln', 'kg', [1.2, 1.5, 2]],
          ['Stoff', 'm', [4, 5, 6, 8]],
          ['Kabel', 'm', [1.5, 2.5, 3]],
          ['Hackfleisch', 'kg', [8, 9, 10, 12]],
        ] as const);
        return { thing, unit, price: r.pick(price), amount: r.int(2, 9) };
      },
      build: ({ thing, unit, price, amount }) => ({
        prompt: `$1$ ${unit} ${thing} kostet $${num(price)}$ €. Was kosten $${amount}$ ${unit} (in €)?`,
        answer: { kind: 'numeric', value: round(price * amount), tolerance: 0.001, unit: '€' },
        hints: ['Der Preis ist proportional zur Menge.', `$f(x) = ${num(price)}x$`, `Rechne $${num(price)} \\cdot ${amount}$.`],
        solution: { steps: [{ text: 'Proportionale Funktion:', math: `f(${amount}) = ${num(price)} \\cdot ${amount} = ${num(price * amount)}` }], finalAnswer: `$${num(price * amount)}$ €` },
        commonMistakes: [{ description: 'Addiert statt multipliziert', feedback: 'Jede weitere Einheit kostet den vollen Preis: multiplizieren.', answers: [txt(price + amount)] }],
      }),
    }),
    ...fromTemplate({
      id: 'lf-pr-menge',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Proportionale Zuordnungen im Alltag'],
      params: (r) => {
        const [what, unit] = r.pick([
          ['Saft', 'Liter'],
          ['Benzin', 'Liter'],
          ['Farbe', 'Liter'],
          ['Käse', 'kg'],
        ] as const);
        const unitPrice = r.pick([1.2, 1.5, 1.8, 2.4, 3.5, 4.5]);
        return { what, unit, unitPrice, a: r.int(2, 6), c: r.int(3, 15) };
      },
      build: ({ what, unit, unitPrice, a, c }) => {
        const pa = round(unitPrice * a);
        const pc = round(unitPrice * c);
        return {
          prompt: `$${a}$ ${unit} ${what} kosten $${num(pa)}$ €. Wie viele ${unit} bekommt man für $${num(pc)}$ €?`,
          answer: { kind: 'numeric', value: c, tolerance: 0.001, unit },
          hints: [`Berechne den Preis für $1$ ${unit}: $${num(pa)} : ${a}$.`, `$m = ${num(unitPrice)}$ € pro ${unit}`, `Teile $${num(pc)}$ durch $${num(unitPrice)}$.`],
          solution: {
            steps: [
              { text: `Preis pro ${unit}:`, math: `m = \\frac{${num(pa)}}{${a}} = ${num(unitPrice)}` },
              { text: 'Gesuchte Menge:', math: `x = \\frac{${num(pc)}}{${num(unitPrice)}} = ${c}` },
            ],
            finalAnswer: `$${c}$ ${unit}`,
          },
          commonMistakes: [{ description: 'Mit dem Preis multipliziert', feedback: 'Gesucht ist die Menge: Teile den Betrag durch den Preis pro Einheit.', answers: [txt(pc * unitPrice)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lf-pr-tabelle',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      objectives: [...OBJ, 'Quotientengleichheit prüfen'],
      params: (r) => {
        const m = r.int(2, 6);
        const xs = [r.int(1, 3), r.int(4, 6), r.int(7, 9)];
        const proportional = r.int(0, 1) === 1;
        const shift = proportional ? 0 : r.pick([1, 2, -1]);
        return { xs, ys: xs.map((x) => m * x + shift) };
      },
      build: ({ xs, ys }) => {
        const q = xs.map((x, i) => ys[i] / x);
        const prop = q.every((v) => Math.abs(v - q[0]) < 1e-9);
        return {
          prompt: `Ist die Zuordnung proportional? $x$: ${xs.join(', ')} und $y$: ${ys.join(', ')}.`,
          choices: YES_NO,
          answer: { kind: 'choice', correct: prop ? 'a' : 'b' },
          hints: ['Berechne für jedes Paar den Quotienten $\\frac{y}{x}$.', `$\\frac{${ys[0]}}{${xs[0]}}$, $\\frac{${ys[1]}}{${xs[1]}}$, $\\frac{${ys[2]}}{${xs[2]}}$`, 'Proportional nur, wenn alle Quotienten gleich sind.'],
          solution: { steps: [{ text: 'Quotienten:', math: xs.map((x, i) => `\\frac{${ys[i]}}{${x}} = ${num(ys[i] / x)}`).join(',\\; ') }, { text: prop ? 'Alle gleich ⇒ proportional.' : 'Nicht alle gleich ⇒ nicht proportional.' }], finalAnswer: prop ? 'Ja' : 'Nein' },
          commonMistakes: [{ description: 'Nur gleichmäßiges Wachstum geprüft', feedback: 'Entscheidend ist, ob alle Quotienten $\\frac{y}{x}$ gleich sind.', answers: [prop ? 'b' : 'a'] }],
        };
      },
    }),
  ],
};
