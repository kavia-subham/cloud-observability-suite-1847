import React from 'react';

/**
 * AnomalyList
 * Lists recent anomalies with severity, timestamp, impacted service, and status.
 * Emits onSelect(anomaly) when an item is clicked.
 */
// PUBLIC_INTERFACE
export default function AnomalyList({
  anomalies = defaultAnomalies,
  selectedId = null,
  onSelect = () => {},
  style: styleProp = {},
  title = 'Recent Anomalies',
}) {
  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.pill}>Live</span>
      </div>

      <ul style={styles.list} role="listbox" aria-label="Anomalies list">
        {anomalies.map((a) => (
          <li key={a.id}>
            <button
              role="option"
              aria-selected={selectedId === a.id}
              onClick={() => onSelect(a)}
              className="btn-outline"
              style={{
                ...styles.row,
                ...(selectedId === a.id ? styles.rowActive : {}),
                borderColor: selectedId === a.id ? 'var(--color-secondary)' : 'var(--color-border)',
              }}
              title={`Inspect anomaly ${a.id}`}
            >
              <span style={{ ...styles.sevDot, background: sevColor[a.severity] }} />
              <div style={styles.rowBody}>
                <div style={styles.rowTitle}>
                  <strong>{a.service}</strong>
                  <span style={{ color: 'var(--color-text-muted)' }}> • {a.metric}</span>
                </div>
                <div style={styles.rowMeta}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{a.time}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{a.region}</span>
                </div>
              </div>
              <div style={styles.badges}>
                <span style={styles.badge}>{a.severity.toUpperCase()}</span>
                {a.ack && <span style={{ ...styles.badge, background: 'rgba(16,185,129,0.2)' }}>ACK</span>}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const sevColor = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

const styles = {
  card: {
    padding: 'var(--space-6)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)',
  },
  pill: {
    background: 'var(--gradient-accent)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  list: {
    listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)',
  },
  row: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: 'var(--space-3)',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    textAlign: 'left',
    cursor: 'pointer',
  },
  rowActive: {
    boxShadow: '0 0 0 2px var(--color-secondary) inset',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,0,0,1))',
  },
  sevDot: {
    width: 10, height: 10, borderRadius: '50%',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
  },
  rowBody: {
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  rowTitle: {},
  rowMeta: { display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' },
  badges: { display: 'flex', gap: 8 },
  badge: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    background: 'rgba(255,255,255,0.06)',
  },
};

const defaultAnomalies = [
  { id: 'A-1042', severity: 'high', service: 'payment-authorize', metric: 'Latency p95 +48%', time: 'now', region: 'us-central1', ack: false },
  { id: 'A-1041', severity: 'critical', service: 'auth-validate', metric: 'Error rate 1.8%', time: '2m ago', region: 'us-east-1', ack: true },
  { id: 'A-1040', severity: 'medium', service: 'orders-write', metric: 'Throughput -22%', time: '6m ago', region: 'westeurope', ack: false },
  { id: 'A-1039', severity: 'low', service: 'events-queue', metric: 'Backlog +12%', time: '9m ago', region: 'us-central1', ack: false },
];
