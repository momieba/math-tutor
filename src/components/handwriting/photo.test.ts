import { describe, expect, it } from 'vitest';
import { dataUrlBytes, enhanceForPng } from './photo';

const pixels = (...grays: number[]) => new Uint8ClampedArray(grays.flatMap((g) => [g, g, g, 255]));

describe('enhanceForPng', () => {
  it('macht graues Papier weiß und Schrift schwarz (relativ zur Papierhelligkeit)', () => {
    // Schummriges Foto: Papier 150, Schrift 50, ein Zwischenton 110
    const data = pixels(150, 150, 150, 150, 150, 50, 110);
    enhanceForPng(data);
    expect(data[0]).toBe(255); // Papier
    expect(data[5 * 4]).toBe(0); // Schrift
    expect(data[6 * 4]).toBeGreaterThan(0);
    expect(data[6 * 4]).toBeLessThan(255);
  });

  it('wandelt Farbe in Graustufen und setzt volle Deckkraft', () => {
    const data = new Uint8ClampedArray([200, 200, 200, 255, 200, 200, 200, 255, 0, 0, 255, 10]);
    enhanceForPng(data);
    expect(data[8]).toBe(data[9]);
    expect(data[9]).toBe(data[10]);
    expect(data[11]).toBe(255);
  });
});

describe('dataUrlBytes', () => {
  it('rechnet base64-Länge in Bytes um', () => {
    expect(dataUrlBytes('data:image/png;base64,' + 'A'.repeat(8))).toBe(6);
  });
});
