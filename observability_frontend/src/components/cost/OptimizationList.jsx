import React, { useMemo, useState } from 'react';

/**
 * OptimizationList
 * Recommended optimizations with estimated savings and impact.
 * - Mock data by default; supports filters and sorting.
 * - Exposes onApply/onIgnore handlers for future workflow integration.
 *
 * PUBLIC INTERFACE
 */
// PUBLIC_INTERFACE
export default function OptimizationList({
  items: itemsProp,
  onApply = () => {},
  onIgnore = () => {},
  title = 'Optimization Recommendations',
  style: styleProp = {},
}) {
  const itemsDefault = useMemo(() => seedOptimizations(), []);
  const items = itemsProp || itemsDefault;

  const [provider, setProvider] = useState('all');
  const [impact, setImpact] = useState('all');
  const [sort, setSort] = useState('savings'); // savings | impact | provider

  const providers = ['all', ...Array.from(new Set(items.map(i => i.provider)))];
  const impacts = ['all', 'high', 'medium', 'low'];

  const filtered = useMemo(() => {
    let out = items;
    if (provider !== 'all') out = out.filter(i => i.provider === provider);
    if (impact !== 'all') out = out.filter(i => i.impact === impact);
    switch (sort) {
      case 'impact': {
        const order = ['high', 'medium', 'low'];
        out = [...out].sort((a, b) => order.indexOf(a.impact) - order.indexOf(b.impact));
        break;
      }
      case 'provider':
        out = [...out].sort((a, b) => a.provider.localeCompare(b.provider));
        break;
      case 'savings':
      default:
        out = [...out].sort((a, b) => b.savingsMonthly - a.savingsMonthly);
        break;
    }
    return out;
  }, [items, provider, impact, sort]);

  const totalSavings = filtered.reduce((s, i) => s + i.savingsMonthly, 0);

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <div style={styles.filters}>
          <select aria-label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} style={styles.select}>
            {providers.map(p => <option key={p} value={p}>{p === 'all' ? 'All Providers' : p}</option>)}
          </select>
          <select aria-label="Impact" value={impact} onChange={(e) => setImpact(e.target.value)} style={styles.select}>
            {impacts.map(i => <option key={i} value={i}>{i.toUpperCase()}</option>)}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
            <option value="savings">Savings</option>
            <option value="impact">Impact</option>
            <option value="provider">Provider</option>
          </select>
        </div>
      </div>

      <div style={styles.totalRow}>
        <div className="text-muted">Potential monthly savings (filtered)</div>
        <div style={styles.totalValue}>${formatNumber(totalSavings)}</div>
      </div>

      <ul style={styles.list} role="list">
        {filtered.map((rec) => (
          <li key={rec.id} className="surface" style={styles.item}>
            <div style={styles.itemHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...styles.dot, background: impactColor[rec.impact] }} />
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)' }}>{rec.title}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                    {rec.provider} • {rec.service} • {rec.resource}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'var(--weight-bold)' }}>${formatNumber(rec.savingsMonthly)} / mo</div>
                <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{rec.impact.toUpperCase()} impact</div>
              </div>
            </div>
            <div className="text-muted" style={{ marginTop: 6 }}>
              {rec.description}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3)' }}>
              <button className="btn" onClick={() => onApply(rec)}>Apply</button>
              <button className="btn btn-outline" onClick={() => onIgnore(rec)}>Ignore</button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            No recommendations match your filters.
          </div>
        )}
      </ul>
    </div>
  );
}

const styles = {
  card: { padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-4)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  filters: { display: 'flex', gap: 'var(--space-3)' },
  select: {
    appearance: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 10px',
  },
  totalRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' },
  totalValue: { fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)' },
  list: { margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-3)' },
  item: { padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)' },
  itemHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 10, height: 10, borderRadius: '50%' },
};

const impactColor = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

function formatNumber(n) {
  try { return Number(n).toLocaleString(); } catch { return String(n); }
}

function seedOptimizations() {
  return [
    {
      id: 'opt-1',
      title: 'Right-size memory for payment-authorize',
      provider: 'GCP',
      service: 'functions',
      resource: 'payment-authorize',
      savingsMonthly: 820,
      impact: 'high',
      description: 'Reduce memory from 512MB to 256MB with negligible latency impact in 95% of invocations.',
    },
    {
      id: 'opt-2',
      title: 'Enable intelligent tiering for policy artifacts bucket',
      provider: 'AWS',
      service: 'storage',
      resource: 's3://policy-artifacts',
      savingsMonthly: 260,
      impact: 'medium',
      description: 'Move infrequently accessed objects to cheaper storage classes automatically.',
    },
    {
      id: 'opt-3',
      title: 'Use reserved concurrency for auth-validate',
      provider: 'AWS',
      service: 'functions',
      resource: 'auth-validate',
      savingsMonthly: 410,
      impact: 'medium',
      description: 'Pin predictable baseline traffic to reserved capacity to reduce on-demand costs.',
    },
    {
      id: 'opt-4',
      title: 'Consolidate egress for orders-db read replicas',
      provider: 'Azure',
      service: 'database',
      resource: 'orders-db',
      savingsMonthly: 150,
      impact: 'low',
      description: 'Reduce cross-zone egress by consolidating replicas into the most-used zone.',
    },
  ];
}
