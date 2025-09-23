import React from 'react';

/**
 * NodeDetailsPanel
 * Sticky side panel to display details for the selected node.
 * Designed with Ocean Professional theme styling.
 *
 * PUBLIC INTERFACE
 */
// PUBLIC_INTERFACE
export default function NodeDetailsPanel({ node, onClose = () => {} }) {
  if (!node) {
    return (
      <div className="surface" style={styles.empty}>
        <div style={{ color: 'var(--color-text-muted)' }}>Select a node to see details</div>
      </div>
    );
  }

  const meta = {
    provider: node.provider || 'N/A',
    type: node.type || 'service',
    id: node.id,
    label: node.label,
    region: node.region || 'auto',
    latencyP95: Math.round(((node.latency ?? Math.random() * 0.8) * 800) + 60), // ms
    errorRate: ((node.errors ?? Math.random() * 0.08) * 100).toFixed(2) + '%',
  };

  return (
    <div className="surface" style={styles.panel}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>{meta.label}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {meta.type} • {meta.provider}
          </div>
        </div>
        <button onClick={onClose} className="btn btn-outline" style={{ padding: '6px 10px' }} aria-label="Close details">
          Close
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.kv}><span className="text-muted">Node ID</span><span>{meta.id}</span></div>
        <div style={styles.kv}><span className="text-muted">Region</span><span>{meta.region}</span></div>
        <div style={styles.kv}><span className="text-muted">P95 Latency</span><span>{meta.latencyP95} ms</span></div>
        <div style={styles.kv}><span className="text-muted">Error Rate</span><span>{meta.errorRate}</span></div>
      </div>

      <div style={styles.section}>
        <div className="h3" style={{ margin: 0, marginBottom: 'var(--space-3)' }}>Recent Activity</div>
        <ul style={styles.list}>
          <li>Autoscaling suggestion available</li>
          <li>Cold start detected at 12:03 UTC</li>
          <li>2 alerts suppressed by policy</li>
        </ul>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        <button className="btn">Open Traces</button>
        <button className="btn btn-outline">Set Alert</button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-6)',
    minWidth: 320,
    maxWidth: 420,
    height: '100%',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  empty: {
    padding: 'var(--space-6)',
    minWidth: 320,
    maxWidth: 420,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-5)',
  },
  title: {
    fontSize: 'var(--text-xl)',
    fontWeight: 'var(--weight-extrabold)',
    letterSpacing: '-0.02em',
  },
  section: {
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--space-4)',
    marginTop: 'var(--space-4)',
  },
  kv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  list: {
    margin: 0,
    paddingLeft: '1.2em',
    color: 'var(--color-text-muted)',
  },
};
