import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChoiceInput, MathInput, NumericInput } from '../components/AnswerInputs';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { compactStrokes, emptyHistory, historyFromStrokes, isBlank, isStrokeList, visibleStrokes, type CanvasHistory } from '../components/handwriting/canvasModel';
import { HandwritingCanvas } from '../components/handwriting/HandwritingCanvas';
import { exportStrokesAsPng } from '../components/handwriting/renderStrokes';
import { MathText } from '../components/MathText';
import { ScoreBadge } from '../components/ScoreBadge';
import { SolutionView } from '../components/SolutionView';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { evaluateAnswer, evaluateHandwriting, type EvaluationResult } from '../domain/evaluate';
import { DIFFICULTY_LABEL, EXERCISE_TYPE_LABEL } from '../domain/progressView';
import { SCORE_CONFIG } from '../domain/score';
import { services, type PendingAttempt } from '../services';
import type { AttemptRecord, Exercise, NewAttemptInput, Subtopic, SubtopicProgress } from '../types';

type Phase =
  | { kind: 'answering' }
  | { kind: 'saving' }
  | { kind: 'saved'; record: AttemptRecord; evaluation: EvaluationResult }
  | { kind: 'failed'; input: NewAttemptInput; evaluation: EvaluationResult; error: string; draftSaved: boolean; imageDropped: boolean };

const toEvaluation = (c: NewAttemptInput['correction']): EvaluationResult => ({ verdict: c.verdict, points: c.points, feedback: c.feedback, marks: c.marks });
const clampHints = (n: number) => Math.min(3, Math.max(0, n)) as 0 | 1 | 2 | 3;

/** Freitext mit Mathe-Zeichen bekommt eine KaTeX-Vorschau (reine Wörter wie „Grundwert“ nicht). */
const looksMathy = (s: string) => /[\d^_=+\-*/\\√²³]/.test(s);

/**
 * Aufgabe bearbeiten: Eingabe je Typ, gestufte Hinweise, „Lösung anzeigen“, Abgabe, Feedback, Musterlösung.
 * Abgabe: evaluate.ts (deterministisch) → services.attempts.submit (speichert, sonst Entwurf + erneuter Versuch).
 */
export default function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const userId = useAuth().session!.user.id;

  const [loaded, setLoaded] = useState(false);
  const [ex, setEx] = useState<Exercise | null>(null);
  const [sub, setSub] = useState<Subtopic | null>(null);
  /** Themenname für die Brotkrumen (UX-07); `null` ⇒ neutrales „Thema“. */
  const [topicTitle, setTopicTitle] = useState<string | null>(null);
  const [previousCount, setPreviousCount] = useState(0);
  const [pending, setPending] = useState<PendingAttempt | null>(null);

  const [answer, setAnswer] = useState('');
  const [drawing, setDrawing] = useState<CanvasHistory>(emptyHistory);
  const [hintsUsed, setHintsUsed] = useState<0 | 1 | 2 | 3>(0);
  const [solutionViewed, setSolutionViewed] = useState(false);
  const [confirmSolution, setConfirmSolution] = useState(false);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [notice, setNotice] = useState<EvaluationResult | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'answering' });
  const [chapterProgress, setChapterProgress] = useState<SubtopicProgress | null>(null);

  function resetForm() {
    setAnswer('');
    setDrawing(emptyHistory());
    setHintsUsed(0);
    setSolutionViewed(false);
    setConfirmSolution(false);
    setStartedAt(new Date().toISOString());
    setNotice(null);
    setPhase({ kind: 'answering' });
    setChapterProgress(null);
  }

  useEffect(() => {
    let active = true;
    resetForm();
    setLoaded(false);
    setPending(null);
    void (async () => {
      const e = await services.content.getExercise(exerciseId);
      const s = e ? await services.content.getSubtopic(e.subtopicId) : null;
      const [draft, previous, topic] = e
        ? await Promise.all([
            services.attempts.getPending(userId, e.id),
            services.learner.listAttempts(userId, { exerciseId: e.id }).catch(() => []),
            s ? services.content.getTopic(s.topicId).catch(() => null) : null,
          ])
        : [null, [], null];
      if (!active) return;
      setEx(e);
      setSub(s);
      setTopicTitle(topic?.title ?? null);
      setPreviousCount(previous.length);
      if (draft) {
        // Entwurf in das Formular übernehmen, damit nichts verloren wirkt.
        setPending(draft);
        setAnswer(draft.input.answerRaw);
        setHintsUsed(draft.input.hintsUsed);
        setSolutionViewed(draft.input.solutionViewed);
        setStartedAt(draft.input.startedAt);
        const strokes = draft.input.submission?.strokes;
        if (isStrokeList(strokes)) setDrawing(historyFromStrokes(strokes));
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [exerciseId, userId]);

  if (!loaded) return <p className="text-slate-500">Lade Aufgabe …</p>;
  if (!ex || !sub) {
    return (
      <div className="space-y-4">
        <p>Diese Aufgabe gibt es nicht.</p>
        <Link to="/app" className="text-indigo-700 underline min-h-11 inline-flex items-center">
          Zum Dashboard
        </Link>
      </div>
    );
  }

  const exercise = ex;
  const chapter = sub;
  const index = chapter.exercises.findIndex((e) => e.id === exercise.id);
  const next = chapter.exercises[index + 1];
  const chapterUrl = `/app/topics/${chapter.topicId}/chapters/${chapter.id}`;
  const locked = phase.kind !== 'answering';
  const isHandwriting = exercise.type === 'handwriting';
  const unit = exercise.answer.kind === 'numeric' ? exercise.answer.unit : undefined;

  async function send(input: NewAttemptInput, evaluation: EvaluationResult) {
    setPhase({ kind: 'saving' });
    const result = await services.attempts.submit(input);
    if (result.ok) {
      setPending(null);
      setPreviousCount((n) => n + 1);
      setPhase({ kind: 'saved', record: result.record, evaluation });
      services.progress.getSubtopicProgress(userId, chapter.id).then(setChapterProgress, () => setChapterProgress(null));
    } else {
      setPhase({ kind: 'failed', input, evaluation, error: result.error, draftSaved: result.draftSaved, imageDropped: result.imageDropped });
    }
  }

  function submit() {
    const hasDrawing = !isBlank(drawing);
    const evaluation = isHandwriting ? evaluateHandwriting(exercise, answer, hasDrawing) : evaluateAnswer(exercise, answer);
    if (evaluation.verdict === 'unclear') {
      // Rückfrage statt Bewertung: unklare Eingaben werden nicht als Versuch gezählt (Konzept §8/§9).
      setNotice(evaluation);
      return;
    }
    setNotice(null);
    let submission: NewAttemptInput['submission'];
    if (isHandwriting && hasDrawing) {
      const strokes = compactStrokes(visibleStrokes(drawing));
      let dataUrl: string | undefined;
      try {
        dataUrl = exportStrokesAsPng(strokes);
      } catch {
        dataUrl = undefined; // Striche bleiben trotzdem gespeichert und können später neu gerendert werden
      }
      submission = { kind: 'canvas', dataUrl, strokes };
    }
    const input: NewAttemptInput = {
      userId,
      exerciseId: exercise.id,
      subtopicId: exercise.subtopicId,
      topicId: chapter.topicId,
      mode: 'practice',
      answerRaw: answer.trim(),
      hintsUsed,
      solutionViewed,
      startedAt,
      correction: { source: 'auto', verdict: evaluation.verdict, points: evaluation.points, marks: evaluation.marks, feedback: evaluation.feedback },
      submission,
    };
    void send(input, evaluation);
  }

  async function discardDraft() {
    await services.attempts.discardPending(userId, exercise.id);
    setPending(null);
    resetForm();
  }

  const answerField = (() => {
    if (exercise.type === 'multiple-choice') {
      return <ChoiceInput choices={exercise.choices ?? []} value={answer} onChange={setAnswer} disabled={locked} />;
    }
    const id = `answer-${exercise.id}`;
    if (exercise.answer.kind === 'numeric') return <NumericInput id={id} value={answer} onChange={setAnswer} unit={unit} disabled={locked} />;
    const isSet = exercise.answer.kind === 'numeric-set';
    return (
      <MathInput
        id={id}
        value={answer}
        onChange={setAnswer}
        disabled={locked}
        label={isHandwriting ? 'Dein Endergebnis' : isSet ? 'Deine Lösung(en)' : 'Deine Antwort'}
        placeholder={isSet ? 'z. B. 3; -5' : exercise.type === 'equation' ? 'z. B. x^2 + 2x' : 'Antwort eingeben'}
        preview={exercise.type === 'equation' || isSet || looksMathy(answer)}
      />
    );
  })();

  const canSubmit = phase.kind === 'answering' && (answer.trim() !== '' || (isHandwriting && !isBlank(drawing)));
  const shownEvaluation = phase.kind === 'saved' || phase.kind === 'failed' ? phase.evaluation : null;
  const showSolution = solutionViewed || phase.kind === 'saved';

  return (
    <div className="space-y-6 pb-12">
      <nav className="text-sm text-slate-600 flex flex-wrap gap-x-2" aria-label="Brotkrumen">
        <Link to={`/app/topics/${chapter.topicId}`} className="text-indigo-700 underline min-h-11 inline-flex items-center">
          {topicTitle ?? 'Thema'}
        </Link>
        <span aria-hidden="true" className="self-center">
          ›
        </span>
        <Link to={chapterUrl} className="text-indigo-700 underline min-h-11 inline-flex items-center">
          {chapter.title}
        </Link>
        <span aria-hidden="true" className="self-center">
          ›
        </span>
        <span className="self-center">
          Aufgabe {index + 1} von {chapter.exercises.length}
        </span>
      </nav>

      {pending && phase.kind === 'answering' && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3" role="alert">
          <p>
            <strong>Nicht gespeicherte Abgabe gefunden</strong> vom {new Date(pending.savedAt).toLocaleString('de-DE')}.
            {pending.imageDropped && ' Das Bild deines Rechenwegs konnte nicht mitgesichert werden.'} Deine Eingaben wurden wiederhergestellt.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void send(pending.input, toEvaluation(pending.input.correction))}
              className="rounded-xl bg-amber-600 text-white px-5 font-medium"
            >
              Jetzt erneut senden
            </button>
            <button type="button" onClick={() => void discardDraft()} className="rounded-xl border border-amber-400 bg-white px-5">
              Verwerfen
            </button>
          </div>
        </div>
      )}

      <header className="space-y-2">
        <p className="text-sm text-slate-600">
          {EXERCISE_TYPE_LABEL[exercise.type]} · {DIFFICULTY_LABEL[exercise.difficulty]}
          {previousCount > 0 && ` · bisher ${previousCount} Versuch${previousCount === 1 ? '' : 'e'}`}
        </p>
        <h1 className="text-xl sm:text-2xl leading-relaxed">
          <MathText text={exercise.prompt} />
        </h1>
        {exercise.figure && <p className="text-sm text-slate-500 italic">Abbildung: {exercise.figure.alt}</p>}
      </header>

      <section className="space-y-4" aria-label="Deine Lösung">
        {isHandwriting && (
          <div className="space-y-2">
            <p className="text-slate-600">Schreibe deinen Rechenweg mit Stift oder Finger auf die Fläche.</p>
            <HandwritingCanvas history={drawing} onChange={setDrawing} disabled={locked} />
          </div>
        )}
        {answerField}
        {notice && <FeedbackPanel verdict={notice.verdict} points={0} feedback={notice.feedback} marks={notice.marks} />}
        {phase.kind === 'answering' && (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="w-full sm:w-auto rounded-xl bg-indigo-600 text-white px-8 py-3 text-lg font-semibold disabled:opacity-40"
          >
            Abgeben
          </button>
        )}
        {phase.kind === 'saving' && (
          <p className="text-slate-600" role="status">
            Speichere deine Lösung …
          </p>
        )}
      </section>

      {phase.kind === 'failed' && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 space-y-3" role="alert">
          <p>
            <strong>Speichern fehlgeschlagen:</strong> {phase.error}
          </p>
          <p>
            {phase.draftSaved
              ? `Deine Lösung ist als Entwurf auf diesem Gerät gesichert${phase.imageDropped ? ' (ohne Bild des Rechenwegs)' : ''}. Du kannst es später erneut versuchen.`
              : 'Deine Lösung konnte nicht als Entwurf gesichert werden. Bitte lass diese Seite geöffnet und versuche es erneut.'}
          </p>
          <button type="button" onClick={() => void send(phase.input, phase.evaluation)} className="rounded-xl bg-red-600 text-white px-5 font-medium">
            Erneut versuchen
          </button>
        </div>
      )}

      {shownEvaluation && (
        <FeedbackPanel
          verdict={shownEvaluation.verdict}
          points={shownEvaluation.points}
          feedback={shownEvaluation.feedback}
          marks={shownEvaluation.marks}
          mistake={shownEvaluation.mistake}
          commonMistakes={exercise.commonMistakes}
        />
      )}

      {phase.kind === 'saved' && (hintsUsed > 0 || solutionViewed) && (
        <p className="text-sm text-slate-600">
          Für den Verständnis-Score zählt diese Abgabe{' '}
          {solutionViewed
            ? `${Math.round(SCORE_CONFIG.solutionViewedFactor * 100)} %, weil du die Lösung vorher angesehen hast.`
            : `${Math.round((1 - SCORE_CONFIG.hintPenaltyPerHint * hintsUsed) * 100)} %, weil du ${hintsUsed} Hinweis${hintsUsed === 1 ? '' : 'e'} genutzt hast.`}
        </p>
      )}

      {phase.kind === 'saved' && chapterProgress && (
        <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-wrap items-center gap-3">
          <span className="font-medium">Kapitel „{chapter.title}“ jetzt:</span>
          <ScoreBadge score={chapterProgress.score} />
          <StatusBadge status={chapterProgress.status} />
        </div>
      )}

      {phase.kind !== 'saved' && (
        <section className="rounded-2xl bg-white p-5 shadow-sm space-y-3" aria-labelledby="hints-heading">
          <h2 id="hints-heading" className="text-lg font-semibold">
            Hinweise
          </h2>
          {hintsUsed > 0 && (
            <ol className="space-y-2">
              {exercise.hints.slice(0, hintsUsed).map((h, i) => (
                <li key={i} className="rounded-xl bg-sky-50 p-3">
                  <strong>Hinweis {i + 1}:</strong> <MathText text={h} />
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHintsUsed((n) => clampHints(n + 1))}
              disabled={hintsUsed >= 3 || solutionViewed || locked}
              className="rounded-xl border-2 border-sky-300 bg-white px-5 text-sky-900 font-medium disabled:opacity-40"
            >
              {hintsUsed >= 3 ? 'Alle Hinweise genutzt' : `💡 Hinweis ${hintsUsed + 1} von 3`}
            </button>
            {!solutionViewed && !confirmSolution && (
              <button
                type="button"
                onClick={() => setConfirmSolution(true)}
                disabled={locked}
                className="rounded-xl border border-slate-300 bg-white px-5 text-slate-700 disabled:opacity-40"
              >
                Lösung anzeigen
              </button>
            )}
          </div>
          {confirmSolution && !solutionViewed && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 space-y-2">
              <p>Wenn du die Lösung jetzt ansiehst, zählt diese Aufgabe nur noch {Math.round(SCORE_CONFIG.solutionViewedFactor * 100)} % für deinen Score.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSolutionViewed(true);
                    setConfirmSolution(false);
                  }}
                  className="rounded-xl bg-amber-600 text-white px-5"
                >
                  Ja, Lösung zeigen
                </button>
                <button type="button" onClick={() => setConfirmSolution(false)} className="rounded-xl border border-slate-300 bg-white px-5">
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <p className="text-sm text-slate-500">
            Jeder Hinweis verringert die Punkte dieser Aufgabe um {Math.round(SCORE_CONFIG.hintPenaltyPerHint * 100)} %. Das ist kein Problem – Hauptsache, du
            verstehst es.
          </p>
        </section>
      )}

      {showSolution && <SolutionView solution={exercise.solution} />}

      <nav className="flex flex-wrap gap-3" aria-label="Weiter">
        {phase.kind === 'saved' && (
          <button type="button" onClick={resetForm} className="rounded-xl border-2 border-indigo-300 bg-white px-5 text-indigo-800 font-medium">
            Nochmal versuchen
          </button>
        )}
        {next && (
          <Link to={`/app/exercises/${next.id}`} className="rounded-xl bg-indigo-600 text-white px-5 font-medium inline-flex items-center">
            Nächste Aufgabe →
          </Link>
        )}
        <Link to={chapterUrl} className="rounded-xl border border-slate-300 bg-white px-5 inline-flex items-center">
          Zurück zum Kapitel
        </Link>
      </nav>
    </div>
  );
}
