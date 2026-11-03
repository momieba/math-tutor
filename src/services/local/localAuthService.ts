/**
 * Mock-Auth für den lokalen Modus. NICHT sicher – nur für Entwicklung/Demo ohne Cloud-Konto.
 * Passwörter werden gehasht (SHA-256 + Salt) abgelegt, damit sie nicht im Klartext im Browser liegen.
 */
import type { Profile, Session } from '../../types';
import type { AuthService } from '../types';
import { sha256Hex } from './cryptoFallback';
import { newId, readJson, removeKey, writeJson } from './storage';

interface LocalUser {
  profile: Profile;
  salt: string;
  passwordHash: string;
}

const USERS = 'users';
const SESSION = 'session';

/** SHA-256 über „salt:passwort“. Ohne `crypto.subtle` (kein HTTPS) greift ein identischer JS-Fallback (BUG-08). */
export function hashPassword(salt: string, password: string): Promise<string> {
  return sha256Hex(`${salt}:${password}`);
}

/** `onDelete` entfernt beim Löschen des Kontos die Lerndaten (liegen im LearnerRepository). */
export function createLocalAuthService(onDelete: (userId: string) => void = () => {}): AuthService {
  const listeners = new Set<(s: Session | null) => void>();
  const users = () => readJson<LocalUser[]>(USERS, []);
  const current = (): Session | null => {
    const id = readJson<string | null>(SESSION, null);
    const u = id ? users().find((x) => x.profile.id === id) : undefined;
    return u ? { user: u.profile, provider: 'local' } : null;
  };
  const emit = () => listeners.forEach((l) => l(current()));
  const login = (id: string) => {
    writeJson(SESSION, id);
    emit();
    return current()!;
  };

  return {
    mode: 'local',
    async getSession() {
      return current();
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async signUpWithEmail(email, password, displayName, consentVersion) {
      const e = email.trim().toLowerCase();
      if (users().some((u) => u.profile.email === e)) throw new Error('Für diese E-Mail-Adresse existiert bereits ein Konto.');
      if (password.length < 8) throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.');
      const salt = newId();
      const profile: Profile = {
        id: newId(),
        email: e,
        displayName: displayName.trim() || e.split('@')[0],
        role: 'student',
        createdAt: new Date().toISOString(),
        consentVersion,
      };
      writeJson(USERS, [...users(), { profile, salt, passwordHash: await hashPassword(salt, password) }]);
      return login(profile.id);
    },
    async signInWithEmail(email, password) {
      const u = users().find((x) => x.profile.email === email.trim().toLowerCase());
      if (!u || (await hashPassword(u.salt, password)) !== u.passwordHash) throw new Error('E-Mail oder Passwort ist falsch.');
      return login(u.profile.id);
    },
    async signInWithGoogle() {
      const email = 'google-demo@example.local';
      let u = users().find((x) => x.profile.email === email);
      if (!u) {
        u = { profile: { id: newId(), email, displayName: 'Demo (Google)', role: 'student', createdAt: new Date().toISOString() }, salt: '', passwordHash: '' };
        writeJson(USERS, [...users(), u]);
      }
      login(u.profile.id);
    },
    async signOut() {
      removeKey(SESSION);
      emit();
    },
    async requestPasswordReset() {
      throw new Error('Im lokalen Modus gibt es keinen E-Mail-Versand. Lege einfach ein neues Konto an.');
    },
    async updatePassword(password) {
      const s = current();
      if (!s) throw new Error('Nicht angemeldet.');
      if (password.length < 8) throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.');
      const salt = newId();
      const passwordHash = await hashPassword(salt, password);
      writeJson(USERS, users().map((u) => (u.profile.id === s.user.id ? { ...u, salt, passwordHash } : u)));
    },
    async acceptTerms(version) {
      const s = current();
      if (!s) throw new Error('Nicht angemeldet.');
      writeJson(USERS, users().map((u) => (u.profile.id === s.user.id ? { ...u, profile: { ...u.profile, consentVersion: version } } : u)));
      return login(s.user.id);
    },
    async deleteAccount() {
      const s = current();
      if (!s) return;
      onDelete(s.user.id);
      writeJson(USERS, users().filter((u) => u.profile.id !== s.user.id));
      removeKey(SESSION);
      emit();
    },
  };
}
