import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { services } from '../services';

/** Login und Registrierung (E-Mail + Google). */
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        const s = await services.auth.signUpWithEmail(email, password, name);
        if (!s) return setInfo('Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.');
      } else {
        await services.auth.signInWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    try {
      await services.auth.signInWithGoogle();
      if (services.mode === 'local') navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3';
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</h1>
        {services.mode === 'local' && <p className="text-sm text-amber-700 bg-amber-50 rounded p-2">Lokaler Modus: Daten bleiben nur in diesem Browser.</p>}
        {mode === 'register' && (
          <label className="block">Name<input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" /></label>
        )}
        <label className="block">E-Mail<input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="block">Passwort<input className={input} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        {info && <p role="status" className="text-green-700 text-sm">{info}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-indigo-600 text-white disabled:opacity-50">{mode === 'login' ? 'Anmelden' : 'Registrieren'}</button>
        <button type="button" onClick={() => void google()} className="w-full rounded-lg border border-slate-300">Mit Google fortfahren</button>
        <p className="text-sm text-center">
          {mode === 'login' ? <Link to="/register" className="text-indigo-700 min-h-11 inline-flex items-center">Noch kein Konto? Registrieren</Link> : <Link to="/login" className="text-indigo-700 min-h-11 inline-flex items-center">Schon ein Konto? Anmelden</Link>}
        </p>
      </form>
    </div>
  );
}
