/**
 * Aufruf der Gemini API für die KI-Auswertung des Rechenwegs. Nur `fetch`, läuft daher in Node (Testskript)
 * und in Deno (Edge Function `grade-attempt`, per `npm run functions:sync` kopiert).
 */
import { AI_GRADING_SCHEMA, buildAiGradingPrompt, parseAiGrading, type AiGradableExercise, type AiGrading } from '../../domain/aiGrading';

export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';

export interface GeminiOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}

export interface GeminiResult {
  /** null, wenn die Antwort nicht zum Schema passt. */
  grading: AiGrading | null;
  raw: string;
  model: string;
  tokens?: number;
}

export class GeminiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Schickt Aufgabe, Musterlösung und Bild an Gemini. Wirft GeminiError bei HTTP-Fehlern, Abbruch bei Zeitüberschreitung. */
export async function gradeWorkWithGemini(ex: AiGradableExercise, image: { mimeType: string; base64: string }, opts: GeminiOptions): Promise<GeminiResult> {
  const model = opts.model || GEMINI_DEFAULT_MODEL;
  const res = await fetch(`${GEMINI_API}/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildAiGradingPrompt(ex) }, { inline_data: { mime_type: image.mimeType, data: image.base64 } }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: AI_GRADING_SCHEMA, temperature: 0 },
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
  });
  if (!res.ok) throw new GeminiError(res.status, `Gemini ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { totalTokenCount?: number } };
  const raw = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return { grading: parseAiGrading(raw), raw, model, tokens: body.usageMetadata?.totalTokenCount };
}
