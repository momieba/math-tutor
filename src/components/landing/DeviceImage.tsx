/**
 * App-Screenshot in einem neutralen, selbst gebauten Tablet-Rahmen (ohne Herstellerlogo, Briefing C3).
 * Bilder liegen lokal unter public/images/landing/<name>-<breite>.webp (erzeugt mit `npm run images:landing`).
 */
export type Orientation = 'landscape' | 'portrait';

const SPEC: Record<Orientation, { widths: number[]; w: number; h: number }> = {
  // Seitenverhältnis des Aufnahme-Viewports (iPad Pro 11": 1194×834 bzw. 834×1194)
  landscape: { widths: [640, 1280, 1920], w: 1194, h: 834 },
  portrait: { widths: [640, 1280], w: 834, h: 1194 },
};

interface DeviceImageProps {
  name: string;
  alt: string;
  orientation?: Orientation;
  /** `sizes`-Attribut: angezeigte Breite je Viewport. */
  sizes: string;
  /** Hero-Bild: sofort und mit hoher Priorität laden (LCP). */
  priority?: boolean;
  className?: string;
}

export function DeviceImage({ name, alt, orientation = 'landscape', sizes, priority = false, className = '' }: DeviceImageProps) {
  const { widths, w, h } = SPEC[orientation];
  const src = (px: number) => `/images/landing/${name}-${px}.webp`;
  return (
    <div className={`rounded-[1.75rem] bg-slate-900 p-3 shadow-lg ring-1 ring-slate-900/10 ${className}`}>
      <img
        src={src(widths[1] ?? widths[0])}
        srcSet={widths.map((px) => `${src(px)} ${px}w`).join(', ')}
        sizes={sizes}
        width={w}
        height={h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className="block h-auto w-full rounded-2xl bg-white"
      />
    </div>
  );
}
