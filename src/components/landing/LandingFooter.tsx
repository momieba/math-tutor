import { Link } from 'react-router';
import { PRODUCT_NAME } from '../../config/brand';
import { Logo } from '../Logo';

const LINKS: [to: string, label: string][] = [
  ['/legal/impressum', 'Impressum'],
  ['/legal/datenschutz', 'Datenschutz'],
  ['/legal/agb', 'Nutzungsbedingungen'],
  ['/legal/kontakt', 'Kontakt'],
];

/**
 * Footer (C4 §12). Rechtstexte sind Platzhalter und müssen extern erstellt/geprüft werden.
 * „Datenschutz-Einstellungen“ folgt erst mit der YouTube-Einbindung (F9), da es heute nichts einzuwilligen gibt.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-slate-600">
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </p>
        </div>
        <nav aria-label="Rechtliches und Kontakt">
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {LINKS.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="inline-flex min-h-11 items-center rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
