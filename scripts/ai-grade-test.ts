/**
 * Prototyp der KI-Korrektur (Phase 2): schickt ein Bild eines Rechenwegs mit Aufgabe und Musterlösung an Gemini
 * und zeigt die Schritt-Bewertung. Nichts wird gespeichert oder deployt.
 *
 * NUR EIGENE TESTBILDER: Die kostenlose Gemini-Stufe darf Eingaben speichern und zum Training verwenden.
 *
 * Einrichtung: API-Key unter https://aistudio.google.com/apikey anlegen und in .env.local eintragen:
 *   GEMINI_API_KEY=...
 *   GEMINI_MODEL=gemini-3.5-flash,gemini-3.8-flash   (optional, Reihenfolge = Ersatzmodelle)
 *
 * Aufruf:
 *   npm run ai:test -- --list                          Handschrift-Aufgaben anzeigen
 *   npm run ai:test -- --models                        verfügbare Modelle anzeigen
 *   npm run ai:test -- <aufgaben-id> <bild> [--answer "eingetipptes Endergebnis"] [--raw]
 */
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { topics } from '../src/content/index';
import { aiGradingMarks, chooseFinalAnswer, isTrustworthy } from '../src/domain/aiGrading';
import { evaluateAnswer } from '../src/domain/evaluate';
import { GEMINI_API, gradeWorkWithGemini, modelList, readFinalAnswerWithGemini } from '../src/services/ai/geminiGrader';
import type { AuthoredExercise } from '../src/types';

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const ICON = { green: '🟢', yellow: '🟡', red: '🔴' } as const;

try {
  process.loadEnvFile('.env.local');
} catch {
  // keine .env.local – dann muss GEMINI_API_KEY in der Umgebung stehen
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--answer');

const exercises: AuthoredExercise[] = topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises));

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function apiKey(): string {
  return process.env.GEMINI_API_KEY || fail('GEMINI_API_KEY fehlt. Key unter https://aistudio.google.com/apikey anlegen und in .env.local eintragen.');
}

async function listModels() {
  const res = await fetch(`${GEMINI_API}/models?pageSize=200`, { headers: { 'x-goog-api-key': apiKey() } });
  if (!res.ok) fail(`Fehler ${res.status}: ${await res.text()}`);
  const { models } = (await res.json()) as { models: { name: string; supportedGenerationMethods?: string[] }[] };
  for (const m of models.filter((m) => m.supportedGenerationMethods?.includes('generateContent'))) console.log(m.name.replace('models/', ''));
}

function listExercises() {
  for (const e of exercises.filter((e) => e.type === 'handwriting')) console.log(`${e.id.padEnd(28)} ${e.prompt.slice(0, 90).replace(/\s+/g, ' ')}`);
}

async function grade(exerciseId: string, imagePath: string) {
  const ex = exercises.find((e) => e.id === exerciseId) ?? fail(`Aufgabe „${exerciseId}“ gibt es nicht (--list zeigt die Handschrift-Aufgaben).`);
  const mimeType = MIME[extname(imagePath).toLowerCase()] ?? fail('Bild muss .png, .jpg oder .webp sein.');
  const base64 = readFileSync(imagePath).toString('base64');
  const model = process.env.GEMINI_MODEL;

  const started = Date.now();
  // Wie in der Edge Function: Korrektur und blindes Lesen (ohne Musterlösung) gleichzeitig.
  const blindPromise = readFinalAnswerWithGemini(ex, { mimeType, base64 }, { apiKey: apiKey(), model }).catch(() => null);
  const result = await gradeWorkWithGemini(ex, { mimeType, base64 }, { apiKey: apiKey(), model }).catch((e: unknown) =>
    fail(`Keins der Modelle (${modelList(model).join(', ')}) hat geantwortet: ${e instanceof Error ? e.message : String(e)}
Verfügbare Modelle: npm run ai:test -- --models`),
  );
  if (flag('--raw')) console.log(result.raw, '\n');

  const g = result.grading;
  console.log(`Aufgabe:  ${ex.prompt.replace(/\s+/g, ' ')}`);
  console.log(`Modell:   ${result.model} · ${((Date.now() - started) / 1000).toFixed(1)} s · ${result.tokens ?? '?'} Tokens\n`);
  if (!g) fail('Antwort passt nicht zum Schema (mit --raw ansehen).');

  console.log(`Abschrift:\n  ${g.transcription.replace(/\n/g, '\n  ')}\n`);
  console.log('Schritte:');
  for (const m of aiGradingMarks(g)) console.log(`  ${ICON[m.color]} ${m.message}`);
  console.log(`\nRechenweg: ${g.workVerdict} · Sicherheit ${g.confidence.toFixed(2)} · lesbar: ${g.readable ? 'ja' : 'nein'}`);
  console.log(`Feedback:  ${g.feedback}`);
  console.log(`Verwendbar: ${isTrustworthy(g) ? 'ja' : 'nein (bliebe gelb „nicht automatisch geprüft“)'}\n`);

  // Endergebnis wie in der App deterministisch prüfen: eingetippt (--answer) und wie von der KI gelesen.
  const gradable = { answer: ex.answer, commonMistakes: ex.commonMistakes };
  const typed = option('--answer');
  if (typed !== undefined) console.log(`Endergebnis eingetippt „${typed}“: ${evaluateAnswer(gradable, typed).verdict}`);
  if (g.finalAnswerRead) console.log(`Endergebnis gelesen (mit Musterlösung) „${g.finalAnswerRead}“: ${evaluateAnswer(gradable, g.finalAnswerRead).verdict}`);
  const blind = (await blindPromise)?.reading ?? null;
  console.log(blind ? `Endergebnis blind gelesen „${blind.finalAnswerRead}“ (Sicherheit ${blind.confidence.toFixed(2)}): ${evaluateAnswer(gradable, blind.finalAnswerRead).verdict}` : 'Blindes Lesen: keine Antwort');
  const chosen = chooseFinalAnswer(isTrustworthy(g) ? g : null, blind, (a) => evaluateAnswer(gradable, a).verdict);
  console.log(`Bewertet würde: ${chosen === null ? 'Rückfrage (Lesung nicht sicher)' : `„${chosen}“`}`);
  console.log(`Musterlösung: ${ex.solution.finalAnswer}`);
}

if (flag('--list')) listExercises();
else if (flag('--models')) await listModels();
else if (positional.length === 2) await grade(positional[0], positional[1]);
else fail('Aufruf: npm run ai:test -- <aufgaben-id> <bild> [--answer "..."] [--raw]   |   --list   |   --models');
