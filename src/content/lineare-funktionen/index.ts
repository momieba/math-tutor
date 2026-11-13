import type { AuthoredTopic } from '../../types';
import { CURRICULUM_ID, nrwGym } from '../helpers';
import { applyChecks } from './checks';
import { funktionsbegriff } from './funktionsbegriff';
import { proportional } from './proportional';
import { steigung } from './steigung';
import { aufstellen } from './aufstellen';
import { nullstellen } from './nullstellen';
import { anwendungen } from './anwendungen';
import { TOPIC_ID } from './shared';

export const lineareFunktionen: AuthoredTopic = {
  id: TOPIC_ID,
  curriculumId: CURRICULUM_ID,
  subject: 'Mathematik',
  labels: nrwGym(8),
  area: 'Funktionen',
  title: 'Lineare Funktionen',
  description: 'Funktionen verstehen, Steigung und y-Achsenabschnitt deuten, Geraden aufstellen und Sachaufgaben lösen.',
  keywords: ['lineare funktion', 'lineare funktionen', 'funktion', 'gerade', 'steigung', 'steigungsdreieck', 'y-achsenabschnitt', 'nullstelle', 'schnittpunkt', 'funktionsgleichung', 'wertetabelle', 'proportional', 'graph'],
  reviewStatus: 'internal-review',
  subtopics: applyChecks([funktionsbegriff, proportional, steigung, aufstellen, nullstellen, anwendungen]),
};
