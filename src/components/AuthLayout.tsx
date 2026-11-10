import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useId, type FormEventHandler, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { PRODUCT_NAME } from '../config/brand';
import { Logo } from './Logo';

/**
 * Rahmen für Anmeldung, Registrierung und Passwortseiten im Designsystem (C2): Logo oben, eine Karte mit Überschrift,
 * darunter Links zu den Rechtstexten. Die Karte ist das Formular selbst, damit Enter überall abschickt.
 */
export function AuthShell({ title, subtitle, onSubmit, children, footer }: { title: string; subtitle?: string; onSubmit: FormEventHandler<HTMLFormElement>; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
        <Link to="/" className="inline-flex min-h-11 items-center rounded-lg" aria-label={`${PRODUCT_NAME} – zur Startseite`}>
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md animate-fade-in">
          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-slate-600">{subtitle}</p>}
            </div>
            {children}
          </form>
          {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </main>
      <footer className="flex flex-wrap justify-center gap-x-4 px-4 pb-6 text-sm text-slate-500">
        <Link to="/legal/impressum" className="inline-flex min-h-11 items-center hover:text-slate-700">
          Impressum
        </Link>
        <Link to="/legal/datenschutz" className="inline-flex min-h-11 items-center hover:text-slate-700">
          Datenschutz
        </Link>
      </footer>
    </div>
  );
}

/** Beschriftetes Eingabefeld (Label über dem Feld, 44-px-Touch-Ziel, sichtbarer Fokusring), optional mit Hilfetext. */
export function TextField({ label, hint, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hintId}
        className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        {...rest}
      />
      {hint && (
        <p id={hintId} className="text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

const MESSAGE_TONE = {
  error: { cls: 'border-red-200 bg-red-50 text-red-800', Icon: AlertCircle, role: 'alert' },
  success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2, role: 'status' },
  info: { cls: 'border-amber-200 bg-amber-50 text-amber-900', Icon: Info, role: 'note' },
} as const;

/** Hinweisbox für Fehler, Erfolg oder Information – immer mit Icon und Text, nie nur Farbe. */
export function FormMessage({ tone, children }: { tone: keyof typeof MESSAGE_TONE; children: ReactNode }) {
  const { cls, Icon, role } = MESSAGE_TONE[tone];
  return (
    <div role={role} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${cls}`}>
      <Icon aria-hidden="true" size={18} className="mt-0.5 flex-none" />
      <div>{children}</div>
    </div>
  );
}

/** Trennlinie „oder“ zwischen E-Mail-Formular und Google-Anmeldung. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500" aria-hidden="true">
      <span className="h-px flex-1 bg-slate-200" />
      oder
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export const authLink = 'font-semibold text-indigo-700 underline-offset-2 hover:underline inline-flex min-h-11 items-center';
