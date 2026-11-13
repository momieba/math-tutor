/**
 * Kapitel-Test: eine feste Anzahl gemischter Aufgaben ohne Hilfen, Rückmeldung erst am Ende.
 * Die Versuche werden mit mode = 'test' gespeichert und zählen im Score stärker (SCORE_CONFIG.testWeight).
 * Reine Funktionen, backend-unabhängig.
 */
import type { Difficulty, Exercise, Requirement, Verdict } from '../types';
import { hash01 } from './exerciseSelection';

export type TestableExercise = Pick<Exercise, 'id' | 'difficulty' | 'requirement' | 'checkpoint'> & { answerFormat?: Pick<Exercise['answerFormat'], 'kind'> };

/** Gehört in einen Test: keine Formel-Check-Frage und keine Zeichenaufgabe (die braucht die KI-Korrektur). */
const testable = (e: TestableExercise) => !e.checkpoint && e.answerFormat?.kind !== 'drawing';

export const TEST_CONFIG = {
  /** Aufgaben je Test. */
  size: 8,
  /** Gewünschte Mischung nach Schwierigkeit (fehlt eine Stufe, wird mit den anderen aufgefüllt). */
  quota: { 1: 2, 2: 4, 3: 2 } as Record<Difficulty, number>,
  /** Ab diesem Anteil der Punkte gilt der Test als bestanden. */
  passShare: 0.75,
  /** Mindestens so viele Aufgaben braucht ein Kapitel, damit ein Test angeboten wird. */
  minPool: 6,
};

/** Bietet das Kapitel genug Aufgaben für einen Test? Formel-Check-Fragen zählen nicht. */
export function canOfferTest(exercises: TestableExercise[]): boolean {
  return exercises.filter(testable).length >= TEST_CONFIG.minPool;
}

/**
 * Wählt die Aufgaben eines Tests: je Schwierigkeit laut Quote, innerhalb der Stufe nach Anforderungsart gemischt
 * (reihum), Reihenfolge per `seed` (gleicher Seed ⇒ gleicher Test, z. B. nach dem Neuladen). Formel-Check-Fragen
 * gehören nicht in den Test. Am Ende aufsteigend nach Schwierigkeit sortiert (leicht anfangen).
 */
export function pickTestExercises<E extends TestableExercise>(exercises: E[], seed: string, size = TEST_CONFIG.size): E[] {
  const pool = exercises.filter(testable);
  const rank = (e: E) => hash01(`${seed}:${e.id}`);
  const byLevel = new Map<Difficulty, E[]>();
  for (const e of [...pool].sort((a, b) => rank(a) - rank(b))) byLevel.set(e.difficulty, [...(byLevel.get(e.difficulty) ?? []), e]);

  const chosen: E[] = [];
  const take = (level: Difficulty, n: number) => {
    const list = interleaveByRequirement(byLevel.get(level) ?? []);
    const picked = list.slice(0, n);
    byLevel.set(level, (byLevel.get(level) ?? []).filter((e) => !picked.includes(e)));
    chosen.push(...picked);
  };
  for (const level of [1, 2, 3] as Difficulty[]) take(level, TEST_CONFIG.quota[level]);
  // Auffüllen, wenn eine Stufe zu wenige Aufgaben hatte: zuerst mittlere, dann schwere, dann leichte.
  for (const level of [2, 3, 1] as Difficulty[]) if (chosen.length < size) take(level, size - chosen.length);
  return chosen.slice(0, size).sort((a, b) => a.difficulty - b.difficulty || rank(a) - rank(b));
}

/** Reihum nach Anforderungsart, damit nicht vier Rechenaufgaben hintereinander kommen. */
function interleaveByRequirement<E extends TestableExercise>(list: E[]): E[] {
  const groups = new Map<Requirement, E[]>();
  for (const e of list) groups.set(e.requirement, [...(groups.get(e.requirement) ?? []), e]);
  const out: E[] = [];
  const queues = [...groups.values()];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

export interface TestItemResult {
  exerciseId: string;
  verdict: Verdict;
  points: number;
  difficulty: Difficulty;
  requirement: Requirement;
}

export interface TestSummary {
  /** Erreichte Punkte (Teilpunkte möglich) und Maximum (= Anzahl Aufgaben). */
  points: number;
  max: number;
  share: number;
  passed: boolean;
  correct: number;
  /** Anforderungsarten mit weniger als der Hälfte der Punkte: dort lohnt sich Üben. */
  weakRequirements: Requirement[];
}

export function summarizeTest(results: TestItemResult[]): TestSummary {
  const max = results.length;
  const points = Math.round(results.reduce((sum, r) => sum + r.points, 0) * 100) / 100;
  const share = max ? points / max : 0;
  const byReq = new Map<Requirement, number[]>();
  for (const r of results) byReq.set(r.requirement, [...(byReq.get(r.requirement) ?? []), r.points]);
  const weakRequirements = [...byReq.entries()].filter(([, p]) => p.reduce((a, b) => a + b, 0) / p.length < 0.5).map(([req]) => req);
  return { points, max, share, passed: share >= TEST_CONFIG.passShare, correct: results.filter((r) => r.verdict === 'correct').length, weakRequirements };
}
