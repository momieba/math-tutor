import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';

export interface Crumb {
  label: string;
  /** Ohne `to` ist es die aktuelle Seite (kein Link). */
  to?: string;
}

/** Einheitliche Brotkrumen-Navigation für Unterseiten. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Brotkrumen" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-x-1">
        {items.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <ChevronRight aria-hidden="true" size={16} className="text-slate-400" />}
            <li className="flex items-center">
              {c.to ? (
                <Link to={c.to} className="min-h-11 inline-flex items-center rounded-lg px-1 font-medium text-indigo-700 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="px-1">
                  {c.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
