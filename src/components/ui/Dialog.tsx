import { useEffect, useId, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  /** Buttons am Fuß des Dialogs. */
  actions: ReactNode;
  icon?: ReactNode;
}

/**
 * Modaler Dialog auf Basis des nativen `<dialog>`: Fokusfalle, Escape zum Schließen und
 * „inert“-Hintergrund liefert der Browser. Wird nur gerendert, solange er offen ist.
 */
export function Dialog({ open, title, onClose, children, actions, icon }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    if (!el.open && typeof el.showModal === 'function') el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl bg-white p-6 shadow-lg text-slate-900 animate-slide-up"
    >
      <div className="flex gap-4">
        {icon && (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-800" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="space-y-2 min-w-0">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          {children && <div className="text-slate-700">{children}</div>}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">{actions}</div>
    </dialog>
  );
}
