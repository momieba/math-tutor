/**
 * Reines Datenmodell der Schreibfläche (ohne DOM): Striche, Undo/Redo, „Alles löschen“.
 * Koordinaten liegen in einem festen „Papier“-Koordinatensystem (WORLD), unabhängig von Zoom und Bildschirmgröße.
 * Dadurch sind Undo-Logik, Export und Wiederherstellung aus einem Entwurf deterministisch testbar.
 */

export const WORLD = { width: 1200, height: 800 } as const;

export type DrawTool = 'pen' | 'line' | 'eraser';

export interface StrokePoint {
  x: number;
  y: number;
  /** Stiftdruck 0..1 (0,5 = Standard, wenn das Gerät keinen Druck liefert). */
  p: number;
}

export interface Stroke {
  tool: DrawTool;
  color: string;
  width: number;
  points: StrokePoint[];
}

/** „Alles löschen“ ist eine eigene Aktion, damit sie rückgängig gemacht werden kann. */
export type CanvasAction = { type: 'stroke'; stroke: Stroke } | { type: 'clear' };

export interface CanvasHistory {
  done: CanvasAction[];
  undone: CanvasAction[];
}

export const emptyHistory = (): CanvasHistory => ({ done: [], undone: [] });

/** Neue Aktion: verwirft den Redo-Stapel (Standardverhalten von Undo/Redo). */
function push(h: CanvasHistory, action: CanvasAction): CanvasHistory {
  return { done: [...h.done, action], undone: [] };
}

export function addStroke(h: CanvasHistory, stroke: Stroke): CanvasHistory {
  if (stroke.points.length === 0) return h;
  return push(h, { type: 'stroke', stroke });
}

export function clearAll(h: CanvasHistory): CanvasHistory {
  return isBlank(h) ? h : push(h, { type: 'clear' });
}

export function undo(h: CanvasHistory): CanvasHistory {
  if (h.done.length === 0) return h;
  return { done: h.done.slice(0, -1), undone: [...h.undone, h.done[h.done.length - 1]] };
}

export function redo(h: CanvasHistory): CanvasHistory {
  if (h.undone.length === 0) return h;
  return { done: [...h.done, h.undone[h.undone.length - 1]], undone: h.undone.slice(0, -1) };
}

export const canUndo = (h: CanvasHistory) => h.done.length > 0;
export const canRedo = (h: CanvasHistory) => h.undone.length > 0;

/** Sichtbare Striche = alle Striche nach dem letzten „Alles löschen“. */
export function visibleStrokes(h: CanvasHistory): Stroke[] {
  let start = 0;
  h.done.forEach((a, i) => {
    if (a.type === 'clear') start = i + 1;
  });
  return h.done.slice(start).flatMap((a) => (a.type === 'stroke' ? [a.stroke] : []));
}

/** Leer, wenn kein sichtbarer Stift- oder Linienstrich existiert (Radierer allein zählt nicht). */
export function isBlank(h: CanvasHistory): boolean {
  return !visibleStrokes(h).some((s) => s.tool !== 'eraser');
}

/** Stellt eine Historie aus gespeicherten Strichen wieder her (z. B. aus einem Entwurf). */
export function historyFromStrokes(strokes: Stroke[]): CanvasHistory {
  return strokes.reduce(addStroke, emptyHistory());
}

/** Kompakte Speicherform: Koordinaten auf ganze Zahlen, Druck auf 2 Nachkommastellen. */
export function compactStrokes(strokes: Stroke[]): Stroke[] {
  return strokes.map((s) => ({
    ...s,
    points: s.points.map((pt) => ({ x: Math.round(pt.x), y: Math.round(pt.y), p: Math.round(pt.p * 100) / 100 })),
  }));
}

/** Prüft unbekannte Daten (z. B. aus localStorage) auf eine gültige Strichliste. */
export function isStrokeList(value: unknown): value is Stroke[] {
  return (
    Array.isArray(value) &&
    value.every(
      (s) =>
        s &&
        typeof s === 'object' &&
        ['pen', 'line', 'eraser'].includes((s as Stroke).tool) &&
        typeof (s as Stroke).width === 'number' &&
        Array.isArray((s as Stroke).points) &&
        (s as Stroke).points.every((pt) => typeof pt?.x === 'number' && typeof pt?.y === 'number'),
    )
  );
}

/** Strichbreite eines Segments: Stiftdruck verändert die Breite zwischen 50 % und 150 %. */
export function segmentWidth(stroke: Stroke, pt: StrokePoint): number {
  if (stroke.tool !== 'pen') return stroke.width;
  return stroke.width * (0.5 + Math.min(1, Math.max(0, pt.p)));
}

/** Zielgröße für den Export: längste Seite höchstens `maxSide` Pixel, Seitenverhältnis bleibt erhalten. */
export function exportSize(maxSide: number, world: { width: number; height: number } = WORLD): { width: number; height: number; scale: number } {
  const scale = Math.min(1, maxSide / Math.max(world.width, world.height));
  return { width: Math.round(world.width * scale), height: Math.round(world.height * scale), scale };
}

/** Bildschirmkoordinate → Papierkoordinate (berücksichtigt Zoom/Skalierung des Elements). */
export function toWorld(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * WORLD.width,
    y: ((clientY - rect.top) / rect.height) * WORLD.height,
  };
}

export const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

export function nextZoom(current: number, direction: 1 | -1): number {
  const i = ZOOM_LEVELS.findIndex((z) => z >= current);
  const idx = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, (i < 0 ? ZOOM_LEVELS.length - 1 : i) + direction));
  return ZOOM_LEVELS[idx];
}
