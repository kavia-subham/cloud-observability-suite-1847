import React from 'react';

/**
 * PUBLIC_INTERFACE
 * MetricsOverviewGrid
 * Renders KPI cards: invocations, errors, latency p95, and cost today
 * Props:
 *  - invocations: number
 *  - errors: number
 *  - latencyP95: number (ms)
 *  - costToday: number (USD)
 */
export default function MetricsOverviewGrid({ invocations, errors, latencyP95, costToday }) {
  const cards = [
    {
      key: 'invocations',
      label: 'Invocations',
      value: formatNumber(invocations),
      accent: 'from-orange-500/20 to-black',
      ring: 'ring-orange-500/40',
    },
    {
      key: 'errors',
      label: 'Errors',
      value: formatNumber(errors),
      accent: 'from-red-500/20 to-black',
      ring: 'ring-red-500/40',
    },
    {
      key: 'latency',
      label: 'Latency p95',
      value: latencyP95 != null ? `${formatNumber(latencyP95)} ms` : '—',
      accent: 'from-emerald-500/20 to-black',
      ring: 'ring-emerald-500/40',
    },
    {
      key: 'cost',
      label: 'Cost Today',
      value: costToday != null ? `$${formatCurrency(costToday)}` : '—',
      accent: 'from-sky-500/20 to-black',
      ring: 'ring-sky-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, idx) => (
        <article
          key={c.key}
          tabIndex={0}
          aria-label={`${c.label} ${c.value}`}
          className={
            'group relative rounded-2xl bg-gradient-to-br ' +
            c.accent +
            ' p-0.5 focus:outline-none focus-visible:ring-2 ' +
            c.ring
          }
        >
          <div className="rounded-2xl h-full w-full bg-gray-800 border border-gray-700 p-4">
            <div className="text-sm text-gray-300">{c.label}</div>
            <div className="mt-2 text-2xl font-bold">{c.value}</div>
            <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </article>
      ))}
    </div>
  );
}

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
}

function formatCurrency(n) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return String(n);
  }
}
