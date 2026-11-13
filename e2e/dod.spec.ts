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
  consentCheckbox,
  drawWithMouse,
  expect,
  feedbackPanel,
  inkPixels,
  learnerData,
  openExercise,
  readScore,
  register,
  scoreBadges,
  searchBox,
  searchOption,
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
    await consentCheckbox(page).check();
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

  test('„Mit Google fortfahren“ meldet im lokalen Modus den Demo-Nutzer an (Einwilligung beim ersten Mal)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Mit Google fortfahren' }).click();
    await expect(page).toHaveURL(/\/app$/);
    // Google liefert keine Einwilligung mit ⇒ Einwilligungsseite vor dem Dashboard
    await expect(page.getByRole('heading', { name: 'Bevor es losgeht' })).toBeVisible();
    const accept = page.getByRole('button', { name: 'Einverstanden' });
    await expect(accept).toBeDisabled();
    await consentCheckbox(page).check();
    await accept.click();
    await expect(page.getByRole('heading', { name: 'Hallo Demo (Google)!' })).toBeVisible();
  });

  test('Registrierung ohne Einwilligung ist nicht möglich', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Name').fill('Ohne');
    await page.getByLabel('E-Mail').fill('ohne@example.test');
    await page.getByLabel('Passwort').fill('Geheim123!');
    await page.getByRole('button', { name: 'Registrieren' }).click();
    await expect(page).toHaveURL(/\/register$/);
    expect(await consentCheckbox(page).evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  });
});

// ---------------------------------------------------------------- DoD 2 + 3
test.describe('DoD 2+3 – Thema über Texteingabe finden und zuordnen', () => {
  test('„Ich möchte den Satz des Pythagoras verstehen.“ → Pythagoras-Kachel mit allen Angaben', async ({ page }) => {
    await register(page);
    await expect(page.getByText('Noch keine Themen.')).toBeVisible(); // Leerzustand
    await searchBox(page).fill('Ich möchte den Satz des Pythagoras verstehen.');
    const cand = searchOption(page, 'Satz des Pythagoras');
    await expect(cand).toContainText('Klasse 9 · Geometrie');
    await cand.click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/); // Thema wird hinzugefügt und geöffnet

    await page.goto('/app');
    const tile = topicTile(page, 'Satz des Pythagoras');
    await expect(tile).toBeVisible();
    await expect(tile).toContainText('Klasse 9 · Geometrie'); // Klassenstufe + Themengebiet (NRW G9)
    await expect(scoreBadges(tile)).toHaveCount(1); // Verständnis-Score
    expect(await readScore(scoreBadges(tile).first())).toBe(0);
    await expect(tile.getByRole('progressbar')).toHaveCount(0); // Fokus auf Verständnis, kein Bearbeitet-Balken
    await tile.getByRole('link', { name: 'Thema öffnen' }).click(); // Öffnen-Button
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/);
  });

  test('Suche beim Tippen: Wortanfang genügt, Pfeiltasten + Enter, Esc schließt', async ({ page }) => {
    await register(page);
    await searchBox(page).fill('pyth');
    await expect(searchOption(page, 'Satz des Pythagoras')).toBeVisible();
    await searchBox(page).press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await searchBox(page).fill('Prozent');
    await expect(searchOption(page, 'Prozentrechnung')).toHaveAttribute('aria-selected', 'true');
    await searchBox(page).press('Enter');
    await expect(page).toHaveURL(/\/app\/topics\/prozentrechnung/);
  });

  test('„Gitarre spielen“ → kein Match + „Alle Themen zeigen“', async ({ page }) => {
    await register(page);
    await searchBox(page).fill('Gitarre spielen');
    await expect(page.getByText(/kein passendes Thema im Lehrplan gefunden/)).toBeVisible();
    await page.getByRole('button', { name: 'Alle Themen zeigen' }).click();
    await expect(page.getByRole('option')).toHaveCount(7); // alle Themen der Wissensbasis
    // Es wurde nichts ungefragt angelegt
    expect((await learnerData(page)).activeTopics).toHaveLength(0);
  });

  for (const [query, title, meta] of [
    ['quadratische Gleichungen lösen', 'Quadratische Gleichungen', 'Klasse 9 · Algebra'],
    ['Ich muss mich auf eine Mathearbeit zu Prozentrechnung vorbereiten.', 'Prozentrechnung', 'Klasse 6–7 · Zahlen und Größen'],
    ['Mathearbeit Prozentrechnung', 'Prozentrechnung', 'Klasse 6–7 · Zahlen und Größen'],
  ] as const) {
    test(`„${query}“ → ${title}`, async ({ page }) => {
      await register(page);
      await searchBox(page).fill(query);
      await searchOption(page, title).click();
      await expect(page).toHaveURL(/\/app\/topics\//);
      await page.goto('/app');
      await expect(topicTile(page, title)).toContainText(meta);
    });
  }

  test('„Kathete berechnen“ führt direkt zum passenden Kapitel', async ({ page }) => {
    await register(page);
    await searchBox(page).fill('Kathete berechnen');
    const cand = searchOption(page, 'Satz des Pythagoras');
    await expect(cand).toContainText('Kapitel „Kathete berechnen“');
    await cand.click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras\/chapters\/pyth-kathete$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Kathete berechnen' })).toBeVisible();
  });

  test('Bereits aktives Thema wird nicht doppelt angelegt; leere Eingabe zeigt nichts; HTML wird nicht ausgeführt', async ({ page }) => {
    await register(page);
    await searchBox(page).fill('   ');
    await expect(page.getByRole('listbox')).toHaveCount(0);

    let dialog = false;
    page.on('dialog', (d) => {
      dialog = true;
      void d.dismiss();
    });
    await searchBox(page).fill('<img src=x onerror=alert(1)><script>alert(2)</script>');
    await expect(page.getByText(/kein passendes Thema/)).toBeVisible();
    expect(dialog).toBe(false);

    await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
    await searchBox(page).fill('Pythagoras');
    await expect(searchOption(page, 'Satz des Pythagoras')).toContainText('Schon aktiv');
    await searchOption(page, 'Satz des Pythagoras').click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/);
    expect((await learnerData(page)).activeTopics).toHaveLength(1);
  });
});

// ---------------------------------------------------------------- D-11 (Abnahme-Checkliste Design/UX)
test('D-11: neuer Nutzer erreicht vom Dashboard den Start des ersten Kapitels in ≤ 3 Tipps', async ({ page }) => {
  await register(page); // landet auf dem Dashboard, ohne Themen
  let taps = 0;
  const tap = async (loc: ReturnType<typeof page.getByRole>) => {
    await loc.click();
    taps++;
  };
  // Tippen ins Suchfeld, dann 1) Treffer, 2) „Thema starten“ – das Kapitel führt durch den Lernpfad zur ersten Aufgabe
  await searchBox(page).fill('Lineare Funktionen');
  await tap(searchOption(page, 'Lineare Funktionen'));
  await page.waitForURL(/\/app\/topics\//);
  if (!page.url().includes('/chapters/')) await tap(page.getByRole('link', { name: 'Thema starten' }));
  await expect(page).toHaveURL(/\/app\/topics\/lineare-funktionen\/chapters\//);
  expect(taps).toBeLessThanOrEqual(3);
});

test('D-11b: Aufgabenseite hat genau eine Hauptaktion', async ({ page }) => {
  await register(page);
  await page.goto('/app/exercises/lf-fb-1');
  await expect(page.getByRole('button', { name: 'Abgeben' })).toBeVisible();
  // Hauptaktion je Bildschirm ist markiert (D-09-Vorbereitung): auf der Aufgabe genau eine
  await expect(page.locator('[data-variant="primary"]')).toHaveCount(1);
});

// ---------------------------------------------------------------- DoD 4
test('DoD 4 – Themenseite: vorgeschlagener Weg im Vordergrund, darunter alle 8 Kapitel dezent', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  await page.goto('/app/topics/pythagoras');
  await expect(page.locator('#next-chapter-heading')).toContainText('Grundlagen und Definition');
  await expect(page.getByRole('link', { name: 'Thema starten' })).toBeVisible();
  const list = page.getByRole('list', { name: 'Kapitel' });
  await expect(list).toBeVisible(); // immer ausgeklappt
  const chapters = list.getByRole('listitem');
  await expect(chapters).toHaveCount(8);
  for (let i = 0; i < 8; i++) {
    const c = chapters.nth(i);
    await expect(scoreBadges(c)).toHaveCount(1); // Status-Ring
    await expect(c.getByRole('progressbar')).toHaveCount(0); // kein Balken
    await expect(c).not.toContainText('bearbeitet');
  }
  await expect(chapters.first().getByRole('link')).toHaveAttribute('aria-label', /Grundlagen und Definition \(empfohlen\)/);
});

// ---------------------------------------------------------------- DoD 5
test('DoD 5 – Kapitel als Lernpfad: Einstieg → Erklärung (KaTeX, Beispiel schrittweise) → Formel-Check; Mehr-Bereich', async ({ page }) => {
  await register(page);
  await page.goto('/app/topics/pythagoras/chapters/pyth-hypotenuse');
  await expect(page.getByRole('heading', { level: 1, name: 'Hypotenuse berechnen' })).toBeVisible();
  await expect(page.getByText('Schritt 1 von 6')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Einstieg' })).toBeVisible();
  await expect(page.getByText('Das lernst du:')).toBeVisible();
  await expect(page.getByText(/Video folgt/).first()).toBeVisible();
  // Genau eine Hauptaktion
  await expect(page.locator('main [data-variant="primary"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Weiter zur Erklärung' }).click();
  await expect(page.getByText('Schritt 2 von 6')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Erklärung' })).toBeVisible();
  expect(await page.locator('.katex').count()).toBeGreaterThan(0);
  expect(await page.locator('.katex-error').count()).toBe(0);
  while (await page.getByRole('button', { name: 'Nächster Schritt' }).isVisible()) await page.getByRole('button', { name: 'Nächster Schritt' }).click();

  await page.getByRole('button', { name: 'Weiter zu Begriffen & Formeln' }).click();
  await expect(page).toHaveURL(/\/app\/exercises\/pyth-hypotenuse-def-1$/); // Definitionen zuerst, dann der Formel-Check

  // Zurück im Kapitel: Einstieg/Erklärung sind gemerkt, es geht mit dem Üben weiter
  await page.goto('/app/topics/pythagoras/chapters/pyth-hypotenuse');
  await expect(page.getByRole('heading', { level: 2, name: 'Einstieg' })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'Begriffe & Formeln' })).toBeVisible();
  await expect(page.getByText('Mehr zu diesem Kapitel')).toHaveCount(0); // keine Zusatzinfos mehr
});

test('Lernpfad: Einstieg überspringen führt direkt zur ersten Aufgabe', async ({ page }) => {
  await register(page);
  await page.goto('/app/topics/lineare-funktionen/chapters/lf-steigung');
  await page.getByRole('button', { name: 'Kenne ich schon – überspringen' }).click();
  await expect(page).toHaveURL(/\/app\/exercises\/lf-steigung-def-1$/); // erste Aufgabe: Definition („Was bedeutet …?“)
  // Aufgabenseite zeigt statt der Schrittleiste das Verständnis im Kapitel
  await expect(page.getByRole('progressbar', { name: /Verständnis im Kapitel/ })).toBeVisible();
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
      await page.getByRole('button', { name: 'Weiter zur Erklärung' }).click();
      await expect(page.getByRole('heading', { level: 2, name: 'Erklärung' })).toBeVisible();
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

  test('Aufgabe: oben nur ein Zurück-Pfeil mit dem Kapitelnamen, er führt zum Kapitel', async ({ page }) => {
    await register(page);
    for (const [id, title, url] of [
      ['pyth-hypotenuse-3', 'Hypotenuse berechnen', '/app/topics/pythagoras/chapters/pyth-hypotenuse'],
      ['quad-reinquadratisch-1', 'Reinquadratische Gleichungen', '/app/topics/quadratische-gleichungen/chapters/quad-reinquadratisch'],
    ] as const) {
      await openExercise(page, id);
      const back = page.getByRole('link', { name: title, exact: true });
      await expect(back, id).toHaveAttribute('href', url);
    }
  });

  test('Überspringen verwirft genutzte Hinweise: beim nächsten Mal beginnt die Aufgabe von vorn', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-3');
    await page.getByRole('button', { name: /Hinweis 1 von 3/ }).click();
    await expect(page.getByText('Hinweis 1:')).toBeVisible();
    await page.reload(); // Neuladen behält die Hilfen (Punktabzug bleibt)
    await expect(page.getByText('Hinweis 1:')).toBeVisible();
    await page.getByRole('link', { name: 'Aufgabe überspringen' }).click();
    await expect(page).not.toHaveURL(/pyth-hypotenuse-3$/);
    await openExercise(page, 'pyth-hypotenuse-3');
    await expect(page.getByText('Hinweis 1:')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Hinweis 1 von 3/ })).toBeVisible();
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
    await expect(fb).toContainText('nicht automatisch prüfen');
    const { attempts } = await learnerData(page);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].submission?.imageRef).toMatch(/^data:image\/png;base64,/);
    expect(attempts[0].submission?.strokes?.length).toBeGreaterThanOrEqual(2);
    await expect(canvas).toBeVisible(); // Schreibfläche bleibt nach Abgabe sichtbar (gesperrt)
  });

  test('Handschrift: Zoom vergrößert das Papier im Ausschnitt, Striche bleiben erhalten, Papier ist scrollbar', async ({ page }) => {
    await register(page);
    await openExercise(page, 'pyth-hypotenuse-4');
    const canvas = page.locator('canvas');
    await drawWithMouse(page, canvas, [0.2, 0.5], [0.6, 0.8]);
    const ink1 = await inkPixels(page);
    await page.getByRole('button', { name: 'Vergrößern' }).click();
    await expect(page.getByText('150 %')).toBeVisible();
    await expect.poll(() => inkPixels(page), { message: 'Striche werden größer gezeichnet' }).toBeGreaterThan(ink1);
    await page.getByRole('button', { name: 'Verkleinern' }).click();
    await page.getByRole('button', { name: 'Verkleinern' }).click();
    await expect(page.getByText('75 %')).toBeVisible();
    // Das Papier reicht über den Ausschnitt hinaus (nach unten und zur Seite scrollbar)
    const scroll = await canvas.evaluate((c) => {
      const s = c.previousElementSibling as HTMLElement;
      return { down: s.scrollHeight > s.clientHeight, side: s.scrollWidth > s.clientWidth };
    });
    expect(scroll).toEqual({ down: true, side: true });
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
  // Danach gibt es nur noch „Lösung anzeigen“ (immer genau eine Hilfe-Schaltfläche)
  await expect(page.getByRole('button', { name: /Hinweis \d von 3/ })).toHaveCount(0);

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
  const { attempts } = await learnerData(page);
  expect(attempts[0]).toMatchObject({ hintsUsed: 3, solutionViewed: true });

  // Navigation nach Abgabe
  await expect(page.getByRole('button', { name: 'Nochmal versuchen' })).toBeVisible();
  // „Nächste Aufgabe“ wählt adaptiv eine andere Aufgabe aus demselben Kapitel
  await page.getByRole('link', { name: 'Weiter', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/exercises\/pyth-(?!hypotenuse-1$)[\w-]+$/); // nächste Aufgabe im Lernpfad
  await page.getByRole('link', { name: 'Hypotenuse berechnen', exact: true }).click();
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
test('DoD 9 – Aufgaben in 2 Kapiteln: Fortschritt in Themenseite und Dashboard', async ({ page }) => {
  await register(page);
  await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
  const rec = page.locator('section[aria-labelledby="next-heading"]');
  await expect(rec).toContainText('Grundlagen und Definition');

  // Kapitel 1: vier Aufgaben richtig (bei einem Pool von über 60 noch nicht „sicher“)
  await solveChoice(page, 'pyth-grundlagen-1', 'Die Seite gegenüber dem rechten Winkel');
  await solveChoice(page, 'pyth-grundlagen-2', /^\s*a\)/);
  await solveTyped(page, 'pyth-grundlagen-3', '100');
  await solveTyped(page, 'pyth-grundlagen-4', 'PR');
  // Kapitel 2: eine Aufgabe
  await solveTyped(page, 'pyth-erkennen-2', '90');

  await page.goto('/app/topics/pythagoras');
  await expect(page.locator('#next-chapter-heading')).toContainText('Grundlagen und Definition');
  await expect(page.getByRole('link', { name: 'Weiter lernen' })).toBeVisible(); // begonnen ⇒ „Weiter lernen“ statt „Thema starten“
  const chapters = page.getByRole('list', { name: 'Kapitel' }).getByRole('listitem');
  await expect(chapters.nth(0).getByRole('link')).toHaveAttribute('aria-label', /empfohlen/);
  expect(await readScore(scoreBadges(chapters.nth(0)).first())).toBeGreaterThan(0);
  expect(await readScore(scoreBadges(chapters.nth(1)).first())).toBeGreaterThan(0);
  expect(await readScore(scoreBadges(chapters.nth(2)).first())).toBe(0);
  expect(await readScore(scoreBadges(page.locator('main header')).first())).toBeGreaterThan(0);

  await page.goto('/app');
  await expect(rec).toContainText('Grundlagen und Definition');
  await expect(rec.getByRole('heading')).toHaveText('Weiter, wo du aufgehört hast');
  await expect(rec.getByRole('link')).toHaveCount(1); // genau ein Button
  const tile = topicTile(page, 'Satz des Pythagoras');
  expect(await readScore(scoreBadges(tile).first())).toBeGreaterThan(0);
  await expect(tile).toContainText(/gerade eben|vor \d+ Minute/); // zuletzt geübt, relativ
});

// ---------------------------------------------------------------- DoD 10
// ---------------------------------------------------------------- Persistenz & Fehlerfall
test.describe('Persistenz und Speicherfehler', () => {
  test('Daten überstehen Reload und Ab-/Anmelden', async ({ page }) => {
    const user = await register(page);
    await addTopic(page, 'Pythagoras', 'Satz des Pythagoras');
    await solveTyped(page, 'pyth-hypotenuse-1', '15');
    await page.goto('/app');
    await page.reload();
    await expect(topicTile(page, 'Satz des Pythagoras')).toBeVisible();
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
    await expect(page.getByRole('link', { name: /^← / })).toHaveCount(0);

    // Gegenprobe: dasselbe Kapitel unter seinem eigenen Thema
    await page.goto('/app/topics/pythagoras/chapters/pyth-grundlagen');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Dieses Kapitel gibt es nicht.')).toHaveCount(0);
    await expect(page.getByText('Das lernst du:')).toBeVisible();
    const back = page.getByRole('link', { name: '← Satz des Pythagoras' });
    await expect(back).toHaveAttribute('href', '/app/topics/pythagoras');

    // Client-seitige Navigation Thema → Kapitel (Effekt hängt jetzt auch von topicId ab)
    await back.click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras$/);
    await page.getByRole('link', { name: 'Thema starten' }).click();
    await expect(page).toHaveURL(/\/app\/topics\/pythagoras\/chapters\/pyth-grundlagen$/);
    await expect(page.getByText('Das lernst du:')).toBeVisible();
  });
});
