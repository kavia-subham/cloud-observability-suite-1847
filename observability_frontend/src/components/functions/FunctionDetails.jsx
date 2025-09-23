import React, { useMemo, useState } from 'react';

/**
 * FunctionDetails
 * Tabbed details for a selected function:
 * - Overview: quick stats, actions
 * - Metrics: simple CSS chart placeholders
 * - Config: runtime, memory, env vars (mock)
 * - Logs: live-like stream (mock), ready for WebSocket
 *
 * Expects a function object similar to FunctionList entries.
 */
// PUBLIC_INTERFACE
export default function FunctionDetails({
  fn,
  style: styleProp = {},
  onInvoke = () => {},
}) {
  const [tab, setTab] = useState('overview');
  const series = useMemo(() => generateSeries(24), [fn?.id]);

  if (!fn) {
    return (
      <div className="surface" style={{ ...styles.card, ...styleProp }}>
        <div className="text-muted">Select a function to see details.</div>
      </div>
    );
  }

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <div>
          <div className="h3" style={{ margin: 0 }}>{fn.name}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            {fn.provider} • {fn.region} • {fn.runtime} • {fn.memory}MB
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline">Open Traces</button>
          <button className="btn" onClick={() => onInvoke(fn)}>Test Invoke</button>
        </div>
      </div>

      <nav aria-label="Function details tabs" style={styles.tabs}>
        {['overview', 'metrics', 'config', 'logs'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn-outline"
            style={{
              ...styles.tabBtn,
              ...(tab === t ? styles.tabBtnActive : {}),
            }}
          >
            {label(t)}
          </button>
        ))}
      </nav>

      <section>
        {tab === 'overview' && (
          <div style={styles.gridTwo}>
            <div className="surface" style={styles.sectionCard}>
              <div className="h3" style={styles.sectionTitle}>Key Stats</div>
              <div style={styles.kvGrid}>
                <KV label="Invocations (24h)" value={formatNumber(fn.invocations)} />
                <KV label="P95 Latency" value={`${fn.p95} ms`} />
                <KV label="Error Rate" value={`${fn.errorRate.toFixed(2)}%`} />
                <KV label="Last Updated" value={fn.updatedAtLabel} />
              </div>
            </div>
            <div className="surface" style={styles.sectionCard}>
              <div className="h3" style={styles.sectionTitle}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn">Create Alert</button>
                <button className="btn btn-outline">Scale Policy</button>
                <button className="btn btn-outline">Open Logs</button>
                <button className="btn btn-outline">Permissions</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'metrics' && (
          <div className="surface" style={styles.sectionCard}>
            <div className="h3" style={styles.sectionTitle}>Latency p95 (mock)</div>
            <MiniChart data={series} threshold={0.65} />
            <div className="text-muted" style={{ marginTop: 6 }}>Last 2 hours • Threshold shown in red</div>
          </div>
        )}

        {tab === 'config' && (
          <div className="surface" style={styles.sectionCard}>
            <div className="h3" style={styles.sectionTitle}>Configuration</div>
            <div style={styles.kvGrid}>
              <KV label="Runtime" value={fn.runtime} />
              <KV label="Memory" value={`${fn.memory} MB`} />
              <KV label="Timeout" value="30 sec" />
              <KV label="Concurrency" value="Auto" />
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="h3" style={styles.sectionTitle}>Environment (mock)</div>
              <ul style={{ margin: 0, paddingLeft: '1.2em', color: 'var(--color-text-muted)' }}>
                <li>NODE_ENV=production</li>
                <li>LOG_LEVEL=info</li>
                <li>API_BASE_URL=https://api.example.internal</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="surface" style={styles.sectionCard}>
            <div className="h3" style={styles.sectionTitle}>Recent Logs (mock)</div>
            <div style={styles.logsWrap} aria-live="polite">
              {mockLogs.map((l, i) => (
                <div key={i} style={styles.logLine}>
                  <span style={{ ...styles.logDot, background: levelToColor[l.level] }} />
                  <span style={{ color: 'var(--color-text-muted)', marginRight: 8 }}>{l.time}</span>
                  <code style={{ border: 'none', background: 'transparent', padding: 0 }}>{l.msg}</code>
                </div>
              ))}
            </div>
            <div className="text-muted" style={{ marginTop: 6 }}>
              Placeholder for WebSocket streaming logs and log filters.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function label(t) {
  switch (t) {
    case 'overview': return 'Overview';
    case 'metrics': return 'Metrics';
    case 'config': return 'Config';
    case 'logs': return 'Logs';
    default: return t;
  }
}

function KV({ label, value }) {
  return (
    <div style={styles.kvItem}>
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MiniChart({ data, threshold = 0.7, height = 140 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ position: 'relative', height, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 8, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{
        position: 'absolute', top: `${(1 - threshold) * 100}%`, left: 8, right: 8, height: 2,
        background: 'rgba(239,68,68,0.7)', borderRadius: 2,
      }} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 4, alignItems: 'end', height: '100%' }}>
        {data.map((v, i) => {
          const h = Math.max(4, (v / max) * (height - 16));
          const above = (v / max) >= threshold;
          return (
            <div
              key={i}
              title={`${(v / max * 100).toFixed(0)}%`}
              style={{
                height: h,
                background: above ? 'linear-gradient(180deg, rgba(239,68,68,0.7), rgba(0,0,0,0.6))'
                  : 'linear-gradient(180deg, rgba(249,115,22,0.65), rgba(16,185,129,0.45))',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatNumber(n) {
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

function generateSeries(n = 24) {
  const base = Array.from({ length: n }, () => 0.3 + Math.random() * 0.4);
  const spikeStart = Math.floor(n * 0.55);
  for (let i = spikeStart; i < Math.min(n, spikeStart + 4); i++) {
    base[i] += 0.4 + Math.random() * 0.3;
  }
  return base.map(v => Math.min(1.2, v));
}

const styles = {
  card: {
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    display: 'grid',
    gap: 'var(--space-5)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  tabs: {
    display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  tabBtnActive: {
    background: 'var(--gradient-accent)',
    borderColor: 'var(--color-secondary)',
  },
  gridTwo: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)',
  },
  sectionCard: {
    padding: 'var(--space-5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-surface)',
  },
  sectionTitle: { margin: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' },
  kvGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)',
  },
  kvItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 10px',
  },
  logsWrap: {
    maxHeight: 260, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
    background: 'rgba(255,255,255,0.03)',
  },
  logLine: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' },
  logDot: { width: 8, height: 8, borderRadius: '50%' },
};

const levelToColor = {
  info: '#10B981',
  warn: '#F59E0B',
  error: '#EF4444',
};

const mockLogs = [
  { level: 'info', time: '12:03:22', msg: 'Cold start detected; initializing runtime (nodejs18.x)' },
  { level: 'warn', time: '12:03:24', msg: 'Downstream latency increased: billing-api p95=820ms' },
  { level: 'info', time: '12:03:31', msg: 'Request completed status=200 in 142ms' },
  { level: 'error', time: '12:03:41', msg: 'Timeout while calling authz service after 3000ms' },
  { level: 'info', time: '12:03:52', msg: 'Retry succeeded; status=200' },
];
