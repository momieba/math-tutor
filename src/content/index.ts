/**
 * Geprüfte Seed-Wissensbasis (Single Source of Truth für Lerninhalte im MVP).
 * - Wird im lokalen Modus direkt genutzt.
 * - Für Supabase per `npm run seed:sql` nach supabase/seed.sql exportiert.
 * Änderungen an Inhalten: hier pflegen, Tests (content.test.ts) laufen lassen, Seed neu erzeugen.
 */
import type { AuthoredTopic, Curriculum } from '../types';
import { CURRICULUM_ID } from './helpers';
import { gleichungssysteme } from './gleichungssysteme';
import { kreisZylinder } from './kreis-zylinder';
import { lineareFunktionen } from './lineare-funktionen';
import { pythagoras } from './pythagoras';
import { prozentrechnung } from './prozent';
import { quadratischeGleichungen } from './quadratisch';

export const curricula: Curriculum[] = [
  {
    id: CURRICULUM_ID,
    subject: 'Mathematik',
    state: 'NW', // Kernlehrplan Mathematik Gymnasium Sek. I (G9) NRW, 2019; andere Länder über ExerciseLevel bzw. weitere Lehrpläne
    schoolType: 'Gymnasium',
    gradeFrom: 5,
    gradeTo: 10,
    version: '2026.2',
  },
];

export const topics: AuthoredTopic[] = [prozentrechnung, lineareFunktionen, gleichungssysteme, pythagoras, quadratischeGleichungen, kreisZylinder];

/** Themen mit Aufgabenpool (≥ 50 Aufgaben je Kapitel, adaptives Üben). Die ersten drei Themen werden später nachgezogen. */
export const POOL_TOPIC_IDS = ['lineare-funktionen', 'lineare-gleichungssysteme', 'kreis-zylinder'];
