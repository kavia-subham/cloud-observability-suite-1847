import React from "react";

/**
 * PUBLIC_INTERFACE
 * WhatIfPanel: Interactive controls to simulate concurrency and memory changes,
 * showing projected savings.
 * Props:
 * - concurrencyFactor: number
 * - setConcurrencyFactor: (n:number)=>void
 * - memoryDelta: number (MB)
 * - setMemoryDelta: (n:number)=>void
 * - projected: { projected:number, baseline:number, savings:number, savingsPct:number }
 */
export default function WhatIfPanel({
  concurrencyFactor,
  setConcurrencyFactor,
  memoryDelta,
  setMemoryDelta,
  projected,
}) {
  const currency = (n) =>
    n?.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <aside className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <header className="mb-3">
        <h2 className="text-white text-lg font-bold">What-if Analysis</h2>
        <p className="text-gray-400 text-sm">
          Adjust parameters to estimate monthly cost impact.
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <label htmlFor="concurrency" className="block text-gray-300 text-sm mb-1">
            Concurrency multiplier: {concurrencyFactor.toFixed(2)}x
          </label>
          <input
            id="concurrency"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            aria-valuemin={0.1}
            aria-valuemax={3}
            aria-valuenow={concurrencyFactor}
            onChange={(e) => setConcurrencyFactor(parseFloat(e.target.value))}
            value={concurrencyFactor}
            className="w-full accent-orange-500"
          />
          <p id="concurrency-help" className="text-gray-400 text-xs mt-1">
            Higher concurrency can reduce effective execution time and cost.
          </p>
        </div>

        <div>
          <label htmlFor="memory" className="block text-gray-300 text-sm mb-1">
            Memory change: {memoryDelta} MB
          </label>
          <input
            id="memory"
            type="range"
            min="-256"
            max="512"
            step="64"
            aria-valuemin={-256}
            aria-valuemax={512}
            aria-valuenow={memoryDelta}
            onChange={(e) => setMemoryDelta(parseInt(e.target.value, 10))}
            value={memoryDelta}
            className="w-full accent-emerald-500"
          />
          <p id="memory-help" className="text-gray-400 text-xs mt-1">
            Memory increase may speed up execution but could increase cost slightly.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-gray-400 text-xs">Baseline</div>
              <div className="text-white font-bold">{currency(projected.baseline || 0)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Projected</div>
              <div className="text-white font-bold">{currency(projected.projected || 0)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Savings</div>
              <div className="text-emerald-400 font-bold">{currency(projected.savings || 0)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Savings %</div>
              <div className="text-emerald-400 font-bold">
                {Math.round(projected.savingsPct || 0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
