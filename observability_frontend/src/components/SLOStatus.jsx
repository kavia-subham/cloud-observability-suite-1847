import React from 'react';

/**
 * SLOStatus
 * Shows small widgets summarizing SLOs (availability, latency, error budget).
 * Uses mock data; designed for future API integration.
 */
// PUBLIC_INTERFACE
export default function SLOStatus({ slos = defaultSLOs }) {
  return (
    <section style={styles.wrap} aria-label="SLO status widgets">
      {slos.map((slo) => (
        <div key={slo.key} className="surface" style={styles.card} title={slo.description}>
          <div style={styles.cardHead}>
            <span style={{ ...styles.dot, background: statusToColor[slo.status] }} />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{slo.category}</span>
          </div>
          <div style={styles.cardTitle}>{slo.title}</div>
          <div style={styles.cardValue}>
            {slo.value}
            {slo.unit && <span style={styles.unit}>{slo.unit}</span>}
          </div>
          {slo.meta && <div style={styles.meta}>{slo.meta}</div>}
        </div>
      ))}
    </section>
  );
}

const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
    gap: 'var(--space-6)',
  },
  card: {
    padding: 'var(--space-5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-1)',
  },
  cardHead: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)',
  },
  dot: { width: 10, height: 10, borderRadius: '50%' },
  cardTitle: {
    color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)',
  },
  cardValue: {
    fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em',
  },
  unit: {
    fontSize: 'var(--text-md)', marginLeft: 6, color: 'var(--color-text-muted)',
  },
  meta: {
    marginTop: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)',
  },
};

const statusToColor = {
  good: '#10B981',
  watch: '#F97316',
  bad: '#EF4444',
};

const defaultSLOs = [
  { key: 'availability', title: 'Availability', category: 'SLO', value: '99.92', unit: '%', status: 'good', meta: 'Error budget burn: 2%', description: 'Uptime over the last 30 days' },
  { key: 'latency', title: 'Latency P95', category: 'SLO', value: '148', unit: 'ms', status: 'watch', meta: '+7ms vs 7d avg', description: 'Latency performance' },
  { key: 'errors', title: 'Error Budget', category: 'SLO', value: '78', unit: '%', status: 'good', meta: 'Remaining for window', description: 'Budget remaining' },
];
