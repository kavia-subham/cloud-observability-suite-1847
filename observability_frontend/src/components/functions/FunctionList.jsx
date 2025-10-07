import React from 'react';

/**
 * PUBLIC_INTERFACE
 * FunctionList
 * Renders a list/table of serverless functions with client-side search, sort, and pagination.
 * Shows key indicators: error rate, latency p95, cold starts, and invocations trend badge.
 */
export default function FunctionList({
  items,
  loading,
  error,
  search,
  onSearch,
  sortBy,
  sortDir,
  onChangeSort,
  page,
  pageSize,
  totalPages,
  fullCount,
  onPageChange,
  onSelect,
}) {
  const headers = [
    { key: 'name', label: 'Function', width: '28%' },
    { key: 'provider', label: 'Cloud', width: '10%' },
    { key: 'region', label: 'Region', width: '10%' },
    { key: 'runtime', label: 'Runtime', width: '10%' },
    { key: 'p95LatencyMs', label: 'p95 (ms)', width: '10%' },
    { key: 'errorRate', label: 'Error %', width: '10%' },
    { key: 'coldStarts', label: 'Cold Starts', width: '12%' },
    { key: 'invocations', label: 'Invocations', width: '10%' },
  ];

  const renderSortIcon = (key) => {
    if (sortBy !== key) return <span aria-hidden="true" className="text-gray-500">↕</span>;
    return sortDir === 'asc' ? (
      <span aria-hidden="true" className="text-orange-400">↑</span>
    ) : (
      <span aria-hidden="true" className="text-orange-400">↓</span>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
        <div className="relative w-full sm:w-80">
          <input
            aria-label="Search functions"
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, cloud, region, runtime..."
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="absolute right-3 top-2.5 text-gray-400" aria-hidden="true">⌕</div>
        </div>
        <div className="text-sm text-gray-300">
          Showing {items?.length || 0} of {fullCount || 0}
        </div>
      </div>

      <div role="table" aria-label="Functions table" className="w-full overflow-x-auto">
        <div role="rowgroup" className="min-w-[880px]">
          <div role="row" className="grid grid-cols-8 gap-3 px-2 py-2 text-sm text-gray-300">
            {headers.map((h) => (
              <button
                key={h.key}
                role="columnheader"
                aria-sort={sortBy === h.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                onClick={() => onChangeSort(h.key)}
                className="text-left hover:text-white focus:outline-none"
                style={{ width: h.width }}
                title={`Sort by ${h.label}`}
              >
                <span className="inline-flex items-center gap-1">
                  {h.label} {renderSortIcon(h.key)}
                </span>
              </button>
            ))}
          </div>

          <div role="rowgroup" className="divide-y divide-gray-700">
            {loading && (
              <div role="row" className="px-2 py-6 text-gray-400">Loading functions…</div>
            )}
            {error && !loading && (
              <div role="row" className="px-2 py-6 text-red-400">{error}</div>
            )}
            {!loading && !error && items && items.length === 0 && (
              <div role="row" className="px-2 py-6 text-gray-400">No functions match your criteria.</div>
            )}
            {!loading && !error && items && items.map((f) => (
              <button
                key={`${f.provider}-${f.region}-${f.name}`}
                role="row"
                onClick={() => onSelect && onSelect(f)}
                className="grid grid-cols-8 gap-3 px-2 py-3 hover:bg-gray-700/40 focus:bg-gray-700/60 rounded-lg w-full text-left"
              >
                <div className="truncate" style={{ width: headers[0].width }}>
                  <div className="font-semibold text-white">{f.name}</div>
                  <div className="text-xs text-gray-400">
                    {f.service || 'Function'} • {f.memoryMb ? `${f.memoryMb}MB` : '—'}
                  </div>
                </div>
                <div className="text-gray-200" style={{ width: headers[1].width }}>{f.provider}</div>
                <div className="text-gray-200" style={{ width: headers[2].width }}>{f.region}</div>
                <div className="text-gray-200" style={{ width: headers[3].width }}>{f.runtime}</div>
                <div className="text-gray-200" style={{ width: headers[4].width }}>{f.p95LatencyMs ?? '—'}</div>
                <div className="text-gray-200" style={{ width: headers[5].width }}>
                  <span className={`px-2 py-0.5 rounded-lg text-xs ${
                    (f.errorRate ?? 0) > 2 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {(f.errorRate ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="text-gray-200" style={{ width: headers[6].width }}>
                  <span className={`px-2 py-0.5 rounded-lg text-xs ${
                    (f.coldStarts ?? 0) > 0 ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-600/40 text-gray-200'
                  }`}>
                    {f.coldStarts ?? 0}
                  </span>
                </div>
                <div className="text-gray-200" style={{ width: headers[7].width }}>
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-blue-500/20 text-blue-300">
                    {f.invocations ?? 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages} • {pageSize} per page
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-700/50 focus:ring-2 focus:ring-orange-500"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-700/50 focus:ring-2 focus:ring-orange-500"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
