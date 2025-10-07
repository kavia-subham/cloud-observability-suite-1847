import React from 'react';
import clsx from 'clsx';

/**
 * Ocean Professional themed Button component.
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 */

// PUBLIC_INTERFACE
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';
  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };
  const variants = {
    primary:
      'bg-[var(--color-primary-600,#F97316)] text-white hover:bg-[var(--color-primary-500,#FB923C)] focus:ring-[var(--color-primary-500,#FB923C)] disabled:opacity-60 disabled:cursor-not-allowed',
    secondary:
      'bg-[var(--surface-600,#1F2937)] text-white hover:bg-[var(--surface-500,#374151)] border border-[color-mix(in_srgb,white_10%,transparent)] focus:ring-[var(--color-secondary-500,#10B981)] disabled:opacity-60 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-white hover:bg-[color-mix(in_srgb,white_10%,transparent)] focus:ring-[var(--color-primary-500,#FB923C)] disabled:opacity-60 disabled:cursor-not-allowed',
    danger:
      'bg-[var(--color-error-600,#EF4444)] text-white hover:bg-[var(--color-error-500,#F87171)] focus:ring-[var(--color-error-500,#F87171)] disabled:opacity-60 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(base, sizes[size], variants[variant], className)}
      onClick={onClick}
      {...rest}
    >
      {LeadingIcon ? <LeadingIcon className="w-4 h-4" /> : null}
      <span>{children}</span>
      {TrailingIcon ? <TrailingIcon className="w-4 h-4" /> : null}
    </button>
  );
}
