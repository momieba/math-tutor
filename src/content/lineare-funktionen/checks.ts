/** Formel-Check (Lernpfad Schritt 3) für Lineare Funktionen. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'lf-funktionsbegriff': {
    mark: { 'lf-fb-1': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-fb-fc-1',
        subtopicId: 'lf-funktionsbegriff',
        prompt: 'Wie berechnest du den Funktionswert $f(4)$ für $f(x) = 2x + 5$?',
        correct: '$2 \\cdot 4 + 5$',
        wrong: ['$2 + 4 + 5$', '$(2 + 5) \\cdot 4$', '$2 \\cdot 5 + 4$'],
        hints: ['$f(4)$: Für $x$ wird $4$ eingesetzt.', 'Jedes $x$ im Term wird durch $4$ ersetzt.', '$2x$ bedeutet $2 \\cdot x$.'],
        explanation: 'Für $x$ wird $4$ eingesetzt: $f(4) = 2 \\cdot 4 + 5 = 13$.',
      }),
      {
        id: 'lf-fb-fc-2',
        subtopicId: 'lf-funktionsbegriff',
        type: 'equation',
        requirement: 'knowledge',
        checkpoint: 'formula',
        difficulty: 2,
        prompt: 'Jedem $x$ wird das Dreifache von $x$ minus $2$ zugeordnet. Gib die Funktionsgleichung an.',
        answer: { kind: 'linear', m: 3, b: -2, tolerance: 0.001 },
        hints: ['„Das Dreifache von $x$“ ist $3x$.', '„minus 2“ wird angehängt.', 'Schreibe $f(x) = \\ldots$ oder $y = \\ldots$'],
        solution: { steps: [{ text: 'Dreifaches von $x$: $3x$, minus $2$: $f(x) = 3x - 2$.' }], finalAnswer: '$f(x) = 3x - 2$' },
        objectives: ['Funktionsgleichungen aufstellen'],
        commonMistakes: [{ description: 'Reihenfolge vertauscht', feedback: 'Erst das Dreifache von $x$, dann minus $2$ – nicht $3(x - 2)$.', answers: ['y = 3x - 6'] }],
      },
    ],
  },
  'lf-proportional': {
    mark: { 'lf-pr-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-pr-fc-1',
        subtopicId: 'lf-proportional',
        prompt: 'Welche Funktionsgleichung hat eine proportionale Funktion?',
        correct: '$f(x) = m \\cdot x$',
        wrong: ['$f(x) = m \\cdot x + b$ mit $b \\neq 0$', '$f(x) = x^2$', '$f(x) = \\frac{m}{x}$'],
        hints: ['Der Graph geht durch den Ursprung.', 'Was muss $f(0)$ sein?', 'Kein Summand ohne $x$.'],
        explanation: 'Proportional heißt $f(x) = m \\cdot x$: doppeltes $x$, doppeltes $y$; der Graph geht durch $(0\\,|\\,0)$.',
      }),
      formulaChoice({
        id: 'lf-pr-fc-2',
        subtopicId: 'lf-proportional',
        prompt: 'Eine Ursprungsgerade geht durch $P(x\\,|\\,y)$. Mit welcher Formel bestimmst du ihre Steigung?',
        correct: '$m = \\frac{y}{x}$',
        wrong: ['$m = \\frac{x}{y}$', '$m = y - x$', '$m = x \\cdot y$'],
        hints: ['$y = m \\cdot x$ nach $m$ umstellen.', 'Teile beide Seiten durch $x$.', 'Der $y$-Wert steht oben.'],
        explanation: 'Aus $y = m \\cdot x$ folgt $m = \\frac{y}{x}$.',
        mistake: 'Der $y$-Wert steht im Zähler: $m = \\frac{y}{x}$.',
      }),
    ],
  },
  'lf-steigung': {
    mark: { 'lf-st-1': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-st-fc-1',
        subtopicId: 'lf-steigung',
        prompt: 'Wie lautet die allgemeine Gleichung einer linearen Funktion?',
        correct: '$f(x) = mx + b$',
        wrong: ['$f(x) = mx^2 + b$', '$f(x) = m + bx^2$', '$f(x) = \\frac{m}{x} + b$'],
        hints: ['Der Graph ist eine Gerade.', '$m$ ist die Steigung, $b$ der $y$-Achsenabschnitt.', 'Kein Quadrat, kein Bruch mit $x$ im Nenner.'],
        explanation: 'Lineare Funktion: $f(x) = mx + b$ mit Steigung $m$ und $y$-Achsenabschnitt $b$.',
      }),
      formulaChoice({
        id: 'lf-st-fc-2',
        subtopicId: 'lf-steigung',
        prompt: 'Mit welcher Formel berechnest du die Steigung der Geraden durch $P_1(x_1\\,|\\,y_1)$ und $P_2(x_2\\,|\\,y_2)$?',
        correct: '$m = \\frac{y_2 - y_1}{x_2 - x_1}$',
        wrong: ['$m = \\frac{x_2 - x_1}{y_2 - y_1}$', '$m = \\frac{y_2 + y_1}{x_2 + x_1}$', '$m = y_2 - y_1$'],
        hints: ['Steigung = Höhenunterschied : Breite.', 'Oben stehen die $y$-Werte.', 'Unten stehen die $x$-Werte.'],
        explanation: 'Steigungsdreieck: $m = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$.',
        mistake: 'Die $y$-Differenz gehört in den Zähler.',
      }),
    ],
  },
  'lf-aufstellen': {
    mark: { 'lf-af-1': 'formula', 'lf-af-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-af-fc-1',
        subtopicId: 'lf-aufstellen',
        prompt: 'Zwei Punkte $P_1$ und $P_2$ einer Geraden sind gegeben. Was berechnest du zuerst – und mit welcher Formel?',
        correct: 'die Steigung: $m = \\frac{y_2 - y_1}{x_2 - x_1}$',
        wrong: ['den Achsenabschnitt: $b = y_2 - y_1$', 'die Steigung: $m = \\frac{x_2 - x_1}{y_2 - y_1}$', 'die Nullstelle: $x_0 = -\\frac{b}{m}$'],
        hints: ['Für $b$ brauchst du schon $m$.', 'Also kommt zuerst die Steigung.', 'Höhe durch Breite.'],
        explanation: 'Zuerst die Steigung $m = \\frac{y_2 - y_1}{x_2 - x_1}$, dann $b$ durch Einsetzen eines Punktes.',
      }),
    ],
  },
  'lf-nullstellen': {
    mark: { 'lf-ns-1': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-ns-fc-1',
        subtopicId: 'lf-nullstellen',
        prompt: 'Welche Formel liefert die Nullstelle von $f(x) = mx + b$ (mit $m \\neq 0$)?',
        correct: '$x_0 = -\\frac{b}{m}$',
        wrong: ['$x_0 = \\frac{b}{m}$', '$x_0 = -\\frac{m}{b}$', '$x_0 = b - m$'],
        hints: ['Setze $mx + b = 0$.', '$mx = -b$', 'Teile durch $m$.'],
        explanation: 'Aus $mx + b = 0$ folgt $mx = -b$, also $x_0 = -\\frac{b}{m}$.',
        mistake: 'Beim Herüberbringen von $b$ wechselt das Vorzeichen: $x_0 = -\\frac{b}{m}$.',
      }),
      formulaChoice({
        id: 'lf-ns-fc-2',
        subtopicId: 'lf-nullstellen',
        prompt: 'Mit welchem Ansatz berechnest du den Schnittpunkt der Geraden $f$ und $g$?',
        correct: '$f(x) = g(x)$',
        wrong: ['$f(x) + g(x) = 0$', '$f(0) = g(0)$', '$f(x) = 0$'],
        hints: ['Im Schnittpunkt haben beide Geraden denselben $y$-Wert.', 'Also sind die Funktionswerte gleich.', 'Terme gleichsetzen.'],
        explanation: 'Im Schnittpunkt gilt $f(x) = g(x)$: Terme gleichsetzen, $x$ berechnen, $y$ durch Einsetzen.',
      }),
    ],
  },
  'lf-anwendungen': {
    mark: { 'lf-aw-1': 'concept', 'lf-aw-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lf-aw-fc-1',
        subtopicId: 'lf-anwendungen',
        prompt: 'Ein Tarif hat die Grundgebühr $G$ und den Preis $p$ pro Einheit. Welche Formel beschreibt die Kosten $K$ für $x$ Einheiten?',
        correct: '$K(x) = p \\cdot x + G$',
        wrong: ['$K(x) = G \\cdot x + p$', '$K(x) = (p + G) \\cdot x$', '$K(x) = p \\cdot x - G$'],
        hints: ['Was fällt pro Einheit an?', 'Was zahlt man immer, auch bei $x = 0$?', 'Preis pro Einheit vor das $x$.'],
        explanation: 'Pro Einheit $p$ (Steigung), dazu einmal die Grundgebühr $G$ (Achsenabschnitt): $K(x) = p \\cdot x + G$.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
