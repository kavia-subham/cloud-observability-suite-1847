import React, { useMemo, useState } from 'react';
import { ServiceGraph } from '../components';
import { NodeDetailsPanel } from '../components';

// PUBLIC_INTERFACE
export default function Topology() {
  const [selectedNode, setSelectedNode] = useState(null);

  // Prepare mock dataset that can be fed to ServiceGraph (overridable by future props)
  const { nodes, edges } = useMemo(() => {
    const nodes = [
      { id: 'api-gateway', label: 'API Gateway', type: 'api', provider: 'AWS', center: true, latency: 0.35, errors: 0.05, region: 'us-east-1' },
      { id: 'auth-validate', label: 'auth-validate', type: 'function', provider: 'AWS', latency: 0.25, errors: 0.02, region: 'us-east-1' },
      { id: 'payment-authorize', label: 'payment-authorize', type: 'function', provider: 'GCP', latency: 0.62, errors: 0.08, region: 'us-central1' },
      { id: 'orders-write', label: 'orders-write', type: 'function', provider: 'Azure', latency: 0.55, errors: 0.12, region: 'westeurope' },
      { id: 'orders-db', label: 'orders-db', type: 'db', provider: 'AWS', latency: 0.48, errors: 0.04, region: 'us-east-1' },
      { id: 'events-queue', label: 'events-queue', type: 'queue', provider: 'GCP', latency: 0.18, errors: 0.02, region: 'us-central1' },
    ];
    const edges = [
      { from: 'api-gateway', to: 'auth-validate', latency: 0.28, errors: 0.03, calls: 1200 },
      { from: 'api-gateway', to: 'payment-authorize', latency: 0.54, errors: 0.10, calls: 840 },
      { from: 'payment-authorize', to: 'orders-write', latency: 0.7, errors: 0.12, calls: 420 },
      { from: 'orders-write', to: 'orders-db', latency: 0.45, errors: 0.05, calls: 680 },
      { from: 'orders-write', to: 'events-queue', latency: 0.2, errors: 0.03, calls: 300 },
    ];
    return { nodes, edges };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="h2" style={{ marginTop: 0 }}>Topology</h1>
          <p className="text-muted">Interactive service map and real-time dependencies across serverless functions.</p>
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Auto-layout</button>
          <button className="btn">AI Analyze</button>
        </div>
      </div>

      <div style={styles.wrap}>
        <div style={styles.graphCol}>
          <ServiceGraph nodes={nodes} edges={edges} onNodeSelect={setSelectedNode} />
        </div>
        <div style={styles.detailsCol}>
          <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 'var(--space-6)',
  },
  graphCol: {
    minWidth: 0,
  },
  detailsCol: {
    minWidth: 300,
  },
};
