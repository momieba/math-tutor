import type { AuthoredTopic } from '../../types';
import { withPool } from '../templates';
import { prozentBasis } from './basis';
import { applyChecks } from './checks';
import { klasse6Subtopics } from './klasse6';
import { POOL } from './pool';

/**
 * Prozentrechnung: handgeschriebene Aufgaben (basis.ts), Aufgabenpool (pool.ts), Formel-Check (checks.ts)
 * und die Kapitel für Klasse 6 (klasse6.ts, hinten angehängt).
 */
export const prozentrechnung: AuthoredTopic = { ...prozentBasis, subtopics: [...applyChecks(withPool(prozentBasis.subtopics, POOL)), ...klasse6Subtopics] };
