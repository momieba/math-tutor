import type { Topic } from '../types';
import { CURRICULUM_ID, videoPlaceholder } from './helpers';

const T = 'pythagoras';

export const pythagoras: Topic = {
  id: T,
  curriculumId: CURRICULUM_ID,
  subject: 'Mathematik',
  grade: 8,
  area: 'Geometrie',
  title: 'Satz des Pythagoras',
  description: 'Seitenlängen in rechtwinkligen Dreiecken berechnen, prüfen und in Sachaufgaben anwenden.',
  keywords: [
    'satz des pythagoras',
    'pythagoras',
    'hypotenuse',
    'kathete',
    'katheten',
    'rechtwinkliges dreieck',
    'rechtwinklig',
    'a2+b2=c2',
    'a^2+b^2=c^2',
    'diagonale',
    'raumdiagonale',
  ],
  reviewStatus: 'internal-review',
  subtopics: [
    // ------------------------------------------------------------------ 1
    {
      id: 'pyth-grundlagen',
      topicId: T,
      order: 1,
      title: 'Grundlagen und Definition',
      description: 'Katheten, Hypotenuse und die Aussage des Satzes kennenlernen.',
      objective:
        'Du kennst den Satz des Pythagoras und kannst ihn für ein rechtwinkliges Dreieck mit den richtigen Seitenbezeichnungen aufschreiben.',
      intro:
        'In einem rechtwinkligen Dreieck hängen die drei Seitenlängen auf besondere Weise zusammen. Wenn du zwei Seiten kennst, kannst du die dritte berechnen. Dafür musst du zuerst wissen, welche Seite welche Rolle spielt.',
      rules: [
        { term: 'Rechtwinkliges Dreieck', explanation: 'Ein Dreieck mit einem Winkel von genau $90^\\circ$.' },
        { term: 'Katheten', explanation: 'Die beiden Seiten, die den rechten Winkel einschließen.' },
        { term: 'Hypotenuse', explanation: 'Die Seite gegenüber dem rechten Winkel. Sie ist immer die längste Seite.' },
        {
          term: 'Satz des Pythagoras',
          explanation: 'Sind $a$ und $b$ die Katheten und $c$ die Hypotenuse, dann gilt:',
          math: 'a^2 + b^2 = c^2',
        },
      ],
      materials: [videoPlaceholder('pyth-grundlagen-v1', 'Was sagt der Satz des Pythagoras?')],
      example: {
        problem: 'Ein rechtwinkliges Dreieck hat die Katheten $a = 3$ und $b = 4$. Prüfe, dass $c = 5$ die Hypotenuse sein kann.',
        steps: [
          { text: 'Der rechte Winkel liegt zwischen $a$ und $b$, also ist $c$ die Hypotenuse.' },
          { text: 'Quadrate der Katheten addieren:', math: '3^2 + 4^2 = 9 + 16 = 25' },
          { text: 'Quadrat der Hypotenuse:', math: '5^2 = 25' },
          { text: 'Beide Seiten sind gleich, der Satz ist erfüllt.' },
        ],
        result: '$3^2 + 4^2 = 5^2$, also passt $c = 5$.',
      },
      summary: [
        'Katheten bilden den rechten Winkel, die Hypotenuse liegt ihm gegenüber.',
        'Die Hypotenuse ist die längste Seite.',
        'Es gilt $a^2 + b^2 = c^2$, wenn $c$ die Hypotenuse ist.',
      ],
      exercises: [
        {
          id: 'pyth-grundlagen-1',
          subtopicId: 'pyth-grundlagen',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Welche Seite ist in einem rechtwinkligen Dreieck die Hypotenuse?',
          choices: [
            { id: 'a', label: 'Die kürzeste Seite' },
            { id: 'b', label: 'Die Seite gegenüber dem rechten Winkel' },
            { id: 'c', label: 'Eine der Seiten, die den rechten Winkel bilden' },
            { id: 'd', label: 'Immer die waagerechte Seite' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: [
            'Suche zuerst den rechten Winkel im Dreieck.',
            'Die Hypotenuse berührt den rechten Winkel nicht.',
            'Sie liegt dem rechten Winkel genau gegenüber und ist die längste Seite.',
          ],
          solution: {
            steps: [
              { text: 'Die beiden Seiten am rechten Winkel heißen Katheten.' },
              { text: 'Die dritte Seite liegt dem rechten Winkel gegenüber – das ist die Hypotenuse.' },
            ],
            finalAnswer: 'Die Seite gegenüber dem rechten Winkel.',
          },
          objectives: ['Hypotenuse und Katheten unterscheiden'],
          commonMistakes: [
            { description: 'Kathete mit Hypotenuse verwechselt', feedback: 'Seiten am rechten Winkel sind Katheten.', answers: ['c'] },
            { description: 'Lage statt Winkel betrachtet', feedback: 'Die Lage im Bild spielt keine Rolle, nur der rechte Winkel.', answers: ['d'] },
          ],
        },
        {
          id: 'pyth-grundlagen-2',
          subtopicId: 'pyth-grundlagen',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Im Dreieck $ABC$ liegt der rechte Winkel bei $C$. Welche Gleichung ist richtig?',
          choices: [
            { id: 'a', label: '$a^2 + b^2 = c^2$' },
            { id: 'b', label: '$a^2 + c^2 = b^2$' },
            { id: 'c', label: '$a + b = c$' },
            { id: 'd', label: '$b^2 + c^2 = a^2$' },
          ],
          answer: { kind: 'choice', correct: 'a' },
          hints: [
            'Die Seite $c$ liegt der Ecke $C$ gegenüber.',
            'Welche Seite liegt also dem rechten Winkel gegenüber?',
            '$c$ ist die Hypotenuse – sie steht allein auf einer Seite der Gleichung.',
          ],
          solution: {
            steps: [
              { text: 'Seite $c$ liegt gegenüber von $C$, also gegenüber dem rechten Winkel: $c$ ist die Hypotenuse.' },
              { text: '$a$ und $b$ sind die Katheten.', math: 'a^2 + b^2 = c^2' },
            ],
            finalAnswer: '$a^2 + b^2 = c^2$',
          },
          objectives: ['Satz des Pythagoras mit Seitenbezeichnungen aufstellen'],
          commonMistakes: [
            { description: 'Seiten ohne Quadrate addiert', feedback: 'Im Satz werden die Quadrate der Seiten addiert, nicht die Seiten selbst.', answers: ['c'] },
            { description: 'Falsche Seite als Hypotenuse gewählt', feedback: 'Die Hypotenuse liegt dem rechten Winkel gegenüber.', answers: ['b', 'd'] },
          ],
        },
        {
          id: 'pyth-grundlagen-3',
          subtopicId: 'pyth-grundlagen',
          type: 'numeric',
          difficulty: 1,
          prompt: 'Die Katheten eines rechtwinkligen Dreiecks sind $a = 6$ cm und $b = 8$ cm. Berechne $c^2$ (in cm²).',
          answer: { kind: 'numeric', value: 100, tolerance: 0, unit: 'cm²' },
          hints: [
            'Nutze den Satz $a^2 + b^2 = c^2$.',
            'Berechne zuerst $6^2$ und $8^2$.',
            '$36 + 64 = \\;?$',
          ],
          solution: {
            steps: [
              { text: 'Satz aufschreiben:', math: 'c^2 = a^2 + b^2' },
              { text: 'Werte einsetzen:', math: 'c^2 = 6^2 + 8^2 = 36 + 64' },
              { text: 'Ausrechnen:', math: 'c^2 = 100' },
            ],
            finalAnswer: '$c^2 = 100$ cm²',
          },
          objectives: ['Satz des Pythagoras anwenden'],
          commonMistakes: [
            { description: 'Seiten addiert statt Quadrate', feedback: 'Du hast $6 + 8$ gerechnet. Quadriere die Seiten zuerst.', answers: ['14'] },
            { description: 'Wurzel bereits gezogen', feedback: 'Gefragt ist $c^2$, nicht $c$.', answers: ['10'] },
          ],
        },
        {
          id: 'pyth-grundlagen-4',
          subtopicId: 'pyth-grundlagen',
          type: 'text',
          difficulty: 2,
          prompt: 'Im Dreieck $PQR$ liegt der rechte Winkel bei $Q$. Wie heißt die Hypotenuse? (Antwort z. B. als „AB“)',
          answer: { kind: 'text', accepted: ['pr', 'rp'] },
          hints: [
            'Die Hypotenuse liegt dem rechten Winkel gegenüber.',
            'Welche Strecke verbindet die beiden Ecken, die nicht $Q$ sind?',
            'Die Ecken außer $Q$ heißen $P$ und $R$.',
          ],
          solution: {
            steps: [
              { text: 'Der rechte Winkel liegt bei $Q$.' },
              { text: 'Die gegenüberliegende Seite verbindet die anderen beiden Ecken $P$ und $R$.' },
            ],
            finalAnswer: 'Die Hypotenuse ist $\\overline{PR}$.',
          },
          objectives: ['Hypotenuse in beliebig beschrifteten Dreiecken erkennen'],
          commonMistakes: [
            { description: 'Seite am rechten Winkel gewählt', feedback: 'Strecken mit $Q$ als Endpunkt sind Katheten.', answers: ['pq', 'qp', 'qr', 'rq'] },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'pyth-erkennen',
      topicId: T,
      order: 2,
      title: 'Rechtwinklige Dreiecke erkennen',
      description: 'Rechte Winkel finden – auch in gedrehten oder anders beschrifteten Dreiecken.',
      objective:
        'Du erkennst rechtwinklige Dreiecke über die Winkel und benennst Katheten und Hypotenuse auch in gedrehten Figuren.',
      intro:
        'Bevor du den Satz des Pythagoras anwendest, musst du sicher sein, dass ein rechter Winkel vorhanden ist und wo er liegt. Die Lage oder Drehung des Dreiecks spielt dabei keine Rolle.',
      rules: [
        { term: 'Winkelsumme', explanation: 'In jedem Dreieck ergeben die drei Innenwinkel zusammen $180^\\circ$.', math: '\\alpha + \\beta + \\gamma = 180^\\circ' },
        { term: 'Dritter Winkel', explanation: 'Kennst du zwei Winkel, erhältst du den dritten durch $180^\\circ$ minus deren Summe.' },
        { term: 'Lage egal', explanation: 'Ein Dreieck bleibt rechtwinklig, egal wie es gedreht ist. Die Hypotenuse liegt immer dem rechten Winkel gegenüber.' },
      ],
      materials: [videoPlaceholder('pyth-erkennen-v1', 'Rechte Winkel sicher erkennen')],
      example: {
        problem: 'In einem Dreieck $ABC$ gilt $\\alpha = 35^\\circ$ und $\\beta = 55^\\circ$. Ist es rechtwinklig?',
        steps: [
          { text: 'Dritten Winkel berechnen:', math: '\\gamma = 180^\\circ - 35^\\circ - 55^\\circ = 90^\\circ' },
          { text: 'Der rechte Winkel liegt bei $C$, also ist $c$ die Hypotenuse.' },
        ],
        result: 'Ja, das Dreieck ist rechtwinklig mit rechtem Winkel bei $C$.',
      },
      summary: [
        'Die Winkelsumme im Dreieck beträgt $180^\\circ$.',
        'Die Hypotenuse liegt immer gegenüber dem rechten Winkel – unabhängig von der Lage.',
      ],
      exercises: [
        {
          id: 'pyth-erkennen-1',
          subtopicId: 'pyth-erkennen',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Welche Winkel gehören zu einem rechtwinkligen Dreieck?',
          choices: [
            { id: 'a', label: '$40^\\circ$, $60^\\circ$, $80^\\circ$' },
            { id: 'b', label: '$30^\\circ$, $60^\\circ$, $90^\\circ$' },
            { id: 'c', label: '$50^\\circ$, $60^\\circ$, $70^\\circ$' },
            { id: 'd', label: '$35^\\circ$, $65^\\circ$, $80^\\circ$' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: [
            'Ein rechtwinkliges Dreieck hat einen Winkel mit einer besonderen Größe.',
            'Ein rechter Winkel misst $90^\\circ$.',
            'Suche die Antwort, in der $90^\\circ$ vorkommt.',
          ],
          solution: {
            steps: [{ text: 'Nur bei $30^\\circ$, $60^\\circ$, $90^\\circ$ gibt es einen rechten Winkel.' }],
            finalAnswer: '$30^\\circ$, $60^\\circ$, $90^\\circ$',
          },
          objectives: ['Rechten Winkel erkennen'],
          commonMistakes: [{ description: 'Größten Winkel für rechten Winkel gehalten', feedback: 'Der größte Winkel muss genau $90^\\circ$ sein, nicht nur der größte.', answers: ['a', 'd'] }],
        },
        {
          id: 'pyth-erkennen-2',
          subtopicId: 'pyth-erkennen',
          type: 'numeric',
          difficulty: 1,
          prompt: 'In einem Dreieck sind $\\alpha = 27^\\circ$ und $\\beta = 63^\\circ$. Wie groß ist $\\gamma$ (in Grad)?',
          answer: { kind: 'numeric', value: 90, tolerance: 0, unit: '°' },
          hints: [
            'Wie groß ist die Winkelsumme in einem Dreieck?',
            'Die Winkelsumme beträgt $180^\\circ$.',
            'Rechne $180^\\circ - 27^\\circ - 63^\\circ$.',
          ],
          solution: {
            steps: [
              { text: 'Winkelsumme nutzen:', math: '\\gamma = 180^\\circ - \\alpha - \\beta' },
              { text: 'Einsetzen:', math: '\\gamma = 180^\\circ - 27^\\circ - 63^\\circ = 90^\\circ' },
            ],
            finalAnswer: '$\\gamma = 90^\\circ$ – das Dreieck ist rechtwinklig.',
          },
          objectives: ['Winkelsumme anwenden', 'Rechten Winkel erkennen'],
          commonMistakes: [{ description: 'Winkel addiert statt subtrahiert', feedback: 'Ziehe beide Winkel von $180^\\circ$ ab.', answers: ['270'] }],
        },
        {
          id: 'pyth-erkennen-3',
          subtopicId: 'pyth-erkennen',
          type: 'text',
          difficulty: 2,
          prompt: 'Im Dreieck $XYZ$ liegt der rechte Winkel bei $X$. Wie heißt die Hypotenuse? (z. B. „AB“)',
          answer: { kind: 'text', accepted: ['yz', 'zy'] },
          hints: [
            'Die Hypotenuse liegt gegenüber dem rechten Winkel.',
            'Sie hat nicht $X$ als Endpunkt.',
            'Verbinde die beiden anderen Ecken.',
          ],
          solution: {
            steps: [
              { text: 'Rechter Winkel bei $X$ ⇒ die Katheten sind $\\overline{XY}$ und $\\overline{XZ}$.' },
              { text: 'Die verbleibende Seite ist die Hypotenuse.' },
            ],
            finalAnswer: '$\\overline{YZ}$',
          },
          objectives: ['Hypotenuse in gedrehten/umbenannten Dreiecken erkennen'],
          commonMistakes: [{ description: 'Kathete gewählt', feedback: 'Strecken mit Endpunkt $X$ liegen am rechten Winkel.', answers: ['xy', 'yx', 'xz', 'zx'] }],
        },
        {
          id: 'pyth-erkennen-4',
          subtopicId: 'pyth-erkennen',
          type: 'handwriting',
          difficulty: 2,
          prompt:
            'Zeichne ein rechtwinkliges Dreieck $ABC$ mit dem rechten Winkel bei $C$. Markiere den rechten Winkel und beschrifte Katheten und Hypotenuse. Gib danach den Namen der Hypotenuse ein (Kleinbuchstabe).',
          answer: { kind: 'text', accepted: ['c', 'ab', 'ba'] },
          hints: [
            'Zeichne zuerst den rechten Winkel bei $C$ (z. B. mit zwei senkrechten Linien).',
            'Die Seite gegenüber einer Ecke trägt deren Kleinbuchstaben.',
            'Gegenüber von $C$ liegt die Seite $c$.',
          ],
          solution: {
            steps: [
              { text: 'Rechten Winkel bei $C$ zeichnen und mit einem Viertelkreis mit Punkt markieren.' },
              { text: 'Die Seiten $a = \\overline{BC}$ und $b = \\overline{AC}$ sind die Katheten.' },
              { text: 'Die Seite $c = \\overline{AB}$ liegt gegenüber dem rechten Winkel.' },
            ],
            finalAnswer: 'Hypotenuse: $c$',
          },
          objectives: ['Rechtwinkliges Dreieck skizzieren und beschriften'],
          commonMistakes: [{ description: 'Kathete als Hypotenuse benannt', feedback: '$a$ und $b$ grenzen an den rechten Winkel bei $C$.', answers: ['a', 'b'] }],
        },
      ],
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'pyth-herleitung',
      topicId: T,
      order: 3,
      title: 'Herleitung des Satzes',
      description: 'Warum der Satz gilt: Flächen von Quadraten und der Ergänzungsbeweis.',
      objective: 'Du kannst den Satz des Pythagoras mit Quadratflächen deuten und den Ergänzungsbeweis nachvollziehen.',
      intro:
        'Der Satz des Pythagoras ist eigentlich eine Aussage über Flächen: Zeichnet man über jede Seite ein Quadrat, dann sind die beiden kleinen Quadrate zusammen genauso groß wie das große Quadrat.',
      rules: [
        { term: 'Quadratfläche', explanation: 'Ein Quadrat mit Seitenlänge $s$ hat den Flächeninhalt', math: 'A = s^2' },
        { term: 'Flächenaussage', explanation: 'Die Kathetenquadrate haben zusammen denselben Flächeninhalt wie das Hypotenusenquadrat.' },
        {
          term: 'Ergänzungsbeweis',
          explanation: 'Ein Quadrat mit Seite $a+b$ enthält vier gleiche rechtwinklige Dreiecke und ein inneres Quadrat mit Seite $c$:',
          math: '(a+b)^2 = 4 \\cdot \\tfrac{a \\cdot b}{2} + c^2 \\;\\Rightarrow\\; a^2 + b^2 = c^2',
        },
      ],
      materials: [
        videoPlaceholder('pyth-herleitung-v1', 'Pythagoras mit Quadraten verstehen'),
        videoPlaceholder('pyth-herleitung-v2', 'Der Ergänzungsbeweis Schritt für Schritt', 300),
      ],
      example: {
        problem: 'Katheten $a = 3$, $b = 4$. Vergleiche die Quadratflächen.',
        steps: [
          { text: 'Quadrat über $a$:', math: '3^2 = 9' },
          { text: 'Quadrat über $b$:', math: '4^2 = 16' },
          { text: 'Zusammen:', math: '9 + 16 = 25 = 5^2' },
        ],
        result: 'Das Quadrat über der Hypotenuse $c = 5$ hat genau $25$ Flächeneinheiten.',
      },
      summary: [
        '$a^2$, $b^2$, $c^2$ sind Flächeninhalte von Quadraten über den Seiten.',
        'Der Ergänzungsbeweis zeigt die Gleichung durch Zerlegen eines großen Quadrats.',
      ],
      exercises: [
        {
          id: 'pyth-herleitung-1',
          subtopicId: 'pyth-herleitung',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Was bedeutet $a^2$ im Satz des Pythagoras geometrisch?',
          choices: [
            { id: 'a', label: 'Der Umfang eines Quadrats mit Seite $a$' },
            { id: 'b', label: 'Die doppelte Länge der Seite $a$' },
            { id: 'c', label: 'Der Flächeninhalt eines Quadrats mit Seite $a$' },
            { id: 'd', label: 'Der Flächeninhalt des Dreiecks' },
          ],
          answer: { kind: 'choice', correct: 'c' },
          hints: [
            'Denke an die Figur, die man über einer Seite zeichnet.',
            'Wie berechnet man den Flächeninhalt eines Quadrats?',
            '$A = s \\cdot s = s^2$',
          ],
          solution: {
            steps: [{ text: '$a^2 = a \\cdot a$ ist der Flächeninhalt eines Quadrats mit der Seitenlänge $a$.' }],
            finalAnswer: 'Flächeninhalt des Quadrats über $a$.',
          },
          objectives: ['Satz geometrisch deuten'],
          commonMistakes: [
            { description: 'Quadrieren mit Verdoppeln verwechselt', feedback: '$a^2 = a \\cdot a$, nicht $2 \\cdot a$.', answers: ['b'] },
            { description: 'Umfang und Fläche verwechselt', feedback: 'Der Umfang wäre $4a$.', answers: ['a'] },
          ],
        },
        {
          id: 'pyth-herleitung-2',
          subtopicId: 'pyth-herleitung',
          type: 'numeric',
          difficulty: 1,
          prompt:
            'Über den Katheten eines rechtwinkligen Dreiecks liegen Quadrate mit $25\\,\\text{cm}^2$ und $144\\,\\text{cm}^2$. Wie groß ist das Quadrat über der Hypotenuse (in cm²)?',
          answer: { kind: 'numeric', value: 169, tolerance: 0, unit: 'cm²' },
          hints: [
            'Die Kathetenquadrate ergeben zusammen das Hypotenusenquadrat.',
            'Du musst hier keine Wurzel ziehen.',
            'Rechne $25 + 144$.',
          ],
          solution: {
            steps: [{ text: 'Flächenaussage anwenden:', math: 'c^2 = 25 + 144 = 169' }],
            finalAnswer: '$169\\,\\text{cm}^2$',
          },
          objectives: ['Satz als Flächenaussage anwenden'],
          commonMistakes: [{ description: 'Wurzel gezogen', feedback: 'Gefragt ist die Fläche, nicht die Seitenlänge.', answers: ['13'] }],
        },
        {
          id: 'pyth-herleitung-3',
          subtopicId: 'pyth-herleitung',
          type: 'equation',
          difficulty: 3,
          prompt:
            'Ergänzungsbeweis: Vereinfache den Term $(a+b)^2 - 4 \\cdot \\frac{a \\cdot b}{2}$ so weit wie möglich. (Schreibweise z. B. `a^2+b^2`)',
          answer: { kind: 'text', accepted: ['a^2+b^2', 'b^2+a^2'] },
          hints: [
            'Löse zuerst die Klammer mit der 1. binomischen Formel auf.',
            '$(a+b)^2 = a^2 + 2ab + b^2$ und $4 \\cdot \\frac{ab}{2} = 2ab$.',
            'Was bleibt übrig, wenn du $2ab$ abziehst?',
          ],
          solution: {
            steps: [
              { text: '1. binomische Formel:', math: '(a+b)^2 = a^2 + 2ab + b^2' },
              { text: 'Dreiecksflächen zusammenfassen:', math: '4 \\cdot \\tfrac{ab}{2} = 2ab' },
              { text: 'Subtrahieren:', math: 'a^2 + 2ab + b^2 - 2ab = a^2 + b^2' },
              { text: 'Da das Ergebnis die Fläche des inneren Quadrats $c^2$ ist, folgt $a^2 + b^2 = c^2$.' },
            ],
            finalAnswer: '$a^2 + b^2$',
          },
          objectives: ['Ergänzungsbeweis nachvollziehen', 'Binomische Formel anwenden'],
          commonMistakes: [
            { description: 'Binom falsch aufgelöst', feedback: '$(a+b)^2 \\neq a^2 + b^2$ – der Mischterm $2ab$ fehlt.', answers: ['a^2+b^2-2ab', 'a^2-2ab+b^2'] },
          ],
        },
        {
          id: 'pyth-herleitung-4',
          subtopicId: 'pyth-herleitung',
          type: 'handwriting',
          difficulty: 2,
          prompt:
            'Skizziere ein rechtwinkliges Dreieck mit $a = 3$ cm und $b = 4$ cm und zeichne die Quadrate über allen drei Seiten. Berechne die Flächeninhalte. Wie groß ist das Quadrat über der Hypotenuse (in cm²)?',
          answer: { kind: 'numeric', value: 25, tolerance: 0, unit: 'cm²' },
          hints: [
            'Berechne zuerst die Flächen der Quadrate über den Katheten.',
            '$3^2 = 9$ und $4^2 = 16$.',
            'Addiere die beiden Flächen.',
          ],
          solution: {
            steps: [
              { text: 'Kathetenquadrate:', math: '3^2 = 9,\\quad 4^2 = 16' },
              { text: 'Hypotenusenquadrat:', math: 'c^2 = 9 + 16 = 25' },
            ],
            finalAnswer: '$25\\,\\text{cm}^2$ (die Hypotenuse ist $5$ cm lang)',
          },
          objectives: ['Satz als Flächenaussage darstellen'],
          commonMistakes: [{ description: 'Seitenlänge statt Fläche angegeben', feedback: 'Gefragt ist die Fläche $c^2$, nicht $c$.', answers: ['5'] }],
        },
      ],
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'pyth-hypotenuse',
      topicId: T,
      order: 4,
      title: 'Hypotenuse berechnen',
      description: 'Aus zwei Katheten die längste Seite bestimmen.',
      objective: 'Du berechnest die Hypotenuse aus zwei gegebenen Katheten und rundest sinnvoll.',
      intro: 'Kennst du beide Katheten, kannst du die Hypotenuse in drei Schritten berechnen: quadrieren, addieren, Wurzel ziehen.',
      rules: [
        { term: 'Formel', explanation: 'Für die Hypotenuse gilt:', math: 'c = \\sqrt{a^2 + b^2}' },
        { term: 'Reihenfolge', explanation: 'Erst quadrieren, dann addieren, zum Schluss die Wurzel ziehen.' },
        { term: 'Achtung', explanation: 'Die Wurzel einer Summe ist nicht die Summe der Wurzeln:', math: '\\sqrt{a^2 + b^2} \\neq a + b' },
      ],
      materials: [videoPlaceholder('pyth-hypotenuse-v1', 'Hypotenuse berechnen in 3 Schritten')],
      example: {
        problem: 'Berechne $c$ für $a = 5$ cm und $b = 12$ cm.',
        steps: [
          { text: 'Quadrieren:', math: '5^2 = 25,\\quad 12^2 = 144' },
          { text: 'Addieren:', math: 'c^2 = 25 + 144 = 169' },
          { text: 'Wurzel ziehen:', math: 'c = \\sqrt{169} = 13' },
        ],
        result: '$c = 13$ cm',
      },
      summary: ['$c = \\sqrt{a^2 + b^2}$', 'Ergebnis plausibel? Die Hypotenuse muss länger als jede Kathete sein.'],
      exercises: [
        {
          id: 'pyth-hypotenuse-1',
          subtopicId: 'pyth-hypotenuse',
          type: 'numeric',
          difficulty: 1,
          prompt: 'Berechne die Hypotenuse $c$ für $a = 9$ cm und $b = 12$ cm (in cm).',
          answer: { kind: 'numeric', value: 15, tolerance: 0, unit: 'cm' },
          hints: ['Nutze $c^2 = a^2 + b^2$.', '$9^2 = 81$ und $12^2 = 144$.', 'Ziehe die Wurzel aus $225$.'],
          solution: {
            steps: [
              { text: 'Einsetzen:', math: 'c^2 = 9^2 + 12^2 = 81 + 144 = 225' },
              { text: 'Wurzel ziehen:', math: 'c = \\sqrt{225} = 15' },
            ],
            finalAnswer: '$c = 15$ cm',
          },
          objectives: ['Hypotenuse berechnen'],
          commonMistakes: [
            { description: 'Seiten addiert', feedback: '$9 + 12$ ist nicht die Hypotenuse – quadriere zuerst.', answers: ['21'] },
            { description: 'Wurzel vergessen', feedback: '$225$ ist $c^2$. Ziehe noch die Wurzel.', answers: ['225'] },
          ],
        },
        {
          id: 'pyth-hypotenuse-2',
          subtopicId: 'pyth-hypotenuse',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Ein rechtwinkliges Dreieck hat die Katheten $a = 1$ cm und $b = 1$ cm. Wie lang ist $c$?',
          choices: [
            { id: 'a', label: '$2$ cm' },
            { id: 'b', label: '$1$ cm' },
            { id: 'c', label: '$\\sqrt{2} \\approx 1{,}41$ cm' },
            { id: 'd', label: '$0{,}5$ cm' },
          ],
          answer: { kind: 'choice', correct: 'c' },
          hints: ['Setze in $c^2 = a^2 + b^2$ ein.', '$c^2 = 1 + 1 = 2$', 'Welche Zahl ergibt mit sich selbst multipliziert $2$?'],
          solution: {
            steps: [
              { text: 'Einsetzen:', math: 'c^2 = 1^2 + 1^2 = 2' },
              { text: 'Wurzel ziehen:', math: 'c = \\sqrt{2} \\approx 1{,}41' },
            ],
            finalAnswer: '$c = \\sqrt{2} \\approx 1{,}41$ cm',
          },
          objectives: ['Hypotenuse berechnen', 'Irrationale Ergebnisse runden'],
          commonMistakes: [{ description: 'Seiten addiert', feedback: '$1 + 1 = 2$ wäre $c^2$, nicht $c$.', answers: ['a'] }],
        },
        {
          id: 'pyth-hypotenuse-3',
          subtopicId: 'pyth-hypotenuse',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Berechne $c$ für $a = 4$ cm und $b = 7$ cm. Runde auf eine Nachkommastelle.',
          answer: { kind: 'numeric', value: 8.1, tolerance: 0.05, unit: 'cm' },
          hints: ['Berechne $4^2 + 7^2$.', '$16 + 49 = 65$', 'Ziehe die Wurzel aus $65$ und runde.'],
          solution: {
            steps: [
              { text: 'Einsetzen:', math: 'c^2 = 16 + 49 = 65' },
              { text: 'Wurzel ziehen:', math: 'c = \\sqrt{65} \\approx 8{,}06' },
              { text: 'Runden:', math: 'c \\approx 8{,}1' },
            ],
            finalAnswer: '$c \\approx 8{,}1$ cm',
          },
          objectives: ['Hypotenuse berechnen', 'Sinnvoll runden'],
          commonMistakes: [
            { description: 'Seiten addiert', feedback: 'Quadriere zuerst die Seiten.', answers: ['11'] },
            { description: 'Wurzel vergessen', feedback: '$65$ ist $c^2$.', answers: ['65'] },
          ],
        },
        {
          id: 'pyth-hypotenuse-4',
          subtopicId: 'pyth-hypotenuse',
          type: 'handwriting',
          difficulty: 2,
          prompt: 'Schreibe deinen Rechenweg auf: Berechne $c$ für $a = 8$ cm und $b = 15$ cm. Gib danach das Ergebnis (in cm) ein.',
          answer: { kind: 'numeric', value: 17, tolerance: 0, unit: 'cm' },
          hints: ['Schreibe zuerst die Formel auf.', '$8^2 = 64$, $15^2 = 225$.', '$\\sqrt{289} = \\;?$'],
          solution: {
            steps: [
              { text: 'Formel:', math: 'c^2 = a^2 + b^2' },
              { text: 'Einsetzen:', math: 'c^2 = 64 + 225 = 289' },
              { text: 'Wurzel:', math: 'c = \\sqrt{289} = 17' },
            ],
            finalAnswer: '$c = 17$ cm',
          },
          objectives: ['Hypotenuse berechnen', 'Rechenweg strukturiert notieren'],
          commonMistakes: [
            { description: 'Seiten addiert', feedback: '$8 + 15 = 23$ ist zu groß – quadriere zuerst.', answers: ['23'] },
            { description: 'Wurzel vergessen', feedback: '$289$ ist $c^2$.', answers: ['289'] },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'pyth-kathete',
      topicId: T,
      order: 5,
      title: 'Kathete berechnen',
      description: 'Eine fehlende Kathete aus Hypotenuse und anderer Kathete bestimmen.',
      objective: 'Du stellst den Satz nach einer Kathete um und berechnest sie.',
      intro: 'Ist die Hypotenuse bekannt, wird nicht addiert, sondern subtrahiert. Wichtig: Die Hypotenuse steht immer allein.',
      rules: [
        { term: 'Umgestellt nach $a$', explanation: '', math: 'a = \\sqrt{c^2 - b^2}' },
        { term: 'Umgestellt nach $b$', explanation: '', math: 'b = \\sqrt{c^2 - a^2}' },
        { term: 'Kontrolle', explanation: 'Die Kathete muss kürzer als die Hypotenuse sein.' },
      ],
      materials: [videoPlaceholder('pyth-kathete-v1', 'Kathete berechnen: Subtrahieren statt addieren')],
      example: {
        problem: 'Gegeben: $c = 10$ cm, $a = 6$ cm. Berechne $b$.',
        steps: [
          { text: 'Umstellen:', math: 'b^2 = c^2 - a^2' },
          { text: 'Einsetzen:', math: 'b^2 = 100 - 36 = 64' },
          { text: 'Wurzel:', math: 'b = 8' },
        ],
        result: '$b = 8$ cm',
      },
      summary: ['Kathete: $\\sqrt{c^2 - \\text{andere Kathete}^2}$', 'Die Kathete ist immer kürzer als die Hypotenuse.'],
      exercises: [
        {
          id: 'pyth-kathete-1',
          subtopicId: 'pyth-kathete',
          type: 'numeric',
          difficulty: 1,
          prompt: 'Gegeben sind $c = 13$ cm und $a = 5$ cm. Berechne $b$ (in cm).',
          answer: { kind: 'numeric', value: 12, tolerance: 0, unit: 'cm' },
          hints: ['Die Hypotenuse ist gegeben – du musst subtrahieren.', '$b^2 = 13^2 - 5^2$', '$169 - 25 = 144$'],
          solution: {
            steps: [
              { text: 'Umstellen:', math: 'b^2 = c^2 - a^2 = 169 - 25 = 144' },
              { text: 'Wurzel:', math: 'b = 12' },
            ],
            finalAnswer: '$b = 12$ cm',
          },
          objectives: ['Kathete berechnen'],
          commonMistakes: [
            { description: 'Addiert statt subtrahiert', feedback: '$\\sqrt{169 + 25} \\approx 13{,}9$ wäre länger als die Hypotenuse – unmöglich.', answers: ['13.9', '13,9', '13.93'] },
            { description: 'Wurzel vergessen', feedback: '$144$ ist $b^2$.', answers: ['144'] },
          ],
        },
        {
          id: 'pyth-kathete-2',
          subtopicId: 'pyth-kathete',
          type: 'multiple-choice',
          difficulty: 2,
          prompt: 'Welche Formel liefert die Kathete $b$, wenn $c$ die Hypotenuse ist?',
          choices: [
            { id: 'a', label: '$b = \\sqrt{c^2 + a^2}$' },
            { id: 'b', label: '$b = \\sqrt{c^2 - a^2}$' },
            { id: 'c', label: '$b = c - a$' },
            { id: 'd', label: '$b = \\sqrt{a^2 - c^2}$' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: ['Starte bei $a^2 + b^2 = c^2$.', 'Bringe $a^2$ auf die andere Seite.', '$b^2 = c^2 - a^2$ – und dann?'],
          solution: {
            steps: [
              { text: 'Ausgangsgleichung:', math: 'a^2 + b^2 = c^2' },
              { text: '$-a^2$ auf beiden Seiten:', math: 'b^2 = c^2 - a^2' },
              { text: 'Wurzel:', math: 'b = \\sqrt{c^2 - a^2}' },
            ],
            finalAnswer: '$b = \\sqrt{c^2 - a^2}$',
          },
          objectives: ['Satz umstellen'],
          commonMistakes: [
            { description: 'Vorzeichen beim Umstellen falsch', feedback: 'Beim Umstellen wird aus $+a^2$ ein $-a^2$.', answers: ['a'] },
            { description: 'Reihenfolge vertauscht', feedback: '$a^2 - c^2$ ist negativ, weil $c$ die längste Seite ist.', answers: ['d'] },
          ],
        },
        {
          id: 'pyth-kathete-3',
          subtopicId: 'pyth-kathete',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Gegeben sind $c = 9$ cm und $b = 5$ cm. Berechne $a$ und runde auf eine Nachkommastelle.',
          answer: { kind: 'numeric', value: 7.5, tolerance: 0.05, unit: 'cm' },
          hints: ['Subtrahiere die Quadrate.', '$81 - 25 = 56$', 'Ziehe die Wurzel aus $56$ und runde.'],
          solution: {
            steps: [
              { text: 'Umstellen:', math: 'a^2 = 81 - 25 = 56' },
              { text: 'Wurzel:', math: 'a = \\sqrt{56} \\approx 7{,}48' },
              { text: 'Runden:', math: 'a \\approx 7{,}5' },
            ],
            finalAnswer: '$a \\approx 7{,}5$ cm',
          },
          objectives: ['Kathete berechnen', 'Sinnvoll runden'],
          commonMistakes: [{ description: 'Addiert statt subtrahiert', feedback: 'Ergebnis wäre länger als die Hypotenuse.', answers: ['10.3', '10,3'] }],
        },
        {
          id: 'pyth-kathete-4',
          subtopicId: 'pyth-kathete',
          type: 'handwriting',
          difficulty: 3,
          prompt:
            'Ein rechtwinkliges Dreieck hat die Hypotenuse $c = 25$ cm und die Kathete $a = 7$ cm. Berechne zuerst $b$ und dann den Umfang des Dreiecks. Gib den Umfang (in cm) ein.',
          answer: { kind: 'numeric', value: 56, tolerance: 0, unit: 'cm' },
          hints: ['Berechne zuerst die fehlende Kathete $b$.', '$b^2 = 625 - 49 = 576$, also $b = 24$.', 'Umfang $u = a + b + c$.'],
          solution: {
            steps: [
              { text: 'Kathete:', math: 'b = \\sqrt{25^2 - 7^2} = \\sqrt{576} = 24' },
              { text: 'Umfang:', math: 'u = 7 + 24 + 25 = 56' },
            ],
            finalAnswer: '$u = 56$ cm',
          },
          objectives: ['Kathete berechnen', 'Mehrschrittige Aufgaben lösen'],
          commonMistakes: [
            { description: 'Nur die Kathete angegeben', feedback: 'Gesucht ist der Umfang, nicht $b$.', answers: ['24'] },
            { description: 'Kathete falsch (addiert)', feedback: 'Bei gegebener Hypotenuse wird subtrahiert.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'pyth-umkehrung',
      topicId: T,
      order: 6,
      title: 'Umkehrung des Satzes',
      description: 'Mit drei Seitenlängen prüfen, ob ein Dreieck rechtwinklig ist.',
      objective: 'Du prüfst mit der Umkehrung des Satzes, ob ein Dreieck mit gegebenen Seiten rechtwinklig ist.',
      intro: 'Der Satz funktioniert auch rückwärts: Erfüllen die Seiten die Gleichung, dann muss das Dreieck einen rechten Winkel haben.',
      rules: [
        {
          term: 'Umkehrung',
          explanation: 'Gilt für die längste Seite $c$ die Gleichung $a^2 + b^2 = c^2$, dann ist das Dreieck rechtwinklig. Der rechte Winkel liegt gegenüber von $c$.',
        },
        { term: 'Längste Seite', explanation: 'Setze immer die längste Seite als $c$ ein.' },
        { term: 'Pythagoreische Tripel', explanation: 'Ganzzahlige Lösungen, z. B. $(3, 4, 5)$, $(5, 12, 13)$, $(8, 15, 17)$.' },
      ],
      materials: [videoPlaceholder('pyth-umkehrung-v1', 'Ist das Dreieck rechtwinklig? Die Umkehrung')],
      example: {
        problem: 'Ist ein Dreieck mit den Seiten $7$, $24$ und $25$ rechtwinklig?',
        steps: [
          { text: 'Längste Seite: $c = 25$.' },
          { text: 'Prüfen:', math: '7^2 + 24^2 = 49 + 576 = 625' },
          { text: 'Vergleich:', math: '25^2 = 625' },
        ],
        result: 'Ja, das Dreieck ist rechtwinklig.',
      },
      summary: ['Längste Seite als $c$ wählen.', '$a^2 + b^2 = c^2$ ⇒ rechtwinklig; sonst nicht.'],
      exercises: [
        {
          id: 'pyth-umkehrung-1',
          subtopicId: 'pyth-umkehrung',
          type: 'multiple-choice',
          difficulty: 1,
          prompt: 'Welche Seitenlängen ergeben ein rechtwinkliges Dreieck?',
          choices: [
            { id: 'a', label: '$4$, $5$, $6$' },
            { id: 'b', label: '$2$, $3$, $4$' },
            { id: 'c', label: '$6$, $8$, $10$' },
            { id: 'd', label: '$5$, $6$, $7$' },
          ],
          answer: { kind: 'choice', correct: 'c' },
          hints: ['Prüfe für jede Antwort $a^2 + b^2 = c^2$.', 'Die größte Zahl ist jeweils $c$.', '$36 + 64 = \\;?$'],
          solution: {
            steps: [
              { text: 'Prüfen:', math: '6^2 + 8^2 = 36 + 64 = 100 = 10^2' },
              { text: 'Bei den anderen Tripeln stimmt die Gleichung nicht (z. B. $16 + 25 = 41 \\neq 36$).' },
            ],
            finalAnswer: '$6$, $8$, $10$',
          },
          objectives: ['Umkehrung anwenden'],
          commonMistakes: [{ description: 'Nur auf aufeinanderfolgende Zahlen geachtet', feedback: 'Rechne die Quadrate wirklich nach.', answers: ['a', 'b', 'd'] }],
        },
        {
          id: 'pyth-umkehrung-2',
          subtopicId: 'pyth-umkehrung',
          type: 'multiple-choice',
          difficulty: 2,
          prompt: 'Ein Dreieck hat die Seiten $5$ cm, $7$ cm und $9$ cm. Ist es rechtwinklig?',
          choices: [
            { id: 'a', label: 'Ja, weil $5 + 7 > 9$.' },
            { id: 'b', label: 'Nein, weil $5^2 + 7^2 = 74 \\neq 81 = 9^2$.' },
            { id: 'c', label: 'Ja, weil $9$ die längste Seite ist.' },
            { id: 'd', label: 'Nein, weil $5 + 7 \\neq 9$.' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: ['Welche Seite ist die längste?', 'Berechne $5^2 + 7^2$.', 'Vergleiche mit $9^2 = 81$.'],
          solution: {
            steps: [
              { text: 'Längste Seite $c = 9$.' },
              { text: 'Prüfen:', math: '5^2 + 7^2 = 25 + 49 = 74' },
              { text: 'Vergleich:', math: '74 \\neq 81 = 9^2' },
            ],
            finalAnswer: 'Nein, das Dreieck ist nicht rechtwinklig.',
          },
          objectives: ['Umkehrung anwenden', 'Begründen'],
          commonMistakes: [
            { description: 'Dreiecksungleichung mit Pythagoras verwechselt', feedback: '$5 + 7 > 9$ zeigt nur, dass das Dreieck existiert.', answers: ['a'] },
            { description: 'Seiten statt Quadrate verglichen', feedback: 'Vergleiche die Quadrate der Seiten.', answers: ['d'] },
          ],
        },
        {
          id: 'pyth-umkehrung-3',
          subtopicId: 'pyth-umkehrung',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Ein Dreieck hat die Seiten $20$, $21$ und $29$. Berechne $20^2 + 21^2$.',
          answer: { kind: 'numeric', value: 841, tolerance: 0 },
          hints: ['Berechne die beiden Quadrate einzeln.', '$20^2 = 400$', '$21^2 = 441$'],
          solution: {
            steps: [
              { text: 'Quadrate:', math: '20^2 + 21^2 = 400 + 441 = 841' },
              { text: 'Vergleich:', math: '29^2 = 841' },
              { text: 'Gleichheit ⇒ das Dreieck ist rechtwinklig.' },
            ],
            finalAnswer: '$841$ (gleich $29^2$, also rechtwinklig)',
          },
          objectives: ['Umkehrung anwenden'],
          commonMistakes: [{ description: 'Seiten addiert', feedback: 'Quadriere jede Seite einzeln.', answers: ['41'] }],
        },
        {
          id: 'pyth-umkehrung-4',
          subtopicId: 'pyth-umkehrung',
          type: 'handwriting',
          difficulty: 3,
          prompt: 'Ein Dreieck hat die Seiten $12$ cm, $35$ cm und $37$ cm. Prüfe schriftlich mit der Umkehrung, ob es rechtwinklig ist. Gib „ja“ oder „nein“ ein.',
          answer: { kind: 'text', accepted: ['ja'] },
          hints: ['Die längste Seite ist $37$ cm.', 'Berechne $12^2 + 35^2$.', 'Vergleiche $144 + 1225$ mit $37^2 = 1369$.'],
          solution: {
            steps: [
              { text: 'Längste Seite $c = 37$.' },
              { text: 'Prüfen:', math: '12^2 + 35^2 = 144 + 1225 = 1369' },
              { text: 'Vergleich:', math: '37^2 = 1369' },
            ],
            finalAnswer: 'Ja, das Dreieck ist rechtwinklig.',
          },
          objectives: ['Umkehrung anwenden', 'Rechenweg dokumentieren'],
          commonMistakes: [{ description: 'Rechenfehler beim Quadrieren', feedback: 'Prüfe $35^2 = 1225$ und $37^2 = 1369$.', answers: ['nein'] }],
        },
      ],
    },
    // ------------------------------------------------------------------ 7
    {
      id: 'pyth-anwendung',
      topicId: T,
      order: 7,
      title: 'Anwendungs- und Textaufgaben',
      description: 'Leitern, Bildschirme, Drachen: den Satz im Alltag anwenden.',
      objective: 'Du findest in Sachsituationen rechtwinklige Dreiecke und löst die Aufgabe mit einem Antwortsatz.',
      intro: 'Viele Alltagsfragen verstecken ein rechtwinkliges Dreieck. Eine Skizze hilft dir, es zu finden.',
      rules: [
        { term: 'Schritt 1', explanation: 'Skizze zeichnen und das rechtwinklige Dreieck markieren.' },
        { term: 'Schritt 2', explanation: 'Gegebene und gesuchte Seiten eintragen. Ist die gesuchte Seite Hypotenuse oder Kathete?' },
        { term: 'Schritt 3', explanation: 'Rechnen, Einheit beachten, Antwortsatz schreiben.' },
      ],
      materials: [videoPlaceholder('pyth-anwendung-v1', 'Textaufgaben mit Skizze lösen', 360)],
      example: {
        problem: 'Eine $5$ m lange Leiter steht $1{,}4$ m von einer Wand entfernt. Wie hoch reicht sie?',
        steps: [
          { text: 'Leiter = Hypotenuse $c = 5$, Abstand zur Wand = Kathete $a = 1{,}4$.' },
          { text: 'Höhe gesucht (Kathete):', math: 'h = \\sqrt{5^2 - 1{,}4^2} = \\sqrt{25 - 1{,}96} = \\sqrt{23{,}04}' },
          { text: 'Ergebnis:', math: 'h = 4{,}8' },
        ],
        result: 'Die Leiter reicht $4{,}8$ m hoch.',
      },
      summary: ['Erst skizzieren, dann rechnen.', 'Prüfe, ob die gesuchte Seite Hypotenuse oder Kathete ist.', 'Antwortsatz mit Einheit.'],
      exercises: [
        {
          id: 'pyth-anwendung-1',
          subtopicId: 'pyth-anwendung',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Ein rechteckiger Bildschirm ist $48$ cm breit und $36$ cm hoch. Wie lang ist die Bildschirmdiagonale (in cm)?',
          answer: { kind: 'numeric', value: 60, tolerance: 0, unit: 'cm' },
          hints: ['Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke.', 'Die Diagonale ist die Hypotenuse.', '$48^2 + 36^2 = 2304 + 1296$'],
          solution: {
            steps: [
              { text: 'Diagonale ist Hypotenuse:', math: 'd^2 = 48^2 + 36^2 = 2304 + 1296 = 3600' },
              { text: 'Wurzel:', math: 'd = 60' },
            ],
            finalAnswer: 'Die Diagonale ist $60$ cm lang.',
          },
          objectives: ['Sachaufgaben modellieren'],
          commonMistakes: [{ description: 'Seiten addiert', feedback: 'Die Diagonale ist kürzer als Breite + Höhe.', answers: ['84'] }],
        },
        {
          id: 'pyth-anwendung-2',
          subtopicId: 'pyth-anwendung',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Eine $6{,}5$ m lange Leiter lehnt an einer Wand. Ihr Fuß steht $2{,}5$ m von der Wand entfernt. In welcher Höhe berührt sie die Wand (in m)?',
          answer: { kind: 'numeric', value: 6, tolerance: 0.01, unit: 'm' },
          hints: ['Die Leiter ist die Hypotenuse.', 'Gesucht ist eine Kathete – subtrahiere.', '$6{,}5^2 - 2{,}5^2 = 42{,}25 - 6{,}25$'],
          solution: {
            steps: [
              { text: 'Leiter = Hypotenuse:', math: 'h^2 = 6{,}5^2 - 2{,}5^2 = 42{,}25 - 6{,}25 = 36' },
              { text: 'Wurzel:', math: 'h = 6' },
            ],
            finalAnswer: 'Die Leiter berührt die Wand in $6$ m Höhe.',
          },
          objectives: ['Sachaufgaben modellieren', 'Kathete berechnen'],
          commonMistakes: [{ description: 'Leiter als Kathete behandelt', feedback: 'Die Leiter liegt gegenüber dem rechten Winkel zwischen Wand und Boden.', answers: ['6.96', '6,96', '7'] }],
        },
        {
          id: 'pyth-anwendung-3',
          subtopicId: 'pyth-anwendung',
          type: 'multiple-choice',
          difficulty: 2,
          prompt: 'Ein rechteckiger Sportplatz ist $80$ m lang und $60$ m breit. Tim läuft diagonal von einer Ecke zur gegenüberliegenden statt außen herum. Wie viele Meter spart er?',
          choices: [
            { id: 'a', label: '$20$ m' },
            { id: 'b', label: '$40$ m' },
            { id: 'c', label: '$60$ m' },
            { id: 'd', label: '$100$ m' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: ['Außen herum läuft er $80 + 60$ m.', 'Die Diagonale ist die Hypotenuse.', '$\\sqrt{80^2 + 60^2} = 100$ – wie groß ist die Differenz?'],
          solution: {
            steps: [
              { text: 'Weg außen:', math: '80 + 60 = 140' },
              { text: 'Diagonale:', math: '\\sqrt{6400 + 3600} = \\sqrt{10000} = 100' },
              { text: 'Ersparnis:', math: '140 - 100 = 40' },
            ],
            finalAnswer: 'Tim spart $40$ m.',
          },
          objectives: ['Sachaufgaben modellieren'],
          commonMistakes: [{ description: 'Diagonale statt Ersparnis angegeben', feedback: 'Gefragt ist die Differenz der Wege.', answers: ['d'] }],
        },
        {
          id: 'pyth-anwendung-4',
          subtopicId: 'pyth-anwendung',
          type: 'handwriting',
          difficulty: 3,
          prompt:
            'Ein Drachen fliegt an einer $50$ m langen, straff gespannten Schnur. Lisa steht $30$ m waagerecht von dem Punkt entfernt, der genau unter dem Drachen liegt. Sie hält die Schnur $1{,}5$ m über dem Boden. Fertige eine Skizze an und berechne, wie hoch der Drachen fliegt (in m).',
          answer: { kind: 'numeric', value: 41.5, tolerance: 0.01, unit: 'm' },
          hints: [
            'Die Schnur ist die Hypotenuse, der waagerechte Abstand eine Kathete.',
            'Die senkrechte Kathete beginnt in Lisas Handhöhe: $\\sqrt{50^2 - 30^2}$.',
            'Addiere zum Schluss die Handhöhe von $1{,}5$ m.',
          ],
          solution: {
            steps: [
              { text: 'Senkrechte Kathete ab Handhöhe:', math: 'h_1 = \\sqrt{50^2 - 30^2} = \\sqrt{2500 - 900} = \\sqrt{1600} = 40' },
              { text: 'Handhöhe addieren:', math: 'h = 40 + 1{,}5 = 41{,}5' },
            ],
            finalAnswer: 'Der Drachen fliegt $41{,}5$ m hoch.',
          },
          objectives: ['Sachaufgaben modellieren', 'Mehrschrittige Aufgaben lösen'],
          commonMistakes: [
            { description: 'Handhöhe vergessen', feedback: 'Das Dreieck beginnt in Lisas Handhöhe, nicht am Boden.', answers: ['40'] },
            { description: 'Addiert statt subtrahiert', feedback: 'Die Schnur ist die Hypotenuse.', answers: ['58.3', '58,3', '59.8', '59,8'] },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------ 8
    {
      id: 'pyth-gemischt',
      topicId: T,
      order: 8,
      title: 'Gemischte Übungen und Prüfungsvorbereitung',
      description: 'Alle Aufgabentypen gemischt – wie in der Klassenarbeit.',
      objective: 'Du wählst selbstständig den passenden Ansatz und löst auch mehrschrittige Aufgaben.',
      intro: 'Hier kommt alles zusammen. Überlege bei jeder Aufgabe zuerst: Wo ist das rechtwinklige Dreieck, und was ist gesucht?',
      rules: [
        { term: 'Quadratdiagonale', explanation: 'Für ein Quadrat mit Seite $s$ gilt:', math: 'd = s\\sqrt{2}' },
        { term: 'Höhe im gleichseitigen Dreieck', explanation: 'Für die Seitenlänge $s$ gilt:', math: 'h = \\sqrt{s^2 - \\left(\\tfrac{s}{2}\\right)^2}' },
        { term: 'Raumdiagonale', explanation: 'Im Quader mit Kanten $a$, $b$, $c$:', math: 'd = \\sqrt{a^2 + b^2 + c^2}' },
      ],
      materials: [videoPlaceholder('pyth-gemischt-v1', 'Prüfungsaufgaben clever angehen', 420)],
      example: {
        problem: 'Wie lang ist die Raumdiagonale eines Würfels mit Kantenlänge $2$ cm?',
        steps: [
          { text: 'Flächendiagonale:', math: 'e = \\sqrt{2^2 + 2^2} = \\sqrt{8}' },
          { text: 'Raumdiagonale:', math: 'd = \\sqrt{e^2 + 2^2} = \\sqrt{8 + 4} = \\sqrt{12} \\approx 3{,}46' },
        ],
        result: '$d \\approx 3{,}46$ cm',
      },
      summary: ['Rechtwinklige Dreiecke auch in Quadraten, Rechtecken und Körpern suchen.', 'Mehrschrittige Aufgaben in Teilschritte zerlegen.'],
      exercises: [
        {
          id: 'pyth-gemischt-1',
          subtopicId: 'pyth-gemischt',
          type: 'numeric',
          difficulty: 2,
          prompt: 'Wie lang ist die Diagonale eines Quadrats mit der Seitenlänge $5$ cm? Runde auf eine Nachkommastelle.',
          answer: { kind: 'numeric', value: 7.1, tolerance: 0.05, unit: 'cm' },
          hints: ['Die Diagonale teilt das Quadrat in zwei rechtwinklige Dreiecke.', '$d^2 = 5^2 + 5^2$', '$\\sqrt{50} \\approx \\;?$'],
          solution: {
            steps: [
              { text: 'Einsetzen:', math: 'd^2 = 25 + 25 = 50' },
              { text: 'Wurzel:', math: 'd = \\sqrt{50} \\approx 7{,}07 \\approx 7{,}1' },
            ],
            finalAnswer: '$d \\approx 7{,}1$ cm',
          },
          objectives: ['Pythagoras in Vierecken anwenden'],
          commonMistakes: [{ description: 'Seiten addiert', feedback: 'Die Diagonale ist kürzer als zwei Seiten zusammen.', answers: ['10'] }],
        },
        {
          id: 'pyth-gemischt-2',
          subtopicId: 'pyth-gemischt',
          type: 'numeric',
          difficulty: 3,
          prompt: 'Berechne die Höhe eines gleichseitigen Dreiecks mit der Seitenlänge $6$ cm. Runde auf eine Nachkommastelle.',
          answer: { kind: 'numeric', value: 5.2, tolerance: 0.05, unit: 'cm' },
          hints: [
            'Die Höhe teilt das Dreieck in zwei rechtwinklige Dreiecke.',
            'Hypotenuse ist $6$ cm, eine Kathete ist die halbe Seite, also $3$ cm.',
            '$h = \\sqrt{36 - 9}$',
          ],
          solution: {
            steps: [
              { text: 'Teildreieck: Hypotenuse $6$, Kathete $3$.' },
              { text: 'Höhe:', math: 'h = \\sqrt{6^2 - 3^2} = \\sqrt{27} \\approx 5{,}196' },
              { text: 'Runden:', math: 'h \\approx 5{,}2' },
            ],
            finalAnswer: '$h \\approx 5{,}2$ cm',
          },
          objectives: ['Pythagoras in Figuren erkennen'],
          commonMistakes: [{ description: 'Ganze statt halbe Seite verwendet', feedback: 'Die Höhe halbiert die Grundseite.', answers: ['0'] }],
        },
        {
          id: 'pyth-gemischt-3',
          subtopicId: 'pyth-gemischt',
          type: 'multiple-choice',
          difficulty: 2,
          prompt: 'Ein Rechteck hat eine Diagonale von $10$ cm und eine Seite von $6$ cm. Wie groß ist sein Flächeninhalt?',
          choices: [
            { id: 'a', label: '$60\\,\\text{cm}^2$' },
            { id: 'b', label: '$48\\,\\text{cm}^2$' },
            { id: 'c', label: '$24\\,\\text{cm}^2$' },
            { id: 'd', label: '$80\\,\\text{cm}^2$' },
          ],
          answer: { kind: 'choice', correct: 'b' },
          hints: ['Berechne zuerst die zweite Seite.', '$\\sqrt{10^2 - 6^2} = 8$', 'Fläche $= 6 \\cdot 8$.'],
          solution: {
            steps: [
              { text: 'Zweite Seite:', math: 'b = \\sqrt{100 - 36} = 8' },
              { text: 'Fläche:', math: 'A = 6 \\cdot 8 = 48' },
            ],
            finalAnswer: '$48\\,\\text{cm}^2$',
          },
          objectives: ['Mehrschrittige Aufgaben lösen'],
          commonMistakes: [
            { description: 'Diagonale als Seite verwendet', feedback: 'Die Diagonale ist keine Rechteckseite.', answers: ['a'] },
            { description: 'Dreiecksfläche berechnet', feedback: 'Gefragt ist das ganze Rechteck.', answers: ['c'] },
          ],
        },
        {
          id: 'pyth-gemischt-4',
          subtopicId: 'pyth-gemischt',
          type: 'equation',
          difficulty: 3,
          prompt: 'Ein rechtwinkliges Dreieck hat die Katheten $x$ und $x + 7$ und die Hypotenuse $13$. Bestimme $x > 0$.',
          answer: { kind: 'numeric-set', values: [5], tolerance: 0 },
          hints: [
            'Stelle die Gleichung $x^2 + (x+7)^2 = 13^2$ auf.',
            'Ausmultiplizieren ergibt $2x^2 + 14x + 49 = 169$, also $x^2 + 7x - 60 = 0$.',
            'Löse die quadratische Gleichung und beachte $x > 0$.',
          ],
          solution: {
            steps: [
              { text: 'Gleichung:', math: 'x^2 + (x+7)^2 = 169' },
              { text: 'Ausmultiplizieren:', math: '2x^2 + 14x + 49 = 169 \\;\\Rightarrow\\; x^2 + 7x - 60 = 0' },
              { text: 'Faktorisieren:', math: '(x + 12)(x - 5) = 0' },
              { text: 'Nur positive Lösung ist sinnvoll:', math: 'x = 5' },
            ],
            finalAnswer: '$x = 5$ (Seiten $5$, $12$, $13$)',
          },
          objectives: ['Pythagoras mit Gleichungen verbinden'],
          commonMistakes: [{ description: 'Negative Lösung angegeben', feedback: 'Eine Seitenlänge kann nicht negativ sein.', answers: ['-12'] }],
        },
        {
          id: 'pyth-gemischt-5',
          subtopicId: 'pyth-gemischt',
          type: 'handwriting',
          difficulty: 3,
          prompt: 'Ein Quader hat die Kanten $3$ cm, $4$ cm und $12$ cm. Berechne schriftlich die Länge der Raumdiagonale (in cm).',
          answer: { kind: 'numeric', value: 13, tolerance: 0, unit: 'cm' },
          hints: ['Berechne zuerst eine Flächendiagonale der Grundfläche.', '$e = \\sqrt{3^2 + 4^2} = 5$', '$d = \\sqrt{5^2 + 12^2}$'],
          solution: {
            steps: [
              { text: 'Flächendiagonale:', math: 'e = \\sqrt{9 + 16} = 5' },
              { text: 'Raumdiagonale:', math: 'd = \\sqrt{25 + 144} = \\sqrt{169} = 13' },
            ],
            finalAnswer: '$d = 13$ cm',
          },
          objectives: ['Pythagoras im Raum anwenden'],
          commonMistakes: [{ description: 'Nur Flächendiagonale berechnet', feedback: 'Das ist erst der Zwischenschritt.', answers: ['5'] }],
        },
      ],
    },
  ],
};
