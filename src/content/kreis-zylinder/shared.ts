import type { CommonMistake, Figure } from '../../types';
import { num, round, txt } from '../templates';

export const TOPIC_ID = 'kreis-zylinder';

/**
 * Toleranz für Ergebnisse mit π: mindestens die Rundungsgenauigkeit, relativ 0,1 %.
 * So zählen Rechnungen mit der π-Taste, mit 3,14 und exakte Eingaben wie „25π“.
 */
export const piTol = (value: number, digits = 1) => Math.max(0.6 * 10 ** -digits, Math.abs(value) * 0.001);

/** „≈ 78,5“ für die Anzeige (KaTeX). */
export const approx = (value: number, digits = 1) => `\\approx ${num(round(value, digits), digits)}`;

/** Gerundeter Wert als Eingabe-Text („78,5“). */
export const rounded = (value: number, digits = 1) => txt(round(value, digits), digits);

export const ROUND1 = 'Runde auf eine Nachkommastelle.';
export const ROUND2 = 'Runde auf zwei Nachkommastellen.';

export const RADIUS_DIAMETER_MISTAKE = (wrongValue: number): CommonMistake => ({
  description: 'Radius und Durchmesser verwechselt',
  feedback: 'Der Radius ist der halbe Durchmesser: $r = \\frac{d}{2}$.',
  answers: [rounded(wrongValue)],
});

export const circleFigure = (alt: string, labels: { r?: string; angle?: string; inner?: string }, angle?: number, inner?: number): Figure => ({
  kind: 'circle',
  alt,
  labels,
  ...(angle !== undefined ? { angle } : {}),
  ...(inner !== undefined ? { inner } : {}),
});
