import React, { useEffect, useState } from 'react';

/**
 * WorkflowModal
 * Simple modal that simulates an approval or remediation workflow for a finding.
 * - type: 'approve' | 'remediate'
 * - onConfirm will be called after mock progression completes
 * - no external dependencies
 */
// PUBLIC_INTERFACE
export default function WorkflowModal({
  open = false,
  onClose = () => {},
  finding = null,
  type = 'approve',
  onConfirm = () => {},
}) {
  const [step, setStep] = useState('idle'); // idle | running | done
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (!open) return;
    setStep('idle');
    setLog([]);
  }, [open, finding, type]);

  const start = () => {
    setStep('running');
    setLog((l) => [...l, 'Starting workflow...']);
    setTimeout(() => setLog((l) => [...l, 'Validating policy rules...']), 500);
    setTimeout(() => setLog((l) => [...l, actionLine(type)]), 1100);
    setTimeout(() => {
      setLog((l) => [...l, 'Recording audit trail...']);
      setStep('done');
    }, 1700);
  };

  const confirm = () => {
    onConfirm({ finding, type });
    onClose();
  };

  if (!open) return null;

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true" aria-label="Workflow modal">
      <div className="surface" style={styles.modal}>
        <div style={styles.header}>
          <div className="h3" style={{ margin: 0 }}>
            {type === 'approve' ? 'Approve Finding' : 'Remediate Finding'}
          </div>
          <button className="btn btn-outline" onClick={onClose} aria-label="Close workflow modal">Close</button>
        </div>

        <div style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 'var(--space-3)' }}>
          {finding ? `${finding.id} • ${finding.title}` : 'No finding selected'}
        </div>

        <div className="surface" style={styles.bodyCard}>
          <div className="h3" style={{ margin: 0, marginBottom: 'var(--space-2)' }}>Workflow</div>
          <ol style={styles.list}>
            {log.map((line, i) => <li key={i}>{line}</li>)}
          </ol>

          {step === 'idle' && (
            <div className="text-muted">Ready to start. Click "Run" to simulate the workflow.</div>
          )}
          {step === 'running' && (
            <div className="text-muted">Running...</div>
          )}
          {step === 'done' && (
            <div className="text-muted">Completed. Press Confirm to finalize.</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {step === 'idle' && <button className="btn btn-outline" onClick={start}>Run</button>}
          {step === 'running' && <button className="btn btn-outline" disabled>Running...</button>}
          <button className="btn" onClick={confirm} disabled={step !== 'done'}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function actionLine(type) {
  if (type === 'approve') return 'Collecting approvals from reviewers...';
  return 'Applying remediation template (mock change plan)...';
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'var(--space-6)', zIndex: 100,
  },
  modal: {
    width: 'min(720px, 92vw)',
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--elevation-3)',
    display: 'grid', gap: 'var(--space-4)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  bodyCard: {
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(255,255,255,0.03)',
  },
  list: { margin: 0, paddingLeft: '1.2em', color: 'var(--color-text)' },
};
