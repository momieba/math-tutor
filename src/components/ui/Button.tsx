import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 min-h-11 rounded-lg font-semibold whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:active:scale-100 ' +
  // Deaktiviert: einheitlich neutral und lesbar (slate-600 auf slate-100 ≈ 6,9 : 1) statt blasser Deckkraft.
  // Beim Laden (aria-busy) bleibt die Variante sichtbar, nur leicht gedimmt.
  'disabled:not-aria-busy:bg-slate-100 disabled:not-aria-busy:text-slate-600 disabled:not-aria-busy:border disabled:not-aria-busy:border-slate-200 disabled:not-aria-busy:shadow-none ' +
  'aria-busy:opacity-80';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
  secondary: 'bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-700 text-white shadow-sm hover:bg-red-800',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'px-4 text-base',
  lg: 'px-6 min-h-12 text-lg',
};

/** Klassen für Buttons und button-artige Links. Die Hauptaktion eines Bildschirms nutzt `primary`. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra = ''): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Zeigt einen Spinner, sperrt Doppelklicks und behält die Breite bei. */
  loading?: boolean;
  icon?: ReactNode;
}

/**
 * Button mit vier Varianten. `data-variant` macht die Hauptaktion für Tests prüfbar
 * (Abnahme-Checkliste D-09: genau eine Hauptaktion pro Bildschirm).
 */
export function Button({ variant = 'secondary', size = 'md', loading = false, icon, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

/** Link im Button-Look (Navigation statt Aktion). */
export function ButtonLink({ variant = 'secondary', size = 'md', icon, iconRight, className = '', children, ...rest }: ButtonLinkProps) {
  return (
    <Link data-variant={variant} className={buttonClass(variant, size, typeof className === 'string' ? className : '')} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

export function Spinner() {
  return <span aria-hidden="true" className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />;
}
