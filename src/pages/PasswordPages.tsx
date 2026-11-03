import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';

const input = 'w-full rounded-lg border border-slate-300 px-3';
const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Unbekannter Fehler');

/** „Passwort vergessen“: schickt einen Link an die E-Mail-Adresse (Supabase leitet danach auf /reset-password weiter). */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await services.auth.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">Passwort vergessen</h1>
        {sent ? (
          <p role="status" className="text-green-700">
            Wenn es ein Konto mit dieser Adresse gibt, haben wir dir einen Link geschickt. Schau auch im Spam-Ordner nach.
          </p>
        ) : (
          <>
            <p className="text-slate-600 text-sm">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.</p>
            <label className="block">E-Mail<input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-indigo-600 text-white disabled:opacity-50">Link schicken</button>
          </>
        )}
        <p className="text-sm text-center">
          <Link to="/login" className="text-indigo-700 min-h-11 inline-flex items-center">Zurück zur Anmeldung</Link>
        </p>
      </form>
    </div>
  );
}

/** Ziel des Links aus der E-Mail: Supabase hat bereits eine Wiederherstellungs-Sitzung angelegt, hier wird das neue Passwort gesetzt. */
export function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await services.auth.updatePassword(password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">Neues Passwort</h1>
        {loading ? (
          <p className="text-slate-500">Lade …</p>
        ) : !session ? (
          <p role="alert" className="text-red-700">
            Der Link ist abgelaufen oder wurde schon benutzt. <Link to="/forgot-password" className="underline">Neuen Link anfordern</Link>
          </p>
        ) : (
          <>
            <label className="block">Neues Passwort<input className={input} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-indigo-600 text-white disabled:opacity-50">Passwort speichern</button>
          </>
        )}
      </form>
    </div>
  );
}
