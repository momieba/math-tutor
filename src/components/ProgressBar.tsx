/** Fortschrittsbalken (0..1). Zeigt zusätzlich den Prozentwert als Text – nicht nur über Farbe/Länge. */
export function ProgressBar({ value, label = 'Fortschritt', showValue = true }: { value: number; label?: string; showValue?: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100);
  return (
    <div className="w-full">
      {showValue && (
        <div className="flex justify-between text-sm text-slate-600 mb-1">
          <span>{label}</span>
          <span className="font-medium tabular-nums">{pct} %</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-3 w-full rounded-full bg-slate-200 overflow-hidden"
      >
        <div className={`h-full rounded-full transition-[width] ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
