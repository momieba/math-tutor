import { Ban, GraduationCap, School } from 'lucide-react';

/*
 * Vertrauensleiste (C4 §2). „Daten in der EU“ ist bewusst NICHT enthalten: Die Bedingung (Supabase Frankfurt, F1)
 * ist noch nicht erfüllt (Briefing R5 – keine Werbeaussage vor Erfüllung). Ersatz: „Ohne Werbung“ (gilt heute, FAQ 8).
 */
const ITEMS = [
  { icon: GraduationCap, text: 'Orientiert an den Bildungsstandards' },
  { icon: School, text: 'Für Klasse 7–9' },
  { icon: Ban, text: 'Ohne Werbung' },
];

export function TrustBar() {
  return (
    <div className="border-y border-slate-200 bg-white">
      <ul aria-label="Auf einen Blick" className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 py-6">
        {ITEMS.map(({ icon: Icon, text }) => (
          <li key={text} className="inline-flex items-center gap-2 font-medium text-slate-700">
            <Icon aria-hidden="true" size={20} className="text-indigo-700" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
