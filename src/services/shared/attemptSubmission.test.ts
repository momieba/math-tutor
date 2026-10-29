import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pythagoras } from '../../content/pythagoras';
import { evaluateAnswer } from '../../domain/evaluate';
import type { NewAttemptInput } from '../../types';
import { createLocalLearnerRepository } from '../local/localLearnerRepository';
import type { LearnerRepository } from '../types';
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

function inputFor(raw: string, over: Partial<NewAttemptInput> = {}): NewAttemptInput {
  const ev = evaluateAnswer(exercise, raw);
  return {
    userId: 'user-1',
    exerciseId: exercise.id,
    subtopicId: chapter.id,
    topicId: pythagoras.id,
    mode: 'practice',
    answerRaw: raw,
    hintsUsed: 0,
    solutionViewed: false,
    startedAt: new Date().toISOString(),
    correction: { source: 'auto', verdict: ev.verdict, points: ev.points, marks: ev.marks, feedback: ev.feedback },
    ...over,
  };
}

const failingLearner = (base: LearnerRepository, error: Error): LearnerRepository => ({
  ...base,
  saveAttempt: vi.fn().mockRejectedValue(error),
});

describe('Abgabe im lokalen Modus', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('speichert Versuch + Korrektur und aktualisiert den Fortschritt', async () => {
    const learner = createLocalLearnerRepository();
    const drafts = createDraftStore(createMemoryStorage());
    const submission = createAttemptSubmissionService(learner, drafts);

    const result = await submission.submit(inputFor('b', { hintsUsed: 1 }));

    expect(result.ok).toBe(true);
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

  it('speichert die Handschrift als Submission zur Aufgabe', async () => {
    const learner = createLocalLearnerRepository();
    const submission = createAttemptSubmissionService(learner, createDraftStore(createMemoryStorage()));
    const strokes = [{ tool: 'pen', color: '#000', width: 3, points: [{ x: 1, y: 2, p: 0.5 }] }];
    const result = await submission.submit(inputFor('b', { submission: { kind: 'canvas', dataUrl: 'data:image/png;base64,AAAA', strokes } }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.submission).toMatchObject({ kind: 'canvas', imageRef: 'data:image/png;base64,AAAA', attemptId: result.record.id });
    expect(await learner.getSubmissionImageUrl(result.record.submission!)).toBe('data:image/png;base64,AAAA');
  });

  it('trennt Daten verschiedener Nutzer', async () => {
    const learner = createLocalLearnerRepository();
    await createAttemptSubmissionService(learner, createDraftStore(createMemoryStorage())).submit(inputFor('b'));
    expect(await learner.listAttempts('user-2')).toHaveLength(0);
  });
});

describe('Entwurfs-Fallback bei fehlgeschlagener Speicherung', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('sichert die Eingabe als Entwurf und erlaubt einen erneuten Versuch', async () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStore(storage);
    const real = createLocalLearnerRepository();
    const input = inputFor('c', { hintsUsed: 2 });

    const failed = await createAttemptSubmissionService(failingLearner(real, new TypeError('Failed to fetch')), drafts).submit(input);
    expect(failed).toMatchObject({ ok: false, draftSaved: true, imageDropped: false });
    if (!failed.ok) expect(failed.error).toMatch(/Verbindung/);

    const pending = await drafts.get('user-1', exercise.id);
    expect(pending?.input).toEqual(input);
    expect(pending?.lastError).toBeTruthy();
    expect(await real.listAttempts('user-1')).toHaveLength(0);

    // Erneuter Versuch (z. B. nach Neuladen der Seite) mit funktionierendem Backend
    const ok = await createAttemptSubmissionService(real, drafts).submit(pending!.input);
    expect(ok.ok).toBe(true);
    expect(await drafts.get('user-1', exercise.id)).toBeNull();
    expect(await real.listAttempts('user-1')).toHaveLength(1);
  });

  it('sichert bei vollem Speicher wenigstens die Antwort ohne Bild', async () => {
    const tiny = fakeLocalStorage(2000);
    const drafts = createDraftStore(tiny);
    const input = inputFor('b', { submission: { kind: 'canvas', dataUrl: `data:image/png;base64,${'A'.repeat(5000)}`, strokes: [] } });
    const quota = new DOMException('voll', 'QuotaExceededError');

    const res = await createAttemptSubmissionService(failingLearner(createLocalLearnerRepository(), quota), drafts).submit(input);

    expect(res).toMatchObject({ ok: false, draftSaved: true, imageDropped: true });
    if (!res.ok) expect(res.error).toMatch(/Speicher/);
    const pending = await drafts.get('user-1', exercise.id);
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
    const res = await createAttemptSubmissionService(failingLearner(createLocalLearnerRepository(), new Error('Serverfehler')), createDraftStore(broken)).submit(
      inputFor('b'),
    );
    expect(res).toMatchObject({ ok: false, draftSaved: false, error: 'Serverfehler' });
  });

  it('verwirft Entwürfe und ignoriert beschädigte Einträge', async () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStore(storage);
    const service = createAttemptSubmissionService(failingLearner(createLocalLearnerRepository(), new Error('x')), drafts);
    await service.submit(inputFor('b'));
    expect(await service.getPending('user-1', exercise.id)).not.toBeNull();
    await service.discardPending('user-1', exercise.id);
    expect(await service.getPending('user-1', exercise.id)).toBeNull();

    storage.setItem(`mathmvp:v1:draft:user-1:${exercise.id}`, '{kaputt');
    expect(await drafts.get('user-1', exercise.id)).toBeNull();
  });
});
