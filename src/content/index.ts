/**
 * Geprüfte Seed-Wissensbasis (Single Source of Truth für Lerninhalte im MVP).
 * - Wird im lokalen Modus direkt genutzt.
 * - Für Supabase per `npm run seed:sql` nach supabase/seeds/content-<prüfsumme>.sql exportiert.
 * Änderungen an Inhalten: hier pflegen, Tests (content.test.ts) laufen lassen, Seed neu erzeugen.
 */
import type { AuthoredTopic, Curriculum } from '../types';
import { CURRICULUM_ID } from './helpers';
import { gleichungssysteme } from './gleichungssysteme';
import { kreisZylinder } from './kreis-zylinder';
import { lineareFunktionen } from './lineare-funktionen';
import { pythagoras } from './pythagoras';
import { prozentrechnung } from './prozentrechnung';
import { quadratischeFunktionen } from './quadratische-funktionen';
import { quadratischeGleichungen } from './quadratische-gleichungen';
import { withDefinitions } from './definitions';
import { withLabels } from './labels';

export const curricula: Curriculum[] = [
  {
    id: CURRICULUM_ID,
    subject: 'Mathematik',
    state: 'NW', // Kernlehrplan Mathematik Gymnasium Sek. I (G9) NRW, 2019; Klassen je Thema/Unterthema über Labels (ADR-0003), andere Länder über Labels und ExerciseLevel
    schoolType: 'gymnasium',
    gradeFrom: 5,
    gradeTo: 10,
    version: '2026.2',
  },
];

export const topics: AuthoredTopic[] = [prozentrechnung, lineareFunktionen, gleichungssysteme, pythagoras, quadratischeGleichungen, quadratischeFunktionen, kreisZylinder]
  .map(withDefinitions)
  .map(withLabels);

/** Themen mit Aufgabenpool (≥ 50 Aufgaben je Kapitel, adaptives Üben). Die ersten drei Themen werden später nachgezogen. */
export const POOL_TOPIC_IDS = ['lineare-funktionen', 'lineare-gleichungssysteme', 'kreis-zylinder', 'prozentrechnung', 'quadratische-gleichungen', 'pythagoras', 'quadratische-funktionen'];
