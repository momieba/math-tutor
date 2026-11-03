/**
 * Bewertet eine Abgabe serverseitig und speichert sie (Konzept: Score nicht fälschbar, Lösung nie vor der Abgabe im Browser).
 * Ablauf: Nutzer prüfen → Eingabe validieren → Lösungsschlüssel laden → evaluate.ts (identisch zum lokalen Modus)
 * → bei `unclear` nur Rückfrage → sonst Bild hochladen + record_graded_attempt (übernimmt die protokollierten Hilfen).
 * Ohne Deno-Abhängigkeiten; die echte Verdrahtung steht in index.ts.
 */
import { evaluateAnswer, evaluateHandwriting, type EvaluationResult } from '../_shared/domain/evaluate.ts';
import { GRADE_LIMITS, type GradeRequest, type GradeResponse } from '../_shared/domain/gradingContract.ts';
import { HttpError, json, requireUser, serveJson, type ResolveUser } from '../_shared/http.ts';
import type { CommonMistake, ExerciseReview, ExerciseType, ExpectedAnswer, SubmissionKind } from '../_shared/types/index.ts';

export interface GradingContext {
  exercise: { id: string; type: ExerciseType };
  key: { answer: ExpectedAnswer; commonMistakes: CommonMistake[] };
  review: ExerciseReview;
}

export interface GradedAttempt {
  userId: string;
  exerciseId: string;
  attemptId: string;
  answerRaw: string;
  evaluation: EvaluationResult;
  startedAt: string | null;
  submission: { kind: SubmissionKind; storagePath: string | null; strokes: unknown } | null;
}

export interface GradeDeps {
  resolveUser: ResolveUser;
  loadContext(exerciseId: string): Promise<GradingContext | null>;
  uploadImage(path: string, png: Uint8Array): Promise<void>;
  removeImage(path: string): Promise<void>;
  recordAttempt(attempt: GradedAttempt): Promise<void>;
  newId(): string;
}

const SUBMISSION_KINDS: SubmissionKind[] = ['canvas', 'photo', 'text'];
const PNG_PREFIX = 'data:image/png;base64,';
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const invalid = (msg = 'Die Abgabe ist unvollständig oder beschädigt. Bitte lade die Seite neu.') => new HttpError(400, msg);

function parseRequest(body: unknown): GradeRequest {
  const b = body as Partial<GradeRequest> | null;
  if (!b || typeof b !== 'object') throw invalid();
  if (typeof b.exerciseId !== 'string' || !b.exerciseId || b.exerciseId.length > 100) throw invalid();
  if (typeof b.answerRaw !== 'string') throw invalid();
  if (b.answerRaw.length > GRADE_LIMITS.answerChars) throw invalid('Die Antwort ist zu lang. Bitte gib nur das Ergebnis ein.');
  if (b.startedAt !== undefined && (typeof b.startedAt !== 'string' || Number.isNaN(Date.parse(b.startedAt)))) throw invalid();
  if (b.submission !== undefined && b.submission !== null) {
    const s = b.submission;
    if (typeof s !== 'object' || !SUBMISSION_KINDS.includes(s.kind)) throw invalid();
    if (s.dataUrl !== undefined && (typeof s.dataUrl !== 'string' || !s.dataUrl.startsWith(PNG_PREFIX))) throw invalid();
    if (s.strokes !== undefined && JSON.stringify(s.strokes).length > GRADE_LIMITS.strokesChars) throw invalid('Der Rechenweg ist zu groß zum Speichern.');
  }
  return { exerciseId: b.exerciseId, answerRaw: b.answerRaw.trim(), startedAt: b.startedAt ?? '', submission: b.submission ?? undefined };
}

function decodePng(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(PNG_PREFIX.length);
  if (base64.length > Math.ceil((GRADE_LIMITS.imageBytes * 4) / 3) + 4) throw invalid('Das Bild deines Rechenwegs ist zu groß.');
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  } catch {
    throw invalid();
  }
  if (bytes.length > GRADE_LIMITS.imageBytes) throw invalid('Das Bild deines Rechenwegs ist zu groß.');
  if (!PNG_SIGNATURE.every((b, i) => bytes[i] === b)) throw invalid();
  return bytes;
}

export function createGradeHandler(deps: GradeDeps): (req: Request) => Promise<Response> {
  return serveJson(async (req) => {
    const userId = await requireUser(req, deps.resolveUser);
    const input = parseRequest(await req.json().catch(() => null));

    const ctx = await deps.loadContext(input.exerciseId);
    if (!ctx) throw new HttpError(404, 'Diese Aufgabe gibt es nicht.');

    const gradable = { answer: ctx.key.answer, commonMistakes: ctx.key.commonMistakes };
    const evaluation =
      ctx.exercise.type === 'handwriting' ? evaluateHandwriting(gradable, input.answerRaw, input.submission !== undefined) : evaluateAnswer(gradable, input.answerRaw);
    if (evaluation.verdict === 'unclear') return json({ status: 'unclear', evaluation } satisfies GradeResponse);

    const attemptId = deps.newId();
    const png = input.submission?.dataUrl ? decodePng(input.submission.dataUrl) : null;
    const storagePath = png ? `${userId}/${attemptId}.png` : null;
    if (png && storagePath) await deps.uploadImage(storagePath, png);
    try {
      await deps.recordAttempt({
        userId,
        exerciseId: input.exerciseId,
        attemptId,
        answerRaw: input.answerRaw,
        evaluation,
        startedAt: input.startedAt || null,
        submission: input.submission ? { kind: input.submission.kind, storagePath, strokes: input.submission.strokes ?? null } : null,
      });
    } catch (e) {
      if (storagePath) await deps.removeImage(storagePath).catch(() => {}); // kein verwaistes Bild
      throw e;
    }
    return json({ status: 'saved', attemptId, evaluation, review: ctx.review } satisfies GradeResponse);
  });
}
