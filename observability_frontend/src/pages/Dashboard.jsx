import React, { useEffect, useMemo, useState } from 'react';
import MetricsOverviewGrid from '../components/MetricsOverviewGrid';
import SLOStatus from '../components/SLOStatus';
import RealtimeFeed from '../components/RealtimeFeed';
import apiClient from '../services/apiClient';
import '../styles/theme.css';
import '../App.css';

/**
 * PUBLIC_INTERFACE
 * Dashboard
 * This page renders the main dashboard with KPI cards, SLO status, and a realtime feed.
 * It loads initial metrics via apiClient and subscribes to live updates through wsClient (inside RealtimeFeed).
 * States handled: loading, error, and empty for the initial metrics fetch.
 */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [slo, setSlo] = useState(null);

  // fetch initial data
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Expect apiClient to support mocks when REACT_APP_USE_MOCKS=true
        const [metricsRes, sloRes] = await Promise.all([
          apiClient.get('/metrics/overview'), // invocations, errors, latency, cost
          apiClient.get('/slo/summary'), // SLO summary for display
        ]);
        if (!mounted) return;
        setMetrics(metricsRes?.data || metricsRes || null);
        setSlo(sloRes?.data || sloRes || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const isEmpty = useMemo(() => {
    if (!metrics) return true;
    const vals = [
      metrics.invocations,
      metrics.errors,
      metrics.latencyP95,
      metrics.costToday,
    ];
    return vals.every(v => v === undefined || v === null);
  }, [metrics]);

  return (
    <div className="min-h-full w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time health, performance, and cost insights across your serverless estate.
          </p>
        </header>

        {/* Loading / Error / Empty states */}
        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl p-6 bg-gray-800/60 border border-gray-700"
          >
            <div className="animate-pulse h-6 w-40 bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl p-4 bg-gray-800 border border-gray-700">
                  <div className="h-4 w-24 bg-gray-700 rounded mb-3" />
                  <div className="h-8 w-20 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-6 h-40 w-full bg-gray-800 rounded-xl border border-gray-700" />
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl p-4 bg-red-900/20 border border-red-700 text-red-200"
          >
            <p className="font-semibold">Could not load dashboard data</p>
            <p className="text-sm opacity-90 mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl p-6 bg-gray-800/60 border border-gray-700"
          >
            <p className="text-gray-300">
              No data available yet. Connect your cloud provider or try again later.
            </p>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <>
            {/* KPI Grid */}
            <section aria-labelledby="metrics-overview-title" className="mb-6">
              <h2 id="metrics-overview-title" className="sr-only">Key Performance Indicators</h2>
              <MetricsOverviewGrid
                invocations={metrics?.invocations}
                errors={metrics?.errors}
                latencyP95={metrics?.latencyP95}
                costToday={metrics?.costToday}
              />
            </section>

            {/* SLO Status */}
            <section aria-labelledby="slo-status-title" className="mb-6">
              <h2 id="slo-status-title" className="sr-only">SLO Status</h2>
              <SLOStatus data={slo} />
            </section>

            {/* Realtime Feed */}
            <section aria-labelledby="realtime-feed-title">
              <h2 id="realtime-feed-title" className="sr-only">Realtime Events</h2>
              <RealtimeFeed />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
