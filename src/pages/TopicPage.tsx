import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Todo } from '../components/Placeholder';
import { useAuth } from '../context/AuthContext';
import { scoreBand } from '../domain/score';
import { services } from '../services';
import { CHAPTER_STATUS_LABEL, type Topic, type TopicProgress } from '../types';

/** Themen-Dashboard: alle Kapitel mit Status, Fortschritt und Score. Skelett. */
export default function TopicPage() {
  const { topicId = '' } = useParams();
  const userId = useAuth().session!.user.id;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<TopicProgress | null>(null);

  useEffect(() => {
    void services.content.getTopic(topicId).then(setTopic);
    services.progress.getTopicProgress(userId, topicId).then(setProgress, () => setProgress(null));
  }, [topicId, userId]);

  if (!topic) return <p>Thema nicht gefunden.</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold">{topic.title}</h1>
      {progress && (
        <p className="text-slate-600">
          Verständnis {progress.score}/100 – {scoreBand(progress.score)}
        </p>
      )}
      <ol className="mt-6 grid sm:grid-cols-2 gap-3">
        {topic.subtopics.map((s) => {
          const p = progress?.subtopics.find((x) => x.subtopicId === s.id);
          return (
            <li key={s.id}>
              <Link to={`/app/topics/${topic.id}/chapters/${s.id}`} className="block rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold">
                  {s.order}. {s.title}
                </p>
                <p className="text-sm text-slate-600">{s.description}</p>
                {p && (
                  <p className="text-sm mt-1">
                    {CHAPTER_STATUS_LABEL[p.status]} · {p.solvedExercises}/{p.totalExercises} gelöst · Score {p.score}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <Todo>Fortschrittsleisten, Kennzeichnung abgeschlossener Kapitel, Hervorhebung „nächster sinnvoller Schritt“.</Todo>
    </div>
  );
}
