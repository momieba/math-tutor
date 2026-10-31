import { Calculator, Percent, Shapes, Sigma, type LucideIcon } from 'lucide-react';

export interface AreaVisual {
  Icon: LucideIcon;
  /** Hintergrund + Textfarbe der Icon-Fläche (Kontrast AA, Bedeutung nie nur über Farbe – immer mit Icon und Text). */
  cls: string;
}

/** Themengebiet → Icon und Farbfläche (Briefing C2: Geometrie sky, Zahlen/Prozent violet, Algebra emerald). */
const AREAS: { match: RegExp; visual: AreaVisual }[] = [
  { match: /geometr/i, visual: { Icon: Shapes, cls: 'bg-sky-100 text-sky-800' } },
  { match: /prozent|zahl|größe|arithmet/i, visual: { Icon: Percent, cls: 'bg-violet-100 text-violet-700' } },
  { match: /algebra|gleichung|funktion/i, visual: { Icon: Sigma, cls: 'bg-emerald-100 text-emerald-800' } },
];

const FALLBACK: AreaVisual = { Icon: Calculator, cls: 'bg-indigo-100 text-indigo-800' };

export function areaVisual(area: string): AreaVisual {
  return AREAS.find((a) => a.match.test(area))?.visual ?? FALLBACK;
}
