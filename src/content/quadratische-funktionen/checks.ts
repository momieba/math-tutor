/** Formel-Check (Lernpfad Schritt 3) für Quadratische Funktionen. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'qf-normalparabel': {
    mark: { 'qf-np-1': 'concept' },
    add: [
      formulaChoice({
        id: 'qf-np-fc-1',
        subtopicId: 'qf-normalparabel',
        prompt: 'Wann ist die Parabel $f(x) = ax^2$ nach unten geöffnet und schmaler als die Normalparabel?',
        correct: '$a < -1$',
        wrong: ['$-1 < a < 0$', '$a > 1$', '$0 < a < 1$'],
        hints: ['Das Vorzeichen bestimmt die Öffnung.', 'Nach unten: $a < 0$.', 'Schmaler heißt gestreckt: $|a| > 1$.'],
        explanation: 'Nach unten geöffnet heißt $a < 0$, schmaler heißt $|a| > 1$ – zusammen $a < -1$.',
      }),
      formulaChoice({
        id: 'qf-np-fc-2',
        subtopicId: 'qf-normalparabel',
        prompt: 'Die Parabel $f(x) = ax^2$ geht durch $P(x_P\\,|\\,y_P)$. Wie berechnest du $a$?',
        correct: '$a = \\frac{y_P}{x_P^2}$',
        wrong: ['$a = \\frac{y_P}{x_P}$', '$a = y_P \\cdot x_P^2$', '$a = \\frac{x_P^2}{y_P}$'],
        hints: ['Setze $P$ in $y = ax^2$ ein.', '$y_P = a \\cdot x_P^2$', 'Nach $a$ auflösen.'],
        explanation: 'Aus $y_P = a \\cdot x_P^2$ folgt $a = \\frac{y_P}{x_P^2}$.',
        mistake: 'In $f(x) = ax^2$ steht $x^2$ – geteilt wird durch $x_P^2$.',
      }),
    ],
  },
  'qf-scheitelform': {
    mark: { 'qf-sf-1': 'concept' },
    add: [
      formulaChoice({
        id: 'qf-sf-fc-1',
        subtopicId: 'qf-scheitelform',
        prompt: 'Welchen Scheitelpunkt hat $f(x) = a(x - d)^2 + e$?',
        correct: '$S(d\\,|\\,e)$',
        wrong: ['$S(-d\\,|\\,e)$', '$S(e\\,|\\,d)$', '$S(d\\,|\\,-e)$'],
        hints: ['Für welches $x$ ist die Klammer null?', '$(x - d)^2 = 0$ bei $x = d$.', 'Dann bleibt $f(d) = e$.'],
        explanation: 'Die Klammer ist bei $x = d$ null, dort ist $f(d) = e$: $S(d\\,|\\,e)$.',
      }),
      formulaChoice({
        id: 'qf-sf-fc-2',
        subtopicId: 'qf-scheitelform',
        prompt: 'Die Normalparabel wird um $3$ nach links und um $2$ nach oben verschoben. Welche Gleichung entsteht?',
        correct: '$f(x) = (x + 3)^2 + 2$',
        wrong: ['$f(x) = (x - 3)^2 + 2$', '$f(x) = (x + 2)^2 + 3$', '$f(x) = (x + 3)^2 - 2$'],
        hints: ['Der Scheitelpunkt ist $S(-3\\,|\\,2)$.', 'Setze in $(x - d)^2 + e$ ein.', '$x - (-3) = x + 3$'],
        explanation: '$S(-3\\,|\\,2)$, also $f(x) = (x - (-3))^2 + 2 = (x + 3)^2 + 2$.',
        mistake: 'Nach links heißt $d < 0$: In der Klammer steht dann ein Plus.',
      }),
    ],
  },
  'qf-allgemeine-form': {
    mark: { 'qf-af-1': 'concept' },
    add: [
      formulaChoice({
        id: 'qf-af-fc-1',
        subtopicId: 'qf-allgemeine-form',
        prompt: 'An welcher Stelle liegt der Scheitelpunkt von $f(x) = x^2 + px + q$?',
        correct: '$x_S = -\\frac{p}{2}$',
        wrong: ['$x_S = \\frac{p}{2}$', '$x_S = -p$', '$x_S = -\\frac{q}{2}$'],
        hints: ['Quadratische Ergänzung: $x^2 + px = \\left(x + \\frac{p}{2}\\right)^2 - \\ldots$', 'Wann ist die Klammer null?', 'Vorzeichen beachten.'],
        explanation: '$x^2 + px + q = \\left(x + \\frac{p}{2}\\right)^2 + \\ldots$ – die Klammer ist bei $x = -\\frac{p}{2}$ null.',
      }),
      formulaChoice({
        id: 'qf-af-fc-2',
        subtopicId: 'qf-allgemeine-form',
        prompt: 'Welche Zahl ergänzt man bei der quadratischen Ergänzung von $x^2 + px$?',
        correct: '$\\left(\\frac{p}{2}\\right)^2$',
        wrong: ['$p^2$', '$\\frac{p}{2}$', '$2p$'],
        hints: ['$(x + b)^2 = x^2 + 2bx + b^2$', '$2b = p$', 'Ergänzt wird $b^2$.'],
        explanation: 'Mit $2b = p$ ist $b = \\frac{p}{2}$; ergänzt wird $b^2 = \\left(\\frac{p}{2}\\right)^2$.',
      }),
    ],
  },
  'qf-nullstellen': {
    mark: { 'qf-ns-1': 'concept' },
    add: [
      formulaChoice({
        id: 'qf-ns-fc-1',
        subtopicId: 'qf-nullstellen',
        prompt: 'Wie lautet die pq-Formel für $x^2 + px + q = 0$?',
        correct: '$x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$',
        wrong: ['$x_{1,2} = \\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$', '$x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 + q}$', '$x_{1,2} = -p \\pm \\sqrt{p^2 - q}$'],
        hints: ['Vor der Wurzel steht $-\\frac{p}{2}$.', 'Unter der Wurzel: $\\left(\\frac{p}{2}\\right)^2$ …', '… minus $q$.'],
        explanation: '$x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$.',
      }),
      formulaChoice({
        id: 'qf-ns-fc-2',
        subtopicId: 'qf-nullstellen',
        prompt: 'Die Diskriminante $D = \\left(\\frac{p}{2}\\right)^2 - q$ ist negativ. Was folgt?',
        correct: 'Die Parabel hat keine Nullstelle.',
        wrong: ['Die Parabel hat genau eine Nullstelle.', 'Die Parabel hat zwei Nullstellen.', 'Die Parabel ist nach unten geöffnet.'],
        hints: ['$D$ steht unter der Wurzel.', 'Kann man aus einer negativen Zahl die Wurzel ziehen?', 'Keine Wurzel – keine Lösung.'],
        explanation: 'Aus einer negativen Zahl lässt sich keine Wurzel ziehen: keine Lösung, also keine Nullstelle.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
