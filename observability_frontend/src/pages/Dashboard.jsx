import React from 'react';
import MetricsOverviewGrid from '../components/MetricsOverviewGrid';
import RealtimeFeed from '../components/RealtimeFeed';
import SLOStatus from '../components/SLOStatus';
import CostSummary from '../components/CostSummary';

/**
 * Dashboard - default landing page
 * Main content composed from modular components:
 * - MetricsOverviewGrid (key metrics)
 * - RealtimeFeed (live updates list)
 * - SLOStatus (small SLO widgets)
 * - CostSummary (cost tile/chart)
 *
 * All components currently use mock data and are designed to be wired to APIs/WebSockets later.
 */
// PUBLIC_INTERFACE
export default function Dashboard() {
  const handleMetricClick = (metric) => {
    // Placeholder interaction; can navigate or open modal in future
    // eslint-disable-next-line no-console
    console.log('Metric clicked:', metric.key);
  };

  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 'var(--space-4)' }}>Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        Real-time health, anomalies, cost, and security posture across serverless environments.
      </p>

      {/* Row 1: Metrics overview grid */}
      <MetricsOverviewGrid onTileClick={handleMetricClick} />

      {/* Row 2: Realtime feed + Cost summary */}
      <section style={layout.rowTwo}>
        <RealtimeFeed />
        <CostSummary />
      </section>

      {/* Row 3: SLO status widgets */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <h3 className="h3" style={{ margin: 0, marginBottom: 'var(--space-4)' }}>SLO Status</h3>
        <SLOStatus />
      </section>
    </div>
  );
}

const layout = {
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 'var(--space-6)',
    marginTop: 'var(--space-8)',
  },
};
