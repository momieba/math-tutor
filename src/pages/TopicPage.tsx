import { ArrowRight, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ProgressRing } from '../components/ProgressRing';
import { ButtonLink } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { nextChapterId } from '../domain/progressView';
import { services } from '../services';
import type { Topic, TopicProgress } from '../types';

/**
 * Thema: Im Vordergrund steht der vorgeschlagene Weg („Weiter lernen“ ins nächste nicht beherrschte Kapitel).
 * Die Kapitelliste ist zugeklappt und dezent: untereinander, mit Status-Ring statt Balken und Zahlen.
 */
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
  const next = topic.subtopics.find((s) => s.id === nextId);
  const started = progress?.subtopics.some((s) => s.status !== 'not_started') ?? false;
  const statusOf = (id: string) => progress?.subtopics.find((p) => p.subtopicId === id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/app" className="text-indigo-700 underline min-h-11 inline-flex items-center text-sm">
        ← Dashboard
      </Link>

      <header className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-sm text-slate-500">
            Klasse {topic.grade} · {topic.area}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">{topic.title}</h1>
          <p className="text-slate-600">{topic.description}</p>
        </div>
        {progress && <ProgressRing score={progress.score} mastered={progress.status === 'mastered'} size={56} />}
      </header>

      {next ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-4" aria-labelledby="next-chapter-heading">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">{started ? 'Weiter lernen' : 'Hier geht’s los'}</p>
          <h2 id="next-chapter-heading" className="text-xl font-semibold">
            Kapitel {next.order} · {next.title}
          </h2>
          <p className="text-slate-600">{next.description}</p>
          <ButtonLink to={`/app/topics/${topic.id}/chapters/${next.id}`} variant="primary" size="lg" icon={<ArrowRight aria-hidden="true" size={20} />}>
            {started ? 'Weiter lernen' : 'Thema starten'}
          </ButtonLink>
        </section>
      ) : (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold">Alle Kapitel sicher beherrscht – stark!</h2>
          <p className="mt-1 text-slate-700">Du kannst jedes Kapitel unten jederzeit wiederholen.</p>
        </section>
      )}

      <details className="rounded-2xl border border-slate-200 bg-white" open={!next}>
        <summary className="cursor-pointer min-h-11 flex items-center px-5 font-medium text-slate-700">Alle Kapitel ansehen ({topic.subtopics.length})</summary>
        <ol className="divide-y divide-slate-100 px-2 pb-2" aria-label="Kapitel">
          {[...topic.subtopics]
            .sort((a, b) => a.order - b.order)
            .map((s) => {
              const p = statusOf(s.id);
              return (
                <li key={s.id}>
                  <Link
                    to={`/app/topics/${topic.id}/chapters/${s.id}`}
                    aria-label={`Kapitel ${s.order}: ${s.title}${s.id === nextId ? ' (empfohlen)' : ''}${p?.status === 'mastered' ? ' (sicher beherrscht)' : ''}`}
                    className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
                  >
                    <span className="w-6 flex-none text-center text-sm font-semibold text-slate-500">{s.order}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-slate-900">{s.title}</span>
                      <span className="block truncate text-sm text-slate-600">{s.description}</span>
                    </span>
                    <ProgressRing score={p?.score ?? 0} mastered={p?.status === 'mastered'} size={40} />
                    <ChevronRight aria-hidden="true" size={18} className="flex-none text-slate-400" />
                  </Link>
                </li>
              );
            })}
        </ol>
      </details>
    </div>
  );
}
