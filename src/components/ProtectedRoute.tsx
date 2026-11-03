import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { CONSENT_VERSION } from '../config/legal';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';
import { ConsentCheckbox } from './ConsentCheckbox';
import { Button } from './ui';

/**
 * UI-Schutz für /app. Echte Autorisierung erfolgt serverseitig (RLS) – dies ist nur Navigation.
 * Ohne aktuelle Einwilligung (z. B. erste Anmeldung mit Google oder geänderte Rechtstexte) wird zuerst gefragt.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-8 text-slate-500">Lade …</p>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (session.user.consentVersion !== CONSENT_VERSION) return <ConsentGate />;
  return <Outlet />;
}

function ConsentGate() {
  const { refresh } = useAuth();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await services.auth.acceptTerms(CONSENT_VERSION);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 space-y-4" aria-labelledby="consent-heading">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-800" aria-hidden="true">
            <ShieldCheck size={20} />
          </span>
          <h1 id="consent-heading" className="text-xl font-bold">
            Bevor es losgeht
          </h1>
        </div>
        <p className="text-slate-600">Wir speichern deine Lösungen und deinen Lernstand, damit du später weitermachen kannst. Dafür brauchen wir dein Einverständnis.</p>
        <ConsentCheckbox checked={checked} onChange={setChecked} />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => void accept()} disabled={!checked} loading={busy}>
            Einverstanden
          </Button>
          <Button variant="ghost" onClick={() => void services.auth.signOut()}>
            Abmelden
          </Button>
        </div>
      </section>
    </div>
  );
}
