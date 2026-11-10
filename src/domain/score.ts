/**
 * Verständnis-Score (0..100) – reine Funktionen, backend-unabhängig.
 * Single Source of Truth sind die Attempts; Progress-Zeilen in der DB sind nur Snapshots.
 * Formel und Konstanten: siehe ARCHITECTURE.md, Abschnitt „Score-Formel“.
 */
import type { Attempt, ChapterStatus, Difficulty, Exercise, Requirement, ScoreCap, SubtopicProgress, TopicProgress } from '../types';

export const SCORE_CONFIG = {
  difficultyWeight: { 1: 1, 2: 1.5, 3: 2 } as Record<Difficulty, number>,
  hintPenaltyPerHint: 0.15, // je genutztem Hinweis −15 % der Aufgabenpunkte
  solutionViewedFactor: 0.25, // Musterlösung vor Abgabe angesehen ⇒ max. 25 %
  lastAttemptWeight: 0.7, // Stabilität: 70 % letzter, 30 % vorletzter Versuch
  windowSize: 15, // Beherrschung über die zuletzt bearbeiteten 15 Aufgaben eines Kapitels
  testWeight: 1.5, // Aufgaben, deren letzter Versuch aus einem Kapitel-Test stammt, zählen 1,5-fach (ohne Hilfen gelöst)
  targetWeight: 12, // Mindest-Nenner: etwa 8 gemischte Aufgaben (bei kleineren Kapiteln: alle Aufgaben)
  masteryWeight: 0.8,
  coverageWeight: 0.2,
  solvedThreshold: 0.8, // Aufgabe gilt als „gelöst“ ab q ≥ 0,8
  typeCoveredThreshold: 0.6, // Anforderungsart gilt als „abgedeckt“ ab q ≥ 0,6
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

/** Für den Score zählen nur Kennung, Anforderungsart und Schwierigkeit einer Aufgabe. */
export type ScoredExercise = Pick<Exercise, 'id' | 'requirement' | 'difficulty'>;

/**
 * Score eines Kapitels mit Aufgabenpool. Ein Kapitel kann 100 Aufgaben haben; niemand muss alle bearbeiten:
 * - Beherrschung M zählt nur die zuletzt bearbeiteten `windowSize` Aufgaben (alte Fehler wachsen heraus).
 * - Der Nenner ist mindestens das Zielgewicht (≈ 8 gemischte Aufgaben), bei kleinen Kapiteln das Gewicht aller Aufgaben.
 *   Zwei gelöste Aufgaben ergeben also noch keinen hohen Score.
 * - Abdeckung T: Anteil der im Kapitel vorkommenden Anforderungsarten, die mindestens einmal gut gelöst wurden.
 */
export function computeSubtopicProgress(subtopicId: string, exercises: ScoredExercise[], attempts: Attempt[]): SubtopicProgress {
  const c = SCORE_CONFIG;
  const pool = new Map(exercises.map((e) => [e.id, e]));
  const own = attempts.filter((a) => a.subtopicId === subtopicId && pool.has(a.exerciseId));
  const byExercise = groupBy(own, (a) => a.exerciseId);

  const lastAt = (id: string) => byExercise.get(id)!.reduce((max, a) => (a.submittedAt > max ? a.submittedAt : max), '');
  const attemptedIds = [...byExercise.keys()].sort((x, y) => lastAt(y).localeCompare(lastAt(x)));
  const credit = new Map(attemptedIds.map((id) => [id, exerciseCredit(byExercise.get(id)!)]));
  const lastMode = (id: string) => byExercise.get(id)!.reduce((last, a) => (a.submittedAt >= last.submittedAt ? a : last)).mode;
  /** Gewicht im Fenster: Schwierigkeit, im Kapitel-Test zusätzlich `testWeight`. */
  const weight = (id: string) => c.difficultyWeight[pool.get(id)!.difficulty] * (lastMode(id) === 'test' ? c.testWeight : 1);

  const poolWeight = exercises.reduce((sum, e) => sum + c.difficultyWeight[e.difficulty], 0);
  const target = Math.min(c.targetWeight, poolWeight);
  const window = attemptedIds.slice(0, c.windowSize);
  const windowWeight = window.reduce((sum, id) => sum + weight(id), 0);
  const windowCredit = window.reduce((sum, id) => sum + weight(id) * credit.get(id)!, 0);
  const mastery = target > 0 ? windowCredit / Math.max(windowWeight, target) : 0; // M

  const requirementsPresent = new Set<Requirement>(exercises.map((e) => e.requirement));
  const requirementsCovered = new Set<Requirement>();
  const maxDifficulty = Math.max(0, ...exercises.map((e) => e.difficulty));
  let hardSolved = false;
  let solved = 0;
  for (const id of attemptedIds) {
    const q = credit.get(id)!;
    const e = pool.get(id)!;
    if (q >= c.solvedThreshold) {
      solved++;
      if (e.difficulty === maxDifficulty) hardSolved = true;
    }
    if (q >= c.typeCoveredThreshold) requirementsCovered.add(e.requirement);
  }
  const typeCoverage = requirementsPresent.size > 0 ? requirementsCovered.size / requirementsPresent.size : 0; // T
  let score = 100 * (c.masteryWeight * mastery + c.coverageWeight * typeCoverage);

  const caps: ScoreCap[] = [];
  if (typeCoverage < 1) caps.push('type-coverage');
  if (!hardSolved) caps.push('no-hard-exercise');
  if (!hasConfirmation(own)) caps.push('no-confirmation');
  for (const cap of caps) score = Math.min(score, c.caps[cap]);
  score = Math.round(score);

  const attempted = attemptedIds.length;
  const windowAverage = window.length ? window.reduce((sum, id) => sum + credit.get(id)!, 0) / window.length : 0;
  let status: ChapterStatus;
  if (attempted === 0) status = 'not_started';
  else if (score >= c.masteredMinScore && typeCoverage === 1) status = 'mastered';
  else if (attempted >= 2 && windowAverage < c.needsPracticeBelow) status = 'needs_practice';
  else status = 'in_progress';

  const attemptedWeight = attemptedIds.reduce((sum, id) => sum + c.difficultyWeight[pool.get(id)!.difficulty], 0); // Bearbeitet-Anteil ohne Testgewicht
  return {
    subtopicId,
    score,
    status,
    completion: target > 0 ? Math.min(1, attemptedWeight / target) : 0,
    totalExercises: exercises.length,
    attemptedExercises: attempted,
    solvedExercises: solved,
    caps: attempted === 0 ? [] : caps,
    components: { mastery: round2(mastery), typeCoverage: round2(typeCoverage) },
    lastActivityAt: attemptedIds.length ? lastAt(attemptedIds[0]) : undefined,
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
  subtopics: { id: string; exercises: ScoredExercise[] }[],
  attempts: Attempt[],
): TopicProgress {
  const subs = subtopics.map((s) => computeSubtopicProgress(s.id, s.exercises, attempts));
  const n = subs.length || 1;
  // Score nur über begonnene Kapitel: Wer Kapitel 1 sicher kann, steht nicht bei 17, nur weil fünf Kapitel noch fehlen.
  // Wie viel vom Thema schon bearbeitet ist, zeigt completion (über alle Kapitel).
  const started = subs.filter((s) => s.status !== 'not_started');
  const score = started.length ? Math.round(started.reduce((sum, s) => sum + s.score, 0) / started.length) : 0;
  const own = attempts.filter((a) => a.topicId === topicId);
  let status: ChapterStatus = 'in_progress';
  if (subs.every((s) => s.status === 'not_started')) status = 'not_started';
  else if (subs.every((s) => s.status === 'mastered')) status = 'mastered';
  else if (subs.some((s) => s.status === 'needs_practice')) status = 'needs_practice';
  return {
    topicId,
    score,
    completion: subs.reduce((sum, s) => sum + s.completion, 0) / n,
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
  'type-coverage': 'Löse jede Aufgabenart dieses Kapitels (z. B. Wissen, Rechnen, Sachaufgabe) mindestens einmal (max. 79 bis dahin).',
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
