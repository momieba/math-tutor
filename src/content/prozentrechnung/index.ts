import type { AuthoredTopic } from '../../types';
import { withPool } from '../templates';
import { prozentBasis } from './basis';
import { applyChecks } from './checks';
import { POOL } from './pool';

/** Prozentrechnung: handgeschriebene Aufgaben (basis.ts), Aufgabenpool (pool.ts) und Formel-Check (checks.ts). */
export const prozentrechnung: AuthoredTopic = { ...prozentBasis, subtopics: applyChecks(withPool(prozentBasis.subtopics, POOL)) };
