import React from 'react';
import clsx from 'clsx';

/**
 * Card container with Ocean Professional styling.
 * Sections: header, content, footer via subcomponents.
 */

// PUBLIC_INTERFACE
export default function Card({ children, className = '', elevated = true, ...rest }) {
  const base =
    'rounded-xl bg-[var(--surface-700,#111827)] text-white border border-[color-mix(in_srgb,white_10%,transparent)]';
  const elevation = elevated ? 'shadow-[0_8px_24px_rgba(0,0,0,0.35)]' : 'shadow-none';
  return (
    <div className={clsx(base, elevation, className)} {...rest}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-[color-mix(in_srgb,white_10%,transparent)] flex items-center justify-between', className)}>
      <div>
        {title ? <h3 className="text-lg font-bold">{title}</h3> : null}
        {subtitle ? <p className="text-xs text-white/60 mt-0.5">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardContent({ children, className = '' }) {
  return <div className={clsx('px-5 py-4', className)}>{children}</div>;
}

// PUBLIC_INTERFACE
export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('px-5 py-3 border-t border-[color-mix(in_srgb,white_10%,transparent)]', className)}>
      {children}
    </div>
  );
}
