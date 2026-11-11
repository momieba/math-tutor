/**
 * Produktionsreife (lokaler Modus, gleiche Oberfläche wie mit Supabase):
 * protokollierte Hilfen, Konto (Passwort, Datenexport, Löschen), Passwort vergessen.
 */
import { readFileSync } from 'node:fs';
import { answerInput, expect, feedbackPanel, learnerData, openExercise, PASSWORD, register, submitButton, test } from './helpers';

test('Genutzte Hinweise bleiben nach dem Neuladen sichtbar und werden angerechnet', async ({ page }) => {
  await register(page);
  await openExercise(page, 'pyth-hypotenuse-1');
  await page.getByRole('button', { name: /Hinweis 1 von 3/ }).click();
  await expect(page.getByText('Hinweis 1:')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Hinweis 1:')).toBeVisible();
  await expect(page.getByRole('button', { name: /Hinweis 2 von 3/ })).toBeVisible();

  await answerInput(page).fill('15');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toContainText('Richtig');
  expect((await learnerData(page)).attempts[0]).toMatchObject({ hintsUsed: 1, solutionViewed: false });

  // Neue Runde: Hilfen beginnen wieder bei null
  await page.getByRole('button', { name: 'Nochmal versuchen' }).click();
  await expect(page.getByRole('button', { name: /Hinweis 1 von 3/ })).toBeVisible();
  await expect(page.getByText('Hinweis 1:')).toHaveCount(0);
});

test('Unklare Eingabe: Rückfrage, kein Versuch gespeichert', async ({ page }) => {
  await register(page);
  await openExercise(page, 'pyth-hypotenuse-1');
  await answerInput(page).fill('keine Ahnung');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toBeVisible();
  await expect(submitButton(page)).toBeEnabled();
  expect((await learnerData(page)).attempts).toHaveLength(0);
});

test.describe('Konto', () => {
  test('Profil, Passwort ändern und mit dem neuen Passwort anmelden', async ({ page }) => {
    const user = await register(page, 'Kim');
    await page.getByRole('link', { name: /Dein Konto/ }).click();
    await expect(page).toHaveURL(/\/app\/account$/);
    await expect(page.getByRole('heading', { name: 'Dein Konto' })).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();

    await page.getByLabel('Neues Passwort').fill('NeuesPasswort42');
    await page.getByRole('button', { name: 'Passwort speichern' }).click();
    await expect(page.getByText('Passwort geändert')).toBeVisible();

    await page.getByRole('button', { name: 'Abmelden' }).click();
    await page.goto('/login');
    await page.getByLabel('E-Mail').fill(user.email);
    await page.getByLabel('Passwort').fill(PASSWORD);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.getByRole('alert')).toContainText('E-Mail oder Passwort ist falsch');
    await page.getByLabel('Passwort').fill('NeuesPasswort42');
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.getByRole('link', { name: /angemeldet als Kim/ })).toBeVisible();
  });

  test('Daten herunterladen enthält Abgaben; Konto löschen entfernt alles', async ({ page }) => {
    const user = await register(page, 'Lou');
    await openExercise(page, 'pyth-hypotenuse-1');
    await answerInput(page).fill('15');
    await submitButton(page).click();
    await expect(feedbackPanel(page)).toContainText('Richtig');

    await page.goto('/app/account');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Meine Daten herunterladen' }).click()]);
    expect(download.suggestedFilename()).toMatch(/daten-\d{4}-\d{2}-\d{2}\.json$/);
    const data = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(data.account.email).toBe(user.email);
    expect(data.attempts).toHaveLength(1);
    expect(data.attempts[0]).toMatchObject({ exerciseId: 'pyth-hypotenuse-1', answerRaw: '15', isCorrect: true });

    await page.getByRole('button', { name: 'Konto löschen …' }).click();
    await page.getByRole('button', { name: 'Ja, endgültig löschen' }).click();
    await expect(page).toHaveURL(/\/$/);
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('mathmvp:v1:learner:') || k === 'mathmvp:v1:session'));
    expect(left).toEqual([]);

    await page.goto('/login');
    await page.getByLabel('E-Mail').fill(user.email);
    await page.getByLabel('Passwort').fill(user.password);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.getByRole('alert')).toContainText('E-Mail oder Passwort ist falsch');
  });

  test('„Passwort vergessen“ ist erreichbar und erklärt den lokalen Modus', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Passwort vergessen?' }).click();
    await expect(page.getByRole('heading', { name: 'Passwort vergessen' })).toBeVisible();
    await page.getByLabel('E-Mail').fill('wer@example.test');
    await page.getByRole('button', { name: 'Link schicken' }).click();
    await expect(page.getByRole('alert')).toContainText('lokalen Modus');
  });
});
