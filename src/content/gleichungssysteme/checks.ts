/** Formel-Check (Lernpfad Schritt 3) für Lineare Gleichungssysteme. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'lgs-gleichungen': {
    mark: { 'lgs-gl-1': 'concept' },
    add: [
      formulaChoice({
        id: 'lgs-gl-fc-1',
        subtopicId: 'lgs-gleichungen',
        prompt: 'Welche Form hat eine lineare Gleichung mit zwei Variablen?',
        correct: '$ax + by = c$',
        wrong: ['$ax^2 + by = c$', '$a \\cdot x \\cdot y = c$', '$y = ax^2$'],
        hints: ['„Linear“: keine Quadrate, kein Produkt $x \\cdot y$.', 'Beide Variablen kommen einfach vor.', 'Je eine Zahl vor $x$ und vor $y$.'],
        explanation: 'Lineare Gleichung mit zwei Variablen: $ax + by = c$.',
      }),
      formulaChoice({
        id: 'lgs-gl-fc-2',
        subtopicId: 'lgs-gleichungen',
        difficulty: 2,
        prompt: 'Wie sieht $ax + by = c$ nach $y$ umgestellt aus ($b \\neq 0$)?',
        correct: '$y = -\\frac{a}{b}x + \\frac{c}{b}$',
        wrong: ['$y = \\frac{a}{b}x + \\frac{c}{b}$', '$y = -\\frac{b}{a}x + c$', '$y = c - ax$'],
        hints: ['Bringe $ax$ auf die rechte Seite.', '$by = -ax + c$', 'Teile jeden Summanden durch $b$.'],
        explanation: '$by = -ax + c$, durch $b$ teilen: $y = -\\frac{a}{b}x + \\frac{c}{b}$.',
        mistake: 'Beim Herüberbringen von $ax$ wechselt das Vorzeichen.',
      }),
    ],
  },
  'lgs-grafisch': { mark: { 'lgs-gr-1': 'concept', 'lgs-gr-2': 'concept', 'lgs-gr-3': 'concept' } },
  'lgs-einsetzen': {
    mark: { 'lgs-es-1': 'concept', 'lgs-es-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lgs-es-fc-1',
        subtopicId: 'lgs-einsetzen',
        prompt: 'Im System $\\text{I: } y = 2x + 1$, $\\text{II: } 3x + y = 11$ setzt du I in II ein. Welche Gleichung entsteht?',
        correct: '$3x + (2x + 1) = 11$',
        wrong: ['$3x + 2x = 11$', '$3(2x + 1) + y = 11$', '$2x + 1 = 11$'],
        hints: ['Ersetze in II das $y$ durch den Term aus I.', 'Der Term kommt in Klammern.', '$x$ bleibt stehen.'],
        explanation: 'In II wird $y$ durch $(2x + 1)$ ersetzt: $3x + (2x + 1) = 11$.',
      }),
    ],
  },
  'lgs-gleichsetzen': {
    mark: { 'lgs-gs-1': 'concept', 'lgs-gs-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lgs-gs-fc-1',
        subtopicId: 'lgs-gleichsetzen',
        prompt: 'Welcher Ansatz gehört zum Gleichsetzungsverfahren für $\\text{I: } y = m_1x + n_1$ und $\\text{II: } y = m_2x + n_2$?',
        correct: '$m_1x + n_1 = m_2x + n_2$',
        wrong: ['$m_1x + n_1 + m_2x + n_2 = 0$', '$m_1x + n_1 = 0$', '$m_1 = m_2$'],
        hints: ['Beide Gleichungen beginnen mit $y = $.', 'Die rechten Seiten müssen gleich sein.', 'Term gleich Term.'],
        explanation: 'Beide Terme stehen für dasselbe $y$, also: $m_1x + n_1 = m_2x + n_2$.',
      }),
    ],
  },
  'lgs-addition': {
    mark: { 'lgs-ad-1': 'concept', 'lgs-ad-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lgs-ad-fc-1',
        subtopicId: 'lgs-addition',
        prompt: 'Welche Gleichung entsteht, wenn man $\\text{I: } 2x + 3y = 12$ und $\\text{II: } 4x - 3y = 6$ addiert?',
        correct: '$6x = 18$',
        wrong: ['$6x + 6y = 18$', '$-2x = 6$', '$6x = 6$'],
        hints: ['Addiere die $x$-Terme, die $y$-Terme und die rechten Seiten jeweils für sich.', '$3y + (-3y) = 0$', '$12 + 6 = 18$'],
        explanation: '$2x + 4x = 6x$, $3y - 3y = 0$, $12 + 6 = 18$: $6x = 18$.',
      }),
    ],
  },
  'lgs-sonderfaelle': { mark: { 'lgs-sf-1': 'concept', 'lgs-sf-2': 'concept', 'lgs-sf-3': 'concept' } },
  'lgs-sachaufgaben': {
    mark: { 'lgs-sa-1': 'concept', 'lgs-sa-2': 'concept' },
    add: [
      formulaChoice({
        id: 'lgs-sa-fc-1',
        subtopicId: 'lgs-sachaufgaben',
        checkpoint: 'concept',
        prompt: 'Wie viele Gleichungen brauchst du, um zwei Unbekannte (z. B. zwei Preise) eindeutig zu bestimmen?',
        correct: 'zwei (aus zwei verschiedenen Informationen)',
        wrong: ['eine', 'drei', 'so viele wie Zahlen im Text vorkommen'],
        hints: ['Eine Gleichung mit zwei Variablen hat unendlich viele Lösungen.', 'Jede Information liefert eine Gleichung.', 'Zwei Unbekannte – zwei Gleichungen.'],
        explanation: 'Für zwei Unbekannte braucht man zwei (voneinander unabhängige) Gleichungen.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
