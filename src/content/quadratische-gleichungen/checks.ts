/** Formel-Check (Lernpfad Schritt 3) für Quadratische Gleichungen. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'quad-reinquadratisch': {
    mark: { 'quad-reinquadratisch-2': 'concept' },
    add: [
      formulaChoice({
        id: 'quad-rq-fc-1',
        subtopicId: 'quad-reinquadratisch',
        prompt: 'Welche Lösungen hat $x^2 = d$ für $d > 0$?',
        correct: '$x = \\sqrt{d}$ oder $x = -\\sqrt{d}$',
        wrong: ['nur $x = \\sqrt{d}$', '$x = \\frac{d}{2}$', '$x = d^2$'],
        hints: ['Welche Zahlen ergeben quadriert $d$?', '$(-3)^2 = 3^2 = 9$', 'Positive und negative Wurzel.'],
        explanation: '$x^2 = d$ hat für $d > 0$ zwei Lösungen: $\\pm\\sqrt{d}$.',
      }),
      formulaChoice({
        id: 'quad-rq-fc-2',
        subtopicId: 'quad-reinquadratisch',
        difficulty: 2,
        prompt: 'Welche Lösungen hat $(x - c)^2 = e$ für $e > 0$?',
        correct: '$x = c \\pm \\sqrt{e}$',
        wrong: ['$x = -c \\pm \\sqrt{e}$', '$x = c + e$', '$x = \\pm\\sqrt{e} - c$'],
        hints: ['Wurzel ziehen: $x - c = \\pm\\sqrt{e}$', 'Dann $c$ auf die andere Seite.', 'Aus $-c$ wird $+c$.'],
        explanation: '$x - c = \\pm\\sqrt{e}$, also $x = c \\pm \\sqrt{e}$.',
      }),
    ],
  },
  'quad-nullprodukt': {
    mark: { 'quad-nullprodukt-3': 'concept' },
    add: [
      formulaChoice({
        id: 'quad-np-fc-1',
        subtopicId: 'quad-nullprodukt',
        prompt: 'Was besagt der Satz vom Nullprodukt?',
        correct: '$a \\cdot b = 0$ genau dann, wenn $a = 0$ oder $b = 0$',
        wrong: ['$a \\cdot b = 0$ genau dann, wenn $a = 0$ und $b = 0$', '$a \\cdot b = 0$ genau dann, wenn $a = b$', '$a + b = 0$ genau dann, wenn $a = 0$'],
        hints: ['Wann ist ein Produkt null?', 'Es reicht, wenn ein Faktor null ist.', '„oder“, nicht „und“.'],
        explanation: 'Ein Produkt ist null, wenn mindestens ein Faktor null ist.',
      }),
      formulaChoice({
        id: 'quad-np-fc-2',
        subtopicId: 'quad-nullprodukt',
        prompt: 'Wie formst du $x^2 + px = 0$ um, um den Satz vom Nullprodukt zu nutzen?',
        correct: '$x(x + p) = 0$',
        wrong: ['$x^2 = p$', '$x + p = 0$', '$(x + p)^2 = 0$'],
        hints: ['In beiden Summanden steckt ein $x$.', 'Klammere $x$ aus.', 'Nicht durch $x$ teilen.'],
        explanation: 'Ausklammern: $x^2 + px = x(x + p) = 0$ ⇒ $x = 0$ oder $x = -p$.',
      }),
    ],
  },
  'quad-pq-formel': {
    mark: { 'quad-pq-formel-2': 'concept' },
    add: [
      formulaChoice({
        id: 'quad-pq-fc-1',
        subtopicId: 'quad-pq-formel',
        prompt: 'Wie lautet die pq-Formel für $x^2 + px + q = 0$?',
        correct: '$x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$',
        wrong: ['$x = \\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$', '$x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 + q}$', '$x = -p \\pm \\sqrt{p^2 - q}$'],
        hints: ['Vor dem Bruch steht ein Minus.', 'Unter der Wurzel: $\\left(\\frac{p}{2}\\right)^2$ minus $q$.', 'Dann $\\pm$ für zwei Lösungen.'],
        explanation: '$x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$',
        mistake: 'Achte auf die Vorzeichen: $-\\frac{p}{2}$ vor der Wurzel, $-q$ unter der Wurzel.',
      }),
      formulaChoice({
        id: 'quad-pq-fc-2',
        subtopicId: 'quad-pq-formel',
        difficulty: 2,
        prompt: 'Was musst du tun, bevor du die pq-Formel auf $3x^2 + 6x - 9 = 0$ anwendest?',
        correct: 'durch $3$ teilen (Normalform)',
        wrong: ['mit $3$ multiplizieren', 'nichts, man setzt $p = 6$ und $q = -9$', 'die Wurzel ziehen'],
        hints: ['Die pq-Formel gilt für $x^2 + px + q = 0$.', 'Vor $x^2$ muss eine $1$ stehen.', 'Teile durch den Faktor vor $x^2$.'],
        explanation: 'Erst normieren: $x^2 + 2x - 3 = 0$, dann ist $p = 2$, $q = -3$.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
