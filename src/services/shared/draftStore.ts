/**
 * Entwurfs-Speicher für nicht gespeicherte Abgaben. Liegt in BEIDEN Modi im Browser (localStorage),
 * weil er genau dann gebraucht wird, wenn das Backend nicht erreichbar ist.
 * Der Speicher wird injiziert (Tests, später IndexedDB), Standard ist `localStorage`.
 */
import type { DraftRepository, PendingAttempt } from '../types';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const PREFIX = 'mathmvp:v1:draft:';
const keyOf = (userId: string, exerciseId: string) => `${PREFIX}${userId}:${exerciseId}`;

/** Fallback, falls kein localStorage verfügbar ist (z. B. privater Modus mit Sperre): Entwurf nur im Speicher. */
export function createMemoryStorage(): KeyValueStorage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

function defaultStorage(): KeyValueStorage {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // Zugriff verweigert (Browser-Einstellung) ⇒ Speicher-Fallback
  }
  return createMemoryStorage();
}

function isPendingAttempt(v: unknown): v is PendingAttempt {
  const d = v as PendingAttempt;
  return !!d && typeof d === 'object' && typeof d.savedAt === 'string' && !!d.input && typeof d.input.exerciseId === 'string' && typeof d.input.userId === 'string';
}

export function createDraftStore(storage: KeyValueStorage = defaultStorage()): DraftRepository {
  return {
    async get(userId, exerciseId) {
      try {
        const raw = storage.getItem(keyOf(userId, exerciseId));
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        return isPendingAttempt(parsed) ? parsed : null;
      } catch {
        return null; // beschädigter Eintrag: lieber kein Entwurf als ein Absturz
      }
    },
    async save(draft) {
      const key = keyOf(draft.input.userId, draft.input.exerciseId);
      try {
        storage.setItem(key, JSON.stringify(draft));
        return { saved: true, imageDropped: false };
      } catch {
        // Meist QuotaExceededError: ohne Bild/Striche erneut versuchen, damit wenigstens die Antwort erhalten bleibt.
        if (!draft.input.submission) return { saved: false, imageDropped: false };
        try {
          const slim: PendingAttempt = { ...draft, imageDropped: true, input: { ...draft.input, submission: { kind: draft.input.submission.kind } } };
          storage.setItem(key, JSON.stringify(slim));
          return { saved: true, imageDropped: true };
        } catch {
          return { saved: false, imageDropped: true };
        }
      }
    },
    async remove(userId, exerciseId) {
      try {
        storage.removeItem(keyOf(userId, exerciseId));
      } catch {
        // ignorieren: Entfernen eines Entwurfs darf die Abgabe nicht scheitern lassen
      }
    },
  };
}
