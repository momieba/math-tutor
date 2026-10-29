/** Kleiner, versionierter localStorage-Wrapper. Nur für den lokalen Demo-/Entwicklungsmodus. */
import { newUuid } from './cryptoFallback';

const PREFIX = 'mathmvp:v1:';

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  // QuotaExceededError bewusst nicht schlucken: Die UI muss den Fehler anzeigen (keine Lösung darf still verloren gehen).
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

/** UUID v4; funktioniert auch ohne Secure Context (z. B. iPad über http://LAN-IP), siehe cryptoFallback.ts. */
export function newId(): string {
  return newUuid();
}
