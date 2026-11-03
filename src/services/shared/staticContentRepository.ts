/**
 * ContentRepository auf Basis der gebündelten Wissensbasis (src/content) – lokaler Modus.
 * Liefert dieselbe öffentliche Sicht wie die Datenbank: Aufgaben ohne Lösungsschlüssel.
 */
import { curricula, topics } from '../../content';
import { toPublicTopic } from '../../content/publicView';
import type { ContentRepository } from '../types';
import { createCatalogContentRepository } from './catalogContentRepository';

export function createStaticContentRepository(): ContentRepository {
  return createCatalogContentRepository(async () => ({ curricula, topics: topics.map(toPublicTopic) }));
}
