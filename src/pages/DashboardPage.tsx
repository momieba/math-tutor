import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Todo } from '../components/Placeholder';
import { useAuth } from '../context/AuthContext';
import type { MatchResult } from '../domain/topicMatcher';
import { services } from '../services';
import { CHAPTER_STATUS_LABEL, type TopicProgress, type TopicSummary } from '../types';

/** Schüler-Dashboard: aktive Themen als Kacheln + „Was möchtest du heute lernen?“. Skelett. */
export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const [tiles, setTiles] = useState<{ topic: TopicSummary; progress: TopicProgress }[]>([]);
  const [query, setQuery] = useState('');
  const [match, setMatch] = useState<MatchResult | null>(null);

  const load = useCallback(async () => {
    const [all, active] = await Promise.all([services.content.listTopics(), services.learner.listActiveTopics(userId)]);
    const list = await Promise.all(
      active.map(async (a) => ({ topic: all.find((t) => t.id === a.topicId)!, progress: await services.progress.getTopicProgress(userId, a.topicId) })),
    );
    setTiles(list.filter((t) => t.topic));
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) setMatch(await services.topicMatcher.match(query));
  }

  async function confirm(topicId: string) {
    await services.learner.addActiveTopic(userId, topicId);
    setMatch(null);
    setQuery('');
    await load();
  }

  const candidates = !match ? [] : match.kind === 'match' ? [match.best] : match.kind === 'ambiguous' ? match.candidates : match.suggestions;
  const question =
    match?.kind === 'match'
      ? 'Passendes Thema gefunden:'
      : match?.kind === 'ambiguous'
        ? 'Meintest du eines dieser Themen?'
        : 'Kein passendes Thema gefunden. Diese Themen gibt es:';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hallo {session!.user.displayName}!</h1>
      <form onSubmit={ask} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Was möchtest du heute lernen?"
          aria-label="Was möchtest du heute lernen?"
          className="flex-1 rounded-xl border border-slate-300 px-4"
        />
        <button className="rounded-xl bg-indigo-600 text-white px-5">Finden</button>
      </form>
      {match && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-slate-600">{question}</p>
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => (
              <button key={c.topicId} onClick={() => void confirm(c.topicId)} className="rounded-lg border border-indigo-300 px-4 text-indigo-800">
                {c.title} hinzufügen
              </button>
            ))}
          </div>
        </div>
      )}
      <section className="grid sm:grid-cols-2 gap-4">
        {tiles.map(({ topic, progress }) => (
          <Link key={topic.id} to={`/app/topics/${topic.id}`} className="rounded-2xl bg-white p-5 shadow-sm block">
            <p className="text-xs text-slate-500">
              Klasse {topic.grade} · {topic.area}
            </p>
            <h2 className="text-lg font-semibold">{topic.title}</h2>
            <p className="text-sm mt-2">
              Fortschritt {Math.round(progress.completion * 100)} % · Verständnis {progress.score}/100
            </p>
            <p className="text-sm text-slate-600">{CHAPTER_STATUS_LABEL[progress.status]}</p>
          </Link>
        ))}
        {tiles.length === 0 && <p className="text-slate-500">Noch keine Themen. Schreib oben, was du lernen möchtest.</p>}
      </section>
      <Todo>Kachel-Design mit Fortschrittsbalken, „Zuletzt bearbeitet“, Empfehlung nächster Schritt.</Todo>
    </div>
  );
}
