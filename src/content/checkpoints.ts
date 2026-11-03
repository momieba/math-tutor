/**
 * Formel-Check im Lernpfad (Schritt 3): Hilfen zum Schreiben von Formel- und Begriffsfragen
 * und zum Markieren vorhandener Aufgaben. Die Check-Aufgaben eines Themas stehen je Thema in `checks.ts`.
 */
import type { AuthoredExercise, AuthoredSubtopic, Checkpoint, Difficulty } from '../types';

interface Base {
  id: string;
  subtopicId: string;
  prompt: string;
  hints: [string, string, string];
  /** Kurze Begründung der richtigen Antwort (Musterlösung). */
  explanation: string;
  difficulty?: Difficulty;
  checkpoint?: Checkpoint;
  objectives?: string[];
}

/** Position der richtigen Antwort aus der ID ableiten, damit sie nicht immer „a)“ ist (stabil über Builds). */
function slot(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % 4;
}

/** Multiple Choice „Welche Formel …?“: eine richtige und drei typische falsche Formeln. */
export function formulaChoice(o: Base & { correct: string; wrong: [string, string, string]; mistake?: string }): AuthoredExercise {
  const labels = [...o.wrong];
  labels.splice(slot(o.id), 0, o.correct);
  const ids = ['a', 'b', 'c', 'd'];
  const correctId = ids[labels.indexOf(o.correct)];
  return {
    id: o.id,
    subtopicId: o.subtopicId,
    type: 'multiple-choice',
    requirement: 'knowledge',
    checkpoint: o.checkpoint ?? 'formula',
    difficulty: o.difficulty ?? 1,
    prompt: o.prompt,
    choices: labels.map((label, i) => ({ id: ids[i], label })),
    answer: { kind: 'choice', correct: correctId },
    hints: o.hints,
    solution: { steps: [{ text: o.explanation }], finalAnswer: o.correct },
    objectives: o.objectives ?? ['Formeln kennen'],
    commonMistakes: [{ description: 'Formel verwechselt', feedback: o.mistake ?? 'Schau dir die Formel im Schritt „Erklärung“ noch einmal an.', answers: [ids[(ids.indexOf(correctId) + 1) % 4]] }],
  };
}

/** Formel eintippen. `accepted` wird normalisiert verglichen (Leerzeichen, Malpunkte, ² → ^2, Groß/klein egal). */
export function formulaText(o: Base & { accepted: string[]; finalAnswer: string; wrongAnswers?: string[]; mistake?: string }): AuthoredExercise {
  return {
    id: o.id,
    subtopicId: o.subtopicId,
    type: 'text',
    requirement: 'knowledge',
    checkpoint: o.checkpoint ?? 'formula',
    difficulty: o.difficulty ?? 2,
    prompt: o.prompt,
    answer: { kind: 'text', accepted: o.accepted },
    hints: o.hints,
    solution: { steps: [{ text: o.explanation }], finalAnswer: o.finalAnswer },
    objectives: o.objectives ?? ['Formeln kennen'],
    commonMistakes: [{ description: 'Formel verwechselt', feedback: o.mistake ?? 'Vergleiche mit der Formel aus der Erklärung.', answers: o.wrongAnswers ?? [] }],
  };
}

/**
 * Fügt einem Kapitel seine Check-Aufgaben hinzu und markiert vorhandene Aufgaben als Check.
 * Vorhandene IDs bleiben unverändert (Versuche verweisen darauf).
 */
export function withChecks(sub: AuthoredSubtopic, checks: { mark?: Record<string, Checkpoint>; add?: AuthoredExercise[] }): AuthoredSubtopic {
  const marked = sub.exercises.map((e) => (checks.mark?.[e.id] ? { ...e, checkpoint: checks.mark[e.id] } : e));
  const unknown = Object.keys(checks.mark ?? {}).filter((id) => !sub.exercises.some((e) => e.id === id));
  if (unknown.length) throw new Error(`${sub.id}: unbekannte Aufgaben für den Formel-Check: ${unknown.join(', ')}`);
  return { ...sub, exercises: [...marked, ...(checks.add ?? [])] };
}
