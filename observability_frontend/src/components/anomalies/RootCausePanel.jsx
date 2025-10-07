import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * RootCausePanel shows likely root cause contributors based on anomaly fields (mock-driven).
 */
function RootCausePanel({ anomaly }) {
  const causes = useMemo(() => {
    if (!anomaly) return [];
    // If mock data includes rootCauses, use it; otherwise derive a simple heuristic list
    if (Array.isArray(anomaly.rootCauses) && anomaly.rootCauses.length > 0) {
      return anomaly.rootCauses;
    }
    const arr = [];
    if (anomaly.service || anomaly.function) {
      arr.push({
        id: 'svc',
        factor: anomaly.service || anomaly.function,
        confidence: Math.min(95, Math.round((anomaly.score || 50) * 0.9)),
        hint: 'Recent deployment or configuration drift likely.',
      });
    }
    if (Array.isArray(anomaly.signals) && anomaly.signals.some(s => /latency|timeout|throttle/i.test(s.metric || s.name || ''))) {
      arr.push({
        id: 'lat',
        factor: 'Latency spike',
        confidence: 75,
        hint: 'Downstream dependency or cold start impact.',
      });
    }
    if (arr.length === 0) {
      arr.push({
        id: 'gen',
        factor: 'General anomaly pattern',
        confidence: 60,
        hint: 'Multi-signal correlation indicates transient incident.',
      });
    }
    return arr;
  }, [anomaly]);

  if (!anomaly) {
    return <div className="p-4 text-gray-300">Select an anomaly to view root cause analysis.</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {causes.map((c) => (
        <div key={c.id || c.factor} className="bg-gray-900 rounded-md border border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{c.factor}</p>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-600">
              {typeof c.confidence === 'number' ? `${c.confidence}%` : '—'}
            </span>
          </div>
          {c.hint && <p className="text-xs text-gray-300 mt-1">{c.hint}</p>}
        </div>
      ))}
      {causes.length === 0 && (
        <div className="text-sm text-gray-300">No root cause hints available.</div>
      )}
    </div>
  );
}

RootCausePanel.propTypes = {
  anomaly: PropTypes.object,
};

export default RootCausePanel;
