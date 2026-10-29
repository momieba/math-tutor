import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MathText } from '../components/MathText';
import { Todo } from '../components/Placeholder';
import { services } from '../services';
import type { Exercise } from '../types';

/**
 * Aufgabenansicht. Skelett – Umsetzung durch Entwickler:
 * Eingabe je Typ, Hinweise (3 Stufen), Musterlösung, Abgabe via evaluateAnswer + learner.saveAttempt.
 */
export default function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const [ex, setEx] = useState<Exercise | null>(null);

  useEffect(() => {
    void services.content.getExercise(exerciseId).then(setEx);
  }, [exerciseId]);

  if (!ex) return <p>Aufgabe nicht gefunden.</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {ex.type} · Schwierigkeit {ex.difficulty}
      </p>
      <h1 className="text-xl">
        <MathText text={ex.prompt} />
      </h1>
      <Todo>
        Eingabekomponente je Typ (MultipleChoice, NumericInput, EquationInput, TextInput, HandwritingCanvas + Ergebnisfeld), Hinweis-Button (3 Stufen,
        hintsUsed zählen), „Lösung anzeigen“ (solutionViewed), Abgabe → evaluateAnswer → services.learner.saveAttempt, Feedback grün/gelb/rot,
        Musterlösung nach Abgabe. Entwurf bei Netzwerkfehler lokal zwischenspeichern.
      </Todo>
    </div>
  );
}
