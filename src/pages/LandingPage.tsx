import { Audiences } from '../components/landing/Audiences';
import { ClosingBand } from '../components/landing/ClosingBand';
import { CorrectionSection } from '../components/landing/CorrectionSection';
import { Faq } from '../components/landing/Faq';
import { Features } from '../components/landing/Features';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Pricing } from '../components/landing/Pricing';
import { TabletSection } from '../components/landing/TabletSection';
import { TrustBar } from '../components/landing/TrustBar';

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
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <TabletSection />
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
