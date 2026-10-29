import { describe, expect, it } from 'vitest';
import { pythagoras } from '../content/pythagoras';
import type { Attempt, Exercise, SubtopicProgress, TopicProgress } from '../types';
import { evaluateHandwriting, UNCHECKED_WORK_MESSAGE } from './evaluate';
import { exerciseState, formatAnswer, nextChapterId, recommendNext } from './progressView';

const attempt = (over: Partial<Attempt>): Attempt => ({
  id: Math.random().toString(36),
  userId: 'u1',
  exerciseId: 'e1',
  subtopicId: 's1',
  topicId: 't1',
  mode: 'practice',
  answerRaw: 'x',
  points: 1,
  isCorrect: true,
  hintsUsed: 0,
  solutionViewed: false,
  startedAt: '2026-01-01T10:00:00Z',
  submittedAt: '2026-01-01T10:01:00Z',
  ...over,
});

const subProgress = (subtopicId: string, status: SubtopicProgress['status']): SubtopicProgress => ({
  subtopicId,
  status,
  score: 0,
  completion: 0,
  totalExercises: 3,
  attemptedExercises: 0,
  solvedExercises: 0,
  caps: [],
  components: { mastery: 0, typeCoverage: 0 },
});

describe('exerciseState', () => {
  it('ohne Versuch: offen', () => {
    expect(exerciseState([]).status).toBe('open');
  });
  it('richtig ohne Hilfe: gelöst', () => {
    expect(exerciseState([attempt({})]).status).toBe('solved');
  });
  it('richtig, aber mit Musterlösung: nur geübt', () => {
    expect(exerciseState([attempt({ solutionViewed: true })]).status).toBe('practiced');
  });
  it('letzter Versuch bestimmt das Urteil', () => {
    const s = exerciseState([
      attempt({ submittedAt: '2026-01-01T10:00:00Z', points: 1 }),
      attempt({ submittedAt: '2026-01-02T10:00:00Z', points: 0, isCorrect: false }),
    ]);
    expect(s.lastVerdict).toBe('incorrect');
    expect(s.attemptCount).toBe(2);
    expect(s.status).toBe('practiced'); // 0,7·0 + 0,3·1 = 0,3
  });
});

describe('nextChapterId / recommendNext', () => {
  const subs = [
    { id: 'a', order: 1, title: 'A' },
    { id: 'b', order: 2, title: 'B' },
    { id: 'c', order: 3, title: 'C' },
  ];
  const progress = (statuses: SubtopicProgress['status'][], last?: string): TopicProgress => ({
    topicId: 't',
    score: 0,
    completion: 0,
    status: 'in_progress',
    subtopics: statuses.map((s, i) => subProgress(subs[i].id, s)),
    lastActivityAt: last,
  });

  it('liefert das erste nicht beherrschte Kapitel nach Reihenfolge', () => {
    expect(nextChapterId([...subs].reverse(), progress(['mastered', 'needs_practice', 'not_started']))).toBe('b');
  });
  it('liefert nichts, wenn alles beherrscht ist', () => {
    expect(nextChapterId(subs, progress(['mastered', 'mastered', 'mastered']))).toBeUndefined();
  });
  it('bevorzugt das zuletzt geübte Thema und überspringt fertige Themen', () => {
    const r = recommendNext([
      { topicId: 't1', topicTitle: 'T1', subtopics: subs, progress: progress(['not_started', 'not_started', 'not_started']) },
      { topicId: 't2', topicTitle: 'T2', subtopics: subs, progress: progress(['mastered', 'in_progress', 'not_started'], '2026-02-01T00:00:00Z') },
      { topicId: 't3', topicTitle: 'T3', subtopics: subs, progress: progress(['mastered', 'mastered', 'mastered'], '2026-03-01T00:00:00Z') },
    ]);
    expect(r).toMatchObject({ topicId: 't2', subtopicId: 'b', status: 'in_progress', reason: 'Hier weitermachen' });
  });
  it('ohne aktive Themen keine Empfehlung', () => {
    expect(recommendNext([])).toBeUndefined();
  });
});

describe('formatAnswer', () => {
  it('zeigt bei Multiple Choice den Text der Option', () => {
    const ex = pythagoras.subtopics[0].exercises[0];
    expect(formatAnswer(ex, 'b')).toBe('Die Seite gegenüber dem rechten Winkel');
    expect(formatAnswer({ answer: { kind: 'numeric', value: 1, tolerance: 0 } }, '1,5')).toBe('1,5');
  });
});

describe('evaluateHandwriting', () => {
  const ex = pythagoras.subtopics.flatMap((s) => s.exercises).find((e): e is Exercise => e.type === 'handwriting' && e.answer.kind === 'numeric')!;
  const value = ex.answer.kind === 'numeric' ? ex.answer.value : 0;

  it('ohne Endergebnis: unklar statt Bewertung', () => {
    const r = evaluateHandwriting(ex, '  ', true);
    expect(r.verdict).toBe('unclear');
    expect(r.marks.every((m) => m.color === 'yellow')).toBe(true);
  });
  it('richtiges Ergebnis: grün fürs Ergebnis, gelb für den ungeprüften Rechenweg', () => {
    const r = evaluateHandwriting(ex, String(value).replace('.', ','), true);
    expect(r.verdict).toBe('correct');
    expect(r.marks.map((m) => m.color)).toEqual(['green', 'yellow']);
    expect(r.marks[1].message).toBe(UNCHECKED_WORK_MESSAGE);
  });
  it('falsches Ergebnis: rot + gelb', () => {
    const r = evaluateHandwriting(ex, String(value + 1), false);
    expect(r.verdict).toBe('incorrect');
    expect(r.marks.map((m) => m.color)).toEqual(['red', 'yellow']);
  });
  it('unlesbare Zahl bleibt unklar', () => {
    expect(evaluateHandwriting(ex, 'etwa zwölf', true).verdict).toBe('unclear');
  });
});
