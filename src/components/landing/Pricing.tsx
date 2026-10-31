import { ArrowRight, Check, Gift } from 'lucide-react';
import { ButtonLink } from '../ui';
import { Section } from './Section';

/*
 * Preise als Platzhalter (C4 §9). Bewusst KEIN Bezahl-Button: Preise stehen noch nicht fest,
 * und Vercel Hobby erlaubt keine kommerzielle Nutzung (F4). Die Hauptaktion ist die kostenlose Registrierung.
 */
const PLANS = [
  { name: 'Monatlich', price: 'Preis folgt', note: 'Monatlich kündbar' },
  { name: 'Jährlich', price: 'Preis folgt', note: 'Günstiger als monatlich' },
];

const INCLUDED = ['Alle Themen und Kapitel', 'Aufgaben mit Hinweisen und Musterlösungen', 'Schreibfläche für Stift und Finger', 'Verständnis-Score pro Kapitel'];

export function Pricing() {
  return (
    <Section id="preise" eyebrow="Preise" title="Einfache Abos – Preise folgen">
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
        <Gift aria-hidden="true" size={28} className="shrink-0 text-indigo-700" />
        <p className="text-lg font-semibold text-slate-900">Während der Testphase kostenlos.</p>
        <ButtonLink to="/register" variant="primary" className="sm:ml-auto" iconRight={<ArrowRight aria-hidden="true" size={20} />}>
          Kostenlos starten
        </ButtonLink>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {PLANS.map((p) => (
          <li key={p.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{p.price}</p>
            <p className="mt-1 text-slate-600">{p.note}</p>
            <ul className="mt-6 space-y-2" aria-label={`Enthalten im Abo ${p.name}`}>
              {INCLUDED.map((i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <Check aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-emerald-700" />
                  {i}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
