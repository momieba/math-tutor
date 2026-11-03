import { ArrowRight, BookOpen, CircleCheck, CircleHelp, CircleX, Clock, History, PenLine, Search, Sparkles, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { areaVisual } from '../components/topicVisuals';
import { Button, ButtonLink, Chip, EmptyState, SkeletonCard, useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { recommendNext, VERDICT_LABEL, type Recommendation } from '../domain/progressView';
import type { MatchCandidate, MatchResult } from '../domain/topicMatcher';
import { services } from '../services';
import type { AttemptRecord, TopicProgress, TopicSummary, Verdict } from '../types';
import { resolveAttemptContexts, type AttemptContext } from './attemptLabels';
import { pickNext } from './practice';

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
 * Schüler-Dashboard: Begrüßung, „Weiter, wo du aufgehört hast“, Themensuche mit Vorschlägen,
 * Themenkacheln (Stufe in Worten, Kapitel begonnen) und zuletzt bearbeitete Aufgaben.
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
  /** Nächste Aufgabe der Übungsfolge im empfohlenen Kapitel („Direkt üben“, kurzer Einstieg D-11). */
  const [practiceExerciseId, setPracticeExerciseId] = useState<string | undefined>();
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
      setTiles(
        valid.flatMap(({ topic, progress }) => {
          const summary = all.find((t) => t.id === topic.id);
          return summary ? [{ topic: summary, progress }] : [];
        }),
      );
      const rec = recommendNext(valid.map(({ topic, progress }) => ({ topicId: topic.id, topicTitle: topic.title, subtopics: topic.subtopics, progress })));
      setRecommendation(rec);
      if (rec) {
        const chapter = valid.find((v) => v.topic.id === rec.topicId)?.topic.subtopics.find((s) => s.id === rec.subtopicId);
        const attempts = await services.learner.listAttempts(userId, { subtopicId: rec.subtopicId }).catch(() => []);
        setPracticeExerciseId(chapter ? pickNext(userId, chapter, attempts)?.exercise.id : undefined);
      } else {
        setPracticeExerciseId(undefined);
      }
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

  async function runMatch(text: string) {
    if (!text.trim()) return;
    setShowAll(false);
    const result = await services.topicMatcher.match(text);
    const withChapter = result.kind === 'match' ? [result.best] : result.kind === 'ambiguous' ? result.candidates : [];
    const titles = await Promise.all(
      withChapter.filter((c) => c.subtopicId).map(async (c) => [c.subtopicId!, (await services.content.getSubtopic(c.subtopicId!))?.title ?? ''] as const),
    );
    setChapterTitles(Object.fromEntries(titles));
    setMatch(result);
  }

  function ask(e: FormEvent) {
    e.preventDefault();
    void runMatch(query);
  }

  function suggest(title: string) {
    setQuery(title);
    void runMatch(title);
  }

  async function confirm(c: MatchCandidate, openChapter: boolean) {
    try {
      await services.learner.addActiveTopic(userId, c.topicId);
      setMatch(null);
      setQuery('');
      toast(`„${c.title}“ hinzugefügt`);
      if (openChapter && c.subtopicId) navigate(`/app/topics/${c.topicId}/chapters/${c.subtopicId}`);
      else await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thema konnte nicht hinzugefügt werden.');
    }
  }

  const activeIds = new Set(tiles.map((t) => t.topic.id));
  const totalAttempted = tiles.reduce((n, t) => n + t.progress.subtopics.reduce((m, s) => m + s.attemptedExercises, 0), 0);
  const suggestions = [...allTopics.filter((t) => !activeIds.has(t.id)), ...allTopics.filter((t) => activeIds.has(t.id))].slice(0, 3);

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
      <header className="space-y-1">
        <p className="text-slate-600 font-medium">{greeting()}</p>
        <h1 className="text-3xl font-bold text-slate-900">Hallo {session!.user.displayName}!</h1>
        {!loading && (
          <p className="text-slate-600">
            {tiles.length === 0
              ? 'Schön, dass du da bist. Such dir ein Thema aus – dann geht es direkt los.'
              : `Du hast ${tiles.length} ${tiles.length === 1 ? 'Thema' : 'Themen'} aktiv und ${totalAttempted} ${totalAttempted === 1 ? 'Aufgabe' : 'Aufgaben'} bearbeitet.`}
          </p>
        )}
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
          <span className="hidden sm:flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-indigo-600 text-white" aria-hidden="true">
            <Sparkles size={28} />
          </span>
          <div className="flex-1 min-w-56 space-y-1">
            <h2 id="next-heading" className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              {recent.length > 0 ? 'Weiter, wo du aufgehört hast' : 'Dein nächster Schritt'}
            </h2>
            <p className="text-2xl font-bold text-slate-900">{recommendation.subtopicTitle}</p>
            <p className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>{recommendation.topicTitle}</span>
              {/* Im Hochformat eigene Zeile statt verwaistem „·“ am Zeilenende */}
              <span aria-hidden="true" className="hidden lg:inline">·</span>
              <span className="basis-full lg:basis-auto font-medium text-indigo-800">{recommendation.reason}</span>
              <StatusBadge status={recommendation.status} />
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {practiceExerciseId && (
              <ButtonLink to={`/app/exercises/${practiceExerciseId}`} variant="secondary" size="lg" icon={<PenLine aria-hidden="true" size={20} />}>
                Direkt üben
              </ButtonLink>
            )}
            <ButtonLink
              to={`/app/topics/${recommendation.topicId}/chapters/${recommendation.subtopicId}`}
              variant="primary"
              size="lg"
              icon={<BookOpen aria-hidden="true" size={20} />}
            >
              Kapitel öffnen
            </ButtonLink>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="flex items-center gap-2 text-xl font-semibold">
          <Search aria-hidden="true" size={22} className="text-indigo-700" />
          Was möchtest du heute lernen?
        </h2>
        <form onSubmit={ask} className="flex flex-col sm:flex-row gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. „Ich möchte den Satz des Pythagoras verstehen.“"
            aria-label="Was möchtest du heute lernen?"
            maxLength={200}
            className="flex-1 min-h-12 rounded-lg border-2 border-slate-500 bg-white px-4 py-3 text-lg placeholder:text-slate-500 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
          <Button type="submit" variant={recommendation ? 'secondary' : 'primary'} size="lg" disabled={!query.trim()} icon={<Search aria-hidden="true" size={20} />}>
            Thema finden
          </Button>
        </form>
        {suggestions.length > 0 && !match && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Vorschläge:</span>
            {suggestions.map((t) => {
              const { Icon } = areaVisual(t.area);
              return (
                <Chip key={t.id} icon={<Icon aria-hidden="true" size={18} />} onClick={() => suggest(t.title)}>
                  {t.title}
                </Chip>
              );
            })}
          </div>
        )}
        {match && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 space-y-3 animate-slide-up" aria-live="polite">
            <p className="font-semibold">{question}</p>
            <ul className="space-y-2">
              {candidates.map((c) => {
                const t = allTopics.find((x) => x.id === c.topicId);
                const already = activeIds.has(c.topicId);
                const chapterTitle = !showAll && c.subtopicId ? chapterTitles[c.subtopicId] : undefined;
                const visual = areaVisual(t?.area ?? '');
                return (
                  <li key={c.topicId} className="rounded-xl bg-white p-4 flex flex-wrap items-center gap-3 shadow-sm">
                    <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${visual.cls}`} aria-hidden="true">
                      <visual.Icon size={22} />
                    </span>
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
                      <ButtonLink to={`/app/topics/${c.topicId}`} variant="secondary">
                        Schon aktiv – öffnen
                      </ButtonLink>
                    ) : (
                      <Button variant="secondary" onClick={() => void confirm(c, false)}>
                        Thema hinzufügen
                      </Button>
                    )}
                    {chapterTitle && (
                      <Button variant="ghost" onClick={() => void confirm(c, true)}>
                        Direkt zum passenden Kapitel
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2">
              {!showAll && (
                <Button variant="ghost" onClick={() => setShowAll(true)}>
                  Alle Themen zeigen
                </Button>
              )}
              <Button variant="ghost" onClick={() => setMatch(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
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
            Tippe oben auf einen Vorschlag oder schreib, was du lernen möchtest – zum Beispiel für deine nächste Mathearbeit.
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
                      Klasse {topic.grade} · {topic.area}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{topic.title}</h3>
                  </div>
                  <StatusBadge status={progress.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">Verständnis:</span>
                  <ScoreBadge score={progress.score} variant="band" />
                </div>
                <ProgressBar value={progress.completion} label="Aufgaben bearbeitet" />
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {started} von {chapters}
                  </span>{' '}
                  Kapiteln begonnen
                  {progress.lastActivityAt && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <Clock aria-hidden="true" size={14} className="inline -mt-0.5" /> Zuletzt geübt: {fmtDate(progress.lastActivityAt)}
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
