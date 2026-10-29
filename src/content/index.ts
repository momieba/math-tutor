/**
 * Geprüfte Seed-Wissensbasis (Single Source of Truth für Lerninhalte im MVP).
 * - Wird im lokalen Modus direkt genutzt.
 * - Für Supabase per `npm run seed:sql` nach supabase/seed.sql exportiert.
 * Änderungen an Inhalten: hier pflegen, Tests (content.test.ts) laufen lassen, Seed neu erzeugen.
 */
import type { Curriculum, Topic } from '../types';
import { CURRICULUM_ID } from './helpers';
import { pythagoras } from './pythagoras';
import { prozentrechnung } from './prozent';
import { quadratischeGleichungen } from './quadratisch';

export const curricula: Curriculum[] = [
  {
    id: CURRICULUM_ID,
    subject: 'Mathematik',
    state: 'DE', // ANNAHME: länderübergreifend an KMK-Bildungsstandards orientiert; Bundesland-Varianten folgen
    schoolType: 'Gymnasium',
    gradeFrom: 7,
    gradeTo: 9,
    version: '2026.1',
  },
];

export const topics: Topic[] = [prozentrechnung, pythagoras, quadratischeGleichungen];
