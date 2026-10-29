import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { MathText } from '../components/MathText';
import { SolutionView } from '../components/SolutionView';
import { useAuth } from '../context/AuthContext';
import { formatAnswer, VERDICT_LABEL } from '../domain/progressView';
import { services } from '../services';
import type { AttemptRecord, Topic, Verdict } from '../types';
import { resolveAttemptContexts, type AttemptContext } from './attemptLabels';

const LIMIT = 200;
const fmtDate = (iso: string) => new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
const verdictOf = (a: AttemptRecord): Verdict => a.correction?.verdict ?? (a.isCorrect ? 'correct' : a.points > 0 ? 'partial' : 'incorrect');
const DOT: Record<Verdict, string> = { correct: 'bg-emerald-500', partial: 'bg-amber-400', unclear: 'bg-amber-400', incorrect: 'bg-red-500' };

/** Persönliche Aufgabenhistorie mit Filter (Thema/Kapitel) und Detailansicht. Filter und Auswahl stehen in der URL (teilbar, Zurück-Taste). */
export default function HistoryPage() {
  const userId = useAuth().session!.user.id;
  const [params, setParams] = useSearchParams();
  const topicFilter = params.get('topic') ?? '';
  const chapterFilter = params.get('chapter') ?? '';
  const selectedId = params.get('attempt');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [items, setItems] = useState<AttemptRecord[]>([]);
  const [ctx, setCtx] = useState<Map<string, AttemptContext>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void services.content
      .listTopics()
      .then((list) => Promise.all(list.map((t) => services.content.getTopic(t.id))))
      .then((full) => setTopics(full.filter((t): t is Topic => t !== null)));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const list = await services.learner.listAttempts(userId, {
          topicId: topicFilter || undefined,
          subtopicId: chapterFilter || undefined,
          limit: LIMIT,
        });
        const c = await resolveAttemptContexts(list);
        if (!active) return;
        setItems(list);
        setCtx(c);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Verlauf konnte nicht geladen werden.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, topicFilter, chapterFilter]);

  function update(next: Record<string, string | null>) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    setParams(p);
  }

  const chapters = topics.find((t) => t.id === topicFilter)?.subtopics ?? [];
  const selected = items.find((a) => a.id === selectedId) ?? null;
  const solvedShare = items.length ? Math.round((items.filter((a) => verdictOf(a) === 'correct').length / items.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Verlauf</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1 min-w-48 flex-1">
          <span className="text-sm font-medium">Thema</span>
          <select
            value={topicFilter}
            onChange={(e) => update({ topic: e.target.value || null, chapter: null, attempt: null })}
            className="rounded-xl border-2 border-slate-300 bg-white px-3"
          >
            <option value="">Alle Themen</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 min-w-48 flex-1">
          <span className="text-sm font-medium">Kapitel</span>
          <select
            value={chapterFilter}
            onChange={(e) => update({ chapter: e.target.value || null, attempt: null })}
            disabled={!topicFilter}
            className="rounded-xl border-2 border-slate-300 bg-white px-3 disabled:bg-slate-100"
          >
            <option value="">{topicFilter ? 'Alle Kapitel' : 'Erst Thema wählen'}</option>
            {chapters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.order}. {s.title}
              </option>
            ))}
          </select>
        </label>
        {(topicFilter || chapterFilter) && (
          <button type="button" onClick={() => update({ topic: null, chapter: null, attempt: null })} className="rounded-xl px-4 underline text-slate-600">
            Filter zurücksetzen
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-800">
          {error}
        </p>
      )}
      {loading && <p className="text-slate-500">Lade …</p>}
      {!loading && items.length === 0 && <p className="text-slate-500">Noch keine bearbeiteten Aufgaben{topicFilter ? ' für diese Auswahl' : ''}.</p>}
      {!loading && items.length > 0 && (
        <p className="text-sm text-slate-600">
          {items.length} {items.length === 1 ? 'Abgabe' : 'Abgaben'}
          {items.length === LIMIT && ' (neueste)'} · {solvedShare} % davon richtig
        </p>
      )}

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">
        <ul className="space-y-2" aria-label="Abgaben">
          {items.map((a) => {
            const v = verdictOf(a);
            const isSel = a.id === selectedId;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => update({ attempt: isSel ? null : a.id })}
                  aria-expanded={isSel}
                  className={`w-full text-left rounded-xl bg-white p-4 shadow-sm border-2 ${isSel ? 'border-indigo-500' : 'border-transparent'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full flex-none ${DOT[v]}`} aria-hidden="true" />
                    <span className="font-medium flex-1">{ctx.get(a.id)?.label ?? a.exerciseId}</span>
                    {a.submission && (
                      <span className="text-sm text-slate-500" title="Mit Handschrift">
                        ✏️
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-slate-600 mt-1">
                    {fmtDate(a.submittedAt)} · {VERDICT_LABEL[v]} · {Math.round(a.points * 100)} %
                    {a.hintsUsed > 0 && ` · ${a.hintsUsed} Hinweis${a.hintsUsed === 1 ? '' : 'e'}`}
                    {a.solutionViewed && ' · Lösung angesehen'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {selected ? (
          <AttemptDetail attempt={selected} context={ctx.get(selected.id)} onClose={() => update({ attempt: null })} />
        ) : (
          items.length > 0 && <p className="hidden lg:block text-slate-500">Wähle links eine Abgabe, um Details zu sehen.</p>
        )}
      </div>
    </div>
  );
}

function AttemptDetail({ attempt, context, onClose }: { attempt: AttemptRecord; context?: AttemptContext; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const ex = context?.exercise ?? null;

  useEffect(() => {
    let active = true;
    setImageUrl(null);
    setImageError(false);
    if (attempt.submission) {
      services.learner.getSubmissionImageUrl(attempt.submission).then(
        (url) => active && setImageUrl(url),
        () => active && setImageError(true),
      );
    }
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm space-y-4 lg:sticky lg:top-20" aria-labelledby="detail-heading">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h2 id="detail-heading" className="text-lg font-semibold">
            {context?.label ?? attempt.exerciseId}
          </h2>
          <p className="text-sm text-slate-600">Abgegeben am {fmtDate(attempt.submittedAt)}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl px-3 text-slate-600" aria-label="Details schließen">
          ✕
        </button>
      </div>

      {ex ? (
        <p className="rounded-xl bg-slate-50 p-3">
          <MathText text={ex.prompt} />
        </p>
      ) : (
        <p className="text-sm text-slate-500">Diese Aufgabe ist nicht mehr in der Aufgabenbibliothek enthalten.</p>
      )}

      <div>
        <h3 className="font-medium">Deine Antwort</h3>
        <p className="text-lg">{attempt.answerRaw ? <MathText text={ex ? formatAnswer(ex, attempt.answerRaw) : attempt.answerRaw} /> : <em>keine Texteingabe</em>}</p>
      </div>

      {attempt.submission && (
        <div>
          <h3 className="font-medium mb-1">Dein Rechenweg</h3>
          {imageUrl ? (
            <img src={imageUrl} alt="Dein handschriftlicher Rechenweg" className="w-full rounded-xl border border-slate-200 bg-white" />
          ) : (
            <p className="text-sm text-slate-500">{imageError ? 'Das Bild konnte nicht geladen werden.' : attempt.submission.imageRef ? 'Lade Bild …' : 'Kein Bild gespeichert.'}</p>
          )}
        </div>
      )}

      {attempt.correction && (
        <FeedbackPanel
          verdict={attempt.correction.verdict}
          points={attempt.correction.points}
          feedback={attempt.correction.feedback}
          marks={attempt.correction.marks}
          commonMistakes={ex?.commonMistakes}
        />
      )}

      <div>
        <h3 className="font-medium">Genutzte Hilfen</h3>
        {attempt.hintsUsed === 0 && !attempt.solutionViewed && <p className="text-slate-600">Keine – selbstständig gelöst.</p>}
        {attempt.hintsUsed > 0 && ex && (
          <ol className="space-y-1 mt-1">
            {ex.hints.slice(0, attempt.hintsUsed).map((h, i) => (
              <li key={i} className="rounded-lg bg-sky-50 p-2 text-sm">
                <strong>Hinweis {i + 1}:</strong> <MathText text={h} />
              </li>
            ))}
          </ol>
        )}
        {attempt.solutionViewed && <p className="text-sm text-amber-800 mt-1">Musterlösung vor der Abgabe angesehen.</p>}
      </div>

      {ex && <SolutionView solution={ex.solution} />}

      {ex && (
        <Link to={`/app/exercises/${ex.id}`} className="rounded-xl bg-indigo-600 text-white px-5 font-semibold inline-flex items-center">
          Aufgabe erneut bearbeiten
        </Link>
      )}
    </section>
  );
}
