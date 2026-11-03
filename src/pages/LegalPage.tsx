import type { ComponentType } from 'react';
import { Link, useParams } from 'react-router';
import { LandingFooter } from '../components/landing/LandingFooter';
import { Logo } from '../components/Logo';
import { PRODUCT_NAME } from '../config/brand';
import { LEGAL_DRAFT, LEGAL_TEXTS_DATE } from '../config/legal';
import { Datenschutz } from './legal/Datenschutz';
import { Impressum } from './legal/Impressum';
import { Kontakt } from './legal/Kontakt';
import { Nutzungsbedingungen } from './legal/Nutzungsbedingungen';

const PAGES: Record<string, { title: string; Body: ComponentType }> = {
  impressum: { title: 'Impressum', Body: Impressum },
  datenschutz: { title: 'Datenschutzerklärung', Body: Datenschutz },
  agb: { title: 'Nutzungsbedingungen', Body: Nutzungsbedingungen },
  kontakt: { title: 'Kontakt', Body: Kontakt },
};

/** Fließtext-Stile für die Rechtstexte (kein Typography-Plugin im Projekt). */
const PROSE =
  'mt-8 text-slate-700 leading-relaxed [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-slate-900 ' +
  '[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:font-medium [&_a]:text-indigo-700 [&_a]:underline [&_a]:underline-offset-2';

/** Impressum, Datenschutzerklärung, Nutzungsbedingungen, Kontakt. Betreiberangaben stehen in src/config/legal.ts. */
export default function LegalPage() {
  const { page = '' } = useParams();
  const entry = PAGES[page];
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-lg" aria-label={`${PRODUCT_NAME} – zur Startseite`}>
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm text-indigo-700">
          ← Startseite
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{entry?.title ?? 'Seite nicht gefunden'}</h1>
        {entry && LEGAL_DRAFT && (
          <p role="note" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Entwurf: Dieser Text ist noch nicht rechtlich geprüft. Angaben in eckigen Klammern werden vor dem offiziellen Start ergänzt.
          </p>
        )}
        {entry && (
          <div className={PROSE}>
            <entry.Body />
            <p className="!mt-10 text-sm text-slate-500">Stand: {LEGAL_TEXTS_DATE}</p>
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
