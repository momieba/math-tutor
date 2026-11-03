/**
 * ContentRepository über einem vollständig geladenen Katalog (Lehrpläne + Themen mit Kapiteln und Aufgaben, ohne Lösungen).
 * Der Katalog ist klein (wenige hundert Aufgaben) und wird einmal pro Sitzung geladen und im Speicher gehalten.
 * Quelle: lokal die gebündelte Wissensbasis, im Supabase-Modus die Inhaltstabellen.
 */
import { DEFAULT_LEARNER_CONTEXT, topicsForContext, type LearnerContext } from '../../domain/levels';
import type { Curriculum, Exercise, Subtopic, Topic } from '../../types';
import type { ContentRepository } from '../types';

export interface Catalog {
  curricula: Curriculum[];
  topics: Topic[];
}

interface Indexed extends Catalog {
  subtopics: Map<string, Subtopic>;
  exercises: Map<string, Exercise>;
}

export function createCatalogContentRepository(load: () => Promise<Catalog>, context: LearnerContext = DEFAULT_LEARNER_CONTEXT): ContentRepository {
  let cached: Promise<Indexed> | null = null;
  const catalog = () => {
    cached ??= load().then(
      (loaded) => {
        const c = {
          ...loaded,
          topics: topicsForContext(loaded.topics, context),
        };
        return {
          ...c,
          subtopics: new Map(c.topics.flatMap((t) => t.subtopics.map((s) => [s.id, s] as const))),
          exercises: new Map(c.topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises.map((e) => [e.id, e] as const)))),
        };
      },
      (e: unknown) => {
        cached = null; // nächster Aufruf versucht es erneut (z. B. nach Verbindungsabbruch)
        throw e;
      },
    );
    return cached;
  };

  return {
    async listCurricula() {
      return (await catalog()).curricula;
    },
    async listCatalog() {
      return (await catalog()).topics;
    },
    async listTopics() {
      return (await catalog()).topics.map(({ subtopics, ...rest }) => ({
        ...rest,
        subtopicCount: subtopics.length,
        exerciseCount: subtopics.reduce((n, s) => n + s.exercises.length, 0),
      }));
    },
    async getTopic(topicId) {
      return (await catalog()).topics.find((t) => t.id === topicId) ?? null;
    },
    async getSubtopic(subtopicId) {
      return (await catalog()).subtopics.get(subtopicId) ?? null;
    },
    async getExercise(exerciseId) {
      return (await catalog()).exercises.get(exerciseId) ?? null;
    },
  };
}
