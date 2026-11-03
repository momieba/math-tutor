/**
 * Geführter Lernpfad: jedes Kapitel nach demselben Schema (ARCHITECTURE.md, „Lernpfad“).
 * 1. Einstieg (Lernziel, Video) · 2. Erklärung (Regeln, Beispiel) · 3. Formel-Check · 4. Erste Übungen · 5. Üben (adaptiv) · 6. Geschafft.
 * Der Schritt wird aus den Versuchen abgeleitet; „Einstieg/Erklärung gesehen“ kommt von außen (Browser-Speicher).
 */
import type { Attempt, Exercise } from '../types';
import { nextExercise, type SelectionOptions } from './exerciseSelection';
import { attemptCredit, SCORE_CONFIG } from './score';

export type PathStep = 'intro' | 'explain' | 'check' | 'starter' | 'practice' | 'done';

export const PATH_STEPS: PathStep[] = ['intro', 'explain', 'check', 'starter', 'practice', 'done'];

export const PATH_STEP_LABEL: Record<PathStep, string> = {
  intro: 'Einstieg',
  explain: 'Erklärung',
  check: 'Formel-Check',
  starter: 'Erste Übungen',
  practice: 'Üben',
  done: 'Geschafft',
};

export const PATH_CONFIG = {
  checkCount: 3,
  starterCount: 3,
  reviewWindow: 4, // Zurück-Vorschlag: von den letzten 4 Versuchen …
  reviewFails: 3, // … mindestens 3 Fehlschläge
  failBelow: 0.5,
};

type PathExercise = Pick<Exercise, 'id' | 'difficulty' | 'requirement' | 'checkpoint'>;

/** Formel-Check: markierte Aufgaben (Formel vor Begriff), notfalls aufgefüllt mit leichten Wissensaufgaben. */
export function checkExercises<E extends PathExercise>(exercises: E[]): E[] {
  const marked = [...exercises.filter((e) => e.checkpoint === 'formula'), ...exercises.filter((e) => e.checkpoint === 'concept')];
  const fill = exercises.filter((e) => !e.checkpoint && e.requirement === 'knowledge' && e.difficulty === 1);
  return [...marked, ...fill].slice(0, PATH_CONFIG.checkCount);
}

/** Erste Übungen: leichte Rechenaufgaben (nicht aus dem Check), notfalls andere leichte Aufgaben. */
export function starterExercises<E extends PathExercise>(exercises: E[]): E[] {
  const check = new Set(checkExercises(exercises).map((e) => e.id));
  const easy = exercises.filter((e) => e.difficulty === 1 && !check.has(e.id));
  return [...easy.filter((e) => e.requirement === 'calculation'), ...easy.filter((e) => e.requirement !== 'calculation')].slice(0, PATH_CONFIG.starterCount);
}

/** Zu welchem Schritt gehört eine Aufgabe? (Für die Schrittleiste auf der Aufgabenseite.) */
export function stepOfExercise(exercises: PathExercise[], exerciseId: string): PathStep {
  if (checkExercises(exercises).some((e) => e.id === exerciseId)) return 'check';
  if (starterExercises(exercises).some((e) => e.id === exerciseId)) return 'starter';
  return 'practice';
}

export interface PathState<E> {
  step: PathStep;
  /** Nächste Aufgabe für die Schritte 3–5 (und „Weiter üben“ in Schritt 6). */
  exercise: E | null;
}

/**
 * Aktueller Schritt im Kapitel.
 * - Score ≥ 80 ⇒ Geschafft (weiterüben bleibt möglich).
 * - Ohne Versuche: Einstieg bzw. Erklärung, solange nicht gesehen/übersprungen.
 * - Danach Formel-Check und erste Übungen der Reihe nach (bearbeitet zählt, auch wenn falsch – die Rückmeldung hilft),
 *   dann die adaptive Übungsfolge.
 */
export function pathState<E extends PathExercise>(
  exercises: E[],
  attempts: Attempt[],
  o: { score: number; seen: { intro: boolean; explain: boolean } } & SelectionOptions,
): PathState<E> {
  const tried = new Set(attempts.map((a) => a.exerciseId));
  const practice = () => nextExercise(exercises, attempts, o)?.exercise ?? null;
  if (o.score >= SCORE_CONFIG.masteredMinScore) return { step: 'done', exercise: practice() };
  if (tried.size === 0 && !o.seen.intro) return { step: 'intro', exercise: null };
  if (tried.size === 0 && !o.seen.explain) return { step: 'explain', exercise: null };
  const open = (list: E[]) => list.find((e) => !tried.has(e.id) && e.id !== o.excludeId) ?? null;
  const check = checkExercises(exercises);
  const nextCheck = open(check);
  if (nextCheck) return { step: 'check', exercise: nextCheck };
  const nextStarter = open(starterExercises(exercises));
  if (nextStarter) return { step: 'starter', exercise: nextStarter };
  return { step: 'practice', exercise: practice() };
}

/** Zurück-Vorschlag: viele Fehler in letzter Zeit ⇒ Erklärung bzw. Video nochmal ansehen. */
export function needsReview(attempts: Attempt[]): boolean {
  const c = PATH_CONFIG;
  const recent = [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(-c.reviewWindow);
  return recent.length >= c.reviewWindow && recent.filter((a) => attemptCredit(a) < c.failBelow).length >= c.reviewFails;
}
