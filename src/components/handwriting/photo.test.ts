import { describe, expect, it } from 'vitest';
import { dataUrlBytes, enhanceForPng } from './photo';

const pixels = (...grays: number[]) => new Uint8ClampedArray(grays.flatMap((g) => [g, g, g, 255]));

describe('enhanceForPng', () => {
  it('macht graues Papier weiß und Schrift schwarz (relativ zur Papierhelligkeit)', () => {
    // Schummriges Foto: Papier 150, Schrift 50, ein Zwischenton 110
    const data = pixels(150, 150, 150, 150, 150, 50, 110);
    enhanceForPng(data, 7);
    expect(data[0]).toBe(255); // Papier
    expect(data[5 * 4]).toBe(0); // Schrift
    expect(data[6 * 4]).toBeGreaterThan(0);
    expect(data[6 * 4]).toBeLessThan(255);
  });

  it('wandelt Farbe in Graustufen und setzt volle Deckkraft', () => {
    const data = new Uint8ClampedArray([200, 200, 200, 255, 200, 200, 200, 255, 0, 0, 255, 10]);
    enhanceForPng(data, 3);
    expect(data[8]).toBe(data[9]);
    expect(data[9]).toBe(data[10]);
    expect(data[11]).toBe(255);
  });

  it('Schatten auf einer Bildhälfte: Papier wird überall weiß, Schrift überall schwarz', () => {
    // 256 × 32: links helles Papier (220), rechts im Schatten (100); in beiden Hälften Schriftstriche (Papier × 0,3)
    const width = 256;
    const height = 32;
    const grays: number[] = [];
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const paper = x < width / 2 ? 220 : 100;
        grays.push(x % 16 === 7 ? Math.round(paper * 0.3) : paper);
      }
    const data = pixels(...grays);
    enhanceForPng(data, width, height);
    const at = (x: number, y: number) => data[(y * width + x) * 4];
    expect(at(20, 16)).toBe(255); // Papier hell
    expect(at(230, 16)).toBe(255); // Papier im Schatten – global wäre das grau geblieben
    expect(at(23, 16)).toBe(0); // Schrift hell
    expect(at(231, 16)).toBe(0); // Schrift im Schatten
  });
});

describe('dataUrlBytes', () => {
  it('rechnet base64-Länge in Bytes um', () => {
    expect(dataUrlBytes('data:image/png;base64,' + 'A'.repeat(8))).toBe(6);
  });
});
