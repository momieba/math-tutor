import { DIFFICULTY_LABEL } from '../domain/progressView';
import type { Difficulty } from '../types';

/** Aktuelle Übungsstufe: drei Balken plus Text (Bedeutung nie nur über Farbe). */
export function LevelIndicator({ level }: { level: Difficulty }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Aktuelle Stufe: ${DIFFICULTY_LABEL[level]}`}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((l) => (
          <span key={l} className={`w-1.5 rounded-sm ${l <= level ? 'bg-indigo-600' : 'bg-slate-300'}`} style={{ height: `${6 + l * 4}px` }} />
        ))}
      </span>
      <span className="text-sm font-medium text-slate-700">Stufe: {DIFFICULTY_LABEL[level]}</span>
    </span>
  );
}
