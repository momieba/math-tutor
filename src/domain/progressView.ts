/**
 * Reine Ableitungen für die Anzeige: Status je Aufgabe, nächstes Kapitel, Empfehlung im Dashboard.
 * Baut auf score.ts auf (gleiche Schwellen), damit Anzeige und Score nie auseinanderlaufen.
 */
import type { Attempt, ChapterStatus, Exercise, TopicProgress, Verdict } from '../types';
import { exerciseCredit, SCORE_CONFIG } from './score';

export type ExerciseStatus = 'open' | 'practiced' | 'solved';

export const EXERCISE_STATUS_LABEL: Record<ExerciseStatus, string> = {
  open: 'Offen',
  practiced: 'Geübt – noch nicht sicher',
  solved: 'Gelöst',
};

export interface ExerciseState {
  status: ExerciseStatus;
  /** q_e aus score.ts (0..1). */
  credit: number;
  attemptCount: number;
  lastVerdict?: Verdict;
  lastSubmittedAt?: string;
}

export function exerciseState(attemptsOfExercise: (Attempt & { correction?: { verdict: Verdict } })[]): ExerciseState {
  if (attemptsOfExercise.length === 0) return { status: 'open', credit: 0, attemptCount: 0 };
  const credit = exerciseCredit(attemptsOfExercise);
  const last = [...attemptsOfExercise].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  return {
    status: credit >= SCORE_CONFIG.solvedThreshold ? 'solved' : 'practiced',
    credit: Math.round(credit * 100) / 100,
    attemptCount: attemptsOfExercise.length,
    lastVerdict: last.correction?.verdict ?? (last.isCorrect ? 'correct' : last.points > 0 ? 'partial' : 'incorrect'),
    lastSubmittedAt: last.submittedAt,
  };
}

/** Erstes Kapitel (nach `order`), das noch nicht „Sicher beherrscht“ ist. */
export function nextChapterId(subtopics: { id: string; order: number }[], progress: Pick<TopicProgress, 'subtopics'>): string | undefined {
  const status = new Map(progress.subtopics.map((p) => [p.subtopicId, p.status]));
  return [...subtopics].sort((a, b) => a.order - b.order).find((s) => status.get(s.id) !== 'mastered')?.id;
}

export interface Recommendation {
  topicId: string;
  topicTitle: string;
  subtopicId: string;
  subtopicTitle: string;
  status: ChapterStatus;
  reason: string;
}

const REASON: Record<ChapterStatus, string> = {
  not_started: 'Als Nächstes dran',
  in_progress: 'Hier weitermachen',
  needs_practice: 'Hier lohnt sich noch Übung',
  mastered: '',
};

/**
 * Empfehlung für den nächsten Schritt: Thema mit der jüngsten Aktivität zuerst (sonst Reihenfolge der Kacheln),
 * darin das erste nicht beherrschte Kapitel. `undefined`, wenn alles beherrscht ist oder keine Themen aktiv sind.
 */
export function recommendNext(
  entries: { topicId: string; topicTitle: string; subtopics: { id: string; order: number; title: string }[]; progress: TopicProgress }[],
): Recommendation | undefined {
  const ordered = entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (b.e.progress.lastActivityAt ?? '').localeCompare(a.e.progress.lastActivityAt ?? '') || a.i - b.i)
    .map((x) => x.e);
  for (const e of ordered) {
    const id = nextChapterId(e.subtopics, e.progress);
    if (!id) continue;
    const status = e.progress.subtopics.find((p) => p.subtopicId === id)?.status ?? 'not_started';
    return { topicId: e.topicId, topicTitle: e.topicTitle, subtopicId: id, subtopicTitle: e.subtopics.find((s) => s.id === id)!.title, status, reason: REASON[status] };
  }
  return undefined;
}

/** Lesbare Darstellung einer eingereichten Antwort (Multiple Choice: Text der Option statt Kennung). */
export function formatAnswer(ex: Pick<Exercise, 'choices' | 'answer'>, raw: string): string {
  if (ex.answer.kind === 'choice') return ex.choices?.find((c) => c.id === raw)?.label ?? raw;
  return raw;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  correct: 'Richtig',
  partial: 'Teilweise richtig',
  incorrect: 'Noch nicht richtig',
  unclear: 'Nicht eindeutig',
};

export const EXERCISE_TYPE_LABEL: Record<Exercise['type'], string> = {
  'multiple-choice': 'Auswahl',
  numeric: 'Zahl eingeben',
  equation: 'Gleichung',
  text: 'Kurze Antwort',
  handwriting: 'Rechenweg schreiben',
};

export const DIFFICULTY_LABEL: Record<Exercise['difficulty'], string> = { 1: 'leicht', 2: 'mittel', 3: 'schwer' };
