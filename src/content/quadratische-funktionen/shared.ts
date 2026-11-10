import type { Rng } from '../templates';
import { num, shuffledChoices } from '../templates';

export const TOPIC_ID = 'quadratische-funktionen';

/** Faktor vor einem Term: 1 → „“, −1 → „-“, sonst die Zahl. */
const factor = (a: number) => (a === 1 ? '' : a === -1 ? '-' : num(a));

/** „(x - 2)^2“, „(x + 3)^2“ bzw. „x^2“ als KaTeX. */
export const shiftedSquare = (d: number) => (d === 0 ? 'x^2' : d > 0 ? `(x - ${num(d)})^2` : `(x + ${num(-d)})^2`);

/** Summand mit Vorzeichen: 3 → „ + 3“, −2 → „ - 2“, 0 → „“. */
export const plus = (n: number) => (n === 0 ? '' : n > 0 ? ` + ${num(n)}` : ` - ${num(-n)}`);

/** Scheitelpunktform a(x − d)² + e als KaTeX-Term. */
export const vertexTerm = (a: number, d: number, e: number) => `${factor(a)}${shiftedSquare(d)}${plus(e)}`;

/** Allgemeine Form ax² + bx + c als KaTeX-Term (Summanden mit 0 entfallen). */
export function generalTerm(a: number, b: number, c: number, v = 'x'): string {
  const head = `${factor(a)}${v}^2`;
  const bx = b === 0 ? '' : b === 1 ? ` + ${v}` : b === -1 ? ` - ${v}` : b > 0 ? ` + ${num(b)}${v}` : ` - ${num(-b)}${v}`;
  return `${head}${bx}${plus(c)}`;
}

/** „f(x) = …“ */
export const fx = (term: string, name = 'f') => `${name}(x) = ${term}`;

/** Punkt als KaTeX: S(2 | -3). */
export const pt = (x: number, y: number, name = 'S') => `${name}(${num(x)}\\,|\\,${num(y)})`;

/** Punkt als Eingabe für Fehlantworten: „(2|-3)“. */
export const ptInput = (x: number, y: number) => `(${String(x).replace('.', ',')}|${String(y).replace('.', ',')})`;

/** Negative Zahl beim Einsetzen in Klammern: −3 → „(-3)“. */
export const paren = (n: number) => (n < 0 ? `(${num(n)})` : num(n));

/** Multiple Choice aus Labels: liefert Optionen, richtige ID und die IDs der Ablenker in Eingabereihenfolge. */
export function mc(rng: Rng, correct: string, distractors: string[]) {
  const { choices, correctId } = shuffledChoices(rng, correct, distractors);
  const idOf = (label: string) => choices.find((c) => c.label === label)?.id;
  return { choices, answer: { kind: 'choice' as const, correct: correctId }, idOf };
}

/** Öffnung und Form einer Parabel y = a·x² in Worten. */
export function shapeOf(a: number): string {
  const dir = a > 0 ? 'nach oben geöffnet' : 'nach unten geöffnet';
  const abs = Math.abs(a);
  const form = abs === 1 ? 'kongruent zur Normalparabel' : abs > 1 ? 'gestreckt (schmaler als die Normalparabel)' : 'gestaucht (breiter als die Normalparabel)';
  return `${dir}, ${form}`;
}
