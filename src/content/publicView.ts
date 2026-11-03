/**
 * Öffentliche Sicht auf die Wissensbasis: Aufgaben ohne Lösungsschlüssel.
 * Genutzt vom lokalen Content-Repository und vom Seed-Generator (Spalte exercises.answer_format),
 * damit beide Modi dem Client exakt dieselben Felder liefern.
 */
import type { AnswerFormat, AuthoredExercise, AuthoredTopic, Exercise, ExpectedAnswer, Topic } from '../types';

export function answerFormatOf(a: ExpectedAnswer): AnswerFormat {
  return a.kind === 'numeric' && a.unit ? { kind: a.kind, unit: a.unit } : { kind: a.kind };
}

export function toPublicExercise(e: AuthoredExercise): Exercise {
  const { answer, hints: _hints, solution: _solution, commonMistakes: _mistakes, ...rest } = e;
  return { ...rest, answerFormat: answerFormatOf(answer) };
}

export function toPublicTopic(t: AuthoredTopic): Topic {
  return { ...t, subtopics: t.subtopics.map((s) => ({ ...s, exercises: s.exercises.map(toPublicExercise) })) };
}
