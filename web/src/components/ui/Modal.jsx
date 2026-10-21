import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function useDismiss(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
}

/** Centred dialog used for quick view. */
export function Modal({ open, onClose, title, children, footer, size = 'lg' }) {
  const panelRef = useRef(null);
  useDismiss(open, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl border border-line bg-surface-panel shadow-card animate-fade-up sm:rounded-xl ${
          widths[size] ?? widths.lg
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-ink">{title}</h3>
          <button type="button" onClick={onClose} className="th-icon-btn -mr-2 -mt-1" aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-line-soft px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

/** Slide-over panel used for the cart and the mobile filters / navigation. */
export function Drawer({ open, onClose, title, side = 'right', children, footer, widthClass = 'sm:max-w-md' }) {
  const panelRef = useRef(null);
  useDismiss(open, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const isRight = side === 'right';

  return (
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute top-0 flex h-full w-full flex-col border-line bg-surface-panel shadow-card ${
          isRight ? `right-0 border-l ${widthClass} animate-slide-in` : 'left-0 border-r max-w-xs animate-slide-in-left'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="th-icon-btn -mr-2" aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-line-soft px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
