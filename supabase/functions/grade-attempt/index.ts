// Edge Function `grade-attempt`: Verdrahtung mit Supabase (service_role). Logik und Tests: handler.ts / handler.test.ts.
// Deploy: npx supabase functions deploy grade-attempt
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createGradeHandler, type GradingContext } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(
  createGradeHandler({
    async resolveUser(token) {
      const { data, error } = await admin.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
    async loadContext(exerciseId) {
      const { data, error } = await admin.rpc('grading_context', { p_exercise: exerciseId });
      if (error) throw new Error(error.message);
      return data as GradingContext | null;
    },
    async uploadImage(path, png) {
      const { error } = await admin.storage.from('submissions').upload(path, png, { contentType: 'image/png', upsert: false });
      if (error) throw new Error(error.message);
    },
    async removeImage(path) {
      await admin.storage.from('submissions').remove([path]);
    },
    async recordAttempt(a) {
      const { error } = await admin.rpc('record_graded_attempt', {
        p_user: a.userId,
        p_exercise: a.exerciseId,
        p_attempt_id: a.attemptId,
        p_answer_raw: a.answerRaw,
        p_verdict: a.evaluation.verdict,
        p_points: a.evaluation.points,
        p_marks: a.evaluation.marks,
        p_feedback: a.evaluation.feedback,
        p_started_at: a.startedAt,
        p_submission_kind: a.submission?.kind ?? null,
        p_storage_path: a.submission?.storagePath ?? null,
        p_strokes: a.submission?.strokes ?? null,
      });
      if (error) throw new Error(error.message);
    },
    newId: () => crypto.randomUUID(),
  }),
);
