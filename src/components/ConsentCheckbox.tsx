import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { CONSENT_AGE } from '../config/legal';

const legalLink = 'inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-indigo-700 underline';

/**
 * Einwilligung (Registrierung und Einwilligungsseite): Häkchen und Rechtstexte mit Touch-Zielen ≥ 44 px.
 * Die Rechtstexte öffnen in einem neuen Tab, damit bereits getippte Eingaben erhalten bleiben.
 */
export function ConsentCheckbox({ checked, onChange, required = false }: { checked: boolean; onChange: (checked: boolean) => void; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          required={required}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-11 w-11 flex-none accent-indigo-600"
        />
        <span className="pt-1">
          Ich bin mit der Datenschutzerklärung und den Nutzungsbedingungen einverstanden. Wenn ich jünger als {CONSENT_AGE} bin, sind meine Eltern
          einverstanden.
        </span>
      </label>
      <p className="flex flex-wrap gap-x-2 pl-12 text-sm">
        <Link to="/legal/datenschutz" target="_blank" rel="noopener" className={legalLink}>
          Datenschutzerklärung <ExternalLink aria-hidden="true" size={14} />
        </Link>
        <Link to="/legal/agb" target="_blank" rel="noopener" className={legalLink}>
          Nutzungsbedingungen <ExternalLink aria-hidden="true" size={14} />
        </Link>
      </p>
    </div>
  );
}
