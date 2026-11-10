/**
 * Adaptive Auswahl „Nächste Aufgabe“ aus dem Aufgabenpool eines Kapitels. Reine Funktionen, backend-unabhängig.
 * Idee: Start auf der leichtesten Stufe; nach einer Serie richtiger Antworten geht es eine Stufe hoch,
 * nach wiederholten Fehlern eine Stufe runter. Innerhalb der Stufe zuerst neue Aufgaben, Anforderungsarten gemischt.
 */
import type { Attempt, Difficulty, Exercise, Requirement } from '../types';
import { attemptCredit, exerciseCredit, SCORE_CONFIG } from './score';

export type SelectableExercise = Pick<Exercise, 'id' | 'difficulty' | 'requirement'>;

export const SELECTION_CONFIG = {
  promoteAfter: 3, // 3 gelöste Aufgaben in Folge ⇒ eine Stufe höher
  demoteAfter: 2, // 2 Fehlschläge in Folge ⇒ eine Stufe tiefer
  failBelow: 0.5, // Versuch mit weniger als 50 % gilt als Fehlschlag
  retryAfterHours: 20, // falsch gelöste Aufgaben frühestens nach 20 h erneut (zählt dann als Bestätigung, score.ts)
  requirementLookback: 4, // Mischen: Anforderungsarten der letzten 4 Versuche meiden
};

/** Stufen, die es im Pool gibt, aufsteigend (meist 1, 2, 3). */
function levelsOf(pool: SelectableExercise[]): Difficulty[] {
  return [...new Set(pool.map((e) => e.difficulty))].sort((a, b) => a - b);
}

const chronological = (attempts: Attempt[]) => [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

/** Aktuelle Stufe aus der Versuchsfolge im Kapitel (nur Versuche an Aufgaben dieses Pools zählen). */
export function currentLevel(pool: SelectableExercise[], attempts: Attempt[]): Difficulty {
  const c = SELECTION_CONFIG;
  const levels = levelsOf(pool);
  if (levels.length === 0) return 1;
  const byId = new Map(pool.map((e) => [e.id, e]));
  let index = 0;
  let good = 0;
  let bad = 0;
  for (const a of chronological(attempts)) {
    const e = byId.get(a.exerciseId);
    if (!e) continue;
    const credit = attemptCredit(a);
    if (credit >= SCORE_CONFIG.solvedThreshold) {
      bad = 0;
      if (e.difficulty >= levels[index]) good++; // leichtere Ausweich-Aufgaben zählen nicht für den Aufstieg
      if (good >= c.promoteAfter && index < levels.length - 1) {
        index++;
        good = 0;
      }
    } else if (credit < c.failBelow) {
      good = 0;
      bad++;
      if (bad >= c.demoteAfter && index > 0) {
        index--;
        bad = 0;
      }
    } else {
      good = 0;
      bad = 0;
    }
  }
  return levels[index];
}

/** Deterministischer Zufallswert in [0, 1) aus einem String (gleiche Eingabe ⇒ gleiche Reihenfolge). */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

export interface SelectionOptions {
  now: Date;
  /** Für die Reihenfolge bei Gleichstand, z. B. Nutzer-ID + Datum: jeden Tag eine andere, aber stabile Reihenfolge. */
  seed: string;
  /** Gerade bearbeitete Aufgabe, die nicht sofort wieder drankommen soll. */
  excludeId?: string;
}

/**
 * Wählt die nächste Aufgabe. Reihenfolge der Kandidaten:
 * 1. neue Aufgaben der aktuellen Stufe
 * 2. früher nicht gelöste Aufgaben der aktuellen Stufe, frühestens nach `retryAfterHours`
 * 3. neue Aufgaben der nächstleichteren Stufe
 * 4. nicht gelöste Aufgaben der aktuellen Stufe, auch vor Ablauf der Wartezeit (wer hier Fehler macht, soll nicht
 *    schwerere Aufgaben bekommen, nur weil die Stufe verbraucht ist)
 * 5. neue Aufgaben der nächstschwereren Stufe
 * 6. alle übrigen Aufgaben, die am längsten nicht dran waren
 * Innerhalb einer Gruppe wird eine Anforderungsart bevorzugt, die zuletzt nicht dran war.
 */
export function nextExercise<E extends SelectableExercise>(pool: E[], attempts: Attempt[], opts: SelectionOptions): { exercise: E; level: Difficulty } | null {
  const c = SELECTION_CONFIG;
  const candidates = pool.filter((e) => e.id !== opts.excludeId);
  if (candidates.length === 0) return pool[0] ? { exercise: pool[0], level: currentLevel(pool, attempts) } : null;

  const ids = new Set(pool.map((e) => e.id));
  const own = chronological(attempts.filter((a) => ids.has(a.exerciseId)));
  const level = currentLevel(pool, own);
  const byExercise = new Map<string, Attempt[]>();
  for (const a of own) byExercise.set(a.exerciseId, [...(byExercise.get(a.exerciseId) ?? []), a]);
  const lastAt = (id: string) => byExercise.get(id)?.at(-1)?.submittedAt;
  const retryBefore = new Date(opts.now.getTime() - c.retryAfterHours * 3600_000).toISOString();

  const isNew = (e: E) => !byExercise.has(e.id);
  const isUnsolved = (e: E) => {
    const list = byExercise.get(e.id);
    return !!list && exerciseCredit(list) < SCORE_CONFIG.solvedThreshold;
  };
  const isRetry = (e: E) => isUnsolved(e) && lastAt(e.id)! <= retryBefore;
  const levels = levelsOf(pool);
  const i = levels.indexOf(level);
  const atLevel = candidates.filter((e) => e.difficulty === level);
  const newAt = (l: Difficulty | undefined) => (l === undefined ? [] : candidates.filter((e) => e.difficulty === l && isNew(e)));

  const groups: E[][] = [atLevel.filter(isNew), atLevel.filter(isRetry), newAt(levels[i - 1]), atLevel.filter(isUnsolved), newAt(levels[i + 1])];

  const recent = new Map<Requirement, number>();
  const byId = new Map(pool.map((e) => [e.id, e]));
  own.slice(-c.requirementLookback).forEach((a, k) => {
    const r = byId.get(a.exerciseId)?.requirement;
    if (r) recent.set(r, k + 1); // jüngere Versuche wiegen schwerer
  });
  const rank = (e: E) => (recent.get(e.requirement) ?? 0) + hash01(`${opts.seed}:${e.id}`);

  for (const group of groups) {
    if (group.length) return { exercise: group.reduce((best, e) => (rank(e) < rank(best) ? e : best)), level };
  }
  // Alles bearbeitet: die am längsten nicht gesehene Aufgabe, bevorzugt nahe der aktuellen Stufe.
  const oldest = [...candidates].sort(
    (a, b) => Math.abs(a.difficulty - level) - Math.abs(b.difficulty - level) || (lastAt(a.id) ?? '').localeCompare(lastAt(b.id) ?? ''),
  );
  return { exercise: oldest[0], level };
}
