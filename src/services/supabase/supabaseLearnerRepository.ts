/**
 * LearnerRepository auf Supabase/Postgres. Zugriffsschutz serverseitig per RLS (supabase/migrations/0001_init.sql).
 * Bilder liegen im privaten Bucket `submissions/<userId>/<attemptId>.png` und werden über signierte URLs angezeigt.
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

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
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
    async saveAttempt(input) {
      const { data: attempt, error } = await sb
        .from('attempts')
        .insert({
          user_id: input.userId,
          exercise_id: input.exerciseId,
          subtopic_id: input.subtopicId,
          topic_id: input.topicId,
          mode: input.mode,
          answer_raw: input.answerRaw,
          points: input.correction.points,
          is_correct: input.correction.verdict === 'correct',
          hints_used: input.hintsUsed,
          solution_viewed: input.solutionViewed,
          started_at: input.startedAt,
        })
        .select('id')
        .single();
      fail(error);
      const attemptId = attempt!.id as string;

      const { error: cErr } = await sb.from('corrections').insert({ attempt_id: attemptId, ...input.correction });
      fail(cErr);

      if (input.submission) {
        let storagePath: string | null = null;
        if (input.submission.dataUrl) {
          storagePath = `${input.userId}/${attemptId}.png`;
          const { error: upErr } = await sb.storage
            .from(SUBMISSIONS_BUCKET)
            .upload(storagePath, await dataUrlToBlob(input.submission.dataUrl), { contentType: 'image/png', upsert: false });
          fail(upErr);
        }
        const { error: sErr } = await sb.from('submissions').insert({
          attempt_id: attemptId,
          user_id: input.userId,
          kind: input.submission.kind,
          storage_path: storagePath,
          strokes: input.submission.strokes ?? null,
        });
        fail(sErr);
      }
      const { data: full, error: rErr } = await sb.from('attempts').select(SELECT).eq('id', attemptId).single<AttemptRow>();
      fail(rErr);
      return mapAttempt(full!);
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
  };
}
