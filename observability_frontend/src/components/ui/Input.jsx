import React from 'react';
import clsx from 'clsx';

/**
 * Text input with label and error state.
 */

// PUBLIC_INTERFACE
export default function Input({
  label,
  error,
  helperText,
  className = '',
  inputClassName = '',
  ...rest
}) {
  return (
    <label className={clsx('block text-sm', className)}>
      {label ? <span className="mb-1.5 block text-white/80">{label}</span> : null}
      <input
        className={clsx(
          'w-full rounded-lg bg-[var(--surface-800,#0B1220)] text-white placeholder-white/40 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#FB923C)]',
          error ? 'border-[var(--color-error-600,#EF4444)]' : '',
          inputClassName
        )}
        {...rest}
      />
      {helperText ? <span className="mt-1 block text-xs text-white/50">{helperText}</span> : null}
      {error ? <span className="mt-1 block text-xs text-[var(--color-error-400,#F87171)]">{error}</span> : null}
    </label>
  );
}
