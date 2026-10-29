/**
 * ContentRepository auf Basis der gebündelten Wissensbasis (src/content).
 * MVP: in BEIDEN Modi genutzt (schnell, offline, versioniert im Git).
 * Die Supabase-Tabellen werden aus derselben Quelle befüllt (npm run seed:sql), damit FKs der
 * Schülerdaten gültig sind. Später austauschbar gegen ein SupabaseContentRepository (CMS-Pflege).
 */
import { curricula, topics } from '../../content';
import type { ContentRepository } from '../types';

const subtopicIndex = new Map(topics.flatMap((t) => t.subtopics.map((s) => [s.id, s] as const)));
const exerciseIndex = new Map(topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises.map((e) => [e.id, e] as const))));

export function createStaticContentRepository(): ContentRepository {
  return {
    async listCurricula() {
      return curricula;
    },
    async listTopics() {
      return topics.map(({ subtopics, ...rest }) => ({
        ...rest,
        subtopicCount: subtopics.length,
        exerciseCount: subtopics.reduce((n, s) => n + s.exercises.length, 0),
      }));
    },
    async getTopic(topicId) {
      return topics.find((t) => t.id === topicId) ?? null;
    },
    async getSubtopic(subtopicId) {
      return subtopicIndex.get(subtopicId) ?? null;
    },
    async getExercise(exerciseId) {
      return exerciseIndex.get(exerciseId) ?? null;
    },
  };
}
