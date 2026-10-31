import type { ReactNode } from 'react';
import { Section } from './Section';

const STEPS = [
  {
    title: 'Sag, was du lernen willst',
    text: 'Tippe zum Beispiel „Satz des Pythagoras“ oder „Prozentrechnung für die Mathearbeit“. Die App findet das passende Thema.',
  },
  { title: 'Lerne in kurzen Kapiteln', text: 'Einführung, Merksätze, Beispiel, Video. Alles in Häppchen.' },
  { title: 'Üben und besser werden', text: 'Löse Aufgaben, hol dir Hinweise und sieh, wie dein Verständnis wächst.' },
];

/**
 * „So funktioniert's“ in drei nummerierten Schritten (C4 §4).
 * `media[i]` ist optional ein Bild zu Schritt i; die Reihen wechseln dann die Seite (Zickzack-Layout).
 */
export function HowItWorks({ media = [] }: { media?: ReactNode[] }) {
  return (
    <Section id="so-gehts" tone="white" eyebrow="So funktioniert’s" title="In drei Schritten zur ersten Aufgabe">
      <ol className="space-y-12 lg:space-y-16">
        {STEPS.map((s, i) => (
          <li key={s.title} className={`grid items-center gap-8 ${media[i] ? 'md:grid-cols-2' : ''}`}>
            <div className={media[i] && i % 2 === 1 ? 'md:order-2' : ''}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-4 text-2xl font-semibold">
                <span className="sr-only">Schritt {i + 1}: </span>
                {s.title}
              </h3>
              <p className="mt-2 max-w-prose text-lg text-slate-600">{s.text}</p>
            </div>
            {media[i]}
          </li>
        ))}
      </ol>
    </Section>
  );
}
