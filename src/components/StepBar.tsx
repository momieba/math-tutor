import { PATH_STEP_LABEL, PATH_STEPS, type PathStep } from '../domain/learningPath';

/**
 * Dezente Schrittleiste des Lernpfads: sechs Punkte und „Schritt n von 6 · Name“.
 * Einstieg und Erklärung lassen sich jederzeit erneut öffnen (`onOpen`), die übrigen Schritte ergeben sich aus dem Üben.
 */
export function StepBar({ current, onOpen }: { current: PathStep; onOpen?: (step: 'intro' | 'explain') => void }) {
  const index = PATH_STEPS.indexOf(current);
  return (
    <nav aria-label="Lernpfad" className="space-y-2">
      <p className="text-sm text-slate-600">
        Schritt {index + 1} von {PATH_STEPS.length} · <span className="font-medium text-slate-800">{PATH_STEP_LABEL[current]}</span>
      </p>
      <ol className="flex items-center gap-1.5">
        {PATH_STEPS.map((s, i) => {
          const cls = `h-2 w-full rounded-full ${i < index ? 'bg-indigo-300' : i === index ? 'bg-indigo-600' : 'bg-slate-200'}`;
          const openable = onOpen && (s === 'intro' || s === 'explain') && s !== current;
          return (
            <li key={s} className="flex-1" aria-current={i === index ? 'step' : undefined}>
              {openable ? (
                <button type="button" onClick={() => onOpen(s)} className="flex min-h-11 w-full items-center" aria-label={`${PATH_STEP_LABEL[s]} nochmal ansehen`}>
                  <span className={cls} />
                </button>
              ) : (
                <span className="flex min-h-11 w-full items-center" title={PATH_STEP_LABEL[s]}>
                  <span className={cls} />
                  <span className="sr-only">{PATH_STEP_LABEL[s]}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
