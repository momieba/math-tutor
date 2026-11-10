import { GRADE_LIMITS } from '../../domain/gradingContract';

/**
 * Foto vom Heft für den Upload aufbereiten: verkleinern, in Graustufen umwandeln und den Kontrast örtlich anheben,
 * sodass Papier weiß und Schrift dunkel wird. Das Ergebnis ist ein PNG, weil Speicher und Edge Function nur PNG annehmen;
 * mit weißem Papier bleibt es trotz Foto klein. Ist es noch zu groß, wird stufenweise weiter verkleinert.
 */
export const PHOTO_SIDES = [1600, 1300, 1000, 800];

export const ENHANCE_CONFIG = {
  /** Kacheln je längerer Bildseite, in denen die Papierhelligkeit getrennt geschätzt wird (Schatten, schräges Licht). */
  tilesPerSide: 16,
  /** Papierhelligkeit einer Kachel = dieses Perzentil (Papier ist heller als Schrift und überwiegt fast immer). */
  paperPercentile: 0.9,
  /** Relativ zur örtlichen Papierhelligkeit: bis hier ⇒ schwarz, ab hier ⇒ weiß. */
  blackAt: 0.45,
  whiteAt: 0.88,
};

/**
 * Tonwertkorrektur relativ zur örtlichen Papierhelligkeit: Das Bild wird in Kacheln geteilt, je Kachel wird die
 * Papierhelligkeit geschätzt und zwischen den Kachelmitten bilinear interpoliert. So wird Papier auch im Schatten
 * oder bei schrägem Licht weiß, ohne dass Schrift in hellen Bereichen ausbleicht.
 */
export function enhanceForPng(data: Uint8ClampedArray, width: number, height = data.length / 4 / width): void {
  const { tilesPerSide, paperPercentile, blackAt, whiteAt } = ENHANCE_CONFIG;
  const lum = new Uint8Array(width * height);
  for (let i = 0, p = 0; p < lum.length; i += 4, p++) lum[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);

  const tile = Math.max(8, Math.ceil(Math.max(width, height) / tilesPerSide));
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);
  const paper = new Float32Array(cols * rows);
  const histogram = new Uint32Array(256);
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      histogram.fill(0);
      const x1 = Math.min(width, (tx + 1) * tile);
      const y1 = Math.min(height, (ty + 1) * tile);
      for (let y = ty * tile; y < y1; y++) for (let x = tx * tile; x < x1; x++) histogram[lum[y * width + x]]++;
      const target = (x1 - tx * tile) * (y1 - ty * tile) * paperPercentile;
      let v = 0;
      for (let count = histogram[0]; v < 255 && count < target; ) count += histogram[++v];
      paper[ty * cols + tx] = Math.max(v, 40);
    }
  }

  for (let y = 0; y < height; y++) {
    // Position zwischen den Kachelmitten (am Rand konstant fortgesetzt)
    const gy = Math.min(Math.max((y + 0.5) / tile - 0.5, 0), rows - 1);
    const r0 = Math.floor(gy);
    const r1 = Math.min(r0 + 1, rows - 1);
    const fy = gy - r0;
    for (let x = 0; x < width; x++) {
      const gx = Math.min(Math.max((x + 0.5) / tile - 0.5, 0), cols - 1);
      const c0 = Math.floor(gx);
      const c1 = Math.min(c0 + 1, cols - 1);
      const fx = gx - c0;
      const top = paper[r0 * cols + c0] * (1 - fx) + paper[r0 * cols + c1] * fx;
      const bottom = paper[r1 * cols + c0] * (1 - fx) + paper[r1 * cols + c1] * fx;
      const local = top * (1 - fy) + bottom * fy;
      const white = local * whiteAt;
      const black = Math.min(local * blackAt, white - 20);
      const p = y * width + x;
      const l = lum[p];
      const out = l <= black ? 0 : l >= white ? 255 : Math.round(((l - black) * 255) / (white - black));
      const i = p * 4;
      data[i] = data[i + 1] = data[i + 2] = out;
      data[i + 3] = 255;
    }
  }
}

/** Bytes, die eine base64-data-URL dekodiert belegt. */
export const dataUrlBytes = (dataUrl: string) => Math.floor(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Das Foto konnte nicht geöffnet werden. Bitte nimm ein JPG- oder PNG-Bild.'));
    };
    img.src = url; // Browser drehen das Bild dabei laut EXIF richtig herum
  });
}

/** Liefert eine PNG-data-URL, die unter das Upload-Limit passt. */
export async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Bitte wähle ein Foto aus.');
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas wird von diesem Browser nicht unterstützt.');
  for (const side of PHOTO_SIDES) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    enhanceForPng(pixels.data, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    if (dataUrlBytes(dataUrl) <= GRADE_LIMITS.imageBytes * 0.95) return dataUrl;
  }
  throw new Error('Das Foto ist zu detailreich. Bitte fotografiere nur den Rechenweg auf hellem Papier.');
}
