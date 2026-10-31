import { CircleCheck, CircleHelp, CircleX, type LucideIcon } from 'lucide-react';
import { MathText } from '../MathText';
import { Tag } from '../ui';

type Verdict = 'correct' | 'wrong' | 'unclear';

const STYLE: Record<Verdict, { label: string; icon: LucideIcon; box: string; text: string }> = {
  correct: { label: 'Richtig', icon: CircleCheck, box: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700' },
  wrong: { label: 'Fehler', icon: CircleX, box: 'border-red-200 bg-red-50', text: 'text-red-700' },
  unclear: { label: 'Unsicher', icon: CircleHelp, box: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
};

/** Beispielzeilen aus C4 §6. Rein statische Demo – keine echte Auswertung. */
const ROWS: { verdict: Verdict; math: string; note?: string }[] = [
  { verdict: 'correct', math: 'c^2 = a^2 + b^2' },
  { verdict: 'correct', math: 'c^2 = 8^2 + 15^2 = 64 + 225' },
  { verdict: 'wrong', math: 'c^2 = 279', note: 'Kleiner Rechenfehler: 64 + 225 = 289.' },
  { verdict: 'unclear', math: 'c = 1?\\,\\text{cm}', note: 'Diese Ziffer kann ich nicht sicher lesen. Meinst du 17?' },
];

/**
 * Korrektur-Beispiel als echte UI-Komponente (nicht als Bild): Status immer mit Icon UND Text (WCAG 1.4.1),
 * Formeln mit KaTeX. Wird per React.lazy geladen, damit KaTeX nicht im Hauptbundle landet.
 */
export default function CorrectionDemo() {
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <figcaption>
        <Tag>Beispiel</Tag>
        <p className="mt-3 text-lg font-semibold">Katheten 8 cm und 15 cm – wie lang ist die Hypotenuse?</p>
      </figcaption>
      <ol className="mt-6 space-y-3">
        {ROWS.map((r) => {
          const s = STYLE[r.verdict];
          const Icon = s.icon;
          return (
            <li key={r.math} className={`flex items-start gap-3 rounded-xl border p-4 ${s.box}`}>
              <Icon aria-hidden="true" size={24} className={`mt-0.5 shrink-0 ${s.text}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${s.text}`}>{s.label}</p>
                <MathText text={`$${r.math}$`} className="mt-1 block text-lg text-slate-900" />
                {r.note && <p className="mt-1 text-slate-700">{r.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
