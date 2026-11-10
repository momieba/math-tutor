import { describe, expect, it } from 'vitest';
import type { ScoreCap, SubtopicProgress, TopicProgress } from '../types';
import { recommendReviews, REVIEW_CONFIG } from './recommendations';

const NOW = new Date('2026-11-10T12:00:00Z');
const ago = (hours: number) => new Date(NOW.getTime() - hours * 3600_000).toISOString();

function sub(id: string, over: Partial<SubtopicProgress>): SubtopicProgress {
  return { subtopicId: id, score: 50, status: 'in_progress', completion: 1, totalExercises: 10, attemptedExercises: 5, solvedExercises: 3, caps: [] as ScoreCap[], components: { mastery: 0.5, typeCoverage: 1 }, ...over };
}

function entry(subs: SubtopicProgress[]) {
  const progress: TopicProgress = { topicId: 't', score: 0, completion: 0, status: 'in_progress', subtopics: subs };
  return { topicId: 't', topicTitle: 'Thema', subtopics: subs.map((s) => ({ id: s.subtopicId, title: `Kapitel ${s.subtopicId}` })), progress };
}

describe('recommendReviews', () => {
  it('schwach vor bestätigen vor auffrischen; ältestes zuerst', () => {
    const list = recommendReviews(
      [
        entry([
          sub('refresh-alt', { score: 85, status: 'mastered', lastActivityAt: ago(24 * 20) }),
          sub('refresh-neu', { score: 70, lastActivityAt: ago(24 * 8) }),
          sub('confirm', { score: 90, caps: ['no-confirmation'], lastActivityAt: ago(30) }),
          sub('weak', { score: 20, status: 'needs_practice', lastActivityAt: ago(24) }),
        ]),
      ],
      NOW,
    );
    expect(list.map((r) => r.subtopicId)).toEqual(['weak', 'confirm', 'refresh-alt']);
    expect(list).toHaveLength(REVIEW_CONFIG.maxItems);
    expect(list[2]).toMatchObject({ reason: 'refresh', daysSince: 20, subtopicTitle: 'Kapitel refresh-alt' });
  });

  it('nichts vorschlagen, was gerade erst geübt wurde oder nie begonnen ist', () => {
    const list = recommendReviews(
      [
        entry([
          sub('weak-frisch', { status: 'needs_practice', lastActivityAt: ago(1) }),
          sub('confirm-frisch', { score: 90, caps: ['no-confirmation'], lastActivityAt: ago(5) }),
          sub('gut-frisch', { score: 90, lastActivityAt: ago(24 * 2) }),
          sub('nie', { score: 0, status: 'not_started' }),
          sub('schwach-alt', { score: 30, lastActivityAt: ago(24 * 30) }), // unter refreshMinScore: weiter üben, nicht wiederholen
        ]),
      ],
      NOW,
    );
    expect(list).toEqual([]);
  });

  it('das Kapitel der Weiter-Kachel wird ausgelassen', () => {
    const subs = [sub('weak', { status: 'needs_practice', lastActivityAt: ago(48) })];
    expect(recommendReviews([entry(subs)], NOW, 'weak')).toEqual([]);
    expect(recommendReviews([entry(subs)], NOW)).toHaveLength(1);
  });
});
