// deno test supabase/functions   (npm run test:functions)
import assert from 'node:assert/strict';
import type { AiGrading } from '../_shared/domain/aiGrading.ts';
import { createGradeHandler, type GradeDeps, type GradedAttempt, type GradingContext } from './handler.ts';

const USER = '11111111-1111-4111-8111-111111111111';
const ATTEMPT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const context = (type: GradingContext['exercise']['type'] = 'numeric'): GradingContext => ({
  exercise: { id: 'pyth-1', type },
  key: { answer: { kind: 'numeric', value: 15, tolerance: 0 }, commonMistakes: [{ description: 'Addiert statt quadriert', feedback: 'Quadriere zuerst.', answers: ['21'] }] },
  review: { hints: ['h1', 'h2', 'h3'], solution: { steps: [{ text: 'a² + b² = c²' }], finalAnswer: '15' }, commonMistakes: [] },
});

function setup(over: Partial<GradeDeps> = {}) {
  const calls = { uploads: [] as string[], removed: [] as string[], recorded: [] as GradedAttempt[] };
  const deps: GradeDeps = {
    resolveUser: async (token) => (token === 'gueltig' ? USER : null),
    loadContext: async (id) => (id === 'pyth-1' ? context() : null),
    uploadImage: async (path) => void calls.uploads.push(path),
    removeImage: async (path) => void calls.removed.push(path),
    recordAttempt: async (a) => void calls.recorded.push(a),
    newId: () => ATTEMPT,
    ...over,
  };
  return { handler: createGradeHandler(deps), calls };
}

const PNG = 'data:image/png;base64,' + btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3));

function post(body: unknown, token = 'gueltig') {
  return new Request('http://localhost/grade-attempt', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

Deno.test('richtige Antwort: speichert und liefert Lösung zum Nachlesen', async () => {
  const { handler, calls } = setup();
  const res = await handler(post({ exerciseId: 'pyth-1', answerRaw: ' 15 ', startedAt: '2026-11-02T10:00:00Z' }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'saved');
  assert.equal(body.attemptId, ATTEMPT);
  assert.equal(body.evaluation.verdict, 'correct');
  assert.deepEqual(body.review.hints, ['h1', 'h2', 'h3']);
  assert.equal(calls.recorded.length, 1);
  assert.equal(calls.recorded[0].answerRaw, '15');
  assert.equal(calls.recorded[0].userId, USER);
  assert.equal(calls.recorded[0].submission, null);
});

Deno.test('typischer Fehler wird erkannt (gleiche evaluate.ts wie lokal)', async () => {
  const { handler } = setup();
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '21' }))).json();
  assert.equal(body.evaluation.verdict, 'incorrect');
  assert.equal(body.evaluation.feedback, 'Quadriere zuerst.');
});

Deno.test('unklare Eingabe: Rückfrage, nichts gespeichert', async () => {
  const { handler, calls } = setup();
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: 'keine Ahnung' }))).json();
  assert.equal(body.status, 'unclear');
  assert.equal(calls.recorded.length, 0);
});

Deno.test('ohne gültige Anmeldung: 401', async () => {
  const { handler, calls } = setup();
  const res = await handler(post({ exerciseId: 'pyth-1', answerRaw: '15' }, 'abgelaufen'));
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /Anmeldung/);
  assert.equal(calls.recorded.length, 0);
});

Deno.test('unbekannte Aufgabe: 404; kaputte Eingaben: 400', async () => {
  const { handler } = setup();
  assert.equal((await handler(post({ exerciseId: 'gibt-es-nicht', answerRaw: '15' }))).status, 404);
  assert.equal((await handler(post({ answerRaw: '15' }))).status, 400);
  assert.equal((await handler(post({ exerciseId: 'pyth-1', answerRaw: 'x'.repeat(501) }))).status, 400);
  assert.equal((await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'video' } }))).status, 400);
  assert.equal((await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas', dataUrl: 'data:image/png;base64,AAAA' } }))).status, 400);
  assert.equal((await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas', dataUrl: 'data:text/html;base64,AAAA' } }))).status, 400);
});

Deno.test('Handschrift: Bild unter <uid>/<attemptId>.png, Striche gespeichert', async () => {
  const { handler, calls } = setup({ loadContext: async () => context('handwriting') });
  const strokes = [{ points: [{ x: 1, y: 2 }] }];
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas', dataUrl: PNG, strokes } }))).json();
  assert.equal(body.status, 'saved');
  assert.deepEqual(calls.uploads, [`${USER}/${ATTEMPT}.png`]);
  assert.deepEqual(calls.recorded[0].submission, { kind: 'canvas', storagePath: `${USER}/${ATTEMPT}.png`, strokes });
  assert.equal(body.evaluation.marks.at(-1).color, 'yellow'); // Rechenweg wird (noch) nicht automatisch geprüft
});

const aiGrading = (over: Partial<AiGrading> = {}): AiGrading => ({
  readable: true,
  transcription: '$c^2 = 9^2 + 12^2$',
  steps: [{ text: '$c^2 = 9^2 + 12^2$', color: 'green', message: '' }],
  issues: [],
  finalAnswerRead: '15',
  workVerdict: 'correct',
  feedback: 'Sauber gerechnet.',
  confidence: 0.9,
  ...over,
});
const handwritingPost = () => post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas', dataUrl: PNG } });

Deno.test('KI-Auswertung: ersetzt die gelbe Markierung durch Schritt-Markierungen, Punkte unverändert', async () => {
  const seen: { userId: string; pngBase64: string }[] = [];
  const { handler, calls } = setup({
    loadContext: async () => context('handwriting'),
    gradeWork: async (req) => (seen.push(req), aiGrading()),
  });
  const body = await (await handler(handwritingPost())).json();
  assert.equal(seen[0].userId, USER);
  assert.equal(seen[0].pngBase64, PNG.slice('data:image/png;base64,'.length));
  assert.equal(body.evaluation.points, 1);
  assert.deepEqual(body.evaluation.marks.at(-1), { color: 'green', message: '$c^2 = 9^2 + 12^2$', stepIndex: 0 });
  assert.ok(!body.evaluation.marks.some((m: { color: string }) => m.color === 'yellow'));
  assert.deepEqual(calls.recorded[0].evaluation.marks, body.evaluation.marks); // so wird es auch gespeichert
});

Deno.test('KI-Auswertung unsicher, nicht freigeschaltet oder fehlerhaft: Rechenweg bleibt gelb, Abgabe klappt', async () => {
  const orig = console.error;
  console.error = () => {};
  try {
    for (const gradeWork of [
      async () => aiGrading({ confidence: 0.2 }),
      async () => null,
      async () => {
        throw new Error('Gemini 429');
      },
    ]) {
      const { handler, calls } = setup({ loadContext: async () => context('handwriting'), gradeWork });
      const body = await (await handler(handwritingPost())).json();
      assert.equal(body.status, 'saved');
      assert.equal(body.evaluation.marks.at(-1).color, 'yellow');
      assert.equal(calls.recorded.length, 1);
    }
  } finally {
    console.error = orig;
  }
});

Deno.test('KI-Auswertung nur mit Bild und nicht bei Multiple Choice', async () => {
  let called = 0;
  const gradeWork = async () => (called++, aiGrading());
  await setup({ gradeWork }).handler(post({ exerciseId: 'pyth-1', answerRaw: '15' }));
  await setup({ loadContext: async () => context('handwriting'), gradeWork }).handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas' } }));
  await setup({ loadContext: async () => context('multiple-choice'), gradeWork }).handler(handwritingPost());
  assert.equal(called, 0);
});

Deno.test('normale Aufgabe mit Foto vom Rechenweg: Bild gespeichert und von der KI ausgewertet', async () => {
  const { handler, calls } = setup({ gradeWork: async () => aiGrading() });
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'photo', dataUrl: PNG } }))).json();
  assert.equal(body.evaluation.verdict, 'correct');
  assert.deepEqual(calls.uploads, [`${USER}/${ATTEMPT}.png`]);
  assert.equal(calls.recorded[0].submission?.kind, 'photo');
  assert.equal(body.evaluation.marks.at(-1).stepIndex, 0);
});

Deno.test('ohne eingetipptes Ergebnis: KI liest das Endergebnis, evaluate.ts bewertet es', async () => {
  const { handler, calls } = setup({ loadContext: async () => context('numeric'), gradeWork: async () => aiGrading({ finalAnswerRead: 'c = 15 cm' }) });
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '', submission: { kind: 'canvas', dataUrl: PNG } }))).json();
  assert.equal(body.status, 'saved');
  assert.equal(body.evaluation.verdict, 'correct');
  assert.equal(calls.recorded[0].answerRaw, 'c = 15 cm'); // im Verlauf steht, was gelesen wurde
});

Deno.test('ohne eingetipptes Ergebnis: falsch gelesenes Ergebnis wird als falsch bewertet (typischer Fehler)', async () => {
  const { handler } = setup({ gradeWork: async () => aiGrading({ finalAnswerRead: '21' }) });
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '', submission: { kind: 'canvas', dataUrl: PNG } }))).json();
  assert.equal(body.evaluation.verdict, 'incorrect');
  assert.equal(body.evaluation.feedback.startsWith('Quadriere zuerst.'), true);
});

Deno.test('ohne eingetipptes Ergebnis: Rückfrage, wenn nichts gelesen werden kann – nichts gespeichert', async () => {
  const orig = console.error;
  console.error = () => {};
  try {
    const cases: [Partial<GradeDeps>, unknown, RegExp][] = [
      [{ gradeWork: async () => aiGrading() }, undefined, /Schreib deinen Rechenweg/], // kein Bild
      [{ gradeWork: async () => null }, { kind: 'canvas', dataUrl: PNG }, /gerade nicht automatisch gelesen/], // KI nicht freigeschaltet
      [{}, { kind: 'canvas', dataUrl: PNG }, /gerade nicht automatisch gelesen/], // keine KI konfiguriert
      [{ gradeWork: async () => { throw new Error('Gemini 503'); } }, { kind: 'canvas', dataUrl: PNG }, /gerade nicht automatisch gelesen/],
      [{ gradeWork: async () => aiGrading({ confidence: 0.3 }) }, { kind: 'photo', dataUrl: PNG }, /kein Ergebnis erkennen/],
      [{ gradeWork: async () => aiGrading({ finalAnswerRead: '' }) }, { kind: 'canvas', dataUrl: PNG }, /kein Ergebnis erkennen/],
    ];
    for (const [over, submission, message] of cases) {
      const { handler, calls } = setup(over);
      const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '', submission }))).json();
      assert.equal(body.status, 'unclear');
      assert.match(body.evaluation.feedback, message);
      assert.equal(calls.recorded.length, 0);
      assert.equal(calls.uploads.length, 0);
    }
  } finally {
    console.error = orig;
  }
});

const blindReading = (finalAnswerRead: string, confidence = 0.9) => ({ readable: true, finalAnswerRead, confidence });
const writtenOnly = () => post({ exerciseId: 'pyth-1', answerRaw: '', submission: { kind: 'canvas', dataUrl: PNG } });

Deno.test('Gegenprobe ohne Musterlösung: gleiche Lesung ⇒ blinde Lesung wird bewertet und gespeichert (source = ai)', async () => {
  const seen: { pngBase64: string }[] = [];
  const { handler, calls } = setup({
    gradeWork: async () => aiGrading({ finalAnswerRead: '15' }),
    readAnswer: async (req) => (seen.push(req), blindReading('c = 15 cm')),
  });
  const body = await (await handler(writtenOnly())).json();
  assert.equal(body.status, 'saved');
  assert.equal(seen[0].pngBase64, PNG.slice('data:image/png;base64,'.length));
  assert.equal(calls.recorded[0].answerRaw, 'c = 15 cm');
  assert.equal(calls.recorded[0].correctionSource, 'ai');
});

Deno.test('Gegenprobe widerspricht der Korrektur (Musterlösung hineingelesen?) ⇒ Rückfrage, nichts gespeichert', async () => {
  const { handler, calls } = setup({ gradeWork: async () => aiGrading({ finalAnswerRead: '15' }), readAnswer: async () => blindReading('16') });
  const body = await (await handler(writtenOnly())).json();
  assert.equal(body.status, 'unclear');
  assert.match(body.evaluation.feedback, /kein Ergebnis erkennen/);
  assert.equal(calls.recorded.length, 0);
});

Deno.test('Korrektur unsicher, Gegenprobe lesbar ⇒ Endergebnis bewertet, Rechenweg bleibt gelb (source = auto)', async () => {
  const { handler, calls } = setup({ gradeWork: async () => aiGrading({ confidence: 0.2 }), readAnswer: async () => blindReading('15') });
  const body = await (await handler(writtenOnly())).json();
  assert.equal(body.status, 'saved');
  assert.equal(body.evaluation.verdict, 'correct');
  assert.equal(body.evaluation.marks.at(-1).color, 'yellow');
  assert.equal(calls.recorded[0].correctionSource, 'auto');
});

Deno.test('Gegenprobe fällt aus ⇒ Lesung der Korrektur zählt; mit eingetipptem Ergebnis keine Gegenprobe', async () => {
  const orig = console.error;
  console.error = () => {};
  try {
    const failing = setup({
      gradeWork: async () => aiGrading({ finalAnswerRead: '15' }),
      readAnswer: async () => {
        throw new Error('Gemini 503');
      },
    });
    assert.equal((await (await failing.handler(writtenOnly())).json()).evaluation.verdict, 'correct');
  } finally {
    console.error = orig;
  }
  let reads = 0;
  const typed = setup({ gradeWork: async () => aiGrading(), readAnswer: async () => (reads++, blindReading('15')) });
  await typed.handler(handwritingPost());
  assert.equal(reads, 0);
});

const drawingContext = (): GradingContext => ({
  exercise: { id: 'pyth-1', type: 'handwriting' },
  key: { answer: { kind: 'drawing', expected: 'Gerade durch (0|-1) und (1|1)' }, commonMistakes: [] },
  review: { hints: ['h1', 'h2', 'h3'], solution: { steps: [{ text: 'Gerade zeichnen' }], finalAnswer: 'Gerade' }, commonMistakes: [] },
});

Deno.test('Zeichenaufgabe: Urteil der KI ist die Bewertung, Beschreibung des Graphen geht an die KI, kein blindes Lesen', async () => {
  const seen: { drawing?: string }[] = [];
  let reads = 0;
  const { handler, calls } = setup({
    loadContext: async () => drawingContext(),
    gradeWork: async (req) => (seen.push(req), aiGrading({ workVerdict: 'partial', finalAnswerRead: '', steps: [{ text: 'Gerade', color: 'red', message: 'Steigung falsch', box: [100, 100, 400, 600] }] })),
    readAnswer: async () => (reads++, { readable: true, finalAnswerRead: 'x', confidence: 0.9 }),
  });
  const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '', submission: { kind: 'canvas', dataUrl: PNG } }))).json();
  assert.equal(body.status, 'saved');
  assert.equal(body.evaluation.verdict, 'partial');
  assert.equal(body.evaluation.points, 0.5);
  assert.deepEqual(body.evaluation.marks[0].region, [100, 100, 400, 600]);
  assert.equal(seen[0].drawing, 'Gerade durch (0|-1) und (1|1)');
  assert.equal(reads, 0);
  assert.equal(calls.recorded[0].answerRaw, '(Zeichnung)');
  assert.equal(calls.recorded[0].correctionSource, 'ai');
});

Deno.test('Zeichenaufgabe ohne Bild oder ohne verlässliche KI: Rückfrage, nichts gespeichert', async () => {
  for (const [over, submission] of [
    [{ gradeWork: async () => aiGrading() }, undefined],
    [{ gradeWork: async () => null }, { kind: 'canvas', dataUrl: PNG }],
    [{ gradeWork: async () => aiGrading({ confidence: 0.2 }) }, { kind: 'canvas', dataUrl: PNG }],
  ] as [Partial<GradeDeps>, unknown][]) {
    const { handler, calls } = setup({ loadContext: async () => drawingContext(), ...over });
    const body = await (await handler(post({ exerciseId: 'pyth-1', answerRaw: '', submission }))).json();
    assert.equal(body.status, 'unclear');
    assert.equal(calls.recorded.length, 0);
  }
});

Deno.test('Speichern schlägt fehl: Bild wird wieder entfernt, 500 ohne interne Details', async () => {
  const { handler, calls } = setup({
    loadContext: async () => context('handwriting'),
    recordAttempt: async () => {
      throw new Error('duplicate key value violates unique constraint');
    },
  });
  const orig = console.error;
  console.error = () => {};
  try {
    const res = await handler(post({ exerciseId: 'pyth-1', answerRaw: '15', submission: { kind: 'canvas', dataUrl: PNG } }));
    assert.equal(res.status, 500);
    assert.doesNotMatch((await res.json()).error, /duplicate/);
  } finally {
    console.error = orig;
  }
  assert.deepEqual(calls.removed, [`${USER}/${ATTEMPT}.png`]);
});

Deno.test('CORS-Preflight und nur POST', async () => {
  const { handler } = setup();
  const pre = await handler(new Request('http://localhost/grade-attempt', { method: 'OPTIONS' }));
  assert.equal(pre.status, 200);
  assert.equal(pre.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal((await handler(new Request('http://localhost/grade-attempt', { method: 'GET' }))).status, 405);
});
