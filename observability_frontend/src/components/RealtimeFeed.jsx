import React, { useEffect, useState } from 'react';

/**
 * RealtimeFeed
 * Displays a list of incoming events/updates.
 * Placeholder implementation using mock data and interval-based updates.
 * Designed to be replaced with WebSocket later.
 */
// PUBLIC_INTERFACE
export default function RealtimeFeed({ title = 'Realtime Feed', initialItems = mockItems, maxItems = 12, pollMs = 3000 }) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    // Simulate a live feed by pushing a new mock item every pollMs
    const interval = setInterval(() => {
      const next = generateMockItem();
      setItems((prev) => [next, ...prev].slice(0, maxItems));
    }, pollMs);
    return () => clearInterval(interval);
  }, [maxItems, pollMs]);

  return (
    <div className="surface" style={styles.card} aria-live="polite">
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.pill}>Live</span>
      </div>
      <ul style={styles.list}>
        {items.map((it) => (
          <li key={it.id} style={styles.item}>
            <span style={{ ...styles.sevDot, background: sevColor[it.severity] }} />
            <div style={styles.itemBody}>
              <div style={styles.itemTitle}>{it.title}</div>
              <div style={styles.itemMeta}>
                <span style={{ color: 'var(--color-text-muted)' }}>{it.provider} • {it.region}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{it.time}</span>
              </div>
            </div>
            <button style={styles.cta} className="btn btn-outline">Inspect</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: { padding: 'var(--space-6)' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-4)',
  },
  pill: {
    background: 'var(--gradient-accent)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: 'var(--space-3)',
  },
  item: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: 'var(--space-3)',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.03)',
  },
  sevDot: {
    width: 10, height: 10, borderRadius: '50%',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
  },
  itemBody: {
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  itemTitle: {
    fontWeight: 'var(--weight-semibold)',
  },
  itemMeta: {
    display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)',
  },
  cta: {
    padding: '6px 10px',
  },
};

const sevColor = {
  info: '#10B981',
  warn: '#F97316',
  error: '#EF4444',
};

const mockItems = [
  { id: '1', severity: 'warn', title: 'P95 latency spiked for payment-authorize', provider: 'AWS', region: 'us-east-1', time: 'now' },
  { id: '2', severity: 'info', title: 'New function discovered: gcp-report-daily', provider: 'GCP', region: 'us-central1', time: '2m ago' },
  { id: '3', severity: 'error', title: 'Error rate increased for auth-validate (1.2%)', provider: 'Azure', region: 'westeurope', time: '4m ago' },
];

function generateMockItem() {
  const pool = [
    { severity: 'warn', title: 'Cold start detected on analytics-ingest', provider: 'AWS', region: 'eu-west-1' },
    { severity: 'info', title: 'Autoscaling suggestion available for queue-processor', provider: 'GCP', region: 'us-central1' },
    { severity: 'error', title: 'Function timeout for webhook-dispatch', provider: 'Azure', region: 'eastus' },
    { severity: 'info', title: 'SLO burn rate returning to normal for checkout', provider: 'AWS', region: 'us-west-2' },
  ];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: String(Date.now()),
    ...pick,
    time: 'now',
  };
}
