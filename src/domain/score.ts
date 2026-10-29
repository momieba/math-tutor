/**
 * Verständnis-Score (0..100) – reine Funktionen, backend-unabhängig.
 * Single Source of Truth sind die Attempts; Progress-Zeilen in der DB sind nur Snapshots.
 * Formel und Konstanten: siehe ARCHITECTURE.md, Abschnitt „Score-Formel“.
 */
import type { Attempt, ChapterStatus, Difficulty, Exercise, ExerciseType, ScoreCap, SubtopicProgress, TopicProgress } from '../types';

export const SCORE_CONFIG = {
  difficultyWeight: { 1: 1, 2: 1.5, 3: 2 } as Record<Difficulty, number>,
  hintPenaltyPerHint: 0.15, // je genutztem Hinweis −15 % der Aufgabenpunkte
  solutionViewedFactor: 0.25, // Musterlösung vor Abgabe angesehen ⇒ max. 25 %
  lastAttemptWeight: 0.7, // Stabilität: 70 % letzter, 30 % vorletzter Versuch
  masteryWeight: 0.8,
  coverageWeight: 0.2,
  solvedThreshold: 0.8, // Aufgabe gilt als „gelöst“ ab q ≥ 0,8
  typeCoveredThreshold: 0.6, // Aufgabentyp gilt als „abgedeckt“ ab q ≥ 0,6
  caps: { 'type-coverage': 79, 'no-hard-exercise': 89, 'no-confirmation': 94 } as Record<ScoreCap, number>,
  confirmationMinHours: 20, // Wiederholung frühestens nach 20 h zählt als Bestätigung
  masteredMinScore: 80,
  needsPracticeBelow: 0.5,
};

/** Effektive Punkte eines Versuchs: Korrektheit × Hinweis-Faktor. */
export function attemptCredit(a: Pick<Attempt, 'points' | 'hintsUsed' | 'solutionViewed'>): number {
  const c = SCORE_CONFIG;
  const factor = a.solutionViewed ? c.solutionViewedFactor : 1 - c.hintPenaltyPerHint * a.hintsUsed;
  return clamp01(a.points) * factor;
}

/** Aufgaben-Credit q_e aus den letzten zwei Versuchen (chronologisch sortiert erwartet). */
export function exerciseCredit(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const sorted = [...attempts].sort((x, y) => x.submittedAt.localeCompare(y.submittedAt));
  const last = attemptCredit(sorted[sorted.length - 1]);
  if (sorted.length === 1) return last;
  const prev = attemptCredit(sorted[sorted.length - 2]);
  const w = SCORE_CONFIG.lastAttemptWeight;
  return w * last + (1 - w) * prev;
}

export function computeSubtopicProgress(subtopicId: string, exercises: Exercise[], attempts: Attempt[]): SubtopicProgress {
  const c = SCORE_CONFIG;
  const own = attempts.filter((a) => a.subtopicId === subtopicId);
  const byExercise = groupBy(own, (a) => a.exerciseId);

  let weightSum = 0;
  let creditSum = 0;
  let attempted = 0;
  let solved = 0;
  let attemptedCreditSum = 0;
  const typesPresent = new Set<ExerciseType>();
  const typesCovered = new Set<ExerciseType>();
  const maxDifficulty = Math.max(0, ...exercises.map((e) => e.difficulty));
  let hardSolved = false;

  for (const e of exercises) {
    const w = c.difficultyWeight[e.difficulty];
    weightSum += w;
    typesPresent.add(e.type);
    const list = byExercise.get(e.id) ?? [];
    if (list.length === 0) continue;
    const q = exerciseCredit(list);
    attempted++;
    attemptedCreditSum += q;
    creditSum += w * q;
    if (q >= c.solvedThreshold) {
      solved++;
      if (e.difficulty === maxDifficulty) hardSolved = true;
    }
    if (q >= c.typeCoveredThreshold) typesCovered.add(e.type);
  }

  const mastery = weightSum > 0 ? creditSum / weightSum : 0; // M
  const typeCoverage = typesPresent.size > 0 ? typesCovered.size / typesPresent.size : 0; // T
  let score = 100 * (c.masteryWeight * mastery + c.coverageWeight * typeCoverage);

  const caps: ScoreCap[] = [];
  if (typeCoverage < 1) caps.push('type-coverage');
  if (!hardSolved) caps.push('no-hard-exercise');
  if (!hasConfirmation(own)) caps.push('no-confirmation');
  for (const cap of caps) score = Math.min(score, c.caps[cap]);
  score = Math.round(score);

  let status: ChapterStatus;
  if (attempted === 0) status = 'not_started';
  else if (score >= c.masteredMinScore && typeCoverage === 1) status = 'mastered';
  else if (attempted >= 2 && attemptedCreditSum / attempted < c.needsPracticeBelow) status = 'needs_practice';
  else status = 'in_progress';

  return {
    subtopicId,
    score,
    status,
    completion: exercises.length ? attempted / exercises.length : 0,
    totalExercises: exercises.length,
    attemptedExercises: attempted,
    solvedExercises: solved,
    caps: attempted === 0 ? [] : caps,
    components: { mastery: round2(mastery), typeCoverage: round2(typeCoverage) },
  };
}

/** Bestätigung: eine Aufgabe zweimal gelöst (q ≥ 0,8) mit ≥ 20 h Abstand. */
function hasConfirmation(attempts: Attempt[]): boolean {
  const c = SCORE_CONFIG;
  const good = attempts.filter((a) => attemptCredit(a) >= c.solvedThreshold);
  for (const [, list] of groupBy(good, (a) => a.exerciseId)) {
    const times = list.map((a) => Date.parse(a.submittedAt)).sort((x, y) => x - y);
    if (times.length >= 2 && times[times.length - 1] - times[0] >= c.confirmationMinHours * 3600_000) return true;
  }
  return false;
}

export function computeTopicProgress(
  topicId: string,
  subtopics: { id: string; exercises: Exercise[] }[],
  attempts: Attempt[],
): TopicProgress {
  const subs = subtopics.map((s) => computeSubtopicProgress(s.id, s.exercises, attempts));
  const n = subs.length || 1;
  const score = Math.round(subs.reduce((sum, s) => sum + s.score, 0) / n);
  const total = subs.reduce((sum, s) => sum + s.totalExercises, 0);
  const done = subs.reduce((sum, s) => sum + s.attemptedExercises, 0);
  const own = attempts.filter((a) => a.topicId === topicId);
  let status: ChapterStatus = 'in_progress';
  if (subs.every((s) => s.status === 'not_started')) status = 'not_started';
  else if (subs.every((s) => s.status === 'mastered')) status = 'mastered';
  else if (subs.some((s) => s.status === 'needs_practice')) status = 'needs_practice';
  return {
    topicId,
    score,
    completion: total ? done / total : 0,
    status,
    subtopics: subs,
    lastActivityAt: own.map((a) => a.submittedAt).sort().at(-1),
  };
}

export const SCORE_BANDS = [
  { min: 95, label: 'Sehr sicher und mehrfach bestätigt' },
  { min: 80, label: 'Weitgehend sicher' },
  { min: 60, label: 'Solide Kenntnisse, einzelne Schwächen' },
  { min: 40, label: 'Erste Kenntnisse vorhanden' },
  { min: 0, label: 'Grundlagen aufbauen' },
] as const;

export function scoreBand(score: number): string {
  return SCORE_BANDS.find((b) => score >= b.min)!.label;
}

export const CAP_EXPLANATION: Record<ScoreCap, string> = {
  'type-coverage': 'Löse jeden Aufgabentyp dieses Kapitels mindestens einmal (max. 79 bis dahin).',
  'no-hard-exercise': 'Löse eine Aufgabe der höchsten Schwierigkeitsstufe (max. 89 bis dahin).',
  'no-confirmation': 'Löse eine Aufgabe an einem späteren Tag erneut richtig (max. 94 bis dahin).',
};

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) m.set(key(it), [...(m.get(key(it)) ?? []), it]);
  return m;
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const round2 = (x: number) => Math.round(x * 100) / 100;
