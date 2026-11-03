import type { AuthoredTopic } from '../../types';
import { withPool } from '../templates';
import { pythagorasBasis } from './basis';
import { applyChecks } from './checks';
import { POOL } from './pool';

/** Satz des Pythagoras: handgeschriebene Aufgaben (basis.ts), Aufgabenpool (pool.ts) und Formel-Check (checks.ts). */
export const pythagoras: AuthoredTopic = { ...pythagorasBasis, subtopics: applyChecks(withPool(pythagorasBasis.subtopics, POOL)) };
