import type { ReactNode } from 'react';
import type { Figure } from '../../types';

/** Abbildung zu einer Aufgabe: deklarativ beschrieben (types/content.ts), als SVG gezeichnet. `alt` beschreibt sie für Screenreader. */
export function ExerciseFigure({ figure }: { figure: Figure }) {
  if (figure.kind === 'coordinate-plane') return <CoordinatePlane figure={figure} />;
  if (figure.kind === 'circle') return <CircleFigure figure={figure} />;
  if (figure.src) return <img src={figure.src} alt={figure.alt} className="max-h-80 rounded-xl border border-slate-200" />;
  return <p className="text-sm text-slate-600 italic">Abbildung: {figure.alt}</p>;
}

const UNIT = 28; // px je Einheit
const PAD = 22;

function CoordinatePlane({ figure }: { figure: Extract<Figure, { kind: 'coordinate-plane' }> }) {
  const [x0, x1] = figure.x;
  const [y0, y1] = figure.y;
  const width = (x1 - x0) * UNIT + 2 * PAD;
  const height = (y1 - y0) * UNIT + 2 * PAD;
  const sx = (x: number) => PAD + (x - x0) * UNIT;
  const sy = (y: number) => PAD + (y1 - y) * UNIT;
  const xs = range(Math.ceil(x0), Math.floor(x1));
  const ys = range(Math.ceil(y0), Math.floor(y1));

  /** Gerade y = mx + b, auf den sichtbaren Ausschnitt zugeschnitten. */
  const segment = (m: number, b: number) => {
    const pts: [number, number][] = [];
    for (const x of [x0, x1]) {
      const y = m * x + b;
      if (y >= y0 - 1e-9 && y <= y1 + 1e-9) pts.push([x, y]);
    }
    if (m !== 0) {
      for (const y of [y0, y1]) {
        const x = (y - b) / m;
        if (x > x0 && x < x1) pts.push([x, y]);
      }
    }
    pts.sort((p, q) => p[0] - q[0]);
    return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
  };

  return (
    <figure className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={figure.alt} className="max-w-full h-auto">
        {xs.map((x) => (
          <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={sy(y0)} y2={sy(y1)} className="stroke-slate-200" strokeWidth={1} />
        ))}
        {ys.map((y) => (
          <line key={`gy${y}`} y1={sy(y)} y2={sy(y)} x1={sx(x0)} x2={sx(x1)} className="stroke-slate-200" strokeWidth={1} />
        ))}
        {y0 <= 0 && y1 >= 0 && <line x1={sx(x0)} x2={sx(x1)} y1={sy(0)} y2={sy(0)} className="stroke-slate-700" strokeWidth={1.5} />}
        {x0 <= 0 && x1 >= 0 && <line x1={sx(0)} x2={sx(0)} y1={sy(y0)} y2={sy(y1)} className="stroke-slate-700" strokeWidth={1.5} />}
        {xs
          .filter((x) => x !== 0)
          .map((x) => (
            <text key={`tx${x}`} x={sx(x)} y={sy(0) + 14} textAnchor="middle" className="fill-slate-600 text-[11px]">
              {x}
            </text>
          ))}
        {ys
          .filter((y) => y !== 0)
          .map((y) => (
            <text key={`ty${y}`} x={sx(0) - 6} y={sy(y) + 4} textAnchor="end" className="fill-slate-600 text-[11px]">
              {y}
            </text>
          ))}
        <text x={sx(x1) - 4} y={sy(0) - 6} textAnchor="end" className="fill-slate-800 text-[12px] italic">
          x
        </text>
        <text x={sx(0) + 6} y={sy(y1) + 10} className="fill-slate-800 text-[12px] italic">
          y
        </text>
        {(figure.lines ?? []).map((l, i) => {
          const seg = segment(l.m, l.b);
          if (!seg) return null;
          const [[ax, ay], [bx, by]] = seg;
          return (
            <g key={`l${i}`} className={LINE_COLORS[i % LINE_COLORS.length]}>
              <line x1={sx(ax)} y1={sy(ay)} x2={sx(bx)} y2={sy(by)} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
              {l.label && (
                <text x={sx(bx) - 4} y={sy(by) + (by >= y1 - 0.01 ? 14 : -6)} textAnchor="end" fill="currentColor" className="text-[12px] font-semibold">
                  {l.label}
                </text>
              )}
            </g>
          );
        })}
        {(figure.points ?? []).map((p, i) => (
          <g key={`p${i}`} className="text-rose-700">
            <circle cx={sx(p.x)} cy={sy(p.y)} r={4} fill="currentColor" />
            {p.label && (
              <text x={sx(p.x) + 6} y={sy(p.y) - 6} fill="currentColor" className="text-[12px] font-semibold">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">{figure.alt}</figcaption>
    </figure>
  );
}

const LINE_COLORS = ['text-indigo-700', 'text-emerald-700', 'text-amber-700'];

function CircleFigure({ figure }: { figure: Extract<Figure, { kind: 'circle' }> }) {
  const size = 220;
  const c = size / 2;
  const r = 80;
  const angle = figure.angle;
  const inner = figure.inner ? r * figure.inner : 0;
  const point = (deg: number, radius: number) => [c + radius * Math.cos((-deg * Math.PI) / 180), c + radius * Math.sin((-deg * Math.PI) / 180)] as const;

  let shape: ReactNode;
  if (angle !== undefined && angle < 360) {
    const [ex, ey] = point(angle, r);
    const large = angle > 180 ? 1 : 0;
    shape = (
      <>
        <circle cx={c} cy={c} r={r} className="fill-none stroke-slate-300" strokeDasharray="4 4" />
        <path d={`M ${c} ${c} L ${c + r} ${c} A ${r} ${r} 0 ${large} 0 ${ex} ${ey} Z`} className="fill-indigo-100 stroke-indigo-700" strokeWidth={2} />
        <path d={`M ${c + 22} ${c} A 22 22 0 ${large} 0 ${point(angle, 22).join(' ')}`} className="fill-none stroke-slate-700" />
      </>
    );
  } else if (inner > 0) {
    shape = (
      <>
        <circle cx={c} cy={c} r={r} className="fill-indigo-100 stroke-indigo-700" strokeWidth={2} />
        <circle cx={c} cy={c} r={inner} className="fill-white stroke-indigo-700" strokeWidth={2} />
      </>
    );
  } else {
    shape = <circle cx={c} cy={c} r={r} className="fill-indigo-100 stroke-indigo-700" strokeWidth={2} />;
  }
  const radiusAngle = angle !== undefined && angle < 360 ? 0 : -30;
  const [rx, ry] = point(radiusAngle, r);
  const [lx, ly] = point(radiusAngle, r / 2);
  const [ax, ay] = point((angle ?? 0) / 2, 36);

  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={figure.alt} className="max-w-full h-auto">
        {shape}
        <line x1={c} y1={c} x2={rx} y2={ry} className="stroke-slate-800" strokeWidth={2} />
        <circle cx={c} cy={c} r={3} className="fill-slate-800" />
        {figure.labels?.r && (
          <text x={lx} y={ly + (radiusAngle === 0 ? 16 : -8)} textAnchor="middle" className="fill-slate-900 text-[13px] font-semibold">
            {figure.labels.r}
          </text>
        )}
        {figure.labels?.angle && angle !== undefined && (
          <text x={ax} y={ay} textAnchor="middle" className="fill-slate-900 text-[12px]">
            {figure.labels.angle}
          </text>
        )}
        {figure.labels?.inner && inner > 0 && (
          <>
            <line x1={c} y1={c} x2={c - inner} y2={c} className="stroke-slate-800" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={c - inner / 2} y={c - 6} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">
              {figure.labels.inner}
            </text>
          </>
        )}
      </svg>
      <figcaption className="sr-only">{figure.alt}</figcaption>
    </figure>
  );
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}
