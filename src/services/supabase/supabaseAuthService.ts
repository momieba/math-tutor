import type { AuthError, Session as SbSession } from '@supabase/supabase-js';
import type { Profile, Role, Session } from '../../types';
import type { AuthService } from '../types';
import { getSupabase, isFunctionsError } from './client';

interface ProfileRow {
  id: string;
  display_name: string | null;
  role: Role;
  grade: number | null;
  created_at: string;
  consent_version: string | null;
}

/** Supabase-Auth-Fehler (englisch) für Schüler verständlich machen. Unbekannte Codes behalten die Originalmeldung. */
const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-Mail oder Passwort ist falsch.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in deinem Postfach.',
  user_already_exists: 'Für diese E-Mail-Adresse existiert bereits ein Konto.',
  email_exists: 'Für diese E-Mail-Adresse existiert bereits ein Konto.',
  weak_password: 'Das Passwort ist zu schwach. Nimm mindestens 8 Zeichen mit Buchstaben und Ziffern.',
  same_password: 'Das neue Passwort muss sich vom alten unterscheiden.',
  over_email_send_rate_limit: 'Es wurden gerade zu viele E-Mails verschickt. Bitte warte ein paar Minuten.',
  over_request_rate_limit: 'Zu viele Versuche. Bitte warte kurz und versuche es dann erneut.',
  signup_disabled: 'Registrierungen sind gerade geschlossen.',
  email_address_invalid: 'Diese E-Mail-Adresse ist ungültig.',
};

export function authErrorMessage(error: Pick<AuthError, 'code' | 'message'>): string {
  return (error.code && AUTH_MESSAGES[error.code]) || error.message;
}

function fail(error: AuthError | null): void {
  if (error) throw new Error(authErrorMessage(error));
}

async function toSession(s: SbSession | null): Promise<Session | null> {
  if (!s) return null;
  const sb = await getSupabase();
  // Profil wird per DB-Trigger (handle_new_user) beim Sign-up angelegt.
  const { data } = await sb
    .from('profiles')
    .select('id, display_name, role, grade, created_at, consent_version')
    .eq('id', s.user.id)
    .maybeSingle<ProfileRow>();
  const profile: Profile = {
    id: s.user.id,
    email: s.user.email ?? '',
    displayName: data?.display_name ?? (s.user.user_metadata?.full_name as string | undefined) ?? s.user.email ?? 'Schüler',
    role: data?.role ?? 'student',
    grade: data?.grade ?? undefined,
    createdAt: data?.created_at ?? s.user.created_at,
    consentVersion: data?.consent_version ?? undefined,
  };
  return { user: profile, provider: 'supabase' };
}

export function createSupabaseAuthService(): AuthService {
  return {
    mode: 'supabase',
    async getSession() {
      const sb = await getSupabase();
      const { data } = await sb.auth.getSession();
      return toSession(data.session);
    },
    onAuthChange(cb) {
      // Der Client wird asynchron geladen; wer sich vorher abmeldet, wird nicht mehr angemeldet.
      let unsubscribe: (() => void) | null = null;
      let cancelled = false;
      void getSupabase().then((sb) => {
        if (cancelled) return;
        const { data } = sb.auth.onAuthStateChange((_event, session) => {
          // Supabase empfiehlt, im Callback keine weiteren Supabase-Aufrufe synchron auszuführen.
          setTimeout(() => void toSession(session).then(cb), 0);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      });
      return () => {
        cancelled = true;
        unsubscribe?.();
      };
    },
    async signUpWithEmail(email, password, displayName, consentVersion) {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, consent_version: consentVersion }, emailRedirectTo: `${window.location.origin}/app` },
      });
      fail(error);
      return toSession(data.session); // null ⇒ Bestätigungs-E-Mail erforderlich
    },
    async signInWithEmail(email, password) {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      fail(error);
      return (await toSession(data.session))!;
    },
    async signInWithGoogle() {
      const sb = await getSupabase();
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/app` } });
      fail(error);
    },
    async signOut() {
      const sb = await getSupabase();
      await sb.auth.signOut();
    },
    async requestPasswordReset(email) {
      const sb = await getSupabase();
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      fail(error);
    },
    async updatePassword(password) {
      const sb = await getSupabase();
      const { error } = await sb.auth.updateUser({ password });
      fail(error);
    },
    async acceptTerms(version) {
      const sb = await getSupabase();
      const { error } = await sb.rpc('accept_terms', { p_version: version });
      if (error) throw new Error(error.message);
      const { data } = await sb.auth.getSession();
      const session = await toSession(data.session);
      if (!session) throw new Error('Nicht angemeldet.');
      return session;
    },
    async deleteAccount() {
      const sb = await getSupabase();
      const { error } = await sb.functions.invoke('delete-account', { method: 'POST' });
      if (error) {
        const body = isFunctionsError(error, 'FunctionsHttpError') ? ((await (error.context as Response).json().catch(() => null)) as { error?: string } | null) : null;
        throw new Error(body?.error ?? 'Das Konto konnte nicht gelöscht werden. Bitte versuche es später erneut.');
      }
      // Der Nutzer existiert nicht mehr; nur noch die lokale Sitzung entfernen.
      await sb.auth.signOut({ scope: 'local' });
    },
  };
}
