/** Lernpfad: Schritt aus den Versuchen ableiten, Formel-Check und erste Übungen, Zurück-Vorschlag. */
import { describe, expect, it } from 'vitest';
import type { Attempt, Difficulty, Exercise } from '../types';
import { checkExercises, needsReview, pathState, starterExercises, stepOfExercise } from './learningPath';

type E = Pick<Exercise, 'id' | 'difficulty' | 'requirement' | 'checkpoint'>;
const ex = (id: string, difficulty: Difficulty, requirement: E['requirement'], checkpoint?: E['checkpoint']): E => ({ id, difficulty, requirement, checkpoint });

const pool: E[] = [
  ex('k1', 1, 'knowledge'),
  ex('f1', 1, 'knowledge', 'formula'),
  ex('c1', 1, 'calculation'),
  ex('c2', 1, 'calculation'),
  ex('f2', 2, 'knowledge', 'formula'),
  ex('c3', 1, 'calculation'),
  ex('a1', 1, 'application'),
  ...Array.from({ length: 10 }, (_, i) => ex(`m${i}`, 2, 'calculation')),
];

let clock = Date.parse('2026-04-01T10:00:00Z');
const attempt = (exerciseId: string, points = 1): Attempt => {
  clock += 60_000;
  const iso = new Date(clock).toISOString();
  return { id: `${exerciseId}-${clock}`, userId: 'u', exerciseId, subtopicId: 's', topicId: 't', mode: 'practice', answerRaw: '', points, isCorrect: points === 1, hintsUsed: 0, solutionViewed: false, startedAt: iso, submittedAt: iso };
};
const opts = (o: { score?: number; intro?: boolean; explain?: boolean } = {}) => ({
  score: o.score ?? 0,
  seen: { intro: o.intro ?? false, explain: o.explain ?? false },
  now: new Date(clock + 60_000),
  seed: 'u:2026-04-01',
});

describe('Formel-Check und erste Übungen', () => {
  it('Formel-Aufgaben zuerst, dann mit leichten Wissensaufgaben aufgefüllt', () => {
    expect(checkExercises(pool).map((e) => e.id)).toEqual(['f1', 'f2', 'k1']);
  });
  it('erste Übungen: leichte Rechenaufgaben, nicht doppelt mit dem Check', () => {
    expect(starterExercises(pool).map((e) => e.id)).toEqual(['c1', 'c2', 'c3']);
    expect(stepOfExercise(pool, 'f2')).toBe('check');
    expect(stepOfExercise(pool, 'c2')).toBe('starter');
    expect(stepOfExercise(pool, 'm4')).toBe('practice');
  });
});

describe('pathState', () => {
  it('führt der Reihe nach durch alle Schritte', () => {
    expect(pathState(pool, [], opts()).step).toBe('intro');
    expect(pathState(pool, [], opts({ intro: true })).step).toBe('explain');
    expect(pathState(pool, [], opts({ intro: true, explain: true }))).toMatchObject({ step: 'check', exercise: { id: 'f1' } });
    const a = [attempt('f1'), attempt('f2', 0), attempt('k1')];
    expect(pathState(pool, a, opts({ intro: true, explain: true }))).toMatchObject({ step: 'starter', exercise: { id: 'c1' } });
    a.push(attempt('c1'), attempt('c2'), attempt('c3'));
    expect(pathState(pool, a, opts()).step).toBe('practice');
    expect(pathState(pool, a, opts({ score: 85 })).step).toBe('done');
  });

  it('wer schon Aufgaben bearbeitet hat, landet nicht wieder beim Einstieg', () => {
    expect(pathState(pool, [attempt('m3')], opts()).step).toBe('check');
  });

  it('überspringt die gerade bearbeitete Aufgabe', () => {
    expect(pathState(pool, [], { ...opts({ intro: true, explain: true }), excludeId: 'f1' }).exercise?.id).toBe('f2');
  });
});

describe('needsReview', () => {
  it('schlägt nach vielen Fehlern vor, die Erklärung nochmal anzusehen', () => {
    expect(needsReview([attempt('c1', 0), attempt('c2', 1), attempt('c3', 0)])).toBe(false); // zu wenige Versuche
    expect(needsReview([attempt('c1', 0), attempt('c2', 0), attempt('c3', 1), attempt('m1', 0)])).toBe(true);
    expect(needsReview([attempt('c1', 0), attempt('c2', 0), attempt('c3', 0), attempt('m1', 0), attempt('m2', 1), attempt('m3', 1), attempt('m4', 1)])).toBe(false);
  });
});
