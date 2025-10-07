import React from 'react';

/**
 * PUBLIC_INTERFACE
 * SLOStatus
 * Displays summary of SLO conformance including uptime, error budget, and current status with simple pills.
 * Props:
 *  - data: {
 *      uptime: number (0-100),
 *      errorBudgetRemaining: number (0-100),
 *      objectives?: Array<{ name: string, target: string, status: 'good'|'warning'|'bad' }>,
 *    }
 */
export default function SLOStatus({ data }) {
  const uptime = data?.uptime ?? null;
  const budget = data?.errorBudgetRemaining ?? null;
  const objectives = Array.isArray(data?.objectives) ? data.objectives : [];

  return (
    <div
      className="rounded-2xl bg-gray-800 border border-gray-700 p-4"
      role="region"
      aria-label="SLO Status"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">SLO Status</h3>
          <p className="text-gray-400 text-sm">Live conformance to defined objectives</p>
        </div>
        <div className="flex items-center gap-4">
          <StatPill label="Uptime" value={uptime != null ? `${uptime.toFixed(3)}%` : '—'} color="emerald" />
          <StatPill label="Error Budget" value={budget != null ? `${budget.toFixed(1)}%` : '—'} color="sky" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {objectives.length === 0 ? (
          <div className="text-gray-400 text-sm">No SLOs configured.</div>
        ) : (
          objectives.map((o, i) => (
            <ObjectiveItem key={`${o?.name ?? 'obj'}-${i}`} name={o?.name} target={o?.target} status={o?.status} />
          ))
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color = 'emerald' }) {
  const map = {
    emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-600/40',
    sky: 'bg-sky-500/20 text-sky-200 border-sky-600/40',
    orange: 'bg-orange-500/20 text-orange-200 border-orange-600/40',
    red: 'bg-red-500/20 text-red-200 border-red-600/40',
  };
  const cls = map[color] || map.emerald;
  return (
    <div className={`rounded-full border ${cls} px-3 py-1 text-sm`} aria-label={`${label} ${value}`}>
      <span className="font-medium">{label}:</span> <span className="ml-1">{value}</span>
    </div>
  );
}

function ObjectiveItem({ name = 'Objective', target = '—', status = 'good' }) {
  const statusMap = {
    good: { dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'Good' },
    warning: { dot: 'bg-orange-400', text: 'text-orange-300', label: 'Warning' },
    bad: { dot: 'bg-red-500', text: 'text-red-300', label: 'Breached' },
  };
  const s = statusMap[status] || statusMap.good;

  return (
    <div
      className="rounded-xl bg-gray-900 border border-gray-700 p-3 flex items-center justify-between"
      tabIndex={0}
      aria-label={`${name} target ${target} status ${s.label}`}
    >
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-400">Target: {target}</div>
      </div>
      <div className={`flex items-center gap-2 ${s.text}`}>
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
        <span className="text-sm">{s.label}</span>
      </div>
    </div>
  );
}
