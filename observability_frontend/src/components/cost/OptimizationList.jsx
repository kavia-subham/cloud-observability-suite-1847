import React from "react";

/**
 * PUBLIC_INTERFACE
 * OptimizationList: Displays actionable recommendations for cost savings.
 * Props:
 * - loading: boolean
 * - error: string | null
 * - recommendations: array of {
 *    id, title, description, impactUsd, impactPct, type: "memory"|"concurrency",
 *    suggestedDeltaMb?, suggestedMultiplier?
 *   }
 * - onApply: function(rec) -> void
 */
export default function OptimizationList({ loading, error, recommendations, onApply }) {
  if (loading) {
    return (
      <section aria-busy="true" className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="animate-pulse text-gray-400">Loading recommendations…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" className="bg-gray-900 border border-red-900 rounded-xl p-4">
        <p className="text-red-400 font-semibold">Error loading recommendations</p>
        <p className="text-gray-300">{error}</p>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-300">No optimization recommendations at the moment.</p>
      </section>
    );
  }

  const currency = (n) =>
    n?.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl">
      <header className="p-4 border-b border-gray-800">
        <h2 className="text-white text-lg font-bold">Optimization Recommendations</h2>
        <p className="text-gray-400 text-sm">Apply targeted actions to reduce cost.</p>
      </header>

      <ul className="divide-y divide-gray-800" role="list" aria-label="Recommendations list">
        {recommendations.map((rec) => (
          <li key={rec.id} className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    rec.type === "memory" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                  }`}
                  aria-hidden="true"
                  title={rec.type === "memory" ? "Memory tuning" : "Concurrency tuning"}
                >
                  {rec.type === "memory" ? "M" : "C"}
                </span>
                <h3 className="text-white font-semibold">{rec.title}</h3>
              </div>
              <p className="text-gray-300 text-sm mt-1">{rec.description}</p>
            </div>
            <div className="md:col-span-2 flex md:flex-col justify-between md:justify-center items-start gap-2">
              <div>
                <div className="text-gray-400 text-xs">Potential savings</div>
                <div className="text-orange-400 font-bold">{currency(rec.impactUsd || 0)}</div>
                <div className="text-gray-400 text-xs">{Math.round(rec.impactPct || 0)}%</div>
              </div>
              <div>
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-black text-white border border-orange-600 hover:from-orange-500/30 hover:border-orange-400 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-black"
                  onClick={() => onApply && onApply(rec)}
                  aria-label={`Apply recommendation: ${rec.title}`}
                >
                  Apply
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
