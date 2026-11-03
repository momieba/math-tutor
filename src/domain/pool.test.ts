/** Aufgabenpools: adaptive Auswahl, Score mit Fenster und Zielgewicht, Schweregrad je Land/Schulart. */
import { describe, expect, it } from 'vitest';
import type { Attempt, Difficulty, Requirement } from '../types';
import { currentLevel, nextExercise, type SelectableExercise } from './exerciseSelection';
import { resolveDifficulty } from './levels';
import { computeSubtopicProgress } from './score';

const REQ: Requirement[] = ['calculation', 'application', 'knowledge'];
/** 30 Aufgaben: je 10 pro Stufe, Anforderungsarten reihum. */
const pool: SelectableExercise[] = Array.from({ length: 30 }, (_, i) => ({
  id: `e${String(i).padStart(2, '0')}`,
  difficulty: (Math.floor(i / 10) + 1) as Difficulty,
  requirement: REQ[i % 3],
}));
const byId = new Map(pool.map((e) => [e.id, e]));

let clock = Date.parse('2026-03-01T08:00:00Z');
function attempt(exerciseId: string, points: number, hintsUsed = 0): Attempt {
  clock += 60_000;
  const iso = new Date(clock).toISOString();
  return {
    id: `${exerciseId}-${clock}`,
    userId: 'u',
    exerciseId,
    subtopicId: 's',
    topicId: 't',
    mode: 'practice',
    answerRaw: '',
    points,
    isCorrect: points === 1,
    hintsUsed: hintsUsed as 0,
    solutionViewed: false,
    startedAt: iso,
    submittedAt: iso,
  };
}
const opts = (excludeId?: string) => ({ now: new Date(clock + 60_000), seed: 'u:2026-03-01', excludeId });

/** Simuliert eine Übungsfolge: `answer(level)` liefert die Punkte für die jeweils ausgewählte Aufgabe. */
function practise(steps: number, answer: (difficulty: Difficulty) => number) {
  const attempts: Attempt[] = [];
  let last: string | undefined;
  for (let k = 0; k < steps; k++) {
    const pick = nextExercise(pool, attempts, opts(last))!;
    attempts.push(attempt(pick.exercise.id, answer(pick.exercise.difficulty)));
    last = pick.exercise.id;
  }
  return attempts;
}

describe('currentLevel', () => {
  it('beginnt leicht, steigt nach 3 Treffern in Folge, fällt nach 2 Fehlern', () => {
    expect(currentLevel(pool, [])).toBe(1);
    const a = [attempt('e00', 1), attempt('e01', 1)];
    expect(currentLevel(pool, a)).toBe(1);
    a.push(attempt('e02', 1));
    expect(currentLevel(pool, a)).toBe(2);
    a.push(attempt('e10', 0), attempt('e11', 0));
    expect(currentLevel(pool, a)).toBe(1);
  });

  it('Teilpunkte unterbrechen die Serie; mit Lösung angesehen zählt nicht als Treffer', () => {
    const a = [attempt('e00', 1), attempt('e01', 0.5), attempt('e02', 1), attempt('e03', 1)];
    expect(currentLevel(pool, a)).toBe(1);
    expect(currentLevel(pool, [...a, { ...attempt('e04', 1), solutionViewed: true }])).toBe(1);
  });
});

describe('nextExercise', () => {
  it('wer alles richtig macht, kommt bis zur schwersten Stufe', () => {
    const attempts = practise(9, () => 1);
    expect(currentLevel(pool, attempts)).toBe(3);
    expect(attempts.slice(0, 3).every((a) => byId.get(a.exerciseId)!.difficulty === 1)).toBe(true);
  });

  it('wer oft falsch liegt, bleibt auf der leichten Stufe', () => {
    const attempts = practise(12, (d) => (d === 1 ? 0.5 : 0));
    expect(attempts.every((a) => byId.get(a.exerciseId)!.difficulty === 1)).toBe(true);
  });

  it('wiederholt keine Aufgabe, solange es neue gibt, und mischt die Anforderungsarten', () => {
    const attempts = practise(10, () => 0.5); // bleibt auf Stufe 1 (10 Aufgaben)
    expect(new Set(attempts.map((a) => a.exerciseId)).size).toBe(10);
    const reqs = attempts.slice(0, 3).map((a) => byId.get(a.exerciseId)!.requirement);
    expect(new Set(reqs).size).toBe(3);
  });

  it('bei verbrauchter Stufe und Fehlern: Wiederholung statt schwererer Aufgaben', () => {
    const attempts = practise(10, () => 0.5);
    const retried = new Set(attempts.map((a) => a.exerciseId));
    // Stufe 1 ist verbraucht, es gibt keine leichtere: noch nicht gelöste Aufgaben dieser Stufe, nicht die schwerere Stufe.
    const next = nextExercise(pool, attempts, opts(attempts.at(-1)!.exerciseId))!;
    expect(next.exercise.difficulty).toBe(1);
    expect(retried.has(next.exercise.id)).toBe(true);
  });

  it('liefert auch bei erschöpftem Pool eine Aufgabe, aber nicht die gerade bearbeitete', () => {
    const tiny = pool.slice(0, 2);
    const a = [attempt('e00', 1), attempt('e01', 1)];
    expect(nextExercise(tiny, a, opts('e01'))!.exercise.id).toBe('e00');
    expect(nextExercise([], [], opts())).toBeNull();
  });
});

describe('Score mit Aufgabenpool', () => {
  const scored = pool;
  it('wenige richtige Aufgaben ergeben keinen hohen Score, obwohl der Pool groß ist', () => {
    const p = computeSubtopicProgress('s', scored, [attempt('e00', 1), attempt('e01', 1)].map((a) => ({ ...a, subtopicId: 's' })));
    expect(p.score).toBeLessThan(40);
    expect(p.completion).toBeCloseTo(2 / 12, 5);
  });

  it('etwa 8 gute gemischte Aufgaben reichen für „sicher“ – niemand muss alle 30 machen', () => {
    const ids = ['e00', 'e01', 'e02', 'e10', 'e11', 'e12', 'e20', 'e21'];
    const day1 = ids.map((id) => attempt(id, 1));
    clock += 24 * 3600_000;
    const p = computeSubtopicProgress('s', scored, [...day1, attempt('e00', 1)]);
    expect(p.score).toBeGreaterThanOrEqual(90);
    expect(p.status).toBe('mastered');
    expect(p.completion).toBeGreaterThan(0.9);
  });

  it('alte Fehler fallen aus dem Fenster der letzten 15 Aufgaben', () => {
    const early = ['e00', 'e01', 'e02', 'e03', 'e04'].map((id) => attempt(id, 0));
    const good = pool.slice(5, 20).map((e) => attempt(e.id, 1));
    const p = computeSubtopicProgress('s', scored, [...early, ...good]);
    expect(p.components.mastery).toBe(1);
  });
});

describe('resolveDifficulty', () => {
  const e = { difficulty: 3 as Difficulty, levels: [{ schoolType: 'realschule', difficulty: null }, { schoolType: 'gymnasium', state: 'BY', difficulty: 2 as Difficulty }] };
  it('Grundwert, Länder-Abweichung, nicht angeboten', () => {
    expect(resolveDifficulty(e, { state: 'NW', schoolType: 'gymnasium' })).toBe(3);
    expect(resolveDifficulty(e, { state: 'BY', schoolType: 'gymnasium' })).toBe(2);
    expect(resolveDifficulty(e, { state: 'NW', schoolType: 'realschule' })).toBeNull();
  });
});
