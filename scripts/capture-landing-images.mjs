// Erzeugt die Bilder der Landingpage aus echten App-Screenshots (lokaler Modus, Demo-Nutzer).
// Aufruf: npm run images:landing
//
// Warum Screenshots statt Stockfotos: Pexels/Pixabay/Unsplash ließen keinen automatisierten Download zu
// (Bot-Schutz bzw. Login). Echte Screenshots zeigen ehrlich das Produkt (Briefing C3) und haben keine Lizenzfragen.
//
// Ablauf: vite build (ohne Supabase-Env) → vite preview → Playwright/Chromium spielt einen Demo-Ablauf durch →
// Screenshots (DPR 2) → Verkleinern + WebP-Kodierung per <canvas> im selben Browser (keine zusätzliche Abhängigkeit)
// → public/images/landing/<name>-<breite>.webp. Größenlimits nach C3: Hero ≤ 200 kB, alle anderen ≤ 120 kB.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { build, preview } from 'vite';

const OUT = new URL('../public/images/landing/', import.meta.url);
const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const LANDSCAPE = { width: 1194, height: 834 };
const PORTRAIT = { width: 834, height: 1194 };
const KB = 1024;

// Lokaler Modus erzwingen: bereits gesetzte Variablen haben Vorrang vor .env-Dateien.
process.env.VITE_SUPABASE_URL = '';
process.env.VITE_SUPABASE_ANON_KEY = '';
process.env.VITE_DATA_MODE = 'local';

// ---------------------------------------------------------------- Handschrift (Demo-Striche)
// Einfache Polylinien je Zeichen im Einheitsquadrat (x nach rechts, y nach unten).
const circle = (cx, cy, r, from = 0, to = 360, n = 20) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const GLYPHS = {
  1: [[[0.25, 0.22], [0.55, 0], [0.55, 1]]],
  2: [[[0.15, 0.25], [0.4, 0.02], [0.72, 0.08], [0.78, 0.35], [0.15, 1], [0.88, 1]]],
  4: [[[0.65, 1], [0.65, 0], [0.08, 0.68], [0.92, 0.68]]],
  5: [[[0.82, 0.02], [0.22, 0.02], [0.17, 0.45], [0.5, 0.38], [0.78, 0.55], [0.8, 0.8], [0.55, 0.98], [0.18, 0.9]]],
  6: [[[0.75, 0.05], [0.4, 0.2], [0.18, 0.6], [0.3, 0.95], [0.65, 0.95], [0.8, 0.72], [0.6, 0.5], [0.3, 0.55], [0.18, 0.7]]],
  7: [[[0.12, 0.02], [0.88, 0.02], [0.4, 1]]],
  8: [circle(0.5, 0.25, 0.22, -90, 270), circle(0.5, 0.72, 0.27, -90, 270)],
  9: [circle(0.48, 0.3, 0.26, 0, 360), [[0.74, 0.3], [0.68, 1]]],
  c: [circle(0.52, 0.66, 0.32, -40, -320, 18)],
  '=': [[[0.1, 0.45], [0.9, 0.45]], [[0.1, 0.7], [0.9, 0.7]]],
  '+': [[[0.5, 0.3], [0.5, 0.9]], [[0.18, 0.6], [0.82, 0.6]]],
};

/** Deterministisches leichtes Zittern, damit es nach Handschrift aussieht. */
let seed = 7;
const jitter = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647 - 0.5) * 0.04;
};

async function stroke(page, pts) {
  await page.mouse.move(pts[0][0], pts[0][1]);
  await page.mouse.down();
  for (const [x, y] of pts.slice(1)) await page.mouse.move(x, y, { steps: 4 });
  await page.mouse.up();
}

/** Schreibt Text (Zeichen aus GLYPHS, `^` = nächstes Zeichen hochgestellt, ` ` = Abstand) ab Punkt x,y mit Höhe h. */
async function write(page, text, x, y, h) {
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    let size = h;
    let dy = 0;
    if (ch === '^') {
      ch = text[++i];
      size = h * 0.5;
      dy = -h * 0.15;
    }
    if (ch === ' ') {
      cx += h * 0.35;
      continue;
    }
    for (const poly of GLYPHS[ch]) {
      await stroke(page, poly.map(([u, v]) => [cx + (u + jitter()) * size * 0.62, y + dy + (v + jitter()) * size]));
    }
    cx += size * 0.62 + h * 0.12;
  }
}

async function handwriteSolution(page) {
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const h = Math.min(box.height * 0.1, 42);
  const left = box.x + box.width * 0.06;
  const lines = ['c^2 = 8^2 + 15^2', 'c^2 = 64 + 225', 'c^2 = 289', 'c = 17'];
  for (const [i, line] of lines.entries()) await write(page, line, left, box.y + box.height * 0.1 + i * h * 1.8, h);
  // Skizze: rechtwinkliges Dreieck rechts oben
  const tx = box.x + box.width * 0.68;
  const ty = box.y + box.height * 0.12;
  const s = Math.min(box.width * 0.22, box.height * 0.35);
  await page.getByRole('button', { name: 'Farbe Blau' }).click();
  await stroke(page, [[tx, ty], [tx, ty + s], [tx + s * 1.4, ty + s], [tx, ty]]);
  await stroke(page, [[tx, ty + s - 14], [tx + 14, ty + s - 14], [tx + 14, ty + s]]);
}

// ---------------------------------------------------------------- Ablauf
async function register(page) {
  await page.goto(`${BASE}/register`);
  await page.getByLabel('Name').fill('Mia');
  await page.getByLabel('E-Mail').fill(`mia.${Date.now()}@example.test`);
  await page.getByLabel('Passwort').fill('Demo-Passwort-123');
  await page.getByRole('checkbox', { name: /Datenschutzerklärung/ }).check();
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await page.waitForURL(/\/app$/);
}

async function addTopic(page, query, title) {
  await page.goto(`${BASE}/app`);
  await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill(query);
  await page.getByRole('button', { name: 'Thema finden' }).click();
  await page.locator('li').filter({ hasText: title }).first().getByRole('button', { name: 'Thema hinzufügen' }).click();
}

async function solve(page, id, answer) {
  await page.goto(`${BASE}/app/exercises/${id}`);
  if (answer.choice) await page.getByRole('radio').filter({ hasText: answer.choice }).click();
  else await page.locator('input[id^="answer-"]').fill(answer.text);
  await page.getByRole('button', { name: 'Abgeben' }).click();
  await page.getByRole('heading', { name: 'Musterlösung' }).waitFor();
}

/** Lokaler-Modus-Badge und Toasts ausblenden (gehören nicht ins Produktbild); Animationen aus. */
const CLEAN_CSS =
  '[title="Daten bleiben nur in diesem Browser"],div[aria-live="polite"].fixed{display:none!important} ' +
  '*{animation:none!important;transition:none!important;caret-color:transparent!important}';
async function shot(page) {
  await page.addStyleTag({ content: CLEAN_CSS });
  await page.waitForTimeout(300);
  return (await page.screenshot()).toString('base64');
}

async function encode(page, name, b64, widths, limitKb) {
  for (let q = 0.85; q >= 0.4; q -= 0.05) {
    const out = await page.evaluate(
      async ({ b64, widths, q }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        return widths.map((w) => {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = Math.round((img.height * w) / img.width);
          const ctx = c.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, c.width, c.height);
          return c.toDataURL('image/webp', q).split(',')[1];
        });
      },
      { b64, widths, q },
    );
    const bufs = out.map((s) => Buffer.from(s, 'base64'));
    if (bufs.every((b) => b.length <= limitKb * KB)) {
      bufs.forEach((b, i) => writeFileSync(new URL(`${name}-${widths[i]}.webp`, OUT), b));
      console.log(`${name}: q=${q.toFixed(2)} ${widths.map((w, i) => `${w}px ${(bufs[i].length / KB).toFixed(0)} kB`).join(', ')}`);
      return;
    }
  }
  throw new Error(`${name}: Größenlimit ${limitKb} kB nicht erreichbar`);
}

mkdirSync(OUT, { recursive: true });
await build({ logLevel: 'warn' });
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'warn' });
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: LANDSCAPE, deviceScaleFactor: 2, locale: 'de-DE' });
  const page = await ctx.newPage();
  await register(page);
  await addTopic(page, 'Satz des Pythagoras', 'Satz des Pythagoras');
  await addTopic(page, 'Prozentrechnung', 'Prozentrechnung');
  await solve(page, 'pyth-grundlagen-1', { choice: 'Die Seite gegenüber dem rechten Winkel' });
  await solve(page, 'pyth-hypotenuse-1', { text: '15' });
  await solve(page, 'pyth-hypotenuse-3', { text: '8,1' });
  // Feedback mit Musterlösung (die Seite zeigt das Ergebnis der letzten Abgabe)
  await page.locator('section[role="status"]').first().scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const el = document.querySelector('section[role="status"]');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 96);
  });
  const feedback = await shot(page);

  await page.goto(`${BASE}/app`);
  await page.getByRole('heading', { name: 'Deine Themen' }).waitFor();
  const dashboard = await shot(page);

  await page.goto(`${BASE}/app/topics/pythagoras/chapters/pyth-hypotenuse`);
  await page.getByRole('heading', { name: 'Zusammenfassung' }).waitFor();
  const chapter = await shot(page);

  await page.goto(`${BASE}/app/exercises/pyth-hypotenuse-4`);
  await handwriteSolution(page);
  await page.locator('input[id^="answer-"]').fill('17');
  await page.evaluate(() => window.scrollTo(0, 0));
  const hero = await shot(page);

  await page.setViewportSize(PORTRAIT);
  await page.goto(`${BASE}/app/exercises/pyth-hypotenuse-4`);
  await handwriteSolution(page);
  await page.locator('input[id^="answer-"]').fill('17');
  await page.evaluate(() => window.scrollTo(0, 0));
  const tablet = await shot(page);

  await encode(page, 'hero-aufgabe', hero, [640, 1280, 1920], 200);
  await encode(page, 'schritt-dashboard', dashboard, [640, 1280, 1920], 120);
  await encode(page, 'schritt-kapitel', chapter, [640, 1280, 1920], 120);
  await encode(page, 'schritt-feedback', feedback, [640, 1280, 1920], 120);
  await encode(page, 'tablet-hochformat', tablet, [640, 1280], 120);
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
