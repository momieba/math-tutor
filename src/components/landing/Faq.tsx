import { ChevronDown } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Link } from 'react-router';
import { PRODUCT_NAME } from '../../config/brand';
import { Section } from './Section';

/*
 * FAQ (C4 §10). Angepasst an den heutigen Stand (Briefing R5, keine Aussagen vor Erfüllung der Bedingung):
 *  - Frage 3: Android/Desktop sind nicht gezielt getestet → keine Geräteliste, nur „im Browser, auch mit Finger/Maus“.
 *  - Frage 5: „in der EU“ zurückgehalten (F1); Export/Löschung sind geplant, nicht umgesetzt → als Vorhaben formuliert.
 */
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: `Für welche Klassen ist ${PRODUCT_NAME}?`,
    a: 'Aktuell für die Klassen 7 bis 9, mit Themen wie Satz des Pythagoras, Prozentrechnung und quadratischen Gleichungen. Weitere folgen.',
  },
  {
    q: 'Passt das zum Lehrplan in meinem Bundesland?',
    a: 'Die Inhalte orientieren sich an den bundesweiten Bildungsstandards. Die Lehrpläne der Länder unterscheiden sich im Detail; die Anpassung je Bundesland ist geplant.',
  },
  {
    q: 'Brauche ich ein iPad und einen Stift?',
    a: 'Am schönsten ist es mit Tablet und Stift. Die App läuft im Browser, ganz ohne Installation, und lässt sich auch mit dem Finger oder der Maus bedienen.',
  },
  {
    q: 'Wie funktioniert die Korrektur? Ist KI dabei?',
    a: 'Heute prüft die App Ergebnisse nach festen, geprüften Regeln. Eine KI-gestützte Prüfung von Rechenwegen ist in Entwicklung. Unsichere Fälle werden nie einfach als falsch gewertet.',
  },
  {
    q: 'Was passiert mit den Daten meines Kindes?',
    a: (
      <>
        Wir speichern nur, was für das Lernen nötig ist. Keine Werbung, kein Verkauf. Daten exportieren und löschen zu können, ist fest eingeplant
        und kommt vor dem offiziellen Start. Mehr dazu in der{' '}
        <Link to="/legal/datenschutz" className="font-medium text-indigo-700 underline underline-offset-2">
          Datenschutzerklärung
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Ersetzt die App Nachhilfe oder Unterricht?',
    a: 'Nein, sie ergänzt sie. Sie hilft beim selbstständigen Üben und zeigt, wo Unterstützung sinnvoll ist.',
  },
  { q: 'Kann ich jederzeit kündigen?', a: 'Ja. Die Details folgen mit dem Start der Abos.' },
  { q: 'Gibt es Werbung in der App?', a: 'Nein.' },
];

/** Zugängliches Akkordeon: Button mit aria-expanded/aria-controls, Antwort als Region (WAI-ARIA Accordion Pattern). */
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  return (
    <Section id="faq" tone="white" eyebrow="FAQ" title="Häufige Fragen">
      <div className="max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {FAQ.map((item, i) => {
          const expanded = open === i;
          const btnId = `${baseId}-q${i}`;
          const panelId = `${baseId}-a${i}`;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  id={btnId}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-6 py-3 text-left text-lg font-semibold hover:bg-slate-50"
                >
                  {item.q}
                  <ChevronDown aria-hidden="true" size={24} className={`shrink-0 text-slate-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={btnId} hidden={!expanded} className="px-6 pb-6 text-slate-700">
                <p className="max-w-prose">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
