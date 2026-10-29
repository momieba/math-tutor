import { test as base, expect, type Locator, type Page } from '@playwright/test';

/**
 * Gemeinsame Fixtures/Helfer für die E2E-Tests.
 * - `consoleErrors` (auto): sammelt console.error + pageerror während jedes Tests und lässt den Test scheitern,
 *   wenn welche auftreten. Tests, die Fehler bewusst provozieren, können Einträge per `allowConsole(regex)` freigeben.
 */
interface Fixtures {
  consoleErrors: { list: string[]; allow: (re: RegExp) => void };
}

export const test = base.extend<Fixtures>({
  consoleErrors: [
    async ({ page }, use, testInfo) => {
      const list: string[] = [];
      const allowed: RegExp[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') list.push(`console.error: ${m.text()}`);
      });
      page.on('pageerror', (e) => list.push(`pageerror: ${e.message}`));
      await use({ list, allow: (re) => allowed.push(re) });
      const relevant = list.filter((e) => !allowed.some((re) => re.test(e)));
      if (list.length) await testInfo.attach('console-errors.txt', { body: list.join('\n'), contentType: 'text/plain' });
      expect(relevant, 'Konsolen-/Seitenfehler während des Tests').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

export const PASSWORD = 'Geheim123!';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

/** Registriert einen frischen Nutzer (jeder Test hat einen eigenen Browser-Kontext ⇒ leerer localStorage). */
export async function register(page: Page, name = 'Tessa'): Promise<TestUser> {
  const user = { name, email: uniqueEmail(), password: PASSWORD };
  await page.goto('/register');
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('E-Mail').fill(user.email);
  await page.getByLabel('Passwort').fill(user.password);
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: `Hallo ${name}!` })).toBeVisible();
  return user;
}

/** Thema über das Eingabefeld suchen und (falls eindeutig) hinzufügen. */
export async function addTopic(page: Page, query: string, expectedTitle: string) {
  await page.goto('/app');
  await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill(query);
  await page.getByRole('button', { name: 'Thema finden' }).click();
  const candidate = page.locator('li').filter({ hasText: expectedTitle }).first();
  await candidate.getByRole('button', { name: 'Thema hinzufügen' }).click();
  await expect(topicTile(page, expectedTitle)).toBeVisible();
}

export function topicTile(page: Page, title: string): Locator {
  return page.locator('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

/** Lokale Lerndaten des angemeldeten Nutzers direkt aus dem localStorage (Prüfung der Persistenz). */
export async function learnerData(page: Page): Promise<{ userId: string | null; attempts: any[]; activeTopics: any[]; draftKeys: string[] }> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('mathmvp:v1:session');
    const userId = raw ? (JSON.parse(raw) as string) : null;
    const data = userId ? localStorage.getItem(`mathmvp:v1:learner:${userId}`) : null;
    const parsed = data ? JSON.parse(data) : { attempts: [], activeTopics: [] };
    const draftKeys = Object.keys(localStorage).filter((k) => k.startsWith('mathmvp:v1:draft:'));
    return { userId, attempts: parsed.attempts ?? [], activeTopics: parsed.activeTopics ?? [], draftKeys };
  });
}

export const answerInput = (page: Page) => page.locator('input[id^="answer-"]');
export const feedbackPanel = (page: Page) => page.locator('section[role="status"]').first();
export const submitButton = (page: Page) => page.getByRole('button', { name: 'Abgeben' });

/** Öffnet eine Aufgabe und wartet, bis sie geladen ist. */
export async function openExercise(page: Page, exerciseId: string) {
  await page.goto(`/app/exercises/${exerciseId}`);
  await expect(page.getByRole('button', { name: 'Abgeben' })).toBeVisible();
}

/** Text-/Zahl-/Gleichungsaufgabe lösen. Gibt das Feedback-Panel zurück. */
export async function solveTyped(page: Page, exerciseId: string, answer: string) {
  await openExercise(page, exerciseId);
  await answerInput(page).fill(answer);
  await submitButton(page).click();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();
  return feedbackPanel(page);
}

/** Multiple-Choice-Aufgabe lösen (Option per sichtbarem Text, z. B. „b)“). */
export async function solveChoice(page: Page, exerciseId: string, optionText: string | RegExp) {
  await openExercise(page, exerciseId);
  await page.getByRole('radio').filter({ hasText: optionText }).click();
  await submitButton(page).click();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();
  return feedbackPanel(page);
}

/** Anzahl nicht-transparenter Pixel auf der Schreibfläche. */
export async function inkPixels(page: Page): Promise<number> {
  return page.locator('canvas').evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
}

/** Zeichnet einen Strich mit der Maus (PointerEvent pointerType=mouse). Koordinaten relativ zum Element (0..1). */
export async function drawWithMouse(page: Page, target: Locator, from: [number, number], to: [number, number], steps = 12) {
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps });
  await page.mouse.up();
}

/**
 * Echte Touch-Geste über das Chrome DevTools Protocol (wird vom Browser in PointerEvents pointerType=touch
 * und – falls touch-action es erlaubt – in Scroll-Gesten übersetzt). Koordinaten in Viewport-Pixeln.
 */
export async function touchDrag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }, steps = 15) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, id: 1 }] });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/** Liest den Score aus einem ScoreBadge (aria-label „Verständnis-Score N von 100: …“). */
export async function readScore(badge: Locator): Promise<number> {
  const label = (await badge.getAttribute('aria-label')) ?? '';
  const m = /Verständnis-Score (\d+) von 100/.exec(label);
  if (!m) throw new Error(`Kein Score im aria-label: ${label}`);
  return Number(m[1]);
}
export const scoreBadges = (scope: Page | Locator) => scope.locator('[aria-label^="Verständnis-Score"]');
