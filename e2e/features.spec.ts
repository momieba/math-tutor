import { answerInput, expect, openExercise, register, submitButton, test } from './helpers';

test('Ausführliche Lösung mit Denkschritten und Skizze unter der Musterlösung', async ({ page }) => {
  await register(page, 'Ole');
  await openExercise(page, 'pyth-hypotenuse-1');
  // Die Aufgabe steht als Karte auf dem Kästchenpapier
  await expect(page.getByRole('heading', { level: 1, name: /Hypotenuse/ })).toBeVisible();
  await answerInput(page).fill('15');
  await submitButton(page).click();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();
  await page.getByRole('button', { name: 'Alle Schritte zeigen' }).click().catch(() => undefined);
  await page.getByText('Ausführliche Lösung mit allen Denkschritten').click();
  await expect(page.getByText('Was ist gegeben, was ist gesucht?')).toBeVisible();
  await expect(page.getByRole('img', { name: /Rechtwinkliges Dreieck mit den Katheten a = 9 cm und b = 12 cm/ })).toBeVisible();
  await expect(page.getByText('Ergebnis prüfen')).toBeVisible();
  // Keine Stufen- oder Score-Karte mehr zwischen Rückmeldung und Musterlösung
  await expect(page.getByText(/jetzt kommen (mittlere|schwere) Aufgaben/)).toHaveCount(0);
});

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
    await expect(page.locator('summary').filter({ hasText: /Aufgabe \d+ ·/})).toHaveCount(8);

    await page.goto('/app/history');
    await expect(page.getByText('im Kapitel-Test').first()).toBeVisible();
  });
});
