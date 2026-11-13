import { AXES_UNIT, axesLayout, exportSize, segmentWidth, strokeBounds, type PaperAxes, type Stroke } from './canvasModel';

/**
 * Zeichnet Striche in Papierkoordinaten. Der Aufrufer setzt vorher die Transformation (Zoom, Pixeldichte).
 * Der Radierer arbeitet mit `destination-out` und entfernt nur Striche, nicht den (per CSS gezeichneten) Karo-Hintergrund.
 */
export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]): void {
  for (const s of strokes) renderStroke(ctx, s);
  ctx.globalCompositeOperation = 'source-over';
}

export function renderStroke(ctx: CanvasRenderingContext2D, s: Stroke): void {
  ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = s.tool === 'eraser' ? '#000' : s.color;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = s.points;
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, segmentWidth(s, pts[0]) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  for (let i = 1; i < pts.length; i++) {
    ctx.beginPath();
    ctx.lineWidth = segmentWidth(s, pts[i]);
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
}

/**
 * Zeichnet ein vorgegebenes Koordinatensystem (Kästchen, Achsen mit Pfeil, Beschriftung je Einheit) in Papierkoordinaten.
 * Für den Export, damit die KI die Zeichnung im Koordinatensystem beurteilen kann; auf dem Bildschirm zeigt es ein SVG.
 */
export function renderAxes(ctx: CanvasRenderingContext2D, axes: PaperAxes): void {
  const { originX: ox, originY: oy } = axesLayout(axes);
  const u = AXES_UNIT;
  const X = (v: number) => ox + v * u;
  const Y = (v: number) => oy - v * u;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#cbd5e1';
  for (let v = axes.x[0]; v <= axes.x[1]; v++) {
    ctx.beginPath();
    ctx.moveTo(X(v), Y(axes.y[0]));
    ctx.lineTo(X(v), Y(axes.y[1]));
    ctx.stroke();
  }
  for (let v = axes.y[0]; v <= axes.y[1]; v++) {
    ctx.beginPath();
    ctx.moveTo(X(axes.x[0]), Y(v));
    ctx.lineTo(X(axes.x[1]), Y(v));
    ctx.stroke();
  }
  ctx.strokeStyle = '#334155';
  ctx.fillStyle = '#334155';
  ctx.lineWidth = 2;
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(a - 0.4), y2 - 12 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 12 * Math.cos(a + 0.4), y2 - 12 * Math.sin(a + 0.4));
    ctx.closePath();
    ctx.fill();
  };
  arrow(X(axes.x[0]), oy, X(axes.x[1]) + 14, oy);
  arrow(ox, Y(axes.y[0]), ox, Y(axes.y[1]) - 14);
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'center';
  for (let v = axes.x[0]; v <= axes.x[1]; v++) if (v !== 0) ctx.fillText(String(v), X(v), oy + 20);
  ctx.textAlign = 'right';
  for (let v = axes.y[0]; v <= axes.y[1]; v++) if (v !== 0) ctx.fillText(String(v), ox - 7, Y(v) + 5);
  ctx.font = 'italic 17px serif';
  ctx.fillText('x', X(axes.x[1]) + 14, oy - 10);
  ctx.textAlign = 'left';
  ctx.fillText('y', ox + 10, Y(axes.y[1]) - 4);
  ctx.restore();
}

/**
 * Exportiert den beschriebenen Bereich des Papiers (strokeBounds) verkleinert als PNG-data-URL auf weißem Grund,
 * bei Zeichenaufgaben samt vorgegebenem Koordinatensystem.
 * PNG, weil der Supabase-Upload `image/png` erwartet; Handschrift auf weißem Grund komprimiert gut.
 */
export function exportStrokesAsPng(strokes: Stroke[], maxSide = 1600, axes?: PaperAxes): string {
  const area = strokeBounds(strokes, 40, axes ? axesLayout(axes).rect : undefined);
  const { width, height, scale } = exportSize(maxSide, area);
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  const lctx = layer.getContext('2d');
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const octx = out.getContext('2d');
  if (!lctx || !octx) throw new Error('Canvas wird von diesem Browser nicht unterstützt.');
  lctx.setTransform(scale, 0, 0, scale, -area.x * scale, -area.y * scale);
  renderStrokes(lctx, strokes);
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, width, height);
  if (axes) {
    octx.setTransform(scale, 0, 0, scale, -area.x * scale, -area.y * scale);
    renderAxes(octx, axes);
    octx.setTransform(1, 0, 0, 1, 0, 0);
  }
  octx.drawImage(layer, 0, 0);
  return out.toDataURL('image/png');
}
