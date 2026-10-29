import { services } from '../services';
import type { AttemptRecord, Exercise, Subtopic } from '../types';

export interface AttemptContext {
  exercise: Exercise | null;
  subtopic: Subtopic | null;
  /** 1-basiert innerhalb des Kapitels, 0 wenn unbekannt (z. B. Aufgabe aus der Bibliothek entfernt). */
  exerciseNumber: number;
  label: string;
}

/** Löst Inhalte zu Versuchen auf (Kapitel, Aufgabennummer), damit Listen lesbar sind statt technischer IDs. */
export async function resolveAttemptContexts(attempts: AttemptRecord[]): Promise<Map<string, AttemptContext>> {
  const entries = await Promise.all(
    attempts.map(async (a) => {
      const [exercise, subtopic] = await Promise.all([services.content.getExercise(a.exerciseId), services.content.getSubtopic(a.subtopicId)]);
      const exerciseNumber = subtopic ? subtopic.exercises.findIndex((e) => e.id === a.exerciseId) + 1 : 0;
      const label = subtopic ? `${subtopic.title} · Aufgabe ${exerciseNumber || '?'}` : a.exerciseId;
      return [a.id, { exercise, subtopic, exerciseNumber, label }] as const;
    }),
  );
  return new Map(entries);
}
