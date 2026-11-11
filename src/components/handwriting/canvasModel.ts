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

// ---------------------------------------------------------------- Papier, Ansicht und Zoom

/**
 * Das Papier ist größer als eine Seite (WORLD): eine Seite nach links, eine nach rechts und drei Seiten nach unten.
 * Die Startseite liegt bei (0, 0) – alte Striche (nur eine Seite) bleiben so gültig.
 */
export const PAPER = { minX: -WORLD.width, maxX: 2 * WORLD.width, minY: 0, maxY: 3 * WORLD.height } as const;
export const PAPER_SIZE = { width: PAPER.maxX - PAPER.minX, height: PAPER.maxY - PAPER.minY } as const;

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
/** Stufen für die Zoom-Buttons; mit zwei Fingern ist jeder Wert dazwischen möglich. */
export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2, 3] as const;

export const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

export function nextZoom(current: number, direction: 1 | -1): number {
  if (direction > 0) return ZOOM_LEVELS.find((z) => z > current + 1e-6) ?? ZOOM_MAX;
  return [...ZOOM_LEVELS].reverse().find((z) => z < current - 1e-6) ?? ZOOM_MIN;
}

/** Sichtbarer Ausschnitt: Bildschirmpixel je Papiereinheit und Scrollposition (in Bildschirmpixeln). */
export interface View {
  scale: number;
  scrollLeft: number;
  scrollTop: number;
}

/** Bildschirmpunkt relativ zur linken oberen Ecke der Ansicht → Papierkoordinate. */
export function viewToWorld(px: number, py: number, v: View): { x: number; y: number } {
  return { x: (px + v.scrollLeft) / v.scale + PAPER.minX, y: (py + v.scrollTop) / v.scale + PAPER.minY };
}

/** Scrollposition nach einem Zoom, sodass der Papierpunkt unter (px, py) an derselben Stelle bleibt. */
export function zoomAround(v: View, newScale: number, px: number, py: number): View {
  const w = viewToWorld(px, py, v);
  return { scale: newScale, scrollLeft: (w.x - PAPER.minX) * newScale - px, scrollTop: (w.y - PAPER.minY) * newScale - py };
}

/** Bildschirmkoordinate → Papierkoordinate für ein Element, das genau eine Seite (WORLD) zeigt (Export, Tests). */
export function toWorld(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * WORLD.width,
    y: ((clientY - rect.top) / rect.height) * WORLD.height,
  };
}

/**
 * Bereich, der exportiert wird: alle sichtbaren Stift- und Linienstriche plus Rand, mindestens 600 × 400 Einheiten,
 * auf das Papier begrenzt. Ohne Striche: die Startseite. So wird nicht das ganze (große, meist leere) Papier verschickt.
 */
export function strokeBounds(strokes: Stroke[], margin = 40): { x: number; y: number; width: number; height: number } {
  const pts = strokes.filter((s) => s.tool !== 'eraser').flatMap((s) => s.points);
  if (pts.length === 0) return { x: 0, y: 0, width: WORLD.width, height: WORLD.height };
  let x0 = Math.min(...pts.map((p) => p.x)) - margin;
  let x1 = Math.max(...pts.map((p) => p.x)) + margin;
  let y0 = Math.min(...pts.map((p) => p.y)) - margin;
  let y1 = Math.max(...pts.map((p) => p.y)) + margin;
  const grow = (lo: number, hi: number, min: number): [number, number] => (hi - lo >= min ? [lo, hi] : [(lo + hi - min) / 2, (lo + hi + min) / 2]);
  [x0, x1] = grow(x0, x1, 600);
  [y0, y1] = grow(y0, y1, 400);
  x0 = Math.max(PAPER.minX, x0);
  y0 = Math.max(PAPER.minY, y0);
  x1 = Math.min(PAPER.maxX, x1);
  y1 = Math.min(PAPER.maxY, y1);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}
