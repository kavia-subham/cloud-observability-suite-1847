import React from 'react';

/**
 * RootCausePanel
 * Displays contributing factors, suspected root causes, and remediation tips.
 * Pure presentational component using mock-props by default.
 */
// PUBLIC_INTERFACE
export default function RootCausePanel({
  factors = defaultFactors,
  suggestions = defaultSuggestions,
  style: styleProp = {},
  title = 'Root Cause Analysis',
}) {
  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={{ ...styles.pill, background: 'var(--color-primary)', color: '#000' }}>Beta</span>
      </div>

      <div style={styles.grid}>
        <div>
          <div className="h3" style={styles.sectionTitle}>Top Contributors</div>
          <ul style={styles.list}>
            {factors.map((f, i) => (
              <li key={i} style={styles.factorItem}>
                <span style={{ ...styles.dot, background: sevToColor[f.severity] }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{f.label}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{f.weight}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="h3" style={styles.sectionTitle}>Remediation Tips</div>
          <ol style={styles.list}>
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const sevToColor = {
  high: '#EF4444',
  medium: '#F97316',
  low: '#10B981',
};

const styles = {
  card: {
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-2)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)',
  },
  pill: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-6)',
  },
  sectionTitle: {
    margin: 0, marginBottom: 'var(--space-3)',
  },
  list: { margin: 0, paddingLeft: '1.2em', color: 'var(--color-text-muted)' },
  dot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block', marginRight: 8 },
  factorItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
};

const defaultFactors = [
  { label: 'Cold starts during deploy window', severity: 'high', weight: '42%' },
  { label: 'Dependency timeouts to billing API', severity: 'medium', weight: '27%' },
  { label: 'GC pauses on DB connections', severity: 'low', weight: '12%' },
  { label: 'Traffic spike (cron fan-out)', severity: 'medium', weight: '9%' },
];

const defaultSuggestions = [
  'Enable provisioned concurrency for payment flows during peak hour.',
  'Apply exponential backoff and circuit breaker for downstream calls.',
  'Warm-up critical path functions via scheduled pings.',
  'Evaluate connection pooling limits; switch to async I/O client.',
];
