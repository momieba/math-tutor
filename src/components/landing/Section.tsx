import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'plain' | 'white' | 'dark';

const TONE: Record<Tone, string> = {
  plain: 'bg-slate-50 text-slate-900',
  white: 'bg-white text-slate-900',
  dark: 'bg-slate-900 text-white',
};

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: Tone;
  children?: ReactNode;
  /** Zusatz neben der Überschrift, z. B. ein „Bald“-Badge. */
  badge?: ReactNode;
}

/**
 * Abschnitt der Landingpage: Anker-ID, kleine Überschrift, h2, Einleitung.
 * Abstände nach Designsystem C2 (Abschnitte 64–96 px, Textbreite max. ~70 Zeichen).
 */
export function Section({ id, eyebrow, title, intro, tone = 'plain', badge, children }: SectionProps) {
  const dark = tone === 'dark';
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${TONE[tone]} py-16 lg:py-24`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          {eyebrow && <p className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-indigo-200' : 'text-indigo-700'}`}>{eyebrow}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 id={`${id}-title`} className="text-3xl font-bold tracking-tight lg:text-4xl">
              {title}
            </h2>
            {badge}
          </div>
          {intro && <p className={`mt-4 text-lg ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{intro}</p>}
        </div>
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}

/** Ehrliche Kennzeichnung von Funktionen, die es noch nicht gibt (Briefing C1 „Ehrlich“, D-17). */
export function SoonBadge({ children = 'Bald' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
      <Clock aria-hidden="true" size={16} />
      {children}
    </span>
  );
}
