/**
 * Schweregrad einer Aufgabe für Bundesland und Schulart des Lernenden.
 * Grundwert ist `Exercise.difficulty` (NRW-Gymnasium); `levels` enthält nur Abweichungen.
 */
import type { Difficulty, Exercise, Topic } from '../types';

export interface LearnerContext {
  /** Bundesland-Kürzel, z. B. 'NW'. */
  state: string;
  /** z. B. 'gymnasium', 'realschule', 'gesamtschule'. */
  schoolType: string;
}

/** Bis es eine Auswahl in Registrierung/Konto gibt, gelten alle Inhalte für NRW-Gymnasium. */
export const DEFAULT_LEARNER_CONTEXT: LearnerContext = { state: 'NW', schoolType: 'gymnasium' };

/**
 * Ein Eintrag mit passendem Land und passender Schulart schlägt einen Eintrag nur für die Schulart.
 * `null` ⇒ die Aufgabe wird in diesem Kontext nicht angeboten.
 */
export function resolveDifficulty(e: Pick<Exercise, 'difficulty' | 'levels'>, ctx: LearnerContext): Difficulty | null {
  const forSchool = (e.levels ?? []).filter((l) => l.schoolType === ctx.schoolType);
  const exact = forSchool.find((l) => l.state === ctx.state);
  const general = forSchool.find((l) => l.state === undefined);
  const level = exact ?? general;
  return level ? level.difficulty : e.difficulty;
}

/** Katalog für einen Kontext: Schweregrade ersetzt, nicht angebotene Aufgaben entfernt. */
export function topicsForContext(topics: Topic[], ctx: LearnerContext): Topic[] {
  return topics.map((t) => ({
    ...t,
    subtopics: t.subtopics.map((s) => ({
      ...s,
      exercises: s.exercises.flatMap((e) => {
        const difficulty = resolveDifficulty(e, ctx);
        return difficulty === null ? [] : [{ ...e, difficulty }];
      }),
    })),
  }));
}
