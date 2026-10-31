import { ArrowDown, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink, buttonClass } from '../ui';

/** Hero: Headline, Subline, Hauptaktion, Kleingedrucktes (Texte nach Briefing C4 §1). */
export function Hero({ media }: { media?: ReactNode }) {
  return (
    <section id="start" aria-labelledby="start-title" className="bg-slate-50 bg-linear-to-b from-indigo-50 to-slate-50">
      <div className={`mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:py-24 ${media ? 'lg:grid-cols-[1fr_1.1fr] lg:items-center' : ''}`}>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Mathe-Nachhilfe für Klasse 7–9</p>
          <h1 id="start-title" className="mt-3 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Mathe <span className="text-indigo-700">verstehen</span> – statt nur auswendig lernen.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Erklärungen in kleinen Schritten, Aufgaben direkt mit dem Stift auf dem Tablet lösen und sofort sehen, was schon sitzt. Passend zum
            Lehrplan für die Klassen 7 bis 9.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/register" variant="primary" size="lg" iconRight={<ArrowRight aria-hidden="true" size={20} />}>
              Jetzt kostenlos starten
            </ButtonLink>
            <a href="#so-gehts" data-variant="secondary" className={buttonClass('secondary', 'lg')}>
              So funktioniert’s
              <ArrowDown aria-hidden="true" size={20} />
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-600">Kostenlos in der Testphase · Keine Zahlungsdaten nötig</p>
        </div>
        {media}
      </div>
    </section>
  );
}
