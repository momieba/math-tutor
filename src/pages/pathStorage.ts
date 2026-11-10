/**
 * Merkt sich, ob Einstieg und Erklärung eines Kapitels gesehen oder übersprungen wurden.
 * Der Browser dient als schneller, synchroner Zwischenspeicher (für domain/learningPath.ts); im Supabase-Modus wird der
 * Stand zusätzlich serverseitig gespeichert (Tabelle learning_path_seen) und beim Öffnen eines Kapitels übernommen,
 * damit er auf allen Geräten gilt. Gesehen bleibt gesehen: Beide Stände werden mit ODER zusammengeführt.
 * Geht alles verloren, beginnt der Lernpfad wieder beim Einstieg (überspringbar).
 */
import { services, type PathSeen } from '../services';

export type SeenSteps = PathSeen;

const key = (userId: string, chapterId: string) => `mathmvp:v1:path:${userId}:${chapterId}`;

export function readSeen(userId: string, chapterId: string): SeenSteps {
  try {
    const raw = localStorage.getItem(key(userId, chapterId));
    const v = raw ? (JSON.parse(raw) as Partial<SeenSteps>) : {};
    return { intro: v.intro === true, explain: v.explain === true };
  } catch {
    return { intro: false, explain: false };
  }
}

function writeLocal(userId: string, chapterId: string, seen: SeenSteps) {
  try {
    localStorage.setItem(key(userId, chapterId), JSON.stringify(seen));
  } catch {
    // privater Modus o. Ä.: dann eben ohne Merken im Browser
  }
}

const merge = (a: SeenSteps, b: Partial<SeenSteps>): SeenSteps => ({ intro: a.intro || b.intro === true, explain: a.explain || b.explain === true });

/** Markiert Schritte als gesehen: sofort im Browser, im Hintergrund auf dem Server (Fehler ändern nichts am Ablauf). */
export function markSeen(userId: string, chapterId: string, steps: Partial<SeenSteps>): SeenSteps {
  const next = merge(readSeen(userId, chapterId), steps);
  writeLocal(userId, chapterId, next);
  void services.learner.markPathSeen(userId, chapterId, next).catch(() => undefined);
  return next;
}

/**
 * Übernimmt den Serverstand in den Browser (z. B. auf einem neuen Gerät) und meldet einen nur lokal bekannten Stand
 * an den Server nach (z. B. aus der Zeit vor der serverseitigen Speicherung). Liefert den zusammengeführten Stand.
 */
export async function syncSeen(userId: string, chapterId: string): Promise<SeenSteps> {
  const local = readSeen(userId, chapterId);
  const remote = await services.learner.getPathSeen(userId, chapterId).catch(() => null);
  if (services.mode === 'local') return local;
  const merged = merge(local, remote ?? {});
  writeLocal(userId, chapterId, merged);
  const remoteBehind = !remote || remote.intro !== merged.intro || remote.explain !== merged.explain;
  if (remoteBehind && (merged.intro || merged.explain)) void services.learner.markPathSeen(userId, chapterId, merged).catch(() => undefined);
  return merged;
}
