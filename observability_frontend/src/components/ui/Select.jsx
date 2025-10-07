import React from 'react';
import clsx from 'clsx';

/**
 * Simple select with label and error state.
 */

// PUBLIC_INTERFACE
export default function Select({
  label,
  error,
  helperText,
  className = '',
  selectClassName = '',
  children,
  ...rest
}) {
  return (
    <label className={clsx('block text-sm', className)}>
      {label ? <span className="mb-1.5 block text-white/80">{label}</span> : null}
      <div className="relative">
        <select
          className={clsx(
            'appearance-none w-full rounded-lg bg-[var(--surface-800,#0B1220)] text-white border border-white/10 px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#FB923C)]',
            error ? 'border-[var(--color-error-600,#EF4444)]' : '',
            selectClassName
          )}
          {...rest}
        >
          {children}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-white/60"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {helperText ? <span className="mt-1 block text-xs text-white/50">{helperText}</span> : null}
      {error ? <span className="mt-1 block text-xs text-[var(--color-error-400,#F87171)]">{error}</span> : null}
    </label>
  );
}
