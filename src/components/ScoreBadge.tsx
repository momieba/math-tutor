import { scoreBand } from '../domain/score';

function tone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score >= 60) return 'bg-sky-50 text-sky-800 border-sky-200';
  if (score >= 40) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

/**
 * Verständnis-Score 0–100 mit Stufe aus Konzept §13 (scoreBand).
 * - `compact`: nur die Zahl
 * - `band`: Stufe in Worten als Hauptinformation, Zahl klein daneben (Kacheln, Briefing C5)
 */
export function ScoreBadge({ score, compact = false, variant = 'number' }: { score: number; compact?: boolean; variant?: 'number' | 'band' }) {
  const band = scoreBand(score);
  const label = `Verständnis-Score ${score} von 100: ${band}`;
  if (variant === 'band') {
    return (
      <span className={`inline-flex items-baseline gap-2 rounded-lg border px-3 py-1 ${tone(score)}`} title={label} aria-label={label}>
        <span className="font-semibold">{band}</span>
        <span className="text-sm tabular-nums">{score}/100</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-baseline gap-2 rounded-lg border px-3 py-1 ${tone(score)}`} title={label} aria-label={label}>
      <span className="text-lg font-bold tabular-nums">{score}</span>
      <span className="text-sm">/100</span>
      {!compact && <span className="text-sm">{band}</span>}
    </span>
  );
}
