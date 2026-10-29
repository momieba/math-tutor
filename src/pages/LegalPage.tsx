import { Link, useParams } from 'react-router';

const TITLES: Record<string, string> = { datenschutz: 'Datenschutzerklärung', impressum: 'Impressum', agb: 'Nutzungsbedingungen' };

/** Platzhalter – Texte müssen vor Produktivbetrieb rechtlich geprüft werden. */
export default function LegalPage() {
  const { page = '' } = useParams();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-indigo-700 text-sm min-h-11 inline-flex items-center">
        ← Startseite
      </Link>
      <h1 className="text-2xl font-bold mt-4">{TITLES[page] ?? 'Seite nicht gefunden'}</h1>
      <p className="mt-4 text-slate-600">Inhalt folgt (rechtliche Prüfung ausstehend).</p>
    </div>
  );
}
