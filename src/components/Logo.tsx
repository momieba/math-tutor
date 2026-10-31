import { Sigma } from 'lucide-react';
import { PRODUCT_NAME } from '../config/brand';

/** Wortbildmarke: Sigma-Symbol + Produktname (Platzhalter bis Entscheidung R4). */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${inverted ? 'text-white' : 'text-slate-900'}`}>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${inverted ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}
        aria-hidden="true"
      >
        <Sigma size={20} strokeWidth={2.5} />
      </span>
      {PRODUCT_NAME}
    </span>
  );
}
