import { PRODUCT_NAME } from '../../config/brand';
import { Logo } from '../Logo';
import { ButtonLink } from '../ui';

const LINKS: [href: string, label: string][] = [
  ['#funktionen', 'Funktionen'],
  ['#so-gehts', 'So geht’s'],
  ['#eltern', 'Für Eltern'],
  ['#preise', 'Preise'],
  ['#faq', 'FAQ'],
];

/** Feste Kopfzeile: Logo, Ankerlinks (ab 1024 px), „Anmelden“ (Ghost) und Hauptaktion „Kostenlos starten“. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <a href="#start" className="mr-4 inline-flex min-h-11 items-center rounded-lg" aria-label={`${PRODUCT_NAME} – zum Seitenanfang`}>
          <Logo />
        </a>
        <nav aria-label="Seitenbereiche" className="hidden items-center gap-1 lg:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ButtonLink to="/login" variant="ghost">
            Anmelden
          </ButtonLink>
          <ButtonLink to="/register" variant="primary">
            Kostenlos starten
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
