/** Ladeanzeige, solange ein per Code-Splitting nachgeladener Seitenteil geladen wird. */
export function PageFallback() {
  return (
    <p className="p-8 text-slate-500" role="status">
      Lade …
    </p>
  );
}
