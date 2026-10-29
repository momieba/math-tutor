import { scoreBand } from '../domain/score';

function tone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score >= 60) return 'bg-sky-50 text-sky-800 border-sky-200';
  if (score >= 40) return 'bg-amber-50 text-amber-900 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

/** Verständnis-Score 0–100 mit Stufe aus Konzept §13 (scoreBand). `compact` zeigt nur die Zahl. */
export function ScoreBadge({ score, compact = false }: { score: number; compact?: boolean }) {
  const band = scoreBand(score);
  return (
    <span
      className={`inline-flex items-baseline gap-2 rounded-xl border px-3 py-1 ${tone(score)}`}
      title={`Verständnis-Score ${score} von 100: ${band}`}
      aria-label={`Verständnis-Score ${score} von 100: ${band}`}
    >
      <span className="text-lg font-bold tabular-nums">{score}</span>
      <span className="text-xs">/100</span>
      {!compact && <span className="text-sm">{band}</span>}
    </span>
  );
}
