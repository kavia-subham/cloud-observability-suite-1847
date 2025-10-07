import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

/**
 * PUBLIC_INTERFACE
 * FunctionDetails
 * Shows details for a selected function, including recent logs and AI-style recommendations.
 */
export default function FunctionDetails({ selectedFunction }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!selectedFunction) {
      setLogs([]);
      setErr(null);
      setLoading(false);
      return () => {};
    }
    setLoading(true);
    setErr(null);
    apiClient
      .getFunctionLogs(selectedFunction)
      .then((data) => {
        if (!mounted) return;
        setLogs(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((e) => {
        console.error('Failed to load logs', e);
        if (!mounted) return;
        setErr('Failed to load logs');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [selectedFunction]);

  if (!selectedFunction) {
    return <div className="text-gray-400">Select a function to view details.</div>;
  }

  const recs = buildRecommendations(selectedFunction);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-white">{selectedFunction.name}</h3>
      <div className="text-sm text-gray-300 mb-3">
        {selectedFunction.provider} • {selectedFunction.region} • {selectedFunction.runtime}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">Signals</h4>
            <span className="text-xs text-gray-400">
              p95 {selectedFunction.p95LatencyMs ?? '—'} ms • error {(selectedFunction.errorRate ?? 0).toFixed(2)}% • cold {selectedFunction.coldStarts ?? 0}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label="p95" value={`${selectedFunction.p95LatencyMs ?? '—'} ms`} tone="blue" />
            <Badge label="Error rate" value={`${(selectedFunction.errorRate ?? 0).toFixed(2)}%`} tone={(selectedFunction.errorRate ?? 0) > 2 ? 'red' : 'green'} />
            <Badge label="Cold starts" value={`${selectedFunction.coldStarts ?? 0}`} tone={(selectedFunction.coldStarts ?? 0) > 0 ? 'orange' : 'gray'} />
            <Badge label="Invocations" value={`${selectedFunction.invocations ?? 0}`} tone="blue" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
          <h4 className="font-semibold text-white mb-2">AI Recommendations</h4>
          <ul className="list-disc pl-5 text-sm text-gray-200">
            {recs.map((r) => (
              <li key={r.id} className="mb-2">
                <span className="font-medium text-white">{r.title}:</span> {r.detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">Recent Logs</h4>
            <span className="text-xs text-gray-400">{logs.length} entries</span>
          </div>
          {loading && <div className="text-gray-400 py-4">Loading logs…</div>}
          {err && !loading && <div className="text-red-400 py-2">{err}</div>}
          {!loading && !err && logs.length === 0 && (
            <div className="text-gray-400 py-2">No logs available.</div>
          )}
          <ul className="text-sm max-h-56 overflow-auto space-y-2" aria-label="Recent function logs">
            {logs.map((l, idx) => (
              <li
                key={`${l.time}-${idx}`}
                className="bg-gray-800/60 rounded-md px-2 py-1.5 border border-gray-700"
              >
                <div className="text-xs text-gray-400">{l.time}</div>
                <pre className={`whitespace-pre-wrap break-words text-xs ${
                  l.level === 'error' ? 'text-red-300' : 'text-gray-200'
                }`}>{l.message}</pre>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value, tone = 'gray' }) {
  const toneMap = {
    red: 'bg-red-500/20 text-red-300',
    green: 'bg-green-500/20 text-green-300',
    orange: 'bg-orange-500/20 text-orange-300',
    blue: 'bg-blue-500/20 text-blue-300',
    gray: 'bg-gray-600/40 text-gray-200',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-lg ${toneMap[tone] || toneMap.gray}`} aria-label={`${label}: ${value}`}>
      <span className="text-gray-300">{label}</span> <span className="font-semibold text-white">{value}</span>
    </span>
  );
}

function buildRecommendations(fn) {
  const recs = [];
  const err = fn.errorRate ?? 0;
  const p95 = fn.p95LatencyMs ?? 0;
  const cold = fn.coldStarts ?? 0;

  if (err > 2) {
    recs.push({
      id: 'err-budget',
      title: 'Reduce error rate',
      detail:
        'Investigate recent deployment changes and review timeout/retry settings. Consider enabling DLQ and adding circuit-breaking for downstream calls.',
    });
  }
  if (p95 > 500) {
    recs.push({
      id: 'latency-opt',
      title: 'Latency optimization',
      detail:
        'Enable provisioned concurrency for hot paths and profile code for expensive operations. Cache external calls and tune memory for faster CPU performance.',
    });
  }
  if (cold > 0) {
    recs.push({
      id: 'cold-starts',
      title: 'Mitigate cold starts',
      detail:
        'Use provisioned concurrency and avoid heavyweight initialization. Keep SDK clients warm and move large dependencies to layers.',
    });
  }
  if (recs.length === 0) {
    recs.push({
      id: 'healthy',
      title: 'All clear',
      detail:
        'Function is operating within healthy SLOs. Continue monitoring and consider cost optimization opportunities if invocations increase.',
    });
  }
  return recs;
}
