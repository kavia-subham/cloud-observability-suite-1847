import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

/**
 * PUBLIC_INTERFACE
 * InvocationsTable
 * Shows recent invocations for the selected function with basic metadata.
 */
export default function InvocationsTable({ selectedFunction }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!selectedFunction) {
      setRows([]);
      setErr(null);
      setLoading(false);
      return () => {};
    }
    setLoading(true);
    setErr(null);

    apiClient
      .getFunctionInvocations(selectedFunction)
      .then((data) => {
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((e) => {
        console.error('Failed to load invocations', e);
        if (!mounted) return;
        setErr('Failed to load invocations');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [selectedFunction]);

  return (
    <div role="table" aria-label="Invocations table" className="w-full overflow-x-auto">
      {!selectedFunction && (
        <div className="text-gray-400 py-6">Select a function to see its recent invocations.</div>
      )}
      {selectedFunction && (
        <>
          <div className="text-sm text-gray-300 mb-2">
            Showing last {rows.length} invocations for <span className="text-white font-semibold">{selectedFunction.name}</span>
          </div>
          <div role="rowgroup" className="min-w-[760px]">
            <div role="row" className="grid grid-cols-6 gap-3 px-2 py-2 text-sm text-gray-300">
              <div role="columnheader">Time</div>
              <div role="columnheader">Duration (ms)</div>
              <div role="columnheader">Memory (MB)</div>
              <div role="columnheader">Cold Start</div>
              <div role="columnheader">Status</div>
              <div role="columnheader">Request ID</div>
            </div>
            <div role="rowgroup" className="divide-y divide-gray-700">
              {loading && <div className="px-2 py-6 text-gray-400">Loading…</div>}
              {err && !loading && <div className="px-2 py-6 text-red-400">{err}</div>}
              {!loading && !err && rows.length === 0 && (
                <div className="px-2 py-6 text-gray-400">No recent invocations.</div>
              )}
              {!loading && !err && rows.map((r) => (
                <div role="row" key={r.requestId} className="grid grid-cols-6 gap-3 px-2 py-2">
                  <div className="text-gray-200">{r.time}</div>
                  <div className="text-gray-200">{r.durationMs}</div>
                  <div className="text-gray-200">{r.memoryMb}</div>
                  <div className="text-gray-200">
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${
                      r.coldStart ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-600/40 text-gray-200'
                    }`}>
                      {r.coldStart ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="text-gray-200">
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${
                      r.status === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-gray-200 truncate" title={r.requestId}>{r.requestId}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
