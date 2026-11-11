import type { AuthoredTopic } from '../../types';
import { withPool } from '../templates';
import { pythagorasBasis } from './basis';
import { applyChecks } from './checks';
import { hypDetailed, legDetailed, withDetailed } from './detailed';
import { POOL } from './pool';

/** Ausführliche Lösungen der handgeschriebenen Rechen- und Sachaufgaben (die Vorlagen bringen ihre eigenen mit, pool.ts). */
const DETAILED = {
  'pyth-hypotenuse-1': hypDetailed(9, 12),
  'pyth-hypotenuse-3': hypDetailed(4, 7),
  'pyth-hypotenuse-4': hypDetailed(8, 15),
  'pyth-kathete-1': legDetailed(13, 5),
  'pyth-kathete-3': legDetailed(9, 5, { known: 'b' }),
  'pyth-kathete-4': [
    ...legDetailed(25, 7),
    { title: 'Umfang berechnen', text: 'Gefragt ist nicht nur $b$, sondern der Umfang: Er ist die Summe aller drei Seiten.', math: 'u = a + b + c = 7 + 24 + 25 = 56' },
  ],
  'pyth-anwendung-1': hypDetailed(36, 48, {
    meaning: 'die Bildschirmdiagonale',
    context: 'Breite und Höhe des Bildschirms stehen senkrecht aufeinander. Die Diagonale verbindet zwei gegenüberliegende Ecken und bildet mit Breite und Höhe ein rechtwinkliges Dreieck: Breite und Höhe sind die Katheten, die Diagonale ist die Hypotenuse.',
  }),
  'pyth-anwendung-2': legDetailed(6.5, 2.5, {
    unit: 'm',
    meaning: 'die Höhe an der Wand',
    context: 'Wand und Boden stehen senkrecht aufeinander. Die Leiter ist die schräge Seite und damit die Hypotenuse. Der Abstand des Fußes zur Wand und die gesuchte Höhe sind die Katheten.',
  }),
  'pyth-anwendung-4': [
    ...legDetailed(50, 30, {
      unit: 'm',
      meaning: 'die Höhe des Drachens über Lisas Hand',
      context:
        'Mach dir eine Skizze: Die straffe Schnur geht schräg von Lisas Hand zum Drachen – sie ist die Hypotenuse. Waagerecht in Handhöhe liegen die $30$ m bis unter den Drachen, senkrecht geht es von dort hoch zum Drachen. Achtung: Dieses Dreieck beginnt nicht am Boden, sondern in Lisas Handhöhe.',
    }),
    { title: 'Handhöhe nicht vergessen', text: 'Die $40$ m werden ab Lisas Hand gemessen. Ihre Hand ist $1{,}5$ m über dem Boden – das kommt noch dazu.', math: 'h = 40 + 1{,}5 = 41{,}5' },
  ],
  'pyth-gemischt-1': hypDetailed(5, 5, {
    meaning: 'die Diagonale',
    context: 'Die Diagonale teilt das Quadrat in zwei rechtwinklige Dreiecke. Die beiden Quadratseiten (je $5$ cm) sind die Katheten, die Diagonale ist die Hypotenuse.',
  }),
  'pyth-gemischt-2': legDetailed(6, 3, {
    meaning: 'die Höhe',
    context:
      'Die Höhe eines gleichseitigen Dreiecks steht senkrecht auf einer Seite und halbiert sie. So entstehen zwei rechtwinklige Dreiecke: Hypotenuse ist eine ganze Seite ($6$ cm), eine Kathete ist die halbe Seite ($3$ cm), die andere Kathete ist die gesuchte Höhe.',
  }),
};

/** Satz des Pythagoras: handgeschriebene Aufgaben (basis.ts), Aufgabenpool (pool.ts), Formel-Check (checks.ts) und ausführliche Lösungen. */
export const pythagoras: AuthoredTopic = { ...pythagorasBasis, subtopics: withDetailed(applyChecks(withPool(pythagorasBasis.subtopics, POOL)), DETAILED) };
