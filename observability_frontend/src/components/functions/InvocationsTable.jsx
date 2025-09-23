import React from 'react';

/**
 * InvocationsTable
 * Recent executions table with status, duration, cold start flag, and memory used.
 * Mock data by default; provide onRowClick for future deep links.
 */
// PUBLIC_INTERFACE
export default function InvocationsTable({
  rows = defaultRows,
  onRowClick = () => {},
  style: styleProp = {},
  title = 'Recent Invocations',
}) {
  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.pill}>Mock</span>
      </div>

      <div role="table" aria-label="Invocations table" style={styles.table}>
        <div role="row" style={{ ...styles.tr, ...styles.th }}>
          <div role="columnheader" style={styles.td}>Time</div>
          <div role="columnheader" style={styles.td}>Request ID</div>
          <div role="columnheader" style={styles.td}>Status</div>
          <div role="columnheader" style={styles.td}>Duration</div>
          <div role="columnheader" style={styles.td}>Cold Start</div>
          <div role="columnheader" style={styles.td}>Memory Used</div>
        </div>
        {rows.map((r) => (
          <button
            key={r.id}
            role="row"
            className="btn-outline"
            onClick={() => onRowClick(r)}
            style={styles.trBtn}
            title={`Open invocation ${r.id}`}
          >
            <div role="cell" style={styles.td}>{r.time}</div>
            <div role="cell" style={{ ...styles.td, fontFamily: 'var(--font-family-mono)' }}>{r.id}</div>
            <div role="cell" style={styles.td}>
              <span style={{ ...styles.statusDot, background: statusColor[r.status] }} />
              {r.status.toUpperCase()}
            </div>
            <div role="cell" style={styles.td}>{r.duration} ms</div>
            <div role="cell" style={styles.td}>{r.cold ? 'Yes' : 'No'}</div>
            <div role="cell" style={styles.td}>{r.memory} MB</div>
          </button>
        ))}
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
  table: { display: 'grid', gap: 6 },
  tr: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.6fr 1fr 1fr 0.8fr 1fr',
    alignItems: 'center',
    gap: 8,
  },
  th: { color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' },
  td: { textAlign: 'left' },
  trBtn: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.6fr 1fr 1fr 0.8fr 1fr',
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
  statusDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6 },
};

const statusColor = {
  ok: '#10B981',
  error: '#EF4444',
  throttled: '#F59E0B',
};

const defaultRows = [
  { id: 'req_12af8c', time: '12:03:22', status: 'ok', duration: 142, cold: true, memory: 118 },
  { id: 'req_12af8d', time: '12:03:28', status: 'ok', duration: 131, cold: false, memory: 122 },
  { id: 'req_12af8e', time: '12:03:31', status: 'error', duration: 3001, cold: false, memory: 120 },
  { id: 'req_12af8f', time: '12:03:41', status: 'ok', duration: 155, cold: false, memory: 116 },
  { id: 'req_12af90', time: '12:03:52', status: 'throttled', duration: 12, cold: false, memory: 20 },
];
