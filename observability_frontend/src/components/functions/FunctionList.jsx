import React, { useMemo, useState } from 'react';

/**
 * FunctionList
 * Lists, filters, and searches serverless functions across providers/regions.
 * Uses mock data by default and exposes onSelect for integration.
 *
 * Accessibility: Role grid; rows are buttons with aria-selected for state.
 */
// PUBLIC_INTERFACE
export default function FunctionList({
  items = defaultFunctions,
  onSelect = () => {},
  selectedId = null,
  style: styleProp = {},
  title = 'Functions',
}) {
  const [q, setQ] = useState('');
  const [provider, setProvider] = useState('all');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('recent'); // recent | errors | latency

  const providers = useMemo(() => ['all', ...Array.from(new Set(items.map(i => i.provider)))], [items]);
  const regions = useMemo(() => ['all', ...Array.from(new Set(items.map(i => i.region)))], [items]);

  const filtered = useMemo(() => {
    let out = items;
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      out = out.filter(i =>
        i.name.toLowerCase().includes(t) ||
        i.provider.toLowerCase().includes(t) ||
        i.region.toLowerCase().includes(t) ||
        i.runtime.toLowerCase().includes(t)
      );
    }
    if (provider !== 'all') out = out.filter(i => i.provider === provider);
    if (region !== 'all') out = out.filter(i => i.region === region);

    switch (sort) {
      case 'errors':
        out = [...out].sort((a, b) => b.errorRate - a.errorRate);
        break;
      case 'latency':
        out = [...out].sort((a, b) => b.p95 - a.p95);
        break;
      case 'recent':
      default:
        out = [...out].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        break;
    }
    return out;
  }, [items, q, provider, region, sort]);

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.pill}>Mock</span>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap} className="app-surface-ring">
          <span role="img" aria-label="search" style={{ marginRight: 8 }}>🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, runtime, provider..."
            aria-label="Search functions"
            style={styles.input}
          />
        </div>

        <div style={styles.filters}>
          <select aria-label="Filter by provider" value={provider} onChange={(e) => setProvider(e.target.value)} style={styles.select}>
            {providers.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
          <select aria-label="Filter by region" value={region} onChange={(e) => setRegion(e.target.value)} style={styles.select}>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
            <option value="recent">Recent</option>
            <option value="errors">Errors</option>
            <option value="latency">Latency</option>
          </select>
        </div>
      </div>

      <div role="grid" aria-label="Functions list" style={styles.list}>
        {filtered.map(fn => {
          const active = selectedId === fn.id;
          return (
            <button
              key={fn.id}
              role="row"
              aria-selected={active}
              className="btn-outline"
              onClick={() => onSelect(fn)}
              style={{
                ...styles.row,
                ...(active ? styles.rowActive : {}),
                borderColor: active ? 'var(--color-secondary)' : 'var(--color-border)',
              }}
              title={`Open ${fn.name}`}
            >
              <span style={{ ...styles.providerGlyph, background: providerBg(fn.provider) }}>
                {providerGlyph(fn.provider)}
              </span>
              <div style={styles.rowBody}>
                <div style={styles.rowTitle}>
                  <strong>{fn.name}</strong>
                  <span style={{ color: 'var(--color-text-muted)' }}> • {fn.runtime} • {fn.memory}MB</span>
                </div>
                <div style={styles.rowMeta}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{fn.provider}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{fn.region}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{fn.updatedAtLabel}</span>
                </div>
              </div>
              <div style={styles.metrics}>
                <span style={styles.badge}>p95 {fn.p95} ms</span>
                <span style={{ ...styles.badge, background: fn.errorRate > 1 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)' }}>
                  {fn.errorRate.toFixed(2)}% err
                </span>
                <span style={styles.badge}>{fn.invocations.toLocaleString()} calls</span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-muted" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            No functions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-4)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    background: 'var(--gradient-accent)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 12px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    minWidth: 240,
  },
  input: {
    appearance: 'none', border: 'none', outline: 'none',
    background: 'transparent', color: 'var(--color-text)',
    width: 280,
  },
  filters: { display: 'flex', gap: 'var(--space-3)' },
  select: {
    appearance: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 10px',
  },
  list: { display: 'grid', gap: 'var(--space-3)' },
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
  providerGlyph: {
    width: 26, height: 26, borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#000', fontWeight: 'var(--weight-bold)',
    boxShadow: 'var(--elevation-1)',
  },
  rowBody: { display: 'flex', flexDirection: 'column', gap: 4 },
  rowTitle: {},
  rowMeta: { display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' },
  metrics: { display: 'flex', gap: 8, alignItems: 'center' },
  badge: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    background: 'rgba(255,255,255,0.06)',
  },
};

function providerGlyph(p) {
  const s = String(p || '').toLowerCase();
  if (s.startsWith('aws')) return 'A';
  if (s.startsWith('gcp') || s.startsWith('google')) return 'G';
  if (s.startsWith('azure')) return 'Z';
  return s[0]?.toUpperCase() || 'S';
}
function providerBg(p) {
  const s = String(p || '').toLowerCase();
  if (s.startsWith('aws')) return '#F97316';
  if (s.startsWith('gcp') || s.startsWith('google')) return '#10B981';
  if (s.startsWith('azure')) return '#60A5FA';
  return '#F59E0B';
}

const now = Date.now();
const defaultFunctions = [
  { id: 'fn-1', name: 'auth-validate', provider: 'AWS', region: 'us-east-1', runtime: 'nodejs18.x', memory: 256, p95: 142, errorRate: 0.32, invocations: 512340, updatedAt: now - 1000 * 60 * 2, updatedAtLabel: '2m ago' },
  { id: 'fn-2', name: 'payment-authorize', provider: 'GCP', region: 'us-central1', runtime: 'python3.11', memory: 512, p95: 188, errorRate: 1.24, invocations: 2210340, updatedAt: now - 1000 * 60 * 6, updatedAtLabel: '6m ago' },
  { id: 'fn-3', name: 'orders-write', provider: 'Azure', region: 'westeurope', runtime: 'nodejs18.x', memory: 1024, p95: 210, errorRate: 0.82, invocations: 703212, updatedAt: now - 1000 * 60 * 9, updatedAtLabel: '9m ago' },
  { id: 'fn-4', name: 'report-daily', provider: 'GCP', region: 'us-west1', runtime: 'go1.22', memory: 256, p95: 98, errorRate: 0.12, invocations: 53210, updatedAt: now - 1000 * 60 * 12, updatedAtLabel: '12m ago' },
  { id: 'fn-5', name: 'webhook-dispatch', provider: 'AWS', region: 'eu-west-1', runtime: 'python3.10', memory: 128, p95: 240, errorRate: 1.92, invocations: 112031, updatedAt: now - 1000 * 60 * 15, updatedAtLabel: '15m ago' },
];
