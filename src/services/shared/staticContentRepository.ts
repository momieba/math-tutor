/**
 * ContentRepository auf Basis der gebündelten Wissensbasis (src/content) – lokaler Modus.
 * Liefert dieselbe öffentliche Sicht wie die Datenbank: Aufgaben ohne Lösungsschlüssel.
 */
import type { ContentRepository } from '../types';
import { createCatalogContentRepository } from './catalogContentRepository';

export function createStaticContentRepository(): ContentRepository {
  // Dynamischer Import: Die Wissensbasis (mit Aufgabenvorlagen) landet in einem eigenen Chunk und wird nur im lokalen Modus geladen.
  return createCatalogContentRepository(async () => {
    const [{ curricula, topics }, { toPublicTopic }] = await Promise.all([import('../../content'), import('../../content/publicView')]);
    return { curricula, topics: topics.map(toPublicTopic) };
  });
}
