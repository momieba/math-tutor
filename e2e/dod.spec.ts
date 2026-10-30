/**
 * E2E-Abnahme der Definition of Done (Konzept §25, Punkte 1–10) im lokalen Modus (ohne .env).
 * Gerät: iPad Pro 11 quer, Touch. Jeder Test hat einen eigenen Browser-Kontext (leerer localStorage).
 * Behobene Befunde laufen als Regressionstests („BUG-xx (Regression): …“).
 * Neue offene Befunde würden als `test.fail()` mit Bug-ID markiert: Sie laufen „grün“, solange der Fehler besteht,
 * und schlagen an, sobald er behoben ist (dann Markierung entfernen = Re-Test).
 */
import {
  addTopic,
  answerInput,
  drawWithMouse,
  expect,
  feedbackPanel,
  inkPixels,
  learnerData,
  openExercise,
  readScore,
  register,
  scoreBadges,
  solveChoice,
  solveTyped,
  submitButton,
  test,
  topicTile,
  touchDrag,
} from './helpers';

// ---------------------------------------------------------------- DoD 1
test.describe('DoD 1 – Konto erstellen und anmelden', () => {
  test('Registrieren → Abmelden → Anmelden; falsches Passwort zeigt Fehler', async ({ page }) => {
    const user = await register(page, 'Lena');
    await expect(page.getByText('Lokaler Modus', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Abmelden' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('E-Mail').fill(user.email);
    await page.getByLabel('Passwort').fill('falschesPasswort');
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.getByRole('alert')).toHaveText('E-Mail oder Passwort ist falsch.');
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Passwort').fill(user.password);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('heading', { name: 'Hallo Lena!' })).toBeVisible();
  });

  test('E-Mail ist case-insensitiv, doppelte Registrierung wird abgelehnt', async ({ page }) => {
    const user = await register(page, 'Ben');
    await page.getByRole('button', { name: 'Abmelden' }).click();
    await page.goto('/register');
    await page.getByLabel('Name').fill('Ben2');
    await page.getByLabel('E-Mail').fill(user.email.toUpperCase());
    await page.getByLabel('Passwort').fill('nochmal12345');
    await page.getByRole('button', { name: 'Registrieren' }).click();
    await expect(page.getByRole('alert')).toContainText('existiert bereits ein Konto');
  });

  test('Passwort unter 8 Zeichen wird vom Formular blockiert', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('E-Mail').fill('kurz@example.test');
    await page.getByLabel('Passwort').fill('1234567');
    await page.getByRole('button', { name: 'Registrieren' }).click();
    await expect(page).toHaveURL(/\/register$/);
    const tooShort = await page.getByLabel('Passwort').evaluate((el: HTMLInputElement) => el.validity.tooShort);
    expect(tooShort).toBe(true);
  });

  test('„Mit Google fortfahren“ meldet im lokalen Modus den Demo-Nutzer an', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Mit Google fortfahren' }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('heading', { name: 'Hallo Demo (Google)!' })).toBeVisible();
  });
});

// ---------------------------------------------------------------- DoD 2 + 3
test.describe('DoD 2+3 – Thema über Texteingabe finden und zuordnen', () => {
  test('„Ich möchte den Satz des Pythagoras verstehen.“ → Pythagoras-Kachel mit allen Angaben', async ({ page }) => {
    await register(page);
    await expect(page.getByText('Noch keine Themen.')).toBeVisible(); // Leerzustand
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('Ich möchte den Satz des Pythagoras verstehen.');
    await page.getByRole('button', { name: 'Thema finden' }).click();
    await expect(page.getByText('Passt dieses Thema?')).toBeVisible();
    const cand = page.locator('li').filter({ hasText: 'Satz des Pythagoras' });
    await expect(cand).toContainText('Klasse 8 · Geometrie · 8 Kapitel');
    await cand.getByRole('button', { name: 'Thema hinzufügen' }).click();

    const tile = topicTile(page, 'Satz des Pythagoras');
    await expect(tile).toBeVisible();
    await expect(tile).toContainText('Klasse 8 · Geometrie'); // Klassenstufe + Themengebiet
    await expect(tile.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0'); // Fortschritt
    await expect(scoreBadges(tile)).toHaveCount(1); // Verständnis-Score
    expect(await readScore(scoreBadges(tile).first())).toBe(0);
    await expect(tile.getByText('Nicht begonnen')).toBeVisible(); // Lernstatus
    await tile.getByRole('link', { name: 'Thema öffnen' }).click(); // Öffnen-Button
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/);
  });

  test('„Gitarre spielen“ → kein Match, ähnliche Themen + „Alle Themen zeigen“', async ({ page }) => {
    await register(page);
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('Gitarre spielen');
    await page.getByRole('button', { name: 'Thema finden' }).click();
    await expect(page.getByText(/kein passendes Thema im Lehrplan gefunden/)).toBeVisible();
    const box = page.locator('[aria-live="polite"]').filter({ hasText: 'kein passendes Thema' });
    expect(await box.getByRole('button', { name: 'Thema hinzufügen' }).count()).toBeGreaterThanOrEqual(1);
    await box.getByRole('button', { name: 'Alle Themen zeigen' }).click();
    await expect(page.getByText('Alle Themen aus dem Lehrplan:')).toBeVisible();
    const all = page.locator('[aria-live="polite"]').filter({ hasText: 'Alle Themen aus dem Lehrplan:' });
    await expect(all.getByRole('button', { name: 'Thema hinzufügen' })).toHaveCount(3);
    // Es wurde nichts ungefragt angelegt
    expect((await learnerData(page)).activeTopics).toHaveLength(0);
  });

  for (const [query, title, meta] of [
    ['quadratische Gleichungen lösen', 'Quadratische Gleichungen', 'Klasse 9 · Algebra'],
    ['Ich muss mich auf eine Mathearbeit zu Prozentrechnung vorbereiten.', 'Prozentrechnung', 'Klasse 7 · Zahlen und Größen'],
    ['Mathearbeit Prozentrechnung', 'Prozentrechnung', 'Klasse 7 · Zahlen und Größen'],
  ] as const) {
    test(`„${query}“ → ${title}`, async ({ page }) => {
      await register(page);
      await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill(query);
      await page.getByRole('button', { name: 'Thema finden' }).click();
      await expect(page.getByText('Passt dieses Thema?')).toBeVisible();
      await page.locator('li').filter({ hasText: title }).getByRole('button', { name: 'Thema hinzufügen' }).click();
      await expect(topicTile(page, title)).toContainText(meta);
    });
  }

  test('„Kathete berechnen“ bietet „Direkt zum passenden Kapitel“ an', async ({ page }) => {
    await register(page);
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('Kathete berechnen');
    await page.getByRole('button', { name: 'Thema finden' }).click();
    await expect(page.getByText('Passendes Kapitel: Kathete berechnen')).toBeVisible();
    await page.getByRole('button', { name: 'Direkt zum passenden Kapitel' }).click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras\/chapters\/pyth-kathete$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Kathete berechnen' })).toBeVisible();
  });

  test('Bereits aktives Thema wird nicht doppelt angelegt; leere Eingabe ist gesperrt; HTML wird nicht ausgeführt', async ({ page }) => {
    await register(page);
    await expect(page.getByRole('button', { name: 'Thema finden' })).toBeDisabled();
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('   ');
    await expect(page.getByRole('button', { name: 'Thema finden' })).toBeDisabled();

    let dialog = false;
    page.on('dialog', (d) => {
      dialog = true;
      void d.dismiss();
    });
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('<img src=x onerror=alert(1)><script>alert(2)</script>');
    await page.getByRole('button', { name: 'Thema finden' }).click();
    await expect(page.getByText(/kein passendes Thema/)).toBeVisible();
    expect(dialog).toBe(false);

    await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
    await page.getByRole('textbox', { name: 'Was möchtest du heute lernen?' }).fill('Pythagoras');
    await page.getByRole('button', { name: 'Thema finden' }).click();
    await expect(page.getByRole('link', { name: 'Schon aktiv – öffnen' })).toBeVisible();
    expect((await learnerData(page)).activeTopics).toHaveLength(1);
    await expect(page.locator('article')).toHaveCount(1);
  });
});

// ---------------------------------------------------------------- DoD 4
test('DoD 4 – Themen-Dashboard zeigt 8 Kapitel mit Status, Fortschritt, gelöst/offen und Empfehlung', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  await page.goto('/app/topics/pythagoras');
  const chapters = page.locator('main ol > li');
  await expect(chapters).toHaveCount(8);
  for (let i = 0; i < 8; i++) {
    const c = chapters.nth(i);
    await expect(c.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(c.getByText('Nicht begonnen')).toBeVisible();
    await expect(c.getByRole('progressbar')).toBeVisible();
    await expect(c).toContainText(/0 gelöst · \d+ offen · \d+ Aufgaben/);
    await expect(scoreBadges(c)).toHaveCount(1);
  }
  await expect(page.getByText('Als Nächstes empfohlen')).toHaveCount(1);
  await expect(chapters.first()).toContainText('Als Nächstes empfohlen');
  await expect(chapters.first()).toContainText('Grundlagen und Definition');
});

// ---------------------------------------------------------------- DoD 5
test('DoD 5 – Kapitel: Lernziel, Einführung, Regeln (KaTeX), Video-Platzhalter, Beispiel, Aufgaben, Zusammenfassung', async ({ page }) => {
  await register(page);
  await page.goto('/app/topics/pythagoras/chapters/pyth-hypotenuse');
  await expect(page.getByRole('heading', { level: 1, name: 'Hypotenuse berechnen' })).toBeVisible();
  await expect(page.getByText('Lernziel:')).toBeVisible();
  for (const h of ['Einführung', 'Begriffe und Regeln', 'Video', 'Beispiel', 'Übungsaufgaben', 'Zusammenfassung']) {
    await expect(page.getByRole('heading', { level: 2, name: h, exact: true })).toBeVisible();
  }
  expect(await page.locator('.katex').count()).toBeGreaterThan(0);
  expect(await page.locator('.katex-error').count()).toBe(0); // kein fehlerhaftes LaTeX
  await expect(page.getByText(/Video folgt/).first()).toBeVisible();
  const tasks = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Übungsaufgaben' }) }).getByRole('listitem');
  expect(await tasks.count()).toBeGreaterThanOrEqual(3);
  await expect(tasks.first()).toContainText('Offen');
  await expect(page.getByRole('link', { name: 'Üben starten' })).toBeVisible();
});

test('DoD 5 – kein KaTeX-Renderfehler in irgendeinem Kapitel', async ({ page }) => {
  await register(page);
  const chapters: Record<string, string[]> = {
    pythagoras: ['pyth-grundlagen', 'pyth-erkennen', 'pyth-herleitung', 'pyth-hypotenuse', 'pyth-kathete', 'pyth-umkehrung', 'pyth-anwendung', 'pyth-gemischt'],
    prozentrechnung: ['prozent-grundbegriffe', 'prozent-prozentwert', 'prozent-satz-grundwert'],
    'quadratische-gleichungen': ['quad-reinquadratisch', 'quad-nullprodukt', 'quad-pq-formel'],
  };
  const broken: string[] = [];
  for (const [topic, subs] of Object.entries(chapters)) {
    for (const s of subs) {
      await page.goto(`/app/topics/${topic}/chapters/${s}`);
      await expect(page.getByRole('heading', { name: 'Zusammenfassung' })).toBeVisible();
      const n = await page.locator('.katex-error').count();
      const raw = await page.locator('main').evaluate((m) => (m.textContent ?? '').match(/\$[^$]{1,40}\$/g) ?? []);
      if (n || raw.length) broken.push(`${s}: ${n} katex-error, ungerendert: ${raw.join(' | ')}`);
    }
  }
  expect(broken).toEqual([]);
});

// ---------------------------------------------------------------- DoD 6
test.describe('DoD 6 – Aufgaben bearbeiten und einreichen', () => {
  test('Multiple Choice: richtige Option → grün, falsche Option → rot', async ({ page }) => {
    await register(page);
    let fb = await solveChoice(page, 'pyth-grundlagen-1', 'Die Seite gegenüber dem rechten Winkel');
    await expect(fb).toContainText('Richtig');
    await expect(fb).toHaveClass(/emerald/);

    fb = await solveChoice(page, 'pyth-hypotenuse-2', /^\s*a\)/);
    await expect(fb).toContainText('Noch nicht richtig');
    await expect(fb).toHaveClass(/red/);
    const { attempts } = await learnerData(page);
    expect(attempts.map((a) => [a.exerciseId, a.isCorrect])).toEqual([
      ['pyth-grundlagen-1', true],
      ['pyth-hypotenuse-2', false],
    ]);
  });

  test('Numerisch: „8,1“, „8.1“ und „8,1 cm“ werden akzeptiert, „9“ ist falsch', async ({ page }) => {
    await register(page);
    for (const v of ['8,1', '8.1', '8,1 cm']) {
      const fb = await solveTyped(page, 'pyth-hypotenuse-3', v);
      await expect(fb, `Eingabe ${v}`).toContainText('Richtig');
    }
    const fb = await solveTyped(page, 'pyth-hypotenuse-3', '9');
    await expect(fb).toContainText('Noch nicht richtig');
    expect((await learnerData(page)).attempts).toHaveLength(4);
  });

  test('Numerisch: nicht lesbare Eingabe → gelbe Rückfrage, kein Versuch gespeichert', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-1');
    await answerInput(page).fill('fünfzehn');
    await submitButton(page).click();
    await expect(feedbackPanel(page)).toContainText('Nicht eindeutig');
    await expect(feedbackPanel(page)).toHaveClass(/amber/);
    expect((await learnerData(page)).attempts).toHaveLength(0);
  });

  test('BUG-03 (Regression): „√65“, „5 oder 12“, „10^2“ → gelbe Rückfrage, kein Versuch gespeichert', async ({ page }) => {
    await register(page);
    for (const [id, raw] of [
      ['pyth-hypotenuse-3', '√65'],
      ['pyth-hypotenuse-3', '5 oder 12'],
      ['pyth-hypotenuse-4', '10^2'],
    ] as const) {
      await openExercise(page, id);
      await answerInput(page).fill(raw);
      await submitButton(page).click();
      await expect(feedbackPanel(page), `${id} ${raw}`).toContainText('Nicht eindeutig');
      await expect(feedbackPanel(page), `${id} ${raw}`).toHaveClass(/amber/);
      // keine Musterlösung, weil nicht bewertet; Eingabe bleibt zum Korrigieren stehen
      await expect(page.getByRole('heading', { name: 'Musterlösung' })).toHaveCount(0);
      await expect(answerInput(page)).toHaveValue(raw);
      expect((await learnerData(page)).attempts, `${id} ${raw}`).toHaveLength(0);
    }
  });

  test('BUG-10 (Regression): „c = 15 oder c = 17“ → gelbe Rückfrage, kein Versuch gespeichert', async ({ page }) => {
    await register(page);
    // Soll 17: beide Reihenfolgen müssen gleich (gelb) behandelt werden, nicht Grün bzw. Rot je nach letztem Wert
    for (const raw of ['c = 15 oder c = 17', 'c = 17 oder c = 15']) {
      await openExercise(page, 'pyth-hypotenuse-4');
      await answerInput(page).fill(raw);
      await submitButton(page).click();
      await expect(feedbackPanel(page), raw).toContainText('Nicht eindeutig');
      await expect(feedbackPanel(page), raw).toHaveClass(/amber/);
      await expect(page.getByRole('heading', { name: 'Musterlösung' })).toHaveCount(0);
      await expect(answerInput(page)).toHaveValue(raw);
      expect((await learnerData(page)).attempts, raw).toHaveLength(0);
    }
  });

  test('BUG-12 (Regression): „c = 15 bzw. c = 17“ → gelbe Rückfrage, kein Versuch gespeichert', async ({ page }) => {
    await register(page);
    // Soll 17: Mehrere Aussagen werden am Aufbau erkannt, nicht nur über „oder“/„und“; auch BUG-13 („15 bzw. 17“)
    for (const raw of ['c = 15 bzw. c = 17', 'c = 17 bzw. c = 15', 'c = 15 c = 17', '15 bzw. 17']) {
      await openExercise(page, 'pyth-hypotenuse-4');
      await answerInput(page).fill(raw);
      await submitButton(page).click();
      await expect(feedbackPanel(page), raw).toContainText('Nicht eindeutig');
      await expect(feedbackPanel(page), raw).toHaveClass(/amber/);
      await expect(page.getByRole('heading', { name: 'Musterlösung' })).toHaveCount(0);
      await expect(answerInput(page)).toHaveValue(raw);
      expect((await learnerData(page)).attempts, raw).toHaveLength(0);
    }
  });

  test('UX-07 (Regression): Brotkrumen der Aufgabe zeigen den Themennamen und führen zum Thema', async ({ page }) => {
    await register(page);
    for (const [id, title, topicId] of [
      ['pyth-hypotenuse-3', 'Satz des Pythagoras', 'pythagoras'],
      ['quad-reinquadratisch-1', 'Quadratische Gleichungen', 'quadratische-gleichungen'],
    ] as const) {
      await openExercise(page, id);
      const crumbs = page.getByRole('navigation', { name: 'Brotkrumen' });
      const topicLink = crumbs.getByRole('link').first();
      await expect(topicLink, id).toHaveText(title);
      await expect(topicLink, id).toHaveAttribute('href', `/app/topics/${topicId}`);
    }
  });

  test('Gleichung: „7; -7“ mit KaTeX-Vorschau, „x=7 oder x=-7“ ebenfalls richtig', async ({ page }) => {
    await register(page);
    await openExercise(page, 'quad-reinquadratisch-1');
    await answerInput(page).fill('7; -7');
    await expect(page.locator('[aria-label="Vorschau"] .katex')).toBeVisible();
    await submitButton(page).click();
    await expect(feedbackPanel(page)).toContainText('Richtig');
    const fb = await solveTyped(page, 'quad-reinquadratisch-1', 'x=7 oder x=-7');
    await expect(fb).toContainText('Richtig');
    const fb2 = await solveTyped(page, 'quad-reinquadratisch-1', '7');
    await expect(fb2).toContainText('Teilweise richtig');
    await expect(fb2).toContainText('50 % der Punkte');
  });

  test('Handschrift: Touch/Maus zeichnen, Seite scrollt nicht, Undo/Redo/Löschen, Rückfrage ohne Ergebnis', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-4');
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveCSS('touch-action', 'none');
    await canvas.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -60));
    const box = (await canvas.boundingBox())!;
    const docScrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
    expect(docScrollable, 'Seite muss scrollbar sein, sonst ist der Scroll-Test wertlos').toBe(true);

    // Kontrolle: dieselbe Wischgeste NEBEN der Schreibfläche scrollt die Seite (Testmethode ist gültig).
    const y0 = await page.evaluate(() => window.scrollY);
    await touchDrag(page, { x: 15, y: box.y + box.height * 0.7 }, { x: 15, y: box.y + box.height * 0.2 });
    await page.waitForTimeout(300);
    const yControl = await page.evaluate(() => window.scrollY);
    expect(yControl, 'Kontrollgeste neben dem Canvas sollte scrollen').toBeGreaterThan(y0);
    await page.evaluate((y) => window.scrollTo(0, y), y0);
    await page.waitForTimeout(100);

    // 1) Touch-Strich auf der Schreibfläche: zeichnet, Seite bleibt stehen.
    const b = (await canvas.boundingBox())!;
    const yBefore = await page.evaluate(() => window.scrollY);
    await touchDrag(page, { x: b.x + b.width * 0.3, y: b.y + b.height * 0.7 }, { x: b.x + b.width * 0.35, y: b.y + b.height * 0.2 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY), 'Seite darf beim Schreiben nicht scrollen').toBe(yBefore);
    const ink1 = await inkPixels(page);
    expect(ink1, 'Touch-Strich muss sichtbar sein').toBeGreaterThan(0);

    // 2) Maus-Strich
    await drawWithMouse(page, canvas, [0.5, 0.5], [0.8, 0.6]);
    const ink2 = await inkPixels(page);
    expect(ink2).toBeGreaterThan(ink1);

    const undoBtn = page.getByRole('button', { name: 'Rückgängig' });
    const redoBtn = page.getByRole('button', { name: 'Wiederholen' });
    await expect(redoBtn).toBeDisabled();
    await undoBtn.click();
    expect(await inkPixels(page)).toBe(ink1);
    await undoBtn.click();
    expect(await inkPixels(page)).toBe(0);
    await expect(undoBtn).toBeDisabled();
    await redoBtn.click();
    await redoBtn.click();
    expect(await inkPixels(page)).toBe(ink2);
    await page.getByRole('button', { name: 'Alles löschen' }).click();
    expect(await inkPixels(page)).toBe(0);
    await undoBtn.click(); // „Alles löschen“ ist rückgängig machbar
    expect(await inkPixels(page)).toBe(ink2);

    // Radierer entfernt Tinte
    await page.getByRole('button', { name: /Radierer/ }).click();
    await drawWithMouse(page, canvas, [0.5, 0.5], [0.8, 0.6]);
    expect(await inkPixels(page)).toBeLessThan(ink2);
    await page.getByRole('button', { name: /Stift/ }).click();

    // Abgabe ohne Endergebnis → gelbe Rückfrage, kein Versuch
    await expect(submitButton(page)).toBeEnabled();
    await submitButton(page).click();
    await expect(feedbackPanel(page)).toContainText('Nicht eindeutig');
    await expect(feedbackPanel(page)).toContainText('Handschrift wird noch nicht automatisch gelesen');
    await expect(feedbackPanel(page)).toHaveClass(/amber/);
    expect((await learnerData(page)).attempts).toHaveLength(0);

    // Mit Endergebnis → Richtig (grün) + gelbe Markierung „Rechenweg nicht geprüft“, Bild gespeichert
    await answerInput(page).fill('17');
    await submitButton(page).click();
    const fb = feedbackPanel(page);
    await expect(fb).toContainText('Richtig');
    await expect(fb).toContainText('wird im MVP aber noch nicht automatisch geprüft');
    const { attempts } = await learnerData(page);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].submission?.imageRef).toMatch(/^data:image\/png;base64,/);
    expect(attempts[0].submission?.strokes?.length).toBeGreaterThanOrEqual(2);
    await expect(canvas).toBeVisible(); // Schreibfläche bleibt nach Abgabe sichtbar (gesperrt)
  });

  test('Handschrift: Zoom ändert die Darstellungsgröße, Striche bleiben erhalten', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-4');
    const canvas = page.locator('canvas');
    await drawWithMouse(page, canvas, [0.2, 0.2], [0.6, 0.6]);
    const w1 = (await canvas.boundingBox())!.width;
    await page.getByRole('button', { name: 'Vergrößern' }).click();
    await expect(page.getByText('150 %').or(page.getByText('125 %')).or(page.getByText('200 %'))).toBeVisible();
    const w2 = (await canvas.boundingBox())!.width;
    expect(w2).toBeGreaterThan(w1);
    expect(await inkPixels(page)).toBeGreaterThan(0);
    // Kein horizontales Scrollen der GANZEN Seite beim Zoom (nur der Container scrollt)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});

// ---------------------------------------------------------------- DoD 7
test('DoD 7 – 3 gestufte Hinweise, Rückfrage vor „Lösung anzeigen“, Feedback und Musterlösung', async ({ page }) => {
  await register(page);
  await openExercise(page, 'pyth-hypotenuse-1');
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toHaveCount(0); // vor Abgabe verborgen
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('button', { name: new RegExp(`Hinweis ${i} von 3`) }).click();
    await expect(page.getByText(`Hinweis ${i}:`)).toBeVisible();
  }
  const exhausted = page.getByRole('button', { name: 'Alle Hinweise genutzt' });
  await expect(exhausted).toBeDisabled();

  await page.getByRole('button', { name: 'Lösung anzeigen' }).click();
  await expect(page.getByText(/zählt diese Aufgabe nur noch 25 %/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toHaveCount(0); // erst nach Bestätigung
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await page.getByRole('button', { name: 'Lösung anzeigen' }).click();
  await page.getByRole('button', { name: 'Ja, Lösung zeigen' }).click();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();

  await answerInput(page).fill('15');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toContainText('Richtig');
  await expect(feedbackPanel(page)).toHaveClass(/emerald/);
  await expect(page.getByText(/zählt diese Abgabe 25 %, weil du die Lösung vorher angesehen hast/)).toBeVisible();
  const { attempts } = await learnerData(page);
  expect(attempts[0]).toMatchObject({ hintsUsed: 3, solutionViewed: true });

  // Navigation nach Abgabe
  await expect(page.getByRole('button', { name: 'Nochmal versuchen' })).toBeVisible();
  await page.getByRole('link', { name: 'Nächste Aufgabe →' }).click();
  await expect(page).toHaveURL(/pyth-hypotenuse-2$/);
  await page.getByRole('link', { name: 'Zurück zum Kapitel' }).click();
  await expect(page).toHaveURL(/chapters\/pyth-hypotenuse$/);
});

test('DoD 7 – falsche Antwort zeigt typische Fehler (aufklappbar) und Musterlösung', async ({ page }) => {
  await register(page);
  const fb = await solveTyped(page, 'pyth-hypotenuse-1', '21'); // 9 + 12 = 21: typischer Fehler „Seiten addiert“
  await expect(fb).toHaveClass(/red/);
  await expect(fb.getByText('Typische Fehler bei dieser Aufgabe')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();
});

// ---------------------------------------------------------------- DoD 8
test('DoD 8 – „Zuletzt bearbeitet“ und Verlauf mit Filter und Detailansicht inkl. Handschrift-Bild', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  await solveChoice(page, 'pyth-grundlagen-1', 'Die Seite gegenüber dem rechten Winkel');
  await solveTyped(page, 'quad-reinquadratisch-1', '7; -7');
  await openExercise(page, 'pyth-hypotenuse-4');
  await drawWithMouse(page, page.locator('canvas'), [0.2, 0.3], [0.7, 0.5]);
  await answerInput(page).fill('17');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toContainText('Richtig');

  await page.goto('/app');
  const recent = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Zuletzt bearbeitet' }) });
  await expect(recent.getByRole('listitem')).toHaveCount(3);
  await expect(recent.getByRole('listitem').first()).toContainText('Hypotenuse berechnen · Aufgabe 4');
  await recent.getByRole('link', { name: /Hypotenuse berechnen · Aufgabe 4/ }).click();
  await expect(page).toHaveURL(/\/app\/exercises\/pyth-hypotenuse-4$/);

  await page.goto('/app/history');
  const list = page.getByRole('list', { name: 'Abgaben' }).getByRole('listitem');
  await expect(list).toHaveCount(3);
  await page.getByRole('combobox').nth(0).selectOption({ label: 'Satz des Pythagoras' });
  await expect(list).toHaveCount(2);
  await page.getByRole('combobox').nth(1).selectOption({ label: '4. Hypotenuse berechnen' });
  await expect(list).toHaveCount(1);
  await list.first().getByRole('button').click();
  const detail = page.locator('section[aria-labelledby="detail-heading"]');
  await expect(detail).toContainText('Abgegeben am');
  await expect(detail).toContainText('17');
  const img = detail.getByRole('img', { name: 'Dein handschriftlicher Rechenweg' });
  await expect(img).toBeVisible();
  expect(await img.getAttribute('src')).toMatch(/^data:image\/png/);
  expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  await expect(detail.getByRole('heading', { name: 'Musterlösung' })).toBeVisible();
  await expect(detail).toContainText('Genutzte Hilfen');

  // Filter steht in der URL und übersteht einen Reload
  await page.reload();
  await expect(page.locator('section[aria-labelledby="detail-heading"]')).toBeVisible();
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await expect(list).toHaveCount(3);
});

// ---------------------------------------------------------------- DoD 9
test('DoD 9 – Aufgaben in 2 Kapiteln: Themenfortschritt und Empfehlung ändern sich', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  const rec = page.locator('section[aria-labelledby="next-heading"]');
  await expect(rec).toContainText('Grundlagen und Definition');
  await expect(rec).toContainText('Als Nächstes dran');

  // Kapitel 1 vollständig richtig
  await solveChoice(page, 'pyth-grundlagen-1', 'Die Seite gegenüber dem rechten Winkel');
  await solveChoice(page, 'pyth-grundlagen-2', /^\s*a\)/);
  await solveTyped(page, 'pyth-grundlagen-3', '100');
  await solveTyped(page, 'pyth-grundlagen-4', 'PR');
  // Kapitel 2: eine Aufgabe
  await solveTyped(page, 'pyth-erkennen-2', '90');

  await page.goto('/app/topics/pythagoras');
  const chapters = page.locator('main ol > li');
  await expect(chapters.nth(0)).toContainText('Sicher beherrscht');
  await expect(chapters.nth(0)).toContainText('4 gelöst · 0 offen');
  await expect(chapters.nth(1)).toContainText('In Bearbeitung');
  await expect(chapters.nth(1)).toContainText('1 gelöst · 3 offen');
  await expect(chapters.nth(1)).toContainText('Als Nächstes empfohlen');
  const topicBar = page.locator('header').getByRole('progressbar');
  expect(Number(await topicBar.getAttribute('aria-valuenow'))).toBeGreaterThan(0);

  await page.goto('/app');
  await expect(rec).toContainText('Rechtwinklige Dreiecke erkennen');
  await expect(rec).toContainText('Hier weitermachen');
  const tile = topicTile(page, 'Satz des Pythagoras');
  await expect(tile).toContainText('In Bearbeitung');
  expect(Number(await tile.getByRole('progressbar').getAttribute('aria-valuenow'))).toBe(Math.round((5 / 33) * 100));
});

// ---------------------------------------------------------------- DoD 10
test('DoD 10 – Score-Erklärung zeigt greifende Deckel; ohne Typabdeckung höchstens 79', async ({ page }) => {
  await register(page);
  // Herleitung: MC(1), Zahl(1), Gleichung(3), Handschrift(2). Ohne MC wäre der Rohwert 80,5 ⇒ Deckel 79 muss greifen.
  await solveTyped(page, 'pyth-herleitung-2', '169');
  await solveTyped(page, 'pyth-herleitung-3', 'a^2+b^2');
  await openExercise(page, 'pyth-herleitung-4');
  await drawWithMouse(page, page.locator('canvas'), [0.2, 0.3], [0.7, 0.5]);
  await answerInput(page).fill('25');
  await submitButton(page).click();
  await expect(feedbackPanel(page)).toContainText('Richtig');

  await page.goto('/app/topics/pythagoras/chapters/pyth-herleitung');
  const stand = page.locator('section[aria-labelledby="score-heading"]');
  const score = await readScore(scoreBadges(stand).first());
  expect(score).toBeLessThanOrEqual(79);
  expect(score).toBe(79); // Deckel greift tatsächlich (nicht nur zufällig darunter)
  await stand.getByText('Wie entsteht mein Score?').click();
  await expect(stand).toContainText('Löse jeden Aufgabentyp dieses Kapitels mindestens einmal (max. 79 bis dahin).');
  await expect(stand).toContainText('Löse eine Aufgabe an einem späteren Tag erneut richtig (max. 94 bis dahin).');
  await expect(stand).not.toContainText('höchsten Schwierigkeitsstufe'); // schwere Gleichung ist gelöst
  await expect(stand).toContainText('In Bearbeitung'); // nicht „Sicher beherrscht“ ohne Typabdeckung

  // Jetzt den fehlenden Typ lösen ⇒ Deckel 79 fällt weg
  await solveChoice(page, 'pyth-herleitung-1', 'Der Flächeninhalt eines Quadrats mit Seite');
  await page.goto('/app/topics/pythagoras/chapters/pyth-herleitung');
  expect(await readScore(scoreBadges(stand).first())).toBe(94);
});

// ---------------------------------------------------------------- Persistenz & Fehlerfall
test.describe('Persistenz und Speicherfehler', () => {
  test('Daten überstehen Reload und Ab-/Anmelden', async ({ page }) => {
    const user = await register(page);
    await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
    await solveTyped(page, 'pyth-hypotenuse-1', '15');
    await page.goto('/app');
    await page.reload();
    await expect(topicTile(page, 'Satz des Pythagoras')).toBeVisible();
    await expect(page.getByText('Du hast 1 Thema aktiv und 1 Aufgabe bearbeitet.')).toBeVisible();
    await page.getByRole('button', { name: 'Abmelden' }).click();
    await page.getByLabel('E-Mail').fill(user.email);
    await page.getByLabel('Passwort').fill(user.password);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(topicTile(page, 'Satz des Pythagoras')).toBeVisible();
  });

  test.beforeEach(async ({ page }) => {
    // Speicherfehler gezielt für den Lerndaten-Schlüssel simulieren (Entwürfe dürfen weiter gespeichert werden).
    await page.addInitScript(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if ((window as any).__qaFailLearner && String(k).startsWith('mathmvp:v1:learner:')) {
          throw new DOMException('Simulierter voller Speicher', 'QuotaExceededError');
        }
        return orig.call(this, k, v);
      };
    });
  });

  test('Speicherfehler → rote Meldung, Entwurf; nach Reload „Nicht gespeicherte Abgabe gefunden“ + erneut senden', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-1');
    await page.getByRole('button', { name: /Hinweis 1 von 3/ }).click();
    await answerInput(page).fill('15');
    await page.evaluate(() => ((window as any).__qaFailLearner = true));
    await submitButton(page).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Speichern fehlgeschlagen' });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveClass(/red/);
    await expect(alert).toContainText('Der lokale Speicher des Browsers ist voll');
    await expect(alert).toContainText('als Entwurf auf diesem Gerät gesichert');
    await alert.getByRole('button', { name: 'Erneut versuchen' }).click(); // schlägt weiterhin fehl
    await expect(alert).toBeVisible();
    let d = await learnerData(page);
    expect(d.attempts).toHaveLength(0);
    expect(d.draftKeys).toHaveLength(1);

    await page.reload(); // Flag ist weg ⇒ Speichern funktioniert wieder
    const restore = page.getByRole('alert').filter({ hasText: 'Nicht gespeicherte Abgabe gefunden' });
    await expect(restore).toBeVisible();
    await expect(answerInput(page)).toHaveValue('15');
    await expect(page.getByText('Hinweis 1:')).toBeVisible(); // genutzter Hinweis wiederhergestellt
    await restore.getByRole('button', { name: 'Jetzt erneut senden' }).click();
    await expect(feedbackPanel(page)).toContainText('Richtig');
    d = await learnerData(page);
    expect(d.attempts).toHaveLength(1);
    expect(d.attempts[0].hintsUsed).toBe(1);
    expect(d.draftKeys).toHaveLength(0);
  });

  test('Speicherfehler → „Erneut versuchen“ ohne Reload klappt, sobald Speicher wieder geht; kein Duplikat', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-4');
    await drawWithMouse(page, page.locator('canvas'), [0.2, 0.3], [0.7, 0.5]);
    await answerInput(page).fill('17');
    await page.evaluate(() => ((window as any).__qaFailLearner = true));
    await submitButton(page).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Speichern fehlgeschlagen' })).toBeVisible();
    await page.evaluate(() => ((window as any).__qaFailLearner = false));
    await page.getByRole('button', { name: 'Erneut versuchen' }).click();
    await expect(feedbackPanel(page)).toContainText('Richtig');
    const d = await learnerData(page);
    expect(d.attempts).toHaveLength(1);
    expect(d.attempts[0].submission?.imageRef).toMatch(/^data:image\/png/);
    expect(d.draftKeys).toHaveLength(0);
  });

  test('Entwurf verwerfen setzt das Formular zurück', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-1');
    await answerInput(page).fill('15');
    await page.evaluate(() => ((window as any).__qaFailLearner = true));
    await submitButton(page).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Speichern fehlgeschlagen' })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Verwerfen' }).click();
    await expect(answerInput(page)).toHaveValue('');
    expect((await learnerData(page)).draftKeys).toHaveLength(0);
  });
});

// ---------------------------------------------------------------- Robustheit
test.describe('Robustheit: unbekannte URLs und geschützte Routen', () => {
  test('Geschützte Route ohne Login → /login, danach zurück zur Zielseite', async ({ page }) => {
    await page.goto('/');
    const user = await register(page);
    await page.getByRole('button', { name: 'Abmelden' }).click();
    await page.goto('/app/history');
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('E-Mail').fill(user.email);
    await page.getByLabel('Passwort').fill(user.password);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page).toHaveURL(/\/app\/history$/);
  });

  test('Direktaufruf einer Aufgabe ohne Login → /login', async ({ page }) => {
    await page.goto('/app/exercises/pyth-hypotenuse-1');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Unbekannte Aufgabe, Thema, Kapitel und Route zeigen sinnvolle Seiten', async ({ page }) => {
    await register(page);
    await page.goto('/app/exercises/gibt-es-nicht');
    await expect(page.getByText('Diese Aufgabe gibt es nicht.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Zum Dashboard' })).toBeVisible();
    await page.goto('/app/topics/gibt-es-nicht');
    await expect(page.getByText('Dieses Thema gibt es nicht.')).toBeVisible();
    await page.goto('/app/topics/pythagoras/chapters/gibt-es-nicht');
    await expect(page.getByText('Dieses Kapitel gibt es nicht.')).toBeVisible();
    await page.goto('/irgendwas/ganz/anderes');
    await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
    await page.goto('/app/gibt-es-nicht');
    await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
  });

  test('BUG-07 (Regression): Kapitel unter fremdem Thema → „nicht gefunden“; korrekte URL funktioniert weiter', async ({ page }) => {
    await register(page);
    await page.goto('/app/topics/prozentrechnung/chapters/pyth-grundlagen');
    await expect(page.getByText('Dieses Kapitel gibt es nicht.')).toBeVisible({ timeout: 2000 });
    await expect(page.getByRole('link', { name: '← Zum Thema' })).toHaveCount(0);

    // Gegenprobe: dasselbe Kapitel unter seinem eigenen Thema
    await page.goto('/app/topics/pythagoras/chapters/pyth-grundlagen');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Dieses Kapitel gibt es nicht.')).toHaveCount(0);
    await expect(page.getByText('Lernziel:')).toBeVisible();
    const back = page.getByRole('link', { name: '← Zum Thema' });
    await expect(back).toHaveAttribute('href', '/app/topics/pythagoras');

    // Client-seitige Navigation Thema → Kapitel (Effekt hängt jetzt auch von topicId ab)
    await back.click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/);
    await page.getByRole('link', { name: /Grundlagen/ }).first().click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras\/chapters\/pyth-grundlagen$/);
    await expect(page.getByText('Lernziel:')).toBeVisible();
  });
});
