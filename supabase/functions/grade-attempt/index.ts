// Edge Function `grade-attempt`: Verdrahtung mit Supabase (service_role). Logik und Tests: handler.ts / handler.test.ts.
// Deploy: npx supabase functions deploy grade-attempt
// KI-Auswertung des Rechenwegs (Prototyp) nur, wenn die Secrets GEMINI_API_KEY und AI_GRADING_USERS (kommagetrennte
// Nutzer-IDs) gesetzt sind und der Nutzer in der Liste steht. Optional: GEMINI_MODEL.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { gradeWorkWithGemini } from '../_shared/services/ai/geminiGrader.ts';
import { createGradeHandler, type GradingContext } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const AI_GRADING_USERS = new Set((Deno.env.get('AI_GRADING_USERS') ?? '').split(',').map((id) => id.trim()).filter(Boolean));

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
    async gradeWork({ userId, exerciseId, review, commonMistakes, pngBase64 }) {
      if (!GEMINI_API_KEY || !AI_GRADING_USERS.has(userId)) return null;
      const { data, error } = await admin.from('exercises').select('prompt, requirement').eq('id', exerciseId).single();
      if (error) throw new Error(error.message);
      const exercise = { prompt: data.prompt, requirement: data.requirement, solution: review.solution, commonMistakes };
      const result = await gradeWorkWithGemini(exercise, { mimeType: 'image/png', base64: pngBase64 }, {
        apiKey: GEMINI_API_KEY,
        model: Deno.env.get('GEMINI_MODEL') || undefined,
        timeoutMs: 25_000,
      });
      return result.grading;
    },
  }),
);
