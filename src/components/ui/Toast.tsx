import { CircleCheck, Info } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

const DURATION_MS = 3500;

/**
 * Kurze, nicht blockierende Bestätigungen („Gespeichert“). Die Live-Region ist ein `div`,
 * damit sie nicht mit dem Feedback-Bereich (`section[role=status]`) verwechselt wird.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, message, tone }]);
    const t = setTimeout(() => {
      timers.current.delete(t);
      setItems((list) => list.filter((i) => i.id !== id));
    }, DURATION_MS);
    timers.current.add(t);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-white shadow-lg animate-slide-up">
            {t.tone === 'success' ? <CircleCheck aria-hidden="true" size={20} className="text-emerald-200" /> : <Info aria-hidden="true" size={20} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
