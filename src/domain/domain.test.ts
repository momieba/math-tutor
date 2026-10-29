import { describe, expect, it } from 'vitest';
import { topics } from '../content';
import type { Attempt, Exercise } from '../types';
import { matchTopic } from './topicMatcher';
import { computeSubtopicProgress } from './score';
import { evaluateAnswer, parseNumber, parseNumberSet } from './evaluate';

describe('matchTopic', () => {
  it.each([
    ['Ich möchte den Satz des Pythagoras verstehen.', 'pythagoras'],
    ['Ich möchte quadratische Gleichungen lösen.', 'quadratische-gleichungen'],
    ['Ich muss mich auf eine Mathearbeit zu Prozentrechnung vorbereiten.', 'prozentrechnung'],
    ['Wie berechne ich die Hypotenuse?', 'pythagoras'],
    ['pq-formel', 'quadratische-gleichungen'],
    ['20% Rabatt ausrechnen', 'prozentrechnung'],
  ])('%s → %s', (q, id) => {
    const r = matchTopic(q, topics);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.best.topicId).toBe(id);
  });

  it('liefert Vorschläge statt erfundener Themen', () => {
    expect(matchTopic('Ich will Gitarre spielen', topics).kind).toBe('none');
  });

  it('erkennt ein konkretes Kapitel', () => {
    const r = matchTopic('Kathete berechnen beim Pythagoras', topics);
    expect(r.kind === 'match' && r.best.subtopicId).toBe('pyth-kathete');
  });
});

describe('evaluate', () => {
  it('parst deutsche Zahlen und Lösungsmengen', () => {
    expect(parseNumber('8,1 cm')).toBe(8.1);
    expect(parseNumber('x = -5')).toBe(-5);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumberSet('x1 = 3; x2 = -5')).toEqual([3, -5]);
    expect(parseNumberSet('keine')).toEqual([]);
  });

  it('vergibt Teilpunkte bei unvollständiger Lösungsmenge', () => {
    const ex = topics[2].subtopics[0].exercises[0];
    expect(evaluateAnswer(ex, '-7; 7').verdict).toBe('correct');
    expect(evaluateAnswer(ex, '7')).toMatchObject({ verdict: 'partial', points: 0.5 });
    expect(evaluateAnswer(ex, 'sieben').verdict).toBe('unclear');
  });
});

describe('score', () => {
  const sub = topics.find((t) => t.id === 'pythagoras')!.subtopics.find((s) => s.id === 'pyth-hypotenuse')!;
  const mk = (e: Exercise, points: number, iso: string, hintsUsed: 0 | 1 | 2 | 3 = 0): Attempt => ({
    id: `${e.id}-${iso}`,
    userId: 'u',
    exerciseId: e.id,
    subtopicId: sub.id,
    topicId: 'pythagoras',
    mode: 'practice',
    answerRaw: '',
    points,
    isCorrect: points === 1,
    hintsUsed,
    solutionViewed: false,
    startedAt: iso,
    submittedAt: iso,
  });

  it('ist 0 ohne Versuche', () => {
    expect(computeSubtopicProgress(sub.id, sub.exercises, [])).toMatchObject({ score: 0, status: 'not_started' });
  });

  it('wenige leichte Aufgaben ergeben keinen hohen Score', () => {
    const easy = sub.exercises.filter((e) => e.difficulty === 1);
    const p = computeSubtopicProgress(sub.id, sub.exercises, easy.map((e) => mk(e, 1, '2026-01-01T10:00:00Z')));
    expect(p.score).toBeLessThan(60);
  });

  it('erreicht 100 nur mit allem korrekt, ohne Hinweise und mit Bestätigung', () => {
    const day1 = sub.exercises.map((e) => mk(e, 1, '2026-01-01T10:00:00Z'));
    const p1 = computeSubtopicProgress(sub.id, sub.exercises, day1);
    expect(p1.score).toBe(94);
    const p2 = computeSubtopicProgress(sub.id, sub.exercises, [...day1, mk(sub.exercises[0], 1, '2026-01-02T12:00:00Z')]);
    expect(p2).toMatchObject({ score: 100, status: 'mastered' });
  });

  it('Hinweise senken den Score', () => {
    const withHints = sub.exercises.map((e) => mk(e, 1, '2026-01-01T10:00:00Z', 2));
    expect(computeSubtopicProgress(sub.id, sub.exercises, withHints).score).toBe(76); // 100·(0,8·0,7 + 0,2·1)
  });
});
