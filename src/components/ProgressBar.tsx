/**
 * Fortschrittsbalken (0..1). Zeigt zusätzlich den Prozentwert als Text – nicht nur über Farbe/Länge.
 * `size="sm"` für Listen, `md` für Kacheln/Kopfbereiche.
 */
export function ProgressBar({
  value,
  label = 'Fortschritt',
  showValue = true,
  size = 'md',
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}) {
  const pct = Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100);
  return (
    <div className="w-full">
      {showValue && (
        <div className="flex justify-between gap-2 text-sm text-slate-600 mb-1">
          <span>{label}</span>
          <span className="font-semibold tabular-nums text-slate-900">{pct} %</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={`${size === 'sm' ? 'h-2' : 'h-3'} w-full rounded-full bg-slate-200 overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${pct === 100 ? 'bg-emerald-600' : 'bg-indigo-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
