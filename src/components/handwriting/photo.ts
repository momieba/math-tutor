import { GRADE_LIMITS } from '../../domain/gradingContract';

/**
 * Foto vom Heft für den Upload aufbereiten: verkleinern, in Graustufen umwandeln und den Kontrast anheben,
 * sodass Papier weiß und Schrift dunkel wird. Das Ergebnis ist ein PNG, weil Speicher und Edge Function nur PNG annehmen;
 * mit weißem Papier bleibt es trotz Foto klein. Ist es noch zu groß, wird stufenweise weiter verkleinert.
 */
export const PHOTO_SIDES = [1600, 1300, 1000, 800];

/** Tonwertkorrektur relativ zur Papierhelligkeit (Median): bis 45 % ⇒ schwarz, ab 90 % ⇒ weiß. */
export function enhanceForPng(data: Uint8ClampedArray): void {
  const lum = new Uint8Array(data.length / 4);
  const histogram = new Array<number>(256).fill(0);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[lum[p]]++;
  }
  let median = 0;
  for (let count = 0; median < 255 && count + histogram[median] < lum.length / 2; median++) count += histogram[median];
  const white = Math.max(median * 0.9, 40);
  const black = Math.min(median * 0.45, white - 20);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const y = lum[p];
    const v = y <= black ? 0 : y >= white ? 255 : Math.round(((y - black) * 255) / (white - black));
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
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
    enhanceForPng(pixels.data);
    ctx.putImageData(pixels, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    if (dataUrlBytes(dataUrl) <= GRADE_LIMITS.imageBytes * 0.95) return dataUrl;
  }
  throw new Error('Das Foto ist zu detailreich. Bitte fotografiere nur den Rechenweg auf hellem Papier.');
}
