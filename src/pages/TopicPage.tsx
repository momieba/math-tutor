import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { nextChapterId } from '../domain/progressView';
import { services } from '../services';
import type { Topic, TopicProgress } from '../types';

/** Themen-Dashboard: alle Kapitel mit Status, Fortschritt, Score, gelösten/offenen Aufgaben; nächstes Kapitel hervorgehoben. */
export default function TopicPage() {
  const { topicId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const [loaded, setLoaded] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<TopicProgress | null>(null);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    void (async () => {
      const t = await services.content.getTopic(topicId);
      const p = t ? await services.progress.getTopicProgress(userId, topicId).catch(() => null) : null;
      if (!active) return;
      setTopic(t);
      setProgress(p);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [topicId, userId]);

  if (!loaded) return <p className="text-slate-500">Lade Thema …</p>;
  if (!topic) {
    return (
      <div className="space-y-4">
        <p>Dieses Thema gibt es nicht.</p>
        <Link to="/app" className="text-indigo-700 underline min-h-11 inline-flex items-center">
          Zum Dashboard
        </Link>
      </div>
    );
  }

  const nextId = progress ? nextChapterId(topic.subtopics, progress) : topic.subtopics[0]?.id;
  const masteredCount = progress?.subtopics.filter((s) => s.status === 'mastered').length ?? 0;

  return (
    <div className="space-y-6">
      <Link to="/app" className="text-indigo-700 underline min-h-11 inline-flex items-center text-sm">
        ← Dashboard
      </Link>
      <header className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
        <p className="text-sm text-slate-500">
          Klasse {topic.grade} · {topic.area}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold">{topic.title}</h1>
        <p className="text-slate-700">{topic.description}</p>
        {progress && (
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={progress.status} />
            <ScoreBadge score={progress.score} />
            <span className="text-sm text-slate-600">
              {masteredCount} von {topic.subtopics.length} Kapiteln sicher beherrscht
            </span>
          </div>
        )}
        {progress && <ProgressBar value={progress.completion} label="Aufgaben im Thema bearbeitet" />}
      </header>

      <ol className="grid sm:grid-cols-2 gap-4">
        {topic.subtopics.map((s) => {
          const p = progress?.subtopics.find((x) => x.subtopicId === s.id);
          const isNext = s.id === nextId;
          const done = p?.status === 'mastered';
          const open = (p?.totalExercises ?? s.exercises.length) - (p?.solvedExercises ?? 0);
          return (
            <li key={s.id}>
              <Link
                to={`/app/topics/${topic.id}/chapters/${s.id}`}
                aria-label={`Kapitel ${s.order}: ${s.title}${isNext ? ' (empfohlen)' : ''}${done ? ' (abgeschlossen)' : ''}`}
                className={`h-full rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-3 border-2 ${
                  isNext ? 'border-indigo-500 ring-4 ring-indigo-100' : done ? 'border-emerald-300' : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`flex-none w-9 h-9 rounded-full flex items-center justify-center font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                    aria-hidden="true"
                  >
                    {done ? '✓' : s.order}
                  </span>
                  <div className="flex-1">
                    {isNext && <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Als Nächstes empfohlen</p>}
                    <h2 className="font-semibold text-lg leading-snug">{s.title}</h2>
                    <p className="text-sm text-slate-600">{s.description}</p>
                  </div>
                </div>
                {p && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={p.status} />
                      <ScoreBadge score={p.score} compact />
                    </div>
                    <ProgressBar value={p.completion} label="Bearbeitet" />
                    <p className="text-sm text-slate-700">
                      <strong>{p.solvedExercises}</strong> gelöst · <strong>{open}</strong> offen · {p.totalExercises} Aufgaben
                    </p>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
