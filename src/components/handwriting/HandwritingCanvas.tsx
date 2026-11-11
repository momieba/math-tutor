import { Eraser, Hand, Pencil, Redo2, Slash, Trash2, Undo2, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  addStroke,
  canRedo,
  canUndo,
  clampZoom,
  clearAll,
  nextZoom,
  PAPER,
  PAPER_SIZE,
  redo,
  undo,
  viewToWorld,
  visibleStrokes,
  WORLD,
  ZOOM_MAX,
  ZOOM_MIN,
  zoomAround,
  type CanvasHistory,
  type DrawTool,
  type Stroke,
  type View,
} from './canvasModel';
import { renderStroke, renderStrokes } from './renderStrokes';

type Tool = DrawTool | 'pan';

const COLORS = [
  { value: '#1e293b', label: 'Schwarz' },
  { value: '#1d4ed8', label: 'Blau' },
  { value: '#b91c1c', label: 'Rot' },
];
const WIDTH: Record<DrawTool, number> = { pen: 3, line: 3, eraser: 28 };
/** Kästchengröße in Papiereinheiten. */
const GRID = 40;
/** Breite und Abstand der Aufgabenkarte auf dem Papier (Papiereinheiten, oben mittig auf der Startseite). */
const CARD = { width: 820, top: 24 };

interface Props {
  history: CanvasHistory;
  onChange: (next: CanvasHistory) => void;
  disabled?: boolean;
  /** Zusätzliche Bedienelemente am Ende der Werkzeugleiste (z. B. Hinweis, Foto, Vollbild). */
  toolbarEnd?: ReactNode;
  /** Wird oben mittig auf das Papier gelegt (Aufgabenstellung) und skaliert mit dem Zoom. Nicht Teil des Exports. */
  overlay?: ReactNode;
  /** Höhe des sichtbaren Ausschnitts (CSS). Standard: Seitenverhältnis einer Seite (3 : 2). */
  height?: string;
}

/**
 * Schreibfläche für Stift, Finger und Maus (Pointer Events) auf einem großen, scrollbaren Kästchenpapier
 * (eine Seite nach links und rechts, drei nach unten, siehe PAPER).
 * - Stift schreibt immer. Sobald ein Stift erkannt wurde, schreiben Finger nicht mehr (Handballen), sondern verschieben.
 * - Ohne Stift schreibt ein Finger; zwei Finger verschieben und zoomen (Pinch). Ein angefangener Strich wird dabei verworfen.
 * - Maus: schreibt; Mausrad scrollt, Strg + Mausrad (bzw. Trackpad-Pinch) zoomt. Werkzeug „Verschieben“: ziehen bewegt das Papier.
 * Technik: Ein unsichtbar großer Scroll-Container liefert Scrollbalken und das Kästchenmuster; darüber liegt eine
 * Zeichenfläche in der Größe des Ausschnitts, die bei jedem Scrollen/Zoomen neu gezeichnet wird (auch auf iPads
 * kein Riesen-Canvas). Die Komponente ist „controlled“: Die Strich-Historie liegt beim Aufrufer.
 */
export function HandwritingCanvas({ history, onChange, disabled = false, toolbarEnd, overlay, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0].value);
  const [zoom, setZoomState] = useState(1);
  /** Breite/Höhe des sichtbaren Ausschnitts ohne Scrollbalken (CSS-Pixel). */
  const [size, setSize] = useState({ width: 0, height: 0 });
  const baseScale = size.width > 0 ? size.width / WORLD.width : 1;
  const scale = baseScale * zoom;

  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null);
  const penSeen = useRef(false);
  /** Aktive Navigationszeiger (Finger bzw. „Verschieben“) mit letzter Position. */
  const navPointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ cx: number; cy: number; dist: number } | null>(null);
  /** Scrollziel nach einem Zoom (wird nach dem Rendern der neuen Papiergröße gesetzt). */
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);
  const initialized = useRef(false);
  const historyRef = useRef(history);
  historyRef.current = history;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const view = useCallback((): View => {
    const s = scrollerRef.current;
    return { scale: scaleRef.current, scrollLeft: s?.scrollLeft ?? 0, scrollTop: s?.scrollTop ?? 0 };
  }, []);

  /** Setzt die Transformation Papier → Zeichenfläche (Zoom, Scrollposition, Pixeldichte). */
  const withContext = useCallback(
    (fn: (ctx: CanvasRenderingContext2D) => void) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || canvas.clientWidth === 0) return;
      const dpr = canvas.width / canvas.clientWidth;
      const v = view();
      const k = dpr * v.scale;
      ctx.setTransform(k, 0, 0, k, -dpr * (v.scrollLeft + PAPER.minX * v.scale), -dpr * (v.scrollTop + PAPER.minY * v.scale));
      fn(ctx);
    },
    [view],
  );

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

  const frame = useRef(0);
  const scheduleRedraw = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => redraw(current.current?.stroke.tool === 'line' ? current.current.stroke : undefined));
  }, [redraw]);

  // Größe des Ausschnitts messen; Zeichenfläche an Größe × Pixeldichte anpassen.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const width = scroller.clientWidth;
      const h = scroller.clientHeight;
      setSize((old) => {
        if (old.width === width && old.height === h) return old;
        // Bei Größenänderung (Drehen, Vollbild) die Position relativ zum Papier beibehalten.
        if (old.width > 0 && width > 0) {
          const ratio = width / old.width;
          pendingScroll.current = { left: scroller.scrollLeft * ratio, top: scroller.scrollTop * ratio };
        }
        return { width, height: h };
      });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(scroller);
    return () => ro?.disconnect();
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const scroller = scrollerRef.current;
    if (!canvas || !scroller || size.width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(size.width * dpr));
    canvas.height = Math.max(1, Math.round(size.height * dpr));
    if (!initialized.current) {
      // Start: die Startseite (x = 0) links bündig, ganz oben.
      initialized.current = true;
      scroller.scrollLeft = -PAPER.minX * scale;
      scroller.scrollTop = 0;
    } else if (pendingScroll.current) {
      scroller.scrollLeft = pendingScroll.current.left;
      scroller.scrollTop = pendingScroll.current.top;
    }
    pendingScroll.current = null;
    redraw();
  }, [size, scale, redraw]);

  useEffect(() => redraw(), [history, redraw]);

  /** Zoomt so, dass der Punkt (px, py) im Ausschnitt an seiner Stelle bleibt. */
  const zoomTo = useCallback(
    (nextZoomValue: number, px = size.width / 2, py = size.height / 2) => {
      const z = clampZoom(nextZoomValue);
      if (Math.abs(z - zoom) < 1e-4) return;
      const next = zoomAround(view(), baseScale * z, px, py);
      pendingScroll.current = { left: next.scrollLeft, top: next.scrollTop };
      setZoomState(z);
    },
    [zoom, baseScale, size, view],
  );
  const zoomRef = useRef(zoomTo);
  zoomRef.current = zoomTo;

  // Mausrad: scrollen; Strg + Mausrad bzw. Trackpad-Pinch: zoomen. Nicht passiv, damit die Seite nicht mitscrollt.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomRef.current(scaleRef.current / baseScaleOf() * Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top);
      else scrollerRef.current?.scrollBy(e.deltaX, e.deltaY);
    };
    const baseScaleOf = () => (scrollerRef.current ? scrollerRef.current.clientWidth / WORLD.width : 1);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  function local(e: { clientX: number; clientY: number }) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function pointFrom(e: { clientX: number; clientY: number; pressure: number; pointerType: string }) {
    const l = local(e);
    const { x, y } = viewToWorld(l.x, l.y, view());
    return { x, y, p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5 };
  }

  function startGesture() {
    const pts = [...navPointers.current.values()];
    if (pts.length < 2) {
      gesture.current = null;
      return;
    }
    const [a, b] = pts;
    gesture.current = { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'pen') penSeen.current = true;
    const drawing = !disabled && tool !== 'pan' && (e.pointerType === 'pen' || e.pointerType === 'mouse' || (e.pointerType === 'touch' && !penSeen.current));
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    if (e.pointerType === 'touch' && current.current && navPointers.current.size === 0) {
      // Zweiter Finger, während der erste schreibt: Das war der Beginn einer Zwei-Finger-Geste – Strich verwerfen.
      const first = current.current;
      current.current = null;
      redraw();
      const r = canvasRef.current!.getBoundingClientRect();
      const last = first.stroke.points[first.stroke.points.length - 1];
      const v = view();
      navPointers.current.set(first.pointerId, { x: (last.x - PAPER.minX) * v.scale - v.scrollLeft + r.left, y: (last.y - PAPER.minY) * v.scale - v.scrollTop + r.top });
    }
    if (drawing && !current.current && navPointers.current.size === 0) {
      const pt = pointFrom(e);
      const stroke: Stroke = { tool: tool as DrawTool, color, width: WIDTH[tool as DrawTool], points: tool === 'line' ? [pt, pt] : [pt] };
      current.current = { pointerId: e.pointerId, stroke };
      if (tool === 'line') redraw(stroke);
      else withContext((c) => renderStroke(c, stroke));
      return;
    }
    navPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const cur = current.current;
    if (cur && cur.pointerId === e.pointerId) {
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
      return;
    }
    const prev = navPointers.current.get(e.pointerId);
    if (!prev) return;
    e.preventDefault();
    navPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const scroller = scrollerRef.current!;
    if (gesture.current && navPointers.current.size >= 2) {
      const g = gesture.current;
      startGesture();
      const next = gesture.current!;
      scroller.scrollBy(g.cx - next.cx, g.cy - next.cy);
      const factor = next.dist / g.dist;
      if (Math.abs(factor - 1) > 0.002) {
        const r = canvasRef.current!.getBoundingClientRect();
        zoomTo(zoom * factor, next.cx - r.left, next.cy - r.top);
      }
    } else {
      scroller.scrollBy(prev.x - e.clientX, prev.y - e.clientY);
    }
  }

  function finish(e: ReactPointerEvent<HTMLCanvasElement>) {
    const cur = current.current;
    if (cur && cur.pointerId === e.pointerId) {
      current.current = null;
      // Auch bei pointercancel übernehmen: Bereits Geschriebenes soll nicht verloren gehen.
      onChange(addStroke(historyRef.current, cur.stroke));
      return;
    }
    navPointers.current.delete(e.pointerId);
    startGesture();
  }

  const iconBtnBase =
    'flex h-11 w-11 items-center justify-center rounded-lg border transition-colors duration-150 active:scale-95 disabled:opacity-40 disabled:active:scale-100';

  /** Werkzeug-Button (umschaltbar). Reines Icon mit aria-label + Tooltip (Briefing C2: nur in der Werkzeugleiste). */
  const toolBtn = (t: Tool, label: string, Icon: LucideIcon) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      aria-pressed={tool === t}
      aria-label={label}
      title={label}
      disabled={disabled && t !== 'pan'}
      className={`${iconBtnBase} ${tool === t ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
    >
      <Icon aria-hidden="true" size={22} />
    </button>
  );
  const actionBtn = (label: string, onClick: () => void, enabled: boolean, Icon: LucideIcon, lockable = true) => (
    <button
      type="button"
      onClick={onClick}
      disabled={(lockable && disabled) || !enabled}
      aria-label={label}
      title={label}
      className={`${iconBtnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
    >
      <Icon aria-hidden="true" size={22} />
    </button>
  );
  const group = 'flex items-center gap-1';
  const divider = <span className="h-8 w-px bg-slate-200" aria-hidden="true" />;
  const gridPx = GRID * scale;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-y border-slate-200 bg-slate-50 px-3 py-2" role="toolbar" aria-label="Werkzeuge der Schreibfläche">
        <div className={group} role="group" aria-label="Werkzeug">
          {toolBtn('pen', 'Stift', Pencil)}
          {toolBtn('line', 'Linie', Slash)}
          {toolBtn('eraser', 'Radierer', Eraser)}
          {toolBtn('pan', 'Verschieben', Hand)}
        </div>
        {divider}
        <div className={group} role="group" aria-label="Farbe">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={`Farbe ${c.label}`}
              title={`Farbe ${c.label}`}
              aria-pressed={color === c.value}
              disabled={disabled}
              className={`h-11 w-11 rounded-full border-4 transition-shadow ${color === c.value ? 'border-white ring-2 ring-indigo-600' : 'border-white ring-1 ring-slate-200'}`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        {divider}
        <div className={group} role="group" aria-label="Bearbeiten">
          {actionBtn('Rückgängig', () => onChange(undo(history)), canUndo(history), Undo2)}
          {actionBtn('Wiederholen', () => onChange(redo(history)), canRedo(history), Redo2)}
          {actionBtn('Alles löschen', () => onChange(clearAll(history)), visibleStrokes(history).length > 0, Trash2)}
        </div>
        {divider}
        <div className={group} role="group" aria-label="Zoom">
          {actionBtn('Verkleinern', () => zoomTo(nextZoom(zoom, -1)), zoom > ZOOM_MIN + 1e-6, ZoomOut, false)}
          {actionBtn('Vergrößern', () => zoomTo(nextZoom(zoom, 1)), zoom < ZOOM_MAX - 1e-6, ZoomIn, false)}
          <span className="min-w-12 text-center text-sm font-medium tabular-nums text-slate-700" aria-live="polite">
            {Math.round(zoom * 100)} %
          </span>
        </div>
        {toolbarEnd && <div className="ml-auto flex items-center gap-2">{toolbarEnd}</div>}
      </div>
      {tool === 'pan' && <p className="px-4 pt-2 text-sm text-slate-600">Verschieben aktiv: Ziehen bewegt das Papier. Zum Schreiben wieder „Stift“ wählen.</p>}
      <div className="relative overflow-hidden rounded-b-2xl bg-white" style={height ? { height } : { aspectRatio: `${WORLD.width} / ${WORLD.height}` }}>
        <div ref={scrollerRef} className="absolute inset-0 overflow-auto overscroll-contain" onScroll={scheduleRedraw}>
          <div
            className="relative"
            style={{
              width: PAPER_SIZE.width * scale,
              height: PAPER_SIZE.height * scale,
              // Kästchenpapier als CSS-Hintergrund: wird nicht exportiert und vom Radierer nicht entfernt.
              backgroundImage: 'linear-gradient(to right, #dbe4f0 1px, transparent 1px), linear-gradient(to bottom, #dbe4f0 1px, transparent 1px)',
              backgroundSize: `${gridPx}px ${gridPx}px`,
            }}
          >
            {/* Seitenränder der Startseite andeuten, damit man weiß, wo „vorne“ ist */}
            <div aria-hidden="true" className="pointer-events-none absolute border-x border-dashed border-slate-300" style={{ left: -PAPER.minX * scale, top: 0, width: WORLD.width * scale, height: PAPER_SIZE.height * scale }} />
            {overlay && (
              <div
                className="absolute"
                style={{ left: (-PAPER.minX + (WORLD.width - CARD.width) / 2) * scale, top: CARD.top * scale, width: CARD.width * scale, fontSize: `${Math.max(16, 18 * scale)}px` }}
              >
                {overlay}
              </div>
            )}
          </div>
        </div>
        <canvas
          ref={canvasRef}
          aria-label="Schreibfläche für deinen Rechenweg"
          role="img"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute left-0 top-0 block select-none"
          style={{
            width: size.width,
            height: size.height,
            touchAction: 'none',
            cursor: tool === 'pan' || disabled ? 'grab' : 'crosshair',
          }}
        />
      </div>
    </div>
  );
}
