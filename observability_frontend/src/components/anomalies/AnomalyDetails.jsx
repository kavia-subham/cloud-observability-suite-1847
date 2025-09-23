import React, { useMemo } from 'react';
import RootCausePanel from './RootCausePanel';
import AiExplanation from './AiExplanation';

/**
 * AnomalyDetails
 * Shows selected anomaly details including mini timeseries chart, metadata,
 * root cause analysis, blast radius, and AI explanation.
 */
// PUBLIC_INTERFACE
export default function AnomalyDetails({
  anomaly,
  style: styleProp = {},
}) {
  const series = useMemo(() => generateSeries(24), [anomaly?.id]);

  if (!anomaly) {
    return (
      <div className="surface" style={{ ...styles.card, ...styleProp }}>
        <div style={{ color: 'var(--color-text-muted)' }}>
          Select an anomaly from the list to see details.
        </div>
      </div>
    );
  }

  const meta = {
    id: anomaly.id,
    service: anomaly.service,
    region: anomaly.region,
    severity: anomaly.severity,
    started: anomaly.time || 'now',
    metric: anomaly.metric || 'Latency',
    impacted: ['checkout', 'orders-write', 'billing-api'].slice(0, Math.min(3, Math.floor(Math.random() * 3) + 1)),
    blastRadius: Math.floor(Math.random() * 18) + 3, // percentage
  };

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div className="h3" style={{ margin: 0 }}>{meta.service}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>{meta.metric} • {meta.region}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ ...styles.badge, background: sevColor[meta.severity] }}>{meta.severity.toUpperCase()}</span>
          <button className="btn btn-outline">Acknowledge</button>
          <button className="btn">Create Incident</button>
        </div>
      </div>

      {/* Meta info */}
      <div style={styles.kvRow}>
        <div style={styles.kv}><span className="text-muted">Anomaly ID</span><span>{meta.id}</span></div>
        <div style={styles.kv}><span className="text-muted">Started</span><span>{meta.started}</span></div>
        <div style={styles.kv}><span className="text-muted">Blast radius</span><span>{meta.blastRadius}%</span></div>
        <div style={styles.kv}><span className="text-muted">Impacted</span><span>{meta.impacted.join(', ')}</span></div>
      </div>

      {/* Timeseries chart */}
      <div>
        <div className="h3" style={{ margin: 0, marginBottom: 'var(--space-2)' }}>Timeseries (mock)</div>
        <MiniChart data={series} threshold={0.7} />
        <div style={{ marginTop: 6, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          Last 2 hours • Red zone indicates threshold breach
        </div>
      </div>

      {/* RCA + AI */}
      <div style={styles.twoCol}>
        <RootCausePanel />
        <AiExplanation context={{ id: meta.id, service: meta.service, severity: meta.severity, metric: meta.metric }} />
      </div>
    </div>
  );
}

function MiniChart({ data, threshold = 0.7, height = 160 }) {
  // Render a simple bar + threshold line chart using divs (no external deps)
  const max = Math.max(...data, 1);
  return (
    <div style={{ position: 'relative', height, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 8, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{
        position: 'absolute',
        top: `${(1 - threshold) * 100}%`,
        left: 8,
        right: 8,
        height: 2,
        background: 'rgba(239,68,68,0.7)',
        borderRadius: 2,
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
                background: above ? 'linear-gradient(180deg, rgba(239,68,68,0.7), rgba(0,0,0,0.6))' : 'linear-gradient(180deg, rgba(249,115,22,0.65), rgba(16,185,129,0.45))',
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

function generateSeries(n = 24) {
  const base = Array.from({ length: n }, () => 0.3 + Math.random() * 0.4);
  // Inject a spike window
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
    gap: 'var(--space-6)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
    color: '#000',
  },
  kvRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-4)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    padding: 'var(--space-4) 0',
  },
  kv: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-6)',
  },
};

const sevColor = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};
