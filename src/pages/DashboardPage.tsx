import { ArrowRight, BookOpen, CircleCheck, CircleHelp, CircleX, Clock, History, Repeat, Search, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ScoreBadge } from '../components/ScoreBadge';
import { areaVisual } from '../components/topicVisuals';
import { ButtonLink, EmptyState, SkeletonCard, useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { topicCaption } from '../domain/labels';
import { recommendNext, timeAgo, VERDICT_LABEL, type Recommendation } from '../domain/progressView';
import { recommendReviews, REVIEW_REASON_TEXT, type ReviewRecommendation } from '../domain/recommendations';
import { searchTopics, type MatchCandidate } from '../domain/topicMatcher';
import { services } from '../services';
import type { AttemptRecord, TopicProgress, TopicSummary, Verdict } from '../types';
import { resolveAttemptContexts, type AttemptContext } from './attemptLabels';

interface Tile {
  topic: TopicSummary;
  progress: TopicProgress;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

const VERDICT_ICON: Record<Verdict, { Icon: typeof CircleCheck; cls: string }> = {
  correct: { Icon: CircleCheck, cls: 'text-emerald-700' },
  partial: { Icon: TriangleAlert, cls: 'text-amber-700' },
  unclear: { Icon: CircleHelp, cls: 'text-amber-700' },
  incorrect: { Icon: CircleX, cls: 'text-red-700' },
};

/**
 * Schüler-Dashboard: Begrüßung, „Weiter, wo du aufgehört hast“, Themensuche mit Trefferliste beim Tippen,
 * Wiederholungs-Empfehlungen (domain/recommendations.ts), Themenkacheln (Verständnis in Worten, Kapitel begonnen)
 * und zuletzt bearbeitete Aufgaben.
 */
export default function DashboardPage() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const navigate = useNavigate();
  const toast = useToast();

  const [allTopics, setAllTopics] = useState<TopicSummary[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [recent, setRecent] = useState<AttemptRecord[]>([]);
  const [recentCtx, setRecentCtx] = useState<Map<string, AttemptContext>>(new Map());
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>();
  const [reviews, setReviews] = useState<ReviewRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  /** Treffer zur aktuellen Eingabe; null = noch keine Suche. */
  const [results, setResults] = useState<MatchCandidate[] | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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
      setTiles(
        valid.flatMap(({ topic, progress }) => {
          const summary = all.find((t) => t.id === topic.id);
          return summary ? [{ topic: summary, progress }] : [];
        }),
      );
      const pathEntries = valid.map(({ topic, progress }) => ({ topicId: topic.id, topicTitle: topic.title, subtopics: topic.subtopics, progress }));
      const next = recommendNext(pathEntries);
      setRecommendation(next);
      setReviews(recommendReviews(pathEntries, new Date(), next?.subtopicId));
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

  // Suche beim Tippen (kurz entprellt); veraltete Antworten werden verworfen.
  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setResults(null);
      return;
    }
    let current = true;
    const timer = setTimeout(async () => {
      const found = searchTopics(text, await services.topicMatcher.match(text), allTopics);
      const titles = await Promise.all(
        found.filter((c) => c.subtopicId).map(async (c) => [c.subtopicId!, (await services.content.getSubtopic(c.subtopicId!))?.title ?? ''] as const),
      );
      if (!current) return;
      setChapterTitles(Object.fromEntries(titles));
      setResults(found);
      setShowAll(false);
      setActiveIndex(0);
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, allTopics]);

  const activeIds = new Set(tiles.map((t) => t.topic.id));
  const options: MatchCandidate[] = showAll ? allTopics.map((t) => ({ topicId: t.id, title: t.title, score: 0 })) : (results ?? []);
  const listVisible = listOpen && results !== null;

  /** Treffer öffnen: Thema bei Bedarf hinzufügen, dann zum passenden Kapitel bzw. zum Thema. */
  async function openCandidate(c: MatchCandidate) {
    try {
      if (!activeIds.has(c.topicId)) {
        await services.learner.addActiveTopic(userId, c.topicId);
        toast(`„${c.title}“ hinzugefügt`);
      }
      navigate(c.subtopicId && !showAll ? `/app/topics/${c.topicId}/chapters/${c.subtopicId}` : `/app/topics/${c.topicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thema konnte nicht hinzugefügt werden.');
    }
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const c = options[activeIndex];
    if (listVisible && c) void openCandidate(c);
  }

  function onSearchKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') setListOpen(false);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setListOpen(true);
      if (options.length) setActiveIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-slate-600 font-medium">{greeting()}</p>
        <h1 className="text-3xl font-bold text-slate-900">Hallo {session!.user.displayName}!</h1>
        {!loading && tiles.length === 0 && <p className="text-slate-600">Schön, dass du da bist. Such dir ein Thema aus – dann geht es direkt los.</p>}
      </header>

      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {recommendation && (
        <section
          className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-sm flex flex-wrap items-center gap-6"
          aria-labelledby="next-heading"
        >
          <div className="flex-1 min-w-56 space-y-1">
            <h2 id="next-heading" className="text-2xl font-bold text-slate-900">
              {recent.length > 0 ? 'Weiter, wo du aufgehört hast' : 'Dein nächster Schritt'}
            </h2>
            <p className="text-slate-600">
              {recommendation.subtopicTitle} · {recommendation.topicTitle}
            </p>
          </div>
          <ButtonLink
            to={`/app/topics/${recommendation.topicId}/chapters/${recommendation.subtopicId}`}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight aria-hidden="true" size={20} />}
          >
            Weiter
          </ButtonLink>
        </section>
      )}

      {reviews.length > 0 && (
        <section aria-labelledby="review-heading" className="space-y-3">
          <h2 id="review-heading" className="flex items-center gap-2 text-xl font-semibold">
            <Repeat aria-hidden="true" size={20} className="text-indigo-700" /> Zum Wiederholen
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.subtopicId}>
                <Link
                  to={`/app/topics/${r.topicId}/chapters/${r.subtopicId}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300"
                >
                  <span className="text-sm text-slate-600">{r.topicTitle}</span>
                  <span className="font-semibold text-slate-900">{r.subtopicTitle}</span>
                  <span className="text-sm text-slate-700">{REVIEW_REASON_TEXT[r.reason]}</span>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-indigo-700">
                    Wiederholen <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="text-xl font-semibold">
          Was möchtest du heute lernen?
        </h2>
        <form onSubmit={submitSearch} role="search" className="relative">
          <Search aria-hidden="true" size={22} className="pointer-events-none absolute left-4 top-6 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setListOpen(true);
            }}
            onFocus={() => setListOpen(true)}
            onBlur={() => setListOpen(false)}
            onKeyDown={onSearchKey}
            placeholder="z. B. „Ich möchte den Satz des Pythagoras verstehen.“"
            aria-label="Was möchtest du heute lernen?"
            role="combobox"
            aria-expanded={listVisible}
            aria-controls="topic-results"
            aria-autocomplete="list"
            aria-activedescendant={listVisible && options[activeIndex] ? `topic-option-${activeIndex}` : undefined}
            autoComplete="off"
            maxLength={200}
            className="w-full min-h-12 rounded-lg border-2 border-slate-500 bg-white py-3 pl-12 pr-4 text-lg placeholder:text-slate-500 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
          {listVisible && (
            // onMouseDown: Das Eingabefeld behält beim Antippen eines Treffers den Fokus, sonst schließt die Liste vor dem Klick.
            <div
              className="absolute inset-x-0 top-full z-20 mt-2 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {options.length === 0 && <p className="px-3 py-2 text-slate-600">Dazu habe ich kein passendes Thema im Lehrplan gefunden.</p>}
              <ul id="topic-results" role="listbox" aria-label="Passende Themen">
                {options.map((c, i) => {
                  const t = allTopics.find((x) => x.id === c.topicId);
                  const chapterTitle = !showAll && c.subtopicId ? chapterTitles[c.subtopicId] : undefined;
                  return (
                    <li
                      key={c.topicId}
                      id={`topic-option-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => void openCandidate(c)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${i === activeIndex ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{c.title}</p>
                        <p className="text-sm text-slate-600">
                          {t && topicCaption(t)}
                          {chapterTitle && ` · Kapitel „${chapterTitle}“`}
                        </p>
                      </div>
                      {activeIds.has(c.topicId) && <span className="text-sm text-slate-600">Schon aktiv</span>}
                    </li>
                  );
                })}
              </ul>
              {!showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-1 min-h-11 w-full rounded-lg px-3 text-left font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  Alle Themen zeigen
                </button>
              )}
            </div>
          )}
        </form>
      </section>

      <section aria-labelledby="topics-heading" className="space-y-4">
        <h2 id="topics-heading" className="text-xl font-semibold">
          Deine Themen
        </h2>
        {loading && (
          <div className="grid lg:grid-cols-2 gap-4">
            <SkeletonCard label="Themen werden geladen …" lines={4} />
            <SkeletonCard label="" lines={4} />
          </div>
        )}
        {!loading && tiles.length === 0 && (
          <EmptyState icon={<BookOpen size={24} />} title="Noch keine Themen.">
            Schreib oben, was du lernen möchtest – zum Beispiel für deine nächste Mathearbeit.
          </EmptyState>
        )}
        <div className="grid lg:grid-cols-2 gap-4">
          {tiles.map(({ topic, progress }) => {
            const visual = areaVisual(topic.area);
            const started = progress.subtopics.filter((s) => s.attemptedExercises > 0).length;
            const chapters = progress.subtopics.length || topic.subtopicCount;
            return (
              <article key={topic.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${visual.cls}`} aria-hidden="true">
                    <visual.Icon size={24} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600">
                      {topicCaption(topic)}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{topic.title}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">Verständnis:</span>
                  <ScoreBadge score={progress.score} variant="band" />
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {started} von {chapters}
                  </span>{' '}
                  Kapiteln begonnen
                  {progress.lastActivityAt && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <Clock aria-hidden="true" size={14} className="inline -mt-0.5" /> {timeAgo(progress.lastActivityAt)}
                    </>
                  )}
                </p>
                <ButtonLink to={`/app/topics/${topic.id}`} variant="secondary" className="mt-auto w-full" iconRight={<ArrowRight aria-hidden="true" size={20} />}>
                  Thema öffnen
                </ButtonLink>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="space-y-4">
        <div className="flex items-center">
          <h2 id="recent-heading" className="text-xl font-semibold">
            Zuletzt bearbeitet
          </h2>
          {recent.length > 0 && (
            <Link to="/app/history" className="ml-auto min-h-11 inline-flex items-center gap-1 rounded-lg px-2 font-medium text-indigo-700 hover:underline">
              <History aria-hidden="true" size={18} />
              Ganzer Verlauf
            </Link>
          )}
        </div>
        {!loading && recent.length === 0 && (
          <EmptyState icon={<History size={24} />} title="Noch nichts bearbeitet.">
            Hier erscheinen deine zuletzt bearbeiteten Aufgaben.
          </EmptyState>
        )}
        <ul className="space-y-2">
          {recent.map((a) => {
            const verdict: Verdict = a.correction?.verdict ?? (a.isCorrect ? 'correct' : 'incorrect');
            const vi = VERDICT_ICON[verdict];
            return (
              <li key={a.id}>
                <Link
                  to={`/app/exercises/${a.exerciseId}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center gap-x-4 gap-y-1 transition-colors hover:border-indigo-300"
                >
                  <vi.Icon aria-hidden="true" size={22} className={`flex-none ${vi.cls}`} />
                  <span className="font-medium flex-1 min-w-48">{recentCtx.get(a.id)?.label ?? a.exerciseId}</span>
                  <span className={`text-sm font-medium ${vi.cls}`}>{VERDICT_LABEL[verdict]}</span>
                  <span className="text-sm text-slate-600">{fmtDate(a.submittedAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
