import type { AuthoredTopic } from '../../types';
import { CURRICULUM_ID, nrwGym } from '../helpers';
import { applyChecks } from './checks';
import { ausschnitt } from './ausschnitt';
import { flaeche } from './flaeche';
import { prisma } from './prisma';
import { ring } from './ring';
import { TOPIC_ID } from './shared';
import { umfang } from './umfang';
import { zusammengesetzt } from './zusammengesetzt';
import { zylinder } from './zylinder';

export const kreisZylinder: AuthoredTopic = {
  id: TOPIC_ID,
  curriculumId: CURRICULUM_ID,
  subject: 'Mathematik',
  labels: nrwGym(9),
  area: 'Geometrie',
  title: 'Kreis und Zylinder',
  description: 'Umfang und Fläche von Kreisen, Kreisausschnitte und -ringe, Prismen und Zylinder berechnen.',
  keywords: ['kreis', 'kreise', 'kreisumfang', 'umfang', 'kreisfläche', 'flächeninhalt kreis', 'pi', 'π', 'kreiszahl', 'kreisausschnitt', 'kreisbogen', 'kreisring', 'zylinder', 'prisma', 'prismen', 'volumen', 'oberfläche', 'körper', 'körperberechnung'],
  reviewStatus: 'internal-review',
  subtopics: applyChecks([umfang, flaeche, ausschnitt, ring, prisma, zylinder, zusammengesetzt]),
};
