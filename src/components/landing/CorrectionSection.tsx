import { CircleCheck, CircleHelp, CircleX } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui';
import { Section } from './Section';

const CorrectionDemo = lazy(() => import('./CorrectionDemo'));

const LEGEND = [
  { icon: CircleCheck, cls: 'text-emerald-700', label: 'Grün', text: 'Stimmt.' },
  { icon: CircleX, cls: 'text-red-700', label: 'Rot', text: 'Hier hat sich ein Fehler eingeschlichen – mit kurzer Erklärung.' },
  { icon: CircleHelp, cls: 'text-amber-700', label: 'Gelb', text: 'Nicht sicher lesbar – die App fragt lieber nach, statt falsch zu bewerten.' },
];

/** Automatische Korrektur (C4 §6) mit ehrlichem Hinweis auf den heutigen Funktionsumfang. */
export function CorrectionSection() {
  return (
    <Section id="korrektur" eyebrow="Automatische Korrektur" title="Sieh genau, wo es hakt.">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <ul className="space-y-4">
            {LEGEND.map(({ icon: Icon, cls, label, text }) => (
              <li key={label} className="flex items-start gap-3 text-lg">
                <Icon aria-hidden="true" size={24} className={`mt-0.5 shrink-0 ${cls}`} />
                <p>
                  <strong className={cls}>{label}</strong> <span className="text-slate-700">{text}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Ehrlich gesagt: Die Prüfung jedes einzelnen Rechenschritts ist in Entwicklung. Heute prüft die App dein Ergebnis.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-[26rem] rounded-2xl" />}>
          <CorrectionDemo />
        </Suspense>
      </div>
    </Section>
  );
}
