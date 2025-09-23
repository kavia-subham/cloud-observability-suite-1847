import React from 'react';

/**
 * MetricsOverviewGrid
 * Displays a grid of key metrics in bold tiles.
 * Uses placeholder/mock data and emits onTileClick for future integration.
 */
// PUBLIC_INTERFACE
export default function MetricsOverviewGrid({
  metrics = defaultMetrics,
  onTileClick = () => {},
}) {
  return (
    <section style={styles.grid} aria-label="Key metrics overview">
      {metrics.map((m) => (
        <button
          key={m.key}
          className="surface"
          style={{
            ...styles.tile,
            borderColor: m.trend === 'up' ? 'rgba(16,185,129,0.35)' : m.trend === 'down' ? 'rgba(239,68,68,0.35)' : 'var(--color-border)',
          }}
          onClick={() => onTileClick(m)}
          title={`View details for ${m.title}`}
        >
          <div style={styles.tileHead}>
            <span
              style={{
                ...styles.badge,
                background: m.trend === 'up'
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(0,0,0,1) 100%)'
                  : m.trend === 'down'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(0,0,0,1) 100%)'
                  : 'var(--gradient-accent)',
              }}
            >
              {m.badge}
            </span>
          </div>
          <div style={styles.tileTitle}>{m.title}</div>
          <div style={styles.tileValue}>{m.value}</div>
          {m.delta && (
            <div style={styles.tileDelta}>
              <span
                style={{
                  ...styles.deltaDot,
                  background: m.trend === 'up' ? 'var(--color-success)' : m.trend === 'down' ? 'var(--color-error)' : 'var(--color-secondary)',
                }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>{m.delta}</span>
            </div>
          )}
        </button>
      ))}
    </section>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--space-6)',
  },
  tile: {
    textAlign: 'left',
    padding: 'var(--space-6)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-base), border var(--transition-fast)',
  },
  tileHead: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 'var(--space-3)',
  },
  badge: {
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
  tileDelta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 'var(--space-3)',
  },
  deltaDot: {
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
  },
};

const defaultMetrics = [
  { key: 'invocations', title: 'Invocations (24h)', value: '2.1M', delta: '+4.2%', trend: 'up', badge: 'All providers' },
  { key: 'errorRate', title: 'Error Rate', value: '0.42%', delta: '-0.08%', trend: 'up', badge: 'Global' },
  { key: 'p95Latency', title: 'P95 Latency', value: '148 ms', delta: '+7 ms', trend: 'down', badge: 'Latency' },
  { key: 'cost', title: 'Cost (Mo.)', value: '$12,430', delta: '↓ 8% forecast', trend: 'up', badge: 'Forecast' },
];
