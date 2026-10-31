import { ArrowLeft, Eye, Gauge, Lightbulb, PenLine, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { ChoiceInput, MathInput, NumericInput } from '../components/AnswerInputs';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { compactStrokes, emptyHistory, historyFromStrokes, isBlank, isStrokeList, visibleStrokes, type CanvasHistory } from '../components/handwriting/canvasModel';
import { HandwritingCanvas } from '../components/handwriting/HandwritingCanvas';
import { exportStrokesAsPng } from '../components/handwriting/renderStrokes';
import { MathText } from '../components/MathText';
import { ScoreBadge } from '../components/ScoreBadge';
import { SolutionView } from '../components/SolutionView';
import { StatusBadge } from '../components/StatusBadge';
import { Button, ButtonLink, Dialog, EmptyState, Skeleton, Tag, useToast } from '../components/ui';
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

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Aufgabe bearbeiten (Fokus-Modus): Eingabe je Typ, gestufte Hinweise, „Lösung anzeigen“, Abgabe, Feedback, Musterlösung.
 * Abgabe: evaluate.ts (deterministisch) → services.attempts.submit (speichert, sonst Entwurf + erneuter Versuch).
 */
export default function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const toast = useToast();

  const [loaded, setLoaded] = useState(false);
  const [ex, setEx] = useState<Exercise | null>(null);
  const [sub, setSub] = useState<Subtopic | null>(null);
  /** Themenname für die Brotkrumen (UX-07); `null` ⇒ neutrales „Thema“. */
  const [topicTitle, setTopicTitle] = useState<string | null>(null);
  const [previousCount, setPreviousCount] = useState(0);
  const [pending, setPending] = useState<PendingAttempt | null>(null);
  /** Kapitel-Score vor der Abgabe, um nach der Abgabe die Veränderung zu zeigen („62 → 66“). */
  const [scoreBefore, setScoreBefore] = useState<number | null>(null);

  const [answer, setAnswer] = useState('');
  const [drawing, setDrawing] = useState<CanvasHistory>(emptyHistory);
  const [hintsUsed, setHintsUsed] = useState<0 | 1 | 2 | 3>(0);
  const [solutionViewed, setSolutionViewed] = useState(false);
  const [confirmSolution, setConfirmSolution] = useState(false);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [notice, setNotice] = useState<EvaluationResult | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'answering' });
  const [chapterProgress, setChapterProgress] = useState<SubtopicProgress | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
    setScoreBefore(null);
    void (async () => {
      const e = await services.content.getExercise(exerciseId);
      const s = e ? await services.content.getSubtopic(e.subtopicId) : null;
      const [draft, previous, topic, before] = e
        ? await Promise.all([
            services.attempts.getPending(userId, e.id),
            services.learner.listAttempts(userId, { exerciseId: e.id }).catch(() => []),
            s ? services.content.getTopic(s.topicId).catch(() => null) : null,
            s ? services.progress.getSubtopicProgress(userId, s.id).catch(() => null) : null,
          ])
        : [null, [], null, null];
      if (!active) return;
      setEx(e);
      setSub(s);
      setTopicTitle(topic?.title ?? null);
      setPreviousCount(previous.length);
      setScoreBefore(before?.score ?? null);
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

  // Nach der Abgabe die Rückmeldung in den Blick holen (ohne Animation, wenn reduzierte Bewegung gewünscht ist).
  useEffect(() => {
    const target = phase.kind === 'saved' ? resultRef.current : notice ? noticeRef.current : null;
    target?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }, [phase.kind, notice]);

  if (!loaded) {
    return (
      <div className="space-y-6" role="status">
        <span className="sr-only">Lade Aufgabe …</span>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }
  if (!ex || !sub) {
    return (
      <EmptyState icon={<TriangleAlert size={24} />} title="Diese Aufgabe gibt es nicht." action={<ButtonLink to="/app" variant="primary">Zum Dashboard</ButtonLink>}>
        Vielleicht wurde sie verschoben. Auf dem Dashboard findest du deine Themen.
      </EmptyState>
    );
  }

  const exercise = ex;
  const chapter = sub;
  const index = chapter.exercises.findIndex((e) => e.id === exercise.id);
  const total = chapter.exercises.length;
  const next = chapter.exercises[index + 1];
  const chapterUrl = `/app/topics/${chapter.topicId}/chapters/${chapter.id}`;
  const locked = phase.kind !== 'answering';
  const isHandwriting = exercise.type === 'handwriting';
  const unit = exercise.answer.kind === 'numeric' ? exercise.answer.unit : undefined;
  const saved = phase.kind === 'saved';

  async function send(input: NewAttemptInput, evaluation: EvaluationResult) {
    setPhase({ kind: 'saving' });
    const result = await services.attempts.submit(input);
    if (result.ok) {
      setPending(null);
      setPreviousCount((n) => n + 1);
      setPhase({ kind: 'saved', record: result.record, evaluation });
      toast('Lösung gespeichert');
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
  const showSolution = solutionViewed || saved;
  const hintPenalty = Math.round(SCORE_CONFIG.hintPenaltyPerHint * 100);
  const solutionShare = Math.round(SCORE_CONFIG.solutionViewedFactor * 100);

  return (
    <div className={`mx-auto space-y-6 pb-16 ${isHandwriting ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <Breadcrumbs
        items={[
          { label: topicTitle ?? 'Thema', to: `/app/topics/${chapter.topicId}` },
          { label: chapter.title, to: chapterUrl },
          { label: `Aufgabe ${index + 1} von ${total}` },
        ]}
      />

      {/* Fortschritt im Kapitel: ein Segment pro Aufgabe */}
      <div className="flex gap-1" aria-hidden="true">
        {chapter.exercises.map((e, i) => (
          <span key={e.id} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-indigo-300' : i === index ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {pending && phase.kind === 'answering' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4 animate-slide-up" role="alert">
          <p className="flex gap-3">
            <TriangleAlert aria-hidden="true" size={24} className="flex-none text-amber-700" />
            <span>
              <strong>Nicht gespeicherte Abgabe gefunden</strong> vom {new Date(pending.savedAt).toLocaleString('de-DE')}.
              {pending.imageDropped && ' Das Bild deines Rechenwegs konnte nicht mitgesichert werden.'} Deine Eingaben wurden wiederhergestellt.
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" icon={<Send aria-hidden="true" size={20} />} onClick={() => void send(pending.input, toEvaluation(pending.input.correction))}>
              Jetzt erneut senden
            </Button>
            <Button variant="ghost" onClick={() => void discardDraft()}>
              Verwerfen
            </Button>
          </div>
        </div>
      )}

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag icon={isHandwriting ? <PenLine aria-hidden="true" size={16} /> : undefined}>{EXERCISE_TYPE_LABEL[exercise.type]}</Tag>
          <Tag icon={<Gauge aria-hidden="true" size={16} />}>{DIFFICULTY_LABEL[exercise.difficulty]}</Tag>
          {previousCount > 0 && (
            <span className="text-sm text-slate-600">
              bisher {previousCount} Versuch{previousCount === 1 ? '' : 'e'}
            </span>
          )}
        </div>
        <h1 className="text-2xl leading-relaxed font-semibold text-slate-900">
          <MathText text={exercise.prompt} />
        </h1>
        {exercise.figure && <p className="text-sm text-slate-600 italic">Abbildung: {exercise.figure.alt}</p>}
      </header>

      <section className="space-y-4" aria-label="Deine Lösung">
        {isHandwriting && (
          <div className="space-y-2">
            <p className="text-slate-600">Schreibe deinen Rechenweg mit Stift oder Finger auf das Kästchenpapier.</p>
            <HandwritingCanvas history={drawing} onChange={setDrawing} disabled={locked} />
          </div>
        )}
        {exercise.type === 'multiple-choice' ? answerField : <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">{answerField}</div>}

        <div ref={noticeRef} className="scroll-mt-24">
          {notice && <FeedbackPanel verdict={notice.verdict} points={0} feedback={notice.feedback} marks={notice.marks} />}
        </div>

        {(phase.kind === 'answering' || phase.kind === 'saving') && (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {phase.kind === 'saving' && (
              <p className="text-slate-600" role="status">
                Speichere deine Lösung …
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={submit}
              disabled={!canSubmit}
              loading={phase.kind === 'saving'}
              icon={<Send aria-hidden="true" size={20} />}
              className="w-full sm:w-auto"
            >
              Aufgabe abgeben
            </Button>
          </div>
        )}
      </section>

      {phase.kind === 'failed' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-3" role="alert">
          <p>
            <strong>Speichern fehlgeschlagen:</strong> {phase.error}
          </p>
          <p>
            {phase.draftSaved
              ? `Deine Lösung ist als Entwurf auf diesem Gerät gesichert${phase.imageDropped ? ' (ohne Bild des Rechenwegs)' : ''}. Du kannst es später erneut versuchen.`
              : 'Deine Lösung konnte nicht als Entwurf gesichert werden. Bitte lass diese Seite geöffnet und versuche es erneut.'}
          </p>
          <Button variant="danger" icon={<RotateCcw aria-hidden="true" size={20} />} onClick={() => void send(phase.input, phase.evaluation)}>
            Erneut versuchen
          </Button>
        </div>
      )}

      {shownEvaluation && (
        <div ref={resultRef} className="scroll-mt-24 space-y-4">
          <FeedbackPanel
            verdict={shownEvaluation.verdict}
            points={shownEvaluation.points}
            feedback={shownEvaluation.feedback}
            marks={shownEvaluation.marks}
            mistake={shownEvaluation.mistake}
            commonMistakes={exercise.commonMistakes}
          />
          {saved && (chapterProgress || hintsUsed > 0 || solutionViewed) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              {chapterProgress && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">Kapitel „{chapter.title}“:</span>
                  {scoreBefore !== null && scoreBefore !== chapterProgress.score && (
                    <span className="tabular-nums text-slate-600" aria-label={`Score vorher ${scoreBefore}, jetzt ${chapterProgress.score}`}>
                      {scoreBefore} → {chapterProgress.score}
                    </span>
                  )}
                  <ScoreBadge score={chapterProgress.score} />
                  <StatusBadge status={chapterProgress.status} />
                </div>
              )}
              {(hintsUsed > 0 || solutionViewed) && (
                <p className="text-sm text-slate-600">
                  Für den Verständnis-Score zählt diese Abgabe{' '}
                  {solutionViewed
                    ? `${solutionShare} %, weil du die Lösung vorher angesehen hast.`
                    : `${Math.round((1 - SCORE_CONFIG.hintPenaltyPerHint * hintsUsed) * 100)} %, weil du ${hintsUsed} Hinweis${hintsUsed === 1 ? '' : 'e'} genutzt hast.`}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!saved && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" aria-labelledby="hints-heading">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-800" aria-hidden="true">
              <Lightbulb size={20} />
            </span>
            <h2 id="hints-heading" className="text-xl font-semibold">
              Hinweise
            </h2>
          </div>
          {hintsUsed > 0 && (
            <ol className="space-y-2">
              {exercise.hints.slice(0, hintsUsed).map((h, i) => (
                <li key={i} className="rounded-lg border border-sky-200 bg-sky-50 p-4 animate-slide-up">
                  <strong className="text-sky-800">Hinweis {i + 1}:</strong> <MathText text={h} />
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<Lightbulb aria-hidden="true" size={20} />}
              onClick={() => setHintsUsed((n) => clampHints(n + 1))}
              disabled={hintsUsed >= 3 || solutionViewed || locked}
            >
              {hintsUsed >= 3 ? 'Alle Hinweise genutzt' : `Hinweis ${hintsUsed + 1} von 3`}
            </Button>
            {!solutionViewed && (
              <Button variant="ghost" icon={<Eye aria-hidden="true" size={20} />} onClick={() => setConfirmSolution(true)} disabled={locked}>
                Lösung anzeigen
              </Button>
            )}
          </div>
          <p className="text-sm text-slate-600">
            Hinweise kosten ein paar Punkte ({hintPenalty} % pro Hinweis), helfen aber beim Lernen. Hauptsache, du verstehst es.
          </p>
        </section>
      )}

      <Dialog
        open={confirmSolution && !solutionViewed}
        title="Lösung jetzt anzeigen?"
        icon={<Eye size={22} />}
        onClose={() => setConfirmSolution(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmSolution(false)}>
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSolutionViewed(true);
                setConfirmSolution(false);
              }}
            >
              Ja, Lösung zeigen
            </Button>
          </>
        }
      >
        <p>
          Wenn du die Lösung jetzt ansiehst, zählt diese Aufgabe nur noch {solutionShare} % für deinen Score. Probier vorher ruhig einen Hinweis.
        </p>
      </Dialog>

      {showSolution && <SolutionView key={exercise.id} solution={exercise.solution} stepwise />}

      <nav className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6" aria-label="Weiter">
        {saved && (
          <Button variant="ghost" icon={<RotateCcw aria-hidden="true" size={20} />} onClick={resetForm}>
            Nochmal versuchen
          </Button>
        )}
        <ButtonLink to={chapterUrl} variant={saved && !next ? 'primary' : 'secondary'} icon={<ArrowLeft aria-hidden="true" size={20} />}>
          Zurück zum Kapitel
        </ButtonLink>
        {next && (
          <ButtonLink
            to={`/app/exercises/${next.id}`}
            variant={saved ? 'primary' : 'ghost'}
            className="sm:ml-auto"
          >
            Nächste Aufgabe →
          </ButtonLink>
        )}
      </nav>
    </div>
  );
}
