import { Section, SoonBadge } from './Section';

/*
 * Für Eltern (C4 §7, Sie-Form) und für Lehrkräfte (C4 §8). Beide Bereiche gibt es noch nicht → ehrlich gekennzeichnet.
 * Zurückgehalten (Bedingung F1/F10 nicht erfüllt, Briefing R5): „Die Daten werden in der EU gespeichert“.
 * Die Illustrationen sind eigene, dekorative SVGs (keine Screenshots, weil die Ansichten noch nicht existieren).
 */

function ParentsIllustration() {
  const bars = [
    { label: 'Pythagoras', w: 82, cls: 'fill-emerald-500' },
    { label: 'Prozent', w: 58, cls: 'fill-indigo-500' },
    { label: 'Gleichungen', w: 34, cls: 'fill-amber-300' },
  ];
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="320" height="160" rx="16" className="fill-indigo-50" />
      {bars.map((b, i) => (
        <g key={b.label} transform={`translate(24 ${28 + i * 40})`}>
          <rect width="272" height="16" rx="8" className="fill-white" />
          <rect width={(272 * b.w) / 100} height="16" rx="8" className={b.cls} />
        </g>
      ))}
    </svg>
  );
}

function TeachersIllustration() {
  const cells = Array.from({ length: 12 }, (_, i) => i);
  const tone = ['fill-emerald-500', 'fill-emerald-500', 'fill-indigo-500', 'fill-amber-300'];
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="320" height="160" rx="16" className="fill-sky-100" />
      {cells.map((i) => (
        <g key={i} transform={`translate(${36 + (i % 6) * 44} ${36 + Math.floor(i / 6) * 52})`}>
          <circle cx="14" cy="14" r="14" className="fill-white" />
          <circle cx="14" cy="14" r="7" className={tone[(i * 7) % 4]} />
        </g>
      ))}
    </svg>
  );
}

export function Audiences() {
  return (
    <Section id="eltern" tone="white" eyebrow="Für Eltern und Lehrkräfte" title="Gemeinsam im Blick behalten">
      <div className="grid gap-6 md:grid-cols-2">
        <article aria-labelledby="eltern-karte" className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <ParentsIllustration />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h3 id="eltern-karte" className="text-2xl font-semibold">
              Für Eltern
            </h3>
            <SoonBadge>Kommt bald</SoonBadge>
          </div>
          <p className="mt-2 text-lg font-medium">Sehen, wie es läuft – ohne selbst Mathe-Lehrer zu sein.</p>
          <p className="mt-2 text-slate-600">
            Sie sehen auf einen Blick, welche Themen Ihr Kind übt, was schon sicher sitzt und wo Übung hilft. Ohne Fachbegriffe, ohne dass Sie
            Aufgaben kontrollieren müssen.
          </p>
          <p className="mt-4 text-slate-600">Wir verkaufen keine Daten und nutzen sie nicht für Werbung.</p>
        </article>
        <article id="lehrkraefte" aria-labelledby="lehrkraefte-karte" className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <TeachersIllustration />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h3 id="lehrkraefte-karte" className="text-2xl font-semibold">
              Für Lehrkräfte
            </h3>
            <SoonBadge>Später</SoonBadge>
          </div>
          <p className="mt-2 text-lg font-medium">Den Lernstand der Lerngruppe im Blick.</p>
          <p className="mt-2 text-slate-600">
            Erkennen Sie, wo Ihre Schüler sicher sind und wo Lücken bestehen. Mit Ihrer ausdrücklich erteilten Berechtigung.
          </p>
        </article>
      </div>
    </Section>
  );
}
