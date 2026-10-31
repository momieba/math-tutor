# Bildnachweise und Drittinhalte

## Bilder der Landingpage (`public/images/landing/`)

Alle Bilder sind **eigene Screenshots dieser App** (lokaler Modus, Demo-Nutzerin „Mia“, keine echten Personendaten),
erzeugt mit `npm run images:landing` (`scripts/capture-landing-images.mjs`). Der Tablet-Rahmen ist reines CSS
(`src/components/landing/DeviceImage.tsx`), ohne Herstellerlogo. Die Illustrationen bei „Für Eltern“ und
„Für Lehrkräfte“ sind eigene, dekorative Inline-SVGs (`src/components/landing/Audiences.tsx`).

Stockfotos (Pexels, Pixabay, Unsplash) werden derzeit **nicht** verwendet: Ein automatisierter Download war nicht
möglich (Pexels/Pixabay: HTTP 403 durch Bot-Schutz, Unsplash: Anmeldung erforderlich). Werden später Stockfotos
ergänzt, kommt pro Bild eine Zeile in die Tabelle unten (Lizenz auf der Quellseite prüfen, keine Unsplash+-Bilder,
keine erkennbaren Kindergesichter, keine Marken/Logos).

| Datei | Motiv | Urheber | Quelle | Lizenz | Erstellt/Abgerufen |
|---|---|---|---|---|---|
| `hero-aufgabe-{640,1280,1920}.webp` | Aufgabe „Hypotenuse berechnen“ mit handschriftlichem Rechenweg, Querformat | eigener Screenshot (Projekt) | `scripts/capture-landing-images.mjs` | Teil des Projekts | 2026-10-31 |
| `schritt-dashboard-{640,1280,1920}.webp` | Startseite mit Themensuche und Themenkacheln | eigener Screenshot (Projekt) | dto. | Teil des Projekts | 2026-10-31 |
| `schritt-kapitel-{640,1280,1920}.webp` | Kapitel „Hypotenuse berechnen“ | eigener Screenshot (Projekt) | dto. | Teil des Projekts | 2026-10-31 |
| `schritt-feedback-{640,1280,1920}.webp` | Rückmeldung „Richtig!“ mit Musterlösung | eigener Screenshot (Projekt) | dto. | Teil des Projekts | 2026-10-31 |
| `tablet-hochformat-{640,1280}.webp` | Schreibfläche im Hochformat | eigener Screenshot (Projekt) | dto. | Teil des Projekts | 2026-10-31 |

## Schrift und Icons (npm-Pakete, lokal gebündelt)

| Paket | Zweck | Lizenz |
|---|---|---|
| `@fontsource-variable/inter` (Inter, Rasmus Andersson) | Schrift, selbst gehostet | SIL Open Font License 1.1 |
| `lucide-react` | Icons | ISC |
| `katex` | Formelsatz inkl. Schriften | MIT |
