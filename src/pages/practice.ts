import { nextExercise } from '../domain/exerciseSelection';
import { pathState } from '../domain/learningPath';
import { readSeen } from './pathStorage';
import type { Attempt, Difficulty, Exercise, Subtopic } from '../types';

/** Reihenfolge bei Gleichstand: je Nutzer und Tag anders, innerhalb eines Tages stabil (kein Springen beim Neuladen). */
export const practiceSeed = (userId: string, now = new Date()) => `${userId}:${now.toISOString().slice(0, 10)}`;

/** Nächste Aufgabe im Kapitel für die Übungsfolge „Nächste Aufgabe“ (domain/exerciseSelection.ts). */
export function pickNext(userId: string, chapter: Subtopic, attempts: Attempt[], excludeId?: string): { exercise: Exercise; level: Difficulty } | null {
  const now = new Date();
  return nextExercise(chapter.exercises, attempts, { now, seed: practiceSeed(userId, now), excludeId });
}

/** Lernpfad eines Kapitels für die Oberfläche (Schritt + nächste Aufgabe), siehe domain/learningPath.ts. */
export function pathFor(userId: string, chapter: Subtopic, attempts: Attempt[], score: number, excludeId?: string) {
  const now = new Date();
  return pathState(chapter.exercises, attempts, { score, seen: readSeen(userId, chapter.id), now, seed: practiceSeed(userId, now), excludeId });
}
