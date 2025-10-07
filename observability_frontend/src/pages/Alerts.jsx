import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AnomalyList from '../components/anomalies/AnomalyList';
import AnomalyDetails from '../components/anomalies/AnomalyDetails';
import RootCausePanel from '../components/anomalies/RootCausePanel';
import AiExplanation from '../components/anomalies/AiExplanation';
import apiClient from '../services/apiClient';
import wsClient from '../services/wsClient';
import '../styles/theme.css';
import '../styles/tokens.css';

/**
 * Alerts page renders the Anomalies experience:
 * - Severity filters
 * - List/detail navigation
 * - Root cause summary panel
 * - AI explanation panel
 * - Live updates via WebSocket channel 'anomalies_live'
 */
const Alerts = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [activeSeverities, setActiveSeverities] = useState(['critical', 'high', 'medium', 'low']);
  const [liveConnected, setLiveConnected] = useState(false);

  // Fetch anomalies initially (supports mock via apiClient)
  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await apiClient.get('/anomalies');
      const items = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
      setAnomalies(items);
      // Select first by default
      if (!selectedId && items.length > 0) {
        setSelectedId(items[0].id);
      }
    } catch (e) {
      // Standardize error message
      const message = e?.message || 'Failed to load anomalies.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  // WebSocket live updates for anomalies
  useEffect(() => {
    let unsub = null;
    try {
      unsub = wsClient.subscribe('anomalies_live', (msg) => {
        // Expected message shape: { type: 'upsert'|'delete', anomaly: {...} } OR { type: 'bulk', items: [...] }
        if (!msg) return;
        setLiveConnected(true);
        setAnomalies((prev) => {
          if (msg.type === 'bulk' && Array.isArray(msg.items)) {
            return msg.items;
          }
          if (msg.type === 'upsert' && msg.anomaly) {
            const exists = prev.find(a => a.id === msg.anomaly.id);
            if (exists) {
              return prev.map(a => (a.id === msg.anomaly.id ? { ...exists, ...msg.anomaly } : a));
            }
            return [msg.anomaly, ...prev];
          }
          if (msg.type === 'delete' && msg.id) {
            return prev.filter(a => a.id !== msg.id);
          }
          return prev;
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('WS subscribe failed', e);
      setLiveConnected(false);
    }
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Filter by active severities
  useEffect(() => {
    const f = anomalies.filter(a => activeSeverities.includes((a?.severity || '').toLowerCase()));
    setFiltered(f);
    // Ensure selection remains valid
    if (selectedId && !f.some(x => x.id === selectedId)) {
      setSelectedId(f.length ? f[0].id : null);
    }
  }, [anomalies, activeSeverities, selectedId]);

  const selected = useMemo(
    () => filtered.find(a => a.id === selectedId) || null,
    [filtered, selectedId]
  );

  const toggleSeverity = (sev) => {
    setActiveSeverities((curr) =>
      curr.includes(sev) ? curr.filter(s => s !== sev) : [...curr, sev]
    );
  };

  const severities = [
    { key: 'critical', label: 'Critical', color: '#EF4444' },
    { key: 'high', label: 'High', color: '#F97316' },
    { key: 'medium', label: 'Medium', color: '#F59E0B' },
    { key: 'low', label: 'Low', color: '#10B981' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-orange-500/20 to-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Alerts</h1>
            <p className="text-sm text-gray-300">
              AI-driven anomaly detection and root cause analysis
              {liveConnected ? <span className="ml-2 text-green-400">• Live</span> : <span className="ml-2 text-gray-400">• Offline</span>}
            </p>
          </div>
          <button
            aria-label="Refresh anomalies"
            onClick={load}
            className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm border border-gray-600"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Severity filters">
          {severities.map(s => {
            const active = activeSeverities.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggleSeverity(s.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition
                  ${active ? 'bg-gray-900 border-white/30' : 'bg-gray-800 border-gray-600'}
                `}
                aria-pressed={active}
                aria-label={`Toggle ${s.label} severity`}
                style={{ boxShadow: active ? `0 0 0 2px ${s.color}66` : undefined }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        <section className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="bg-gray-800 rounded-lg border border-gray-700 h-[calc(100vh-180px)] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-700">
              <h2 className="font-bold">Anomalies</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <AnomalyList
                items={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                loading={loading}
                error={err}
              />
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-8 xl:col-span-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 h-[calc(100vh-180px)] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-bold">Details</h2>
              {selected && (
                <span
                  className="text-xs px-2 py-1 rounded bg-gray-900 border border-gray-700"
                  aria-label={`Anomaly severity: ${selected.severity}`}
                >
                  {String(selected.severity || '').toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              <AnomalyDetails anomaly={selected} />
            </div>
          </div>
        </section>

        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-bold">Root Cause</h3>
            </div>
            <RootCausePanel anomaly={selected} />
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-bold">AI Explanation</h3>
            </div>
            <AiExplanation anomaly={selected} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Alerts;
