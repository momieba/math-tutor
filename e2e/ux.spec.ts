/**
 * UX-/Barriere-Check (Tablet): Touch-Ziele ≥ 44 px, kein horizontales Scrollen (quer + hoch),
 * Mindestschriftgröße, Screenshots der Hauptseiten unter e2e/screenshots.
 * Konsolen-/Seitenfehler werden über die Auto-Fixture in helpers.ts in jedem Test geprüft.
 */
import type { Page } from '@playwright/test';
import { addTopic, answerInput, drawWithMouse, expect, feedbackPanel, openExercise, register, solveChoice, submitButton, test } from './helpers';

/** Mindestmaß für Touch-Ziele (Auftrag/Konzept §23, Apple HIG): 44 × 44 px. */
const MIN_TARGET = 44;
/** Harte Untergrenze für Schrift (darunter auf dem Tablet unlesbar). */
const MIN_FONT_HARD = 12;
/** Empfehlung für die Zielgruppe (Kinder/Jugendliche, Tablet): ≥ 14 px. Unterschreitungen werden als UX-01 annotiert. */
const MIN_FONT_RECOMMENDED = 14;
/*
 * BUG-09 (behoben in c00f8c6): eigenständige Text-Links waren nur ~20 px hoch. Seitdem gibt es KEINE Ausnahmeliste
 * mehr – jedes gemessene Touch-Ziel < 44 px lässt den Test fehlschlagen. Gezielter Regressionstest siehe unten.
 */

const VIEWPORTS = [
  { name: 'quer', width: 1194, height: 834 },
  { name: 'hoch', width: 834, height: 1194 },
] as const;

interface Small {
  page: string;
  el: string;
  w: number;
  h: number;
}

/** Interaktive Elemente < 44×44 px. Inline-Links im Fließtext sind nach WCAG 2.5.8 ausgenommen und werden separat markiert. */
async function smallTargets(page: Page, label: string): Promise<Small[]> {
  const found = await page.evaluate(() => {
    const out: { el: string; w: number; h: number; inline: boolean }[] = [];
    document.querySelectorAll<HTMLElement>('a, button, input, select, summary, [role="radio"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || st.visibility === 'hidden') return;
      if (el.classList.contains('sr-only')) return;
      if (r.width < 44 || r.height < 44) {
        const text = (el.getAttribute('aria-label') ?? el.textContent ?? (el as HTMLInputElement).placeholder ?? '').trim().slice(0, 40);
        out.push({ el: `${el.tagName.toLowerCase()} „${text}“`, w: Math.round(r.width), h: Math.round(r.height), inline: st.display === 'inline' });
      }
    });
    return out;
  });
  return found.map((f) => ({ page: label, el: f.el + (f.inline ? ' [inline]' : ''), w: f.w, h: f.h }));
}

async function minFontSize(page: Page): Promise<{ px: number; samples: string[] }> {
  return page.evaluate(() => {
    let min = Infinity;
    const samples: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      if (!t.textContent?.trim()) continue;
      const el = t.parentElement!;
      if (el.closest('.katex, .sr-only, [aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px < 14 && samples.length < 12) samples.push(`${px}px „${t.textContent.trim().slice(0, 30)}“`);
      min = Math.min(min, px);
    }
    return { px: min, samples };
  });
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Legt einen Nutzer mit Daten an und liefert die Liste der zu prüfenden Seiten. */
async function seed(page: Page) {
  await register(page, 'Mia');
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  await solveChoice(page, 'pyth-grundlagen-1', 'Die Seite gegenüber dem rechten Winkel');
  await openExercise(page, 'pyth-hypotenuse-4');
  await drawWithMouse(page, page.locator('canvas'), [0.15, 0.3], [0.6, 0.45]);
  await answerInput(page).fill('17');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toContainText('Richtig');
}

const APP_PAGES: { name: string; url: string; ready: (p: Page) => Promise<void> }[] = [
  { name: 'dashboard', url: '/app', ready: (p) => expect(p.getByRole('heading', { name: 'Deine Themen' })).toBeVisible() },
  { name: 'thema', url: '/app/topics/pythagoras', ready: (p) => expect(p.locator('main ol > li')).toHaveCount(8) },
  { name: 'kapitel', url: '/app/topics/pythagoras/chapters/pyth-hypotenuse', ready: (p) => expect(p.getByRole('heading', { name: 'Zusammenfassung' })).toBeVisible() },
  { name: 'aufgabe-mc', url: '/app/exercises/pyth-grundlagen-2', ready: (p) => expect(p.getByRole('button', { name: 'Abgeben' })).toBeVisible() },
  { name: 'aufgabe-zahl', url: '/app/exercises/pyth-hypotenuse-3', ready: (p) => expect(p.getByRole('button', { name: 'Abgeben' })).toBeVisible() },
  { name: 'aufgabe-gleichung', url: '/app/exercises/quad-pq-formel-1', ready: (p) => expect(p.getByRole('button', { name: 'Abgeben' })).toBeVisible() },
  { name: 'aufgabe-handschrift', url: '/app/exercises/pyth-kathete-4', ready: (p) => expect(p.locator('canvas')).toBeVisible() },
  { name: 'verlauf', url: '/app/history', ready: (p) => expect(p.getByRole('list', { name: 'Abgaben' })).toBeVisible() },
];
const PUBLIC_PAGES: { name: string; url: string }[] = [
  { name: 'landing', url: '/' },
  { name: 'login', url: '/login' },
  { name: 'registrieren', url: '/register' },
  { name: 'impressum', url: '/legal/impressum' },
  { name: '404', url: '/gibt-es-nicht' },
];

for (const vp of VIEWPORTS) {
  test(`UX ${vp.name} ${vp.width}×${vp.height}: kein horizontales Scrollen, Screenshots, Messwerte`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const overflow: string[] = [];
    const small: Small[] = [];
    const fonts: string[] = [];
    let minFont = Infinity;

    for (const p of PUBLIC_PAGES) {
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');
      const o = await horizontalOverflow(page);
      if (o > 0) overflow.push(`${p.name}: +${o}px`);
      small.push(...(await smallTargets(page, p.name)));
      const f = await minFontSize(page);
      if (f.px < MIN_FONT_RECOMMENDED) fonts.push(`${p.name}: min ${f.px}px – ${f.samples.join('; ')}`);
      minFont = Math.min(minFont, f.px);
      await page.screenshot({ path: `e2e/screenshots/${vp.name}-${p.name}.png`, fullPage: true });
    }

    await seed(page);
    await page.screenshot({ path: `e2e/screenshots/${vp.name}-feedback-handschrift.png`, fullPage: true });
    for (const p of APP_PAGES) {
      await page.goto(p.url);
      await p.ready(page);
      const o = await horizontalOverflow(page);
      if (o > 0) overflow.push(`${p.name}: +${o}px`);
      small.push(...(await smallTargets(page, p.name)));
      const f = await minFontSize(page);
      if (f.px < MIN_FONT_RECOMMENDED) fonts.push(`${p.name}: min ${f.px}px – ${f.samples.join('; ')}`);
      minFont = Math.min(minFont, f.px);
      await page.screenshot({ path: `e2e/screenshots/${vp.name}-${p.name}.png`, fullPage: true });
    }
    // Verlauf mit geöffneter Detailansicht
    await page.goto('/app/history');
    await page.getByRole('list', { name: 'Abgaben' }).getByRole('button').first().click();
    await expect(page.getByRole('img', { name: 'Dein handschriftlicher Rechenweg' })).toBeVisible();
    if ((await horizontalOverflow(page)) > 0) overflow.push(`verlauf-detail: +${await horizontalOverflow(page)}px`);
    await page.screenshot({ path: `e2e/screenshots/${vp.name}-verlauf-detail.png`, fullPage: true });

    const report = { viewport: vp, overflow, smallTargets: small, smallFonts: fonts };
    await testInfo.attach(`ux-${vp.name}.json`, { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
    console.log(`UX-REPORT ${vp.name}: ${JSON.stringify(report)}`);

    for (const f of fonts) testInfo.annotations.push({ type: 'UX-01 Schrift < 14 px', description: f });
    for (const t of small) testInfo.annotations.push({ type: 'Touch-Ziel < 44 px', description: `${t.page}: ${t.el} ${t.w}×${t.h}` });

    expect(overflow, 'horizontales Scrollen').toEqual([]);
    expect(minFont, `kleinste Schrift ≥ ${MIN_FONT_HARD}px`).toBeGreaterThanOrEqual(MIN_FONT_HARD);
    expect(small, `Touch-Ziele < ${MIN_TARGET}px`).toEqual([]);
  });
}

test('BUG-09 (Regression): eigenständige Links auf Login/Registrieren/Impressum/404 sind ≥ 44 px hoch', async ({ page }) => {
  const fails: string[] = [];
  const links: [string, string][] = [
    ['/login', 'Noch kein Konto? Registrieren'],
    ['/register', 'Schon ein Konto? Anmelden'],
    ['/legal/impressum', '← Startseite'],
    ['/gibt-es-nicht', 'Zur Startseite'],
  ];
  for (const [url, name] of links) {
    await page.goto(url);
    const b = (await page.getByRole('link', { name, exact: true }).boundingBox())!;
    if (b.height < MIN_TARGET) fails.push(`${url} „${name}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  console.log(`BUG-09 Messwerte: ${JSON.stringify(fails)}`);
  expect(fails).toEqual([]);
});

/** Kontrastverhältnis nach WCAG 2.x für sichtbaren Text (Hintergrund = erster deckender Vorfahre). */
async function contrastFailures(page: Page, label: string): Promise<string[]> {
  return page.evaluate((lbl) => {
    // Tailwind v4 liefert oklch(); der Browser rechnet über ein 1×1-Canvas in sRGB um.
    const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true })!;
    const parse = (c: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const bgOf = (el: Element | null) => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c.a >= 0.99) return c;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const out: string[] = [];
    const seen = new Set<Element>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      const el = t.parentElement!;
      if (!t.textContent?.trim() || seen.has(el)) continue;
      seen.add(el);
      if (el.closest('.katex, .sr-only, [aria-hidden="true"], :disabled, [aria-disabled="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden') continue;
      let op = 1;
      for (let e: Element | null = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity);
      if (op < 0.99) continue; // bewusst ausgegraute Elemente
      const fg = parse(st.color);
      if (!fg || fg.a < 0.99) continue;
      const l1 = lum(fg);
      const l2 = lum(bgOf(el));
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(st.fontSize);
      const large = px >= 24 || (px >= 18.66 && Number(st.fontWeight) >= 700);
      const need = large ? 3 : 4.5;
      if (ratio < need) out.push(`${lbl}: ${ratio.toFixed(2)}:1 < ${need} „${t.textContent.trim().slice(0, 30)}“ (${st.color})`);
    }
    return out;
  }, label);
}

test('Barrierefreiheit Grundcheck: lang=de, eine h1, Bedienelemente mit Namen, Alt-Texte, Kontrast nach WCAG AA', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  // Kontrolle der Messmethode: kontrastarmer Text (rgb + oklch) MUSS erkannt werden, guter Kontrast nicht.
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="qa-probe" style="background:#fff"><p style="color:#bbb;font-size:16px">QA-Probe hell</p>' +
        '<p style="color:oklch(0.85 0 0);font-size:16px">QA-Probe oklch</p><p style="color:#111;font-size:16px">QA-Probe gut</p></div>',
    );
  });
  const probe = await contrastFailures(page, 'probe');
  expect(probe.filter((p) => p.includes('QA-Probe hell') || p.includes('QA-Probe oklch'))).toHaveLength(2);
  expect(probe.filter((p) => p.includes('QA-Probe gut'))).toHaveLength(0);
  await page.evaluate(() => document.getElementById('qa-probe')?.remove());

  const problems: string[] = [];
  const check = async (n: string) => {
    if ((await page.locator('h1').count()) !== 1) problems.push(`${n}: ${await page.locator('h1').count()} h1-Überschriften`);
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [role="radio"]')]
        .filter((el) => el.getBoundingClientRect().width > 0 && !el.classList.contains('sr-only'))
        .filter((el) => {
          const hasLabel = ((el as HTMLInputElement).labels?.length ?? 0) > 0;
          const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.textContent?.trim() || (el as HTMLInputElement).placeholder;
          return !hasLabel && !name;
        })
        .map((el) => el.outerHTML.slice(0, 90)),
    );
    for (const u of unnamed) problems.push(`${n}: ohne zugänglichen Namen ${u}`);
    const noAlt = await page.locator('img:not([alt])').count();
    if (noAlt) problems.push(`${n}: ${noAlt} <img> ohne alt`);
    problems.push(...(await contrastFailures(page, n)));
  };
  for (const [n, u] of [['landing', '/'], ['login', '/login'], ['registrieren', '/register']]) {
    await page.goto(u);
    await page.waitForLoadState('networkidle');
    await check(n);
  }
  await seed(page);
  await check('feedback-handschrift');
  for (const p of APP_PAGES) {
    await page.goto(p.url);
    await p.ready(page);
    await check(p.name);
  }
  await testInfo.attach('a11y.txt', { body: problems.join('\n') || 'keine Befunde', contentType: 'text/plain' });
  console.log(`A11Y-REPORT: ${JSON.stringify(problems)}`);
  expect(problems).toEqual([]);
});

test('Touch-Ziele: zentrale Bedienelemente sind ≥ 44 px hoch', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  const checks = [
    page.getByRole('button', { name: 'Thema finden' }),
    page.getByRole('link', { name: 'Thema öffnen' }),
    page.getByRole('button', { name: 'Abmelden' }),
    page.getByRole('link', { name: 'Verlauf' }),
  ];
  await openExercise(page, 'pyth-hypotenuse-4');
  checks.push(
    page.getByRole('button', { name: 'Abgeben' }),
    page.getByRole('button', { name: /Hinweis 1 von 3/ }),
    page.getByRole('button', { name: 'Lösung anzeigen' }),
    page.getByRole('button', { name: 'Rückgängig' }),
    page.getByRole('button', { name: 'Farbe Blau' }),
    page.getByRole('button', { name: /Radierer/ }),
    answerInput(page),
  );
  const fails: string[] = [];
  for (const loc of checks) {
    if (!(await loc.isVisible())) continue; // Dashboard-Elemente sind nach Navigation nicht mehr da – unten separat
    const b = (await loc.boundingBox())!;
    if (b.height < 44 || b.width < 44) fails.push(`${loc} ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  await page.goto('/app');
  for (const loc of checks.slice(0, 4)) {
    const b = (await loc.boundingBox())!;
    if (b.height < 44 || b.width < 44) fails.push(`${loc} ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  await openExercise(page, 'pyth-grundlagen-1');
  for (const r of await page.getByRole('radio').all()) {
    const b = (await r.boundingBox())!;
    if (b.height < 44) fails.push(`radio ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  expect(fails).toEqual([]);
});

/** Emuliert einen unsicheren Kontext (z. B. `vite --host`, Aufruf am iPad über http://192.168.x.y:5173). */
async function emulateInsecureContext(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, 'subtle', { value: undefined });
    Object.defineProperty(window.crypto, 'randomUUID', { value: undefined });
  });
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function localUsers(page: Page): Promise<{ profile: { id: string; email: string }; salt: string; passwordHash: string }[]> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('mathmvp:v1:users') ?? '[]'));
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('E-Mail').fill(email);
  await page.getByLabel('Passwort').fill(password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
}

test('BUG-08 (Regression): Registrieren, Abmelden, Anmelden ohne crypto.randomUUID/crypto.subtle (iPad über http://LAN-IP)', async ({ page }) => {
  await emulateInsecureContext(page);
  await page.goto('/register');
  // Gegenprobe: Die Emulation greift wirklich (sonst wäre der Test wertlos).
  expect(await page.evaluate(() => [typeof crypto.subtle, typeof crypto.randomUUID])).toEqual(['undefined', 'undefined']);

  await page.getByLabel('Name').fill('Lan');
  await page.getByLabel('E-Mail').fill('lan@example.test');
  await page.getByLabel('Passwort').fill('Geheim123!');
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await expect(page).toHaveURL(/\/app$/, { timeout: 3000 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Hallo Lan!' })).toBeVisible();

  const [u] = await localUsers(page);
  expect(u.profile.id).toMatch(UUID_V4);
  expect(u.salt).toMatch(UUID_V4);
  expect(u.passwordHash).toMatch(/^[0-9a-f]{64}$/);

  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await loginAs(page, 'lan@example.test', 'falschesPasswort');
  await expect(page.getByRole('alert')).toHaveText('E-Mail oder Passwort ist falsch.');

  await loginAs(page, 'lan@example.test', 'Geheim123!');
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Hallo Lan!' })).toBeVisible();
});

test('BUG-08 (Regression): Konto mit WebCrypto angelegt (localhost) → Anmeldung später ohne WebCrypto (LAN-IP) klappt', async ({ page }) => {
  // 1) Normal registrieren (sicherer Kontext, echtes crypto.subtle)
  await page.goto('/register');
  expect(await page.evaluate(() => typeof crypto.subtle)).toBe('object');
  await page.getByLabel('Name').fill('Mira');
  await page.getByLabel('E-Mail').fill('mira@example.test');
  await page.getByLabel('Passwort').fill('Geheim123!');
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await expect(page).toHaveURL(/\/app$/);
  const hashBefore = (await localUsers(page))[0].passwordHash;
  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // 2) Ab jetzt ohne WebCrypto (gleicher localStorage, gleicher Origin)
  await emulateInsecureContext(page);
  await loginAs(page, 'mira@example.test', 'Geheim123!');
  expect(await page.evaluate(() => typeof crypto.subtle)).toBe('undefined');
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Hallo Mira!' })).toBeVisible();
  expect((await localUsers(page))[0].passwordHash).toBe(hashBefore);
});
