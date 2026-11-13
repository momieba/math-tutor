import type { AuthoredTopic } from '../../types';
import { CURRICULUM_ID, nrwGym } from '../helpers';
import { applyChecks } from './checks';
import { gleichungen } from './gleichungen';
import { grafisch } from './grafisch';
import { einsetzen } from './einsetzen';
import { gleichsetzen } from './gleichsetzen';
import { addition } from './addition';
import { sonderfaelle } from './sonderfaelle';
import { sachaufgaben } from './sachaufgaben';
import { TOPIC_ID } from './shared';

export const gleichungssysteme: AuthoredTopic = {
  id: TOPIC_ID,
  curriculumId: CURRICULUM_ID,
  subject: 'Mathematik',
  labels: nrwGym(8),
  area: 'Arithmetik/Algebra',
  title: 'Lineare Gleichungssysteme',
  description: 'Zwei Gleichungen mit zwei Variablen grafisch und rechnerisch lösen – mit Einsetzungs-, Gleichsetzungs- und Additionsverfahren.',
  keywords: ['lineare gleichungssysteme', 'gleichungssystem', 'gleichungssysteme', 'lgs', 'einsetzungsverfahren', 'gleichsetzungsverfahren', 'additionsverfahren', 'zwei variablen', 'zwei unbekannte', 'gleichungen mit zwei variablen'],
  reviewStatus: 'internal-review',
  subtopics: applyChecks([gleichungen, grafisch, einsetzen, gleichsetzen, addition, sonderfaelle, sachaufgaben]),
};
