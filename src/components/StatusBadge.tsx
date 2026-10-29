import { CHAPTER_STATUS_LABEL, type ChapterStatus } from '../types';

/** Farbe + Symbol + Text, damit der Status auch ohne Farbwahrnehmung erkennbar ist. */
const STYLE: Record<ChapterStatus, { cls: string; icon: string }> = {
  not_started: { cls: 'bg-slate-100 text-slate-700 border-slate-300', icon: '○' },
  in_progress: { cls: 'bg-sky-100 text-sky-800 border-sky-300', icon: '◐' },
  needs_practice: { cls: 'bg-amber-100 text-amber-900 border-amber-300', icon: '!' },
  mastered: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✓' },
};

export function StatusBadge({ status }: { status: ChapterStatus }) {
  const s = STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium whitespace-nowrap ${s.cls}`}>
      <span aria-hidden="true">{s.icon}</span>
      {CHAPTER_STATUS_LABEL[status]}
    </span>
  );
}
