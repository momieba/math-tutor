// deno test supabase/functions   (npm run test:functions)
import assert from 'node:assert/strict';
import { createDeleteAccountHandler, type DeleteAccountDeps } from './handler.ts';

const USER = '11111111-1111-4111-8111-111111111111';

function setup(images: string[], over: Partial<DeleteAccountDeps> = {}) {
  const log: string[] = [];
  const handler = createDeleteAccountHandler({
    resolveUser: async (token) => (token === 'gueltig' ? USER : null),
    listImages: async (uid) => images.map((n) => `${uid}/${n}`),
    removeImages: async (paths) => void log.push(`remove:${paths.length}`),
    deleteUser: async (uid) => void log.push(`delete:${uid}`),
    ...over,
  });
  return { handler, log };
}

const post = (token = 'gueltig') => new Request('http://localhost/delete-account', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

Deno.test('löscht erst alle Bilder (in Paketen), dann den Nutzer', async () => {
  const { handler, log } = setup(Array.from({ length: 250 }, (_, i) => `${i}.png`));
  const res = await handler(post());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { deleted: true, images: 250 });
  assert.deepEqual(log, ['remove:100', 'remove:100', 'remove:50', `delete:${USER}`]);
});

Deno.test('ohne Bilder: nur Nutzer löschen', async () => {
  const { handler, log } = setup([]);
  assert.equal((await handler(post())).status, 200);
  assert.deepEqual(log, [`delete:${USER}`]);
});

Deno.test('ohne gültige Anmeldung wird nichts gelöscht', async () => {
  const { handler, log } = setup(['a.png']);
  assert.equal((await handler(post('falsch'))).status, 401);
  assert.deepEqual(log, []);
});

Deno.test('Fehler beim Entfernen der Bilder: Nutzer bleibt bestehen', async () => {
  const { handler, log } = setup(['a.png'], {
    removeImages: async () => {
      throw new Error('storage down');
    },
  });
  const orig = console.error;
  console.error = () => {};
  try {
    assert.equal((await handler(post())).status, 500);
  } finally {
    console.error = orig;
  }
  assert.deepEqual(log, []);
});
