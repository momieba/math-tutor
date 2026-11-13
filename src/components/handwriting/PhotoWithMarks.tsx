import type { MarkRegion } from '../../types';

/**
 * Foto vom Rechenweg mit Unterstreichungen der Korrektur. Das Bild wird in seinem Seitenverhältnis gezeigt, damit die
 * Stellen (relativ zum Bild, 0..1000) direkt als Prozentwerte darübergelegt werden können.
 */
export function PhotoWithMarks({ src, marks }: { src: string; marks: { color: 'yellow' | 'red'; region: MarkRegion; label: number }[] }) {
  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-b-2xl bg-white">
      <img src={src} alt="Dein Foto vom Rechenweg" className="block h-auto w-full rounded-b-2xl" />
      {marks.map(({ color, region: [y0, x0, y1, x1], label }) => {
        const c = color === 'red' ? 'border-red-600 bg-red-600' : 'border-amber-600 bg-amber-600';
        return (
          <div key={label} aria-hidden="true" className="pointer-events-none absolute" style={{ left: `${x0 / 10}%`, top: `${y0 / 10}%`, width: `${(x1 - x0) / 10}%`, height: `${(y1 - y0) / 10}%` }}>
            <div className={`absolute inset-x-0 -bottom-1 border-b-[3px] border-dashed ${c} bg-transparent`} />
            <span className={`absolute -right-7 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-white ${c}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
