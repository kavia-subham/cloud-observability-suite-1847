import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * NodeDetailsPanel
 * Displays details for a selected node including quick metrics, anomalies,
 * and upstream/downstream dependencies.
 *
 * Props:
 * - node: node object or null
 * - onClose: function to close panel
 * - lastUpdatedTs: number | null - timestamp for last data refresh
 */
export default function NodeDetailsPanel({ node, onClose, lastUpdatedTs }) {
  const deps = useMemo(() => {
    if (!node) return { upstream: [], downstream: [] };
    const upstream = Array.isArray(node.dependencies?.upstream) ? node.dependencies.upstream : [];
    const downstream = Array.isArray(node.dependencies?.downstream) ? node.dependencies.downstream : [];
    return { upstream, downstream };
  }, [node]);

  if (!node) {
    return (
      <div className="h-full p-6 text-white/70">
        <div className="text-sm">
          Select a node in the topology to view details here.
        </div>
      </div>
    );
  }

  const metrics = node.metrics || {};
  const anomalies = Array.isArray(node.anomalies) ? node.anomalies : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between p-4 border-b border-white/10 bg-gray-900">
        <div>
          <h2 className="text-lg font-extrabold">{node.label}</h2>
          <p className="text-xs text-white/60 mt-0.5">
            {node.type || 'Service'} • Status: <span className="font-semibold">{node.status || 'unknown'}</span>
          </p>
          {lastUpdatedTs && (
            <p className="text-[10px] text-white/50 mt-1">
              Updated {new Date(lastUpdatedTs).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          aria-label="Close node details"
          onClick={onClose}
          className="rounded px-2 py-1 text-black bg-orange-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section aria-labelledby="metrics-heading" className="bg-gray-900/60 rounded border border-white/10 p-4">
          <h3 id="metrics-heading" className="text-sm font-bold mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Requests/min" value={fmt(metrics.requestsPerMin)} />
            <MetricCard label="P95 Latency" value={metrics.p95Latency != null ? `${Math.round(metrics.p95Latency)} ms` : '—'} />
            <MetricCard label="Error Rate" value={metrics.errorRate != null ? `${(metrics.errorRate * 100).toFixed(2)}%` : '—'} />
            <MetricCard label="Cold Starts" value={fmt(metrics.coldStarts)} />
          </div>
        </section>

        <section aria-labelledby="anomalies-heading" className="bg-gray-900/60 rounded border border-white/10 p-4">
          <h3 id="anomalies-heading" className="text-sm font-bold mb-3">Anomalies</h3>
          {anomalies.length ? (
            <ul className="space-y-2">
              {anomalies.map((a, idx) => (
                <li key={idx} className="p-3 rounded bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-semibold text-red-400">{a.title || `Anomaly ${idx + 1}`}</p>
                  <p className="text-xs text-white/70 mt-1">{a.description || 'No description provided.'}</p>
                  {a.severity && (
                    <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-red-500 text-black">
                      {String(a.severity).toUpperCase()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">No anomalies detected.</p>
          )}
        </section>

        <section aria-labelledby="deps-heading" className="bg-gray-900/60 rounded border border-white/10 p-4">
          <h3 id="deps-heading" className="text-sm font-bold mb-3">Dependencies</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/60 mb-2">Upstream</p>
              {deps.upstream.length ? (
                <ul className="space-y-1">
                  {deps.upstream.map((d, i) => (
                    <li key={`up-${i}`} className="text-sm">{d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/50">None</p>
              )}
            </div>
            <div>
              <p className="text-xs text-white/60 mb-2">Downstream</p>
              {deps.downstream.length ? (
                <ul className="space-y-1">
                  {deps.downstream.map((d, i) => (
                    <li key={`down-${i}`} className="text-sm">{d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/50">None</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v == null) return '—';
  if (typeof v === 'number' && v >= 1000) return Intl.NumberFormat().format(v);
  return String(v);
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded bg-gray-800/80 border border-white/10 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-base font-semibold mt-1">{value}</p>
    </div>
  );
}
