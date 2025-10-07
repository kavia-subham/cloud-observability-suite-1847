import React, { useMemo, useState } from 'react';

/**
 * FindingsTable
 * Lists security findings with columns: ID, Title, Severity, Owner, Status, Last Seen.
 * - Supports simple search and filter (severity/status).
 * - Emits onSelect when a row is clicked.
 * - Uses mock data by default.
 */
// PUBLIC_INTERFACE
export default function FindingsTable({
  findings = defaultFindings,
  onSelect = () => {},
  selectedId = null,
  title = 'Security Findings',
  style: styleProp = {},
  loading = false,
  error = '',
}) {
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent'); // recent | severity | owner

  const severities = ['all', 'critical', 'high', 'medium', 'low'];
  const statuses = ['all', 'new', 'in_progress', 'approved', 'resolved'];

  const filtered = useMemo(() => {
    let out = findings;
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      out = out.filter(
        (f) =>
          f.id.toLowerCase().includes(t) ||
          f.title.toLowerCase().includes(t) ||
          f.owner.toLowerCase().includes(t)
      );
    }
    if (sev !== 'all') out = out.filter((f) => f.severity === sev);
    if (status !== 'all') out = out.filter((f) => f.status === status);

    switch (sort) {
      case 'severity': {
        const order = ['critical', 'high', 'medium', 'low'];
        out = [...out].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
        break;
      }
      case 'owner':
        out = [...out].sort((a, b) => a.owner.localeCompare(b.owner));
        break;
      case 'recent':
      default:
        out = [...out].sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));
        break;
    }
    return out;
  }, [findings, q, sev, status, sort]);

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.pill}>Mock</span>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap} className="app-surface-ring">
          <span role="img" aria-label="search" style={{ marginRight: 8 }}>🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, title, owner..."
            aria-label="Search findings"
            style={styles.input}
          />
        </div>
        <div style={styles.filters}>
          <select aria-label="Severity filter" value={sev} onChange={(e) => setSev(e.target.value)} style={styles.select}>
            {severities.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
            {statuses.map(s => <option key={s} value={s}>{labelStatus(s)}</option>)}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
            <option value="recent">Recent</option>
            <option value="severity">Severity</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="text-muted" style={{ padding: 'var(--space-4)' }}>Loading...</div>
      )}
      {!loading && error && (
        <div role="alert" style={{ padding: 'var(--space-4)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div role="table" aria-label="Findings table" style={styles.table}>
        <div role="row" style={{ ...styles.tr, ...styles.th }}>
          <div role="columnheader" style={styles.td}>ID</div>
          <div role="columnheader" style={styles.td}>Title</div>
          <div role="columnheader" style={styles.td}>Severity</div>
          <div role="columnheader" style={styles.td}>Owner</div>
          <div role="columnheader" style={styles.td}>Status</div>
          <div role="columnheader" style={styles.td}>Last Seen</div>
        </div>
        {filtered.map((f) => {
          const active = selectedId === f.id;
          return (
            <button
              key={f.id}
              role="row"
              className="btn-outline"
              onClick={() => onSelect(f)}
              style={{
                ...styles.trBtn,
                ...(active ? styles.rowActive : {}),
                borderColor: active ? 'var(--color-secondary)' : 'var(--color-border)',
              }}
              title={`Open finding ${f.id}`}
              aria-selected={active}
            >
              <div role="cell" style={{ ...styles.td, fontFamily: 'var(--font-family-mono)' }}>{f.id}</div>
              <div role="cell" style={styles.td}>
                <div style={{ fontWeight: 'var(--weight-semibold)' }}>{f.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{f.service} • {f.resource}</div>
              </div>
              <div role="cell" style={styles.td}>
                <span style={{ ...styles.badge, background: sevBg[f.severity] }}>{f.severity.toUpperCase()}</span>
              </div>
              <div role="cell" style={styles.td}>{f.owner || f.service || '-'}</div>
              <div role="cell" style={styles.td}>
                <span style={{ ...styles.badge, background: statusBg[f.status] }}>{labelStatus(f.status)}</span>
              </div>
              <div role="cell" style={styles.td}>{f.lastSeenLabel}</div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-muted" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            No findings match your filters.
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
    minWidth: 260,
  },
  input: {
    appearance: 'none', border: 'none', outline: 'none',
    background: 'transparent', color: 'var(--color-text)',
    width: 260,
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
  table: { display: 'grid', gap: 6 },
  tr: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 2.2fr 1fr 1.2fr 1.2fr 1fr',
    alignItems: 'center',
    gap: 8,
  },
  th: { color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' },
  td: { textAlign: 'left' },
  trBtn: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 2.2fr 1fr 1.2fr 1.2fr 1fr',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    color: 'var(--color-text)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'left',
    cursor: 'pointer',
  },
  rowActive: {
    boxShadow: '0 0 0 2px var(--color-secondary) inset',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,0,0,1))',
  },
  badge: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
    background: 'rgba(255,255,255,0.06)',
  },
};

const sevBg = {
  critical: 'rgba(239,68,68,0.25)',
  high: 'rgba(249,115,22,0.25)',
  medium: 'rgba(245,158,11,0.20)',
  low: 'rgba(16,185,129,0.25)',
};

const statusBg = {
  new: 'rgba(239,68,68,0.2)',
  in_progress: 'rgba(245,158,11,0.2)',
  approved: 'rgba(16,185,129,0.25)',
  resolved: 'rgba(16,185,129,0.32)',
};

function labelStatus(s) {
  switch (s) {
    case 'new': return 'New';
    case 'in_progress': return 'In Progress';
    case 'approved': return 'Approved';
    case 'resolved': return 'Resolved';
    default: return String(s).replace('_', ' ');
  }
}

const now = Date.now();
const defaultFindings = [
  {
    id: 'SEC-1042',
    title: 'Public S3 bucket with sensitive policy artifacts',
    severity: 'high',
    owner: 'platform-security',
    status: 'new',
    lastSeenAt: now - 1000 * 60 * 1,
    lastSeenLabel: '1m ago',
    service: 's3',
    resource: 'arn:aws:s3:::policy-artifacts',
  },
  {
    id: 'SEC-1041',
    title: 'Lambda with wildcard IAM role attached',
    severity: 'critical',
    owner: 'payments-team',
    status: 'in_progress',
    lastSeenAt: now - 1000 * 60 * 3,
    lastSeenLabel: '3m ago',
    service: 'lambda',
    resource: 'payment-authorize',
  },
  {
    id: 'SEC-1040',
    title: 'Function URL missing auth (public endpoint)',
    severity: 'medium',
    owner: 'edge-team',
    status: 'approved',
    lastSeenAt: now - 1000 * 60 * 8,
    lastSeenLabel: '8m ago',
    service: 'lambda',
    resource: 'webhook-dispatch',
  },
  {
    id: 'SEC-1039',
    title: 'KMS key rotation disabled',
    severity: 'low',
    owner: 'platform-security',
    status: 'resolved',
    lastSeenAt: now - 1000 * 60 * 11,
    lastSeenLabel: '11m ago',
    service: 'kms',
    resource: 'orders-encryption',
  },
];
