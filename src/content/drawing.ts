/**
 * Zeichenaufgaben: Graph mit dem Stift in ein vorgegebenes Koordinatensystem auf der Schreibfläche zeichnen.
 * Geprüft wird von der KI-Korrektur (ExpectedAnswer `drawing`); die Musterlösung und die ausführliche Lösung zeigen
 * den richtigen Graphen als Skizze.
 */
import type { Figure } from '../types';
import { linearTerm, num, type TemplateOutput } from './templates';

/** Koordinatensystem auf dem Papier: x von −6 bis 6, y von −5 bis 5 (ein Kästchen = eine Einheit). */
export const DRAW_AXES = { x: [-6, 6] as [number, number], y: [-5, 5] as [number, number] };

const paper = (alt: string): Figure => ({ kind: 'coordinate-plane', alt, x: DRAW_AXES.x, y: DRAW_AXES.y, onPaper: true });

/** Faktor vor x² bzw. vor der Klammer: 1 → „“, −1 → „-“. */
const factor = (a: number) => (a === 1 ? '' : a === -1 ? '-' : num(a));
const shifted = (d: number) => (d === 0 ? 'x^2' : d > 0 ? `(x - ${num(d)})^2` : `(x + ${num(-d)})^2`);
const plus = (e: number) => (e === 0 ? '' : e > 0 ? ` + ${num(e)}` : ` - ${num(-e)}`);
const pt = (x: number, y: number) => `(${num(x)}\\,|\\,${num(y)})`;

/** Gerade y = mx + b zeichnen. `run`/`rise` beschreiben das Steigungsdreieck (m = rise / run). */
export function lineDrawing(m: number, b: number, run: number, rise: number): TemplateOutput {
  const term = linearTerm(m, b);
  const x2 = run;
  const y2 = b + rise;
  const graph: Figure = { kind: 'coordinate-plane', alt: `Gerade y = ${linearTerm(m, b)} durch (0|${b}) und (${x2}|${y2}).`, x: DRAW_AXES.x, y: DRAW_AXES.y, lines: [{ m, b, label: 'f' }], points: [{ x: 0, y: b }, { x: x2, y: y2 }] };
  const dir = rise > 0 ? `$${num(rise)}$ nach oben` : rise < 0 ? `$${num(-rise)}$ nach unten` : 'waagerecht';
  return {
    prompt: `Zeichne den Graphen der Funktion $f(x) = ${term}$ in das Koordinatensystem.`,
    figure: paper(`Leeres Koordinatensystem von x = −6 bis 6 und y = −5 bis 5 zum Einzeichnen des Graphen von f(x) = ${term}.`),
    answer: { kind: 'drawing', expected: `Gerade mit der Steigung ${num(m)} und dem y-Achsenabschnitt ${num(b)}, also durch die Punkte (0|${b}) und (${x2}|${y2}), über das ganze Koordinatensystem gezogen.` },
    hints: [`Der $y$-Achsenabschnitt ist $${num(b)}$: Markiere den Punkt $${pt(0, b)}$.`, `Steigungsdreieck: $${num(run)}$ nach rechts und ${dir}.`, 'Verbinde die beiden Punkte mit dem Lineal (Linie-Werkzeug) und ziehe die Gerade bis zum Rand.'],
    solution: {
      steps: [
        { text: `$y$-Achsenabschnitt $b = ${num(b)}$: Punkt $${pt(0, b)}$ einzeichnen.` },
        { text: `Steigung $m = ${num(m)} = \\frac{${num(rise)}}{${num(run)}}$: von dort $${num(run)}$ nach rechts und ${dir} – das ergibt $${pt(x2, y2)}$.` },
        { text: 'Gerade durch beide Punkte zeichnen.' },
      ],
      finalAnswer: `Gerade durch $${pt(0, b)}$ und $${pt(x2, y2)}$`,
      detailed: [
        { title: 'Was brauche ich zum Zeichnen?', text: `Eine Gerade ist durch zwei Punkte festgelegt. Bei $f(x) = mx + b$ bekommst du sie am schnellsten aus dem $y$-Achsenabschnitt $b$ und der Steigung $m$. Hier ist $m = ${num(m)}$ und $b = ${num(b)}$.` },
        { title: 'Startpunkt auf der y-Achse', text: `Bei $x = 0$ ist $f(0) = ${num(b)}$. Der erste Punkt ist also $${pt(0, b)}$ – er liegt auf der $y$-Achse.` },
        { title: 'Steigungsdreieck', text: `Die Steigung $${num(m)}$ schreibst du als Bruch $\\frac{${num(rise)}}{${num(run)}}$: Gehe vom Startpunkt $${num(run)}$ Kästchen nach rechts und dann ${dir}. So kommst du zu $${pt(x2, y2)}$.`, math: `f(${num(x2)}) = ${num(m)} \\cdot ${num(x2)}${plus(b)} = ${num(y2)}` },
        { title: 'Gerade ziehen und prüfen', text: 'Verbinde die beiden Punkte mit dem Linie-Werkzeug und verlängere die Gerade bis zum Rand. Probe: Ein dritter Punkt (z. B. noch ein Steigungsdreieck weiter) muss auch auf der Geraden liegen.', figure: graph },
      ],
    },
    commonMistakes: [
      { description: 'Steigung in die falsche Richtung', feedback: 'Bei negativer Steigung geht es nach rechts gesehen nach unten.' },
      { description: 'Achsenabschnitt auf der x-Achse', feedback: 'Der Achsenabschnitt $b$ liegt auf der $y$-Achse, also bei $x = 0$.' },
    ],
  };
}

/** Parabel f(x) = a(x − d)² + e zeichnen (Wertetabelle bzw. Schablone von der Normalparabel). */
export function parabolaDrawing(a: number, d: number, e: number): TemplateOutput {
  const term = `${factor(a)}${shifted(d)}${plus(e)}`;
  const xs = [d - 2, d - 1, d, d + 1, d + 2];
  const rows = xs.map((x) => ({ x, y: a * (x - d) ** 2 + e }));
  const graph: Figure = { kind: 'coordinate-plane', alt: `Parabel f(x) = ${term} mit dem Scheitelpunkt (${d}|${e}).`, x: DRAW_AXES.x, y: DRAW_AXES.y, parabolas: [{ a, d, e, label: 'f' }], points: rows.map((r) => ({ x: r.x, y: r.y })).filter((p) => p.y >= DRAW_AXES.y[0] && p.y <= DRAW_AXES.y[1]) };
  const table = `\\begin{array}{c|ccccc} x & ${xs.map(num).join(' & ')} \\\\ \\hline f(x) & ${rows.map((r) => num(r.y)).join(' & ')} \\end{array}`;
  const shape = a > 0 ? 'nach oben geöffnet' : 'nach unten geöffnet';
  const width = Math.abs(a) === 1 ? 'so breit wie die Normalparabel' : Math.abs(a) > 1 ? 'schmaler als die Normalparabel' : 'breiter als die Normalparabel';
  return {
    prompt: `Zeichne den Graphen von $f(x) = ${term}$ in das Koordinatensystem.`,
    figure: paper(`Leeres Koordinatensystem von x = −6 bis 6 und y = −5 bis 5 zum Einzeichnen der Parabel f(x) = ${term}.`),
    answer: { kind: 'drawing', expected: `Parabel mit dem Scheitelpunkt (${d}|${e}), ${shape}, ${width}; sie geht durch ${rows.map((r) => `(${r.x}|${r.y})`).join(', ')}. Glatt gekrümmt gezeichnet, nicht als Zickzack.` },
    hints: [`Der Scheitelpunkt ist $${pt(d, e)}$.`, `Lege eine Wertetabelle an, z. B. für $x = ${xs.map(num).join(';\\ ')}$.`, 'Verbinde die Punkte mit einer glatten Kurve – keine geraden Stücke.'],
    solution: {
      steps: [
        { text: `Scheitelpunkt ablesen: $${pt(d, e)}$; die Parabel ist ${shape}.` },
        { text: 'Wertetabelle:', math: table },
        { text: 'Punkte eintragen und mit einer glatten Kurve verbinden.' },
      ],
      finalAnswer: `Parabel mit Scheitel $${pt(d, e)}$, ${shape}`,
      detailed: [
        { title: 'Was verrät die Gleichung?', text: `$f(x) = ${term}$ ist in Scheitelpunktform $a(x - d)^2 + e$ mit $a = ${num(a)}$, $d = ${num(d)}$ und $e = ${num(e)}$. Der Scheitelpunkt ist also $${pt(d, e)}$, die Parabel ist ${shape} und ${width}.` },
        { title: 'Wertetabelle rund um den Scheitel', text: 'Nimm $x$-Werte links und rechts vom Scheitel. Wegen der Symmetrie reichen zwei Werte auf jeder Seite – rechts kommen dieselben $y$-Werte heraus wie links.', math: table },
        { title: 'Punkte eintragen und verbinden', text: 'Trage die Punkte ein und verbinde sie mit einer glatten, runden Kurve (im Scheitel keine Spitze!). Zeichne bis zum Rand des Koordinatensystems weiter.', figure: graph },
        { title: 'Prüfen', text: `Liegt der tiefste bzw. höchste Punkt bei $${pt(d, e)}$? Ist die Kurve symmetrisch zur senkrechten Linie $x = ${num(d)}$? Dann passt die Zeichnung.` },
      ],
    },
    commonMistakes: [
      { description: 'Verschiebung in die falsche Richtung', feedback: '$(x - 2)^2$ verschiebt nach rechts, $(x + 2)^2$ nach links.' },
      { description: 'Punkte mit geraden Linien verbunden', feedback: 'Eine Parabel ist gekrümmt – verbinde die Punkte mit einer glatten Kurve.' },
    ],
  };
}
