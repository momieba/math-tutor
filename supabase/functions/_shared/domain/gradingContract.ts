// AUTOMATISCH KOPIERT aus src/ durch scripts/sync-functions.mjs – nicht hier bearbeiten.
/**
 * Vertrag zwischen Client und Edge Function `grade-attempt` (supabase/functions/grade-attempt).
 * Wird per `npm run functions:sync` zusammen mit evaluate.ts nach supabase/functions/_shared kopiert.
 */
import type { AttemptMode, ExerciseReview, SubmissionKind } from '../types/index.ts';
import type { EvaluationResult } from './evaluate.ts';

export interface GradeRequest {
  exerciseId: string;
  answerRaw: string;
  startedAt: string;
  submission?: { kind: SubmissionKind; dataUrl?: string; strokes?: unknown };
  /** Kapitel-Test oder Üben (Standard). */
  mode?: AttemptMode;
}

export type GradeResponse =
  | { status: 'unclear'; evaluation: EvaluationResult }
  | { status: 'saved'; attemptId: string; evaluation: EvaluationResult; review: ExerciseReview };

/** Obergrenzen, die Client und Server gleich prüfen (Schreibflächen-PNG ≤ 1000 px ist deutlich kleiner). */
export const GRADE_LIMITS = {
  answerChars: 500,
  imageBytes: 1_500_000,
  strokesChars: 1_000_000,
} as const;
