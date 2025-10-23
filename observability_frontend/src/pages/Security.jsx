import React, { useMemo, useState } from 'react';
import FindingsTable from '../components/security/FindingsTable';
import FindingDetails from '../components/security/FindingDetails';
import WorkflowModal from '../components/security/WorkflowModal';

// PUBLIC_INTERFACE
export default function Security() {
  // Seed page-level mock data and selection state
  const findings = useMemo(() => seedFindings(), []);
  const [selected, setSelected] = useState(findings[0]);
  const [modal, setModal] = useState({ open: false, type: 'approve' }); // {open, type, finding}

  const onApprove = (f) => {
    setModal({ open: true, type: 'approve', finding: f });
  };
  const onRemediate = (f) => {
    setModal({ open: true, type: 'remediate', finding: f });
  };

  const onModalConfirm = ({ finding, type }) => {
    // Simulate minor state update after confirmation (e.g., status move)
    if (!finding) return;
    if (type === 'approve') {
      finding.status = 'approved';
    } else {
      finding.status = 'resolved';
    }
    // Force a small refresh by resetting selection (mock)
    setSelected({ ...finding });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="h2" style={{ marginTop: 0 }}>Security</h1>
          <p className="text-muted">Security posture, findings, and DevSecOps workflows. Bold Ocean theme.</p>
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Policies</button>
          <button className="btn">Scan Now</button>
        </div>
      </div>

      <section style={styles.wrap}>
        <div style={styles.colList}>
          <FindingsTable findings={findings} selectedId={selected?.id} onSelect={setSelected} />
        </div>
        <div style={styles.colDetails}>
          <FindingDetails
            finding={selected}
            onApprove={onApprove}
            onRemediate={onRemediate}
          />
        </div>
      </section>

      <WorkflowModal
        open={modal.open}
        type={modal.type}
        finding={modal.finding}
        onClose={() => setModal({ open: false, type: 'approve', finding: null })}
        onConfirm={onModalConfirm}
      />
    </div>
  );
}

function seedFindings() {
  const now = Date.now();
  return [
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
}

const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 2fr',
    gap: 'var(--space-6)',
  },
  colList: { minWidth: 0 },
  colDetails: { minWidth: 0 },
};
