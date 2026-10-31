import { Audiences } from '../components/landing/Audiences';
import { ClosingBand } from '../components/landing/ClosingBand';
import { CorrectionSection } from '../components/landing/CorrectionSection';
import { DeviceImage } from '../components/landing/DeviceImage';
import { Faq } from '../components/landing/Faq';
import { Features } from '../components/landing/Features';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Pricing } from '../components/landing/Pricing';
import { TabletSection } from '../components/landing/TabletSection';
import { TrustBar } from '../components/landing/TrustBar';

/** Bildbreite der Zickzack-Reihen in „So funktioniert's“ (ab 768 px zweispaltig, max. Inhaltsbreite 1152 px). */
const STEP_SIZES = '(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw';

/**
 * Öffentliche Landingpage (technisch getrennt vom geschützten Bereich /app).
 * Gliederung und Texte nach Req-eng-Briefing C4; jeder Abschnitt ist eine eigene Komponente unter components/landing.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Zum Inhalt springen
      </a>
      <LandingHeader />
      <main id="main">
        <Hero
          media={
            <DeviceImage
              name="hero-aufgabe"
              priority
              sizes="(min-width: 1200px) 600px, (min-width: 1024px) 52vw, 100vw"
              alt="App-Ansicht auf dem Tablet: Aufgabe zum Satz des Pythagoras mit handschriftlichem Rechenweg auf Kästchenpapier und einer Skizze des Dreiecks"
            />
          }
        />
        <TrustBar />
        <Features />
        <HowItWorks
          media={[
            <DeviceImage key="1" name="schritt-dashboard" sizes={STEP_SIZES} alt="Startseite der App mit dem Eingabefeld „Was möchtest du heute lernen?“ und Themenkacheln mit Fortschritt" />,
            <DeviceImage key="2" name="schritt-kapitel" sizes={STEP_SIZES} alt="Kapitel „Hypotenuse berechnen“ mit Lernziel, Stand und Einführung" />,
            <DeviceImage key="3" name="schritt-feedback" sizes={STEP_SIZES} alt="Rückmeldung „Richtig!“ mit Kapitelfortschritt und schrittweiser Musterlösung" />,
          ]}
        />
        <TabletSection
          media={
            <DeviceImage
              name="tablet-hochformat"
              orientation="portrait"
              sizes="320px"
              className="mx-auto w-72 ring-slate-700 md:w-80"
              alt="Tablet im Hochformat: Schreibfläche mit Rechenweg, Werkzeugleiste darunter und Ergebnisfeld"
            />
          }
        />
        <CorrectionSection />
        <Audiences />
        <Pricing />
        <Faq />
        <ClosingBand />
      </main>
      <LandingFooter />
    </div>
  );
}
