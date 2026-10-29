import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { MathText } from '../components/MathText';
import { Todo } from '../components/Placeholder';
import { services } from '../services';
import type { Subtopic } from '../types';

/** Lernkapitel: Lernziel, Einführung, Regeln, Video-Platzhalter, Beispiel, Aufgaben, Zusammenfassung. Skelett. */
export default function ChapterPage() {
  const { topicId = '', subtopicId = '' } = useParams();
  const [sub, setSub] = useState<Subtopic | null>(null);

  useEffect(() => {
    void services.content.getSubtopic(subtopicId).then(setSub);
  }, [subtopicId]);

  if (!sub) return <p>Kapitel nicht gefunden.</p>;
  return (
    <article className="space-y-6">
      <Link to={`/app/topics/${topicId}`} className="text-indigo-700 text-sm">
        ← Zum Thema
      </Link>
      <h1 className="text-2xl font-bold">{sub.title}</h1>
      <p className="rounded-xl bg-indigo-50 p-4">
        <strong>Lernziel:</strong> <MathText text={sub.objective} />
      </p>
      <p>
        <MathText text={sub.intro} />
      </p>

      <section>
        <h2 className="font-semibold text-lg">Begriffe und Regeln</h2>
        <ul className="space-y-2 mt-2">
          {sub.rules.map((r) => (
            <li key={r.term}>
              <strong>
                <MathText text={r.term} />
              </strong>
              {r.explanation && (
                <>
                  : <MathText text={r.explanation} />
                </>
              )}
              {r.math && <MathText text={r.math} display />}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        {sub.materials
          .filter((m) => m.kind === 'video')
          .map((m) => (
            <div key={m.id} className="aspect-video rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 text-center p-4">
              {m.url ? <a href={m.url}>{m.title}</a> : <>Video folgt: {m.title}</>}
            </div>
          ))}
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-lg">Beispiel</h2>
        <p>
          <MathText text={sub.example.problem} />
        </p>
        <ol className="list-decimal ml-6 mt-2">
          {sub.example.steps.map((s, i) => (
            <li key={i}>
              <MathText text={s.text} />
              {s.math && <MathText text={s.math} display />}
            </li>
          ))}
        </ol>
        <p className="mt-2 font-medium">
          <MathText text={sub.example.result} />
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Übungsaufgaben</h2>
        <ul className="mt-2 space-y-2">
          {sub.exercises.map((e, i) => (
            <li key={e.id}>
              <Link to={`/app/exercises/${e.id}`} className="block rounded-lg bg-white p-3 shadow-sm">
                Aufgabe {i + 1} · {e.type} · Stufe {e.difficulty}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Zusammenfassung</h2>
        <ul className="list-disc ml-6">
          {sub.summary.map((s) => (
            <li key={s}>
              <MathText text={s} />
            </li>
          ))}
        </ul>
      </section>
      <Todo>Kapitel-Status/Score anzeigen, Aufgaben-Status je Aufgabe (gelöst/offen).</Todo>
    </article>
  );
}
