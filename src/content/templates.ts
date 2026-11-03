/**
 * Aufgabenvorlagen: erzeugen beim Build viele konkrete Aufgaben mit gerechneten Antworten und Lösungsschritten.
 * Deterministisch (fester Zufalls-Seed je Vorlage), damit eine ID immer dieselbe Aufgabe bleibt – Versuche verweisen darauf.
 * Eine Vorlage nachträglich zu ändern, ändert alle ihre Aufgaben: Bei inhaltlichen Änderungen besser eine neue Vorlage
 * (neue ID) anlegen und die alte auslaufen lassen.
 */
import { evaluateAnswer } from '../domain/evaluate';
import type { AuthoredExercise, Choice, CommonMistake, Difficulty, ExerciseLevel, ExerciseType, Requirement } from '../types';

export interface Rng {
  /** Ganze Zahl in [min, max]. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** +1 oder −1. */
  sign(): 1 | -1;
  shuffle<T>(items: readonly T[]): T[];
}

/** Kleiner, schneller Zufallsgenerator (mulberry32) mit Seed aus einem String. */
export function createRng(seed: string): Rng {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    sign: () => (next() < 0.5 ? -1 : 1),
    shuffle: (items) => {
      const a = [...items];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
  return rng;
}

/** Was `build` liefert: alles außer den Feldern, die die Vorlage selbst festlegt. */
export type TemplateOutput = Omit<AuthoredExercise, 'id' | 'subtopicId' | 'type' | 'requirement' | 'difficulty' | 'levels' | 'objectives'> &
  Partial<Pick<AuthoredExercise, 'type'>>;

export interface ExerciseTemplate<P> {
  /** Präfix der IDs: `${id}-01`, `${id}-02`, … */
  id: string;
  subtopicId: string;
  count: number;
  type: ExerciseType;
  requirement: Requirement;
  difficulty: Difficulty;
  levels?: ExerciseLevel[];
  objectives: string[];
  /** Parameter einer Variante. Varianten mit gleichem Aufgabentext werden verworfen und neu gezogen. */
  params: (rng: Rng, index: number) => P;
  /** `rng` z. B. zum Mischen der Antwortoptionen. */
  build: (p: P, rng: Rng) => TemplateOutput;
}

/** Erzeugt die Aufgaben einer Vorlage. Wirft, wenn nicht genug verschiedene Varianten zustande kommen. */
export function fromTemplate<P>(t: ExerciseTemplate<P>): AuthoredExercise[] {
  const rng = createRng(t.id);
  const out: AuthoredExercise[] = [];
  // Gleiche Frage mit anderen Antwortoptionen bzw. anderer Abbildung ist eine andere Aufgabe.
  const seen = new Set<string>();
  for (let draw = 0; out.length < t.count; draw++) {
    if (draw > t.count * 50) throw new Error(`Vorlage ${t.id}: nur ${out.length} von ${t.count} verschiedenen Varianten gefunden.`);
    const built = t.build(t.params(rng, out.length), rng);
    const key = exerciseKey(built);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...built,
      commonMistakes: withoutCorrectAnswers(built),
      id: `${t.id}-${String(out.length + 1).padStart(2, '0')}`,
      subtopicId: t.subtopicId,
      type: built.type ?? t.type,
      requirement: t.requirement,
      difficulty: t.difficulty,
      ...(t.levels ? { levels: t.levels } : {}),
      objectives: t.objectives,
    });
  }
  return out;
}

/** Woran zwei Aufgaben als gleich erkannt werden: Text, Antwortoptionen und Abbildung. */
export const exerciseKey = (e: Pick<AuthoredExercise, 'prompt' | 'choices' | 'figure'>) =>
  JSON.stringify([e.prompt, e.choices?.map((c) => c.label).sort(), e.figure]);

/**
 * Typische Fehlantworten, die bei bestimmten Parametern zufällig die richtige Lösung ergeben (z. B. b = 0), werden entfernt –
 * sonst würde eine richtige Eingabe als Fehler erklärt. Ein Fehler ohne verbleibende Antworten bleibt als Erklärung erhalten.
 */
function withoutCorrectAnswers(e: TemplateOutput): CommonMistake[] {
  return e.commonMistakes.map((m) => ({ ...m, answers: m.answers?.filter((a) => evaluateAnswer(e, a).verdict !== 'correct') }));
}

// ---------------------------------------------------------------- Formatierung (deutsch, KaTeX)

/** Rundet auf höchstens `digits` Nachkommastellen und entfernt Rundungsrauschen. */
export const round = (n: number, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

/** Zahl für KaTeX mit Dezimalkomma: 2.5 → „2{,}5“, −3 → „-3“. */
export function num(n: number, digits = 2): string {
  return String(round(n, digits)).replace('.', '{,}');
}

/** Zahl für Fließtext außerhalb von `$…$`: 2.5 → „2,5“. */
export function txt(n: number, digits = 2): string {
  return String(round(n, digits)).replace('.', ',');
}

/** Zahl als Faktor vor einer Variablen: 1 → „“, −1 → „-“, 2 → „2“. */
function coef(n: number): string {
  if (n === 1) return '';
  if (n === -1) return '-';
  return num(n);
}

/** Lineare Funktion als KaTeX-Term: (2, −3) → „2x - 3“, (−1, 0) → „-x“, (0, 4) → „4“. */
export function linearTerm(m: number, b: number, v = 'x'): string {
  if (m === 0) return num(b);
  const head = `${coef(m)}${v}`;
  if (b === 0) return head;
  return b > 0 ? `${head} + ${num(b)}` : `${head} - ${num(-b)}`;
}

/** Summand mit Vorzeichen für Gleichungen: (3, 'y') → „+ 3y“, (−1, 'y') → „- y“. */
export function signedTerm(n: number, v = ''): string {
  const abs = Math.abs(n);
  const body = v ? `${abs === 1 ? '' : num(abs)}${v}` : num(abs);
  return n < 0 ? `- ${body}` : `+ ${body}`;
}

/** Linearer Term ax + by mit sauberen Vorzeichen: (2, −3) → „2x - 3y“. */
export function twoVarTerm(a: number, b: number, x = 'x', y = 'y'): string {
  return `${coef(a)}${x} ${signedTerm(b, y)}`;
}

/** Multiple-Choice: richtige Antwort und Ablenker gemischt, IDs a–d. Ablenker dürfen nicht gleich der Lösung sein. */
export function shuffledChoices(rng: Rng, correct: string, distractors: string[]): { choices: Choice[]; correctId: string } {
  const unique = [...new Set(distractors.filter((d) => d !== correct))];
  const labels = rng.shuffle([correct, ...unique.slice(0, 3)]);
  const ids = ['a', 'b', 'c', 'd'];
  const choices = labels.map((label, i) => ({ id: ids[i], label }));
  return { choices, correctId: ids[labels.indexOf(correct)] };
}

/** Hängt die Vorlagen-Aufgaben eines Themas an die handgeschriebenen Aufgaben der Kapitel an (IDs bleiben). */
export function withPool<S extends { id: string; exercises: AuthoredExercise[] }>(subs: S[], pool: Record<string, AuthoredExercise[]>): S[] {
  return subs.map((s) => ({ ...s, exercises: [...s.exercises, ...(pool[s.id] ?? [])] }));
}
