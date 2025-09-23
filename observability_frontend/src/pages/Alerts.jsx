import React, { useMemo, useState } from 'react';
import { AnomalyList, AnomalyDetails } from '../components';

// PUBLIC_INTERFACE
export default function Alerts() {
  // Mock dataset at page level to pass into list and details
  const anomalies = useMemo(() => ([
    { id: 'A-1042', severity: 'high', service: 'payment-authorize', metric: 'Latency p95 +48%', time: 'now', region: 'us-central1', ack: false },
    { id: 'A-1041', severity: 'critical', service: 'auth-validate', metric: 'Error rate 1.8%', time: '2m ago', region: 'us-east-1', ack: true },
    { id: 'A-1040', severity: 'medium', service: 'orders-write', metric: 'Throughput -22%', time: '6m ago', region: 'westeurope', ack: false },
    { id: 'A-1039', severity: 'low', service: 'events-queue', metric: 'Backlog +12%', time: '9m ago', region: 'us-central1', ack: false },
  ]), []);

  const [selected, setSelected] = useState(anomalies[0]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="h2" style={{ marginTop: 0 }}>Alerts & Anomalies</h1>
          <p className="text-muted">Detect, triage, and explain anomalies with AI. High-contrast Ocean theme visuals.</p>
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Policies</button>
          <button className="btn">New Alert</button>
        </div>
      </div>

      <section style={styles.wrap}>
        <div style={styles.colList}>
          <AnomalyList anomalies={anomalies} selectedId={selected?.id} onSelect={setSelected} />
        </div>
        <div style={styles.colDetails}>
          <AnomalyDetails anomaly={selected} />
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 2fr',
    gap: 'var(--space-6)',
  },
  colList: {
    minWidth: 0,
  },
  colDetails: {
    minWidth: 0,
  },
};
