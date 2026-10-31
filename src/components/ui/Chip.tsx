import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Auswahl-/Vorschlags-Chip: voll gerundet, Touch-Ziel ≥ 44 px. */
export function Chip({ icon, selected = false, className = '', children, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; selected?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 min-h-11 rounded-full border px-4 text-base font-medium transition-colors duration-150 active:scale-[0.98] ${
        selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
      } disabled:opacity-40 ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/** Nicht klickbares Etikett (z. B. Aufgabentyp, Schwierigkeit). */
export function Tag({ icon, children, className = '' }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ${className}`}>{icon}{children}</span>;
}
