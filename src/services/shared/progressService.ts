import { computeSubtopicProgress, computeTopicProgress } from '../../domain/score';
import type { ContentRepository, LearnerRepository, ProgressService } from '../types';

/** Backend-unabhängig: Score wird immer aus Content + Attempts berechnet (siehe domain/score.ts). */
export function createProgressService(content: ContentRepository, learner: LearnerRepository): ProgressService {
  return {
    async getSubtopicProgress(userId, subtopicId) {
      const sub = await content.getSubtopic(subtopicId);
      if (!sub) throw new Error(`Unbekanntes Kapitel: ${subtopicId}`);
      const attempts = await learner.listAttempts(userId, { subtopicId });
      return computeSubtopicProgress(sub.id, sub.exercises, attempts);
    },
    async getTopicProgress(userId, topicId) {
      const topic = await content.getTopic(topicId);
      if (!topic) throw new Error(`Unbekanntes Thema: ${topicId}`);
      const attempts = await learner.listAttempts(userId, { topicId });
      return computeTopicProgress(topic.id, topic.subtopics, attempts);
    },
  };
}
