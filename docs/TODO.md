# Offene Aufgaben

Erledigte Punkte einfach löschen (der Verlauf steht in Git), neue Punkte in der passenden Gruppe ergänzen.
Reihenfolge innerhalb einer Gruppe = empfohlene Reihenfolge.

Legende: 🔴 blockiert den Start mit echten Schülern · 🟡 vor dem Start dringend empfohlen · ⚪ später

**Eckdaten:** Supabase-Projekt `supabase-mmm` (`bwuiseqburexduujykdr`, Frankfurt, Free-Plan), verbunden mit Vercel Production + Preview · App: `https://math-tutor-rosy.vercel.app` · Jeder Push auf `main` mit Änderungen unter `supabase/` wird per GitHub-Workflow *Supabase deploy* automatisch eingespielt (Details: [README „Go-Live“](../README.md#go-live-supabase--vercel)).

---

## 1. Anmeldung (Supabase → Authentication)

- [ ] ⚪ [Redirect URL](https://supabase.com/dashboard/project/bwuiseqburexduujykdr/auth/url-configuration) für Vercel-Previews ergänzen, nur mit projektbezogenem Muster (z. B. `https://math-tutor-*-<vercel-team>.vercel.app/**`), nicht `https://*.vercel.app/**` – das würde jede fremde vercel.app-Seite als Ziel für Login-Links erlauben. Bei eigener Domain Site URL und Redirect URLs umstellen
- [ ] 🔴 E-Mail-Bestätigung an, Passwort mindestens 8 Zeichen mit Buchstaben + Ziffern (im Dashboard; **nicht** `config push`, das würde die localhost-URLs aus `supabase/config.toml` in die Produktion schreiben)
- [ ] 🔴 Eigener SMTP-Server (EU-Anbieter); der eingebaute Versand ist nur zum Testen und stark begrenzt
- [ ] 🟡 E-Mail-Vorlagen (Bestätigung, Passwort zurücksetzen) auf Deutsch übersetzen, Absendername = Produktname
- [ ] 🟡 Google-Anmeldung: OAuth-Client in der Google Cloud Console anlegen, Client-ID/Secret in Supabase eintragen, Zustimmungsbildschirm (App-Name, Datenschutz-Link) ausfüllen

## 2. Rechtliches

Entwürfe für Impressum, Datenschutzerklärung, Nutzungsbedingungen und Kontakt stehen in `src/pages/legal/`, die Betreiberangaben zentral in `OPERATOR` (`src/config/legal.ts`). Platzhalter stehen in den Texten in [eckigen Klammern].

- [ ] 🔴 Platzhalter in `OPERATOR` (`src/config/legal.ts`) durch echte Angaben ersetzen: Name/Firma, Rechtsform, Anschrift, Telefon, Kontakt-E-Mail (`kontakt@example.com`), Datenschutz-E-Mail (`datenschutz@example.com`), USt-IdNr. und Handelsregister (leer lassen, falls nicht vorhanden), Verantwortlicher nach § 18 MStV
- [ ] 🔴 Platzhalter in der Datenschutzerklärung (`src/pages/legal/Datenschutz.tsx`): Speicherdauer der Vercel-Logs, Name/Sitz des E-Mail-Anbieters (nach SMTP-Einrichtung), Löschfrist inaktiver Konten (hängt an „Speicherfristen“ unten), Aufbewahrung der Sicherungskopien (hängt an Supabase Pro), zuständige Aufsichtsbehörde (je nach Bundesland des Betreibers); Anschrift von Vercel prüfen
- [ ] 🔴 Platzhalter in den Nutzungsbedingungen (`src/pages/legal/Nutzungsbedingungen.tsx`): Haftungsregelung für Abos
- [ ] 🔴 Alle Rechtstexte rechtlich prüfen lassen (Schwerpunkt: Nutzer unter 16, Haftung, Abo-Bedingungen); danach `LEGAL_DRAFT = false` in `src/config/legal.ts` (blendet den Entwurfshinweis aus)
- [ ] ⚪ Vor Einführung der Abos: Nutzungsbedingungen um Preise, Laufzeit, Kündigung (Kündigungsbutton nach § 312k BGB) und Widerrufsbelehrung ergänzen; Datenschutzerklärung um Stripe ergänzen; `CONSENT_VERSION` hochzählen
- [ ] 🔴 AV-Verträge (Auftragsverarbeitung, Art. 28 DSGVO; englisch *DPA*) abschließen. Pflicht für jeden Dienstleister, der personenbezogene Daten in unserem Auftrag verarbeitet; ohne Vertrag ist schon das Speichern der Schülerdaten dort unzulässig. Die Anbieter haben fertige Verträge, die nur abgeschlossen und abgelegt werden müssen. Alle unterschriebenen PDFs gesammelt aufbewahren (nicht im Repo).
  - **Supabase** (Datenbank, Anmeldung, Handschrift-Bilder): Dashboard → *Organization Settings → Legal Documents* → „Data Processing Addendum“ anfordern, digital unterschreiben, PDF ablegen
  - **Vercel** (Hosting): Das DPA ([vercel.com/legal/dpa](https://vercel.com/legal/dpa)) ist Teil der Nutzungsbedingungen und gilt automatisch. Lesen, als PDF ablegen und prüfen, ob es auch für den Hobby-Plan gilt (sonst mit dem Wechsel zu Pro erledigt)
  - **Google-Anmeldung**: kein AV-Vertrag nötig (Google ist eigenständig verantwortlich; so steht es auch in der Datenschutzerklärung)
  - **Später**: für jeden neuen Dienstleister ebenfalls, also für den SMTP-Anbieter, Stripe, Fehler-Monitoring, Video-Hosting und den KI-Anbieter – jeweils *vor* dem Einschalten
- [ ] 🟡 Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO) anlegen: eine Tabelle, welche Daten zu welchem Zweck, bei welchem Dienstleister, auf welcher Rechtsgrundlage und wie lange verarbeitet werden. Lässt sich größtenteils aus der Datenschutzerklärung ableiten; bei jedem neuen Dienst mit aktualisieren
- [ ] 🔴 Einwilligung Minderjähriger rechtlich prüfen: Derzeit bestätigt das Kind selbst „Eltern sind einverstanden“ (Art. 8 DSGVO, unter 16). Reicht das, oder braucht es eine verifizierte Elterneinwilligung?
- [ ] 🟡 Speicherfristen festlegen (z. B. inaktive Konten nach X Monaten löschen) und ggf. als geplanten Job umsetzen
- [ ] ⚪ Bei jeder wesentlichen Änderung der Texte `CONSENT_VERSION` in `src/config/legal.ts` hochzählen (alle Nutzer werden erneut gefragt)

## 3. Vor dem Start mit echten Schülern

- [ ] 🟡 Abnahme auf der Produktions-URL: Registrieren (Bestätigungs-Mail), Google-Login, Aufgabe mit Hinweis + Handschrift abgeben, Verlauf mit Bild, Passwort zurücksetzen, Datenexport, Konto löschen; außerdem prüfen, dass die Pool-Kapitel alle Aufgaben laden (≈ 2500 Aufgaben; unter „Mehr zu diesem Kapitel“ stehen 60–90 Aufgaben pro Kapitel) und jedes neue Antwortformat (Punkt, Funktionsgleichung, π) einmal abgeben
- [ ] 🟡 Getrenntes Staging: zweites Supabase-Projekt nur für *Preview*; das jetzige Projekt nur noch für *Production* (heute teilen sich Preview und Production eine Datenbank)
- [ ] 🟡 Supabase Pro (tägliche Backups, kein Pausieren nach Inaktivität)
- [ ] 🟡 Vercel Pro oder Cloudflare Pages, sobald das Produkt kommerziell ist (Hobby ist nur nichtkommerziell erlaubt)
- [ ] 🟡 Fehler-Monitoring im Frontend und für die Edge Functions (Anbieter mit EU-Hosting prüfen)
- [ ] 🟡 Test auf echtem iPad: Safari/WebKit und Apple Pencil (bisher nur Chromium mit iPad-Profil getestet)
- [ ] ⚪ Ablaufdatum des Supabase-Tokens (GitHub-Secret `SUPABASE_ACCESS_TOKEN`) im Kalender notieren und rechtzeitig erneuern
- [ ] ⚪ Rate-Limit für `grade-attempt` (derzeit nur die Limits von Supabase)
- [ ] ⚪ Eigene Supabase-Domain? Dann die CSP in `vercel.json` (`connect-src`, `img-src`) ergänzen

## 4. Offene Produkt- und Inhaltsentscheidungen

- [ ] 🟡 Wer gibt Inhalte fachlich frei? Alle sechs Themen stehen auf `internal-review`, nicht `approved`. Für die Aufgabenpools reicht es, je Kapitel die handgeschriebenen Aufgaben und je Vorlage zwei, drei erzeugte Aufgaben zu prüfen (Vorlagen rechnen die Lösungen selbst)
- [ ] 🟡 Endgültiger Produktname (`src/config/brand.ts`) – „MatheMentor“ ist ein Platzhalter
- [ ] 🟡 Lernpfad mit echten Schülern beobachten: Werden Einstieg/Erklärung oft übersprungen? Greift der Zurück-Vorschlag zu früh oder zu spät (`PATH_CONFIG` in `src/domain/learningPath.ts`)?
- [ ] ⚪ Gesehen/übersprungen im Lernpfad liegt nur im Browser; bei Bedarf (Gerätewechsel) serverseitig speichern
- [ ] 🟡 Score-Grenzen pädagogisch validieren (`SCORE_CONFIG` in `src/domain/score.ts`: u. a. Fenster 15 Aufgaben, Zielgewicht 12) und die Stufenwechsel beim adaptiven Üben (`SELECTION_CONFIG` in `src/domain/exerciseSelection.ts`: 3 Treffer hoch, 2 Fehler runter) mit echten Schülern beobachten
- [ ] 🟡 Schweregrade der Aufgaben später mit echten Daten nachjustieren (Lösungsquote je Aufgabe/Vorlage)
- [ ] ⚪ Bewertung: Soll `1.125` eine Rückfrage auslösen (`SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS`)?
- [ ] ⚪ Bewertung: Herleitungspfeile `→`/`⇒` und Ketten mit Einheitenwechsel werten statt Rückfrage?
- [ ] ⚪ Bewertung: „keine Ahnung“ als Rückfrage statt Rot?
- [ ] ⚪ Themen-Score nur über begonnene Kapitel mitteln?
- [ ] ⚪ Inhaltsfragen aus `src/domain/evaluate.qa.test.ts` (`it.todo`):
  - „Grundwert G“, „Seite c“, „Ja, es ist rechtwinklig“ – Antwortlisten erweitern oder Freitext tolerieren
  - `pyth-gemischt-4`: „x = 5 oder x = −12“ gibt 0 Punkte; Teilpunkt + Hinweis „x > 0 beachten“ wäre fairer
  - `quad-pq-formel-4`: „5; 5“ (doppelte Lösung zweimal genannt) gibt 0 Punkte
- [ ] ⚪ Video-Hosting: eigenes (Storage/Bunny/Vimeo) oder YouTube-nocookie mit Einwilligung? Alle Videos sind noch Platzhalter
- [ ] ⚪ KI-Anbieter (für spätere Handschrift-Korrektur): Verarbeitung in der EU / keine Speicherung / kein Training verbindlich?

## 5. Später (Weiterentwicklung und Aufräumen)

- [ ] 🟡 Restlicher Lehrplan NRW Gymnasium G9 als Aufgabenpools (Muster: `src/content/lineare-funktionen/`, ein Ordner je Thema, eine Datei je Kapitel, Vorlagen + handgeschriebene Sach- und Wissensaufgaben). Offen laut schulinternem G9-Curriculum (KLP 2019): Kl. 8 Terme mit Klammern, Zufall und mehrstufige Zufallsexperimente, Ähnlichkeit/Strahlensätze; Kl. 9 Quadratwurzeln und reelle Zahlen, quadratische Funktionen, Potenzen; Kl. 10 Trigonometrie, Exponentialfunktionen, Pyramide/Kegel/Kugel, bedingte Wahrscheinlichkeit; Kl. 5–7 komplett. Thema für Thema mit fachlicher Freigabe
- [ ] ⚪ Auswahl von Bundesland und Schulart in Registrierung/Konto, sobald es Inhalte für ein zweites Land bzw. eine zweite Schulart gibt (`profiles.state`/`school_type` sind angelegt; `DEFAULT_LEARNER_CONTEXT` in `src/domain/levels.ts` durch den Profilwert ersetzen; Datenschutzerklärung ergänzen)
- [ ] ⚪ Reine Zeichen-/Konstruktionsaufgaben ohne prüfbares Endergebnis (brauchen die KI-Korrektur aus Phase 2)
- [ ] ⚪ Block-Modell für Kapitelseiten (`0003_content_blocks`, Ansatz in ARCHITECTURE.md §10)
- [ ] ⚪ Redaktions-UI statt Pflege im Git
- [ ] ⚪ Phase 2: KI-Korrektur der Handschrift (`grade-submission`), Foto-Upload, Testmodus mit eigener Gewichtung
- [ ] ⚪ Phase 3: Eltern- und Lehrerzugang (`parent_child`, `teacher_student`, Fortschritts-Snapshot serverseitig schreiben), Abos mit Stripe
- [ ] ⚪ Phase 4: Wiederholung und Empfehlungen (`RecommendationService`)
- [ ] ⚪ `@supabase/supabase-js` nur im Supabase-Modus laden (dynamischer Import, kleineres Hauptbundle)
- [ ] ⚪ Login-/Registrierungsseite an das neue Designsystem angleichen (nutzt noch einfache Formular-Stile)
- [ ] ⚪ `tmp-measure.mjs` löschen (temporäres Messskript, wird von Git bereits ignoriert)
- [ ] ⚪ Ungenutzte Komponente `src/components/Placeholder.tsx` entfernen oder verwenden
