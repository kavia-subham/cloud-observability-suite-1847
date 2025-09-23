import React, { useMemo, useState } from 'react';

/**
 * WhatIfPanel
 * Simulate cost scenarios with mock estimations.
 * - Controls: memory, concurrency, traffic growth, cold start mitigation toggle.
 * - Outputs: estimated monthly cost, delta vs baseline, simple projection mini-chart.
 *
 * PUBLIC INTERFACE
 */
// PUBLIC_INTERFACE
export default function WhatIfPanel({
  baseline = seedBaseline(),
  title = 'What-if Analysis',
  style: styleProp = {},
  onSimulate = () => {},
}) {
  const [memory, setMemory] = useState(512); // MB
  const [concurrency, setConcurrency] = useState(20); // baseline units
  const [growth, setGrowth] = useState(10); // %
  const [mitigation, setMitigation] = useState(true); // cold start mitigation

  const result = useMemo(() => {
    const est = estimateCost({ baseline, memory, concurrency, growth, mitigation });
    return est;
  }, [baseline, memory, concurrency, growth, mitigation]);

  const projection = useMemo(() => seedProjection(result.estimatedMonthly), [result.estimatedMonthly]);

  const handleRun = () => {
    onSimulate({ memory, concurrency, growth, mitigation, result });
  };

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.badge}>Mock</span>
      </div>

      <div style={styles.grid}>
        <section className="surface" style={styles.controlCard} aria-label="Controls">
          <div className="h3" style={styles.sectionTitle}>Controls</div>
          <div style={styles.kv}>
            <label htmlFor="mem">Memory: <strong>{memory} MB</strong></label>
            <input id="mem" type="range" min={128} max={2048} step={64} value={memory} onChange={(e) => setMemory(parseInt(e.target.value, 10))} style={styles.range} />
          </div>
          <div style={styles.kv}>
            <label htmlFor="conc">Concurrency: <strong>{concurrency}</strong></label>
            <input id="conc" type="range" min={1} max={200} step={1} value={concurrency} onChange={(e) => setConcurrency(parseInt(e.target.value, 10))} style={styles.range} />
          </div>
          <div style={styles.kv}>
            <label htmlFor="growth">Traffic Growth: <strong>{growth}%</strong></label>
            <input id="growth" type="range" min={-50} max={200} step={5} value={growth} onChange={(e) => setGrowth(parseInt(e.target.value, 10))} style={styles.range} />
          </div>
          <div style={styles.kvRow}>
            <label htmlFor="mit" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="mit" type="checkbox" checked={mitigation} onChange={(e) => setMitigation(e.target.checked)} />
              Cold start mitigation
            </label>
            <button className="btn" onClick={handleRun}>Simulate</button>
          </div>
        </section>

        <section className="surface" style={styles.resultsCard} aria-label="Results">
          <div className="h3" style={styles.sectionTitle}>Results</div>
          <div style={styles.resultsGrid}>
            <Metric label="Baseline (mo.)" value={`$${formatNumber(baseline.monthly.toFixed(0))}`} />
            <Metric label="Estimated (mo.)" value={`$${formatNumber(result.estimatedMonthly.toFixed(0))}`} />
            <Metric label="Delta" value={`${result.deltaSign}${formatNumber(Math.abs(result.delta).toFixed(0))} (${result.deltaPct > 0 ? '+' : ''}${result.deltaPct.toFixed(1)}%)`} />
            <Metric label="Est. p95 impact" value={`${result.latencyImpactMs} ms`} />
          </div>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <MiniProjection data={projection} />
            <div className="text-muted" style={{ marginTop: 6, fontSize: 'var(--text-sm)' }}>
              12-week projection based on current inputs. Placeholder model, not financial advice.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={styles.metric}>
      <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}

function MiniProjection({ data = [], height = 120 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 8, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 4, alignItems: 'end', height }}>
        {data.map((v, i) => {
          const h = Math.max(4, (v / max) * (height - 16));
          const above = v > data[0];
          return (
            <div
              key={i}
              style={{
                height: h,
                borderRadius: 6,
                background: above
                  ? 'linear-gradient(180deg, rgba(239,68,68,0.6), rgba(0,0,0,0.6))'
                  : 'linear-gradient(180deg, rgba(16,185,129,0.6), rgba(0,0,0,0.6))',
              }}
              title={`$${formatNumber(v.toFixed(0))}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function estimateCost({ baseline, memory, concurrency, growth, mitigation }) {
  // Very rough mocked model:
  // cost ~ base * (memory/ baselineMem)^0.6 * (1 + growth%) * (1 + concFactor)
  // mitigation reduces cold start overhead which we map to 3% savings
  const memFactor = Math.pow(memory / baseline.memoryMb, 0.6);
  const concFactor = Math.pow((concurrency / baseline.concurrency), 0.35) - 1; // sublinear
  const growthFactor = 1 + growth / 100;
  let est = baseline.monthly * memFactor * (1 + Math.max(0, concFactor)) * growthFactor;
  if (mitigation) est *= 0.97;

  const delta = est - baseline.monthly;
  const deltaSign = delta >= 0 ? '+$' : '-$';
  const deltaPct = ((est / baseline.monthly) - 1) * 100;

  // mock latency impact: higher memory reduces p95, higher concurrency increases
  const latencyImpactMs = Math.round((baseline.p95ms * Math.pow(baseline.memoryMb / memory, 0.4)) + (concurrency - baseline.concurrency) * 0.6);

  return {
    estimatedMonthly: est,
    delta,
    deltaSign,
    deltaPct,
    latencyImpactMs: Math.max(0, latencyImpactMs),
  };
}

function seedBaseline() {
  return {
    monthly: 12430,
    memoryMb: 512,
    concurrency: 20,
    p95ms: 180,
  };
}

function seedProjection(start) {
  const arr = [];
  let v = start;
  for (let i = 0; i < 12; i++) {
    const jitter = 0.95 + Math.random() * 0.1;
    v = v * jitter;
    arr.push(v);
  }
  return arr;
}

function formatNumber(n) {
  try { return Number(n).toLocaleString(); } catch { return String(n); }
}

const styles = {
  card: { padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-5)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    background: 'var(--gradient-accent)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'var(--space-5)' },
  controlCard: { padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' },
  resultsCard: { padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' },
  sectionTitle: { margin: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' },
  kv: { display: 'grid', gap: 6, marginBottom: 'var(--space-3)' },
  kvRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' },
  range: { width: '100%' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' },
  metric: { border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 10px', background: 'rgba(255,255,255,0.03)' },
  metricValue: { fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)' },
};
