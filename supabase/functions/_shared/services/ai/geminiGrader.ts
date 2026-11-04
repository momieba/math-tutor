// AUTOMATISCH KOPIERT aus src/ durch scripts/sync-functions.mjs – nicht hier bearbeiten.
/**
 * Aufruf der Gemini API für die KI-Auswertung des Rechenwegs. Nur `fetch`, läuft daher in Node (Testskript)
 * und in Deno (Edge Function `grade-attempt`, per `npm run functions:sync` kopiert).
 */
import { AI_GRADING_SCHEMA, buildAiGradingPrompt, parseAiGrading, type AiGradableExercise, type AiGrading } from '../../domain/aiGrading.ts';

export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
/**
 * Modelle in Reihenfolge. Google stellt ältere Modelle für neue Nutzer ab (gemini-2.5-flash: 404) und die neuesten sind
 * zeitweise überlastet (503) – deshalb mehrere, das nächste wird bei Überlastung, Abschaltung oder Zeitüberschreitung versucht.
 */
export const GEMINI_DEFAULT_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash'];

export interface GeminiOptions {
  apiKey: string;
  /** Ein Modell oder eine kommagetrennte Liste (z. B. aus GEMINI_MODEL); leer ⇒ GEMINI_DEFAULT_MODELS. */
  model?: string;
  /** Zeitlimit für alle Versuche zusammen. */
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

/** Mit diesen Fehlern lohnt sich das nächste Modell: abgeschaltet, Kontingent, Überlastung, Zeitüberschreitung. */
const TRY_NEXT = new Set([404, 429, 500, 503, 504]);

export function modelList(model?: string): string[] {
  const list = (model ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return list.length ? list : GEMINI_DEFAULT_MODELS;
}

/** Schickt Aufgabe, Musterlösung und Bild an Gemini. Wirft den Fehler des letzten Modells, wenn keins antwortet. */
export async function gradeWorkWithGemini(ex: AiGradableExercise, image: { mimeType: string; base64: string }, opts: GeminiOptions): Promise<GeminiResult> {
  const models = modelList(opts.model);
  const deadline = Date.now() + (opts.timeoutMs ?? 30_000);
  const body = JSON.stringify({
    contents: [{ parts: [{ text: buildAiGradingPrompt(ex) }, { inline_data: { mime_type: image.mimeType, data: image.base64 } }] }],
    // Wenig „Denken“: Antwort in wenigen Sekunden statt teils über 30 s, bei gleicher Qualität für diese Aufgabe (gemessen).
    generationConfig: { responseMimeType: 'application/json', responseSchema: AI_GRADING_SCHEMA, temperature: 0, thinkingConfig: { thinkingLevel: 'low' } },
  });
  let lastError: unknown = new GeminiError(0, 'Kein Gemini-Modell konfiguriert.');
  for (const [i, model] of models.entries()) {
    // Restzeit fair auf die verbleibenden Modelle verteilen, damit ein hängendes Modell nicht alles aufbraucht.
    const remaining = deadline - Date.now();
    if (remaining <= 1000) break;
    const budget = i === models.length - 1 ? remaining : Math.max(remaining / (models.length - i), 8000);
    try {
      const res = await fetch(`${GEMINI_API}/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        body,
        signal: AbortSignal.timeout(Math.min(budget, remaining)),
      });
      if (!res.ok) {
        lastError = new GeminiError(res.status, `Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
        if (TRY_NEXT.has(res.status)) continue;
        throw lastError;
      }
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]; usageMetadata?: { totalTokenCount?: number } };
      const raw = json.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? '').join('') ?? '';
      return { grading: parseAiGrading(raw), raw, model, tokens: json.usageMetadata?.totalTokenCount };
    } catch (e) {
      if (e instanceof GeminiError) throw e;
      lastError = e; // Zeitüberschreitung oder Netzfehler: nächstes Modell
    }
  }
  throw lastError;
}
