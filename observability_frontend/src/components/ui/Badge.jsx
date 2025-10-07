import React from 'react';
import clsx from 'clsx';

/**
 * Small status label.
 * Variants: default, success, warning, danger, info
 */

// PUBLIC_INTERFACE
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-white',
    success: 'bg-[var(--color-success-600,#10B981)]/20 text-[var(--color-success-400,#34D399)]',
    warning: 'bg-[var(--color-primary-600,#F97316)]/20 text-[var(--color-primary-300,#FDBA74)]',
    danger: 'bg-[var(--color-error-600,#EF4444)]/20 text-[var(--color-error-300,#FCA5A5)]',
    info: 'bg-[#3B82F6]/20 text-[#93C5FD]',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
