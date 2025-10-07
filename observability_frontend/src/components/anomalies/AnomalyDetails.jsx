import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * AnomalyDetails shows the selected anomaly details, metrics, and context.
 */
function AnomalyDetails({ anomaly }) {
  if (!anomaly) {
    return (
      <div className="p-6 text-gray-300">
        Select an anomaly to view details.
      </div>
    );
  }

  const meta = [
    { label: 'Service', value: anomaly.service || anomaly.function || anomaly.resource || '—' },
    { label: 'Region', value: anomaly.region || anomaly.zone || '—' },
    { label: 'Provider', value: anomaly.provider || '—' },
    { label: 'Detected', value: anomaly.timestamp ? new Date(anomaly.timestamp).toLocaleString() : '—' },
    { label: 'Severity', value: String(anomaly.severity || '—').toUpperCase() },
    { label: 'Score', value: typeof anomaly.score === 'number' ? Math.round(anomaly.score) : '—' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-extrabold">{anomaly.title || anomaly.name || 'Anomaly'}</h3>
        {anomaly.description && (
          <p className="mt-1 text-gray-300">{anomaly.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {meta.map((m) => (
          <div key={m.label} className="bg-gray-900 rounded-md border border-gray-700 p-3">
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className="text-sm font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      {Array.isArray(anomaly.signals) && anomaly.signals.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Signals</h4>
          <div className="space-y-2">
            {anomaly.signals.map((s, idx) => (
              <div key={idx} className="bg-gray-900 rounded-md border border-gray-700 p-3">
                <p className="text-sm font-semibold">{s.metric || s.name || 'Signal'}</p>
                <p className="text-xs text-gray-300">{s.detail || s.description || ''}</p>
                {typeof s.value !== 'undefined' && (
                  <p className="text-xs text-gray-400 mt-1">Value: {String(s.value)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {anomaly.recommendation && (
        <div>
          <h4 className="font-bold mb-2">Recommendation</h4>
          <div className="bg-gray-900 rounded-md border border-gray-700 p-4">
            <p className="text-sm text-gray-200">{anomaly.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

AnomalyDetails.propTypes = {
  anomaly: PropTypes.object,
};

export default AnomalyDetails;
