/**
 * Labels (Bundesland × Schulform × Klasse) an Themen und Unterthemen: Vereinigung und Anzeige der Klassen.
 * Reine Logik ohne I/O (ADR-0003).
 */
import type { CurriculumLabel, Topic } from '../types';
import { DEFAULT_LEARNER_CONTEXT, type LearnerContext } from './levels';

export const labelKey = (l: CurriculumLabel) => `${l.state}|${l.schoolType}|${l.grade}`;

/** Vereinigung mehrerer Label-Listen ohne Doppelte, sortiert nach Land, Schulform, Klasse. */
export function unionLabels(lists: CurriculumLabel[][]): CurriculumLabel[] {
  const byKey = new Map<string, CurriculumLabel>();
  for (const l of lists.flat()) byKey.set(labelKey(l), l);
  return [...byKey.values()].sort((a, b) => a.state.localeCompare(b.state) || a.schoolType.localeCompare(b.schoolType) || a.grade - b.grade);
}

/** Klassen, in denen die Labels für Land und Schulform des Lernenden gelten (aufsteigend, ohne Doppelte). */
export function gradesFor(labels: CurriculumLabel[], ctx: LearnerContext = DEFAULT_LEARNER_CONTEXT): number[] {
  const grades = labels.filter((l) => l.state === ctx.state && l.schoolType === ctx.schoolType).map((l) => l.grade);
  return [...new Set(grades)].sort((a, b) => a - b);
}

/** „Klasse 9“, „Klasse 8–9“, „Klasse 5, 10“ – oder null, wenn kein Label zum Kontext passt. */
export function gradeText(labels: CurriculumLabel[], ctx: LearnerContext = DEFAULT_LEARNER_CONTEXT): string | null {
  const grades = gradesFor(labels, ctx);
  if (grades.length === 0) return null;
  const ranges: string[] = [];
  let start = grades[0];
  for (let i = 1; i <= grades.length; i++) {
    if (grades[i] === grades[i - 1] + 1) continue;
    const end = grades[i - 1];
    ranges.push(end === start ? `${start}` : `${start}–${end}`);
    start = grades[i];
  }
  return `Klasse ${ranges.join(', ')}`;
}

/** Zeile über dem Thementitel: „Klasse 9 · Geometrie“ bzw. nur das Themengebiet. */
export function topicCaption(topic: Pick<Topic, 'labels' | 'area'>, ctx: LearnerContext = DEFAULT_LEARNER_CONTEXT): string {
  const grade = gradeText(topic.labels, ctx);
  return grade ? `${grade} · ${topic.area}` : topic.area;
}
