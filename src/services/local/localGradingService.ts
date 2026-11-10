/**
 * Bewertungsdienst im lokalen Modus. Gleiche Regeln wie der Server (supabase/migrations/0002_production.sql
 * + Edge Function grade-attempt): Hinweise nur der Reihe nach, Hilfen werden pro Aufgabe protokolliert und
 * beim nächsten bewerteten Versuch angerechnet, unklare Eingaben werden nicht gespeichert.
 */
import { evaluateSubmission } from '../../domain/evaluate';
import type { AuthoredExercise, ExerciseReview } from '../../types';
import type { GradingService } from '../types';
import type { LocalLearnerRepository } from './localLearnerRepository';
import { readJson, removeKey, writeJson } from './storage';

interface ExerciseSession {
  hintsUsed: 0 | 1 | 2 | 3;
  solutionViewed: boolean;
  startedAt: string;
  /** Letzte Aktivität; nach SESSION_TTL_MS verfallen die Hilfen (wie in 0005_session_reset.sql). */
  updatedAt?: string;
}

const SESSION_TTL_MS = 30 * 60_000;

const sessionKey = (userId: string, exerciseId: string) => `exsession:${userId}:${exerciseId}`;

/** Wissensbasis erst bei Bedarf laden: eigener Chunk, im Supabase-Modus nie geladen (Vorlagen rechnen beim Import). */
let exercises: Promise<Map<string, { e: AuthoredExercise; topicId: string }>> | null = null;
async function exerciseOf(exerciseId: string): Promise<{ e: AuthoredExercise; topicId: string }> {
  exercises ??= import('../../content').then(({ topics }) => new Map(topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises.map((e) => [e.id, { e, topicId: t.id }] as const)))));
  const found = (await exercises).get(exerciseId);
  if (!found) throw new Error('Diese Aufgabe gibt es nicht.');
  return found;
}

const reviewOf = (e: AuthoredExercise): ExerciseReview => ({ hints: [...e.hints], solution: e.solution, commonMistakes: e.commonMistakes });

export function createLocalGradingService(learner: LocalLearnerRepository): GradingService {
  const load = (userId: string, exerciseId: string) => {
    const s = readJson<ExerciseSession | null>(sessionKey(userId, exerciseId), null);
    const last = Date.parse(s?.updatedAt ?? s?.startedAt ?? '');
    return s && Date.now() - last < SESSION_TTL_MS ? s : null;
  };
  const update = (userId: string, exerciseId: string, change: (s: ExerciseSession) => ExerciseSession) => {
    const current = load(userId, exerciseId) ?? { hintsUsed: 0, solutionViewed: false, startedAt: new Date().toISOString() };
    const next = { ...change(current), updatedAt: new Date().toISOString() };
    writeJson(sessionKey(userId, exerciseId), next);
    return next;
  };

  return {
    async getSession(userId, exerciseId) {
      const { e } = await exerciseOf(exerciseId);
      const s = load(userId, exerciseId);
      return { hints: e.hints.slice(0, s?.hintsUsed ?? 0), solution: s?.solutionViewed ? e.solution : null };
    },
    async discardSession(userId, exerciseId) {
      removeKey(sessionKey(userId, exerciseId));
    },
    async revealHint(userId, exerciseId, level) {
      const { e } = await exerciseOf(exerciseId);
      const s = update(userId, exerciseId, (cur) => {
        if (level > cur.hintsUsed + 1) throw new Error('Hinweise werden der Reihe nach freigeschaltet.');
        return { ...cur, hintsUsed: Math.max(cur.hintsUsed, level) as ExerciseSession['hintsUsed'] };
      });
      return e.hints.slice(0, s.hintsUsed);
    },
    async revealSolution(userId, exerciseId) {
      const { e } = await exerciseOf(exerciseId);
      update(userId, exerciseId, (cur) => ({ ...cur, solutionViewed: true }));
      return e.solution;
    },
    async getReview(userId, exerciseId) {
      const { e } = await exerciseOf(exerciseId);
      const attempts = await learner.listAttempts(userId, { exerciseId, limit: 1 });
      return attempts.length ? reviewOf(e) : null;
    },
    async grade(input) {
      const { e, topicId } = await exerciseOf(input.exerciseId);
      const evaluation = evaluateSubmission(e, e.type, input.answerRaw, input.submission !== undefined);
      if (evaluation.verdict === 'unclear') return { status: 'unclear', evaluation };

      const session = load(input.userId, input.exerciseId);
      const record = await learner.saveAttempt({
        userId: input.userId,
        exerciseId: e.id,
        subtopicId: e.subtopicId,
        topicId,
        mode: input.mode ?? 'practice',
        answerRaw: input.answerRaw,
        hintsUsed: session?.hintsUsed ?? 0,
        solutionViewed: session?.solutionViewed ?? false,
        startedAt: session?.startedAt ?? input.startedAt,
        correction: { source: 'auto', verdict: evaluation.verdict, points: evaluation.points, marks: evaluation.marks, feedback: evaluation.feedback },
        submission: input.submission,
      });
      try {
        removeKey(sessionKey(input.userId, input.exerciseId));
      } catch {
        // Der Versuch ist gespeichert; ein übrig gebliebener Hilfen-Eintrag ist harmlos.
      }
      return { status: 'saved', record, evaluation, review: reviewOf(e) };
    },
  };
}
