import React, { useMemo, useState } from 'react';
import { FunctionList, FunctionDetails, InvocationsTable } from '../components';

// PUBLIC_INTERFACE
export default function Functions() {
  // Mock data source for the entire page (ready for future API hook)
  const functions = useMemo(() => seedFunctions(), []);
  const [selected, setSelected] = useState(functions[0]);
  const [invocations, setInvocations] = useState(seedInvocations());

  const handleSelect = (fn) => {
    setSelected(fn);
    // On select, refresh invocations with a new set (mock)
    setInvocations(seedInvocations());
  };

  const handleInvoke = (fn) => {
    // Placeholder for future API call to trigger test invocation; update mock table
    const newRow = {
      id: `req_${Math.random().toString(16).slice(2, 8)}`,
      time: 'now',
      status: Math.random() < 0.85 ? 'ok' : 'error',
      duration: 100 + Math.floor(Math.random() * 3000),
      cold: Math.random() < 0.2,
      memory: 100 + Math.floor(Math.random() * 50),
    };
    setInvocations((prev) => [newRow, ...prev].slice(0, 12));
    // eslint-disable-next-line no-console
    console.log('Test invoke (mock):', fn.name);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="h2" style={{ marginTop: 0 }}>Functions</h1>
          <p className="text-muted">Browse and inspect serverless functions across providers. Bold Ocean Professional visuals.</p>
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Import</button>
          <button className="btn">Discover</button>
        </div>
      </div>

      <section style={layout.wrap}>
        <div style={layout.colList}>
          <FunctionList items={functions} selectedId={selected?.id} onSelect={handleSelect} />
        </div>
        <div style={layout.colDetails}>
          <FunctionDetails fn={selected} onInvoke={handleInvoke} />
          <InvocationsTable rows={invocations} style={{ marginTop: 'var(--space-5)' }} />
        </div>
      </section>

      <p className="text-muted" style={{ marginTop: 'var(--space-4)' }}>
        Note: This page uses mock data. Placeholders are ready for REST API and WebSocket integration for logs and live invocations.
      </p>
    </div>
  );
}

function seedFunctions() {
  const now = Date.now();
  return [
    { id: 'fn-1', name: 'auth-validate', provider: 'AWS', region: 'us-east-1', runtime: 'nodejs18.x', memory: 256, p95: 142, errorRate: 0.32, invocations: 512340, updatedAt: now - 1000 * 60 * 2, updatedAtLabel: '2m ago' },
    { id: 'fn-2', name: 'payment-authorize', provider: 'GCP', region: 'us-central1', runtime: 'python3.11', memory: 512, p95: 188, errorRate: 1.24, invocations: 2210340, updatedAt: now - 1000 * 60 * 6, updatedAtLabel: '6m ago' },
    { id: 'fn-3', name: 'orders-write', provider: 'Azure', region: 'westeurope', runtime: 'nodejs18.x', memory: 1024, p95: 210, errorRate: 0.82, invocations: 703212, updatedAt: now - 1000 * 60 * 9, updatedAtLabel: '9m ago' },
    { id: 'fn-4', name: 'events-queue-handler', provider: 'GCP', region: 'us-central1', runtime: 'go1.22', memory: 256, p95: 112, errorRate: 0.18, invocations: 143220, updatedAt: now - 1000 * 60 * 12, updatedAtLabel: '12m ago' },
    { id: 'fn-5', name: 'webhook-dispatch', provider: 'AWS', region: 'eu-west-1', runtime: 'python3.10', memory: 128, p95: 240, errorRate: 1.92, invocations: 112031, updatedAt: now - 1000 * 60 * 15, updatedAtLabel: '15m ago' },
  ];
}

function seedInvocations() {
  const mk = (i) => ({
    id: `req_${(Math.random().toString(16).slice(2, 8))}`,
    time: `12:03:${10 + i}`,
    status: i % 7 === 0 ? 'error' : (i % 5 === 0 ? 'throttled' : 'ok'),
    duration: 100 + Math.floor(Math.random() * 2600),
    cold: i % 6 === 0,
    memory: 100 + Math.floor(Math.random() * 40),
  });
  return Array.from({ length: 10 }, (_, i) => mk(i));
}

const layout = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 2fr',
    gap: 'var(--space-6)',
  },
  colList: { minWidth: 0 },
  colDetails: { minWidth: 0 },
};
