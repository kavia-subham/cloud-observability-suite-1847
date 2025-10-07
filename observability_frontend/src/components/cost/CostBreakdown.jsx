import React from "react";

/**
 * PUBLIC_INTERFACE
 * CostBreakdown: Displays aggregate totals and a table of function costs.
 * Props:
 * - loading: boolean
 * - error: string | null
 * - items: array of { functionName, provider, service, region, monthlyCost, invocations, avgDurationMs }
 * - totals: { totalMonthly, totalInvocations, avgDurationMs }
 */
export default function CostBreakdown({ loading, error, items, totals }) {
  if (loading) {
    return (
      <section
        aria-busy="true"
        aria-live="polite"
        className="bg-gray-900 border border-gray-800 rounded-xl p-4"
      >
        <div className="animate-pulse text-gray-400">Loading cost breakdown…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" className="bg-gray-900 border border-red-900 rounded-xl p-4">
        <p className="text-red-400 font-semibold">Error:</p>
        <p className="text-gray-300">{error}</p>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-300">No cost data found for the selected filters.</p>
      </section>
    );
  }

  const currency = (n) =>
    n?.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">Monthly Cost Overview</h2>
          <p className="text-gray-400 text-sm">
            Track costs across functions and providers.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <div className="text-gray-400 text-xs">Total Monthly</div>
            <div className="text-white font-bold">{currency(totals.totalMonthly)}</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <div className="text-gray-400 text-xs">Invocations</div>
            <div className="text-white font-bold">
              {totals.totalInvocations.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <div className="text-gray-400 text-xs">Avg Duration</div>
            <div className="text-white font-bold">{Math.round(totals.avgDurationMs)} ms</div>
          </div>
        </div>
      </header>

      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-800" role="table" aria-label="Function cost table">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Function
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Provider
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Service
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Region
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Monthly Cost
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Invocations
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Avg Duration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {items.map((row, idx) => (
              <tr key={`${row.functionName}-${idx}`} className="hover:bg-gray-800/60 focus-within:bg-gray-800/60">
                <td className="px-4 py-3 text-white">{row.functionName}</td>
                <td className="px-4 py-3 text-gray-300">{row.provider}</td>
                <td className="px-4 py-3 text-gray-300">{row.service}</td>
                <td className="px-4 py-3 text-gray-300">{row.region}</td>
                <td className="px-4 py-3 text-right text-orange-400 font-semibold">{currency(row.monthlyCost || 0)}</td>
                <td className="px-4 py-3 text-right text-gray-300">{(row.invocations || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-300">{Math.round(row.avgDurationMs || 0)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
