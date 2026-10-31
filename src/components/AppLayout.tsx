import { FlaskConical, History, House, LogOut, Sigma } from 'lucide-react';
import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';
import { PageFallback } from './PageFallback';

/** Produktname an einer Stelle, bis der endgültige Name feststeht (Briefing R4). */
export const PRODUCT_NAME = 'MatheMentor';

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-bold text-slate-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white" aria-hidden="true">
        <Sigma size={20} strokeWidth={2.5} />
      </span>
      {PRODUCT_NAME}
    </span>
  );
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 min-h-11 px-3 rounded-lg font-medium transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

/**
 * Rahmen der geschützten App: einheitliche Kopfzeile (Logo, Start, Verlauf, Profil) und Inhaltsbereich.
 * „Abmelden“ ist bewusst direkt sichtbar statt in einem Aufklappmenü: ein Tipp weniger auf dem Tablet,
 * und der Profilbereich bleibt ohne verstecktes Menü verständlich.
 */
export function AppLayout() {
  const { session } = useAuth();
  const name = session?.user.displayName ?? '';
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Zum Inhalt springen
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-1 px-4">
          <Link to="/app" className="mr-3 inline-flex items-center rounded-lg" aria-label={`${PRODUCT_NAME} – Start`}>
            <Logo />
          </Link>
          <nav aria-label="Hauptnavigation" className="flex items-center gap-1">
            <NavLink to="/app" end className={navCls}>
              <House aria-hidden="true" size={20} />
              Start
            </NavLink>
            <NavLink to="/app/history" className={navCls}>
              <History aria-hidden="true" size={20} />
              Verlauf
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {services.mode === 'local' && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-medium text-amber-800" title="Daten bleiben nur in diesem Browser">
                <FlaskConical aria-hidden="true" size={16} />
                <span>Lokaler Modus</span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <span className="sr-only">Angemeldet als {name}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-800" aria-hidden="true">
                {name.trim().charAt(0).toUpperCase() || '?'}
              </span>
              <span className="hidden lg:inline max-w-40 truncate text-sm font-medium text-slate-700">{name}</span>
            </span>
            <button
              type="button"
              onClick={() => void services.auth.signOut()}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut aria-hidden="true" size={20} />
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
