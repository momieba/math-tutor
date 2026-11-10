import { ArrowLeft, ArrowRight, Camera, CheckCircle2, ClipboardCheck, PenLine, RotateCcw, Send, TriangleAlert, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChoiceInput, MathInput, NumericInput } from '../components/AnswerInputs';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { ExerciseFigure } from '../components/figures/ExerciseFigure';
import { compactStrokes, emptyHistory, isBlank, visibleStrokes, type CanvasHistory } from '../components/handwriting/canvasModel';
import { HandwritingCanvas } from '../components/handwriting/HandwritingCanvas';
import { preparePhoto } from '../components/handwriting/photo';
import { exportStrokesAsPng } from '../components/handwriting/renderStrokes';
import { MathText } from '../components/MathText';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { SolutionView } from '../components/SolutionView';
import { Button, ButtonLink, EmptyState, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { canOfferTest, pickTestExercises, summarizeTest, TEST_CONFIG, type TestItemResult } from '../domain/chapterTest';
import type { EvaluationResult } from '../domain/evaluate';
import { REQUIREMENT_LABEL } from '../domain/progressView';
import { SCORE_CONFIG } from '../domain/score';
import { services } from '../services';
import type { AttemptSubmission, Exercise, ModelSolution, Subtopic } from '../types';

/** Ergebnis einer Testaufgabe, wie es am Ende angezeigt wird. */
interface StoredResult extends TestItemResult {
  evaluation: EvaluationResult;
  solution: ModelSolution;
  answerRaw: string;
}

/** Laufender Test im Tab gemerkt, damit Neuladen ihn nicht abbricht (Versuche selbst liegen ohnehin beim Bewertungsdienst). */
interface RunState {
  seed: string;
  index: number;
  results: StoredResult[];
  scoreBefore: number | null;
}

const runKey = (userId: string, subtopicId: string) => `mathmvp:v1:test:${userId}:${subtopicId}`;
function loadRun(userId: string, subtopicId: string): RunState | null {
  try {
    const raw = sessionStorage.getItem(runKey(userId, subtopicId));
    return raw ? (JSON.parse(raw) as RunState) : null;
  } catch {
    return null;
  }
}
function saveRun(userId: string, subtopicId: string, run: RunState | null) {
  try {
    if (run) sessionStorage.setItem(runKey(userId, subtopicId), JSON.stringify(run));
    else sessionStorage.removeItem(runKey(userId, subtopicId));
  } catch {
    // ohne Speicher läuft der Test trotzdem, nur Neuladen beginnt von vorn
  }
}

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Das hat nicht geklappt. Bitte versuche es erneut.');

/**
 * Kapitel-Test (domain/chapterTest.ts): feste Anzahl gemischter Aufgaben, keine Hinweise, keine Rückmeldung zwischendurch.
 * Jede Abgabe wird sofort mit mode = 'test' bewertet und gespeichert; die Auswertung kommt am Ende.
 */
export default function TestPage() {
  const { topicId = '', subtopicId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const [loaded, setLoaded] = useState(false);
  const [chapter, setChapter] = useState<Subtopic | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [scoreAfter, setScoreAfter] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    void (async () => {
      const s = await services.content.getSubtopic(subtopicId);
      if (!active) return;
      setChapter(s && s.topicId === topicId ? s : null);
      setRun(loadRun(userId, subtopicId));
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [topicId, subtopicId, userId]);

  const items = chapter && run ? pickTestExercises(chapter.exercises, run.seed) : [];
  const finished = run !== null && run.index >= items.length && items.length > 0;

  useEffect(() => {
    if (!finished || !chapter) return;
    void services.progress.getSubtopicProgress(userId, chapter.id).then((p) => setScoreAfter(p.score), () => setScoreAfter(null));
  }, [finished, chapter, userId]);

  function update(next: RunState | null) {
    setRun(next);
    if (chapter) saveRun(userId, chapter.id, next);
  }

  async function start() {
    if (!chapter) return;
    const before = await services.progress.getSubtopicProgress(userId, chapter.id).catch(() => null);
    const seed = `${userId}:${chapter.id}:${Date.now()}`;
    // Hilfen aus einer früheren, nicht abgegebenen Übung dieser Aufgaben verwerfen: im Test gibt es keine Hilfen.
    await Promise.all(pickTestExercises(chapter.exercises, seed).map((e) => services.grading.discardSession(userId, e.id).catch(() => undefined)));
    setScoreAfter(null);
    update({ seed, index: 0, results: [], scoreBefore: before?.score ?? null });
  }

  if (!loaded) {
    return (
      <div className="space-y-6" role="status">
        <span className="sr-only">Lade Test …</span>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }
  if (!chapter || !canOfferTest(chapter.exercises)) {
    return (
      <EmptyState icon={<TriangleAlert size={24} />} title="Für dieses Kapitel gibt es keinen Test." action={<ButtonLink to="/app" variant="primary">Zum Dashboard</ButtonLink>}>
        Tests gibt es für Kapitel mit genügend Aufgaben.
      </EmptyState>
    );
  }

  const chapterUrl = `/app/topics/${chapter.topicId}/chapters/${chapter.id}`;
  const back = (
    <Link to={chapterUrl} className="inline-flex min-h-11 items-center gap-2 font-medium text-indigo-700">
      <ArrowLeft aria-hidden="true" size={20} /> {chapter.title}
    </Link>
  );

  if (!run) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        {back}
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="test-heading">
          <h1 id="test-heading" className="flex items-center gap-3 text-2xl font-bold">
            <ClipboardCheck aria-hidden="true" size={28} className="text-indigo-700" /> Kapitel-Test: {chapter.title}
          </h1>
          <ul className="ml-6 list-disc space-y-1 text-slate-700">
            <li>{Math.min(TEST_CONFIG.size, chapter.exercises.filter((e) => !e.checkpoint).length)} gemischte Aufgaben, von leicht bis schwer</li>
            <li>Keine Hinweise und keine Musterlösung während des Tests</li>
            <li>Ob du richtig liegst, siehst du erst am Ende – mit Musterlösungen</li>
            <li>Testaufgaben zählen {SCORE_CONFIG.testWeight.toLocaleString('de-DE')}-fach für deinen Verständnis-Score</li>
          </ul>
          <Button variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />} onClick={() => void start()}>
            Test starten
          </Button>
        </section>
      </div>
    );
  }

  if (finished) {
    const summary = summarizeTest(run.results);
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        {back}
        <section
          className={`space-y-4 rounded-2xl border p-6 ${summary.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
          aria-labelledby="result-heading"
        >
          <h1 id="result-heading" className="text-2xl font-bold">
            {summary.passed ? 'Test bestanden!' : 'Test beendet'}
          </h1>
          <p className="text-lg">
            Du hast <strong className="tabular-nums">{summary.points.toLocaleString('de-DE')}</strong> von {summary.max} Punkten erreicht ({Math.round(summary.share * 100)} %).
          </p>
          {run.scoreBefore !== null && scoreAfter !== null && (
            <p className="flex flex-wrap items-center gap-3">
              <span>Verständnis im Kapitel:</span>
              <span className="tabular-nums text-slate-600">
                {run.scoreBefore} → {scoreAfter}
              </span>
              <ScoreBadge score={scoreAfter} />
            </p>
          )}
          {summary.weakRequirements.length > 0 && (
            <p>Üben lohnt sich besonders bei: {summary.weakRequirements.map((r) => REQUIREMENT_LABEL[r]).join(', ')}.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <ButtonLink to={chapterUrl} variant="primary" icon={<ArrowRight aria-hidden="true" size={20} />}>
              Zurück zum Kapitel
            </ButtonLink>
            <Button variant="ghost" icon={<RotateCcw aria-hidden="true" size={20} />} onClick={() => update(null)}>
              Neuen Test machen
            </Button>
          </div>
        </section>

        <h2 className="text-xl font-semibold">Deine Aufgaben</h2>
        <ol className="space-y-3">
          {run.results.map((r, i) => {
            const e = items.find((x) => x.id === r.exerciseId);
            return (
              <li key={r.exerciseId}>
                <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 p-4">
                    {r.verdict === 'correct' ? (
                      <CheckCircle2 aria-label="richtig" size={22} className="flex-none text-emerald-700" />
                    ) : r.points > 0 ? (
                      <CheckCircle2 aria-label="teilweise richtig" size={22} className="flex-none text-amber-700" />
                    ) : (
                      <XCircle aria-label="falsch" size={22} className="flex-none text-red-700" />
                    )}
                    <span className="flex-1">
                      <span className="text-sm text-slate-500">Aufgabe {i + 1} · </span>
                      {e ? <MathText text={e.prompt} /> : r.exerciseId}
                    </span>
                  </summary>
                  <div className="space-y-4 border-t border-slate-200 p-4">
                    {r.answerRaw && (
                      <p className="text-slate-700">
                        Deine Antwort: <strong>{r.answerRaw}</strong>
                      </p>
                    )}
                    <FeedbackPanel verdict={r.evaluation.verdict} points={r.evaluation.points} feedback={r.evaluation.feedback} marks={r.evaluation.marks} mistake={r.evaluation.mistake} />
                    <SolutionView solution={r.solution} />
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const current = items[run.index];
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {back}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600 tabular-nums">
          Aufgabe {run.index + 1} von {items.length}
        </span>
        <div className="flex-1">
          <ProgressBar value={run.index / items.length} label="Fortschritt im Test" showValue={false} size="sm" />
        </div>
      </div>
      <TestItem
        key={current.id}
        userId={userId}
        exercise={current}
        last={run.index === items.length - 1}
        onSaved={(result) => update({ ...run, index: run.index + 1, results: [...run.results, result] })}
      />
    </div>
  );
}

/** Eine Testaufgabe: Aufgabe, Schreibfläche bzw. Eingabe, Abgabe. Keine Hilfen, keine Rückmeldung (außer Rückfragen). */
function TestItem({ userId, exercise, last, onSaved }: { userId: string; exercise: Exercise; last: boolean; onSaved: (r: StoredResult) => void }) {
  const [answer, setAnswer] = useState('');
  const [drawing, setDrawing] = useState<CanvasHistory>(emptyHistory);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());
  const photoInput = useRef<HTMLInputElement>(null);

  const offersWork = exercise.type !== 'multiple-choice';
  const typesAnswer = !offersWork || services.mode === 'local';
  const isHandwriting = exercise.type === 'handwriting';
  const hasWork = photo !== null || !isBlank(drawing);
  const canSubmit = !busy && !photoBusy && (!offersWork ? answer.trim() !== '' : typesAnswer ? answer.trim() !== '' || (isHandwriting && hasWork) : hasWork);

  async function submit() {
    let submission: AttemptSubmission['submission'];
    if (offersWork && photo) submission = { kind: 'photo', dataUrl: photo };
    else if (offersWork && !isBlank(drawing)) {
      const strokes = compactStrokes(visibleStrokes(drawing));
      let dataUrl: string | undefined;
      try {
        dataUrl = exportStrokesAsPng(strokes);
      } catch {
        dataUrl = undefined;
      }
      submission = { kind: 'canvas', dataUrl, strokes };
    }
    setBusy(true);
    setNotice(null);
    setError(null);
    const result = await services.attempts.submit({ userId, exerciseId: exercise.id, answerRaw: answer.trim(), startedAt, submission, mode: 'test' });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    const outcome = result.outcome;
    if (outcome.status === 'unclear') return setNotice(outcome.evaluation); // Rückfrage zählt nicht als Versuch
    onSaved({
      exerciseId: exercise.id,
      verdict: outcome.evaluation.verdict,
      points: outcome.evaluation.points,
      difficulty: exercise.difficulty,
      requirement: exercise.requirement,
      evaluation: outcome.evaluation,
      solution: outcome.review.solution,
      answerRaw: outcome.record.answerRaw,
    });
  }

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setError(null);
    try {
      setPhoto(await preparePhoto(file));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPhotoBusy(false);
      if (photoInput.current) photoInput.current.value = '';
    }
  }

  const id = `answer-${exercise.id}`;
  const answerField =
    exercise.type === 'multiple-choice' ? (
      <ChoiceInput choices={exercise.choices ?? []} value={answer} onChange={setAnswer} disabled={busy} />
    ) : exercise.answerFormat.kind === 'numeric' ? (
      <NumericInput id={id} value={answer} onChange={setAnswer} unit={exercise.answerFormat.unit} disabled={busy} />
    ) : (
      <MathInput id={id} value={answer} onChange={setAnswer} disabled={busy} label={isHandwriting ? 'Dein Endergebnis' : 'Deine Antwort'} placeholder="Antwort eingeben" preview />
    );

  return (
    <section aria-label="Testaufgabe" className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="space-y-3 p-6">
          <h1 className="text-2xl leading-relaxed font-semibold text-slate-900">
            <MathText text={exercise.prompt} />
          </h1>
          {exercise.figure && <ExerciseFigure figure={exercise.figure} />}
        </header>
        {offersWork ? (
          <>
            <input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Foto vom Rechenweg" onChange={(e) => void choosePhoto(e.target.files?.[0])} />
            {photo ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="px-1 font-medium text-slate-700">Dein Foto vom Rechenweg</span>
                  <Button icon={<PenLine aria-hidden="true" size={18} />} onClick={() => setPhoto(null)} disabled={busy}>
                    Stattdessen schreiben
                  </Button>
                </div>
                <img src={photo} alt="Dein Foto vom Rechenweg" className="max-h-[40rem] w-full rounded-b-2xl bg-white object-contain" />
              </div>
            ) : (
              <HandwritingCanvas
                history={drawing}
                onChange={setDrawing}
                disabled={busy}
                toolbarEnd={
                  <Button loading={photoBusy} icon={<Camera aria-hidden="true" size={18} />} onClick={() => photoInput.current?.click()} aria-label="Foto hochladen" title="Foto hochladen">
                    <span className="hidden xl:inline">Foto hochladen</span>
                  </Button>
                }
              />
            )}
            {typesAnswer && <div className="space-y-2 rounded-b-2xl border-t border-slate-200 bg-indigo-50 p-6">{answerField}</div>}
          </>
        ) : (
          <div className="px-6 pb-6">{answerField}</div>
        )}
      </div>

      {notice && <FeedbackPanel verdict={notice.verdict} points={0} feedback={notice.feedback} marks={notice.marks} />}
      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Speichern fehlgeschlagen:</strong> {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {busy && (
          <p className="text-slate-600" role="status">
            {offersWork && !typesAnswer ? 'Dein Rechenweg wird gelesen …' : 'Speichere …'}
          </p>
        )}
        <Button variant="primary" size="lg" onClick={() => void submit()} disabled={!canSubmit} loading={busy} icon={<Send aria-hidden="true" size={20} />} className="w-full sm:w-auto">
          {last ? 'Abgeben und Test beenden' : 'Abgeben und weiter'}
        </Button>
      </div>
    </section>
  );
}
