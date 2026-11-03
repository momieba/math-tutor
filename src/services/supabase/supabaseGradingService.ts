/**
 * Bewertungsdienst im Supabase-Modus. Der Browser sieht die Lösung nie vor der Abgabe:
 * - Hinweise/Lösung über RPCs (security definer), die jede Nutzung in `exercise_sessions` protokollieren.
 * - Bewertung + Speichern in der Edge Function `grade-attempt` (service_role, gleiche evaluate.ts wie lokal).
 */
import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import type { GradeRequest, GradeResponse } from '../../domain/gradingContract';
import type { ExerciseReview, ExerciseSessionState, ModelSolution } from '../../types';
import type { GradingService, LearnerRepository } from '../types';
import { getSupabase } from './client';

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/** Fehlermeldung der Edge Function (`{ error }`) bzw. Netzwerkfehler in eine verständliche Meldung übersetzen. */
async function functionError(error: unknown): Promise<Error> {
  if (error instanceof FunctionsFetchError) return new TypeError('fetch failed'); // → „Keine Verbindung zum Server“
  if (error instanceof FunctionsHttpError) {
    const body = (await (error.context as Response).json().catch(() => null)) as { error?: string } | null;
    if (body?.error) return new Error(body.error);
  }
  return error instanceof Error ? error : new Error('Die Abgabe konnte nicht bewertet werden.');
}

export function createSupabaseGradingService(learner: LearnerRepository): GradingService {
  return {
    async getSession(_userId, exerciseId) {
      return rpc<ExerciseSessionState>('get_exercise_session', { p_exercise: exerciseId });
    },
    async discardSession(_userId, exerciseId) {
      await rpc<null>('discard_exercise_session', { p_exercise: exerciseId });
    },
    async revealHint(_userId, exerciseId, level) {
      return rpc<string[]>('reveal_hint', { p_exercise: exerciseId, p_level: level });
    },
    async revealSolution(_userId, exerciseId) {
      return rpc<ModelSolution>('reveal_solution', { p_exercise: exerciseId });
    },
    async getReview(_userId, exerciseId) {
      return rpc<ExerciseReview | null>('get_exercise_review', { p_exercise: exerciseId });
    },
    async grade(input) {
      const body: GradeRequest = { exerciseId: input.exerciseId, answerRaw: input.answerRaw, startedAt: input.startedAt, submission: input.submission };
      const { data, error } = await getSupabase().functions.invoke<GradeResponse>('grade-attempt', { body });
      if (error || !data) throw await functionError(error);
      if (data.status === 'unclear') return data;
      const record = await learner.getAttempt(input.userId, data.attemptId);
      if (!record) throw new Error('Die Abgabe wurde gespeichert, konnte aber nicht geladen werden. Bitte lade die Seite neu.');
      return { status: 'saved', record, evaluation: data.evaluation, review: data.review };
    },
  };
}
