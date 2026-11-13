import { describe, expect, it } from 'vitest';
import type { CurriculumLabel } from '../types';
import { gradesFor, gradeText, topicCaption, unionLabels } from './labels';

const nw = (...grades: number[]): CurriculumLabel[] => grades.map((grade) => ({ state: 'NW', schoolType: 'gymnasium', grade }));
const by = (grade: number): CurriculumLabel => ({ state: 'BY', schoolType: 'gymnasium', grade });

describe('Labels', () => {
  it('vereinigt ohne Doppelte und sortiert', () => {
    expect(unionLabels([nw(9, 8), nw(9), [by(7)]])).toEqual([by(7), ...nw(8, 9)]);
  });

  it('nimmt nur Klassen zu Land und Schulform des Lernenden', () => {
    const labels = [...nw(9), by(7), { state: 'NW', schoolType: 'realschule', grade: 10 }];
    expect(gradesFor(labels)).toEqual([9]);
    expect(gradesFor(labels, { state: 'BY', schoolType: 'gymnasium' })).toEqual([7]);
  });

  it('fasst Klassen zu Bereichen zusammen', () => {
    expect(gradeText(nw(9))).toBe('Klasse 9');
    expect(gradeText(nw(9, 8))).toBe('Klasse 8–9');
    expect(gradeText(nw(5, 10))).toBe('Klasse 5, 10');
    expect(gradeText(nw(7, 8, 9, 11))).toBe('Klasse 7–9, 11');
    expect(gradeText([by(7)])).toBeNull();
  });

  it('Kursart: Labels ohne Kursart gelten für GK und LK, nur-LK-Inhalte sind gekennzeichnet', () => {
    const lk = (grade: number): CurriculumLabel => ({ state: 'NW', schoolType: 'gymnasium', grade, course: 'LK' });
    expect(unionLabels([[lk(12)], nw(12)])).toEqual([...nw(12), lk(12)]); // GK+LK und nur LK sind verschiedene Labels
    expect(gradeText([lk(12), lk(13)])).toBe('Klasse 12–13 (LK)');
    expect(gradeText([lk(12), lk(13)], { state: 'NW', schoolType: 'gymnasium', course: 'LK' })).toBe('Klasse 12–13');
    expect(gradeText([lk(12)], { state: 'NW', schoolType: 'gymnasium', course: 'GK' })).toBeNull();
    expect(gradeText([...nw(12), lk(13)], { state: 'NW', schoolType: 'gymnasium', course: 'GK' })).toBe('Klasse 12');
    expect(gradeText([...nw(12), lk(13)])).toBe('Klasse 12–13'); // gemischt: keine Kennzeichnung
  });

  it('zeigt ohne passendes Label nur das Themengebiet', () => {
    expect(topicCaption({ labels: nw(9), area: 'Geometrie' })).toBe('Klasse 9 · Geometrie');
    expect(topicCaption({ labels: [by(7)], area: 'Geometrie' })).toBe('Geometrie');
  });
});
