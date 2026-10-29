import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { MathText } from '../components/MathText';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { DIFFICULTY_LABEL, EXERCISE_STATUS_LABEL, EXERCISE_TYPE_LABEL, exerciseState, type ExerciseState, type ExerciseStatus } from '../domain/progressView';
import { CAP_EXPLANATION, SCORE_CONFIG } from '../domain/score';
import { services } from '../services';
import type { AttemptRecord, Subtopic, SubtopicProgress } from '../types';

const EX_STATUS_STYLE: Record<ExerciseStatus, { cls: string; icon: string }> = {
  open: { cls: 'bg-slate-100 text-slate-700', icon: '○' },
  practiced: { cls: 'bg-amber-100 text-amber-900', icon: '◐' },
  solved: { cls: 'bg-emerald-100 text-emerald-800', icon: '✓' },
};

/** Lernkapitel: Lernziel, Einführung, Regeln, Video-Platzhalter, Beispiel, Aufgaben mit Status, Score-Erklärung, Zusammenfassung. */
export default function ChapterPage() {
  const { topicId = '', subtopicId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const [loaded, setLoaded] = useState(false);
  const [sub, setSub] = useState<Subtopic | null>(null);
  const [progress, setProgress] = useState<SubtopicProgress | null>(null);
  const [states, setStates] = useState<Map<string, ExerciseState>>(new Map());

  useEffect(() => {
    let active = true;
    setLoaded(false);
    void (async () => {
      const s = await services.content.getSubtopic(subtopicId);
      let p: SubtopicProgress | null = null;
      let attempts: AttemptRecord[] = [];
      if (s) {
        [p, attempts] = await Promise.all([
          services.progress.getSubtopicProgress(userId, s.id).catch(() => null),
          services.learner.listAttempts(userId, { subtopicId: s.id }).catch(() => []),
        ]);
      }
      if (!active) return;
      setSub(s);
      setProgress(p);
      setStates(new Map((s?.exercises ?? []).map((e) => [e.id, exerciseState(attempts.filter((a) => a.exerciseId === e.id))])));
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [subtopicId, userId]);

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

  const firstOpen = sub.exercises.find((e) => states.get(e.id)?.status !== 'solved') ?? sub.exercises[0];

  return (
    <article className="space-y-8 pb-12">
      <Link to={`/app/topics/${topicId || sub.topicId}`} className="text-indigo-700 underline min-h-11 inline-flex items-center text-sm">
        ← Zum Thema
      </Link>

      <header className="space-y-3">
        <p className="text-sm text-slate-500">Kapitel {sub.order}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">{sub.title}</h1>
        <p className="rounded-2xl bg-indigo-50 p-4">
          <strong>Lernziel:</strong> <MathText text={sub.objective} />
        </p>
      </header>

      {progress && (
        <section className="rounded-2xl bg-white p-5 shadow-sm space-y-3" aria-labelledby="score-heading">
          <h2 id="score-heading" className="text-lg font-semibold">
            Dein Stand in diesem Kapitel
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={progress.status} />
            <ScoreBadge score={progress.score} />
          </div>
          <ProgressBar value={progress.completion} label={`${progress.attemptedExercises} von ${progress.totalExercises} Aufgaben bearbeitet`} />
          <details className="rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer min-h-11 flex items-center font-medium">Wie entsteht mein Score?</summary>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <p>
                {Math.round(SCORE_CONFIG.masteryWeight * 100)} % zählt, wie sicher du die Aufgaben löst (schwerere Aufgaben zählen mehr, Hinweise verringern die
                Punkte): <strong>{Math.round(progress.components.mastery * 100)} %</strong>.
              </p>
              <p>
                {Math.round(SCORE_CONFIG.coverageWeight * 100)} % zählt, wie viele Aufgabentypen du sicher beherrschst:{' '}
                <strong>{Math.round(progress.components.typeCoverage * 100)} %</strong>.
              </p>
              {progress.caps.length > 0 ? (
                <>
                  <p className="font-medium">So kannst du deinen Score weiter steigern:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {progress.caps.map((c) => (
                      <li key={c}>{CAP_EXPLANATION[c]}</li>
                    ))}
                  </ul>
                </>
              ) : (
                progress.attemptedExercises > 0 && <p>Keine Obergrenze aktiv – dein Score spiegelt deine Leistung voll wider.</p>
              )}
            </div>
          </details>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold text-xl">Einführung</h2>
        <p className="leading-relaxed">
          <MathText text={sub.intro} />
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-xl">Begriffe und Regeln</h2>
        <ul className="space-y-3 mt-2">
          {sub.rules.map((r) => (
            <li key={r.term} className="rounded-xl bg-white p-4 shadow-sm">
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
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-xl">Video</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {sub.materials
            .filter((m) => m.kind === 'video')
            .map((m) => (
              <div key={m.id} className="aspect-video rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-600 text-center p-4 gap-1">
                <span className="text-4xl" aria-hidden="true">
                  ▶
                </span>
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {m.title}
                  </a>
                ) : (
                  <>
                    <span className="font-medium">{m.title}</span>
                    <span className="text-sm">Video folgt{m.durationSec ? ` (ca. ${Math.round(m.durationSec / 60)} Min.)` : ''}</span>
                  </>
                )}
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-xl">Beispiel</h2>
        <p className="mt-2">
          <MathText text={sub.example.problem} />
        </p>
        <ol className="list-decimal ml-6 mt-3 space-y-2">
          {sub.example.steps.map((s, i) => (
            <li key={i}>
              <MathText text={s.text} />
              {s.math && (
                <div className="overflow-x-auto">
                  <MathText text={s.math} display />
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 font-medium rounded-xl bg-emerald-50 p-3">
          <MathText text={sub.example.result} />
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-semibold text-xl flex-1">Übungsaufgaben</h2>
          {firstOpen && (
            <Link to={`/app/exercises/${firstOpen.id}`} className="rounded-xl bg-indigo-600 text-white px-5 font-semibold inline-flex items-center">
              {states.get(firstOpen.id)?.status === 'open' && firstOpen === sub.exercises[0] ? 'Üben starten' : 'Weiter üben'}
            </Link>
          )}
        </div>
        <ul className="space-y-2">
          {sub.exercises.map((e, i) => {
            const st = states.get(e.id) ?? { status: 'open' as const, credit: 0, attemptCount: 0 };
            const style = EX_STATUS_STYLE[st.status];
            return (
              <li key={e.id}>
                <Link to={`/app/exercises/${e.id}`} className="rounded-xl bg-white p-4 shadow-sm flex flex-wrap items-center gap-3">
                  <span className="font-semibold">Aufgabe {i + 1}</span>
                  <span className="text-sm text-slate-600 flex-1 min-w-40">
                    {EXERCISE_TYPE_LABEL[e.type]} · {DIFFICULTY_LABEL[e.difficulty]}
                    {st.attemptCount > 0 && ` · ${st.attemptCount} Versuch${st.attemptCount === 1 ? '' : 'e'}`}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${style.cls}`}>
                    <span aria-hidden="true">{style.icon}</span>
                    {EXERCISE_STATUS_LABEL[st.status]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-xl">Zusammenfassung</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          {sub.summary.map((s) => (
            <li key={s}>
              <MathText text={s} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
