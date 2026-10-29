import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  addStroke,
  canRedo,
  canUndo,
  clearAll,
  nextZoom,
  redo,
  toWorld,
  undo,
  visibleStrokes,
  WORLD,
  ZOOM_LEVELS,
  type CanvasHistory,
  type DrawTool,
  type Stroke,
} from './canvasModel';
import { renderStroke, renderStrokes } from './renderStrokes';

type Tool = DrawTool | 'pan';

const COLORS = [
  { value: '#1e293b', label: 'Schwarz' },
  { value: '#1d4ed8', label: 'Blau' },
  { value: '#b91c1c', label: 'Rot' },
];
const WIDTH: Record<DrawTool, number> = { pen: 3, line: 3, eraser: 28 };

interface Props {
  history: CanvasHistory;
  onChange: (next: CanvasHistory) => void;
  disabled?: boolean;
}

/**
 * Schreibfläche für Stift, Finger und Maus (Pointer Events).
 * - `touch-action: none` beim Zeichnen: Die Seite scrollt nicht mit.
 * - Handballen-Erkennung: Sobald ein Stift erkannt wurde, werden Fingerberührungen auf der Fläche ignoriert.
 * - Zoom vergrößert die Darstellung; mit „Verschieben“ lässt sich die vergrößerte Fläche per Finger bewegen.
 * Die Komponente ist „controlled“: Die Strich-Historie liegt beim Aufrufer (Abgabe, Entwurf, Export).
 */
export function HandwritingCanvas({ history, onChange, disabled = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0].value);
  const [zoom, setZoom] = useState<number>(1);
  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null);
  const penSeen = useRef(false);
  const historyRef = useRef(history);
  historyRef.current = history;

  const withContext = useCallback((fn: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
    fn(ctx);
  }, []);

  const redraw = useCallback(
    (preview?: Stroke) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      withContext((c) => {
        renderStrokes(c, visibleStrokes(historyRef.current));
        if (preview) renderStroke(c, preview);
        c.globalCompositeOperation = 'source-over';
      });
    },
    [withContext],
  );

  // Bitmap-Auflösung an angezeigte Größe × Pixeldichte anpassen (scharf bei jedem Zoom).
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      redraw();
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    return () => ro?.disconnect();
  }, [zoom, redraw]);

  useEffect(() => redraw(), [history, redraw]);

  function pointFrom(e: { clientX: number; clientY: number; pressure: number; pointerType: string }) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x, y } = toWorld(e.clientX, e.clientY, rect);
    return { x, y, p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5 };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (disabled || tool === 'pan' || current.current) return;
    if (e.pointerType === 'pen') penSeen.current = true;
    if (e.pointerType === 'touch' && penSeen.current) return; // Handballen ignorieren
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = pointFrom(e);
    const stroke: Stroke = { tool, color, width: WIDTH[tool], points: tool === 'line' ? [pt, pt] : [pt] };
    current.current = { pointerId: e.pointerId, stroke };
    if (tool === 'line') redraw(stroke);
    else withContext((c) => renderStroke(c, stroke));
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const cur = current.current;
    if (!cur || cur.pointerId !== e.pointerId) return;
    e.preventDefault();
    const s = cur.stroke;
    if (s.tool === 'line') {
      s.points = [s.points[0], pointFrom(e)];
      redraw(s);
      return;
    }
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const pts = (events.length ? events : [e.nativeEvent]).map(pointFrom);
    const from = s.points.length - 1;
    s.points.push(...pts);
    // Inkrementell nur die neuen Segmente zeichnen (flüssig auch bei vielen Strichen).
    withContext((c) => renderStroke(c, { ...s, points: s.points.slice(from) }));
  }

  function finish(e: ReactPointerEvent<HTMLCanvasElement>) {
    const cur = current.current;
    if (!cur || cur.pointerId !== e.pointerId) return;
    current.current = null;
    // Auch bei pointercancel übernehmen: Bereits Geschriebenes soll nicht verloren gehen.
    onChange(addStroke(historyRef.current, cur.stroke));
  }

  const toolBtn = (t: Tool, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      aria-pressed={tool === t}
      disabled={disabled}
      className={`min-w-11 px-3 rounded-lg border text-sm font-medium ${tool === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300 text-slate-700'}`}
    >
      <span aria-hidden="true">{icon}</span> {label}
    </button>
  );
  const actionBtn = (label: string, onClick: () => void, enabled: boolean, icon: string) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !enabled}
      aria-label={label}
      title={label}
      className="min-w-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only sm:not-sr-only sm:ml-1 text-sm">{label}</span>
    </button>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 space-y-2">
      <div className="flex flex-wrap gap-2 items-center" role="toolbar" aria-label="Werkzeuge der Schreibfläche">
        {toolBtn('pen', 'Stift', '✏️')}
        {toolBtn('line', 'Linie', '📏')}
        {toolBtn('eraser', 'Radierer', '🧽')}
        {toolBtn('pan', 'Verschieben', '✋')}
        <div className="flex gap-1" role="group" aria-label="Farbe">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={`Farbe ${c.label}`}
              aria-pressed={color === c.value}
              disabled={disabled}
              className={`w-11 rounded-full border-4 ${color === c.value ? 'border-indigo-400' : 'border-white'}`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <span className="mx-1 h-8 w-px bg-slate-300" aria-hidden="true" />
        {actionBtn('Rückgängig', () => onChange(undo(history)), canUndo(history), '↶')}
        {actionBtn('Wiederholen', () => onChange(redo(history)), canRedo(history), '↷')}
        {actionBtn('Alles löschen', () => onChange(clearAll(history)), visibleStrokes(history).length > 0, '🗑')}
        <span className="mx-1 h-8 w-px bg-slate-300" aria-hidden="true" />
        {actionBtn('Verkleinern', () => setZoom((z) => nextZoom(z, -1)), zoom > ZOOM_LEVELS[0], '−')}
        <span className="text-sm text-slate-600 w-12 text-center" aria-live="polite">
          {Math.round(zoom * 100)} %
        </span>
        {actionBtn('Vergrößern', () => setZoom((z) => nextZoom(z, 1)), zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1], '+')}
      </div>
      <div className="overflow-auto max-h-[70vh] rounded-xl border border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          aria-label="Schreibfläche für deinen Rechenweg"
          role="img"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onContextMenu={(e) => e.preventDefault()}
          className="block select-none"
          style={{
            width: `${zoom * 100}%`,
            aspectRatio: `${WORLD.width} / ${WORLD.height}`,
            touchAction: tool === 'pan' ? 'pan-x pan-y' : 'none',
            cursor: disabled ? 'not-allowed' : tool === 'pan' ? 'grab' : 'crosshair',
            // Karopapier als CSS-Hintergrund: wird nicht exportiert und vom Radierer nicht entfernt.
            backgroundImage:
              'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: `${(100 / WORLD.width) * 40}% ${(100 / WORLD.height) * 40}%`,
          }}
        />
      </div>
      {tool === 'pan' && <p className="text-xs text-slate-500 px-1">Verschieben aktiv: Mit dem Finger wischen bewegt die Fläche. Zum Schreiben wieder „Stift“ wählen.</p>}
    </div>
  );
}
