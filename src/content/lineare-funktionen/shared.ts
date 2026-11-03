import type { CommonMistake, Figure } from '../../types';
import { linearTerm, num } from '../templates';

export const TOPIC_ID = 'lineare-funktionen';

/** „f(x) = 2x - 3“ als KaTeX. */
export const fx = (m: number, b: number, name = 'f') => `${name}(x) = ${linearTerm(m, b)}`;

/** „y = 2x - 3“ als KaTeX. */
export const yx = (m: number, b: number) => `y = ${linearTerm(m, b)}`;

/** Einsetzen als KaTeX-Rechnung: f(4) = 2·4 - 3 = 5 (negative Zahlen in Klammern). */
export function substitution(m: number, b: number, x: number, name = 'f'): string {
  const xs = x < 0 ? `(${num(x)})` : num(x);
  const mPart = m === 1 ? xs : m === -1 ? `-${xs}` : `${num(m)} \\cdot ${xs}`;
  const bPart = b === 0 ? '' : b > 0 ? ` + ${num(b)}` : ` - ${num(-b)}`;
  return `${name}(${num(x)}) = ${mPart}${bPart} = ${num(m * x + b)}`;
}

export const SIGN_MISTAKE: CommonMistake = {
  description: 'Vorzeichenfehler beim Einsetzen',
  feedback: 'Achte beim Einsetzen negativer Zahlen auf Klammern: $-2 \\cdot (-3) = +6$.',
};

/** Steigung aus zwei Punkten als KaTeX-Bruch. */
export const slopeFraction = (x1: number, y1: number, x2: number, y2: number) =>
  `m = \\frac{${num(y2)} - ${y1 < 0 ? `(${num(y1)})` : num(y1)}}{${num(x2)} - ${x1 < 0 ? `(${num(x1)})` : num(x1)}} = \\frac{${num(y2 - y1)}}{${num(x2 - x1)}} = ${num((y2 - y1) / (x2 - x1))}`;

/** Koordinatensystem-Abbildung (Standardausschnitt −5 … 5). */
export function plane(alt: string, lines: { m: number; b: number; label?: string }[], points: { x: number; y: number; label?: string }[] = [], size = 5): Figure {
  return { kind: 'coordinate-plane', alt, x: [-size, size], y: [-size, size], lines, points };
}

/** Steigungen, die man im Raster gut ablesen kann (Zähler/Nenner klein). */
export const READABLE_SLOPES: [number, number][] = [
  [1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [-1, 3], [2, 3], [-2, 3],
];
