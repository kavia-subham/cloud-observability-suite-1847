import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * AnomalyList renders a scrollable list of anomalies with severity indicators.
 * Shows loading, error, and empty states.
 */
function AnomalyList({ items, selectedId, onSelect, loading, error }) {
  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-300">
        Loading anomalies...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-sm text-red-400" role="alert">
        {error}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-300">
        No anomalies found for the selected filters.
      </div>
    );
  }

  const sevColor = (sev) => {
    const s = String(sev || '').toLowerCase();
    if (s === 'critical') return '#EF4444';
    if (s === 'high') return '#F97316';
    if (s === 'medium') return '#F59E0B';
    return '#10B981';
  };

  return (
    <ul role="listbox" aria-label="Anomalies list">
      {items.map((a) => {
        const active = selectedId === a.id;
        return (
          <li key={a.id}>
            <button
              role="option"
              aria-selected={active}
              className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700/60 transition
                ${active ? 'bg-gray-900' : 'bg-transparent'}
              `}
              onClick={() => onSelect(a.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sevColor(a.severity) }}
                    aria-label={`Severity ${a.severity}`}
                  />
                  <div>
                    <p className="font-semibold text-white line-clamp-1">{a.title || a.name || 'Anomaly'}</p>
                    <p className="text-xs text-gray-300 line-clamp-1">
                      {a.service || a.function || a.resource || 'Unknown'} • {a.region || a.zone || a.provider || '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
                  {typeof a.score === 'number' && (
                    <p className="text-xs text-gray-400">Score {Math.round(a.score)}</p>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

AnomalyList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default AnomalyList;
