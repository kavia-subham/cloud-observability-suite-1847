import React from 'react';

/**
 * CostSummary
 * Quick cost overview with a small, CSS-only spark bar chart.
 * Placeholder values; replace props with API-driven data later.
 */
// PUBLIC_INTERFACE
export default function CostSummary({
  title = 'Cost Summary',
  current = 12430,
  currency = '$',
  trend = -8,
  bars = defaultBars,
}) {
  const trendColor = trend >= 0 ? 'var(--color-error)' : 'var(--color-success)';
  const trendLabel = `${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}%`;

  return (
    <div className="surface" style={styles.card}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={{ ...styles.pill, color: '#000', background: 'var(--color-primary)' }}>Forecast</span>
      </div>
      <div style={styles.valueRow}>
        <div style={styles.value}>
          {currency}{formatNumber(current)}
        </div>
        <div style={{ ...styles.trend, color: trendColor }}>
          {trendLabel}
        </div>
      </div>
      <div style={styles.chart} aria-label="Cost trend spark bars">
        {bars.map((b, i) => (
          <div key={i} style={{ ...styles.bar, height: `${b}px` }} />
        ))}
      </div>
      <div style={styles.legend}>
        <span style={{ color: 'var(--color-text-muted)' }}>Last 14 days</span>
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

const styles = {
  card: { padding: 'var(--space-6)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' },
  pill: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  valueRow: { display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)' },
  value: { fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em' },
  trend: { fontWeight: 'var(--weight-bold)' },
  chart: {
    marginTop: 'var(--space-5)',
    display: 'grid',
    gridTemplateColumns: 'repeat(14, 1fr)',
    alignItems: 'end',
    gap: 6,
    height: 120,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
  },
  bar: {
    width: '100%',
    background: 'linear-gradient(180deg, rgba(249,115,22,0.65), rgba(16,185,129,0.45))',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
  },
  legend: { marginTop: 'var(--space-3)' },
};

const defaultBars = [24, 32, 18, 40, 36, 22, 28, 44, 38, 30, 26, 20, 34, 42];
