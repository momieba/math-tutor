import type { Session as SbSession } from '@supabase/supabase-js';
import type { Profile, Role, Session } from '../../types';
import type { AuthService } from '../types';
import { getSupabase } from './client';

interface ProfileRow {
  id: string;
  display_name: string | null;
  role: Role;
  grade: number | null;
  created_at: string;
}

async function toSession(s: SbSession | null): Promise<Session | null> {
  if (!s) return null;
  const sb = getSupabase();
  // Profil wird per DB-Trigger (handle_new_user) beim Sign-up angelegt.
  const { data } = await sb.from('profiles').select('id, display_name, role, grade, created_at').eq('id', s.user.id).maybeSingle<ProfileRow>();
  const profile: Profile = {
    id: s.user.id,
    email: s.user.email ?? '',
    displayName: data?.display_name ?? (s.user.user_metadata?.full_name as string | undefined) ?? s.user.email ?? 'Schüler',
    role: data?.role ?? 'student',
    grade: data?.grade ?? undefined,
    createdAt: data?.created_at ?? s.user.created_at,
  };
  return { user: profile, provider: 'supabase' };
}

export function createSupabaseAuthService(): AuthService {
  const sb = getSupabase();
  return {
    mode: 'supabase',
    async getSession() {
      const { data } = await sb.auth.getSession();
      return toSession(data.session);
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        // Supabase empfiehlt, im Callback keine weiteren Supabase-Aufrufe synchron auszuführen.
        setTimeout(() => void toSession(session).then(cb), 0);
      });
      return () => data.subscription.unsubscribe();
    },
    async signUpWithEmail(email, password, displayName) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) throw new Error(error.message);
      return toSession(data.session); // null ⇒ Bestätigungs-E-Mail erforderlich
    },
    async signInWithEmail(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return (await toSession(data.session))!;
    },
    async signInWithGoogle() {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/app` } });
      if (error) throw new Error(error.message);
    },
    async signOut() {
      await sb.auth.signOut();
    },
  };
}
