import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthShell, authLink, FormMessage, TextField } from '../components/AuthLayout';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';

const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Unbekannter Fehler');

const backToLogin = (
  <Link to="/login" className={authLink}>
    Zurück zur Anmeldung
  </Link>
);

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
    <AuthShell
      title="Passwort vergessen"
      subtitle={sent ? undefined : 'Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.'}
      onSubmit={submit}
      footer={backToLogin}
    >
      {sent ? (
        <FormMessage tone="success">Wenn es ein Konto mit dieser Adresse gibt, haben wir dir einen Link geschickt. Schau auch im Spam-Ordner nach.</FormMessage>
      ) : (
        <>
          <TextField label="E-Mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Button type="submit" variant="primary" loading={busy} className="w-full">
            Link schicken
          </Button>
        </>
      )}
    </AuthShell>
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
    <AuthShell title="Neues Passwort" onSubmit={submit} footer={backToLogin}>
      {loading ? (
        <p className="text-slate-500">Lade …</p>
      ) : !session ? (
        <FormMessage tone="error">
          Der Link ist abgelaufen oder wurde schon benutzt.{' '}
          <Link to="/forgot-password" className="font-semibold underline">
            Neuen Link anfordern
          </Link>
        </FormMessage>
      ) : (
        <>
          <TextField
            label="Neues Passwort"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="Mindestens 8 Zeichen."
          />
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Button type="submit" variant="primary" loading={busy} className="w-full">
            Passwort speichern
          </Button>
        </>
      )}
    </AuthShell>
  );
}
