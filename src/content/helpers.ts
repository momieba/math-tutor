import type { LearningMaterial } from '../types';

/** Video-Platzhalter: url = null. Später durch eigene/externe Videos ersetzbar (learning_materials). */
export function videoPlaceholder(id: string, title: string, durationSec = 240): LearningMaterial {
  return { id, kind: 'video', title, url: null, provider: 'own', durationSec };
}

export const CURRICULUM_ID = 'de-gym-mathe-7-9-v1';
