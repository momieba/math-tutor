import { VERDICT_LABEL } from '../domain/progressView';
import type { CommonMistake, CorrectionMark, MarkColor, Verdict } from '../types';
import { MathText } from './MathText';

const PANEL: Record<Verdict, string> = {
  correct: 'border-emerald-300 bg-emerald-50',
  partial: 'border-amber-300 bg-amber-50',
  unclear: 'border-amber-300 bg-amber-50',
  incorrect: 'border-red-300 bg-red-50',
};
const ICON: Record<Verdict, string> = { correct: '✓', partial: '◐', unclear: '?', incorrect: '✗' };
const MARK: Record<MarkColor, { dot: string; label: string }> = {
  green: { dot: 'bg-emerald-500', label: 'Korrekt' },
  yellow: { dot: 'bg-amber-400', label: 'Unklar / bitte prüfen' },
  red: { dot: 'bg-red-500', label: 'Fehler' },
};

interface Props {
  verdict: Verdict;
  points: number;
  feedback: string;
  marks: CorrectionMark[];
  /** Erkannter typischer Fehler (nur direkt nach der Abgabe bekannt). */
  mistake?: string;
  /** Typische Fehler der Aufgabe, als aufklappbare Liste bei nicht korrekter Lösung. */
  commonMistakes?: CommonMistake[];
}

/** Rückmeldung grün/gelb/rot. Jede Markierung trägt Farbe, Text-Label und Erklärung. */
export function FeedbackPanel({ verdict, points, feedback, marks, mistake, commonMistakes = [] }: Props) {
  return (
    <section className={`rounded-2xl border-2 p-5 space-y-3 ${PANEL[verdict]}`} role="status" aria-live="polite">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span aria-hidden="true">{ICON[verdict]}</span>
        {VERDICT_LABEL[verdict]}
        {verdict !== 'unclear' && <span className="ml-auto text-sm font-normal tabular-nums">{Math.round(points * 100)} % der Punkte</span>}
      </h2>
      {mistake && (
        <p>
          <strong>Typischer Fehler erkannt:</strong> <MathText text={mistake} />
        </p>
      )}
      <ul className="space-y-2">
        {marks.map((m, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className={`mt-1.5 flex-none w-3 h-3 rounded-full ${MARK[m.color].dot}`} aria-hidden="true" />
            <span>
              <span className="sr-only">{MARK[m.color].label}: </span>
              <MathText text={m.message} />
            </span>
          </li>
        ))}
      </ul>
      {!marks.some((m) => m.message === feedback) && feedback && (
        <p>
          <MathText text={feedback} />
        </p>
      )}
      {verdict !== 'correct' && commonMistakes.length > 0 && (
        <details className="rounded-xl bg-white/70 p-3">
          <summary className="cursor-pointer min-h-11 flex items-center font-medium">Typische Fehler bei dieser Aufgabe</summary>
          <ul className="mt-2 space-y-2 list-disc ml-5">
            {commonMistakes.map((m) => (
              <li key={m.description}>
                <strong>
                  <MathText text={m.description} />
                </strong>
                : <MathText text={m.feedback} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
