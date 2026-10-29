// Referenz ist das echte WebCrypto der Laufzeit (Node 22 / Browser). Keine node:-Imports, da die App-tsconfig keine Node-Typen kennt.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newUuid, sha256, sha256Hex, type CryptoLike } from './cryptoFallback';
import { createLocalAuthService, hashPassword } from './localAuthService';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const webcrypto = globalThis.crypto;
const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const referenceSha256 = async (data: Uint8Array<ArrayBuffer> | string) =>
  hex(new Uint8Array(await webcrypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data)));
/** Wie Safari/Chrome ohne Secure Context: nur getRandomValues, kein randomUUID, kein subtle. */
const insecureCrypto: CryptoLike = { getRandomValues: (a) => webcrypto.getRandomValues(a as Uint8Array<ArrayBuffer>) as unknown as typeof a };

describe('newUuid (Fallback ohne randomUUID)', () => {
  it('erzeugt gültige, eindeutige UUID v4 über getRandomValues', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newUuid(insecureCrypto)));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });

  it('setzt Version- und Varianten-Bits auch bei Extremwerten', () => {
    const allOnes: CryptoLike = { getRandomValues: (a) => ((a as Uint8Array).fill(0xff), a) };
    const allZeros: CryptoLike = { getRandomValues: (a) => ((a as Uint8Array).fill(0), a) };
    expect(newUuid(allOnes)).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
    expect(newUuid(allZeros)).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('nutzt randomUUID, wenn vorhanden', () => {
    expect(newUuid({ randomUUID: () => 'nativ' })).toBe('nativ');
  });

  it('ohne jeden Zufallsgenerator: verständliche Fehlermeldung statt TypeError', () => {
    expect(() => newUuid({})).toThrow(/sicheren Zufallsgenerator/);
  });
});

describe('sha256 (reines JS)', () => {
  it('liefert die Testvektoren aus FIPS 180-4', () => {
    const enc = (s: string) => new TextEncoder().encode(s);
    expect(hex(sha256(enc('')))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hex(sha256(enc('abc')))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hex(sha256(enc('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')))).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });

  it('stimmt für Längen 0–300 Byte (Blockgrenzen 55/56/64) mit WebCrypto überein', async () => {
    for (let len = 0; len <= 300; len++) {
      const data = Uint8Array.from({ length: len }, (_, i) => (i * 31 + len) & 0xff);
      expect(hex(sha256(data)), `Länge ${len}`).toBe(await referenceSha256(data));
    }
  });
});

describe('sha256Hex: Gleichstand Fallback ↔ WebCrypto', () => {
  const samples = ['', 'salt:Geheim123!', 'b3c1…:Pässwört mit Ümläüten 🔒', 'x'.repeat(1000)];
  it.each(samples)('gleicher Hash für %j', async (s) => {
    const viaWebCrypto = await sha256Hex(s, webcrypto as unknown as CryptoLike);
    const viaFallback = await sha256Hex(s, insecureCrypto);
    expect(viaFallback).toBe(viaWebCrypto);
  });
});

describe('localAuthService ohne Secure Context (BUG-08)', () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('Registrierung und Anmeldung funktionieren mit crypto ohne randomUUID/subtle', async () => {
    vi.stubGlobal('crypto', insecureCrypto);
    const auth = createLocalAuthService();
    const s = await auth.signUpWithEmail('lan@example.test', 'Geheim123!', 'LAN');
    expect(s?.user.id).toMatch(UUID_V4);
    await auth.signOut();
    await expect(auth.signInWithEmail('lan@example.test', 'Geheim123!')).resolves.toMatchObject({ user: { email: 'lan@example.test' } });
    await expect(auth.signInWithEmail('lan@example.test', 'falsch123')).rejects.toThrow('E-Mail oder Passwort ist falsch.');
  });

  it('ein mit WebCrypto angelegtes Konto bleibt im Fallback anmeldbar (gleicher Hash)', async () => {
    vi.stubGlobal('crypto', webcrypto);
    const auth = createLocalAuthService();
    await auth.signUpWithEmail('alt@example.test', 'Geheim123!', 'Alt');
    await auth.signOut();
    vi.stubGlobal('crypto', insecureCrypto);
    await expect(createLocalAuthService().signInWithEmail('alt@example.test', 'Geheim123!')).resolves.toBeTruthy();
  });

  it('hashPassword entspricht SHA-256 über „salt:passwort“', async () => {
    vi.stubGlobal('crypto', insecureCrypto);
    expect(await hashPassword('s', 'p')).toBe(await referenceSha256('s:p'));
  });
});
