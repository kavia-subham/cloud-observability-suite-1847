import React, { useEffect, useMemo, useState } from 'react';
import FindingsTable from '../components/security/FindingsTable';
import FindingDetails from '../components/security/FindingDetails';
import WorkflowModal from '../components/security/WorkflowModal';
import apiClient, { SecurityAPI } from '../services/apiClient';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Security
 * Renders security posture and findings with Ocean Professional styling.
 * Loads findings via apiClient/SecurityAPI with mock support. Provides:
 * - severity filters (inside table)
 * - selectable rows
 * - remediation/approval workflow modal that updates local state (status, assignee, notes)
 * Handles loading/empty/error states.
 */
export default function Security() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [findings, setFindings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'approve', finding: null });
  const [workflowState, setWorkflowState] = useState({}); // { [id]: { status, assignee, notes } }

  // Load findings from API (mock-aware via handlers or local json)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Prefer domain helper; fallback to simple GET if needed
        const data = await SecurityAPI.findings().catch(async () => {
          const res = await apiClient.get('/security/findings');
          return res?.data || res || [];
        });
        if (!mounted) return;
        const arr = normalizeFindings(data);
        setFindings(arr);
        setSelected(arr[0] || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load security findings.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Modal actions
  const onApprove = (f) => setModal({ open: true, type: 'approve', finding: f });
  const onRemediate = (f) => setModal({ open: true, type: 'remediate', finding: f });

  const onModalConfirm = ({ finding, type }) => {
    if (!finding) return;
    const newStatus = type === 'approve' ? 'approved' : 'resolved';

    // Update local list
    setFindings((prev) =>
      prev.map((it) => (it.id === finding.id ? { ...it, status: newStatus } : it))
    );
    // Update selected if visible
    setSelected((prev) => (prev && prev.id === finding.id ? { ...prev, status: newStatus } : prev));
    // Update workflow state map
    setWorkflowState((prev) => ({
      ...prev,
      [finding.id]: {
        ...(prev[finding.id] || {}),
        status: newStatus,
        notes: `${(prev[finding.id]?.notes || '').trim()} ${type} completed`.trim(),
      },
    }));
  };

  // Header content
  const header = (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
      <div>
        <h1 className="h2" style={{ marginTop: 0 }}>Security</h1>
        <p className="text-muted">Security posture, findings, and DevSecOps workflows.</p>
      </div>
      <div>
        <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Policies</button>
        <button className="btn">Scan Now</button>
      </div>
    </div>
  );

  // Loading / Error / Empty states
  if (loading) {
    return (
      <div>
        {header}
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          <div className="text-muted">Loading security findings...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        {header}
        <div className="surface" role="alert" style={{ padding: 'var(--space-6)', borderColor: 'rgba(239,68,68,0.45)' }}>
          <div style={{ color: '#FCA5A5', fontWeight: 600 }}>Could not load findings</div>
          <div className="text-muted" style={{ marginTop: 6 }}>{error}</div>
        </div>
      </div>
    );
  }
  if (!findings || findings.length === 0) {
    return (
      <div>
        {header}
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          <div className="text-muted">No findings available. All clear!</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}

      <section style={styles.wrap}>
        <div style={styles.colList}>
          <FindingsTable
            findings={findings}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </div>
        <div style={styles.colDetails}>
          <FindingDetails
            finding={selected}
            onApprove={onApprove}
            onRemediate={onRemediate}
          />
          {/* Workflow state panel (simple local state viewer) */}
          {selected && (
            <div className="surface" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div className="h3" style={{ margin: 0, marginBottom: 8 }}>Workflow State</div>
              <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Status: {workflowState[selected.id]?.status || selected.status || 'new'}
              </div>
              {workflowState[selected.id]?.assignee && (
                <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                  Assignee: {workflowState[selected.id]?.assignee}
                </div>
              )}
              {workflowState[selected.id]?.notes && (
                <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                  Notes: {workflowState[selected.id]?.notes}
                </div>
              )}
            </div>
          )}
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

function normalizeFindings(data) {
  // Accept either {findings: []} or [] shapes from mocks
  const list = Array.isArray(data) ? data : data?.findings || [];
  const now = Date.now();
  return list.map((f, idx) => {
    const lastSeenAt = f.lastSeenAt || now - (idx + 1) * 60 * 1000;
    return {
      id: f.id || `SEC-${1000 + idx}`,
      title: f.title || 'Security finding',
      severity: f.severity || 'medium',
      owner: f.owner || f.service || 'platform-security',
      status: f.status || 'new',
      lastSeenAt,
      lastSeenLabel: timeAgo(lastSeenAt),
      service: f.service || 'lambda',
      resource: f.resource || f.id || 'resource',
    };
  });
}

function timeAgo(ts) {
  const d = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (d < 1) return 'just now';
  if (d === 1) return '1m ago';
  if (d < 60) return `${d}m ago`;
  const h = Math.floor(d / 60);
  return `${h}h ago`;
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
