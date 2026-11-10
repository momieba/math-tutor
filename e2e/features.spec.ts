import { answerInput, expect, register, test } from './helpers';

test.describe('Kapitel-Test', () => {
  test('acht Aufgaben ohne Hilfen, Auswertung erst am Ende, Versuche im Verlauf als Test markiert', async ({ page }) => {
    await register(page, 'Tim');
    await page.goto('/app/topics/pythagoras/chapters/pyth-hypotenuse/test');
    await expect(page.getByRole('heading', { name: /Kapitel-Test/ })).toBeVisible();
    await page.getByRole('button', { name: 'Test starten' }).click();

    for (let i = 1; i <= 8; i++) {
      await expect(page.getByText(new RegExp(`Aufgabe ${i} von 8`))).toBeVisible();
      await expect(page.getByRole('button', { name: /Hinweis/ })).toHaveCount(0); // keine Hilfen im Test
      const radios = page.getByRole('radio');
      if (await radios.count()) await radios.first().check({ force: true });
      else await answerInput(page).fill('5');
      await page.getByRole('button', { name: /^Abgeben und (weiter|Test beenden)$/ }).click();
      // Zwischendurch keine Bewertung: weder „Richtig“ noch „Noch nicht richtig“
      if (i < 8) await expect(page.getByText(new RegExp(`Aufgabe ${i + 1} von 8`))).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: /Test (bestanden!|beendet)/ })).toBeVisible();
    await expect(page.getByText(/von 8 Punkten erreicht/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deine Aufgaben' })).toBeVisible();
    await expect(page.locator('details')).toHaveCount(8);

    await page.goto('/app/history');
    await expect(page.getByText('im Kapitel-Test').first()).toBeVisible();
  });
});
