# Offene Aufgaben

Erledigte Punkte einfach löschen (der Verlauf steht in Git), neue Punkte in der passenden Gruppe ergänzen.
Reihenfolge innerhalb einer Gruppe = empfohlene Reihenfolge.

Legende: 🔴 blockiert den Start mit echten Schülern · 🟡 vor dem Start dringend empfohlen · ⚪ später

**Eckdaten:** Supabase-Projekt `supabase-mmm` (`bwuiseqburexduujykdr`, Frankfurt, Free-Plan), verbunden mit Vercel Production + Preview · App: `https://math-tutor-rosy.vercel.app` · Jeder Push auf `main` mit Änderungen unter `supabase/` wird per GitHub-Workflow *Supabase deploy* automatisch eingespielt (Details: [README „Go-Live“](../README.md#go-live-supabase--vercel)).

---

## 1. Als Nächstes: Weiterentwicklung und Aufräumen

- [ ] 🟡 Nach dem nächsten Push prüfen, ob der Workflow *Supabase deploy* durchgelaufen ist: Migrationen `0006_test_mode_ai_source_path.sql` (Testmodus, `source = 'ai'`, Tabelle `learning_path_seen`) und `0007_detailed_solution.sql` (ausführliche Lösungen), neuer Inhalts-Seed und Edge Function `grade-attempt` (blinde Gegenprobe, neue Meldung „Ergebnis nicht erkennbar“). Danach auf der Produktions-URL einen Kapitel-Test abgeben und eine Pythagoras-Aufgabe mit ausführlicher Lösung ansehen
- [ ] 🟡 Nach dem Push prüfen, ob Migration `0008_drawing_and_definitions.sql` (Antwortformat `drawing`, Checkpoint `definition`) und der neue Seed eingespielt sind
- [ ] 🟡 Mit Gemini live testen (eigene Testbilder, `npm run ai:test`): Liefert die KI brauchbare Stellen (`box`) für die Unterstreichungen auf Schreibfläche und Foto? Bewertet sie Zeichenaufgaben (Gerade/Parabel ins vorgegebene Koordinatensystem) zuverlässig? Meldet sie einen fehlenden Antwortsatz bei Sachaufgaben? Beim letzten Versuch war Gemini überlastet (503/Zeitüberschreitung). Für Zeichenaufgaben fehlt noch ein Testbild mit Koordinatensystem; `ai-grade-test.ts` müsste dafür das Koordinatensystem wie der Export mitzeichnen
- [ ] ⚪ Zeichenaufgaben (`lf-pr-zeichnen`, `lf-st-zeichnen`, `qf-np-zeichnen`, `qf-sf-zeichnen`) sind ohne KI nicht bewertbar: Nutzer ohne KI bekommen nur eine Rückfrage. Bis die KI für alle läuft (Gruppe 2) ggf. für diese Nutzer aus der Übungsfolge ausblenden; aus dem Kapitel-Test sind sie schon ausgenommen
- [ ] ⚪ Definitionsfragen werden aus den Regeln jedes Kapitels erzeugt (`src/content/definitions.ts`, 278 Fragen). Fachlich prüfen, ob jede Regel als Definition taugt (manche Regeln sind eher Rechenverfahren); IDs hängen an der Reihenfolge der Regeln – Regeln nur hinten anfügen
- [ ] 🟡 Ausführliche Lösungen (alle Denkschritte, ggf. Skizze; Feld `solution.detailed`) für die übrigen Aufgaben ergänzen. Stand: 137 von ≈ 2800 Aufgaben – die Rechen- und Sachaufgaben zu Hypotenuse und Kathete in Pythagoras (Bausteine `hypDetailed`/`legDetailed` in `src/content/pythagoras/detailed.ts`). Vorgehen wie dort: je Thema Bausteine schreiben und in den Vorlagen (`fromTemplate`) mitgeben, handgeschriebene Aufgaben über `withDetailed`. Nächste Kandidaten: Quadratische Funktionen (Skizzen mit `parabolas` im Koordinatensystem), Quadratische Gleichungen, Lineare Funktionen
- [ ] ⚪ Schreibfläche mit echtem iPad und Apple Pencil prüfen: Zwei-Finger-Zoom/-Verschieben, Handballen (sobald ein Stift erkannt ist, schreiben Finger nicht mehr), Papier eine Seite links/rechts und drei Seiten nach unten (`PAPER` in `canvasModel.ts`); exportiert wird nur der beschriebene Bereich (`strokeBounds`)
- [ ] 🟡 KI-Korrektur der Handschrift weiter mit **eigenen Testkonten** testen (`grade-attempt`, nur Nutzer in `AI_GRADING_USERS`, Einrichtung im README; `npm run ai:test` zeigt jetzt auch die blinde Lesung). Testbilder in `scripts/ai-test-images/` (u. a. `…-falsch-18`/`-71`: richtiger Weg, falsches Endergebnis). Kostenloser Gemini-Key ⇒ keine echten Schülerdaten, bis Gruppe 2 erledigt ist
- [ ] 🟡 Restlicher Lehrplan NRW Gymnasium G9 als Aufgabenpools (Muster: `src/content/lineare-funktionen/` bzw. `src/content/quadratische-funktionen/`, ein Ordner je Thema, eine Datei je Kapitel, Vorlagen + handgeschriebene Sach- und Wissensaufgaben; nach Änderungen `npm run seed:sql`). Offen laut schulinternem G9-Curriculum (KLP 2019): Kl. 8 Terme mit Klammern, Zufall und mehrstufige Zufallsexperimente, Ähnlichkeit/Strahlensätze; Kl. 9 Quadratwurzeln und reelle Zahlen, Potenzen; Kl. 10 Trigonometrie, Exponentialfunktionen, Pyramide/Kegel/Kugel, bedingte Wahrscheinlichkeit; Kl. 5–7 komplett. Thema für Thema mit fachlicher Freigabe. Für Terme und binomische Formeln fehlt noch ein Antwortformat „quadratischer Term“ (heute nur linear bzw. Text)
- [ ] ⚪ „Scheitelpunkt ablesen“-Aufgaben in `quadratische-funktionen` (Parabeln kann das Koordinatensystem jetzt zeichnen: `parabolas` in `Figure`)
- [ ] ⚪ Phase 3: Eltern- und Lehrerzugang (`parent_child`, `teacher_student`, Einladungscode + Einwilligung, Fortschritts-Snapshot serverseitig schreiben); Abos siehe Gruppe 2
- [ ] ⚪ Reine Zeichen-/Konstruktionsaufgaben ohne prüfbares Endergebnis (brauchen die KI-Korrektur für alle, Gruppe 2)
- [ ] ⚪ Auswahl von Bundesland und Schulart in Registrierung/Konto, sobald es Inhalte für ein zweites Land bzw. eine zweite Schulart gibt (`profiles.state`/`school_type` sind angelegt; `DEFAULT_LEARNER_CONTEXT` in `src/domain/levels.ts` durch den Profilwert ersetzen; Datenschutzerklärung ergänzen)
- [ ] ⚪ Inhalte je Thema nachladen: Der Inhalts-Chunk des lokalen Modus liegt mit sieben Themen bei ≈ 500 kB (Vite-Warnung); im Supabase-Modus nicht betroffen
- [ ] ⚪ Block-Modell für Kapitelseiten (`0003_content_blocks`, Ansatz in ARCHITECTURE.md §10)
- [ ] ⚪ Redaktions-UI statt Pflege im Git

## 2. Externe Dienste und Kosten (Zahlung, Verträge, Anbieter)

Alles, was einen bezahlten Zugang, einen Vertrag oder einen neuen Dienstleister braucht. AV-Verträge und Rechtstexte dazu stehen in Gruppe 4.

- [ ] 🔴 KI-Korrektur für alle Nutzer: Aufgaben mit Schreibfläche haben kein Ergebnisfeld mehr und können ohne KI nicht bewertet werden; bis dahin können nur Nutzer in `AI_GRADING_USERS` sie abgeben. Braucht einen bezahlten Zugang mit EU-Verarbeitung und AV-Vertrag (nächster Punkt). Kosten einplanen: pro Abgabe ohne eingetipptes Ergebnis zwei Modellaufrufe (Korrektur + blinde Gegenprobe des Endergebnisses)
- [ ] 🔴 KI-Anbieter für den Echtbetrieb: Verarbeitung in der EU / keine Speicherung / kein Training verbindlich? Nutzungsbedingungen auf Altersgrenzen prüfen (App für Minderjährige). Kandidat: Gemini über Vertex AI (EU-Region). Vor dem Einschalten für echte Schüler
- [ ] ⚪ Abos mit Stripe (Phase 3): Checkout/Portal über Edge Function, Webhook schreibt `subscriptions`; Rechtstexte dazu in Gruppe 4
- [ ] ⚪ Video-Hosting: eigenes (Storage/Bunny/Vimeo) oder YouTube-nocookie mit Einwilligung? Alle Videos sind noch Platzhalter

## 3. Anmeldung (Supabase → Authentication)

- [ ] ⚪ [Redirect URL](https://supabase.com/dashboard/project/bwuiseqburexduujykdr/auth/url-configuration) für Vercel-Previews ergänzen, nur mit projektbezogenem Muster (z. B. `https://math-tutor-*-<vercel-team>.vercel.app/**`), nicht `https://*.vercel.app/**` – das würde jede fremde vercel.app-Seite als Ziel für Login-Links erlauben
- [ ] 🟡 Google-Anmeldung: OAuth-Client in der Google Cloud Console anlegen, Client-ID/Secret in Supabase eintragen, Zustimmungsbildschirm (App-Name, Datenschutz-Link) ausfüllen

## 4. Rechtliches

Entwürfe für Impressum, Datenschutzerklärung, Nutzungsbedingungen und Kontakt stehen in `src/pages/legal/`, die Betreiberangaben zentral in `OPERATOR` (`src/config/legal.ts`). Platzhalter stehen in den Texten in [eckigen Klammern].

- [ ] 🔴 Platzhalter in `OPERATOR` (`src/config/legal.ts`) durch echte Angaben ersetzen: Name/Firma, Rechtsform, Anschrift, Telefon, USt-IdNr. und Handelsregister (leer lassen, falls nicht vorhanden), Verantwortlicher nach § 18 MStV (die E-Mail-Adressen siehe Gruppe 7)
- [ ] 🔴 Platzhalter in der Datenschutzerklärung (`src/pages/legal/Datenschutz.tsx`): Speicherdauer der Vercel-Logs, Löschfrist inaktiver Konten (hängt an „Speicherfristen“ unten), Aufbewahrung der Sicherungskopien (hängt an Supabase Pro), zuständige Aufsichtsbehörde (je nach Bundesland des Betreibers); Anschrift von Vercel prüfen (E-Mail-Anbieter siehe Gruppe 7)
- [ ] 🟡 Datenschutzerklärung an die neuen Funktionen anpassen: Lernpfad-Stand je Kapitel wird jetzt serverseitig gespeichert (Tabelle `learning_path_seen`, ist im Datenexport enthalten), Kapitel-Tests werden als Versuche mit `mode = 'test'` gespeichert, die KI liest Handschrift in zwei Aufrufen (Korrektur + Gegenprobe); Abschnitt 7 „Speicherung im Browser“ um den Lernpfad-Zwischenspeicher und den laufenden Test (sessionStorage) ergänzen
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

## 5. Vor dem Start mit echten Schülern

- [ ] 🟡 Abnahme auf der Produktions-URL: Registrieren (Bestätigungs-Mail), Google-Login, Aufgabe mit Hinweis + Handschrift abgeben, Verlauf mit Bild, Passwort zurücksetzen, Datenexport, Konto löschen; außerdem prüfen, dass die Pool-Kapitel alle Aufgaben laden (≈ 2800 Aufgaben; unter „Mehr zu diesem Kapitel“ stehen 60–90 Aufgaben pro Kapitel) und jedes neue Antwortformat (Punkt, Funktionsgleichung, π) einmal abgeben; einen Kapitel-Test komplett durchspielen; Lernpfad „Einstieg gesehen“ auf einem zweiten Gerät prüfen. Die Mail-Schritte erst nach Gruppe 7
- [ ] 🟡 Getrenntes Staging: zweites Supabase-Projekt nur für *Preview*; das jetzige Projekt nur noch für *Production* (heute teilen sich Preview und Production eine Datenbank)
- [ ] 🟡 Supabase Pro (tägliche Backups, kein Pausieren nach Inaktivität)
- [ ] 🟡 Vercel Pro oder Cloudflare Pages, sobald das Produkt kommerziell ist (Hobby ist nur nichtkommerziell erlaubt)
- [ ] 🟡 Fehler-Monitoring im Frontend und für die Edge Functions (Anbieter mit EU-Hosting prüfen)
- [ ] 🟡 Test auf echtem iPad: Safari/WebKit und Apple Pencil (bisher nur Chromium mit iPad-Profil getestet)
- [ ] ⚪ Foto-Aufbereitung mit echten Handyfotos prüfen (Schatten, schräges Licht, Karopapier). Sie gleicht den Kontrast jetzt kachelweise aus (`ENHANCE_CONFIG` in `src/components/handwriting/photo.ts`); bei Bedarf Kachelzahl bzw. Schwellen nachjustieren
- [ ] ⚪ Ablaufdatum des Supabase-Tokens (GitHub-Secret `SUPABASE_ACCESS_TOKEN`) im Kalender notieren und rechtzeitig erneuern
- [ ] ⚪ Rate-Limit für `grade-attempt` (derzeit nur die Limits von Supabase)

## 6. Offene Produkt- und Inhaltsentscheidungen

- [ ] 🟡 Wer gibt Inhalte fachlich frei? Alle sieben Themen stehen auf `internal-review`, nicht `approved` – neu und noch ungeprüft: **Quadratische Funktionen** (4 Kapitel, ≈ 300 Aufgaben). Für die Aufgabenpools reicht es, je Kapitel die handgeschriebenen Aufgaben und je Vorlage zwei, drei erzeugte Aufgaben zu prüfen (Vorlagen rechnen die Lösungen selbst)
- [ ] 🟡 Endgültiger Produktname (`src/config/brand.ts`) – „MatheMentor“ ist ein Platzhalter
- [ ] 🟡 KI-Korrektur: KI-Urteil über den Rechenweg in die Punkte einbeziehen? Heute zählt nur das Endergebnis (`withAiWork` in `src/domain/aiGrading.ts`), die KI-Markierungen sind nur Rückmeldung (gespeichert mit `source = 'ai'`)
- [ ] 🟡 Lernpfad mit echten Schülern beobachten: Werden Einstieg/Erklärung oft übersprungen? Greift der Zurück-Vorschlag zu früh oder zu spät (`PATH_CONFIG` in `src/domain/learningPath.ts`)?
- [ ] 🟡 Score-Grenzen pädagogisch validieren (`SCORE_CONFIG` in `src/domain/score.ts`: u. a. Fenster 15 Aufgaben, Zielgewicht 12, Testgewicht 1,5) und die Stufenwechsel beim adaptiven Üben (`SELECTION_CONFIG` in `src/domain/exerciseSelection.ts`: 3 Treffer hoch, 2 Fehler runter) mit echten Schülern beobachten
- [ ] 🟡 Kapitel-Test mit echten Schülern beobachten (`TEST_CONFIG` in `src/domain/chapterTest.ts`: 8 Aufgaben, Mischung 2/4/2, bestanden ab 75 %) und Wiederholungs-Empfehlungen (`REVIEW_CONFIG` in `src/domain/recommendations.ts`: auffrischen nach 7 Tagen ab Score 60)
- [ ] 🟡 Schweregrade der Aufgaben später mit echten Daten nachjustieren (Lösungsquote je Aufgabe/Vorlage)
- [ ] ⚪ Bewertung: Soll `1.125` eine Rückfrage auslösen (`SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS`)?
- [ ] ⚪ Bewertung: „keine Ahnung“ als Rückfrage statt Rot?
- [ ] ⚪ Bewertung: Ketten mit Einheitenwechsel („17 cm → 0,17 m“, „c = 17 cm = 0,17 m“) werten statt Rückfrage? (Herleitungspfeile ohne Einheitenwechsel werden seit Kurzem gewertet)

## 7. Zurückgestellt: eigene Domain und E-Mail

Hängt zusammen und wird gemeinsam erledigt, sobald eine eigene Domain da ist. Die 🔴-Punkte bleiben Voraussetzung für den Start mit echten Schülern.

- [ ] 🔴 Eigener SMTP-Server (EU-Anbieter) mit Absender auf der eigenen Domain; der eingebaute Versand ist nur zum Testen und stark begrenzt. AV-Vertrag mit dem Anbieter vor dem Einschalten
- [ ] 🔴 E-Mail-Bestätigung an, Passwort mindestens 8 Zeichen mit Buchstaben + Ziffern (im Dashboard; **nicht** `config push`, das würde die localhost-URLs aus `supabase/config.toml` in die Produktion schreiben). Erst nach dem SMTP-Server sinnvoll
- [ ] 🟡 E-Mail-Vorlagen (Bestätigung, Passwort zurücksetzen) auf Deutsch übersetzen, Absendername = Produktname
- [ ] 🔴 Kontakt-E-Mail (`kontakt@example.com`) und Datenschutz-E-Mail (`datenschutz@example.com`) in `OPERATOR` (`src/config/legal.ts`) auf Adressen der eigenen Domain umstellen
- [ ] 🔴 Datenschutzerklärung: Name/Sitz des E-Mail-Anbieters eintragen
- [ ] ⚪ Site URL und Redirect URLs in Supabase auf die eigene Domain umstellen; Vercel-Domain verbinden
- [ ] ⚪ Eigene Supabase-Domain? Dann die CSP in `vercel.json` (`connect-src`, `img-src`) ergänzen
