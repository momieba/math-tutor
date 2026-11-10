import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AuthShell, authLink, FormMessage, OrDivider, TextField } from '../components/AuthLayout';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { Button } from '../components/ui';
import { CONSENT_VERSION } from '../config/legal';
import { services } from '../services';

/** „G“ von Google als neutrales Zeichen (kein Markenlogo), damit der Button auch ohne Bild erkennbar ist. */
function GoogleMark() {
  return (
    <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
      G
    </span>
  );
}

/** Login und Registrierung (E-Mail + Google). Registrierung nur mit Einwilligung (Version in src/config/legal.ts). */
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (register) {
        const s = await services.auth.signUpWithEmail(email, password, name, CONSENT_VERSION);
        if (!s) return setInfo('Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.');
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

  return (
    <AuthShell
      title={register ? 'Konto erstellen' : 'Anmelden'}
      subtitle={register ? 'Kostenlos und in einer Minute startklar.' : 'Schön, dass du wieder da bist.'}
      onSubmit={submit}
      footer={
        <Link to={register ? '/login' : '/register'} className="inline-flex min-h-11 items-center gap-1 text-slate-600 hover:text-slate-900">
          {register ? 'Schon ein Konto?' : 'Noch kein Konto?'} <span className="font-semibold text-indigo-700 underline-offset-2 hover:underline">{register ? 'Anmelden' : 'Registrieren'}</span>
        </Link>
      }
    >
      {services.mode === 'local' && <FormMessage tone="info">Lokaler Modus: Daten bleiben nur in diesem Browser.</FormMessage>}
      {register && <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" hint="Wird nur dir angezeigt, z. B. dein Vorname." />}
      <TextField label="E-Mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <div>
        <TextField
          label="Passwort"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={register ? 'new-password' : 'current-password'}
          hint={register ? 'Mindestens 8 Zeichen.' : undefined}
        />
        {!register && (
          <p className="text-right text-sm">
            <Link to="/forgot-password" className={authLink}>
              Passwort vergessen?
            </Link>
          </p>
        )}
      </div>
      {register && <ConsentCheckbox checked={consent} onChange={setConsent} required />}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {info && <FormMessage tone="success">{info}</FormMessage>}
      <Button type="submit" variant="primary" loading={busy} className="w-full">
        {register ? 'Registrieren' : 'Anmelden'}
      </Button>
      <OrDivider />
      <Button onClick={() => void google()} variant="secondary" icon={<GoogleMark />} className="w-full">
        Mit Google fortfahren
      </Button>
    </AuthShell>
  );
}
