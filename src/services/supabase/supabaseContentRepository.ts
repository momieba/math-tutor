/**
 * ContentRepository auf den Inhaltstabellen in Supabase (supabase/migrations). Die Datenbank ist im Supabase-Modus
 * die Quelle der Inhalte; befüllt wird sie aus der geprüften Wissensbasis per `npm run seed:sql`.
 * Lösungsschlüssel (exercise_keys, hints, solutions) sind für Clients nicht lesbar und werden hier nicht abgefragt.
 */
import type { AnswerFormat, Choice, Curriculum, Exercise, LearningMaterial, ReviewStatus, Rule, Subtopic, Topic, WorkedExample } from '../../types';
import { createCatalogContentRepository } from '../shared/catalogContentRepository';
import type { ContentRepository } from '../types';
import { getSupabase } from './client';

interface CurriculumRow {
  id: string;
  state: string;
  school_type: string;
  grade_from: number;
  grade_to: number;
  version: string;
}
interface MaterialRow {
  id: string;
  position: number;
  kind: LearningMaterial['kind'];
  title: string;
  url: string | null;
  provider: LearningMaterial['provider'] | null;
  duration_sec: number | null;
}
interface ExerciseRow {
  id: string;
  subtopic_id: string;
  position: number;
  type: Exercise['type'];
  difficulty: Exercise['difficulty'];
  prompt: string;
  choices: Choice[] | null;
  answer_format: AnswerFormat;
  objectives: string[];
  figure: Exercise['figure'] | null;
}
interface SubtopicRow {
  id: string;
  topic_id: string;
  position: number;
  title: string;
  description: string;
  objective: string;
  intro: string;
  rules: Rule[];
  example: WorkedExample;
  summary: string[];
  learning_materials: MaterialRow[];
  exercises: ExerciseRow[];
}
interface TopicRow {
  id: string;
  curriculum_id: string;
  grade: number;
  area: string;
  title: string;
  description: string;
  keywords: string[];
  review_status: ReviewStatus;
  position: number;
  subtopics: SubtopicRow[];
}

const EXERCISE_COLUMNS = 'id, subtopic_id, position, type, difficulty, prompt, choices, answer_format, objectives, figure';
const TOPIC_SELECT = `*, subtopics(*, learning_materials(*), exercises(${EXERCISE_COLUMNS}))`;

const byPosition = <T extends { position: number }>(rows: T[]) => [...rows].sort((a, b) => a.position - b.position);

function mapExercise(r: ExerciseRow): Exercise {
  return {
    id: r.id,
    subtopicId: r.subtopic_id,
    type: r.type,
    difficulty: r.difficulty,
    prompt: r.prompt,
    choices: r.choices ?? undefined,
    answerFormat: r.answer_format,
    objectives: r.objectives,
    figure: r.figure ?? undefined,
  };
}

function mapSubtopic(r: SubtopicRow): Subtopic {
  return {
    id: r.id,
    topicId: r.topic_id,
    order: r.position,
    title: r.title,
    description: r.description,
    objective: r.objective,
    intro: r.intro,
    rules: r.rules,
    materials: byPosition(r.learning_materials).map((m) => ({
      id: m.id,
      kind: m.kind,
      title: m.title,
      url: m.url,
      provider: m.provider ?? undefined,
      durationSec: m.duration_sec ?? undefined,
    })),
    example: r.example,
    summary: r.summary,
    exercises: byPosition(r.exercises).map(mapExercise),
  };
}

function mapTopic(r: TopicRow): Topic {
  return {
    id: r.id,
    curriculumId: r.curriculum_id,
    subject: 'Mathematik',
    grade: r.grade,
    area: r.area,
    title: r.title,
    description: r.description,
    keywords: r.keywords,
    reviewStatus: r.review_status,
    subtopics: byPosition(r.subtopics).map(mapSubtopic),
  };
}

function mapCurriculum(r: CurriculumRow): Curriculum {
  return { id: r.id, subject: 'Mathematik', state: r.state, schoolType: r.school_type, gradeFrom: r.grade_from, gradeTo: r.grade_to, version: r.version };
}

export function createSupabaseContentRepository(): ContentRepository {
  return createCatalogContentRepository(async () => {
    const sb = getSupabase();
    const [curricula, topics] = await Promise.all([
      sb.from('curricula').select('id, state, school_type, grade_from, grade_to, version').returns<CurriculumRow[]>(),
      sb.from('topics').select(TOPIC_SELECT).order('position').returns<TopicRow[]>(),
    ]);
    if (curricula.error) throw new Error(curricula.error.message);
    if (topics.error) throw new Error(topics.error.message);
    return { curricula: (curricula.data ?? []).map(mapCurriculum), topics: (topics.data ?? []).map(mapTopic) };
  });
}
