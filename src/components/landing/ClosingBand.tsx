import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../ui';

/** Abschluss-Band (C4 §11). */
export function ClosingBand() {
  return (
    <section aria-labelledby="abschluss-title" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-8 md:flex-row md:items-center md:justify-between lg:p-12">
          <div>
            <h2 id="abschluss-title" className="text-3xl font-bold tracking-tight">
              Bereit für deine erste Aufgabe?
            </h2>
            <p className="mt-2 text-lg text-slate-700">In wenigen Minuten angemeldet – kostenlos in der Testphase.</p>
          </div>
          <ButtonLink to="/register" variant="primary" size="lg" iconRight={<ArrowRight aria-hidden="true" size={20} />}>
            Jetzt kostenlos starten
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
