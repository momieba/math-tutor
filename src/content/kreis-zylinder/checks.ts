/** Formel-Check (Lernpfad Schritt 3) für Kreis und Zylinder: die Kernformeln stehen im Mittelpunkt. */
import type { AuthoredSubtopic } from '../../types';
import { formulaChoice, formulaText, withChecks } from '../checkpoints';

const CHECKS: Record<string, Parameters<typeof withChecks>[1]> = {
  'kz-umfang': {
    mark: { 'kz-um-1': 'concept', 'kz-um-2': 'formula' },
    add: [
      formulaText({
        id: 'kz-um-fc-1',
        subtopicId: 'kz-umfang',
        prompt: 'Schreibe die Formel für den Umfang $u$ eines Kreises mit dem Radius $r$ auf. (π kannst du auch als „pi“ schreiben.)',
        accepted: ['u=2πr', 'u=2rπ', 'u=π2r', 'u=2pir', 'u=2rpi', 'u=pi2r', 'u=2*π*r', 'u=πd', 'u=dπ', 'u=pid', 'u=dpi'],
        finalAnswer: '$u = 2\\pi r$ (oder $u = \\pi d$)',
        hints: ['Der Umfang ist etwas mehr als dreimal der Durchmesser.', 'Der Durchmesser ist $2r$.', '$u = \\pi \\cdot d$'],
        explanation: '$u = \\pi \\cdot d = 2\\pi r$.',
        wrongAnswers: ['u=πr^2', 'u=pir^2', 'u=πr'],
        mistake: '$\\pi r^2$ ist der Flächeninhalt. Der Umfang ist $2\\pi r$.',
      }),
    ],
  },
  'kz-flaeche': {
    mark: { 'kz-fl-1': 'formula' },
    add: [
      formulaText({
        id: 'kz-fl-fc-1',
        subtopicId: 'kz-flaeche',
        prompt: 'Schreibe die Formel für den Flächeninhalt $A$ eines Kreises mit dem Radius $r$ auf. (π kannst du auch als „pi“ schreiben.)',
        accepted: ['a=πr^2', 'a=r^2π', 'a=pir^2', 'a=r^2pi', 'a=π*r^2', 'a=πrr', 'a=pirr'],
        finalAnswer: '$A = \\pi r^2$',
        hints: ['Eine Fläche – also kommt eine Länge im Quadrat vor.', 'Nur $r$ wird quadriert.', '$A = \\pi \\cdot r \\cdot r$'],
        explanation: '$A = \\pi r^2$.',
        wrongAnswers: ['a=2πr', 'a=2pir', 'a=πd'],
        mistake: '$2\\pi r$ ist der Umfang. Der Flächeninhalt ist $\\pi r^2$.',
      }),
      formulaChoice({
        id: 'kz-fl-fc-2',
        subtopicId: 'kz-flaeche',
        difficulty: 2,
        prompt: 'Der Flächeninhalt $A$ eines Kreises ist gegeben. Wie berechnest du den Radius?',
        correct: '$r = \\sqrt{\\frac{A}{\\pi}}$',
        wrong: ['$r = \\frac{A}{\\pi}$', '$r = \\frac{A}{2\\pi}$', '$r = \\sqrt{A \\cdot \\pi}$'],
        hints: ['$A = \\pi r^2$ nach $r$ umstellen.', 'Erst durch $\\pi$ teilen.', 'Dann die Wurzel ziehen.'],
        explanation: '$r^2 = \\frac{A}{\\pi}$, also $r = \\sqrt{\\frac{A}{\\pi}}$.',
      }),
    ],
  },
  'kz-ausschnitt': {
    mark: { 'kz-as-1': 'concept' },
    add: [
      formulaChoice({
        id: 'kz-as-fc-1',
        subtopicId: 'kz-ausschnitt',
        prompt: 'Welche Formel liefert die Länge des Kreisbogens zum Mittelpunktswinkel $\\alpha$?',
        correct: '$b = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$',
        wrong: ['$b = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$', '$b = \\frac{360^\\circ}{\\alpha} \\cdot 2\\pi r$', '$b = \\alpha \\cdot 2\\pi r$'],
        hints: ['Der Bogen ist ein Teil des Umfangs.', 'Welcher Anteil? $\\frac{\\alpha}{360^\\circ}$', 'Umfang: $2\\pi r$'],
        explanation: 'Anteil $\\frac{\\alpha}{360^\\circ}$ vom Umfang $2\\pi r$.',
      }),
      formulaChoice({
        id: 'kz-as-fc-2',
        subtopicId: 'kz-ausschnitt',
        prompt: 'Welche Formel liefert den Flächeninhalt eines Kreisausschnitts?',
        correct: '$A_S = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$',
        wrong: ['$A_S = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$', '$A_S = \\frac{\\alpha}{100} \\cdot \\pi r^2$', '$A_S = \\alpha \\cdot \\pi r^2$'],
        hints: ['Der Ausschnitt ist ein Teil der Kreisfläche.', 'Anteil: $\\frac{\\alpha}{360^\\circ}$', 'Kreisfläche: $\\pi r^2$'],
        explanation: 'Anteil $\\frac{\\alpha}{360^\\circ}$ von der Kreisfläche $\\pi r^2$.',
      }),
    ],
  },
  'kz-ring': {
    mark: { 'kz-ri-1': 'formula' },
    add: [
      // Auswahl statt Eintippen: Die Text-Normalisierung unterscheidet R und r nicht.
      formulaChoice({
        id: 'kz-ri-fc-1',
        subtopicId: 'kz-ring',
        prompt: 'Welche Rechnung liefert die Fläche eines Kreisrings mit $R = 5$ cm und $r = 3$ cm?',
        correct: '$\\pi \\cdot (5^2 - 3^2)$',
        wrong: ['$\\pi \\cdot (5 - 3)^2$', '$\\pi \\cdot (5^2 + 3^2)$', '$2\\pi \\cdot (5 - 3)$'],
        hints: ['Großer Kreis minus kleiner Kreis.', '$\\pi R^2 - \\pi r^2 = \\pi (R^2 - r^2)$', 'Erst quadrieren, dann subtrahieren.'],
        explanation: '$A = \\pi (R^2 - r^2) = \\pi (25 - 9) = 16\\pi$.',
        mistake: 'Erst quadrieren, dann subtrahieren: $\\pi (R^2 - r^2)$, nicht $\\pi (R - r)^2$.',
      }),
      formulaChoice({
        id: 'kz-ri-fc-2',
        subtopicId: 'kz-ring',
        checkpoint: 'concept',
        prompt: 'Ein Kreisring hat den Außenradius $R$ und die Breite $w$. Wie groß ist der Innenradius?',
        correct: '$r = R - w$',
        wrong: ['$r = R + w$', '$r = w$', '$r = \\frac{R}{w}$'],
        hints: ['Die Breite ist der Abstand zwischen den beiden Kreisen.', 'Innen ist kleiner als außen.', 'Ziehe die Breite ab.'],
        explanation: 'Der innere Kreis ist um die Breite kleiner: $r = R - w$.',
      }),
    ],
  },
  'kz-prisma': {
    mark: { 'kz-pr-1': 'concept' },
    add: [
      formulaChoice({
        id: 'kz-pr-fc-1',
        subtopicId: 'kz-prisma',
        prompt: 'Wie berechnet man das Volumen eines Prismas?',
        correct: '$V = G \\cdot h$',
        wrong: ['$V = 2G + M$', '$V = \\frac{1}{3} G \\cdot h$', '$V = G + h$'],
        hints: ['Die Grundfläche wird gleichmäßig „nach oben geschoben“.', 'Grundfläche mal …', '… Höhe.'],
        explanation: 'Volumen = Grundfläche mal Höhe: $V = G \\cdot h$. ($\\frac{1}{3} G h$ gilt für Pyramiden.)',
      }),
      formulaChoice({
        id: 'kz-pr-fc-2',
        subtopicId: 'kz-prisma',
        prompt: 'Wie berechnet man die Oberfläche eines Prismas?',
        correct: '$O = 2G + M$',
        wrong: ['$O = G + M$', '$O = G \\cdot h$', '$O = 2G \\cdot M$'],
        hints: ['Ein Prisma hat zwei Grundflächen.', 'Dazu kommen die Seitenflächen (Mantel).', 'Alles addieren.'],
        explanation: 'Zwei Grundflächen plus Mantel: $O = 2G + M$ mit $M = u_G \\cdot h$.',
      }),
    ],
  },
  'kz-zylinder': {
    mark: { 'kz-zy-1': 'concept', 'kz-zy-4': 'formula' },
    add: [
      formulaChoice({
        id: 'kz-zy-fc-1',
        subtopicId: 'kz-zylinder',
        prompt: 'Welche Formel gilt für die Mantelfläche eines Zylinders?',
        correct: '$M = 2\\pi r h$',
        wrong: ['$M = \\pi r^2 h$', '$M = 2\\pi r^2$', '$M = \\pi r h$'],
        hints: ['Der Mantel ist abgerollt ein Rechteck.', 'Seitenlängen: Umfang $2\\pi r$ und Höhe $h$.', 'Rechteck: Länge mal Breite.'],
        explanation: '$M = 2\\pi r \\cdot h$ (Umfang mal Höhe).',
      }),
    ],
  },
  'kz-zusammengesetzt': {
    mark: { 'kz-zg-1': 'concept' },
    add: [
      formulaChoice({
        id: 'kz-zg-fc-1',
        subtopicId: 'kz-zusammengesetzt',
        prompt: 'Welche Formel liefert das Volumen eines Rohrs (Hohlzylinder) mit Außenradius $R$, Innenradius $r$ und Länge $h$?',
        correct: '$V = \\pi (R^2 - r^2) h$',
        wrong: ['$V = \\pi (R - r)^2 h$', '$V = \\pi R^2 h + \\pi r^2 h$', '$V = 2\\pi (R - r) h$'],
        hints: ['Großer Zylinder minus kleiner Zylinder.', '$\\pi R^2 h - \\pi r^2 h$', 'Ausklammern.'],
        explanation: '$V = \\pi R^2 h - \\pi r^2 h = \\pi (R^2 - r^2) h$.',
      }),
      formulaChoice({
        id: 'kz-zg-fc-2',
        subtopicId: 'kz-zusammengesetzt',
        prompt: 'Wie berechnet man die Masse $m$ eines Körpers aus Volumen $V$ und Dichte $\\rho$?',
        correct: '$m = V \\cdot \\rho$',
        wrong: ['$m = \\frac{V}{\\rho}$', '$m = \\frac{\\rho}{V}$', '$m = V + \\rho$'],
        hints: ['Dichte = Masse pro Volumen.', '$\\rho = \\frac{m}{V}$', 'Nach $m$ umstellen.'],
        explanation: 'Aus $\\rho = \\frac{m}{V}$ folgt $m = V \\cdot \\rho$.',
      }),
    ],
  },
};

/** Ergänzt die Kapitel um ihren Formel-Check. */
export const applyChecks = (subs: AuthoredSubtopic[]) => subs.map((s) => (CHECKS[s.id] ? withChecks(s, CHECKS[s.id]) : s));
