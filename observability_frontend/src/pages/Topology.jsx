import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getTopology } from '../services/apiClient';
import { subscribe, unsubscribe } from '../services/wsClient';
import ServiceGraph from '../components/topology/ServiceGraph';
import NodeDetailsPanel from '../components/topology/NodeDetailsPanel';

/**
 * PUBLIC_INTERFACE
 * Topology
 * This page renders an interactive service topology view with a graph and a side
 * panel. It loads initial topology from the apiClient (mocks supported) and
 * subscribes to websocket "topology_updates" to refresh automatically.
 *
 * UI/UX:
 * - Ocean Professional styling with bold accents.
 * - Accessible interactions, keyboard support via graph component, ARIA landmarks.
 * - Loading/empty/error states.
 */
export default function Topology() {
  const [topology, setTopology] = useState({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdatedTs, setLastUpdatedTs] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTopology();
      // Normalize with defaults
      const nodes = Array.isArray(data?.nodes) ? data.nodes : [];
      const edges = Array.isArray(data?.edges) ? data.edges : [];
      setTopology({ nodes, edges });
      setLastUpdatedTs(Date.now());
      // Keep selection if still present, otherwise clear
      if (selectedNodeId && !nodes.find(n => n.id === selectedNodeId)) {
        setSelectedNodeId(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load topology');
    } finally {
      setLoading(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Subscribe to websocket topology updates
    const channel = 'topology_updates';
    const handler = (payload) => {
      // payload could be either full topology or a delta; for simplicity, assume full snapshot
      const nodes = Array.isArray(payload?.nodes) ? payload.nodes : [];
      const edges = Array.isArray(payload?.edges) ? payload.edges : [];
      setTopology({ nodes, edges });
      setLastUpdatedTs(Date.now());
      if (selectedNodeId && !nodes.find(n => n.id === selectedNodeId)) {
        setSelectedNodeId(null);
      }
    };

    subscribe(channel, handler);
    return () => {
      unsubscribe(channel, handler);
    };
  }, [selectedNodeId]);

  const selectedNode = useMemo(
    () => topology.nodes.find((n) => n.id === selectedNodeId) || null,
    [topology.nodes, selectedNodeId]
  );

  const content = (() => {
    if (loading) {
      return (
        <div role="status" aria-live="polite" className="text-white/80 p-6">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded mb-4" />
            <div className="h-4 w-72 bg-white/10 rounded mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded" />
          </div>
          <p className="mt-4 text-sm text-white/60">Loading topology...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div role="alert" className="text-red-400 bg-red-500/10 border border-red-500/30 rounded p-4 m-4">
          <p className="font-semibold">Unable to load topology</p>
          <p className="text-sm opacity-90">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 inline-flex items-center px-3 py-2 rounded bg-orange-500 text-black hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Retry
          </button>
        </div>
      );
    }
    if (!topology.nodes.length) {
      return (
        <div className="text-white/80 p-6">
          <p className="text-lg font-semibold">No services discovered yet</p>
          <p className="text-sm text-white/60 mt-1">
            When services are detected, they will appear here in the topology graph.
          </p>
          <button
            onClick={loadData}
            className="mt-4 inline-flex items-center px-3 py-2 rounded bg-orange-500 text-black hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Refresh
          </button>
        </div>
      );
    }
    return (
      <div className="flex h-full">
        <div className="flex-1 min-w-0">
          <ServiceGraph
            topology={topology}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onDeselect={() => setSelectedNodeId(null)}
          />
        </div>
        <aside
          aria-label="Node details"
          className="w-full md:w-96 lg:w-[28rem] xl:w-[32rem] border-l border-white/10 bg-gray-800"
        >
          <NodeDetailsPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            lastUpdatedTs={lastUpdatedTs}
          />
        </aside>
      </div>
    );
  })();

  return (
    <main
      className="h-full w-full bg-black text-white"
      aria-label="Service Topology"
    >
      <header className="px-6 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Service Topology
          </h1>
          <div className="text-xs text-white/60">
            {lastUpdatedTs ? (
              <span aria-live="polite">Last updated {new Date(lastUpdatedTs).toLocaleTimeString()}</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
        <p className="text-white/60 mt-1">
          Interactive map of functions, APIs, and dependencies. Click a node to view metrics, anomalies, and related services.
        </p>
      </header>
      <section
        className="m-4 rounded-lg border border-white/10 bg-gradient-to-br from-orange-500/20 to-black overflow-hidden h-[calc(100vh-14rem)]"
        aria-label="Topology Graph and Details"
      >
        {content}
      </section>
    </main>
  );
}
