import { Skeleton } from './ui/Skeleton';

/** Ladeanzeige (Skeleton), solange ein per Code-Splitting nachgeladener Seitenteil geladen wird. */
export function PageFallback() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-4" role="status">
      <span className="sr-only">Lade …</span>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
