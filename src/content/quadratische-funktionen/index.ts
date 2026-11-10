import type { AuthoredTopic } from '../../types';
import { CURRICULUM_ID } from '../helpers';
import { allgemeineForm } from './allgemeineForm';
import { applyChecks } from './checks';
import { normalparabel } from './normalparabel';
import { nullstellen } from './nullstellen';
import { scheitelform } from './scheitelform';
import { TOPIC_ID } from './shared';

/** Quadratische Funktionen, Klasse 9 (KLP NRW G9 2019, Inhaltsfeld Funktionen). Fachliche Freigabe steht aus. */
export const quadratischeFunktionen: AuthoredTopic = {
  id: TOPIC_ID,
  curriculumId: CURRICULUM_ID,
  subject: 'Mathematik',
  grade: 9,
  area: 'Funktionen',
  title: 'Quadratische Funktionen',
  description: 'Parabeln verstehen: Streckung und Verschiebung, Scheitelpunkt, quadratische Ergänzung, Nullstellen und Anwendungen.',
  keywords: [
    'quadratische funktion', 'quadratische funktionen', 'parabel', 'normalparabel', 'scheitelpunkt', 'scheitel', 'scheitelpunktform',
    'quadratische ergänzung', 'streckfaktor', 'gestreckt', 'gestaucht', 'verschiebung', 'nullstellen parabel', 'extremwert', 'flugbahn',
  ],
  reviewStatus: 'internal-review',
  subtopics: applyChecks([normalparabel, scheitelform, allgemeineForm, nullstellen]),
};
