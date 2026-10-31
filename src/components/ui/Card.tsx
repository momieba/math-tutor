import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'default' | 'brand' | 'muted';

const TONE: Record<Tone, string> = {
  default: 'bg-white border border-slate-200 shadow-sm',
  brand: 'bg-indigo-50 border border-indigo-200',
  muted: 'bg-slate-100 border border-slate-200',
};

/** Karte mit 16-px-Radius und 24-px-Innenabstand (Designsystem C2). */
export function Card({ tone = 'default', className = '', children, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone; children?: ReactNode }) {
  return (
    <div className={`rounded-2xl p-6 ${TONE[tone]} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Kleine Überschrift über Abschnitten („Eyebrow“). */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm font-semibold uppercase tracking-wide text-indigo-700 ${className}`}>{children}</p>;
}
