import { describe, expect, it } from 'vitest';
import { topics } from './index';
import { evaluateAnswer } from '../domain/evaluate';

/** Struktur-Prüfung der Wissensbasis: verhindert unvollständige oder inkonsistente Inhalte. */
describe('Wissensbasis', () => {
  const allExercises = topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises));

  it('hat eindeutige IDs', () => {
    const ids = [...topics.map((t) => t.id), ...topics.flatMap((t) => t.subtopics.map((s) => s.id)), ...allExercises.map((e) => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Pythagoras hat alle 8 Kapitel, andere Themen mindestens 2', () => {
    for (const t of topics) {
      expect(t.subtopics.length).toBeGreaterThanOrEqual(t.id === 'pythagoras' ? 8 : 2);
    }
  });

  for (const t of topics) {
    for (const s of t.subtopics) {
      it(`Kapitel ${s.id} ist vollständig`, () => {
        expect(s.topicId).toBe(t.id);
        expect(s.objective.length).toBeGreaterThan(10);
        expect(s.intro.length).toBeGreaterThan(10);
        expect(s.rules.length).toBeGreaterThan(0);
        expect(s.materials.some((m) => m.kind === 'video')).toBe(true);
        expect(s.example.steps.length).toBeGreaterThan(0);
        expect(s.summary.length).toBeGreaterThan(0);
        expect(s.exercises.length).toBeGreaterThanOrEqual(3);
        for (const e of s.exercises) {
          expect(e.subtopicId).toBe(s.id);
          expect(e.hints).toHaveLength(3);
          expect(e.solution.steps.length).toBeGreaterThan(0);
          expect(e.commonMistakes.length).toBeGreaterThan(0);
          if (e.type === 'multiple-choice') {
            expect(e.answer.kind).toBe('choice');
            const correct = e.answer.kind === 'choice' ? e.answer.correct : '';
            expect(e.choices?.some((c) => c.id === correct)).toBe(true);
          }
        }
      });
    }
  }

  it('typische Fehlantworten werden nicht als korrekt bewertet', () => {
    for (const e of allExercises) {
      for (const m of e.commonMistakes) {
        for (const a of m.answers ?? []) {
          expect(evaluateAnswer(e, a).verdict, `${e.id}: "${a}"`).not.toBe('correct');
        }
      }
    }
  });
});
