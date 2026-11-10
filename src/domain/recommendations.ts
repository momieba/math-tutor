/**
 * Wiederholung und Empfehlungen (Phase 4, „RecommendationService“ aus ARCHITECTURE.md). Reine Funktionen.
 * Ergänzt die Weiter-Kachel (progressView.recommendNext, „wo du aufgehört hast“) um Kapitel, die eine Wiederholung lohnen:
 * - weak:    Kapitel braucht Übung (Status needs_practice)
 * - confirm: Kapitel ist fast sicher, es fehlt nur die Bestätigung an einem späteren Tag (Deckel no-confirmation);
 *            die Wartezeit (confirmationMinHours) ist vorbei – heute erneut lösen hebt den Score
 * - refresh: Kapitel war schon gut, wurde aber lange nicht geübt (Vergessenskurve)
 */
import type { ChapterStatus, TopicProgress } from '../types';
import { SCORE_CONFIG } from './score';

export type ReviewReason = 'weak' | 'confirm' | 'refresh';

export interface ReviewRecommendation {
  topicId: string;
  topicTitle: string;
  subtopicId: string;
  subtopicTitle: string;
  reason: ReviewReason;
  score: number;
  status: ChapterStatus;
  /** Tage seit der letzten Abgabe im Kapitel (abgerundet). */
  daysSince: number;
}

export const REVIEW_CONFIG = {
  /** Ab so vielen Tagen ohne Übung wird ein gutes Kapitel zum Auffrischen vorgeschlagen. */
  refreshAfterDays: 7,
  /** Nur Kapitel ab diesem Score auffrischen (darunter ist es „weiter üben“, nicht „wiederholen“). */
  refreshMinScore: 60,
  /** Bestätigung vorschlagen, wenn der Score ohne den Deckel mindestens so hoch wäre. */
  confirmMinScore: SCORE_CONFIG.masteredMinScore,
  /** Schwache Kapitel erst nach dieser Pause erneut vorschlagen (nicht direkt nach dem Üben). */
  weakAfterHours: 12,
  maxItems: 3,
};

const PRIORITY: Record<ReviewReason, number> = { weak: 0, confirm: 1, refresh: 2 };

export const REVIEW_REASON_TEXT: Record<ReviewReason, string> = {
  weak: 'Hier hakt es noch – eine kurze Wiederholung hilft.',
  confirm: 'Fast sicher! Löse heute nochmal Aufgaben, um es zu bestätigen.',
  refresh: 'Länger nicht geübt – kurz auffrischen, bevor es verblasst.',
};

/**
 * Wiederholungs-Empfehlungen über alle aktiven Themen, wichtigste zuerst (schwach, bestätigen, auffrischen; bei
 * Gleichstand das am längsten nicht geübte). `exclude` ist das Kapitel der Weiter-Kachel, damit nichts doppelt erscheint.
 */
export function recommendReviews(
  entries: { topicId: string; topicTitle: string; subtopics: { id: string; title: string }[]; progress: TopicProgress }[],
  now: Date,
  exclude?: string,
): ReviewRecommendation[] {
  const c = REVIEW_CONFIG;
  const out: ReviewRecommendation[] = [];
  for (const e of entries) {
    for (const p of e.progress.subtopics) {
      if (!p.lastActivityAt || p.subtopicId === exclude) continue;
      const hoursSince = (now.getTime() - Date.parse(p.lastActivityAt)) / 3600_000;
      const daysSince = Math.floor(hoursSince / 24);
      let reason: ReviewReason | null = null;
      if (p.status === 'needs_practice' && hoursSince >= c.weakAfterHours) reason = 'weak';
      else if (p.caps.includes('no-confirmation') && p.score >= Math.min(c.confirmMinScore, SCORE_CONFIG.caps['no-confirmation']) && hoursSince >= SCORE_CONFIG.confirmationMinHours) reason = 'confirm';
      else if (p.score >= c.refreshMinScore && daysSince >= c.refreshAfterDays) reason = 'refresh';
      if (!reason) continue;
      const title = e.subtopics.find((s) => s.id === p.subtopicId)?.title;
      if (!title) continue;
      out.push({ topicId: e.topicId, topicTitle: e.topicTitle, subtopicId: p.subtopicId, subtopicTitle: title, reason, score: p.score, status: p.status, daysSince });
    }
  }
  return out.sort((a, b) => PRIORITY[a.reason] - PRIORITY[b.reason] || b.daysSince - a.daysSince).slice(0, c.maxItems);
}
