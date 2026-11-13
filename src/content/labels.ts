/**
 * Labels auflösen: Unterthemen ohne eigene Labels übernehmen die Labels des Themas; die Labels des Themas sind danach
 * die Vereinigung der Labels seiner Unterthemen (ADR-0003). Nach `withLabels` hat jedes Unterthema eigene Labels.
 */
import { unionLabels } from '../domain/labels';
import type { AuthoredTopic } from '../types';

export function withLabels(topic: AuthoredTopic): AuthoredTopic {
  const subtopics = topic.subtopics.map((s) => ({ ...s, labels: unionLabels([s.labels ?? topic.labels]) }));
  return { ...topic, labels: unionLabels(subtopics.map((s) => s.labels)), subtopics };
}
