import { CircleCheck } from 'lucide-react';
import type { Choice } from '../types';
import { MathText } from './MathText';

/** Multiple Choice: große, gut treffbare Optionen (Tablet); Auswahl mit Rahmen, Farbe und Häkchen-Icon. */
export function ChoiceInput({ choices, value, onChange, disabled }: { choices: Choice[]; value: string; onChange: (id: string) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Antwortmöglichkeiten" className="grid gap-3 sm:grid-cols-2">
      {choices.map((c) => {
        const selected = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(c.id)}
            className={`group flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg transition-colors duration-150 active:scale-[0.99] ${
              selected ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300'
            } disabled:opacity-70`}
          >
            <span
              className={`flex h-9 min-w-9 flex-none items-center justify-center rounded-full px-2 text-base font-semibold ${
                selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {c.id})
            </span>
            <span className="flex-1 min-w-0">
              <MathText text={c.label} />
            </span>
            {selected && <CircleCheck aria-hidden="true" size={24} className="flex-none text-indigo-700" />}
          </button>
        );
      })}
    </div>
  );
}

const inputCls =
  'w-full min-h-12 rounded-lg border-2 border-slate-500 bg-white px-4 py-3 text-xl text-slate-900 placeholder:text-slate-500 ' +
  'focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-700';

/** Zahleneingabe: `inputMode="decimal"` öffnet die Zahlentastatur; Komma und Punkt werden von evaluate.ts akzeptiert. */
export function NumericInput({ value, onChange, unit, disabled, id }: { value: string; onChange: (v: string) => void; unit?: string; disabled?: boolean; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold mb-2">
        Dein Ergebnis{unit ? ` (in ${unit})` : ''}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="z. B. 8,5"
          className={inputCls}
        />
        {unit && <span className="text-lg text-slate-600">{unit}</span>}
      </div>
      <p className="text-sm text-slate-600 mt-1">Komma oder Punkt sind beide erlaubt.</p>
    </div>
  );
}

/**
 * Gleichung/Text mit KaTeX-Vorschau. Die Vorschau interpretiert die Eingabe als LaTeX-artige Schreibweise
 * (`x^2`, `\sqrt{…}`); bewertet wird aber die rohe Eingabe (evaluate.ts normalisiert sie).
 */
export function MathInput({
  value,
  onChange,
  disabled,
  id,
  label,
  placeholder,
  preview = true,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id: string;
  label: string;
  placeholder?: string;
  preview?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      {preview && value.trim() && (
        <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 overflow-x-auto" aria-label="Vorschau">
          <span className="text-sm text-slate-600 mr-2">Vorschau:</span>
          <MathText text={toPreviewLatex(value)} display />
        </div>
      )}
    </div>
  );
}

/** Wandelt eine Schülereingabe in darstellbares LaTeX (nur Anzeige, keine Bewertung). */
export function toPreviewLatex(raw: string): string {
  return raw
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\bsqrt\(([^)]*)\)/gi, '\\sqrt{$1}')
    .replace(/√\(([^)]*)\)/g, '\\sqrt{$1}')
    .replace(/√(\d+)/g, '\\sqrt{$1}')
    .replace(/\*/g, '\\cdot ')
    .replace(/·/g, '\\cdot ')
    .replace(/%/g, '\\%');
}
