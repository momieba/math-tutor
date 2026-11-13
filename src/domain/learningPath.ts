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
  check: 'Begriffe & Formeln',
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
  /** Beim Üben nach so vielen anderen Aufgaben wieder eine Definitionsfrage (wenn eine fällig ist). */
  definitionEvery: 3,
};

type PathExercise = Pick<Exercise, 'id' | 'difficulty' | 'requirement' | 'checkpoint'>;

/**
 * Check am Kapitelanfang: zuerst alle Definitionen („Was bedeutet …?“), danach der Formel-Check (Formel vor Begriff,
 * notfalls aufgefüllt mit leichten Wissensaufgaben, zusammen `checkCount` Fragen).
 */
export function checkExercises<E extends PathExercise>(exercises: E[]): E[] {
  const definitions = exercises.filter((e) => e.checkpoint === 'definition');
  const marked = [...exercises.filter((e) => e.checkpoint === 'formula'), ...exercises.filter((e) => e.checkpoint === 'concept')];
  const fill = exercises.filter((e) => !e.checkpoint && e.requirement === 'knowledge' && e.difficulty === 1 && !isDefinitionReview(e));
  return [...definitions, ...[...marked, ...fill].slice(0, PATH_CONFIG.checkCount)];
}

/** Definitionsfrage (beide Richtungen, siehe content/definitions.ts): wird beim Üben regelmäßig wiederholt. */
export const isDefinition = (e: Pick<Exercise, 'id' | 'checkpoint'>) => e.checkpoint === 'definition' || isDefinitionReview(e);
const isDefinitionReview = (e: Pick<Exercise, 'id'>) => /-defr-\d+$/.test(e.id);

/**
 * Welche Definitionsfrage ist beim Üben fällig? Erst wenn seit der letzten Definitionsfrage `definitionEvery` andere
 * Aufgaben bearbeitet wurden. Fällig ist, was noch nie oder zuletzt falsch beantwortet wurde, sonst die am längsten
 * nicht wiederholte, sobald ihr Abstand abgelaufen ist (verdoppelt sich mit jeder richtigen Antwort: 1, 2, 4, … Tage).
 */
export function dueDefinition<E extends PathExercise>(exercises: E[], attempts: Attempt[], now: Date, excludeId?: string): E | null {
  const defs = exercises.filter((e) => isDefinition(e) && e.id !== excludeId);
  if (defs.length === 0) return null;
  const sorted = [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const defIds = new Set(defs.map((d) => d.id));
  const lastDef = sorted.map((a) => defIds.has(a.exerciseId)).lastIndexOf(true);
  if (lastDef >= 0 && sorted.length - 1 - lastDef < PATH_CONFIG.definitionEvery) return null;
  let best: { e: E; rank: number } | null = null;
  for (const e of defs) {
    const own = sorted.filter((a) => a.exerciseId === e.id);
    const last = own.at(-1);
    let rank: number;
    if (!last) rank = 2; // noch nie gefragt
    else if (attemptCredit(last) < SCORE_CONFIG.solvedThreshold) rank = 3; // zuletzt falsch: zuerst wiederholen
    else {
      const streak = own.length - 1 - own.map((a) => attemptCredit(a) < SCORE_CONFIG.solvedThreshold).lastIndexOf(true);
      const dueAt = Date.parse(last.submittedAt) + 2 ** (streak - 1) * 24 * 3600_000;
      if (now.getTime() < dueAt) continue;
      rank = 1;
    }
    if (!best || rank > best.rank) best = { e, rank };
  }
  return best?.e ?? null;
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
  // Definitionen kommen nicht über die adaptive Folge, sondern gezielt über dueDefinition.
  const practice = () => nextExercise(exercises.filter((e) => !isDefinition(e)), attempts, o)?.exercise ?? null;
  if (o.score >= SCORE_CONFIG.masteredMinScore) return { step: 'done', exercise: dueDefinition(exercises, attempts, o.now, o.excludeId) ?? practice() };
  if (tried.size === 0 && !o.seen.intro) return { step: 'intro', exercise: null };
  if (tried.size === 0 && !o.seen.explain) return { step: 'explain', exercise: null };
  const open = (list: E[]) => list.find((e) => !tried.has(e.id) && e.id !== o.excludeId) ?? null;
  const check = checkExercises(exercises);
  const nextCheck = open(check);
  if (nextCheck) return { step: 'check', exercise: nextCheck };
  const nextStarter = open(starterExercises(exercises));
  if (nextStarter) return { step: 'starter', exercise: nextStarter };
  return { step: 'practice', exercise: dueDefinition(exercises, attempts, o.now, o.excludeId) ?? practice() };
}

/** Zurück-Vorschlag: viele Fehler in letzter Zeit ⇒ Erklärung bzw. Video nochmal ansehen. */
export function needsReview(attempts: Attempt[]): boolean {
  const c = PATH_CONFIG;
  const recent = [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(-c.reviewWindow);
  return recent.length >= c.reviewWindow && recent.filter((a) => attemptCredit(a) < c.failBelow).length >= c.reviewFails;
}
