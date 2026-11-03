import type { AuthoredSubtopic } from '../../types';
import { videoPlaceholder } from '../helpers';
import { fromTemplate, num, shuffledChoices } from '../templates';
import { eq, TOPIC_ID, wordProblem, wordProblemExercises } from './shared';

const S = 'lgs-sachaufgaben';
const OBJ = ['Sachaufgaben mit linearen Gleichungssystemen lösen'];
const YES_NO = [
  { id: 'a', label: 'Ja' },
  { id: 'b', label: 'Nein' },
];

/** Gleichungssystem als Fließtext-Option für Multiple Choice. */
const sysOption = (a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) => `$\\text{I: } ${eq(a1, b1, c1)}$ und $\\text{II: } ${eq(a2, b2, c2)}$`;

export const sachaufgaben: AuthoredSubtopic = {
  id: S,
  topicId: TOPIC_ID,
  order: 7,
  title: 'Sachaufgaben',
  description: 'Textaufgaben mit zwei Unbekannten: Variablen festlegen, Gleichungssystem aufstellen, lösen und die Antwort prüfen.',
  objective: 'Du übersetzt Sachsituationen in lineare Gleichungssysteme, löst sie und prüfst das Ergebnis am Text.',
  intro:
    'Viele Rätsel und Alltagsfragen haben zwei Unbekannte, zum Beispiel zwei Preise oder zwei Anzahlen. Mit zwei Informationen lassen sich zwei Gleichungen aufstellen. So gehst du vor: Variablen festlegen – Gleichungen aufstellen – lösen – Antwort formulieren – am Text prüfen.',
  rules: [
    { term: '1. Variablen festlegen', explanation: 'Schreibe auf, wofür $x$ und $y$ stehen (mit Einheit).' },
    { term: '2. Gleichungen aufstellen', explanation: 'Jede Information des Textes ergibt eine Gleichung.' },
    { term: '3. Lösen', explanation: 'Mit einem passenden Verfahren (Einsetzen, Gleichsetzen, Addition).' },
    { term: '4. Prüfen', explanation: 'Passt das Ergebnis zum Text? Sind Anzahlen ganzzahlig und nicht negativ?' },
  ],
  materials: [videoPlaceholder('lgs-sachaufgaben-v1', 'Textaufgaben mit Gleichungssystemen')],
  example: {
    problem: 'Im Kino zahlen 2 Erwachsene und 3 Kinder 36 €, 1 Erwachsener und 2 Kinder 21 €. Was kosten die Karten?',
    steps: [
      { text: '$x$ = Preis Erwachsene, $y$ = Preis Kinder (in €):', math: '\\text{I: } 2x + 3y = 36, \\quad \\text{II: } x + 2y = 21' },
      { text: 'I − 2 · II:', math: '-y = -6 \\;\\Rightarrow\\; y = 6' },
      { text: 'In II:', math: 'x + 12 = 21 \\;\\Rightarrow\\; x = 9' },
      { text: 'Probe in I: $18 + 18 = 36$ ✓' },
    ],
    result: 'Erwachsene zahlen $9$ €, Kinder $6$ €.',
  },
  summary: ['Variablen mit Bedeutung festlegen.', 'Zwei Informationen ⇒ zwei Gleichungen.', 'Ergebnis am Text prüfen.'],
  exercises: [
    {
      id: 'lgs-sa-1',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'knowledge',
      difficulty: 1,
      prompt: 'Was ist bei einer Sachaufgabe mit zwei Unbekannten der erste Schritt?',
      choices: [
        { id: 'a', label: 'Festlegen, wofür $x$ und $y$ stehen' },
        { id: 'b', label: 'Das Additionsverfahren anwenden' },
        { id: 'c', label: 'Die Probe machen' },
        { id: 'd', label: 'Die Antwort raten' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Bevor man Gleichungen aufstellt, braucht man …', '… Variablen mit klarer Bedeutung.', 'Erst danach kommen Gleichungen und Lösungsverfahren.'],
      solution: { steps: [{ text: 'Zuerst legt man fest, wofür die Variablen stehen – sonst kann man keine passenden Gleichungen aufstellen.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Mit dem Lösen begonnen', feedback: 'Ohne Gleichungen gibt es noch nichts zu lösen.', answers: ['b'] }],
    },
    {
      id: 'lgs-sa-2',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 2,
      prompt: 'Bei einer Aufgabe zu Hühnern und Kaninchen erhält Tom $x = 7{,}5$ Hühner. Was folgt daraus?',
      choices: [
        { id: 'a', label: 'Er hat sich verrechnet oder die Angaben passen nicht – Tiere gibt es nur ganz.' },
        { id: 'b', label: 'Er rundet auf $8$ Hühner.' },
        { id: 'c', label: 'Ein Huhn ist halb so groß.' },
        { id: 'd', label: 'Das Ergebnis ist richtig.' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['Kann es halbe Hühner geben?', 'Was sagt das über die Rechnung?', 'Ergebnisse müssen zum Sachzusammenhang passen.'],
      solution: { steps: [{ text: 'Anzahlen von Tieren müssen ganze Zahlen sein. Ein Ergebnis wie $7{,}5$ zeigt einen Rechenfehler oder unpassende Angaben.' }], finalAnswer: 'a)' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Einfach gerundet', feedback: 'Runden verdeckt den Fehler – prüfe lieber die Gleichungen und die Rechnung.', answers: ['b'] }],
    },
    {
      id: 'lgs-sa-3',
      subtopicId: S,
      type: 'equation',
      requirement: 'application',
      difficulty: 3,
      prompt: 'Aus $10$-%-igem und $40$-%-igem Saft sollen $30$ Liter $20$-%-iger Saft gemischt werden. Wie viele Liter vom $10$-%-igen ($x$) und vom $40$-%-igen ($y$) braucht man? Gib die Lösung als $(x\\,|\\,y)$ an.',
      answer: { kind: 'point', x: 20, y: 10, tolerance: 0.001 },
      hints: ['Gesamtmenge: $x + y = 30$', 'Fruchtanteil: $0{,}1x + 0{,}4y = 0{,}2 \\cdot 30 = 6$', 'Löse z. B. I nach $x$ auf und setze ein.'],
      solution: { steps: [{ text: 'Gleichungssystem:', math: '\\text{I: } x + y = 30, \\quad \\text{II: } 0{,}1x + 0{,}4y = 6' }, { text: 'I: $x = 30 - y$ in II:', math: '3 - 0{,}1y + 0{,}4y = 6 \\;\\Rightarrow\\; 0{,}3y = 3 \\;\\Rightarrow\\; y = 10' }, { text: '$x = 30 - 10 = 20$' }], finalAnswer: '$20$ Liter $10$-%-iger und $10$ Liter $40$-%-iger Saft' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Anteile vertauscht', feedback: 'Prüfe: $0{,}1 \\cdot 20 + 0{,}4 \\cdot 10 = 6$ ✓', answers: ['(10|20)'] }],
    },
    {
      id: 'lgs-sa-4',
      subtopicId: S,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 3,
      prompt: '„Ein Vater ist dreimal so alt wie sein Sohn. In $12$ Jahren ist er doppelt so alt.“ Welche Gleichung beschreibt den zweiten Satz ($x$ = Alter Vater, $y$ = Alter Sohn heute)?',
      choices: [
        { id: 'a', label: '$x + 12 = 2(y + 12)$' },
        { id: 'b', label: '$x + 12 = 2y + 12$' },
        { id: 'c', label: '$x = 2(y + 12)$' },
        { id: 'd', label: '$2x + 12 = y + 12$' },
      ],
      answer: { kind: 'choice', correct: 'a' },
      hints: ['In $12$ Jahren sind **beide** $12$ Jahre älter.', 'Vater dann: $x + 12$, Sohn dann: $y + 12$.', '„doppelt so alt“: Vater = 2 · Sohn.'],
      solution: { steps: [{ text: 'In 12 Jahren: Vater $x + 12$, Sohn $y + 12$. Doppelt so alt: $x + 12 = 2(y + 12)$.' }], finalAnswer: '$x + 12 = 2(y + 12)$' },
      objectives: OBJ,
      commonMistakes: [{ description: 'Klammer vergessen', feedback: 'Das ganze künftige Alter des Sohnes wird verdoppelt: $2(y + 12)$.', answers: ['b'] }],
    },

    // ------------------------------------------------------------ Vorlagen
    ...fromTemplate({
      id: 'lgs-sa-system-waehlen',
      subtopicId: S,
      count: 12,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 1,
      objectives: [...OBJ, 'Gleichungssysteme aufstellen'],
      params: (r) => wordProblem(r, ['tiere', 'muenzen', 'zahlen', 'alter']),
      build: (w, r) => {
        const { a1, b1, c1, a2, b2, c2 } = w.system;
        const right = sysOption(a1, b1, c1, a2, b2, c2);
        const { choices, correctId } = shuffledChoices(r, right, [sysOption(a1, b1, c2, a2, b2, c1), sysOption(b2, a2, c1, b1, a1, c2), sysOption(a1, b1, c1, b2, a2, c2)]);
        return {
          prompt: `${w.prompt.replace(/ Wie viele .*$| Wie alt .*$| Bestimme .*$/, '')} Welches Gleichungssystem passt dazu? (${w.vars})`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Übersetze jeden Satz mit einer Zahl in eine Gleichung.', 'Prüfe, zu welcher Variablen jeder Faktor gehört.', 'Mache die Probe mit der Lösung, falls du sie schon kennst.'],
          solution: { steps: [{ text: `Passendes System: ${right}.` }], finalAnswer: right },
          commonMistakes: [{ description: 'Rechte Seiten vertauscht', feedback: 'Prüfe, welche Gesamtzahl zu welcher Information gehört.', answers: choices.filter((c) => c.label === sysOption(a1, b1, c2, a2, b2, c1)).map((c) => c.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sa-system-waehlen-2',
      subtopicId: S,
      count: 10,
      type: 'multiple-choice',
      requirement: 'application',
      difficulty: 2,
      objectives: [...OBJ, 'Gleichungssysteme aufstellen'],
      params: (r) => wordProblem(r, ['eintritt', 'schreibwaren', 'konzert', 'rechteck']),
      build: (w, r) => {
        const { a1, b1, c1, a2, b2, c2 } = w.system;
        const right = sysOption(a1, b1, c1, a2, b2, c2);
        const { choices, correctId } = shuffledChoices(r, right, [sysOption(b1, a1, c1, b2, a2, c2), sysOption(a1, b1, c2, a2, b2, c1), sysOption(a1, a2, c1, b1, b2, c2)]);
        return {
          prompt: `${w.prompt.replace(/ Wie (teuer|viele|lang) .*$| Was kostet .*$/, '')} Welches Gleichungssystem beschreibt die Situation? (${w.vars})`,
          choices,
          answer: { kind: 'choice', correct: correctId },
          hints: ['Lege zu jeder Information eine Gleichung an.', 'Achte darauf, welche Zahl vor $x$ und welche vor $y$ gehört.', 'Ein Probeeinsetzen der vermuteten Lösung hilft.'],
          solution: { steps: [{ text: `Passendes System: ${right}.` }], finalAnswer: right },
          commonMistakes: [{ description: 'Faktoren vertauscht', feedback: 'Die Zahl vor $x$ gehört zur ersten Größe.', answers: choices.filter((c) => c.label === sysOption(b1, a1, c1, b2, a2, c2)).map((c) => c.id) }],
        };
      },
    }),
    ...fromTemplate({
      id: 'lgs-sa-pruefen',
      subtopicId: S,
      count: 8,
      type: 'multiple-choice',
      requirement: 'reasoning',
      difficulty: 1,
      objectives: [...OBJ, 'Ergebnisse prüfen'],
      params: (r) => ({ w: wordProblem(r, ['tiere', 'muenzen', 'zahlen', 'eintritt', 'alter']), ok: r.int(0, 1) === 1, dx: r.pick([1, 2, -1]) }),
      build: ({ w, ok, dx }) => {
        const x = ok ? w.x : w.x + dx;
        const y = ok ? w.y : w.y - dx;
        const s = w.system;
        const l1 = s.a1 * x + s.b1 * y;
        const l2 = s.a2 * x + s.b2 * y;
        const fits = Math.abs(l1 - s.c1) < 1e-9 && Math.abs(l2 - s.c2) < 1e-9;
        return {
          prompt: `${w.prompt.replace(/ Wie viele .*$| Wie (teuer|alt) .*$| Bestimme .*$/, '')} Jemand behauptet: $x = ${num(x)}$ und $y = ${num(y)}$ (${w.vars}). Stimmt das?`,
          choices: YES_NO,
          answer: { kind: 'choice', correct: fits ? 'a' : 'b' },
          hints: ['Prüfe beide Informationen aus dem Text.', 'Setze die Werte in beide Gleichungen ein.', 'Nur wenn beide stimmen, ist die Behauptung richtig.'],
          solution: { steps: [{ text: 'Probe:', math: `${eq(s.a1, s.b1, s.c1).split('=')[0]}\\to ${num(l1)} \\;(${num(s.c1)}), \\quad ${eq(s.a2, s.b2, s.c2).split('=')[0]}\\to ${num(l2)} \\;(${num(s.c2)})` }, { text: fits ? 'Beide Gleichungen sind erfüllt.' : 'Mindestens eine Gleichung ist nicht erfüllt.' }], finalAnswer: fits ? 'Ja' : 'Nein' },
          commonMistakes: [{ description: 'Nur eine Information geprüft', feedback: 'Ein Paar kann eine Gleichung erfüllen und die andere nicht – prüfe beide.', answers: [fits ? 'b' : 'a'] }],
        };
      },
    }),
    ...wordProblemExercises({ id: 'lgs-sa-loesen', subtopicId: S, count: 14, difficulty: 2, keys: ['eintritt', 'tiere', 'muenzen', 'zahlen', 'alter'], objectives: OBJ, method: 'mit einem Verfahren deiner Wahl' }),
    ...wordProblemExercises({ id: 'lgs-sa-loesen-schwer', subtopicId: S, count: 14, difficulty: 3, keys: ['konzert', 'saft', 'rechteck', 'schreibwaren'], objectives: OBJ, method: 'mit einem Verfahren deiner Wahl' }),
  ],
};
