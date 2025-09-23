import React from 'react';

/**
 * Dashboard - default landing page
 * Features quick stats tiles and placeholders for charts.
 */
// PUBLIC_INTERFACE
export default function Dashboard() {
  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 'var(--space-4)' }}>Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        Real-time health, anomalies, cost, and security posture across serverless environments.
      </p>

      <section style={styles.grid}>
        {[
          { title: 'Active Functions', value: '438', badge: 'AWS/Azure/GCP' },
          { title: 'Anomalies (24h)', value: '12', badge: 'AI-detected' },
          { title: 'Avg. Latency', value: '142 ms', badge: 'P95' },
          { title: 'Projected Cost (Mo.)', value: '$12,430', badge: '↓ 8%' },
        ].map((t) => (
          <div key={t.title} className="surface" style={styles.tile}>
            <div style={styles.tileHead}>
              <span style={styles.badge}>{t.badge}</span>
            </div>
            <div style={styles.tileTitle}>{t.title}</div>
            <div style={styles.tileValue}>{t.value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          <h3 className="h3" style={{ marginTop: 0 }}>Latency Trend</h3>
          <p className="text-muted">Placeholder for latency chart.</p>
        </div>
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          <h3 className="h3" style={{ marginTop: 0 }}>Errors & Alerts</h3>
          <p className="text-muted">Placeholder for alerts chart.</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--space-6)',
  },
  tile: {
    padding: 'var(--space-6)',
    position: 'relative',
    overflow: 'hidden',
  },
  tileHead: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 'var(--space-3)',
  },
  badge: {
    background: 'var(--gradient-accent)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  tileTitle: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
    marginBottom: 'var(--space-2)',
  },
  tileValue: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--weight-extrabold)',
    letterSpacing: '-0.02em',
  },
};
