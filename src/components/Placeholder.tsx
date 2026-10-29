import type { ReactNode } from 'react';

/** Kennzeichnet bewusst unfertige Bereiche (Umsetzung durch Entwickler laut ARCHITECTURE.md). */
export function Todo({ children }: { children: ReactNode }) {
  return <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500">TODO (Entwicklung): {children}</div>;
}
