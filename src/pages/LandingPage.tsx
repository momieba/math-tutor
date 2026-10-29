import { Link } from 'react-router';

/** Öffentliche Landingpage (technisch getrennt vom geschützten Bereich /app). */
export default function LandingPage() {
  const features = [
    ['Lehrplan statt Zufall', 'Alle Themen und Aufgaben stammen aus einer geprüften Wissensbasis.'],
    ['Mit Stift auf dem Tablet', 'Rechenwege direkt auf der Schreibfläche lösen.'],
    ['Hinweise in Stufen', 'Erst ein Denkanstoß, dann mehr Hilfe, dann die Musterlösung.'],
    ['Verständnis-Score', 'Zeigt, wie sicher du ein Thema wirklich beherrschst.'],
  ];
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-5xl px-4 h-16 flex items-center">
        <span className="font-bold text-indigo-700">MatheMentor</span>
        <nav className="ml-auto flex gap-2">
          <Link to="/login" className="px-4 flex items-center rounded-lg hover:bg-slate-100">Anmelden</Link>
          <Link to="/register" className="px-4 flex items-center rounded-lg bg-indigo-600 text-white">Kostenlos starten</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-bold max-w-2xl">Mathe verstehen – in deinem Tempo.</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">Interaktive Kapitel, Aufgaben mit Feedback und Musterlösungen, abgestimmt auf den Lehrplan der Klassen 7–9.</p>
        <Link to="/register" className="mt-8 inline-flex items-center px-6 rounded-xl bg-indigo-600 text-white text-lg">Jetzt loslegen</Link>
      </section>
      <section className="mx-auto max-w-5xl px-4 grid sm:grid-cols-2 gap-4 pb-16">
        {features.map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold">{t}</h2>
            <p className="text-slate-600 mt-1">{d}</p>
          </div>
        ))}
      </section>
      {/* TODO (Entwicklung): Beispielkapitel, Korrektur-Erklärung, Eltern/Lehrer, Preise, FAQ, Kontakt */}
      <footer className="border-t border-slate-200 py-6 text-sm text-slate-500">
        <div className="mx-auto max-w-5xl px-4 flex gap-4">
          <Link to="/legal/datenschutz">Datenschutz</Link>
          <Link to="/legal/impressum">Impressum</Link>
          <Link to="/legal/agb">Nutzungsbedingungen</Link>
        </div>
      </footer>
    </div>
  );
}
