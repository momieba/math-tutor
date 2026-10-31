/** Platzhalter beim Laden (statt leerem Bildschirm / springendem Layout). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

/** Skeleton in Form einer Karte; `label` wird für Screenreader angesagt. */
export function SkeletonCard({ label = 'Wird geladen …', lines = 3 }: { label?: string; lines?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" role="presentation">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      {Array.from({ length: lines - 2 }, (_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}
