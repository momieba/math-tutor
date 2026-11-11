import { BookOpen, ChevronDown, Lightbulb, ListChecks } from 'lucide-react';
import { useState } from 'react';
import type { DetailedStep, ModelSolution, SolutionStep } from '../types';
import { ExerciseFigure } from './figures/ExerciseFigure';
import { MathText } from './MathText';
import { Button } from './ui/Button';

function Steps({ steps, visible = steps.length }: { steps: SolutionStep[]; visible?: number }) {
  return (
    <ol className="space-y-4">
      {steps.slice(0, visible).map((s, i) => (
        <li key={i} className="flex gap-4 animate-fade-in">
          <span className="flex-none w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold flex items-center justify-center" aria-hidden="true">
            {i + 1}
          </span>
          <div className="pt-1 min-w-0 flex-1">
            <span className="sr-only">Schritt {i + 1}: </span>
            <MathText text={s.text} />
            {s.math && (
              <div className="mt-2 overflow-x-auto rounded-lg bg-slate-50 px-4 py-2">
                <MathText text={s.math} display />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Ausführliche Lösung: jeder Denkschritt mit Überschrift, Erklärung, optional Rechnung und Skizze. Zugeklappt. */
function DetailedSolution({ steps }: { steps: DetailedStep[] }) {
  return (
    <details className="group rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-indigo-800">
        <Lightbulb aria-hidden="true" size={20} />
        Ausführliche Lösung mit allen Denkschritten
      </summary>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              <span className="sr-only">Denkschritt {i + 1}: </span>
              <span aria-hidden="true">{i + 1}. </span>
              <MathText text={s.title} />
            </p>
            <div className="mt-2 flex flex-wrap items-start gap-4">
              <div className="min-w-56 flex-1 space-y-2">
                <MathText text={s.text} />
                {s.math && (
                  <div className="overflow-x-auto rounded-lg bg-slate-50 px-4 py-2">
                    <MathText text={s.math} display />
                  </div>
                )}
              </div>
              {s.figure && (
                <div className="flex-none">
                  <ExerciseFigure figure={s.figure} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}

/**
 * Schrittweise Musterlösung aus der geprüften Aufgabenbibliothek (inkl. optionaler Alternative und ausführlicher Lösung).
 * `stepwise`: Schritte werden nacheinander aufgedeckt („Nächster Schritt“), damit der Schüler mitdenkt.
 */
export function SolutionView({ solution, stepwise = false }: { solution: ModelSolution; stepwise?: boolean }) {
  const total = solution.steps.length;
  const [visible, setVisible] = useState(stepwise ? Math.min(1, total) : total);
  const complete = visible >= total;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-slide-up" aria-labelledby="solution-heading">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700" aria-hidden="true">
          <BookOpen size={20} />
        </span>
        <h2 id="solution-heading" className="text-xl font-semibold">
          Musterlösung
        </h2>
        {stepwise && (
          <span className="ml-auto text-sm text-slate-600 tabular-nums" aria-live="polite">
            Schritt {visible} von {total}
          </span>
        )}
      </div>
      <Steps steps={solution.steps} visible={visible} />
      {!complete && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<ChevronDown aria-hidden="true" size={20} />} onClick={() => setVisible((n) => Math.min(total, n + 1))}>
            Nächster Schritt
          </Button>
          <Button variant="ghost" icon={<ListChecks aria-hidden="true" size={20} />} onClick={() => setVisible(total)}>
            Alle Schritte zeigen
          </Button>
        </div>
      )}
      {complete && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 animate-fade-in">
          <strong>Ergebnis:</strong> <MathText text={solution.finalAnswer} />
        </p>
      )}
      {complete && solution.detailed && solution.detailed.length > 0 && <DetailedSolution steps={solution.detailed} />}
      {complete && solution.alternative && solution.alternative.length > 0 && (
        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer min-h-11 flex items-center font-semibold">Alternativer Lösungsweg</summary>
          <div className="mt-3">
            <Steps steps={solution.alternative} />
          </div>
        </details>
      )}
    </section>
  );
}
