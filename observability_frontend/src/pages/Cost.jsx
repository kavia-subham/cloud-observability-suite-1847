import React, { useEffect, useMemo, useState } from "react";
import "../styles/theme.css";
import "../styles/tokens.css";
import { getCosts, getCostRecommendations } from "../services/apiClient";
import CostBreakdown from "../components/cost/CostBreakdown";
import OptimizationList from "../components/cost/OptimizationList";
import WhatIfPanel from "../components/cost/WhatIfPanel";

/**
 * PUBLIC_INTERFACE
 * Cost page: Provides cloud function cost breakdown with filters by provider/service,
 * optimization recommendations, and an interactive "what-if" panel to project savings.
 * Data is fetched via apiClient with mock support (MSW). Includes loading, error,
 * and empty states with Ocean Professional styling and accessible controls.
 */
export default function Cost() {
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recError, setRecError] = useState(null);
  const [data, setData] = useState([]);
  const [recs, setRecs] = useState([]);

  // filters
  const [provider, setProvider] = useState("All");
  const [service, setService] = useState("All");
  const [search, setSearch] = useState("");

  // what-if inputs
  const [concurrencyFactor, setConcurrencyFactor] = useState(1); // 1x baseline
  const [memoryDelta, setMemoryDelta] = useState(0); // MB change from baseline

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getCosts()
      .then((res) => {
        if (!mounted) return;
        setData(res || []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load cost data");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    setRecLoading(true);
    setRecError(null);
    getCostRecommendations()
      .then((res) => {
        if (!mounted) return;
        setRecs(res || []);
      })
      .catch((e) => {
        if (!mounted) return;
        setRecError(e?.message || "Failed to load recommendations");
      })
      .finally(() => {
        if (!mounted) return;
        setRecLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // derive filter options
  const providers = useMemo(() => {
    const set = new Set(data.map((d) => d.provider));
    return ["All", ...Array.from(set)];
  }, [data]);

  const services = useMemo(() => {
    const set = new Set(data.map((d) => d.service));
    return ["All", ...Array.from(set)];
  }, [data]);

  const filteredData = useMemo(() => {
    return (data || []).filter((d) => {
      const byProvider = provider === "All" || d.provider === provider;
      const byService = service === "All" || d.service === service;
      const bySearch =
        !search ||
        d.functionName?.toLowerCase().includes(search.toLowerCase()) ||
        d.region?.toLowerCase().includes(search.toLowerCase());
      return byProvider && byService && bySearch;
    });
  }, [data, provider, service, search]);

  // aggregate totals for panels
  const totals = useMemo(() => {
    const totalMonthly = filteredData.reduce((acc, d) => acc + (d.monthlyCost || 0), 0);
    const totalInvocations = filteredData.reduce((acc, d) => acc + (d.invocations || 0), 0);
    const avgDurationMs =
      filteredData.length > 0
        ? filteredData.reduce((acc, d) => acc + (d.avgDurationMs || 0), 0) / filteredData.length
        : 0;
    return { totalMonthly, totalInvocations, avgDurationMs };
  }, [filteredData]);

  // what-if calc: a simple projection model
  // - ConcurrencyFactor: assume efficiency improves linearly: effectiveDuration = duration / concurrencyFactor
  // - MemoryDelta: cost scales with memory size increments 128MB steps; here: 1% cost per +64MB change
  // Base function item model: projectedCost = monthlyCost * durationFactor * memoryFactor
  const projectedSavings = useMemo(() => {
    if (filteredData.length === 0) return { projected: 0, baseline: 0, savings: 0, savingsPct: 0 };

    const durationFactor = 1 / Math.max(0.1, concurrencyFactor);
    const memoryFactor = 1 + (memoryDelta / 64) * 0.01; // +1% per +64MB

    const baseline = filteredData.reduce((acc, d) => acc + (d.monthlyCost || 0), 0);
    const projected = filteredData.reduce((acc, d) => {
      const base = d.monthlyCost || 0;
      return acc + base * durationFactor * memoryFactor;
    }, 0);

    const savings = Math.max(0, baseline - projected);
    const savingsPct = baseline > 0 ? (savings / baseline) * 100 : 0;

    return { projected, baseline, savings, savingsPct };
  }, [filteredData, concurrencyFactor, memoryDelta]);

  const pageHeader = (
    <header className="bg-gray-900/60 border-b border-gray-800 sticky top-0 z-10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-white text-2xl font-bold">Cost Optimization</h1>
        <p className="text-gray-400 text-sm">
          Analyze function costs across providers, apply filters, and explore what-if savings scenarios.
        </p>
      </div>
    </header>
  );

  const filtersBar = (
    <section
      aria-label="Cost filters"
      className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-3"
    >
      <div className="col-span-1">
        <label htmlFor="provider" className="block text-gray-300 text-sm mb-1">
          Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-describedby="provider-help"
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span id="provider-help" className="sr-only">
          Filter by cloud provider
        </span>
      </div>

      <div className="col-span-1">
        <label htmlFor="service" className="block text-gray-300 text-sm mb-1">
          Service
        </label>
        <select
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-describedby="service-help"
        >
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span id="service-help" className="sr-only">
          Filter by service
        </span>
      </div>

      <div className="col-span-2">
        <label htmlFor="search" className="block text-gray-300 text-sm mb-1">
          Search
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by function or region"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </section>
  );

  const content = (
    <main className="max-w-7xl mx-auto px-4 pb-8">
      {/* Summary and What-if */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CostBreakdown
            loading={loading}
            error={error}
            items={filteredData}
            totals={totals}
          />
        </div>
        <div className="lg:col-span-1">
          <WhatIfPanel
            concurrencyFactor={concurrencyFactor}
            setConcurrencyFactor={setConcurrencyFactor}
            memoryDelta={memoryDelta}
            setMemoryDelta={setMemoryDelta}
            projected={projectedSavings}
          />
        </div>
      </div>

      {/* Recommendations */}
      <section className="mt-6">
        <OptimizationList
          loading={recLoading}
          error={recError}
          recommendations={recs}
          onApply={(rec) => {
            // naive interaction: adjust what-if inputs based on a recommendation hint
            if (rec?.type === "memory") {
              setMemoryDelta((prev) => prev + (rec?.suggestedDeltaMb || 0));
            } else if (rec?.type === "concurrency") {
              setConcurrencyFactor((prev) =>
                Math.max(0.1, prev * (rec?.suggestedMultiplier || 1))
              );
            }
          }}
        />
      </section>
    </main>
  );

  return (
    <div className="min-h-screen bg-black">
      {pageHeader}
      {filtersBar}
      {content}
    </div>
  );
}
