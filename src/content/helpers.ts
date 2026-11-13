import type { Course, CurriculumLabel, LearningMaterial } from '../types';

/** Video-Platzhalter: url = null. Später durch eigene/externe Videos ersetzbar (learning_materials). */
export function videoPlaceholder(id: string, title: string, durationSec = 240): LearningMaterial {
  return { id, kind: 'video', title, url: null, provider: 'own', durationSec };
}

export const CURRICULUM_ID = 'nrw-gym-g9-mathe';

/** Labels für NRW-Gymnasium (G9) in den angegebenen Klassen. */
export const nrwGym = (...grades: number[]): CurriculumLabel[] => grades.map((grade) => ({ state: 'NW', schoolType: 'gymnasium', grade }));

/** Labels für die Oberstufe NRW-Gymnasium (G9) nur für eine Kursart, z. B. `nrwGymCourse('LK', 12, 13)`. */
export const nrwGymCourse = (course: Course, ...grades: number[]): CurriculumLabel[] => nrwGym(...grades).map((l) => ({ ...l, course }));
