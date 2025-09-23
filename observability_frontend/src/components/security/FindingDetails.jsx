import React from 'react';

/**
 * FindingDetails
 * Shows selected finding details including metadata, description, tags, and a simple timeline.
 * - Exposes onApprove and onRemediate handlers to trigger workflows.
 * - If no finding is selected, shows an empty state.
 */
// PUBLIC_INTERFACE
export default function FindingDetails({
  finding,
  onApprove = () => {},
  onRemediate = () => {},
  style: styleProp = {},
}) {
  if (!finding) {
    return (
      <div className="surface" style={{ ...styles.card, ...styleProp }}>
        <div style={{ color: 'var(--color-text-muted)' }}>Select a finding to see details.</div>
      </div>
    );
  }

  const meta = {
    id: finding.id,
    title: finding.title,
    severity: finding.severity,
    owner: finding.owner,
    status: finding.status,
    service: finding.service,
    resource: finding.resource,
    lastSeen: finding.lastSeenLabel,
    tags: seedTags(finding),
  };

  const timeline = seedTimeline(finding);

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div className="h3" style={{ margin: 0 }}>{meta.title}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            {meta.service} • {meta.resource} • Owner: {meta.owner}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ ...styles.badge, background: sevBg[meta.severity] }}>{meta.severity.toUpperCase()}</span>
          <span style={{ ...styles.badge, background: statusBg[meta.status] }}>{labelStatus(meta.status)}</span>
          <button className="btn btn-outline" onClick={() => onApprove(finding)}>Approve</button>
          <button className="btn" onClick={() => onRemediate(finding)}>Remediate</button>
        </div>
      </div>

      {/* Meta */}
      <div style={styles.kvRow}>
        <KV label="Finding ID" value={meta.id} mono />
        <KV label="Owner" value={meta.owner} />
        <KV label="Status" value={labelStatus(meta.status)} />
        <KV label="Last Seen" value={meta.lastSeen} />
      </div>

      {/* Description */}
      <section className="surface" style={styles.sectionCard}>
        <div className="h3" style={styles.sectionTitle}>Description</div>
        <p className="text-muted" style={{ marginTop: 0 }}>
          This is a mock description summarizing the impact and risk. In production, this section will show scanner output,
          affected resources, and suggested next steps tailored to your environment.
        </p>
        <ul style={styles.list}>
          <li>Potential data exposure risk due to misconfiguration.</li>
          <li>Applies to resource <code>{meta.resource}</code> in service <code>{meta.service}</code>.</li>
          <li>Mapped to CIS Controls and NIST CSF (mock).</li>
        </ul>
      </section>

      {/* Tags */}
      <section className="surface" style={styles.sectionCard}>
        <div className="h3" style={styles.sectionTitle}>Tags</div>
        <div style={styles.tagsWrap}>
          {meta.tags.map((t, i) => (
            <span key={i} style={styles.tag}>{t}</span>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="surface" style={styles.sectionCard}>
        <div className="h3" style={styles.sectionTitle}>Timeline</div>
        <ul style={{ ...styles.list, listStyle: 'none', paddingLeft: 0 }}>
          {timeline.map((ev, i) => (
            <li key={i} style={styles.timelineItem}>
              <span style={{ ...styles.dot, background: timelineColor[ev.type] }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)' }}>{ev.title}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{ev.detail}</div>
                </div>
                <div className="text-muted">{ev.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KV({ label, value, mono = false }) {
  return (
    <div style={styles.kv}>
      <span className="text-muted">{label}</span>
      <span style={mono ? { fontFamily: 'var(--font-family-mono)' } : {}}>{value}</span>
    </div>
  );
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
  badge: {
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
    border: '1px solid var(--color-border)',
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
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 10px',
  },
  sectionCard: {
    padding: 'var(--space-5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-surface)',
  },
  sectionTitle: { margin: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' },
  list: { margin: 0, paddingLeft: '1.2em', color: 'var(--color-text-muted)' },
  tagsWrap: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '2px 10px',
    background: 'rgba(255,255,255,0.06)',
    fontSize: 'var(--text-sm)',
  },
  timelineItem: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0' },
  dot: { width: 10, height: 10, borderRadius: '50%', marginTop: 6 },
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

const timelineColor = {
  created: '#60A5FA',
  updated: '#F59E0B',
  approved: '#10B981',
  remediated: '#10B981',
  comment: '#A78BFA',
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

function seedTags(f) {
  const base = ['CIS', 'NIST', 'Serverless', 'IAM', 'Encryption', 'Public Access'];
  const n = 3 + Math.floor(Math.random() * 3);
  return Array.from({ length: n }, (_, i) => base[(i + f.id.length) % base.length]);
}

function seedTimeline(f) {
  return [
    { type: 'created', title: 'Finding detected', detail: `Detected by scanner for ${f.service}`, time: '12m ago' },
    { type: 'updated', title: 'Ownership assigned', detail: `Owner set to ${f.owner}`, time: '10m ago' },
    { type: 'comment', title: 'Comment from Security', detail: 'Reviewing blast radius, preparing remediation.', time: '8m ago' },
    f.status === 'approved'
      ? { type: 'approved', title: 'Approval recorded', detail: 'Change approved by security lead', time: '2m ago' }
      : { type: 'updated', title: 'Triaging', detail: 'Awaiting approval or remediation', time: '2m ago' },
  ];
}
