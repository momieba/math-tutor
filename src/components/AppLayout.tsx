import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';
import { PageFallback } from './PageFallback';

export function AppLayout() {
  const { session } = useAuth();
  const nav = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg flex items-center ${isActive ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'}`;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 flex items-center gap-2 h-16">
          <Link to="/app" className="font-bold text-indigo-700 mr-4 flex items-center">MatheMentor</Link>
          <NavLink to="/app" end className={nav}>Dashboard</NavLink>
          <NavLink to="/app/history" className={nav}>Verlauf</NavLink>
          <span className="ml-auto text-sm text-slate-500 hidden sm:inline">{session?.user.displayName}</span>
          {services.mode === 'local' && <span className="text-sm rounded bg-amber-100 text-amber-800 px-2 py-1">Lokaler Modus</span>}
          <button onClick={() => void services.auth.signOut()} className="px-3 rounded-lg text-slate-600 hover:bg-slate-100">Abmelden</button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
