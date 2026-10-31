import { BookOpen, CircleCheck, Lightbulb, ListChecks, PenLine, TrendingUp } from 'lucide-react';
import { Section } from './Section';

const FEATURES = [
  { icon: BookOpen, title: 'Erklärt in kleinen Schritten', text: 'Jedes Kapitel erklärt genau eine Sache: mit Merksatz, Beispiel und Video.' },
  { icon: PenLine, title: 'Rechnen mit dem Stift', text: 'Schreib deinen Rechenweg wie auf Papier, direkt auf dem Bildschirm.' },
  { icon: CircleCheck, title: 'Sofort Rückmeldung', text: 'Du siehst gleich, ob es stimmt, und wenn nicht, warum.' },
  { icon: Lightbulb, title: 'Hinweise, wenn du hängst', text: 'Drei Hinweise, Schritt für Schritt. So kommst du selbst auf die Lösung.' },
  { icon: ListChecks, title: 'Musterlösungen, die erklären', text: 'Nicht nur das Ergebnis, sondern warum der Weg funktioniert.' },
  { icon: TrendingUp, title: 'Dein Verständnis-Score', text: 'Zeigt ehrlich, was schon sicher sitzt und was du wiederholen solltest.' },
];

/** Sechs Funktionskarten (C4 §3). */
export function Features() {
  return (
    <Section id="funktionen" eyebrow="Funktionen" title="Alles, was du zum Üben brauchst" intro="Kein Durcheinander: Erklärung, Übung und Rückmeldung an einem Ort.">
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700" aria-hidden="true">
              <Icon size={24} />
            </span>
            <h3 className="mt-4 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-slate-600">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
