import { describe, expect, it } from 'vitest';
import { topics } from '../content';
import type { Attempt, Difficulty, Requirement } from '../types';
import { canOfferTest, pickTestExercises, summarizeTest, TEST_CONFIG, type TestableExercise } from './chapterTest';
import { computeSubtopicProgress, computeTopicProgress, SCORE_CONFIG } from './score';

const ex = (id: string, difficulty: Difficulty, requirement: Requirement = 'calculation', checkpoint?: 'formula'): TestableExercise => ({ id, difficulty, requirement, checkpoint });

describe('pickTestExercises', () => {
  const pool = [
    ...Array.from({ length: 6 }, (_, i) => ex(`l${i}`, 1, i % 2 ? 'knowledge' : 'calculation')),
    ...Array.from({ length: 8 }, (_, i) => ex(`m${i}`, 2, i % 2 ? 'application' : 'calculation')),
    ...Array.from({ length: 5 }, (_, i) => ex(`s${i}`, 3)),
    ex('f1', 1, 'knowledge', 'formula'),
  ];

  it('wählt die Quote je Schwierigkeit, ohne Formel-Check, leicht zuerst', () => {
    const t = pickTestExercises(pool, 'seed');
    expect(t).toHaveLength(TEST_CONFIG.size);
    expect(t.map((e) => e.difficulty)).toEqual([1, 1, 2, 2, 2, 2, 3, 3]);
    expect(t.some((e) => e.checkpoint)).toBe(false);
    expect(new Set(t.map((e) => e.id)).size).toBe(t.length);
  });

  it('mischt Anforderungsarten innerhalb einer Stufe', () => {
    const mid = pickTestExercises(pool, 'seed').filter((e) => e.difficulty === 2);
    expect(new Set(mid.map((e) => e.requirement)).size).toBe(2);
  });

  it('gleicher Seed ⇒ gleicher Test, anderer Seed ⇒ in der Regel ein anderer', () => {
    expect(pickTestExercises(pool, 'a')).toEqual(pickTestExercises(pool, 'a'));
    const variants = new Set(['a', 'b', 'c', 'd'].map((s) => pickTestExercises(pool, s).map((e) => e.id).join()));
    expect(variants.size).toBeGreaterThan(1);
  });

  it('fehlt eine Stufe, wird aufgefüllt', () => {
    const t = pickTestExercises([...Array.from({ length: 10 }, (_, i) => ex(`m${i}`, 2))], 'x');
    expect(t).toHaveLength(TEST_CONFIG.size);
  });

  it('jedes Inhaltskapitel mit genug Aufgaben ergibt einen vollständigen Test', () => {
    for (const s of topics.flatMap((t) => t.subtopics)) {
      if (!canOfferTest(s.exercises)) continue;
      expect(pickTestExercises(s.exercises, 'u').length, s.id).toBe(Math.min(TEST_CONFIG.size, s.exercises.filter((e) => !e.checkpoint).length));
    }
  });
});

describe('summarizeTest', () => {
  it('zählt Punkte, bestanden ab 75 % und schwache Anforderungsarten', () => {
    const s = summarizeTest([
      { exerciseId: '1', verdict: 'correct', points: 1, difficulty: 1, requirement: 'calculation' },
      { exerciseId: '2', verdict: 'correct', points: 1, difficulty: 2, requirement: 'calculation' },
      { exerciseId: '3', verdict: 'partial', points: 0.5, difficulty: 2, requirement: 'application' },
      { exerciseId: '4', verdict: 'incorrect', points: 0, difficulty: 3, requirement: 'application' },
    ]);
    expect(s).toMatchObject({ points: 2.5, max: 4, correct: 2, passed: false, weakRequirements: ['application'] });
    expect(summarizeTest([{ exerciseId: '1', verdict: 'correct', points: 1, difficulty: 1, requirement: 'knowledge' }]).passed).toBe(true);
  });
});

const attempt = (exerciseId: string, points: number, mode: Attempt['mode'], minute: number, subtopicId = 'k1'): Attempt => ({
  id: `${exerciseId}-${minute}`,
  userId: 'u',
  exerciseId,
  subtopicId,
  topicId: 't',
  mode,
  answerRaw: '',
  points,
  isCorrect: points === 1,
  hintsUsed: 0,
  solutionViewed: false,
  startedAt: `2026-01-01T10:${String(minute).padStart(2, '0')}:00Z`,
  submittedAt: `2026-01-01T10:${String(minute).padStart(2, '0')}:30Z`,
});

describe('Score: Testversuche zählen stärker', () => {
  const pool = Array.from({ length: 20 }, (_, i) => ({ id: `e${i}`, requirement: 'calculation' as const, difficulty: 2 as const }));
  // 10 gelöste Übungsaufgaben, danach 4 falsche Aufgaben – einmal geübt, einmal im Test
  const practiced = Array.from({ length: 10 }, (_, i) => attempt(`e${i}`, 1, 'practice', i));
  const wrong = (mode: Attempt['mode']) => Array.from({ length: 4 }, (_, i) => attempt(`e${10 + i}`, 0, mode, 20 + i));

  it('ein schlechter Test senkt den Score stärker als dieselben Fehler beim Üben', () => {
    const asPractice = computeSubtopicProgress('k1', pool, [...practiced, ...wrong('practice')]).components.mastery;
    const asTest = computeSubtopicProgress('k1', pool, [...practiced, ...wrong('test')]).components.mastery;
    expect(asTest).toBeLessThan(asPractice);
  });

  it('ein guter Test hebt den Score stärker als dieselben Treffer beim Üben', () => {
    const base = Array.from({ length: 6 }, (_, i) => attempt(`e${i}`, 0, 'practice', i));
    const good = (mode: Attempt['mode']) => Array.from({ length: 6 }, (_, i) => attempt(`e${6 + i}`, 1, mode, 20 + i));
    const asPractice = computeSubtopicProgress('k1', pool, [...base, ...good('practice')]).components.mastery;
    const asTest = computeSubtopicProgress('k1', pool, [...base, ...good('test')]).components.mastery;
    expect(asTest).toBeGreaterThan(asPractice);
  });

  it('der Bearbeitet-Anteil (completion) hängt nicht vom Testgewicht ab', () => {
    const a = computeSubtopicProgress('k1', pool, wrong('practice')).completion;
    const b = computeSubtopicProgress('k1', pool, wrong('test')).completion;
    expect(a).toBe(b);
    expect(SCORE_CONFIG.testWeight).toBeGreaterThan(1);
  });
});

describe('Themen-Score', () => {
  it('mittelt nur über begonnene Kapitel; completion bleibt über alle Kapitel', () => {
    const subs = [
      { id: 'k1', exercises: [{ id: 'e1', requirement: 'calculation' as const, difficulty: 1 as const }] },
      { id: 'k2', exercises: [{ id: 'e2', requirement: 'calculation' as const, difficulty: 1 as const }] },
    ];
    const p = computeTopicProgress('t', subs, [attempt('e1', 1, 'practice', 1)]);
    expect(p.score).toBe(p.subtopics[0].score);
    expect(p.score).toBeGreaterThan(0);
    expect(p.completion).toBeCloseTo(p.subtopics[0].completion / 2);
    expect(computeTopicProgress('t', subs, []).score).toBe(0);
  });
});
