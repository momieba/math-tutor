import { Camera, Eraser, PenLine, Ruler, Save, Undo2, ZoomIn } from 'lucide-react';
import type { ReactNode } from 'react';
import { Section, SoonBadge } from './Section';

const TOOLS = [
  { icon: PenLine, text: 'Stift oder Finger' },
  { icon: Eraser, text: 'Radierer' },
  { icon: Ruler, text: 'Gerade Linien' },
  { icon: ZoomIn, text: 'Zoom' },
  { icon: Undo2, text: 'Rückgängig' },
  { icon: Save, text: 'Rechenweg wird gespeichert' },
];

/** Tablet- und Stift-Erlebnis (C4 §5), dunkler Abschnitt als ruhiger Kontrast. */
export function TabletSection({ media }: { media?: ReactNode }) {
  return (
    <Section
      id="tablet"
      tone="dark"
      eyebrow="Tablet und Stift"
      title="Rechnen wie auf Papier – nur mit Rückgängig-Knopf."
      intro="Schreib mit Apple Pencil, einem anderen Stift oder dem Finger. Radierer, Linien, Zoom und Rückgängig sind dabei. Dein Rechenweg wird gespeichert, damit du ihn später wiederfindest."
    >
      <div className={`grid items-center gap-12 ${media ? 'md:grid-cols-[1fr_auto]' : ''}`}>
        <div>
          <ul aria-label="Werkzeuge der Schreibfläche" className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-slate-800 p-4 font-medium text-white">
                <Icon aria-hidden="true" size={24} className="shrink-0 text-indigo-200" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <Camera aria-hidden="true" size={24} className="shrink-0 text-indigo-200" />
            <p className="text-slate-200">Aufgabe auf Papier lösen und einfach abfotografieren.</p>
            <SoonBadge />
          </div>
        </div>
        {media}
      </div>
    </Section>
  );
}
