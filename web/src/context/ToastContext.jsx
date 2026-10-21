import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, ring: 'border-success/40', ink: 'text-success' },
  error: { icon: TriangleAlert, ring: 'border-sale/40', ink: 'text-sale' },
  info: { icon: Info, ring: 'border-brand/40', ink: 'text-brand' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.duration ?? 4200);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.info;
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border ${tone.ring} bg-surface-panel/95 p-3.5 shadow-card backdrop-blur animate-fade-up`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.ink}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {toast.title ? <p className="text-sm font-semibold text-ink">{toast.title}</p> : null}
                {toast.message ? (
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{toast.message}</p>
                ) : null}
                {toast.action ? <div className="mt-2">{toast.action}</div> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="th-icon-btn h-6 w-6 shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
