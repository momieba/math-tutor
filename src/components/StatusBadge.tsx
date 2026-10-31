import { Circle, CircleAlert, CircleCheck, CircleDot, type LucideIcon } from 'lucide-react';
import { CHAPTER_STATUS_LABEL, type ChapterStatus } from '../types';

/** Farbe + Icon + Text, damit der Status auch ohne Farbwahrnehmung erkennbar ist (WCAG 1.4.1). */
const STYLE: Record<ChapterStatus, { cls: string; Icon: LucideIcon }> = {
  not_started: { cls: 'bg-slate-100 text-slate-700 border-slate-300', Icon: Circle },
  in_progress: { cls: 'bg-sky-50 text-sky-800 border-sky-200', Icon: CircleDot },
  needs_practice: { cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: CircleAlert },
  mastered: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: CircleCheck },
};

export function StatusBadge({ status }: { status: ChapterStatus }) {
  const { cls, Icon } = STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap ${cls}`}>
      <Icon aria-hidden="true" size={16} strokeWidth={2.25} />
      {CHAPTER_STATUS_LABEL[status]}
    </span>
  );
}
