import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { recommendNext, VERDICT_LABEL, type Recommendation } from '../domain/progressView';
import type { MatchCandidate, MatchResult } from '../domain/topicMatcher';
import { services } from '../services';
import type { AttemptRecord, TopicProgress, TopicSummary } from '../types';
import { resolveAttemptContexts, type AttemptContext } from './attemptLabels';

interface Tile {
  topic: TopicSummary;
  progress: TopicProgress;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

/** Schüler-Dashboard: Begrüßung, „Was möchtest du heute lernen?“, Empfehlung, Themenkacheln, zuletzt bearbeitet. */
export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const navigate = useNavigate();

  const [allTopics, setAllTopics] = useState<TopicSummary[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [recent, setRecent] = useState<AttemptRecord[]>([]);
  const [recentCtx, setRecentCtx] = useState<Map<string, AttemptContext>>(new Map());
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [chapterTitles, setChapterTitles] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [all, active, last] = await Promise.all([
        services.content.listTopics(),
        services.learner.listActiveTopics(userId),
        services.learner.listAttempts(userId, { limit: 5 }),
      ]);
      const entries = await Promise.all(
        active.map(async (a) => {
          const [topic, progress] = await Promise.all([services.content.getTopic(a.topicId), services.progress.getTopicProgress(userId, a.topicId)]);
          return topic ? { topic, progress } : null;
        }),
      );
      const valid = entries.filter((e): e is NonNullable<typeof e> => e !== null);
      setAllTopics(all);
      setTiles(valid.flatMap(({ topic, progress }) => {
        const summary = all.find((t) => t.id === topic.id);
        return summary ? [{ topic: summary, progress }] : [];
      }));
      setRecommendation(recommendNext(valid.map(({ topic, progress }) => ({ topicId: topic.id, topicTitle: topic.title, subtopics: topic.subtopics, progress }))));
      setRecent(last);
      setRecentCtx(await resolveAttemptContexts(last));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setShowAll(false);
    const result = await services.topicMatcher.match(query);
    const withChapter = result.kind === 'match' ? [result.best] : result.kind === 'ambiguous' ? result.candidates : [];
    const titles = await Promise.all(
      withChapter.filter((c) => c.subtopicId).map(async (c) => [c.subtopicId!, (await services.content.getSubtopic(c.subtopicId!))?.title ?? ''] as const),
    );
    setChapterTitles(Object.fromEntries(titles));
    setMatch(result);
  }

  async function confirm(c: MatchCandidate, openChapter: boolean) {
    try {
      await services.learner.addActiveTopic(userId, c.topicId);
      setMatch(null);
      setQuery('');
      if (openChapter && c.subtopicId) navigate(`/app/topics/${c.topicId}/chapters/${c.subtopicId}`);
      else await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thema konnte nicht hinzugefügt werden.');
    }
  }

  const activeIds = new Set(tiles.map((t) => t.topic.id));
  const totalAttempted = tiles.reduce((n, t) => n + t.progress.subtopics.reduce((m, s) => m + s.attemptedExercises, 0), 0);

  const candidates: MatchCandidate[] = !match
    ? []
    : showAll
      ? allTopics.map((t) => ({ topicId: t.id, title: t.title, score: 0 }))
      : match.kind === 'match'
        ? [match.best]
        : match.kind === 'ambiguous'
          ? match.candidates
          : match.suggestions;
  const question = showAll
    ? 'Alle Themen aus dem Lehrplan:'
    : match?.kind === 'match'
      ? 'Passt dieses Thema?'
      : match?.kind === 'ambiguous'
        ? 'Das passt zu mehreren Themen. Welches meinst du?'
        : 'Dazu habe ich kein passendes Thema im Lehrplan gefunden. Meinst du eines dieser Themen? Du kannst deine Frage auch anders formulieren.';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">Hallo {session!.user.displayName}!</h1>
        {!loading && (
          <p className="text-slate-600 mt-1">
            {tiles.length === 0
              ? 'Leg los: Schreib einfach, was du heute lernen möchtest.'
              : `Du hast ${tiles.length} ${tiles.length === 1 ? 'Thema' : 'Themen'} aktiv und ${totalAttempted} ${totalAttempted === 1 ? 'Aufgabe' : 'Aufgaben'} bearbeitet.`}
          </p>
        )}
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-800">
          {error}
        </p>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm space-y-4" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="text-lg font-semibold">
          Was möchtest du heute lernen?
        </h2>
        <form onSubmit={ask} className="flex flex-col sm:flex-row gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. „Ich möchte den Satz des Pythagoras verstehen.“"
            aria-label="Was möchtest du heute lernen?"
            maxLength={200}
            className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none"
          />
          <button className="rounded-xl bg-indigo-600 text-white px-6 font-semibold disabled:opacity-40" disabled={!query.trim()}>
            Thema finden
          </button>
        </form>
        {match && (
          <div className="rounded-xl bg-indigo-50 p-4 space-y-3" aria-live="polite">
            <p className="font-medium">{question}</p>
            <ul className="space-y-2">
              {candidates.map((c) => {
                const t = allTopics.find((x) => x.id === c.topicId);
                const already = activeIds.has(c.topicId);
                const chapterTitle = !showAll && c.subtopicId ? chapterTitles[c.subtopicId] : undefined;
                return (
                  <li key={c.topicId} className="rounded-xl bg-white p-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-48">
                      <p className="font-semibold">{c.title}</p>
                      {t && (
                        <p className="text-sm text-slate-600">
                          Klasse {t.grade} · {t.area} · {t.subtopicCount} Kapitel
                        </p>
                      )}
                      {chapterTitle && <p className="text-sm text-indigo-800">Passendes Kapitel: {chapterTitle}</p>}
                    </div>
                    {already ? (
                      <Link to={`/app/topics/${c.topicId}`} className="rounded-xl border border-indigo-300 px-4 inline-flex items-center text-indigo-800">
                        Schon aktiv – öffnen
                      </Link>
                    ) : (
                      <button type="button" onClick={() => void confirm(c, false)} className="rounded-xl bg-indigo-600 text-white px-4 font-medium">
                        Thema hinzufügen
                      </button>
                    )}
                    {chapterTitle && (
                      <button type="button" onClick={() => void confirm(c, true)} className="rounded-xl border border-indigo-300 bg-white px-4 text-indigo-800">
                        Direkt zum passenden Kapitel
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2">
              {!showAll && (
                <button type="button" onClick={() => setShowAll(true)} className="rounded-xl border border-slate-300 bg-white px-4 text-slate-700">
                  Alle Themen zeigen
                </button>
              )}
              <button type="button" onClick={() => setMatch(null)} className="rounded-xl px-4 text-slate-600 underline">
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>

      {recommendation && (
        <section className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5 flex flex-wrap items-center gap-4" aria-labelledby="next-heading">
          <div className="flex-1 min-w-56">
            <h2 id="next-heading" className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Empfohlener nächster Schritt · {recommendation.reason}
            </h2>
            <p className="text-lg font-semibold mt-1">{recommendation.subtopicTitle}</p>
            <p className="text-sm text-slate-600">{recommendation.topicTitle}</p>
          </div>
          <StatusBadge status={recommendation.status} />
          <Link
            to={`/app/topics/${recommendation.topicId}/chapters/${recommendation.subtopicId}`}
            className="rounded-xl bg-indigo-600 text-white px-6 font-semibold inline-flex items-center"
          >
            Kapitel öffnen
          </Link>
        </section>
      )}

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-xl font-semibold mb-3">
          Deine Themen
        </h2>
        {loading && <p className="text-slate-500">Lade …</p>}
        {!loading && tiles.length === 0 && <p className="text-slate-500">Noch keine Themen. Schreib oben, was du lernen möchtest.</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {tiles.map(({ topic, progress }) => (
            <article key={topic.id} className="rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm text-slate-500">
                    Klasse {topic.grade} · {topic.area}
                  </p>
                  <h3 className="text-lg font-semibold">{topic.title}</h3>
                </div>
                <StatusBadge status={progress.status} />
              </div>
              <ProgressBar value={progress.completion} label="Aufgaben bearbeitet" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Verständnis:</span>
                <ScoreBadge score={progress.score} />
              </div>
              {progress.lastActivityAt && <p className="text-sm text-slate-500">Zuletzt geübt: {fmtDate(progress.lastActivityAt)}</p>}
              <Link to={`/app/topics/${topic.id}`} className="mt-auto rounded-xl bg-indigo-600 text-white px-5 font-semibold inline-flex items-center justify-center">
                Thema öffnen
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center mb-3">
          <h2 id="recent-heading" className="text-xl font-semibold">
            Zuletzt bearbeitet
          </h2>
          {recent.length > 0 && (
            <Link to="/app/history" className="ml-auto text-indigo-700 underline min-h-11 inline-flex items-center">
              Ganzer Verlauf
            </Link>
          )}
        </div>
        {!loading && recent.length === 0 && <p className="text-slate-500">Hier erscheinen deine zuletzt bearbeiteten Aufgaben.</p>}
        <ul className="space-y-2">
          {recent.map((a) => (
            <li key={a.id}>
              <Link to={`/app/exercises/${a.exerciseId}`} className="rounded-xl bg-white p-4 shadow-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-medium flex-1 min-w-48">{recentCtx.get(a.id)?.label ?? a.exerciseId}</span>
                <span className="text-sm">{VERDICT_LABEL[a.correction?.verdict ?? (a.isCorrect ? 'correct' : 'incorrect')]}</span>
                <span className="text-sm text-slate-500">{fmtDate(a.submittedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
