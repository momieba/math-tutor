/** Aufgabenpool Prozentrechnung: Vorlagen je Kapitel (die handgeschriebenen Aufgaben stehen in basis.ts). */
import type { AuthoredExercise } from '../../types';
import { fromTemplate, num, round, shuffledChoices, txt } from '../templates';

const OBJ = ['Prozentrechnung'];
const YES_NO_SAME = (a: string, b: string) => [a, b, 'beides gleich viel'];

const grundbegriffe: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'prz-gb-dezimal',
    subtopicId: 'prozent-grundbegriffe',
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Prozent in Dezimalzahl umwandeln'],
    params: (r) => ({ p: r.pick([1, 4, 5, 8, 12, 15, 20, 25, 40, 50, 64, 75, 99, 120, 150, 2.5, 12.5]) }), // 35 % gibt es schon (basis.ts)
    build: ({ p }) => ({
      prompt: `Schreibe $${num(p)}\\,\\%$ als Dezimalzahl.`,
      answer: { kind: 'numeric', value: p / 100, tolerance: 0.00001 },
      hints: ['Prozent heißt „von Hundert“.', `$${num(p)}\\,\\% = \\frac{${num(p)}}{100}$`, 'Komma um zwei Stellen nach links.'],
      solution: { steps: [{ text: 'Durch $100$ teilen:', math: `${num(p)}\\,\\% = \\frac{${num(p)}}{100} = ${num(p / 100, 4)}` }], finalAnswer: `$${num(p / 100, 4)}$` },
      commonMistakes: [{ description: 'Komma falsch verschoben', feedback: 'Durch $100$ teilen verschiebt das Komma um zwei Stellen.', answers: [txt(p / 10, 4), txt(p / 1000, 5)] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-gb-prozent',
    subtopicId: 'prozent-grundbegriffe',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Dezimalzahl in Prozent umwandeln'],
    params: (r) => ({ d: r.pick([0.03, 0.07, 0.1, 0.18, 0.25, 0.3, 0.45, 0.6, 0.85, 1.2, 0.125, 0.005]) }),
    build: ({ d }) => ({
      prompt: `Schreibe $${num(d, 4)}$ in Prozent.`,
      answer: { kind: 'numeric', value: d * 100, tolerance: 0.0001, unit: '%' },
      hints: ['Mal $100$ ergibt Prozent.', 'Komma um zwei Stellen nach rechts.', `$${num(d, 4)} \\cdot 100$`],
      solution: { steps: [{ text: 'Mit $100$ multiplizieren:', math: `${num(d, 4)} = ${num(d * 100, 2)}\\,\\%` }], finalAnswer: `$${num(d * 100, 2)}\\,\\%$` },
      commonMistakes: [{ description: 'Nur mit 10 multipliziert', feedback: 'Für Prozent mit $100$ multiplizieren.', answers: [txt(d * 10, 3)] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-gb-bruch',
    subtopicId: 'prozent-grundbegriffe',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Bruch in Prozent umwandeln'],
    params: (r) => r.pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [7, 10], [1, 20], [9, 20], [3, 25], [1, 50]] as const),
    build: ([z, n]) => ({
      prompt: `Wie viel Prozent sind $\\frac{${z}}{${n}}$?`,
      answer: { kind: 'numeric', value: (z / n) * 100, tolerance: 0.0001, unit: '%' },
      hints: ['Erweitere auf den Nenner $100$ oder teile $' + z + ' : ' + n + '$.', `$\\frac{${z}}{${n}} = ${num(z / n, 4)}$`, 'Mal $100$.'],
      solution: { steps: [{ text: 'Als Dezimalzahl und dann in Prozent:', math: `\\frac{${z}}{${n}} = ${num(z / n, 4)} = ${num((z / n) * 100)}\\,\\%` }], finalAnswer: `$${num((z / n) * 100)}\\,\\%$` },
      commonMistakes: [{ description: 'Zähler als Prozent gelesen', feedback: 'Der Zähler allein ist nicht der Prozentsatz – teile zuerst durch den Nenner.', answers: [String(z)] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-gb-begriff',
    subtopicId: 'prozent-grundbegriffe',
    count: 8,
    type: 'multiple-choice',
    requirement: 'knowledge',
    difficulty: 2,
    objectives: [...OBJ, 'Fachbegriffe zuordnen'],
    params: (r) => {
      const G = r.pick([40, 50, 80, 120, 200, 250, 400]);
      const p = r.pick([10, 20, 25, 40, 50, 75]);
      const ask = r.pick(['Grundwert', 'Prozentwert', 'Prozentsatz'] as const);
      const ctx = r.pick([
        ['Schülerinnen und Schülern', 'kommen mit dem Rad'],
        ['Losen', 'sind Gewinne'],
        ['Äpfeln', 'sind rot'],
        ['Mitgliedern', 'spielen Fußball'],
      ] as const);
      return { G, p, ask, ctx };
    },
    build: ({ G, p, ask, ctx: [what, verb] }, r) => {
      const W = (G * p) / 100;
      const value = { Grundwert: `$${G}$`, Prozentwert: `$${W}$`, Prozentsatz: `$${p}\\,\\%$` };
      const { choices, correctId } = shuffledChoices(r, value[ask], [...Object.values(value).filter((v) => v !== value[ask]), '$100\\,\\%$']);
      return {
        prompt: `„Von $${G}$ ${what} ${verb}: $${W}$, das sind $${p}\\,\\%$.“ Welche Angabe ist der **${ask}**?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Grundwert: das Ganze (100 %).', 'Prozentwert: der Teil.', 'Prozentsatz: der Anteil in Prozent.'],
        solution: { steps: [{ text: `Grundwert $${G}$ (das Ganze), Prozentwert $${W}$ (der Teil), Prozentsatz $${p}\\,\\%$.` }], finalAnswer: value[ask] },
        commonMistakes: [{ description: 'Grundwert und Prozentwert verwechselt', feedback: 'Der Grundwert ist das Ganze, der Prozentwert der Teil davon.' }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-gb-anteil',
    subtopicId: 'prozent-grundbegriffe',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Anteile in Prozent angeben'],
    params: (r) => {
      const G = r.pick([20, 25, 40, 50, 80, 200, 400, 500]);
      const p = r.pick([5, 10, 15, 20, 30, 35, 45, 60, 80]);
      const ctx = r.pick(['Von {G} Schülerinnen und Schülern haben {W} ein Haustier.', 'Von {G} Losen sind {W} Gewinne.', 'In einer Tüte sind {G} Bonbons, {W} davon sind rot.', 'Ein Verein hat {G} Mitglieder, {W} davon sind unter 18.']);
      return { G, W: (G * p) / 100, p, ctx };
    },
    build: ({ G, W, p, ctx }) => ({
      prompt: `${ctx.replace('{G}', `$${G}$`).replace('{W}', `$${W}$`)} Wie viel Prozent sind das?`,
      answer: { kind: 'numeric', value: p, tolerance: 0.001, unit: '%' },
      hints: ['Anteil $= \\frac{\\text{Teil}}{\\text{Ganzes}}$', `$\\frac{${W}}{${G}}$`, 'In Prozent umrechnen (mal 100).'],
      solution: { steps: [{ text: 'Anteil:', math: `\\frac{${W}}{${G}} = ${num(p / 100)} = ${p}\\,\\%` }], finalAnswer: `$${p}\\,\\%$` },
      commonMistakes: [{ description: 'Ganzes und Teil vertauscht', feedback: 'Teile den Teil durch das Ganze, nicht umgekehrt.', answers: [txt(round((G / W) * 100, 1))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-gb-vergleich',
    subtopicId: 'prozent-grundbegriffe',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Anteile vergleichen'],
    params: (r) => {
      const [G1, G2] = [r.pick([20, 25, 40]), r.pick([30, 50, 60])];
      const [p1, p2] = [r.pick([20, 40, 60, 80]), r.pick([10, 30, 50, 70])];
      return { G1, G2, p1, p2 };
    },
    build: ({ G1, G2, p1, p2 }) => ({
      prompt: `In Klasse 8a bestehen $${(G1 * p1) / 100}$ von $${G1}$ Kindern die Schwimmprüfung, in der 8b $${(G2 * p2) / 100}$ von $${G2}$. Um wie viele Prozentpunkte liegt die bessere Klasse vorne?`,
      answer: { kind: 'numeric', value: Math.abs(p1 - p2), tolerance: 0.001 },
      hints: ['Berechne für jede Klasse den Anteil in Prozent.', `8a: $\\frac{${(G1 * p1) / 100}}{${G1}}$, 8b: $\\frac{${(G2 * p2) / 100}}{${G2}}$`, 'Bilde die Differenz der Prozentsätze.'],
      solution: { steps: [{ text: 'Anteile:', math: `8a: ${p1}\\,\\%,\\quad 8b: ${p2}\\,\\%` }, { text: `Unterschied: $${Math.abs(p1 - p2)}$ Prozentpunkte.` }], finalAnswer: `$${Math.abs(p1 - p2)}$ Prozentpunkte` },
      commonMistakes: [{ description: 'Anzahlen statt Anteile verglichen', feedback: 'Die Klassen sind verschieden groß – vergleiche die Prozentsätze.', answers: [String(Math.abs((G1 * p1) / 100 - (G2 * p2) / 100))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-gb-mehr',
    subtopicId: 'prozent-grundbegriffe',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 3,
    objectives: [...OBJ, 'Prozentangaben vergleichen'],
    params: (r) => ({ a: r.pick([10, 20, 25, 30, 50]), x: r.pick([40, 60, 80, 120, 200]), b: r.pick([15, 20, 40, 60]), y: r.pick([50, 100, 150, 300]) }),
    build: ({ a, x, b, y }, r) => {
      const v1 = (a * x) / 100;
      const v2 = (b * y) / 100;
      const l1 = `$${a}\\,\\%$ von $${x}$`;
      const l2 = `$${b}\\,\\%$ von $${y}$`;
      const right = v1 > v2 ? l1 : v2 > v1 ? l2 : 'beides gleich viel';
      const { choices, correctId } = shuffledChoices(r, right, YES_NO_SAME(l1, l2).filter((c) => c !== right));
      return {
        prompt: `Was ist mehr: ${l1} oder ${l2}?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Berechne beide Prozentwerte.', `$${a}\\,\\%$ von $${x}$ = $${num(v1)}$`, `$${b}\\,\\%$ von $${y}$ = ?`],
        solution: { steps: [{ text: `${l1} $= ${num(v1)}$, ${l2} $= ${num(v2)}$.` }], finalAnswer: right },
        commonMistakes: [{ description: 'Nur Prozentsätze verglichen', feedback: 'Ein größerer Prozentsatz bedeutet nicht automatisch mehr – es kommt auf den Grundwert an.' }],
      };
    },
  }),
];

const prozentwert: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'prz-pw-ganz',
    subtopicId: 'prozent-prozentwert',
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Prozentwert berechnen'],
    params: (r) => ({ G: r.pick([40, 60, 80, 120, 150, 200, 250, 300, 400, 500, 800]), p: r.pick([5, 10, 20, 25, 30, 40, 50, 75]) }),
    build: ({ G, p }) => ({
      prompt: `Berechne $${p}\\,\\%$ von $${G}$.`,
      answer: { kind: 'numeric', value: (G * p) / 100, tolerance: 0.001 },
      hints: ['$W = G \\cdot \\frac{p}{100}$', `$${p}\\,\\% = ${num(p / 100)}$`, `$${G} \\cdot ${num(p / 100)}$`],
      solution: { steps: [{ text: 'Grundgleichung:', math: `W = ${G} \\cdot \\frac{${p}}{100} = ${num((G * p) / 100)}` }], finalAnswer: `$${num((G * p) / 100)}$` },
      commonMistakes: [{ description: 'Durch den Prozentsatz geteilt', feedback: 'Prozentwert: Grundwert mal $\\frac{p}{100}$.', answers: [txt(round(G / p, 2))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-pw-dez',
    subtopicId: 'prozent-prozentwert',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Prozentwert berechnen'],
    params: (r) => {
      // Höchstens zwei Nachkommastellen im Ergebnis (drei wären als „1.125“ mehrdeutig, siehe evaluate.ts)
      for (;;) {
        const G = r.pick([36, 48, 64, 85, 120, 240, 360, 72.5]);
        const p = r.pick([3, 7, 12, 12.5, 15, 19, 35, 2.5]);
        if (Number.isInteger(round(G * p, 6))) return { G, p };
      }
    },
    build: ({ G, p }) => {
      const W = round((G * p) / 100, 4);
      return {
        prompt: `Berechne $${num(p)}\\,\\%$ von $${num(G)}$.`,
        answer: { kind: 'numeric', value: W, tolerance: 0.001 },
        hints: ['$W = G \\cdot \\frac{p}{100}$', `$${num(p)}\\,\\% = ${num(p / 100, 4)}$`, `$${num(G)} \\cdot ${num(p / 100, 4)}$`],
        solution: { steps: [{ text: 'Grundgleichung:', math: `W = ${num(G)} \\cdot ${num(p / 100, 4)} = ${num(W, 4)}` }], finalAnswer: `$${num(W, 4)}$` },
        commonMistakes: [{ description: 'Komma beim Prozentsatz falsch', feedback: `$${num(p)}\\,\\% = ${num(p / 100, 4)}$, nicht $${num(p / 10, 3)}$.`, answers: [txt((G * p) / 10, 3)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-pw-rabatt',
    subtopicId: 'prozent-prozentwert',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 1,
    objectives: [...OBJ, 'Rabatt berechnen'],
    params: (r) => ({ price: r.pick([20, 40, 50, 60, 80, 120, 150, 200]), p: r.pick([10, 20, 25, 30, 50]), item: r.pick(['Ein Rucksack', 'Eine Jacke', 'Ein Paar Schuhe', 'Ein Kopfhörer', 'Ein Skateboard']) }),
    build: ({ price, p, item }) => ({
      prompt: `${item} kostet $${price}$ €. Es gibt $${p}\\,\\%$ Rabatt. Wie viel Euro spart man?`,
      answer: { kind: 'numeric', value: (price * p) / 100, tolerance: 0.001, unit: '€' },
      hints: ['Die Ersparnis ist der Prozentwert.', `$${p}\\,\\%$ von $${price}$ €`, `$${price} \\cdot ${num(p / 100)}$`],
      solution: { steps: [{ text: 'Ersparnis:', math: `${price} \\cdot \\frac{${p}}{100} = ${num((price * p) / 100)}` }], finalAnswer: `$${num((price * p) / 100)}$ €` },
      commonMistakes: [{ description: 'Neuen Preis statt Ersparnis', feedback: 'Gefragt ist, wie viel man spart – nicht der neue Preis.', answers: [txt(price - (price * p) / 100)] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-pw-neupreis',
    subtopicId: 'prozent-prozentwert',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Preise nach Rabatt'],
    params: (r) => ({ price: r.pick([24, 45, 60, 79, 90, 120, 180, 250]), p: r.pick([10, 15, 20, 25, 30, 40]) }),
    build: ({ price, p }) => {
      const neu = round(price * (1 - p / 100), 2);
      return {
        prompt: `Ein Fahrradhelm kostet $${price}$ €. Im Sale gibt es $${p}\\,\\%$ Rabatt. Was kostet er jetzt (in €)?`,
        answer: { kind: 'numeric', value: neu, tolerance: 0.005, unit: '€' },
        hints: [`Nach dem Rabatt zahlt man noch $${100 - p}\\,\\%$.`, `$${price} \\cdot ${num(1 - p / 100)}$`, 'Oder: Rabatt ausrechnen und abziehen.'],
        solution: { steps: [{ text: 'Mit dem Faktor rechnen:', math: `${price} \\cdot ${num(1 - p / 100)} = ${num(neu)}` }], finalAnswer: `$${num(neu)}$ €` },
        commonMistakes: [{ description: 'Nur den Rabatt berechnet', feedback: 'Der Rabatt muss noch vom alten Preis abgezogen werden.', answers: [txt((price * p) / 100)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-pw-mwst',
    subtopicId: 'prozent-prozentwert',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Mehrwertsteuer'],
    params: (r) => ({ netto: r.pick([100, 200, 250, 400, 500, 1000, 50, 80]), mwst: r.pick([19, 7]) }),
    build: ({ netto, mwst }) => {
      const brutto = round(netto * (1 + mwst / 100), 2);
      return {
        prompt: `Ein Gerät kostet ohne Mehrwertsteuer $${netto}$ €. Es kommen $${mwst}\\,\\%$ Mehrwertsteuer dazu. Wie hoch ist der Endpreis (in €)?`,
        answer: { kind: 'numeric', value: brutto, tolerance: 0.005, unit: '€' },
        hints: [`Endpreis $= 100\\,\\% + ${mwst}\\,\\% = ${100 + mwst}\\,\\%$`, `$${netto} \\cdot ${num(1 + mwst / 100)}$`, 'Oder: Steuer ausrechnen und addieren.'],
        solution: { steps: [{ text: 'Mit dem Faktor rechnen:', math: `${netto} \\cdot ${num(1 + mwst / 100)} = ${num(brutto)}` }], finalAnswer: `$${num(brutto)}$ €` },
        commonMistakes: [{ description: 'Nur die Steuer berechnet', feedback: 'Die Steuer kommt zum Nettopreis dazu.', answers: [txt((netto * mwst) / 100)] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-pw-zweimal',
    subtopicId: 'prozent-prozentwert',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Mehrere Prozentänderungen'],
    params: (r) => ({ price: r.pick([50, 80, 100, 200, 400]), up: r.pick([10, 20, 25]), down: r.pick([10, 20, 25, 50]) }),
    build: ({ price, up, down }) => {
      const end = round(price * (1 + up / 100) * (1 - down / 100), 2);
      return {
        prompt: `Ein Preis von $${price}$ € wird erst um $${up}\\,\\%$ erhöht und danach um $${down}\\,\\%$ gesenkt. Wie hoch ist der Endpreis (in €)?`,
        answer: { kind: 'numeric', value: end, tolerance: 0.005, unit: '€' },
        hints: ['Rechne Schritt für Schritt.', `Nach der Erhöhung: $${price} \\cdot ${num(1 + up / 100)} = ${num(price * (1 + up / 100))}$ €`, `Dann mal $${num(1 - down / 100)}$.`],
        solution: { steps: [{ text: 'Zwei Faktoren nacheinander:', math: `${price} \\cdot ${num(1 + up / 100)} \\cdot ${num(1 - down / 100)} = ${num(end)}` }], finalAnswer: `$${num(end)}$ €` },
        commonMistakes: [{ description: 'Prozentsätze einfach verrechnet', feedback: 'Die zweite Änderung bezieht sich auf den neuen Preis – nicht einfach $' + up + ' - ' + down + '$ Prozent rechnen.', answers: [txt(round(price * (1 + (up - down) / 100), 2))] }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-pw-rechnung',
    subtopicId: 'prozent-prozentwert',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 3,
    objectives: [...OBJ, 'Rechenwege beurteilen'],
    params: (r) => ({ G: r.pick([240, 360, 480, 750]), p: r.pick([8, 12, 15, 35]) }),
    build: ({ G, p }, r) => {
      const right = `$${G} \\cdot ${num(p / 100)}$`;
      const { choices, correctId } = shuffledChoices(r, right, [`$${G} : ${p}$`, `$${G} \\cdot ${p}$`, `$${G} : ${num(p / 100)}$`]);
      return {
        prompt: `Welche Rechnung liefert $${p}\\,\\%$ von $${G}$?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['$W = G \\cdot \\frac{p}{100}$', `$\\frac{${p}}{100} = ${num(p / 100)}$`, 'Der Grundwert wird mit dem Dezimalbruch multipliziert.'],
        solution: { steps: [{ text: `$W = ${G} \\cdot ${num(p / 100)} = ${num((G * p) / 100)}$` }], finalAnswer: right },
        commonMistakes: [{ description: 'Geteilt statt multipliziert', feedback: 'Der Prozentwert ist ein Teil vom Grundwert: multiplizieren mit $\\frac{p}{100}$.' }],
      };
    },
  }),
];

const satzGrundwert: AuthoredExercise[] = [
  ...fromTemplate({
    id: 'prz-sg-satz',
    subtopicId: 'prozent-satz-grundwert',
    count: 12,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 1,
    objectives: [...OBJ, 'Prozentsatz berechnen'],
    params: (r) => {
      const G = r.pick([20, 25, 40, 50, 80, 200, 250, 400]);
      const p = r.pick([5, 10, 15, 20, 25, 40, 60, 75, 80]);
      return { G, W: (G * p) / 100, p };
    },
    build: ({ G, W, p }) => ({
      prompt: `Wie viel Prozent sind $${num(W)}$ von $${G}$?`,
      answer: { kind: 'numeric', value: p, tolerance: 0.001, unit: '%' },
      hints: ['$p\\,\\% = \\frac{W}{G}$', `$\\frac{${num(W)}}{${G}}$`, 'Mal $100$ für Prozent.'],
      solution: { steps: [{ text: 'Anteil:', math: `\\frac{${num(W)}}{${G}} = ${num(p / 100)} = ${p}\\,\\%` }], finalAnswer: `$${p}\\,\\%$` },
      commonMistakes: [{ description: 'Grundwert durch Prozentwert geteilt', feedback: 'Es heißt $\\frac{W}{G}$ – der Teil steht oben.', answers: [txt(round((G / W) * 100, 1))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-sg-grundwert',
    subtopicId: 'prozent-satz-grundwert',
    count: 10,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 2,
    objectives: [...OBJ, 'Grundwert berechnen'],
    params: (r) => {
      const G = r.pick([40, 60, 80, 120, 150, 240, 300, 500]);
      const p = r.pick([5, 10, 12, 15, 20, 25, 40, 75]);
      return { G, W: (G * p) / 100, p };
    },
    build: ({ G, W, p }) => ({
      prompt: `$${p}\\,\\%$ eines Betrags sind $${num(W)}$ €. Wie groß ist der Betrag (in €)?`,
      answer: { kind: 'numeric', value: G, tolerance: 0.001, unit: '€' },
      hints: ['$G = \\frac{W}{p} \\cdot 100$', `$1\\,\\% = ${num(W)} : ${p} = ${num(W / p, 3)}$ €`, 'Mal $100$.'],
      solution: { steps: [{ text: 'Dreisatz:', math: `1\\,\\% = \\frac{${num(W)}}{${p}} = ${num(W / p, 3)},\\quad 100\\,\\% = ${G}` }], finalAnswer: `$${G}$ €` },
      commonMistakes: [{ description: 'Prozentwert berechnet statt Grundwert', feedback: 'Gesucht ist das Ganze (100 %), nicht $' + p + '\\,\\%$ davon.', answers: [txt((W * p) / 100)] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-sg-quote',
    subtopicId: 'prozent-satz-grundwert',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 1,
    objectives: [...OBJ, 'Prozentsätze im Alltag'],
    params: (r) => {
      const ctx = r.pick([
        { t: 'Bei einem Test hast du {W} von {G} Punkten erreicht.', G: r.pick([20, 25, 40, 50]) },
        { t: 'Eine Basketballspielerin trifft {W} von {G} Würfen.', G: r.pick([20, 25, 40]) },
        { t: 'Bei einer Umfrage antworten {W} von {G} Befragten mit „Ja“.', G: r.pick([200, 400, 500]) },
      ]);
      let p = r.pick([40, 60, 70, 75, 80, 90]);
      while (!Number.isInteger((ctx.G * p) / 100)) p = r.pick([40, 60, 80]); // ganze Treffer/Punkte
      return { ...ctx, W: (ctx.G * p) / 100, p };
    },
    build: ({ t, G, W, p }) => ({
      prompt: `${t.replace('{W}', `$${W}$`).replace('{G}', `$${G}$`)} Wie viel Prozent sind das?`,
      answer: { kind: 'numeric', value: p, tolerance: 0.001, unit: '%' },
      hints: ['$p\\,\\% = \\frac{W}{G}$', `$\\frac{${W}}{${G}}$`, 'Mal $100$.'],
      solution: { steps: [{ text: 'Anteil:', math: `\\frac{${W}}{${G}} = ${num(p / 100)} = ${p}\\,\\%` }], finalAnswer: `$${p}\\,\\%$` },
      commonMistakes: [{ description: 'Ganzes und Teil vertauscht', feedback: 'Teil durch Ganzes.', answers: [txt(round((G / W) * 100, 1))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-sg-vorher',
    subtopicId: 'prozent-satz-grundwert',
    count: 10,
    type: 'numeric',
    requirement: 'application',
    difficulty: 2,
    objectives: [...OBJ, 'Ursprungspreis berechnen'],
    params: (r) => {
      const old = r.pick([40, 60, 80, 100, 120, 160, 200]);
      const p = r.pick([10, 20, 25, 40, 50]);
      return { old, p, now: (old * (100 - p)) / 100, item: r.pick(['eine Jacke', 'ein Spiel', 'eine Uhr', 'ein Rucksack']) };
    },
    build: ({ old, p, now, item }) => ({
      prompt: `Nach $${p}\\,\\%$ Rabatt kostet ${item} noch $${num(now)}$ €. Wie teuer war ${item.startsWith('eine') ? 'sie' : 'es'} vorher (in €)?`,
      answer: { kind: 'numeric', value: old, tolerance: 0.001, unit: '€' },
      hints: [`Der neue Preis entspricht $${100 - p}\\,\\%$ des alten.`, `$${num(now)} = G \\cdot ${num(1 - p / 100)}$`, `$G = ${num(now)} : ${num(1 - p / 100)}$`],
      solution: { steps: [{ text: 'Der neue Preis ist $' + (100 - p) + '\\,\\%$ des alten:', math: `G = \\frac{${num(now)}}{${num(1 - p / 100)}} = ${old}` }], finalAnswer: `$${old}$ €` },
      commonMistakes: [{ description: 'Rabatt auf den neuen Preis aufgeschlagen', feedback: `Die $${p}\\,\\%$ beziehen sich auf den alten Preis – teile durch $${num(1 - p / 100)}$.`, answers: [txt(round(now * (1 + p / 100), 2))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-sg-steigerung',
    subtopicId: 'prozent-satz-grundwert',
    count: 8,
    type: 'numeric',
    requirement: 'application',
    difficulty: 3,
    objectives: [...OBJ, 'Prozentuale Änderung'],
    params: (r) => {
      const a = r.pick([20, 40, 50, 80, 120, 200, 250]);
      const p = r.pick([5, 10, 15, 20, 25, 30, 40, 50]) * r.sign();
      return { a, b: (a * (100 + p)) / 100, p, what: r.pick(['Der Preis einer Konzertkarte (in €)', 'Die Zahl der Vereinsmitglieder', 'Die Zahl der Besucher eines Museums an einem Tag', 'Der Preis eines Sportschuhs (in €)']) };
    },
    build: ({ a, b, p, what }) => ({
      prompt: `${what} ändert sich von $${num(a)}$ auf $${num(b)}$. Um wie viel Prozent hat ${what.startsWith('Die') ? 'sie' : 'er'} sich verändert? (Abnahme mit Minuszeichen)`,
      answer: { kind: 'numeric', value: p, tolerance: 0.001, unit: '%' },
      hints: ['Änderung $= $ neu $-$ alt.', `$${num(b)} - ${num(a)} = ${num(b - a)}$`, `Bezogen auf den alten Wert: $\\frac{${num(b - a)}}{${num(a)}}$.`],
      solution: { steps: [{ text: 'Änderung durch alten Wert:', math: `\\frac{${num(b - a)}}{${num(a)}} = ${num(p / 100)} = ${p}\\,\\%` }], finalAnswer: `$${p}\\,\\%$` },
      commonMistakes: [{ description: 'Auf den neuen Wert bezogen', feedback: 'Die prozentuale Änderung bezieht sich auf den alten Wert.', answers: [txt(round(((b - a) / b) * 100, 2))] }],
    }),
  }),
  ...fromTemplate({
    id: 'prz-sg-hoch-runter',
    subtopicId: 'prozent-satz-grundwert',
    count: 8,
    type: 'multiple-choice',
    requirement: 'reasoning',
    difficulty: 3,
    objectives: [...OBJ, 'Prozentänderungen beurteilen'],
    params: (r) => ({ p: r.pick([5, 10, 15, 20, 25, 30, 40, 50]), price: r.pick([40, 80, 100, 200]), order: r.pick(['erst hoch', 'erst runter']) }),
    build: ({ p, price, order }, r) => {
      const end = round(price * (1 + p / 100) * (1 - p / 100), 2);
      const right = 'Er ist niedriger als vorher.';
      const { choices, correctId } = shuffledChoices(r, right, ['Er ist so hoch wie vorher.', 'Er ist höher als vorher.', 'Das hängt vom Preis ab.']);
      return {
        prompt: `Ein Preis von $${price}$ € wird ${order === 'erst hoch' ? `erst um $${p}\\,\\%$ erhöht und dann um $${p}\\,\\%$ gesenkt` : `erst um $${p}\\,\\%$ gesenkt und dann um $${p}\\,\\%$ erhöht`}. Was gilt für den Endpreis?`,
        choices,
        answer: { kind: 'choice', correct: correctId },
        hints: ['Die zweite Änderung bezieht sich auf einen anderen Grundwert.', 'Rechne es aus.', `$${price} \\cdot ${num(1 + p / 100)} \\cdot ${num(1 - p / 100)}$`],
        solution: { steps: [{ text: 'Mit Faktoren:', math: `${price} \\cdot ${num(1 + p / 100)} \\cdot ${num(1 - p / 100)} = ${num(end)} < ${price}` }], finalAnswer: right },
        commonMistakes: [{ description: 'Gleiche Prozentsätze heben sich auf', feedback: `Gleiche Prozentsätze heben sich nicht auf: $${num(1 + p / 100)} \\cdot ${num(1 - p / 100)} < 1$.` }],
      };
    },
  }),
  ...fromTemplate({
    id: 'prz-sg-dezimal',
    subtopicId: 'prozent-satz-grundwert',
    count: 8,
    type: 'numeric',
    requirement: 'calculation',
    difficulty: 3,
    objectives: [...OBJ, 'Prozentsatz berechnen'],
    params: (r) => ({ W: r.pick([7, 13, 17, 23, 29, 37]), G: r.pick([30, 45, 60, 70, 90]) }),
    build: ({ W, G }) => {
      const p = (W / G) * 100;
      return {
        prompt: `Wie viel Prozent sind $${W}$ von $${G}$? Runde auf eine Nachkommastelle.`,
        answer: { kind: 'numeric', value: p, tolerance: 0.06, unit: '%' },
        hints: ['$p\\,\\% = \\frac{W}{G}$', `$${W} : ${G} \\approx ${num(W / G, 4)}$`, 'Mal $100$ und runden.'],
        solution: { steps: [{ text: 'Anteil:', math: `\\frac{${W}}{${G}} \\approx ${num(W / G, 4)} \\approx ${num(round(p, 1), 1)}\\,\\%` }], finalAnswer: `$\\approx ${num(round(p, 1), 1)}\\,\\%$` },
        commonMistakes: [{ description: 'Vertauscht', feedback: 'Teil durch Ganzes.', answers: [txt(round((G / W) * 100, 1), 1)] }],
      };
    },
  }),
];

export const POOL: Record<string, AuthoredExercise[]> = {
  'prozent-grundbegriffe': grundbegriffe,
  'prozent-prozentwert': prozentwert,
  'prozent-satz-grundwert': satzGrundwert,
};
