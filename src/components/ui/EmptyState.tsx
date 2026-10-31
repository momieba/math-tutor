import type { ReactNode } from 'react';

/** Leerzustand: Icon, ein Satz, optional eine Aktion (Designsystem C2). */
export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center flex flex-col items-center gap-3">
      {icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="font-semibold text-slate-900">{title}</p>
      {children && <div className="text-slate-600 max-w-prose">{children}</div>}
      {action}
    </div>
  );
}
