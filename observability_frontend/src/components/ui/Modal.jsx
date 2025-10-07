import React, { useEffect } from 'react';
import clsx from 'clsx';

/**
 * Accessible modal dialog with overlay.
 * Controlled via open prop and onClose callback.
 */

// PUBLIC_INTERFACE
export default function Modal({ open, onClose, title, children, footer, size = 'md', className = '' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={clsx(
            'w-full rounded-2xl bg-[var(--surface-700,#111827)] text-white border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
            sizes[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title ? (
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold">{title}</h3>
              <button
                aria-label="Close modal"
                className="p-2 rounded-lg hover:bg-white/10"
                onClick={() => onClose?.()}
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293A1 1 0 014.293 14.293L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ) : null}
          <div className="px-6 py-4">{children}</div>
          {footer ? <div className="px-6 py-3 border-t border-white/10">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
