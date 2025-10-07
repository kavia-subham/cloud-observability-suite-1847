import React, { useState } from 'react';
import clsx from 'clsx';

/**
 * Lightweight tooltip for hover/focus.
 * Positions: top, right, bottom, left
 */

// PUBLIC_INTERFACE
export default function Tooltip({ children, content, position = 'top', className = '' }) {
  const [open, setOpen] = useState(false);
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className={clsx(
            'absolute z-50 px-2 py-1 rounded-md text-xs bg-white/10 text-white backdrop-blur border border-white/10',
            positions[position]
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
