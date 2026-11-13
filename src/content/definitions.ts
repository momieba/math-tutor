/**
 * Definitionsfragen: aus den Regeln jedes Kapitels (Fachbegriff + Erklärung) automatisch erzeugt, in zwei Richtungen:
 * - „Was bedeutet …?“ (Begriff → Erklärung): Teil des Checks am Kapitelanfang (checkpoint 'definition')
 * - „Wie heißt der Fachbegriff?“ (Erklärung → Begriff): wird beim Üben immer wieder eingestreut (learningPath.ts)
 * Die IDs hängen an der Position der Regel im Kapitel; Regeln deshalb nur hinten anfügen, nicht umsortieren.
 */
import type { AuthoredExercise, AuthoredSubtopic, AuthoredTopic, Rule } from '../types';

/** Antwortoption aus einer Regel: Erklärung, ggf. mit Formel. */
function meaning(r: Rule): string {
  if (!r.math) return r.explanation;
  const base = r.explanation.replace(/[:\s]+$/, '');
  return `${base}${/z\.\s?B\.?$/.test(base) ? ' ' : ': '}$${r.math}$`;
}

/** Begriff ohne Formatierung, für die Frage („Schnittpunkt mit der $y$-Achse“ bleibt lesbar). */
const term = (r: Rule) => r.term;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Erklärung ohne den Begriff selbst (sonst verrät die Frage die Antwort). */
function masked(r: Rule): string {
  const words = r.term.replace(/\$[^$]*\$/g, '').split(/\s+/).filter((w) => w.length > 3);
  let text = meaning(r);
  for (const w of words) text = text.replace(new RegExp(escape(w), 'gi'), '…');
  return text;
}

/** Stabile Position der richtigen Antwort (nicht immer a), aus der ID abgeleitet. */
function slot(id: string, n: number): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % n;
}

function choiceExercise(o: { id: string; subtopicId: string; prompt: string; correct: string; wrong: string[]; hints: [string, string, string]; explanation: string; reverse: boolean }): AuthoredExercise {
  const labels = [...new Set(o.wrong.filter((w) => w !== o.correct))].slice(0, 3);
  labels.splice(slot(o.id, labels.length + 1), 0, o.correct);
  const ids = ['a', 'b', 'c', 'd'];
  const correctId = ids[labels.indexOf(o.correct)];
  const wrongId = ids.find((id) => id !== correctId)!;
  return {
    id: o.id,
    subtopicId: o.subtopicId,
    type: 'multiple-choice',
    requirement: 'knowledge',
    difficulty: 1,
    checkpoint: o.reverse ? undefined : 'definition',
    prompt: o.prompt,
    choices: labels.map((label, i) => ({ id: ids[i], label })),
    answer: { kind: 'choice', correct: correctId },
    hints: o.hints,
    solution: { steps: [{ text: o.explanation }], finalAnswer: o.correct },
    objectives: ['Fachbegriffe und Definitionen kennen'],
    commonMistakes: [{ description: 'Begriffe verwechselt', feedback: 'Schau dir die Begriffe im Schritt „Erklärung“ noch einmal an – dort steht jede Definition.', answers: [wrongId] }],
  };
}

/** Definitionsfragen eines Kapitels. Falsche Antworten kommen aus den anderen Regeln des Kapitels, notfalls des Themas. */
export function definitionExercises(sub: AuthoredSubtopic, topicRules: Rule[]): AuthoredExercise[] {
  if (sub.rules.length === 0) return [];
  const others = (r: Rule) => [...sub.rules.filter((x) => x !== r), ...topicRules.filter((x) => !sub.rules.includes(x))];
  return sub.rules.flatMap((r, i) => {
    const pool = others(r);
    if (pool.length < 2) return [];
    const explanation = `„${term(r)}“: ${meaning(r)}`;
    const forward = choiceExercise({
      id: `${sub.id}-def-${i + 1}`,
      subtopicId: sub.id,
      prompt: `Was bedeutet „${term(r)}“?`,
      correct: meaning(r),
      wrong: pool.map(meaning),
      hints: ['Denk an die Erklärung zu Beginn des Kapitels.', `Wo kommt „${term(r)}“ in den Regeln vor?`, 'Schließe zuerst die Antworten aus, die zu anderen Begriffen gehören.'],
      explanation,
      reverse: false,
    });
    const reverse = choiceExercise({
      id: `${sub.id}-defr-${i + 1}`,
      subtopicId: sub.id,
      prompt: `Welcher Fachbegriff passt? „${masked(r)}“`,
      correct: term(r),
      wrong: pool.map(term),
      hints: ['Lies die Beschreibung genau: Worum geht es?', 'Denk an die Begriffe aus der Erklärung des Kapitels.', 'Schließe Begriffe aus, die etwas anderes beschreiben.'],
      explanation,
      reverse: true,
    });
    return [forward, reverse];
  });
}

/** Ergänzt alle Kapitel eines Themas um ihre Definitionsfragen (hinten angehängt, IDs bleiben stabil). */
export function withDefinitions(topic: AuthoredTopic): AuthoredTopic {
  const topicRules = topic.subtopics.flatMap((s) => s.rules);
  return { ...topic, subtopics: topic.subtopics.map((s) => ({ ...s, exercises: [...s.exercises, ...definitionExercises(s, topicRules)] })) };
}
