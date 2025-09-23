import React, { useMemo, useState } from 'react';
import { CostBreakdown, OptimizationList, WhatIfPanel } from '../components';

// PUBLIC_INTERFACE
export default function Cost() {
  // Seed a lightweight mock for the page header/summary if needed later
  const [lastSim, setLastSim] = useState(null);

  const handleApply = (rec) => {
    // Placeholder for integration with backend workflow
    // eslint-disable-next-line no-console
    console.log('Apply optimization (mock):', rec.id);
  };

  const handleIgnore = (rec) => {
    // eslint-disable-next-line no-console
    console.log('Ignore optimization (mock):', rec.id);
  };

  const handleSimulate = (payload) => {
    setLastSim(payload);
    // eslint-disable-next-line no-console
    console.log('What-if simulate (mock):', payload);
  };

  const headerNote = useMemo(() => {
    if (!lastSim) return 'Use What-if Analysis to project configuration impacts and cost deltas.';
    return `Last simulation: est $${Number(lastSim.result.estimatedMonthly).toFixed(0)} /mo (${lastSim.result.deltaSign}${Math.abs(lastSim.result.delta).toFixed(0)})`;
  }, [lastSim]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="h2" style={{ marginTop: 0 }}>Cost Management</h1>
          <p className="text-muted">{headerNote}</p>
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: 'var(--space-2)' }}>Export</button>
          <button className="btn">Create Budget</button>
        </div>
      </div>

      {/* Row 1: Cost breakdown and What-if side by side */}
      <section style={layout.row}>
        <div style={layout.colMain}>
          <CostBreakdown />
        </div>
        <div style={layout.colSide}>
          <WhatIfPanel onSimulate={handleSimulate} />
        </div>
      </section>

      {/* Row 2: Recommendations */}
      <section style={{ marginTop: 'var(--space-6)' }}>
        <OptimizationList onApply={handleApply} onIgnore={handleIgnore} />
      </section>

      <p className="text-muted" style={{ marginTop: 'var(--space-4)' }}>
        Note: All data here is mock/placeholder. Components are modular and ready to be wired to REST APIs.
      </p>
    </div>
  );
}

const layout = {
  row: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: 'var(--space-6)',
  },
  colMain: { minWidth: 0 },
  colSide: { minWidth: 300 },
};
