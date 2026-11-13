import { CircleCheck, CircleHelp, CircleX, TriangleAlert, type LucideIcon } from 'lucide-react';
import { VERDICT_LABEL } from '../domain/progressView';
import type { CommonMistake, CorrectionMark, MarkColor, Verdict } from '../types';
import { MathText } from './MathText';

interface VerdictStyle {
  panel: string;
  iconWrap: string;
  Icon: LucideIcon;
  /** Kurzer, ermutigender Satz unter der Überschrift (Briefing C5: Fehler sind normal). */
  lead: string;
}

const STYLE: Record<Verdict, VerdictStyle> = {
  correct: {
    panel: 'border-emerald-200 bg-emerald-50',
    iconWrap: 'bg-emerald-600 text-white',
    Icon: CircleCheck,
    lead: 'Gut gemacht – weiter so.',
  },
  partial: {
    panel: 'border-amber-200 bg-amber-50',
    iconWrap: 'bg-amber-700 text-white',
    Icon: TriangleAlert,
    lead: 'Fast geschafft – ein Teil fehlt noch.',
  },
  unclear: {
    panel: 'border-amber-200 bg-amber-50',
    iconWrap: 'bg-amber-700 text-white',
    Icon: CircleHelp,
    lead: 'Ich bin mir nicht sicher und frage lieber nach, statt falsch zu bewerten.',
  },
  incorrect: {
    panel: 'border-red-200 bg-red-50',
    iconWrap: 'bg-red-700 text-white',
    Icon: CircleX,
    lead: 'Kein Problem – Fehler gehören zum Lernen. Schau dir an, wo es hakt.',
  },
};

/** Jede Markierung trägt Icon, Text-Label und Erklärung – nie nur Farbe (WCAG 1.4.1). */
const MARK: Record<MarkColor, { Icon: LucideIcon; cls: string; label: string }> = {
  green: { Icon: CircleCheck, cls: 'text-emerald-700', label: 'Korrekt' },
  yellow: { Icon: CircleHelp, cls: 'text-amber-700', label: 'Bitte prüfen' },
  red: { Icon: CircleX, cls: 'text-red-700', label: 'Fehler' },
};

/**
 * Nummern der Markierungen, die auf dem Rechenweg unterstrichen werden (gelb/rot mit Stelle), in Listenreihenfolge.
 * Dieselbe Nummer steht an der Unterstreichung auf Schreibfläche bzw. Foto.
 */
export function markNumbers(marks: CorrectionMark[]): (number | undefined)[] {
  let n = 0;
  return marks.map((m) => (m.region && m.color !== 'green' ? ++n : undefined));
}

/** Rückmeldetexte wie „Richtig!“ wiederholen nur die Überschrift und werden nicht doppelt gezeigt. */
const repeatsHeading = (feedback: string, verdict: Verdict) => feedback.replace(/[!.\s]+$/g, '').trim().toLowerCase() === VERDICT_LABEL[verdict].toLowerCase();

interface Props {
  verdict: Verdict;
  points: number;
  feedback: string;
  marks: CorrectionMark[];
  /** Erkannter typischer Fehler (nur direkt nach der Abgabe bekannt). */
  mistake?: string;
  /** Typische Fehler der Aufgabe, als aufklappbare Liste bei nicht korrekter Lösung. */
  commonMistakes?: CommonMistake[];
  /** Eigene Überschrift bzw. Unterzeile statt der Standardtexte (z. B. „Ergebnis nicht erkennbar“). */
  title?: string;
  subtitle?: string;
}

/** Rückmeldung grün/gelb/rot mit Überschrift in Worten, Markierungen und typischen Fehlern. */
export function FeedbackPanel({ verdict, points, feedback, marks, mistake, commonMistakes = [], title, subtitle }: Props) {
  const s = STYLE[verdict];
  const numbers = markNumbers(marks);
  return (
    <section className={`rounded-2xl border p-6 space-y-4 shadow-sm animate-slide-up ${s.panel}`} role="status" aria-live="polite">
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-full animate-pop ${s.iconWrap}`} aria-hidden="true">
          <s.Icon size={28} strokeWidth={2.25} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-900">
            {title ?? `${VERDICT_LABEL[verdict]}${verdict === 'correct' ? '!' : ''}`}
          </h2>
          <p className="text-slate-700">{subtitle ?? s.lead}</p>
        </div>
        {verdict !== 'unclear' && (
          <span className="flex-none rounded-full bg-white px-3 py-1 text-sm font-semibold tabular-nums text-slate-700 border border-slate-200">
            {Math.round(points * 100)} % der Punkte
          </span>
        )}
      </div>
      {mistake && (
        <p className="rounded-lg bg-white p-4">
          <strong>Typischer Fehler erkannt:</strong> <MathText text={mistake} />
        </p>
      )}
      {marks.length > 0 && (
        <ul className="space-y-2">
          {marks.map((m, i) => {
            const mk = MARK[m.color];
            const n = numbers[i];
            return (
              <li key={i} className="flex gap-3 items-start rounded-lg bg-white/70 p-3">
                <mk.Icon aria-hidden="true" size={20} className={`mt-0.5 flex-none ${mk.cls}`} />
                {n !== undefined && (
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-sm font-bold text-white ${m.color === 'red' ? 'bg-red-600' : 'bg-amber-600'}`}
                    title={`Auf deinem Rechenweg mit ${n} unterstrichen`}
                  >
                    <span className="sr-only">Stelle </span>
                    {n}
                  </span>
                )}
                <span className="min-w-0">
                  <span className={`font-semibold ${mk.cls}`}>{mk.label}: </span>
                  <MathText text={m.message} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {feedback && !marks.some((m) => m.message === feedback) && !repeatsHeading(feedback, verdict) && (
        <p>
          <MathText text={feedback} />
        </p>
      )}
      {verdict !== 'correct' && commonMistakes.length > 0 && (
        <details className="rounded-lg bg-white p-4">
          <summary className="cursor-pointer min-h-11 flex items-center font-semibold">Typische Fehler bei dieser Aufgabe</summary>
          <ul className="mt-2 space-y-2">
            {commonMistakes.map((m) => (
              <li key={m.description}>
                <span className="font-semibold">Häufiger Fehler: </span>
                <MathText text={m.description} /> – <MathText text={m.feedback} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
