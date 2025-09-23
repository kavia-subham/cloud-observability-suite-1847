import React from 'react';

// PUBLIC_INTERFACE
export default function Topology() {
  return (
    <div className="surface" style={{ padding: 'var(--space-6)' }}>
      <h1 className="h2" style={{ marginTop: 0 }}>Topology</h1>
      <p className="text-muted">Interactive service map and real-time dependencies across serverless functions.</p>
      <div style={{ height: 360, border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-4)' }}>
        <p className="text-muted" style={{ padding: 'var(--space-4)' }}>Graph canvas placeholder.</p>
      </div>
    </div>
  );
}
