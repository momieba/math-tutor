import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Todo } from '../components/Placeholder';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';
import type { AttemptRecord } from '../types';

/** Persönliche Aufgabenhistorie. Skelett. */
export default function HistoryPage() {
  const userId = useAuth().session!.user.id;
  const [items, setItems] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    void services.learner.listAttempts(userId, { limit: 100 }).then(setItems);
  }, [userId]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Verlauf</h1>
      {items.length === 0 && <p className="text-slate-500 mt-4">Noch keine bearbeiteten Aufgaben.</p>}
      <ul className="mt-4 space-y-2">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg bg-white p-3 shadow-sm">
            <Link to={`/app/exercises/${a.exerciseId}`}>
              {new Date(a.submittedAt).toLocaleString('de-DE')} · {a.exerciseId} · {Math.round(a.points * 100)} % · Hinweise: {a.hintsUsed}
            </Link>
          </li>
        ))}
      </ul>
      <Todo>Detailansicht (eingereichte Lösung, Bild, Korrektur, Musterlösung), Filter nach Thema, Entwicklung über Zeit.</Todo>
    </div>
  );
}
