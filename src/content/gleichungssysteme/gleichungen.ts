import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, linearTerm, num, shuffledChoices, signedTerm, txt } from '../templates';
import { eq, TOPIC_ID } from './shared';

const S = 'lgs-gleichungen';
const OBJ = ['Lineare Gleichungen mit zwei Variablen verstehen'];
const YES_NO = [
  { id: 'a', label: 'Ja' },
  { id: 'b', label: 'Nein' },
];

export const gleichungen: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 1,
  title: 'Gleichungen mit zwei Variablen',
  description: 'Lösungspaare finden und prüfen, Gleichungen nach $y$ umstellen, Sachsituationen beschreiben.',
  objective: 'Du prüfst und bestimmst Lösungspaare einer linearen Gleichung mit zwei Variablen und stellst sie nach $y$ um.',
  intro:
    'Eine Gleichung wie $2x + y = 10$ hat nicht nur eine Lösung, sondern unendlich viele Zahlenpaare $(x\\,|\\,y)$: $(0\\,|\\,10)$, $(1\\,|\\,8)$, $(5\\,|\\,0)$ … Stellt man sie nach $y$ um, erhält man $y = -2x + 10$ – eine Gerade. Alle Lösungspaare liegen auf dieser Geraden.',
  rules: [
    { term: 'Lineare Gleichung mit zwei Variablen', explanation: '', math: 'ax + by = c' },
    { term: 'Lösungspaar', explanation: 'Ein Paar $(x\\,|\\,y)$, das beim Einsetzen eine wahre Aussage ergibt.' },
    { term: 'Nach $y$ umstellen', explanation: 'Für $b \\neq 0$:', math: 'y = -\\frac{a}{b}x + \\frac{c}{b}' },
    { term: 'Graph', explanation: 'Alle Lösungspaare bilden eine Gerade.' },
  ],
  materials: [videoPlaceholder('lgs-gleichungen-v1', 'Gleichungen mit zwei Variablen')],
  example: {
    problem: 'Ist $(3\\,|\\,4)$ eine Lösung von $2x + 3y = 18$? Stelle die Gleichung nach $y$ um.',
    steps: [
      { text: 'Einsetzen:', math: '2 \\cdot 3 + 3 \\cdot 4 = 6 + 12 = 18 \\;\\checkmark' },
      { text: 'Nach $y$ umstellen:', math: '3y = -2x + 18 \\;\\Rightarrow\\; y = -\\frac{2}{3}x + 6' },
    ],
    result: '$(3\\,|\\,4)$ ist eine Lösung; die Gerade ist $y = -\\frac{2}{3}x + 6$.',
  },
  summary: ['Eine lineare Gleichung mit zwei Variablen hat unendlich viele Lösungspaare.', 'Prüfen: einsetzen und vergleichen.', 'Umgestellt nach $y$ beschreibt sie eine Gerade.'],
  exercises: [
    {
      id: 'lgs-gl-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Wie viele Lösungspaare hat die Gleichung $x + y = 5$?',
      choices: [
        { id: 'a', label: 'unendlich viele' },
        { id: 'b', label: 'genau eins' },
        { id: 'c', label: 'genau fünf' },
        { id: 'd', label: 'keine' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Probiere: $(1\\,|\\,4)$, $(2\\,|\\,3)$, …', 'Sind auch Brüche oder negative Zahlen erlaubt?', '$(0{,}5\\,|\\,4{,}5)$ passt auch.'],
      solution: { steps: [{ text: 'Zu jedem $x$ gibt es ein passendes $y = 5 - x$. Also gibt es unendlich viele Lösungspaare.' }], finalAnswer: 'unendlich viele' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Nur natürliche Zahlen betrachtet', feedback: 'Auch negative Zahlen und Brüche sind erlaubt – es gibt unendlich viele Paare.', answers: ['c'] }],
    },
    {
      id: 'lgs-gl-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Welche Form haben die Lösungspaare einer linearen Gleichung $ax + by = c$ im Koordinatensystem (mit $b \\neq 0$)?',
      choices: [
        { id: 'a', label: 'Sie liegen auf einer Geraden.' },
        { id: 'b', label: 'Sie liegen auf einer Parabel.' },
        { id: 'c', label: 'Sie bilden einen einzigen Punkt.' },
        { id: 'd', label: 'Sie liegen auf einem Kreis.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Stelle die Gleichung nach $y$ um.', 'Du erhältst $y = mx + n$.', 'Das ist eine lineare Funktion.'],
      solution: { steps: [{ text: 'Umgestellt erhält man $y = -\\frac{a}{b}x + \\frac{c}{b}$ – eine Gerade.' }], finalAnswer: 'auf einer Geraden' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Nur ein Punkt erwartet', feedback: 'Eine Gleichung allein hat unendlich viele Lösungen. Erst ein Gleichungssystem legt (meist) einen Punkt fest.', answers: ['c'] }],
    },
    {
      id: 'lgs-gl-3',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 1,
      prompt: 'Ein Heft kostet $2$ €, ein Stift $1$ €. Tim gibt genau $12$ € aus ($x$ Hefte, $y$ Stifte). Welche Gleichung beschreibt das?',
      choices: [
        { id: 'a', label: '$2x + y = 12$' },
        { id: 'b', label: '$x + 2y = 12$' },
        { id: 'c', label: '$x + y = 12$' },
        { id: 'd', label: '$2xy = 12$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Was kosten $x$ Hefte?', '$x$ Hefte kosten $2x$ €.', 'Addiere die Kosten für die Stifte.'],
      solution: { steps: [{ text: 'Hefte: $2x$ €, Stifte: $1 \\cdot y$ €, zusammen $12$ €: $2x + y = 12$.' }], finalAnswer: '$2x + y = 12$' },
      objectives: [...OBJ, 'Sachsituationen beschreiben'],
      commonMistakes: [{ description: 'Preise vertauscht', feedback: '$x$ zählt die Hefte – jedes kostet $2$ €.', answers: ['b'] }],
    },
    {
      id: 'lgs-gl-4',
      subtopicId: S,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Ein Heft kostet $2$ €, ein Stift $1$ €. Auf wie viele Arten kann man genau $12$ € ausgeben, wenn man von beidem mindestens eins kauft?',
      answer: { kind: 'numeric', value: 5, tolerance: 0.001 },
      hints: ['Gleichung: $2x + y = 12$ mit $x \\ge 1$, $y \\ge 1$.', 'Probiere $x = 1, 2, 3, \\ldots$', 'Für $x = 6$ wäre $y = 0$ – das zählt nicht.'],
      solution: { steps: [{ text: 'Mögliche Paare: $(1\\,|\\,10)$, $(2\\,|\\,8)$, $(3\\,|\\,6)$, $(4\\,|\\,4)$, $(5\\,|\\,2)$.' }], finalAnswer: '$5$ Möglichkeiten' },
      objectives: [...OBJ, 'Sachsituationen beschreiben'],
      commonMistakes: [{ description: 'Randfälle mitgezählt', feedback: 'Von beidem mindestens eins: $(0\\,|\\,12)$ und $(6\\,|\\,0)$ zählen nicht.', answers: ['6', '7'] }],
    },
    {
      id: 'lgs-gl-5',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Lina behauptet: „$(2\\,|\\,3)$ und $(3\\,|\\,2)$ sind dasselbe Lösungspaar.“ Stimmt das?',
      choices: [
        { id: 'a', label: 'Nein, die Reihenfolge $(x\\,|\\,y)$ ist wichtig.' },
        { id: 'b', label: 'Ja, es kommen dieselben Zahlen vor.' },
        { id: 'c', label: 'Ja, aber nur bei $x + y = 5$.' },
        { id: 'd', label: 'Das hängt vom Koordinatensystem ab.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Setze beide Paare in $2x + y = 7$ ein.', '$2 \\cdot 2 + 3 = 7$, aber $2 \\cdot 3 + 2 = 8$.', 'Im Koordinatensystem sind es zwei verschiedene Punkte.'],
      solution: { steps: [{ text: 'Ein Paar ist geordnet: zuerst $x$, dann $y$. $(2\\,|\\,3)$ und $(3\\,|\\,2)$ sind verschiedene Punkte – z. B. löst nur das erste $2x + y = 7$.' }], finalAnswer: 'Nein' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Reihenfolge für egal gehalten', feedback: 'Bei $x + y = 5$ passen zufällig beide – im Allgemeinen nicht.', answers: ['b', 'c'] }],
    },
    {
      id: 'lgs-gl-6',
      subtopicId: S,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      prompt: 'Stelle $3x - 4y = 8$ nach $y$ um.',
      answer: { kind: 'linear', m: 0.75, b: -2, tolerance: 0.001 },
      hints: ['Bringe $3x$ auf die rechte Seite.', '$-4y = -3x + 8$', 'Teile durch $-4$ – alle Vorzeichen ändern sich.'],
      solution: { steps: [{ text: 'Umformen:', math: '-4y = -3x + 8 \\;\\Rightarrow\\; y = 0{,}75x - 2' }], finalAnswer: '$y = 0{,}75x - 2$' },
      objectives: [...OBJ, 'Gleichungen umstellen'],
      commonMistakes: [{ description: 'Beim Teilen durch eine negative Zahl Vorzeichen vergessen', feedback: 'Teilst du durch $-4$, ändern sich beide Vorzeichen auf der rechten Seite.', answers: ['y = -0,75x + 2', 'y = 0,75x + 2'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-gl-pruefen',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const a = r.int(1, 5) * r.sign();
        const b = r.int(1, 5) * r.sign();
        const x = r.int(-4, 6);
        const y = r.int(-4, 6);
        const ok = r.int(0, 1) === 1;
        return { a, b, x, y, c: a * x + b * y + (ok ? 0 : r.pick([-2, -1, 1, 3])) };
      },
      build: ({ a, b, x, y, c }) => {
        const lhs = a * x + b * y;
        const ok = lhs === c;
        return {
          prompt: `Ist $(${x}\\,|\\,${y})$ eine Lösung der Gleichung $${eq(a, b, c)}$?`,
          choices: YES_NO,
          answer: { kind: 'choice', correct: ok ? 'a' : 'b' },
          hints: ['Setze $x$ und $y$ ein.', `$${num(a)} \\cdot ${x < 0 ? `(${x})` : x} ${signedTerm(b)} \\cdot ${y < 0 ? `(${y})` : y}$`, `Vergleiche das Ergebnis mit $${c}$.`],
          solution: { steps: [{ text: 'Einsetzen:', math: `${num(a)} \\cdot ${x < 0 ? `(${x})` : x} ${signedTerm(b)} \\cdot ${y < 0 ? `(${y})` : y} = ${lhs}` }, { text: ok ? `$${lhs} = ${c}$ ⇒ wahre Aussage.` : `$${lhs} \\neq ${c}$ ⇒ keine Lösung.` }], finalAnswer: ok ? 'Ja' : 'Nein' },
          commonMistakes: [{ description: 'Ergebnis nicht verglichen', feedback: 'Nur wenn genau die rechte Seite herauskommt, ist das Paar eine Lösung.', answers: [ok ? 'b' : 'a'] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-ergaenzen',
      subtopicId: S,
      count: 12,
      type: 'numeric',
      requirement: 'calculation',
      difficulty: 1,
      objectives: OBJ,
      params: (r) => {
        const b = r.pick([1, -1, 2, 3, -2]);
        return { a: r.int(1, 6) * r.sign(), b, x: r.int(-5, 6), y: r.int(-6, 8) };
      },
      build: ({ a, b, x, y }) => {
        const c = a * x + b * y;
        return {
          prompt: `Bestimme $y$ so, dass $(${x}\\,|\\,y)$ eine Lösung von $${eq(a, b, c)}$ ist.`,
          answer: { kind: 'numeric', value: y, tolerance: 0.001 },
          hints: [`Setze $x = ${x}$ ein.`, `$${num(a * x)} ${signedTerm(b, 'y')} = ${c}$`, 'Löse nach $y$ auf.'],
          solution: { steps: [{ text: 'Einsetzen und auflösen:', math: `${num(a * x)} ${signedTerm(b, 'y')} = ${c} \\;\\Rightarrow\\; ${linearTerm(b, 0).replace('x', 'y')} = ${c - a * x} \\;\\Rightarrow\\; y = ${y}` }], finalAnswer: `$y = ${y}$` },
          commonMistakes: [{ description: 'Vorzeichen beim Herüberbringen', feedback: `Ziehe $${num(a * x)}$ auf beiden Seiten ab.`, answers: [txt((c + a * x) / b)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-umstellen',
      subtopicId: S,
      count: 12,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 2,
      objectives: [...OBJ, 'Gleichungen umstellen'],
      params: (r) => {
        const b = r.pick([1, 2, -1, -2, 4]);
        const m = r.int(1, 4) * r.sign();
        const n = r.int(1, 6) * r.sign();
        return { b, a: -m * b, c: n * b };
      },
      build: ({ a, b, c }) => {
        const m = -a / b;
        const n = c / b;
        return {
          prompt: `Stelle die Gleichung $${eq(a, b, c)}$ nach $y$ um.`,
          answer: { kind: 'linear', m, b: n, tolerance: 0.001 },
          hints: [`Bringe $${linearTerm(a, 0)}$ auf die andere Seite.`, `$${linearTerm(b, 0).replace('x', 'y')} = ${linearTerm(-a, c)}$`, b === 1 ? 'Fertig – $y$ steht schon allein.' : `Teile durch $${b}$.`],
          solution: { steps: [{ text: 'Umformen:', math: `${linearTerm(b, 0).replace('x', 'y')} = ${linearTerm(-a, c)}${b === 1 ? '' : ` \\;\\Rightarrow\\; y = ${linearTerm(m, n)}`}` }], finalAnswer: `$y = ${linearTerm(m, n)}$` },
          commonMistakes: [{ description: 'Vorzeichen von x nicht gewechselt', feedback: 'Bringst du $ax$ auf die andere Seite, wechselt das Vorzeichen.', answers: [`y = ${txt(-m)}x + ${txt(n)}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-umstellen-schwer',
      subtopicId: S,
      count: 8,
      type: 'equation',
      requirement: 'calculation',
      difficulty: 3,
      objectives: [...OBJ, 'Gleichungen umstellen'],
      params: (r) => ({ a: r.pick([2, 3, 5, -3, -5]), b: r.pick([4, -4, 2, -2, 5]), c: r.pick([8, 10, -6, 12, 20, -10]) }),
      build: ({ a, b, c }) => {
        const m = -a / b;
        const n = c / b;
        return {
          prompt: `Stelle $${eq(a, b, c)}$ nach $y$ um. (Dezimalzahlen oder Brüche sind erlaubt.)`,
          answer: { kind: 'linear', m, b: n, tolerance: 0.001 },
          hints: ['Erst $x$ auf die andere Seite bringen.', `Dann durch $${b}$ teilen.`, b < 0 ? 'Beim Teilen durch eine negative Zahl ändern sich alle Vorzeichen.' : 'Teile jeden Summanden einzeln.'],
          solution: { steps: [{ text: 'Umformen:', math: `${num(b)}y = ${linearTerm(-a, c)} \\;\\Rightarrow\\; y = ${linearTerm(m, n)}` }], finalAnswer: `$y = ${linearTerm(m, n)}$` },
          commonMistakes: [{ description: 'Nur einen Summanden geteilt', feedback: 'Teile beide Summanden auf der rechten Seite durch $b$.', answers: [`y = ${txt(-a)}x + ${txt(n)}`.replace('+ -', '- ')] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-sach-aufstellen',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Sachsituationen beschreiben'],
      params: (r) => {
        const ctx = r.pick([
          { t: 'Im Kino kostet ein Erwachsenenticket {a} € und ein Kinderticket {b} €. Eine Gruppe zahlt {c} € ($x$ Erwachsene, $y$ Kinder).' },
          { t: 'Ein Bauer hat Hühner (2 Beine) und Schafe (4 Beine). Zusammen haben sie {c} Beine ($x$ Hühner, $y$ Schafe).', a: 2, b: 4 },
          { t: 'In einem Glas liegen {a}-Cent- und {b}-Cent-Münzen im Wert von {c} Cent ($x$ Münzen zu {a} Cent, $y$ zu {b} Cent).' },
          { t: 'Ein Bäcker verkauft Brötchen zu {a} Cent und Brezeln zu {b} Cent. Heute nimmt er dafür {c} Cent ein ($x$ Brötchen, $y$ Brezeln).' },
        ]);
        const a = ctx.a ?? r.pick([5, 6, 8, 10, 20]);
        let b = ctx.b ?? r.pick([2, 3, 4, 50, 70]);
        if (b === a) b = a + 1;
        return { t: ctx.t, a, b, c: a * r.int(3, 9) + b * r.int(2, 8) };
      },
      build: ({ t, a, b, c }, r) => {
        const right = `$${eq(a, b, c)}$`;
        const { choices, correctId } = shuffledChoices(r, right, [`$${eq(b, a, c)}$`, `$${eq(1, 1, c)}$`, `$${eq(a + b, 0, c).replace(/\s?\+ 0y/, '')}$`]);
        return {
          prompt: `${t.replace(/\{a\}/g, String(a)).replace(/\{b\}/g, String(b)).replace('{c}', String(c))} Welche Gleichung passt?`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: [`Was kosten bzw. ergeben $x$ Stück der ersten Sorte?`, `Das sind $${a}x$.`, 'Beide Anteile zusammen ergeben die Gesamtsumme.'],
          solution: { steps: [{ text: `Erste Sorte: $${a}x$, zweite Sorte: $${b}y$, zusammen: ${right}.` }], finalAnswer: right },
          commonMistakes: [{ description: 'Faktoren vertauscht', feedback: 'Der Wert der ersten Sorte gehört zu $x$.', answers: choices.filter((ch) => ch.label === `$${eq(b, a, c)}$`).map((ch) => ch.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-sach-rest',
      subtopicId: S,
      count: 10,
      type: 'numeric',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Sachsituationen beschreiben'],
      params: (r) => ({ a: r.pick([3, 4, 5, 6, 8]), b: r.pick([2, 3, 5, 7]), x: r.int(2, 8), y: r.int(2, 10) }),
      build: ({ a, b, x, y }) => {
        const c = a * x + b * y;
        return {
          prompt: `Eine Pizza kostet $${a}$ €, ein Getränk $${b}$ €. Eine Klasse bezahlt für $${x}$ Pizzen und einige Getränke zusammen $${c}$ €. Wie viele Getränke wurden gekauft?`,
          answer: { kind: 'numeric', value: y, tolerance: 0.001 },
          hints: [`Gleichung: $${a}x + ${b}y = ${c}$ mit $x = ${x}$.`, `Pizzen kosten $${a * x}$ €.`, `Der Rest $${c - a * x}$ € entfällt auf die Getränke.`],
          solution: { steps: [{ text: 'Einsetzen und auflösen:', math: `${a} \\cdot ${x} + ${b}y = ${c} \\;\\Rightarrow\\; ${b}y = ${c - a * x} \\;\\Rightarrow\\; y = ${y}` }], finalAnswer: `$${y}$ Getränke` },
          commonMistakes: [{ description: 'Gesamtbetrag durch Getränkepreis geteilt', feedback: 'Ziehe zuerst die Kosten für die Pizzen ab.', answers: [txt(c / b)] }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-gl-anzahl',
      subtopicId: S,
      count: 8,
      type: 'numeric',
      requirement: 'application',
      difficulty: 3,
      objectives: [...OBJ, 'Sachsituationen beschreiben'],
      params: (r) => {
        const a = r.pick([2, 3, 4, 5]);
        const b = r.pick([3, 5, 6, 7]);
        return { a, b, c: a * r.int(1, 6) + b * r.int(1, 4) }; // mindestens eine Möglichkeit
      },
      build: ({ a, b, c }) => {
        const pairs: string[] = [];
        for (let x = 1; a * x < c; x++) if ((c - a * x) % b === 0 && c - a * x > 0) pairs.push(`(${x}\\,|\\,${(c - a * x) / b})`);
        return {
          prompt: `Postkarten kosten $${a}$ €, Poster $${b}$ €. Wie viele Möglichkeiten gibt es, für genau $${c}$ € von beidem mindestens ein Stück zu kaufen?`,
          answer: { kind: 'numeric', value: pairs.length, tolerance: 0.001 },
          hints: [`Gleichung: $${a}x + ${b}y = ${c}$ mit $x, y \\ge 1$.`, 'Probiere systematisch $x = 1, 2, 3, \\ldots$', `Prüfe jeweils, ob $${c} - ${a}x$ durch $${b}$ teilbar ist.`],
          solution: { steps: [{ text: pairs.length ? `Passende Paare $(x\\,|\\,y)$: $${pairs.join(',\\; ')}$.` : 'Es gibt kein passendes Paar.' }], finalAnswer: `$${pairs.length}$` },
          commonMistakes: [{ description: 'Nicht systematisch geprüft', feedback: 'Gehe alle $x$ der Reihe nach durch, bis $' + a + 'x$ größer als $' + c + '$ wird.', answers: [String(pairs.length + 1)] }],
        };
      },
    }),
  ],
};
