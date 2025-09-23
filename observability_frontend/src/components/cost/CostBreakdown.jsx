import React, { useMemo, useState } from 'react';

/**
 * CostBreakdown
 * Visual cost charts by provider/service/time using mock data.
 * - No external chart libs; uses CSS-only bar and donut visuals for portability.
 * - Exposes callbacks and accepts overrides for future API wiring.
 *
 * PUBLIC INTERFACE
 */
// PUBLIC_INTERFACE
export default function CostBreakdown({
  data: dataProp,
  providers: providersProp,
  services: servicesProp,
  defaultRange = '30d',
  onFilterChange = () => {},
  style: styleProp = {},
  title = 'Cost Breakdown',
}) {
  const mock = useMemo(() => seedMock(), []);
  const providers = providersProp || mock.providers;
  const services = servicesProp || mock.services;
  const data = dataProp || mock.data;

  const [provider, setProvider] = useState('all');
  const [service, setService] = useState('all');
  const [range, setRange] = useState(defaultRange);

  const ranges = ['7d', '30d', '90d'];

  const filteredSeries = useMemo(() => {
    const series = data.timeseries[range] || [];
    return series.map((p) => {
      if (provider !== 'all' && p.provider !== provider) return null;
      if (service !== 'all' && p.service !== service) return null;
      return p;
    }).filter(Boolean);
  }, [data, range, provider, service]);

  const totalByProvider = useMemo(() => {
    const map = new Map();
    (data.totals[range] || []).forEach((row) => {
      if (service !== 'all' && row.service !== service) return;
      map.set(row.provider, (map.get(row.provider) || 0) + row.cost);
    });
    return Array.from(map.entries()).map(([prov, value]) => ({ provider: prov, value }));
  }, [data, range, service]);

  const totalByService = useMemo(() => {
    const map = new Map();
    (data.totals[range] || []).forEach((row) => {
      if (provider !== 'all' && row.provider !== provider) return;
      map.set(row.service, (map.get(row.service) || 0) + row.cost);
    });
    return Array.from(map.entries()).map(([svc, value]) => ({ service: svc, value }));
  }, [data, range, provider]);

  const grandTotal = useMemo(() => {
    return (data.totals[range] || []).reduce((sum, r) => {
      if (provider !== 'all' && r.provider !== provider) return sum;
      if (service !== 'all' && r.service !== service) return sum;
      return sum + r.cost;
    }, 0);
  }, [data, range, provider, service]);

  const onChange = (next) => {
    onFilterChange({ provider, service, range, ...next });
  };

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <div style={styles.filters}>
          <select
            aria-label="Range"
            value={range}
            onChange={(e) => { setRange(e.target.value); onChange({ range: e.target.value }); }}
            style={styles.select}
          >
            {ranges.map((r) => <option key={r} value={r}>{labelRange(r)}</option>)}
          </select>
          <select
            aria-label="Provider"
            value={provider}
            onChange={(e) => { setProvider(e.target.value); onChange({ provider: e.target.value }); }}
            style={styles.select}
          >
            <option value="all">All Providers</option>
            {providers.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            aria-label="Service"
            value={service}
            onChange={(e) => { setService(e.target.value); onChange({ service: e.target.value }); }}
            style={styles.select}
          >
            <option value="all">All Services</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Top: Totals and donut summaries */}
      <section style={styles.summaryRow}>
        <div className="surface" style={styles.totalCard}>
          <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Total ({labelRange(range)})</div>
          <div style={styles.totalValue}>${formatNumber(grandTotal.toFixed(0))}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Filters: {provider === 'all' ? 'All providers' : provider} • {service === 'all' ? 'All services' : service}
          </div>
        </div>
        <Donut
          title="By Provider"
          items={totalByProvider.map((r) => ({ label: r.provider, value: r.value, color: providerColor(r.provider) }))}
        />
        <Donut
          title="By Service"
          items={totalByService.map((r) => ({ label: r.service, value: r.value, color: serviceColor(r.service) }))}
        />
      </section>

      {/* Bottom: Timeseries per selection */}
      <section>
        <div className="h3" style={{ margin: 0, marginBottom: 'var(--space-3)' }}>Timeseries (mock)</div>
        <BarTimeseries series={filteredSeries} />
        <div className="text-muted" style={{ marginTop: 6, fontSize: 'var(--text-sm)' }}>
          Simple stacked bars per day using CSS; replace with API-backed data.
        </div>
      </section>
    </div>
  );
}

function Donut({ title, items = [], size = 160, thickness = 20 }) {
  const total = Math.max(1, items.reduce((s, i) => s + i.value, 0));
  let acc = 0;
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="surface" style={styles.donutCard}>
      <div className="h3" style={styles.sectionTitle}>{title}</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center} cy={center} r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
        />
        {items.map((it, idx) => {
          const frac = it.value / total;
          const len = circumference * frac;
          const dashArray = `${len} ${circumference - len}`;
          const dashOffset = circumference * (1 - acc) + 2;
          acc += frac;
          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={it.color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset var(--transition-base)' }}
            />
          );
        })}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="var(--color-text)">
          ${formatNumber(total.toFixed(0))}
        </text>
      </svg>
      <ul style={styles.legend}>
        {items.map((it, i) => (
          <li key={i} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: it.color }} />
            <span>{it.label}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>${formatNumber(it.value.toFixed(0))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarTimeseries({ series = [], height = 140 }) {
  // Group by day and stack bars by (provider,service) tuples
  // series: [{ day, provider, service, cost }]
  const byDay = new Map();
  series.forEach((p) => {
    const k = p.day;
    const arr = byDay.get(k) || [];
    arr.push(p);
    byDay.set(k, arr);
  });
  const days = Array.from(byDay.keys()).sort();
  const max = Math.max(1, ...days.map((d) => byDay.get(d).reduce((s, r) => s + r.cost, 0)));

  return (
    <div
      style={{
        ...styles.tsWrap,
        gridTemplateColumns: `repeat(${days.length || 1}, 1fr)`,
        height,
      }}
      role="img"
      aria-label="Stacked cost timeseries"
    >
      {days.map((d) => {
        const parts = byDay.get(d).sort((a, b) => a.provider.localeCompare(b.provider));
        const total = parts.reduce((s, r) => s + r.cost, 0);
        let acc = 0;
        return (
          <div key={d} style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }} title={`${d} • $${formatNumber(total.toFixed(0))}`}>
            <div style={{ position: 'relative', width: '100%', height: `${Math.max(4, (total / max) * (height - 16))}px` }}>
              {parts.map((p, i) => {
                const h = Math.max(2, (p.cost / total) * 100);
                const color = providerColor(p.provider);
                const y = (acc / total) * 100;
                acc += p.cost;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${y}%`,
                      height: `${h}%`,
                      background: color,
                      borderRadius: i === 0 ? '6px 6px 0 0' : 0,
                    }}
                    title={`${p.provider}/${p.service} • $${formatNumber(p.cost.toFixed(0))}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function labelRange(r) {
  switch (r) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    default: return r;
  }
}

function providerColor(p) {
  const s = String(p || '').toLowerCase();
  if (s.startsWith('aws')) return 'rgba(249,115,22,0.75)';
  if (s.startsWith('gcp') || s.startsWith('google')) return 'rgba(16,185,129,0.75)';
  if (s.startsWith('azure')) return 'rgba(96,165,250,0.75)';
  return 'rgba(245,158,11,0.75)';
}

function serviceColor(s) {
  const key = String(s || '').toLowerCase();
  const map = {
    compute: 'rgba(16,185,129,0.75)',
    storage: 'rgba(59,130,246,0.75)',
    network: 'rgba(245,158,11,0.75)',
    database: 'rgba(99,102,241,0.75)',
    functions: 'rgba(249,115,22,0.75)',
    api: 'rgba(234,88,12,0.75)',
  };
  return map[key] || 'rgba(148,163,184,0.75)';
}

function formatNumber(n) {
  try { return Number(n).toLocaleString(); } catch { return String(n); }
}

const styles = {
  card: {
    padding: 'var(--space-6)',
    display: 'grid',
    gap: 'var(--space-5)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  filters: { display: 'flex', gap: 'var(--space-3)', alignItems: 'center' },
  select: {
    appearance: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 10px',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr',
    gap: 'var(--space-5)',
  },
  totalCard: {
    padding: 'var(--space-5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-surface)',
  },
  totalValue: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--weight-extrabold)',
    letterSpacing: '-0.02em',
  },
  donutCard: {
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-surface)',
  },
  sectionTitle: { margin: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' },
  legend: { margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6, marginTop: 'var(--space-3)' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },
  tsWrap: {
    display: 'grid',
    gap: 6,
    alignItems: 'end',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
  },
};

// Mock data seeding
function seedMock() {
  const providers = ['AWS', 'GCP', 'Azure'];
  const services = ['compute', 'storage', 'database', 'network', 'functions', 'api'];
  const days = {
    '7d': 7,
    '30d': 14,
    '90d': 18, // sample resolution, not full 90 points (kept light)
  };

  const totals = {};
  const timeseries = {};

  Object.entries(days).forEach(([range, n]) => {
    const pts = [];
    const totalsRows = [];

    for (let i = 0; i < n; i++) {
      const day = `D-${n - i}`;
      providers.forEach((prov) => {
        services.forEach((svc) => {
          const base = baseFor(prov, svc);
          const jitter = 0.75 + Math.random() * 0.5;
          const cost = Math.round(base * jitter);
          pts.push({ day, provider: prov, service: svc, cost });
          totalsRows.push({ provider: prov, service: svc, cost });
        });
      });
    }
    timeseries[range] = pts;

    // aggregate totals by (provider, service)
    const agg = new Map();
    totalsRows.forEach((r) => {
      const k = `${r.provider}|${r.service}`;
      agg.set(k, (agg.get(k) || 0) + r.cost);
    });
    totals[range] = Array.from(agg.entries()).map(([k, cost]) => {
      const [provider, service] = k.split('|');
      return { provider, service, cost };
    });
  });

  return { providers, services, data: { timeseries, totals } };
}

function baseFor(prov, svc) {
  const p = prov.toLowerCase();
  const s = svc.toLowerCase();
  let v = 100;
  if (p.startsWith('aws')) v += 60;
  if (p.startsWith('gcp')) v += 40;
  if (p.startsWith('azure')) v += 50;

  if (s === 'compute') v += 120;
  if (s === 'functions') v += 100;
  if (s === 'storage') v += 80;
  if (s === 'database') v += 90;
  if (s === 'network') v += 40;
  if (s === 'api') v += 70;
  return v;
}
