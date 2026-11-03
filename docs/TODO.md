# Offene Aufgaben

Stand: 2. November 2026. Erledigtes abhaken (`[x]`) und mit Datum versehen; neue Punkte in der passenden Gruppe ergänzen.
Reihenfolge innerhalb einer Gruppe = empfohlene Reihenfolge.

Legende: 🔴 blockiert den Start mit echten Schülern · 🟡 vor dem Start dringend empfohlen · ⚪ später

---

## 1. Code sichern

- [ ] 🔴 Produktionsumbau committen (Branch + Pull Request) – liegt derzeit nur im Arbeitsverzeichnis
- [ ] ⚪ `tmp-measure.mjs` löschen (temporäres Messskript der Landingpage-Bilder, laut Kommentar nach der Prüfung zu entfernen)
- [ ] ⚪ Ungenutzte Komponente `src/components/Placeholder.tsx` entfernen oder verwenden

## 2. Supabase einrichten

Befehle und Details: [README „Go-Live“](../README.md#go-live-supabase--vercel).

- [x] Supabase-Projekt über die Vercel-Integration angelegt (Region Frankfurt, Präfix `VITE_`, Free-Plan) – 02.11.2026
- [ ] 🔴 In Vercel prüfen, dass `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` existieren (falls nur ein `…PUBLISHABLE_KEY` angelegt wurde: `src/services/config.ts` anpassen)
- [ ] 🔴 Projekt verknüpfen: `npx supabase@3.0.0 login` und `link --project-ref <ref>`
- [ ] 🔴 Schema + Inhalte einspielen: `db push --remote --include-seed`
- [ ] 🔴 Edge Functions deployen: `grade-attempt` und `delete-account` (`functions deploy … --use-api`)
- [ ] 🔴 GitHub-Environment(s) für den Workflow *Supabase deploy* anlegen: Secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, Variable `SUPABASE_PROJECT_REF`

## 3. Anmeldung (Supabase → Authentication)

- [ ] 🔴 URL Configuration: *Site URL* = Produktions-Domain; *Redirect URLs* = `https://<domain>/app` und `https://<domain>/reset-password` (für Previews zusätzlich `https://*.vercel.app/**`)
- [ ] 🔴 E-Mail-Bestätigung an, Passwort mindestens 8 Zeichen mit Buchstaben + Ziffern (oder `npx supabase@3.0.0 config push` aus `supabase/config.toml`)
- [ ] 🔴 Eigener SMTP-Server (EU-Anbieter); der eingebaute Versand ist nur zum Testen und stark begrenzt
- [ ] 🟡 E-Mail-Vorlagen (Bestätigung, Passwort zurücksetzen) auf Deutsch übersetzen, Absendername = Produktname
- [ ] 🟡 Google-Anmeldung: OAuth-Client in der Google Cloud Console anlegen, Client-ID/Secret in Supabase eintragen, Zustimmungsbildschirm (App-Name, Datenschutz-Link) ausfüllen

## 4. Rechtliches

- [ ] 🔴 Impressum mit echten Angaben (`src/pages/LegalPage.tsx`, derzeit Platzhalter)
- [ ] 🔴 Datenschutzerklärung: Supabase (Frankfurt), Vercel (Hosting/Logs), gespeicherte Daten (Konto, Abgaben, Handschrift-Bilder), Speicherdauer, Löschung über „Konto löschen“, Export über „Meine Daten herunterladen“
- [ ] 🔴 Nutzungsbedingungen
- [ ] 🔴 AV-Verträge (DPA) mit Supabase und Vercel abschließen
- [ ] 🔴 Einwilligung Minderjähriger rechtlich prüfen: Derzeit bestätigt das Kind selbst „Eltern sind einverstanden“ (Art. 8 DSGVO, unter 16). Reicht das, oder braucht es eine verifizierte Elterneinwilligung?
- [ ] 🟡 Speicherfristen festlegen (z. B. inaktive Konten nach X Monaten löschen) und ggf. als geplanten Job umsetzen
- [ ] ⚪ Bei jeder wesentlichen Änderung der Texte `CONSENT_VERSION` in `src/config/legal.ts` hochzählen (alle Nutzer werden erneut gefragt)

## 5. Vor dem Start mit echten Schülern

- [ ] 🟡 Abnahme auf der Produktions-URL: Registrieren (Bestätigungs-Mail), Google-Login, Aufgabe mit Hinweis + Handschrift abgeben, Verlauf mit Bild, Passwort zurücksetzen, Datenexport, Konto löschen
- [ ] 🟡 Getrenntes Staging: zweites Supabase-Projekt nur für *Preview*; das jetzige Projekt nur noch für *Production* (heute teilen sich Preview und Production eine Datenbank)
- [ ] 🟡 Supabase Pro (tägliche Backups, kein Pausieren nach Inaktivität) – Entscheidung F4
- [ ] 🟡 Vercel Pro oder Cloudflare Pages, sobald das Produkt kommerziell ist (Hobby ist nur nichtkommerziell erlaubt) – Entscheidung F4
- [ ] 🟡 Fehler-Monitoring im Frontend und für die Edge Functions (Anbieter mit EU-Hosting prüfen)
- [ ] 🟡 Test auf echtem iPad: Safari/WebKit und Apple Pencil (bisher nur Chromium mit iPad-Profil getestet)
- [ ] ⚪ Rate-Limit für `grade-attempt` (derzeit nur die Limits von Supabase)
- [ ] ⚪ Eigene Supabase-Domain? Dann die CSP in `vercel.json` (`connect-src`, `img-src`) ergänzen

## 6. Offene Produkt- und Inhaltsentscheidungen

- [ ] 🟡 **F6** Wer gibt Inhalte fachlich frei? Alle drei Themen stehen auf `internal-review`, nicht `approved`
- [ ] 🟡 Endgültiger Produktname (`src/config/brand.ts`, Briefing R4) – „MatheMentor“ ist ein Platzhalter
- [ ] 🟡 Score-Grenzen pädagogisch validieren (`SCORE_CONFIG` in `src/domain/score.ts`)
- [ ] ⚪ Bewertung: Soll `1.125` eine Rückfrage auslösen (`SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS`)?
- [ ] ⚪ Bewertung: Herleitungspfeile `→`/`⇒` und Ketten mit Einheitenwechsel werten statt Rückfrage?
- [ ] ⚪ Bewertung: „keine Ahnung“ als Rückfrage statt Rot?
- [ ] ⚪ Themen-Score nur über begonnene Kapitel mitteln (UX-06)?
- [ ] ⚪ Inhaltsfragen aus `src/domain/evaluate.qa.test.ts` (`it.todo`):
  - „Grundwert G“, „Seite c“, „Ja, es ist rechtwinklig“ – Antwortlisten erweitern oder Freitext tolerieren
  - `pyth-gemischt-4`: „x = 5 oder x = −12“ gibt 0 Punkte; Teilpunkt + Hinweis „x > 0 beachten“ wäre fairer
  - `quad-pq-formel-4`: „5; 5“ (doppelte Lösung zweimal genannt) gibt 0 Punkte
- [ ] ⚪ **F9** Video-Hosting: eigenes (Storage/Bunny/Vimeo) oder YouTube-nocookie mit Einwilligung? Alle Videos sind noch Platzhalter
- [ ] ⚪ **F10** KI-Anbieter: Verarbeitung in der EU / keine Speicherung / kein Training verbindlich?

## 7. Später (Weiterentwicklung)

- [ ] ⚪ Mehr Themen für Klasse 7–9 (Inhalte in `src/content`, dann `npm run seed:sql` und Deploy)
- [ ] ⚪ Block-Modell für Kapitelseiten (`0003_content_blocks`, Ansatz in ARCHITECTURE.md §10)
- [ ] ⚪ Redaktions-UI statt Pflege im Git (F5 Variante a)
- [ ] ⚪ Phase 2: KI-Korrektur der Handschrift (`grade-submission`), Foto-Upload, Testmodus mit eigener Gewichtung
- [ ] ⚪ Phase 3: Eltern- und Lehrerzugang (`parent_child`, `teacher_student`, Fortschritts-Snapshot serverseitig schreiben), Abos mit Stripe
- [ ] ⚪ Phase 4: Wiederholung und Empfehlungen (`RecommendationService`)
- [ ] ⚪ `@supabase/supabase-js` nur im Supabase-Modus laden (dynamischer Import, kleineres Hauptbundle)
- [ ] ⚪ Login-/Registrierungsseite an das neue Designsystem angleichen (nutzt noch einfache Formular-Stile)
