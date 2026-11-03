import type { AuthoredTopic } from '../../types';
import { withPool } from '../templates';
import { quadratischBasis } from './basis';
import { applyChecks } from './checks';
import { POOL } from './pool';

/** Quadratische Gleichungen: handgeschriebene Aufgaben (basis.ts), Aufgabenpool (pool.ts) und Formel-Check (checks.ts). */
export const quadratischeGleichungen: AuthoredTopic = { ...quadratischBasis, subtopics: applyChecks(withPool(quadratischBasis.subtopics, POOL)) };
