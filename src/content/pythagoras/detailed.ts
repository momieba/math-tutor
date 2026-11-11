/**
 * Ausführliche Lösungen (alle Denkschritte, mit Skizze) für Pythagoras-Aufgaben.
 * Bausteine für Vorlagen und handgeschriebene Aufgaben: Hypotenuse gesucht bzw. Kathete gesucht,
 * optional mit einem Sachzusammenhang („Wo steckt das rechtwinklige Dreieck?“).
 */
import type { DetailedStep, Figure } from '../../types';
import { num, round } from '../templates';

interface Options {
  unit?: string;
  /** Sachaufgabe: Satz, wo das rechtwinklige Dreieck liegt und was die Seiten bedeuten. */
  context?: string;
  /** Wie die gesuchte Seite im Sachzusammenhang heißt („die Diagonale“, „die Höhe“). */
  meaning?: string;
  /** Nachkommastellen beim Runden (Standard 1). */
  digits?: number;
}

/** Zeichenverhältnis der Katheten: nicht zu flach, damit die Skizze lesbar bleibt. */
const ratio = (a: number, b: number): [number, number] => {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const safeLo = Math.max(lo, hi * 0.4);
  return a <= b ? [safeLo, hi] : [hi, safeLo];
};

const isExact = (v: number) => Number.isInteger(round(v, 6));
const roundNote = (digits: number) => ` Die Wurzel geht nicht glatt auf – runde auf ${digits === 1 ? 'eine Nachkommastelle' : `${digits} Nachkommastellen`} und schreibe „≈“.`;

function sketch(alt: string, labels: Extract<Figure, { kind: 'right-triangle' }>['labels'], highlight: 'a' | 'b' | 'c', r: [number, number]): Figure {
  return { kind: 'right-triangle', alt, labels, highlight, ratio: r };
}

function contextStep(o: Options): DetailedStep[] {
  return o.context ? [{ title: 'Wo steckt das rechtwinklige Dreieck?', text: o.context }] : [];
}

/** Hypotenuse c aus den Katheten a und b. */
export function hypDetailed(a: number, b: number, o: Options = {}): DetailedStep[] {
  const unit = o.unit ?? 'cm';
  const s = a * a + b * b;
  const c = Math.sqrt(s);
  const exact = isExact(c);
  const digits = o.digits ?? 1;
  const shown = exact ? num(c) : num(round(c, digits), digits);
  const what = o.meaning ? ` (${o.meaning})` : '';
  return [
    ...contextStep(o),
    {
      title: 'Was ist gegeben, was ist gesucht?',
      text: `Gegeben sind die beiden Katheten $a = ${num(a)}$ ${unit} und $b = ${num(b)}$ ${unit} – das sind die Seiten, die den rechten Winkel bilden. Gesucht ist die Hypotenuse $c$${what}. Sie liegt dem rechten Winkel gegenüber und ist immer die längste Seite.`,
      figure: sketch(`Rechtwinkliges Dreieck mit den Katheten a = ${num(a)} ${unit} und b = ${num(b)} ${unit}; die Hypotenuse c ist gesucht.`, { a: `a = ${num(a)} ${unit}`, b: `b = ${num(b)} ${unit}`, c: 'c = ?' }, 'c', ratio(a, b)),
    },
    {
      title: 'Welche Formel passt?',
      text: 'Beide Katheten sind bekannt, nur die Hypotenuse fehlt. Dafür passt der Satz des Pythagoras in seiner Grundform: Die Quadrate der beiden Katheten ergeben zusammen das Quadrat der Hypotenuse.',
      math: 'a^2 + b^2 = c^2',
    },
    {
      title: 'Werte einsetzen',
      text: 'Setze die Längen ein. Rechne ohne Einheit – sie kommt am Ende wieder dazu.',
      math: `c^2 = ${num(a)}^2 + ${num(b)}^2`,
    },
    {
      title: 'Quadrate ausrechnen',
      text: 'Zuerst quadrieren, dann addieren (Potenz vor Strichrechnung).',
      math: `c^2 = ${num(a * a)} + ${num(b * b)} = ${num(s)}`,
    },
    {
      title: 'Wurzel ziehen',
      text: `Gesucht ist $c$, nicht $c^2$. Das Quadrieren machst du mit der Wurzel rückgängig. Eine Länge ist nie negativ, deshalb zählt nur die positive Wurzel.${exact ? '' : roundNote(digits)}`,
      math: `c = \\sqrt{${num(s)}} ${exact ? '=' : '\\approx'} ${shown}`,
    },
    {
      title: 'Ergebnis prüfen',
      text: `Passt das? Die Hypotenuse muss länger sein als jede Kathete ($${shown} > ${num(Math.max(a, b))}$) und kürzer als beide zusammen ($${shown} < ${num(a + b)}$). Beides stimmt. Ergebnis: $c ${exact ? '=' : '\\approx'} ${shown}$ ${unit}.`,
    },
  ];
}

/**
 * Fehlende Kathete aus der Hypotenuse c und einer bekannten Kathete. Standard: a bekannt, b gesucht;
 * mit `known: 'b'` umgekehrt (z. B. „Gegeben c und b, berechne a“).
 */
export function legDetailed(c: number, known: number, o: Options & { known?: 'a' | 'b' } = {}): DetailedStep[] {
  const unit = o.unit ?? 'cm';
  const K = o.known ?? 'a'; // Name der bekannten Kathete
  const X = K === 'a' ? 'b' : 'a'; // Name der gesuchten Kathete
  const d = c * c - known * known;
  const x = Math.sqrt(d);
  const exact = isExact(x);
  const digits = o.digits ?? 1;
  const shown = exact ? num(x) : num(round(x, digits), digits);
  const what = o.meaning ? ` (${o.meaning})` : '';
  const labels = { c: `c = ${num(c)} ${unit}`, [K]: `${K} = ${num(known)} ${unit}`, [X]: `${X} = ?` };
  const [ra, rb] = K === 'a' ? [known, x] : [x, known];
  return [
    ...contextStep(o),
    {
      title: 'Was ist gegeben, was ist gesucht?',
      text: `Gegeben sind die Hypotenuse $c = ${num(c)}$ ${unit} (die längste Seite, gegenüber dem rechten Winkel) und eine Kathete $${K} = ${num(known)}$ ${unit}. Gesucht ist die zweite Kathete $${X}$${what}.`,
      figure: sketch(`Rechtwinkliges Dreieck mit der Hypotenuse c = ${num(c)} ${unit} und der Kathete ${K} = ${num(known)} ${unit}; die Kathete ${X} ist gesucht.`, labels, X, ratio(ra, rb)),
    },
    {
      title: 'Welche Formel passt?',
      text: `Ausgangspunkt ist wieder der Satz des Pythagoras. Weil diesmal eine Kathete fehlt, stellst du ihn nach $${X}^2$ um: Ziehe auf beiden Seiten $${K}^2$ ab.`,
      math: `a^2 + b^2 = c^2 \\;\\Rightarrow\\; ${X}^2 = c^2 - ${K}^2`,
    },
    {
      title: 'Werte einsetzen',
      text: 'Achte darauf, dass die Hypotenuse vorne steht – sonst wird das Ergebnis negativ.',
      math: `${X}^2 = ${num(c)}^2 - ${num(known)}^2`,
    },
    {
      title: 'Quadrate ausrechnen',
      text: 'Zuerst quadrieren, dann subtrahieren.',
      math: `${X}^2 = ${num(c * c)} - ${num(known * known)} = ${num(d)}`,
    },
    {
      title: 'Wurzel ziehen',
      text: `Gesucht ist $${X}$, nicht $${X}^2$: Wurzel ziehen, nur die positive Lösung zählt.${exact ? '' : roundNote(digits)}`,
      math: `${X} = \\sqrt{${num(d)}} ${exact ? '=' : '\\approx'} ${shown}`,
    },
    {
      title: 'Ergebnis prüfen',
      text: `Eine Kathete ist immer kürzer als die Hypotenuse: $${shown} < ${num(c)}$ stimmt. Probe: $${shown}^2 + ${num(known)}^2 ${exact ? '=' : '\\approx'} ${num(c * c)}$. Ergebnis: $${X} ${exact ? '=' : '\\approx'} ${shown}$ ${unit}.`,
    },
  ];
}

/** Ergänzt handgeschriebene Aufgaben um ihre ausführliche Lösung (IDs bleiben unverändert). */
export function withDetailed<S extends { exercises: { id: string; solution: { detailed?: DetailedStep[] } }[] }>(subs: S[], byId: Record<string, DetailedStep[]>): S[] {
  const unknown = Object.keys(byId).filter((id) => !subs.some((s) => s.exercises.some((e) => e.id === id)));
  if (unknown.length) throw new Error(`Ausführliche Lösung für unbekannte Aufgaben: ${unknown.join(', ')}`);
  return subs.map((s) => ({ ...s, exercises: s.exercises.map((e) => (byId[e.id] ? { ...e, solution: { ...e.solution, detailed: byId[e.id] } } : e)) }));
}
