import { exportSize, segmentWidth, type Stroke } from './canvasModel';

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
 * Exportiert die sichtbaren Striche verkleinert als PNG-data-URL auf weißem Grund.
 * PNG, weil der Supabase-Upload `image/png` erwartet; Handschrift auf weißem Grund komprimiert gut.
 */
export function exportStrokesAsPng(strokes: Stroke[], maxSide = 1000): string {
  const { width, height, scale } = exportSize(maxSide);
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  const lctx = layer.getContext('2d');
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const octx = out.getContext('2d');
  if (!lctx || !octx) throw new Error('Canvas wird von diesem Browser nicht unterstützt.');
  lctx.setTransform(scale, 0, 0, scale, 0, 0);
  renderStrokes(lctx, strokes);
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, width, height);
  octx.drawImage(layer, 0, 0);
  return out.toDataURL('image/png');
}
