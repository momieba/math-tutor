import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pythagoras } from '../../content/pythagoras';
import type { AttemptSubmission } from '../../types';
import { createLocalGradingService } from '../local/localGradingService';
import { createLocalLearnerRepository, type LocalLearnerRepository } from '../local/localLearnerRepository';
import { createAttemptSubmissionService } from './attemptSubmissionService';
import { createDraftStore, createMemoryStorage, type KeyValueStorage } from './draftStore';
import { createProgressService } from './progressService';
import { createStaticContentRepository } from './staticContentRepository';

/** In-Memory-localStorage für die Node-Testumgebung (gleiches Verhalten wie im Browser, inkl. Quota-Simulation). */
function fakeLocalStorage(maxChars = Infinity): Storage & { size(): number } {
  const m = new Map<string, string>();
  const size = () => [...m.values()].reduce((n, v) => n + v.length, 0);
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (size() - (m.get(k)?.length ?? 0) + v.length > maxChars) throw new DOMException('Speicher voll', 'QuotaExceededError');
      m.set(k, v);
    },
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    size,
  };
}

const chapter = pythagoras.subtopics[0];
const exercise = chapter.exercises[0]; // Multiple Choice, richtige Antwort „b“

function inputFor(raw: string, over: Partial<AttemptSubmission> = {}): AttemptSubmission {
  return { userId: 'user-1', exerciseId: exercise.id, answerRaw: raw, startedAt: new Date().toISOString(), ...over };
}

const failingLearner = (base: LocalLearnerRepository, error: Error): LocalLearnerRepository => ({
  ...base,
  saveAttempt: vi.fn().mockRejectedValue(error),
});

/** Abgabe-Dienst wie in der App: lokaler Bewertungsdienst über dem (ggf. fehlschlagenden) Learner-Repository. */
const submissionFor = (learner: LocalLearnerRepository, storage: KeyValueStorage = createMemoryStorage()) =>
  createAttemptSubmissionService(createLocalGradingService(learner), createDraftStore(storage));

describe('Abgabe im lokalen Modus', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('bewertet, speichert Versuch + Korrektur und aktualisiert den Fortschritt', async () => {
    const learner = createLocalLearnerRepository();
    const drafts = createDraftStore(createMemoryStorage());
    const grading = createLocalGradingService(learner);
    await grading.revealHint('user-1', exercise.id, 1);

    const result = await createAttemptSubmissionService(grading, drafts).submit(inputFor('b'));

    expect(result).toMatchObject({ ok: true, outcome: { status: 'saved', evaluation: { verdict: 'correct' } } });
    const saved = await learner.listAttempts('user-1', { exerciseId: exercise.id });
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ answerRaw: 'b', hintsUsed: 1, isCorrect: true, points: 1 });
    expect(saved[0].correction).toMatchObject({ source: 'auto', verdict: 'correct' });

    const progress = await createProgressService(createStaticContentRepository(), learner).getSubtopicProgress('user-1', chapter.id);
    expect(progress.attemptedExercises).toBe(1);
    expect(progress.status).toBe('in_progress');
    expect(progress.score).toBeGreaterThan(0);
    expect(await drafts.get('user-1', exercise.id)).toBeNull();
  });

  it('liefert nach der Abgabe die Lösung zum Nachlesen', async () => {
    const result = await submissionFor(createLocalLearnerRepository()).submit(inputFor('c'));
    if (!result.ok || result.outcome.status !== 'saved') throw new Error('erwartet: gespeichert');
    expect(result.outcome.evaluation.verdict).toBe('incorrect');
    expect(result.outcome.review.solution).toEqual(exercise.solution);
    expect(result.outcome.review.commonMistakes).toEqual(exercise.commonMistakes);
  });

  it('speichert die Handschrift als Submission zur Aufgabe', async () => {
    const learner = createLocalLearnerRepository();
    const strokes = [{ tool: 'pen', color: '#000', width: 3, points: [{ x: 1, y: 2, p: 0.5 }] }];
    const result = await submissionFor(learner).submit(inputFor('b', { submission: { kind: 'canvas', dataUrl: 'data:image/png;base64,AAAA', strokes } }));
    if (!result.ok || result.outcome.status !== 'saved') throw new Error('erwartet: gespeichert');
    const { record } = result.outcome;
    expect(record.submission).toMatchObject({ kind: 'canvas', imageRef: 'data:image/png;base64,AAAA', attemptId: record.id });
    expect(await learner.getSubmissionImageUrl(record.submission!)).toBe('data:image/png;base64,AAAA');
  });

  it('trennt Daten verschiedener Nutzer', async () => {
    const learner = createLocalLearnerRepository();
    await submissionFor(learner).submit(inputFor('b'));
    expect(await learner.listAttempts('user-2')).toHaveLength(0);
  });

  it('speichert unklare Eingaben nicht (Rückfrage statt Bewertung)', async () => {
    const learner = createLocalLearnerRepository();
    const numeric = pythagoras.subtopics.flatMap((s) => s.exercises).find((e) => e.answer.kind === 'numeric')!;
    const result = await submissionFor(learner).submit(inputFor('irgendwas', { exerciseId: numeric.id }));
    expect(result).toMatchObject({ ok: true, outcome: { status: 'unclear', evaluation: { verdict: 'unclear' } } });
    expect(await learner.listAttempts('user-1')).toHaveLength(0);
  });
});

describe('Hilfen werden protokolliert und angerechnet', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('Hinweise nur der Reihe nach; der Stand überlebt einen neuen Dienst (Neuladen)', async () => {
    const learner = createLocalLearnerRepository();
    const grading = createLocalGradingService(learner);
    await expect(grading.revealHint('user-1', exercise.id, 2)).rejects.toThrow(/Reihe nach/);
    expect(await grading.revealHint('user-1', exercise.id, 1)).toEqual([exercise.hints[0]]);
    expect(await grading.revealHint('user-1', exercise.id, 2)).toEqual(exercise.hints.slice(0, 2));
    expect(await createLocalGradingService(learner).getSession('user-1', exercise.id)).toEqual({ hints: exercise.hints.slice(0, 2), solution: null });
  });

  it('angesehene Lösung zählt für den nächsten Versuch, danach beginnt die Bearbeitung neu', async () => {
    const learner = createLocalLearnerRepository();
    const grading = createLocalGradingService(learner);
    expect(await grading.revealSolution('user-1', exercise.id)).toEqual(exercise.solution);
    const submission = createAttemptSubmissionService(grading, createDraftStore(createMemoryStorage()));
    await submission.submit(inputFor('b'));
    expect(await learner.listAttempts('user-1')).toMatchObject([{ solutionViewed: true }]);
    const second = await submission.submit(inputFor('b'));
    expect(second).toMatchObject({ ok: true, outcome: { record: { solutionViewed: false, hintsUsed: 0 } } });
    expect(await grading.getSession('user-1', exercise.id)).toEqual({ hints: [], solution: null });
  });

  it('Lösung zum Nachlesen erst nach einem Versuch', async () => {
    const learner = createLocalLearnerRepository();
    const grading = createLocalGradingService(learner);
    expect(await grading.getReview('user-1', exercise.id)).toBeNull();
    await submissionFor(learner).submit(inputFor('c'));
    expect(await grading.getReview('user-1', exercise.id)).toMatchObject({ solution: exercise.solution });
  });

  it('die öffentliche Aufgabe enthält keine Lösung', async () => {
    const pub = await createStaticContentRepository().getExercise(exercise.id);
    expect(pub).toMatchObject({ id: exercise.id, answerFormat: { kind: 'choice' } });
    expect(Object.keys(pub!)).not.toEqual(expect.arrayContaining(['answer']));
    for (const key of ['answer', 'hints', 'solution', 'commonMistakes']) expect(pub).not.toHaveProperty(key);
  });
});

describe('Entwurfs-Fallback bei fehlgeschlagener Speicherung', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('sichert die Eingabe als Entwurf und erlaubt einen erneuten Versuch', async () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStore(storage);
    const real = createLocalLearnerRepository();
    const grading = createLocalGradingService(real);
    await grading.revealHint('user-1', exercise.id, 1);
    await grading.revealHint('user-1', exercise.id, 2);
    const input = inputFor('c');

    const failed = await submissionFor(failingLearner(real, new TypeError('Failed to fetch')), storage).submit(input);
    expect(failed).toMatchObject({ ok: false, draftSaved: true, imageDropped: false });
    if (!failed.ok) expect(failed.error).toMatch(/Verbindung/);

    const pending = await drafts.get('user-1', exercise.id);
    expect(pending?.input).toEqual(input);
    expect(pending?.lastError).toBeTruthy();
    expect(await real.listAttempts('user-1')).toHaveLength(0);

    // Erneuter Versuch (z. B. nach Neuladen der Seite) mit funktionierendem Backend: die Hinweise zählen weiterhin
    const ok = await createAttemptSubmissionService(grading, drafts).submit(pending!.input);
    expect(ok.ok).toBe(true);
    expect(await drafts.get('user-1', exercise.id)).toBeNull();
    expect(await real.listAttempts('user-1')).toMatchObject([{ hintsUsed: 2 }]);
  });

  it('sichert bei vollem Speicher wenigstens die Antwort ohne Bild', async () => {
    const tiny = fakeLocalStorage(2000);
    const input = inputFor('b', { submission: { kind: 'canvas', dataUrl: `data:image/png;base64,${'A'.repeat(5000)}`, strokes: [] } });
    const quota = new DOMException('voll', 'QuotaExceededError');

    const res = await submissionFor(failingLearner(createLocalLearnerRepository(), quota), tiny).submit(input);

    expect(res).toMatchObject({ ok: false, draftSaved: true, imageDropped: true });
    if (!res.ok) expect(res.error).toMatch(/Speicher/);
    const pending = await createDraftStore(tiny).get('user-1', exercise.id);
    expect(pending?.imageDropped).toBe(true);
    expect(pending?.input.answerRaw).toBe('b');
    expect(pending?.input.submission).toEqual({ kind: 'canvas' });
  });

  it('meldet, wenn nicht einmal der Entwurf gesichert werden kann', async () => {
    const broken: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('gesperrt');
      },
      removeItem: () => {},
    };
    const res = await submissionFor(failingLearner(createLocalLearnerRepository(), new Error('Serverfehler')), broken).submit(inputFor('b'));
    expect(res).toMatchObject({ ok: false, draftSaved: false, error: 'Serverfehler' });
  });

  it('verwirft Entwürfe und ignoriert beschädigte Einträge', async () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStore(storage);
    const service = submissionFor(failingLearner(createLocalLearnerRepository(), new Error('x')), storage);
    await service.submit(inputFor('b'));
    expect(await service.getPending('user-1', exercise.id)).not.toBeNull();
    await service.discardPending('user-1', exercise.id);
    expect(await service.getPending('user-1', exercise.id)).toBeNull();

    storage.setItem(`mathmvp:v1:draft:user-1:${exercise.id}`, '{kaputt');
    expect(await drafts.get('user-1', exercise.id)).toBeNull();
  });
});
