import { Check } from 'lucide-react';
import { scoreBand } from '../domain/score';

/**
 * Dezenter Status-Ring (Score 0–100). Die Bedeutung steht zusätzlich im aria-label und als Zahl bzw. Häkchen im Ring,
 * nicht nur in der Farbe. Gleiches aria-label wie ScoreBadge, damit Tests und Screenreader beides gleich lesen.
 */
export function ProgressRing({ score, mastered = false, size = 44 }: { score: number; mastered?: boolean; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const label = `Verständnis-Score ${score} von 100: ${scoreBand(score)}`;
  const color = mastered ? 'text-emerald-600' : score > 0 ? 'text-indigo-600' : 'text-slate-300';
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label} title={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, score)) / 100)}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-slate-700" aria-hidden="true">
        {mastered ? <Check size={18} className="text-emerald-700" /> : score}
      </span>
    </span>
  );
}
