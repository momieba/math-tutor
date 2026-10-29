import type { ModelSolution, SolutionStep } from '../types';
import { MathText } from './MathText';

function Steps({ steps }: { steps: SolutionStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-none w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold flex items-center justify-center" aria-hidden="true">
            {i + 1}
          </span>
          <div className="pt-1 min-w-0">
            <span className="sr-only">Schritt {i + 1}: </span>
            <MathText text={s.text} />
            {s.math && (
              <div className="overflow-x-auto">
                <MathText text={s.math} display />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Schrittweise Musterlösung aus der geprüften Aufgabenbibliothek (inkl. optionaler Alternative). */
export function SolutionView({ solution }: { solution: ModelSolution }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm space-y-4" aria-labelledby="solution-heading">
      <h2 id="solution-heading" className="text-lg font-semibold">
        Musterlösung
      </h2>
      <Steps steps={solution.steps} />
      <p className="rounded-xl bg-emerald-50 p-3">
        <strong>Ergebnis:</strong> <MathText text={solution.finalAnswer} />
      </p>
      {solution.alternative && solution.alternative.length > 0 && (
        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer min-h-11 flex items-center font-medium">Alternativer Lösungsweg</summary>
          <div className="mt-3">
            <Steps steps={solution.alternative} />
          </div>
        </details>
      )}
    </section>
  );
}
