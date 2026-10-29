/**
 * LearnerRepository auf localStorage. Daten pro Nutzer unter `mathmvp:v1:learner:<userId>`.
 * Hinweis: localStorage ist auf ~5 MB begrenzt; Canvas-Bilder als data-URL füllen das schnell.
 * Bei Bedarf auf IndexedDB umstellen (gleiches Interface).
 */
import type { AttemptRecord, Correction, StudentTopic, Submission } from '../../types';
import type { LearnerRepository } from '../types';
import { newId, readJson, writeJson } from './storage';

interface LearnerData {
  activeTopics: StudentTopic[];
  attempts: AttemptRecord[];
}

const key = (userId: string) => `learner:${userId}`;
const load = (userId: string) => readJson<LearnerData>(key(userId), { activeTopics: [], attempts: [] });
const save = (userId: string, d: LearnerData) => writeJson(key(userId), d);

export function createLocalLearnerRepository(): LearnerRepository {
  return {
    async listActiveTopics(userId) {
      return load(userId).activeTopics;
    },
    async addActiveTopic(userId, topicId) {
      const d = load(userId);
      const existing = d.activeTopics.find((t) => t.topicId === topicId);
      if (existing) return existing;
      const st: StudentTopic = { userId, topicId, addedAt: new Date().toISOString() };
      save(userId, { ...d, activeTopics: [...d.activeTopics, st] });
      return st;
    },
    async removeActiveTopic(userId, topicId) {
      const d = load(userId);
      save(userId, { ...d, activeTopics: d.activeTopics.filter((t) => t.topicId !== topicId) });
    },
    async saveAttempt(input) {
      const now = new Date().toISOString();
      const id = newId();
      const correction: Correction = { ...input.correction, id: newId(), attemptId: id, createdAt: now };
      const submission: Submission | undefined = input.submission
        ? { id: newId(), attemptId: id, kind: input.submission.kind, imageRef: input.submission.dataUrl, strokes: input.submission.strokes, createdAt: now }
        : undefined;
      const record: AttemptRecord = {
        id,
        userId: input.userId,
        exerciseId: input.exerciseId,
        subtopicId: input.subtopicId,
        topicId: input.topicId,
        mode: input.mode,
        answerRaw: input.answerRaw,
        points: correction.points,
        isCorrect: correction.verdict === 'correct',
        hintsUsed: input.hintsUsed,
        solutionViewed: input.solutionViewed,
        startedAt: input.startedAt,
        submittedAt: now,
        correction,
        submission,
      };
      const d = load(input.userId);
      save(input.userId, { ...d, attempts: [...d.attempts, record] });
      return record;
    },
    async listAttempts(userId, filter = {}) {
      let list = load(userId).attempts.filter(
        (a) =>
          (!filter.topicId || a.topicId === filter.topicId) &&
          (!filter.subtopicId || a.subtopicId === filter.subtopicId) &&
          (!filter.exerciseId || a.exerciseId === filter.exerciseId),
      );
      list = [...list].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      return filter.limit ? list.slice(0, filter.limit) : list;
    },
    async getAttempt(userId, attemptId) {
      return load(userId).attempts.find((a) => a.id === attemptId) ?? null;
    },
    async getSubmissionImageUrl(submission) {
      return submission.imageRef ?? null;
    },
  };
}
