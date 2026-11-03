import { ArrowRight, BookOpen, Lightbulb, PlayCircle, RotateCcw, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { MathText } from '../components/MathText';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { StepBar } from '../components/StepBar';
import { Button, ButtonLink } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { needsReview, PATH_STEP_LABEL, type PathStep } from '../domain/learningPath';
import { DIFFICULTY_LABEL, EXERCISE_STATUS_LABEL, exerciseState, followingChapter, REQUIREMENT_LABEL, type ExerciseState } from '../domain/progressView';
import { CAP_EXPLANATION, SCORE_CONFIG } from '../domain/score';
import { services } from '../services';
import type { AttemptRecord, Subtopic, SubtopicProgress, Topic } from '../types';
import { markSeen } from './pathStorage';
import { pathFor } from './practice';

const STEP_TEXT: Partial<Record<PathStep, string>> = {
  check: 'Drei kurze Fragen: Sitzt die Formel?',
  starter: 'Drei leichte Aufgaben zum Warmwerden.',
  practice: 'Übe weiter – die Aufgaben passen sich deinem Stand an.',
};

/**
 * Lernkapitel als geführter Lernpfad (domain/learningPath.ts): immer ein Schritt, ein Hauptbutton.
 * Einstieg und Erklärung lassen sich überspringen und über die Schrittleiste erneut öffnen.
 * Score-Erklärung, Zusammenfassung und alle Aufgaben stehen zurückhaltend unter „Mehr zu diesem Kapitel“.
 */
export default function ChapterPage() {
  const { topicId = '', subtopicId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [sub, setSub] = useState<Subtopic | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<SubtopicProgress | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  /** Angezeigter Schritt; `null` ⇒ der aus dem Fortschritt abgeleitete. */
  const [view, setView] = useState<PathStep | null>(null);
  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setView(null);
    void (async () => {
      const found = await services.content.getSubtopic(subtopicId);
      // BUG-07: Kapitel nur unter seinem eigenen Thema anzeigen, sonst „nicht gefunden“.
      const s = found && found.topicId === topicId ? found : null;
      const [p, a, t] = s
        ? await Promise.all([
            services.progress.getSubtopicProgress(userId, s.id).catch(() => null),
            services.learner.listAttempts(userId, { subtopicId: s.id }).catch(() => []),
            services.content.getTopic(s.topicId).catch(() => null),
          ])
        : [null, [], null];
      if (!active) return;
      setSub(s);
      setProgress(p);
      setAttempts(a);
      setTopic(t);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [topicId, subtopicId, userId]);

  if (!loaded) return <p className="text-slate-500">Lade Kapitel …</p>;
  if (!sub) {
    return (
      <div className="space-y-4">
        <p>Dieses Kapitel gibt es nicht.</p>
        <Link to="/app" className="text-indigo-700 underline min-h-11 inline-flex items-center">
          Zum Dashboard
        </Link>
      </div>
    );
  }

  const chapter = sub;
  const score = progress?.score ?? 0;
  const path = pathFor(userId, chapter, attempts, score);
  const step = view ?? path.step;
  const nextChapter = topic ? followingChapter(topic.subtopics, chapter.id) : undefined;
  const review = (path.step === 'starter' || path.step === 'practice') && needsReview(attempts);
  const video = chapter.materials.find((m) => m.kind === 'video');
  const exerciseUrl = path.exercise ? `/app/exercises/${path.exercise.id}` : null;

  function open(s: 'intro' | 'explain') {
    setView(s);
    setRevealed(1);
  }
  function finishIntro() {
    markSeen(userId, chapter.id, { intro: true });
    setView('explain');
  }
  function skipToPractice() {
    markSeen(userId, chapter.id, { intro: true, explain: true });
    const next = pathFor(userId, chapter, attempts, score);
    if (next.exercise) navigate(`/app/exercises/${next.exercise.id}`);
    else setView(null);
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6 pb-12">
      <Link to={`/app/topics/${chapter.topicId}`} className="text-indigo-700 underline min-h-11 inline-flex items-center text-sm">
        ← {topic?.title ?? 'Zum Thema'}
      </Link>

      <header className="space-y-1">
        <p className="text-sm text-slate-500">Kapitel {chapter.order}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">{chapter.title}</h1>
      </header>

      <StepBar current={step} onOpen={open} />

      {review && step !== 'intro' && step !== 'explain' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3" role="status">
          <p className="flex gap-3">
            <Lightbulb aria-hidden="true" size={22} className="flex-none text-amber-700" />
            <span>Gerade läuft es noch nicht so rund. Schau dir die Erklärung {video ? 'oder das Video ' : ''}nochmal an – danach geht es leichter.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<BookOpen aria-hidden="true" size={20} />} onClick={() => open('explain')}>
              Erklärung ansehen
            </Button>
            {video && (
              <Button variant="ghost" icon={<PlayCircle aria-hidden="true" size={20} />} onClick={() => open('intro')}>
                Video ansehen
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 'intro' && (
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-5" aria-labelledby="step-heading">
          <h2 id="step-heading" className="text-xl font-semibold">
            {PATH_STEP_LABEL.intro}
          </h2>
          <p className="rounded-xl bg-indigo-50 p-4">
            <strong>Das lernst du:</strong> <MathText text={chapter.objective} />
          </p>
          {video && (
            <div className="aspect-video rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-600 text-center p-4 gap-1">
              <PlayCircle aria-hidden="true" size={40} />
              {video.url ? (
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {video.title}
                </a>
              ) : (
                <>
                  <span className="font-medium">{video.title}</span>
                  <span className="text-sm">Video folgt{video.durationSec ? ` (ca. ${Math.round(video.durationSec / 60)} Min.)` : ''}</span>
                </>
              )}
            </div>
          )}
          <p className="leading-relaxed">
            <MathText text={chapter.intro} />
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />} onClick={finishIntro}>
              Weiter zur Erklärung
            </Button>
            <button type="button" onClick={skipToPractice} className="min-h-11 px-2 text-indigo-700 underline underline-offset-2">
              Kenne ich schon – überspringen
            </button>
          </div>
        </section>
      )}

      {step === 'explain' && (
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-5" aria-labelledby="step-heading">
          <h2 id="step-heading" className="text-xl font-semibold">
            {PATH_STEP_LABEL.explain}
          </h2>
          <ul className="space-y-3">
            {chapter.rules.map((r) => (
              <li key={r.term} className="rounded-xl border border-slate-200 p-4">
                <strong>
                  <MathText text={r.term} />
                </strong>
                {r.explanation && (
                  <>
                    : <MathText text={r.explanation} />
                  </>
                )}
                {r.math && (
                  <div className="overflow-x-auto">
                    <MathText text={r.math} display />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-slate-50 p-4 space-y-3">
            <h3 className="font-semibold">Beispiel</h3>
            <p>
              <MathText text={chapter.example.problem} />
            </p>
            <ol className="list-decimal ml-6 space-y-2">
              {chapter.example.steps.slice(0, revealed).map((s, i) => (
                <li key={i} className="animate-slide-up">
                  <MathText text={s.text} />
                  {s.math && (
                    <div className="overflow-x-auto">
                      <MathText text={s.math} display />
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {revealed < chapter.example.steps.length ? (
              <Button variant="secondary" onClick={() => setRevealed((n) => n + 1)}>
                Nächster Schritt
              </Button>
            ) : (
              <p className="rounded-lg bg-emerald-50 p-3 font-medium">
                <MathText text={chapter.example.result} />
              </p>
            )}
          </div>
          <Button variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />} onClick={skipToPractice}>
            Weiter zum Formel-Check
          </Button>
        </section>
      )}

      {(step === 'check' || step === 'starter' || step === 'practice') && (
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-4" aria-labelledby="step-heading">
          <h2 id="step-heading" className="text-xl font-semibold">
            {PATH_STEP_LABEL[step]}
          </h2>
          <p className="text-slate-700">{STEP_TEXT[step]}</p>
          {exerciseUrl && (
            <ButtonLink to={exerciseUrl} variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />}>
              {attempts.length ? 'Weiter üben' : 'Los geht’s'}
            </ButtonLink>
          )}
        </section>
      )}

      {step === 'done' && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4" aria-labelledby="step-heading">
          <h2 id="step-heading" className="flex items-center gap-2 text-xl font-semibold">
            <Trophy aria-hidden="true" size={24} className="text-emerald-700" /> Geschafft!
          </h2>
          <p>Du beherrschst dieses Kapitel sicher. Das Wichtigste in Kürze:</p>
          <ul className="list-disc ml-6 space-y-1">
            {chapter.summary.map((s) => (
              <li key={s}>
                <MathText text={s} />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {nextChapter && (
              <ButtonLink to={`/app/topics/${nextChapter.topicId}/chapters/${nextChapter.id}`} variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />}>
                Weiter mit „{nextChapter.title}“
              </ButtonLink>
            )}
            {exerciseUrl && (
              <ButtonLink to={exerciseUrl} variant={nextChapter ? 'ghost' : 'primary'} icon={<RotateCcw aria-hidden="true" size={20} />}>
                Weiter üben
              </ButtonLink>
            )}
          </div>
        </section>
      )}

      <MoreAboutChapter chapter={chapter} progress={progress} attempts={attempts} />
    </article>
  );
}

/** Zurückhaltender Bereich für Neugierige, Eltern und Lehrkräfte: Stand, Zusammenfassung, alle Aufgaben. */
function MoreAboutChapter({ chapter, progress, attempts }: { chapter: Subtopic; progress: SubtopicProgress | null; attempts: AttemptRecord[] }) {
  const states = new Map<string, ExerciseState>(chapter.exercises.map((e) => [e.id, exerciseState(attempts.filter((a) => a.exerciseId === e.id))]));
  return (
    <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer min-h-11 flex items-center px-5 font-medium text-slate-700">Mehr zu diesem Kapitel</summary>
      <div className="space-y-6 px-5 pb-5">
        {progress && (
          <section className="space-y-2" aria-labelledby="score-heading">
            <h3 id="score-heading" className="font-semibold">
              Dein Stand
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={progress.status} />
              <ScoreBadge score={progress.score} />
            </div>
            <p className="text-sm text-slate-700">
              {Math.round(SCORE_CONFIG.masteryWeight * 100)} % zählt, wie sicher du deine letzten {SCORE_CONFIG.windowSize} Aufgaben gelöst hast (für die volle
              Punktzahl braucht es etwa 8 Aufgaben), {Math.round(SCORE_CONFIG.coverageWeight * 100)} %, wie viele Aufgabenarten du sicher beherrschst.
            </p>
            {progress.caps.length > 0 && (
              <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
                {progress.caps.map((c) => (
                  <li key={c}>{CAP_EXPLANATION[c]}</li>
                ))}
              </ul>
            )}
          </section>
        )}
        <section className="space-y-2">
          <h3 className="font-semibold">Zusammenfassung</h3>
          <ul className="list-disc ml-5 space-y-1">
            {chapter.summary.map((s) => (
              <li key={s}>
                <MathText text={s} />
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2">
          <h3 className="font-semibold">Alle Aufgaben ({chapter.exercises.length})</h3>
          <ul className="space-y-1">
            {chapter.exercises.map((e, i) => {
              const st = states.get(e.id)!;
              return (
                <li key={e.id}>
                  <Link to={`/app/exercises/${e.id}`} className="flex min-h-11 flex-wrap items-center gap-3 rounded-lg px-3 hover:bg-slate-50">
                    <span className="font-medium">Aufgabe {i + 1}</span>
                    <span className="flex-1 min-w-40 text-sm text-slate-600">
                      {REQUIREMENT_LABEL[e.requirement]} · {DIFFICULTY_LABEL[e.difficulty]}
                    </span>
                    <span className="text-sm text-slate-600">{EXERCISE_STATUS_LABEL[st.status]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </details>
  );
}
