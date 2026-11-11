import { describe, expect, it } from 'vitest';
import {
  addStroke,
  canRedo,
  canUndo,
  clearAll,
  compactStrokes,
  emptyHistory,
  exportSize,
  historyFromStrokes,
  isBlank,
  isStrokeList,
  nextZoom,
  PAPER,
  redo,
  segmentWidth,
  strokeBounds,
  toWorld,
  undo,
  viewToWorld,
  visibleStrokes,
  WORLD,
  zoomAround,
  type Stroke,
} from './canvasModel';

const stroke = (id: number, tool: Stroke['tool'] = 'pen'): Stroke => ({ tool, color: '#000', width: 3, points: [{ x: id, y: id, p: 0.5 }] });

describe('Canvas-Historie (Undo/Redo)', () => {
  it('startet leer ohne Undo/Redo', () => {
    const h = emptyHistory();
    expect(isBlank(h)).toBe(true);
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });

  it('Undo entfernt den letzten Strich, Redo stellt ihn wieder her', () => {
    let h = addStroke(addStroke(emptyHistory(), stroke(1)), stroke(2));
    h = undo(h);
    expect(visibleStrokes(h)).toEqual([stroke(1)]);
    expect(canRedo(h)).toBe(true);
    h = redo(h);
    expect(visibleStrokes(h)).toEqual([stroke(1), stroke(2)]);
    expect(canRedo(h)).toBe(false);
  });

  it('ein neuer Strich verwirft den Redo-Stapel', () => {
    let h = addStroke(addStroke(emptyHistory(), stroke(1)), stroke(2));
    h = addStroke(undo(h), stroke(3));
    expect(canRedo(h)).toBe(false);
    expect(visibleStrokes(h)).toEqual([stroke(1), stroke(3)]);
  });

  it('â€žAlles lÃ¶schenâ€œ ist rÃ¼ckgÃ¤ngig machbar', () => {
    let h = historyFromStrokes([stroke(1), stroke(2)]);
    h = clearAll(h);
    expect(visibleStrokes(h)).toEqual([]);
    expect(isBlank(h)).toBe(true);
    h = undo(h);
    expect(visibleStrokes(h)).toEqual([stroke(1), stroke(2)]);
  });

  it('nach â€žAlles lÃ¶schenâ€œ sind nur neue Striche sichtbar', () => {
    const h = addStroke(clearAll(historyFromStrokes([stroke(1)])), stroke(5));
    expect(visibleStrokes(h)).toEqual([stroke(5)]);
  });

  it('â€žAlles lÃ¶schenâ€œ auf leerer FlÃ¤che erzeugt keinen Undo-Schritt', () => {
    expect(canUndo(clearAll(emptyHistory()))).toBe(false);
  });

  it('Undo/Redo an den RÃ¤ndern Ã¤ndert nichts', () => {
    const h = emptyHistory();
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });

  it('leere Striche werden ignoriert', () => {
    const h = addStroke(emptyHistory(), { ...stroke(1), points: [] });
    expect(canUndo(h)).toBe(false);
  });

  it('nur Radierer-Striche gelten als leer', () => {
    expect(isBlank(historyFromStrokes([stroke(1, 'eraser')]))).toBe(true);
    expect(isBlank(historyFromStrokes([stroke(1, 'line')]))).toBe(false);
  });

  it('ist unverÃ¤nderlich (keine Mutation der Eingabe)', () => {
    const h = historyFromStrokes([stroke(1)]);
    const copy = JSON.parse(JSON.stringify(h));
    undo(h);
    addStroke(h, stroke(2));
    clearAll(h);
    expect(h).toEqual(copy);
  });
});

describe('Canvas-Hilfsfunktionen', () => {
  it('compactStrokes rundet Koordinaten und Druck', () => {
    const [s] = compactStrokes([{ tool: 'pen', color: '#000', width: 3, points: [{ x: 1.4, y: 2.6, p: 0.333 }] }]);
    expect(s.points[0]).toEqual({ x: 1, y: 3, p: 0.33 });
  });

  it('isStrokeList erkennt gÃ¼ltige und ungÃ¼ltige Daten', () => {
    expect(isStrokeList([stroke(1)])).toBe(true);
    expect(isStrokeList([{ tool: 'spray', width: 1, points: [] }])).toBe(false);
    expect(isStrokeList('kaputt')).toBe(false);
    expect(isStrokeList(undefined)).toBe(false);
  });

  it('Stiftdruck verÃ¤ndert nur die Breite des Stifts', () => {
    const pen = stroke(1);
    expect(segmentWidth(pen, { x: 0, y: 0, p: 0 })).toBeCloseTo(1.5);
    expect(segmentWidth(pen, { x: 0, y: 0, p: 1 })).toBeCloseTo(4.5);
    expect(segmentWidth(stroke(1, 'eraser'), { x: 0, y: 0, p: 1 })).toBe(3);
  });

  it('exportSize verkleinert mit gleichem SeitenverhÃ¤ltnis, vergrÃ¶ÃŸert nie', () => {
    expect(exportSize(600)).toEqual({ width: 600, height: 400, scale: 0.5 });
    expect(exportSize(5000).scale).toBe(1);
  });

  it('toWorld rechnet Bildschirm- in Papierkoordinaten um (zoomunabhÃ¤ngig)', () => {
    const rect = { left: 10, top: 20, width: WORLD.width * 2, height: WORLD.height * 2 };
    expect(toWorld(10 + WORLD.width, 20 + WORLD.height, rect)).toEqual({ x: WORLD.width / 2, y: WORLD.height / 2 });
  });

  it('nextZoom springt zur nÃ¤chsten Stufe, auch von Zwischenwerten (Pinch), und bleibt in den Grenzen', () => {
    expect(nextZoom(1, 1)).toBe(1.5);
    expect(nextZoom(1, -1)).toBe(0.75);
    expect(nextZoom(3, 1)).toBe(3);
    expect(nextZoom(0.5, -1)).toBe(0.5);
    expect(nextZoom(1.2, 1)).toBe(1.5);
    expect(nextZoom(1.2, -1)).toBe(1);
  });

  it('viewToWorld und zoomAround: der Punkt unter dem Finger bleibt beim Zoomen stehen', () => {
    const v = { scale: 0.8, scrollLeft: 960, scrollTop: 100 };
    const before = viewToWorld(200, 150, v);
    expect(viewToWorld(0, 0, { scale: 1, scrollLeft: -PAPER.minX, scrollTop: 0 })).toEqual({ x: 0, y: 0 }); // Startseite links oben
    const zoomed = zoomAround(v, 1.6, 200, 150);
    const after = viewToWorld(200, 150, zoomed);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('strokeBounds: exportiert nur den beschriebenen Bereich (mit Rand, MindestgrÃ¶ÃŸe, auf dem Papier)', () => {
    expect(strokeBounds([])).toEqual({ x: 0, y: 0, width: WORLD.width, height: WORLD.height });
    const far = { tool: 'pen' as const, color: '#000', width: 3, points: [{ x: 100, y: 1500, p: 0.5 }, { x: 1300, y: 1700, p: 0.5 }] };
    expect(strokeBounds([far])).toEqual({ x: 60, y: 1400, width: 1280, height: 400 });
    const edge = { ...far, points: [{ x: PAPER.minX + 5, y: 5, p: 0.5 }] };
    const b = strokeBounds([edge]);
    expect(b.x).toBe(PAPER.minX);
    expect(b.y).toBe(0);
    expect(strokeBounds([{ ...far, tool: 'eraser' }])).toEqual(strokeBounds([])); // Radierer allein zÃ¤hlt nicht
  });
});
