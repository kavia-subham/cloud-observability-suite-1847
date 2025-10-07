//
// Shared formatting utilities for numbers, currency, percent, and durations.
//

// PUBLIC_INTERFACE
export function formatNumber(value, decimals = 0) {
  /** Format a number with locale separators. */
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// PUBLIC_INTERFACE
export function formatCurrency(value, currency = 'USD', decimals = 2) {
  /** Format currency in a locale-aware way. */
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(value));
  } catch {
    // Fallback if currency code invalid
    return `${currency} ${formatNumber(value, decimals)}`;
  }
}

// PUBLIC_INTERFACE
export function formatPercent(value, decimals = 1) {
  /** Format a ratio (0..1) as percent string. If already 0..100, set isRatio=false. */
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${formatNumber(Number(value) * 100, decimals)}%`;
}

// PUBLIC_INTERFACE
export function formatPercentAbsolute(value, decimals = 1) {
  /** Format a percent value already expressed as 0..100. */
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${formatNumber(Number(value), decimals)}%`;
}

// PUBLIC_INTERFACE
export function formatDurationMs(ms) {
  /** Format milliseconds into human readable duration, e.g., 1h 3m 4s */
  if (ms === null || ms === undefined || Number.isNaN(Number(ms))) return '-';
  const totalSeconds = Math.floor(Number(ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}
