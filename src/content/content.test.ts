import { describe, expect, it } from 'vitest';
import { POOL_TOPIC_IDS, topics } from './index';
import { canonicalAnswer, evaluateAnswer } from '../domain/evaluate';
import { exerciseKey } from './templates';

/** Struktur-Prüfung der Wissensbasis: verhindert unvollständige oder inkonsistente Inhalte. */
describe('Wissensbasis', () => {
  const allExercises = topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises));

  it('hat eindeutige IDs', () => {
    const ids = [...topics.map((t) => t.id), ...topics.flatMap((t) => t.subtopics.map((s) => s.id)), ...allExercises.map((e) => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Pythagoras hat alle 8 Kapitel, andere Themen mindestens 2', () => {
    for (const t of topics) {
      expect(t.subtopics.length).toBeGreaterThanOrEqual(t.id === 'pythagoras' ? 8 : 2);
    }
  });

  for (const t of topics) {
    for (const s of t.subtopics) {
      it(`Kapitel ${s.id} ist vollständig`, () => {
        expect(s.topicId).toBe(t.id);
        expect(s.objective.length).toBeGreaterThan(10);
        expect(s.intro.length).toBeGreaterThan(10);
        expect(s.rules.length).toBeGreaterThan(0);
        expect(s.materials.some((m) => m.kind === 'video')).toBe(true);
        expect(s.example.steps.length).toBeGreaterThan(0);
        expect(s.summary.length).toBeGreaterThan(0);
        expect(s.exercises.length).toBeGreaterThanOrEqual(3);
        for (const e of s.exercises) {
          expect(e.subtopicId).toBe(s.id);
          expect(e.hints).toHaveLength(3);
          expect(e.solution.steps.length).toBeGreaterThan(0);
          expect(e.commonMistakes.length).toBeGreaterThan(0);
          if (e.type === 'multiple-choice') {
            expect(e.answer.kind).toBe('choice');
            const correct = e.answer.kind === 'choice' ? e.answer.correct : '';
            expect(e.choices?.some((c) => c.id === correct)).toBe(true);
          }
        }
      });
    }
  }

  it('typische Fehlantworten werden nicht als korrekt bewertet', () => {
    for (const e of allExercises) {
      for (const m of e.commonMistakes) {
        for (const a of m.answers ?? []) {
          expect(evaluateAnswer(e, a).verdict, `${e.id}: "${a}"`).not.toBe('correct');
        }
      }
    }
  });
});

/** Kapitel mit Aufgabenpool (adaptives Üben): Mindestumfang und Mischung, siehe ARCHITECTURE.md „Aufgabenpools“. */
describe('Aufgabenpools', () => {
  const poolTopics = topics.filter((t) => POOL_TOPIC_IDS.includes(t.id));

  it('alle Pool-Themen sind vorhanden', () => {
    expect(poolTopics.map((t) => t.id).sort()).toEqual([...POOL_TOPIC_IDS].sort());
  });

  for (const t of poolTopics) {
    for (const s of t.subtopics) {
      it(`${s.id}: mindestens 50 Aufgaben, alle Stufen, gemischte Anforderungen`, () => {
        const ex = s.exercises;
        expect(ex.length).toBeGreaterThanOrEqual(50);
        expect(new Set(ex.map((e) => e.difficulty))).toEqual(new Set([1, 2, 3]));
        for (const d of [1, 2, 3]) expect(ex.filter((e) => e.difficulty === d).length, `Stufe ${d}`).toBeGreaterThanOrEqual(8);
        expect(new Set(ex.map((e) => e.requirement)).size).toBeGreaterThanOrEqual(3);
        expect(ex.filter((e) => e.requirement === 'application').length / ex.length).toBeGreaterThanOrEqual(0.2);
        expect(new Set(ex.map(exerciseKey)).size, 'doppelte Aufgaben').toBe(ex.length);
      });
    }
  }

  for (const t of poolTopics) {
    for (const s of t.subtopics) {
      it(`${s.id}: Formel-Check mit mindestens 3 Fragen (2 zur Formel, wenn das Kapitel Formeln hat)`, () => {
        const checks = s.exercises.filter((e) => e.checkpoint);
        expect(checks.length).toBeGreaterThanOrEqual(3);
        expect(checks.every((e) => e.difficulty <= 2), 'Check-Fragen sind leicht oder mittel').toBe(true);
        if (s.rules.some((r) => r.math)) expect(checks.filter((e) => e.checkpoint === 'formula').length).toBeGreaterThanOrEqual(2);
      });
    }
  }

  it('LaTeX-Befehle haben ihren Backslash (in Template-Strings braucht es \\\\)', () => {
    // Ein einfacher Backslash geht in Template-Strings verloren: `\,` wird zu „,“, `\frac` zu Seitenvorschub + „rac“.
    const broken = /(?<![\\\p{L}])(?:cdot|frac|Rightarrow|sqrt|neq|approx|quad)(?!\p{L})|,\|,|\f/u;
    const texts = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(texts) : []);
    for (const s of poolTopics.flatMap((t) => t.subtopics)) {
      for (const e of s.exercises) {
        // Nur Anzeigetexte prüfen: akzeptierte Eingaben dürfen „sqrt(…)“ o. Ä. enthalten.
        const shown = { ...e, id: '', subtopicId: '', answer: null, commonMistakes: e.commonMistakes.map((m) => ({ ...m, answers: [] })) };
        const bad = texts(shown).find((t) => broken.test(t));
        expect(bad, e.id).toBeUndefined();
      }
    }
  });

  it('ausführliche Lösungen: jeder Denkschritt hat Überschrift und Erklärung, Skizzen haben einen Alternativtext', () => {
    for (const e of topics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises))) {
      for (const d of e.solution.detailed ?? []) {
        expect(d.title.trim(), e.id).not.toBe('');
        expect(d.text.trim().length, e.id).toBeGreaterThan(10);
        if (d.figure) expect(d.figure.alt.trim(), e.id).not.toBe('');
      }
    }
  });

  it('Pythagoras: alle Rechenaufgaben zu Hypotenuse und Kathete haben eine ausführliche Lösung', () => {
    const pyth = topics.find((t) => t.id === 'pythagoras')!;
    const calc = pyth.subtopics.filter((s) => s.id === 'pyth-hypotenuse' || s.id === 'pyth-kathete').flatMap((s) => s.exercises.filter((e) => e.answer.kind === 'numeric' && e.requirement === 'calculation'));
    expect(calc.length).toBeGreaterThan(40);
    for (const e of calc) expect(e.solution.detailed?.length, e.id).toBeGreaterThanOrEqual(5);
  });

  it('jede Aufgabe wird mit ihrer eigenen Soll-Antwort als richtig gewertet', () => {
    for (const e of poolTopics.flatMap((t) => t.subtopics.flatMap((s) => s.exercises))) {
      expect(evaluateAnswer(e, canonicalAnswer(e.answer)).verdict, `${e.id}: ${canonicalAnswer(e.answer)}`).toBe('correct');
      if (e.choices) expect(new Set(e.choices.map((c) => c.label)).size, `${e.id}: doppelte Optionen`).toBe(e.choices.length);
      if (e.figure?.kind === 'coordinate-plane') {
        expect(e.figure.x[0]).toBeLessThan(e.figure.x[1]);
        expect(e.figure.y[0]).toBeLessThan(e.figure.y[1]);
      }
    }
  });
});
