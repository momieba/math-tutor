/**
 * LearnerRepository auf Supabase/Postgres. Zugriffsschutz serverseitig per RLS (supabase/migrations).
 * Nur lesend für Versuche: Geschrieben werden attempts/corrections/submissions ausschließlich von der Edge Function
 * `grade-attempt` (siehe supabaseGradingService). Bilder liegen im privaten Bucket `submissions/<userId>/<attemptId>.png`
 * und werden über signierte URLs angezeigt.
 */
import type { AttemptRecord, Correction, StudentTopic, Submission } from '../../types';
import type { LearnerRepository } from '../types';
import { getSupabase, SUBMISSIONS_BUCKET } from './client';

interface AttemptRow {
  id: string;
  user_id: string;
  exercise_id: string;
  subtopic_id: string;
  topic_id: string;
  mode: 'practice' | 'test';
  answer_raw: string;
  points: number;
  is_correct: boolean;
  hints_used: 0 | 1 | 2 | 3;
  solution_viewed: boolean;
  started_at: string;
  submitted_at: string;
  corrections?: CorrectionRow[];
  submissions?: SubmissionRow[];
}
interface CorrectionRow {
  id: string;
  attempt_id: string;
  source: Correction['source'];
  verdict: Correction['verdict'];
  points: number;
  marks: Correction['marks'];
  feedback: string;
  created_at: string;
}
interface SubmissionRow {
  id: string;
  attempt_id: string;
  kind: Submission['kind'];
  storage_path: string | null;
  strokes: unknown;
  created_at: string;
}

const SELECT = '*, corrections(*), submissions(*)';

function mapAttempt(r: AttemptRow): AttemptRecord {
  const c = r.corrections?.[0];
  const s = r.submissions?.[0];
  return {
    id: r.id,
    userId: r.user_id,
    exerciseId: r.exercise_id,
    subtopicId: r.subtopic_id,
    topicId: r.topic_id,
    mode: r.mode,
    answerRaw: r.answer_raw,
    points: Number(r.points),
    isCorrect: r.is_correct,
    hintsUsed: r.hints_used,
    solutionViewed: r.solution_viewed,
    startedAt: r.started_at,
    submittedAt: r.submitted_at,
    correction: c && {
      id: c.id,
      attemptId: c.attempt_id,
      source: c.source,
      verdict: c.verdict,
      points: Number(c.points),
      marks: c.marks ?? [],
      feedback: c.feedback,
      createdAt: c.created_at,
    },
    submission: s && { id: s.id, attemptId: s.attempt_id, kind: s.kind, imageRef: s.storage_path ?? undefined, strokes: s.strokes, createdAt: s.created_at },
  };
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export function createSupabaseLearnerRepository(): LearnerRepository {
  const sb = getSupabase();
  return {
    async listActiveTopics(userId) {
      const { data, error } = await sb.from('student_topics').select('user_id, topic_id, added_at').eq('user_id', userId).order('added_at');
      fail(error);
      return (data ?? []).map((r) => ({ userId: r.user_id, topicId: r.topic_id, addedAt: r.added_at }) as StudentTopic);
    },
    async addActiveTopic(userId, topicId) {
      const { data, error } = await sb
        .from('student_topics')
        .upsert({ user_id: userId, topic_id: topicId }, { onConflict: 'user_id,topic_id', ignoreDuplicates: false })
        .select('user_id, topic_id, added_at')
        .single();
      fail(error);
      return { userId: data!.user_id, topicId: data!.topic_id, addedAt: data!.added_at };
    },
    async removeActiveTopic(userId, topicId) {
      const { error } = await sb.from('student_topics').delete().eq('user_id', userId).eq('topic_id', topicId);
      fail(error);
    },
    async listAttempts(userId, filter = {}) {
      let q = sb.from('attempts').select(SELECT).eq('user_id', userId).order('submitted_at', { ascending: false });
      if (filter.topicId) q = q.eq('topic_id', filter.topicId);
      if (filter.subtopicId) q = q.eq('subtopic_id', filter.subtopicId);
      if (filter.exerciseId) q = q.eq('exercise_id', filter.exerciseId);
      if (filter.limit) q = q.limit(filter.limit);
      const { data, error } = await q.returns<AttemptRow[]>();
      fail(error);
      return (data ?? []).map(mapAttempt);
    },
    async getAttempt(userId, attemptId) {
      const { data, error } = await sb.from('attempts').select(SELECT).eq('user_id', userId).eq('id', attemptId).maybeSingle<AttemptRow>();
      fail(error);
      return data ? mapAttempt(data) : null;
    },
    async getSubmissionImageUrl(submission) {
      if (!submission.imageRef) return null;
      const { data, error } = await sb.storage.from(SUBMISSIONS_BUCKET).createSignedUrl(submission.imageRef, 60 * 10);
      fail(error);
      return data?.signedUrl ?? null;
    },
    async exportData(userId) {
      const [profile, topics, attempts] = await Promise.all([
        sb.from('profiles').select('display_name, role, grade, curriculum_id, consent_version, consented_at, created_at').eq('id', userId).maybeSingle(),
        sb.from('student_topics').select('topic_id, added_at').eq('user_id', userId),
        sb.from('attempts').select(SELECT).eq('user_id', userId).order('submitted_at').returns<AttemptRow[]>(),
      ]);
      fail(profile.error ?? topics.error ?? attempts.error);
      return { profile: profile.data, activeTopics: topics.data ?? [], attempts: (attempts.data ?? []).map(mapAttempt) };
    },
  };
}
