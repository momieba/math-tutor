/** Formel-Check (Lernpfad Schritt 3) für Prozentrechnung. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'prozent-grundbegriffe': {
    mark: { 'prozent-grundbegriffe-3': 'concept' },
    add: [
      formulaChoice({
        id: 'prz-gb-fc-1',
        subtopicId: 'prozent-grundbegriffe',
        prompt: 'Was bedeutet $p\\,\\%$?',
        correct: '$\\frac{p}{100}$',
        wrong: ['$\\frac{p}{10}$', '$\\frac{100}{p}$', '$p \\cdot 100$'],
        hints: ['„Prozent“ heißt „von Hundert“.', '$1\\,\\%$ ist ein Hundertstel.', '$p\\,\\%$ sind $p$ Hundertstel.'],
        explanation: '$p\\,\\% = \\frac{p}{100}$, z. B. $35\\,\\% = \\frac{35}{100} = 0{,}35$.',
      }),
      formulaChoice({
        id: 'prz-gb-fc-2',
        subtopicId: 'prozent-grundbegriffe',
        prompt: 'Wie lautet die Grundgleichung der Prozentrechnung ($G$ Grundwert, $W$ Prozentwert, $p\\,\\%$ Prozentsatz)?',
        correct: '$W = G \\cdot \\frac{p}{100}$',
        wrong: ['$G = W \\cdot \\frac{p}{100}$', '$W = \\frac{G}{p} \\cdot 100$', '$W = G + p$'],
        hints: ['Der Prozentwert ist ein Teil des Grundwerts.', 'Teil = Ganzes mal Anteil.', 'Anteil $= \\frac{p}{100}$'],
        explanation: 'Prozentwert = Grundwert mal Anteil: $W = G \\cdot \\frac{p}{100}$.',
      }),
    ],
  },
  'prozent-prozentwert': {
    mark: { 'prozent-prozentwert-2': 'formula' },
    add: [
      formulaChoice({
        id: 'prz-pw-fc-1',
        subtopicId: 'prozent-prozentwert',
        prompt: 'Mit welcher Formel berechnest du den Prozentwert $W$?',
        correct: '$W = G \\cdot \\frac{p}{100}$',
        wrong: ['$W = \\frac{G}{p}$', '$W = \\frac{G \\cdot 100}{p}$', '$W = G - p$'],
        hints: ['Teil vom Ganzen.', 'Ganzes mal Anteil.', '$\\frac{p}{100}$ ist der Anteil.'],
        explanation: '$W = G \\cdot \\frac{p}{100}$',
      }),
      formulaChoice({
        id: 'prz-pw-fc-2',
        subtopicId: 'prozent-prozentwert',
        difficulty: 2,
        prompt: 'Ein Preis $G$ steigt um $19\\,\\%$. Wie berechnest du den neuen Preis in einem Schritt?',
        correct: '$G \\cdot 1{,}19$',
        wrong: ['$G \\cdot 0{,}19$', '$G + 19$', '$G \\cdot 0{,}81$'],
        hints: ['Der neue Preis ist $100\\,\\% + 19\\,\\%$ des alten.', '$119\\,\\% = 1{,}19$', 'Mit diesem Faktor multiplizieren.'],
        explanation: 'Neuer Preis $= 119\\,\\%$ von $G$ $= G \\cdot 1{,}19$ (Wachstumsfaktor).',
      }),
    ],
  },
  'prozent-satz-grundwert': {
    add: [
      formulaChoice({
        id: 'prz-sg-fc-1',
        subtopicId: 'prozent-satz-grundwert',
        prompt: 'Wie berechnest du den Prozentsatz, wenn $W$ und $G$ bekannt sind?',
        correct: '$p\\,\\% = \\frac{W}{G}$',
        wrong: ['$p\\,\\% = \\frac{G}{W}$', '$p\\,\\% = W \\cdot G$', '$p\\,\\% = G - W$'],
        hints: ['Welcher Anteil vom Ganzen ist der Teil?', 'Teil durch Ganzes.', 'Dann in Prozent umrechnen.'],
        explanation: '$p\\,\\% = \\frac{W}{G}$, z. B. $\\frac{30}{120} = 0{,}25 = 25\\,\\%$.',
      }),
      formulaChoice({
        id: 'prz-sg-fc-2',
        subtopicId: 'prozent-satz-grundwert',
        difficulty: 2,
        prompt: 'Wie berechnest du den Grundwert $G$, wenn $W$ und $p\\,\\%$ bekannt sind?',
        correct: '$G = \\frac{W}{p} \\cdot 100$',
        wrong: ['$G = W \\cdot \\frac{p}{100}$', '$G = \\frac{p}{W} \\cdot 100$', '$G = W + p$'],
        hints: ['Grundgleichung $W = G \\cdot \\frac{p}{100}$ nach $G$ umstellen.', 'Oder Dreisatz: erst $1\\,\\%$, dann $100\\,\\%$.', '$1\\,\\% = \\frac{W}{p}$'],
        explanation: '$G = \\frac{W}{p} \\cdot 100$ (Dreisatz über $1\\,\\%$).',
      }),
      formulaChoice({
        id: 'prz-sg-fc-3',
        subtopicId: 'prozent-satz-grundwert',
        checkpoint: 'concept',
        prompt: 'Welche Größe entspricht immer $100\\,\\%$?',
        correct: 'der Grundwert',
        wrong: ['der Prozentwert', 'der Prozentsatz', 'der größte Wert in der Aufgabe'],
        hints: ['Worauf bezieht sich ein Prozentsatz?', 'Das Ganze.', 'Das Ganze heißt …'],
        explanation: 'Der Grundwert ist das Ganze und entspricht $100\\,\\%$.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
