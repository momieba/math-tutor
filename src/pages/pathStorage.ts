/**
 * Merkt sich im Browser, ob Einstieg und Erklärung eines Kapitels gesehen oder übersprungen wurden.
 * Reine Bequemlichkeit: Geht der Eintrag verloren, beginnt der Lernpfad wieder beim Einstieg (überspringbar).
 */
export interface SeenSteps {
  intro: boolean;
  explain: boolean;
}

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

export function markSeen(userId: string, chapterId: string, steps: Partial<SeenSteps>): SeenSteps {
  const next = { ...readSeen(userId, chapterId), ...steps };
  try {
    localStorage.setItem(key(userId, chapterId), JSON.stringify(next));
  } catch {
    // privater Modus o. Ä.: dann eben ohne Merken
  }
  return next;
}
