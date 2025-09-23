import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * ServiceGraph
 * A lightweight, dependency-free SVG topology graph for functions/APIs/resources.
 * - Supports panning and zooming
 * - Renders nodes (with provider icon letter) and edges
 * - Applies heat coloring to nodes/edges based on latency/errors (mock or provided)
 *
 * PUBLIC INTERFACE
 */
// PUBLIC_INTERFACE
export default function ServiceGraph({
  width = '100%',
  height = 520,
  nodes = mockNodes,
  edges = mockEdges,
  onNodeSelect = () => {},
  initialZoom = 1,
}) {
  /**
   * Local state for pan/zoom and selection
   */
  const [zoom, setZoom] = useState(initialZoom);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);

  const svgRef = useRef(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Compute layout positions if not provided in nodes (simple radial layout)
  const positionedNodes = useMemo(() => {
    if (nodes.every(n => n.x != null && n.y != null)) return nodes;
    const centerX = 500;
    const centerY = 280;
    const radius = 180;
    const others = nodes.filter(n => !n.center);
    const angleStep = (2 * Math.PI) / Math.max(others.length, 1);
    const laidOut = others.map((n, i) => ({
      ...n,
      x: centerX + radius * Math.cos(i * angleStep),
      y: centerY + radius * Math.sin(i * angleStep),
    }));
    const center = nodes.find(n => n.center) || {
      id: 'core',
      label: 'Core',
      type: 'service',
      provider: 'AWS',
      x: centerX,
      y: centerY,
    };
    return [ { ...center, x: centerX, y: centerY }, ...laidOut ];
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const m = new Map();
    positionedNodes.forEach(n => m.set(n.id, n));
    return m;
  }, [positionedNodes]);

  // Heat color mapping
  const colorForMetric = (metricValue, type = 'latency') => {
    // Normalize 0..1 (mock expectation)
    const v = Math.max(0, Math.min(1, metricValue ?? 0));
    // Green -> Orange -> Red gradient
    const g = (1 - v) * 185 + 20; // 20..205
    const r = 200 + v * 55;       // 200..255
    const o = Math.round(r);
    const e = Math.round(g);
    // Slightly different hues for errors vs latency
    if (type === 'errors') {
      // more red
      return `rgba(239,68,68,${0.35 + v * 0.4})`;
    }
    return `rgba(${o},${e},22, ${0.35 + v * 0.35})`;
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const scaleFactor = delta > 0 ? 1.1 : 0.9;
    const nextZoom = Math.max(0.4, Math.min(3, zoom * scaleFactor));
    setZoom(nextZoom);
  };

  // Mouse down to start pan
  const handleMouseDown = (e) => {
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // Mouse move pan
  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  const handleLeave = () => {
    isPanning.current = false;
  };

  // Touch events (basic pinch-to-zoom not implemented; use wheel/controls; pan supported)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      const t = e.touches[0];
      lastPos.current = { x: t.clientX, y: t.clientY };
    }
  };
  const handleTouchMove = (e) => {
    if (!isPanning.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - lastPos.current.x;
    const dy = t.clientY - lastPos.current.y;
    lastPos.current = { x: t.clientX, y: t.clientY };
    setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };
  const handleTouchEnd = () => {
    isPanning.current = false;
  };

  const selectNode = (node) => {
    setSelectedId(node.id);
    onNodeSelect(node);
  };

  // Helpers
  const getNodeMetric = (n) => ({
    latency: n.latency ?? Math.random() * 0.9,
    errors: n.errors ?? Math.random() * 0.5,
  });
  const getEdgeMetric = (e) => ({
    latency: e.latency ?? Math.random() * 0.9,
    errors: e.errors ?? Math.random() * 0.5,
    calls: e.calls ?? Math.floor(Math.random() * 1200),
  });

  // Controls for theme-consistent buttons
  const controlBtn = {
    appearance: 'none',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 10px',
    cursor: 'pointer',
  };

  // Provider icon letter
  const providerGlyph = (provider) => {
    if (!provider) return 'S';
    const p = provider.toLowerCase();
    if (p.startsWith('aws')) return 'A';
    if (p.startsWith('azure')) return 'Z';
    if (p.startsWith('gcp') || p.startsWith('google')) return 'G';
    return provider[0]?.toUpperCase() || 'S';
  };

  // Node shape by type
  const renderNodeShape = (type, size = 26) => {
    switch (type) {
      case 'function':
        return { rx: 8, ry: 8, w: size * 2, h: size };
      case 'api':
        return { rx: size, ry: size, w: size, h: size }; // circle-ish using rx/ry
      case 'db':
      case 'queue':
      case 'bucket':
        return { rx: 12, ry: 12, w: size * 1.6, h: size * 1.1 };
      default:
        return { rx: 10, ry: 10, w: size * 1.6, h: size * 1.2 };
    }
  };

  // Edge path
  const edgePath = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    // Smooth quad curve
    return `M ${from.x} ${from.y} Q ${mx} ${my - 30} ${to.x} ${to.y}`;
  };

  // Render
  return (
    <div className="surface" style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 2,
        background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
      }}>
        <button style={controlBtn} onClick={() => setZoom(z => Math.min(3, z * 1.1))} title="Zoom in">＋</button>
        <button style={controlBtn} onClick={() => setZoom(z => Math.max(0.4, z * 0.9))} title="Zoom out">－</button>
        <button style={controlBtn} onClick={() => { setZoom(1); setTranslate({ x: 0, y: 0 }); }} title="Reset view">Reset</button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 2,
        background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)'
      }}>
        <div style={{ marginBottom: 6, color: 'var(--color-text-muted)' }}>Heat Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 10, background: colorForMetric(0.1), display: 'inline-block', borderRadius: 2 }} />
          <span style={{ width: 14, height: 10, background: colorForMetric(0.5), display: 'inline-block', borderRadius: 2 }} />
          <span style={{ width: 14, height: 10, background: colorForMetric(0.9), display: 'inline-block', borderRadius: 2 }} />
          <span className="text-muted">Low → High latency/errors</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 1000 560`}
        style={{ touchAction: 'none', cursor: isPanning.current ? 'grabbing' : 'grab', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label="Interactive service topology"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.65)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((e, idx) => {
            const from = nodeMap.get(e.from);
            const to = nodeMap.get(e.to);
            if (!from || !to) return null;
            const m = getEdgeMetric(e);
            const color = colorForMetric((m.latency + m.errors) / 2);
            return (
              <g key={`edge-${idx}`} opacity={0.9}>
                <path
                  d={edgePath(from, to)}
                  stroke={color}
                  strokeWidth={2 + Math.min(4, (m.calls ?? 0) / 600)}
                  fill="none"
                  markerEnd="url(#arrow)"
                  filter="url(#glow)"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {positionedNodes.map((n) => {
            const { latency, errors } = getNodeMetric(n);
            const heat = colorForMetric((latency * 0.7 + errors * 0.3));
            const shape = renderNodeShape(n.type);
            const selected = selectedId === n.id;

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={(e) => { e.stopPropagation(); selectNode(n); }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={-shape.w / 2}
                  y={-shape.h / 2}
                  width={shape.w}
                  height={shape.h}
                  rx={shape.rx}
                  ry={shape.ry}
                  fill="rgba(0,0,0,0.35)"
                  stroke={selected ? 'var(--color-secondary)' : 'var(--color-border)'}
                  strokeWidth={selected ? 2 : 1}
                />
                {/* Heat overlay */}
                <rect
                  x={-shape.w / 2}
                  y={-shape.h / 2}
                  width={shape.w}
                  height={shape.h}
                  rx={shape.rx}
                  ry={shape.ry}
                  fill={heat}
                  opacity={0.8}
                  filter="url(#glow)"
                />
                {/* Provider glyph */}
                <circle cx={-shape.w / 2 + 10} cy={-shape.h / 2 + 10} r="8" fill="var(--color-primary)" />
                <text x={-shape.w / 2 + 10} y={-shape.h / 2 + 10} textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#000" fontWeight="700">
                  {providerGlyph(n.provider)}
                </text>

                {/* Label */}
                <text
                  x={0}
                  y={shape.h / 2 + 16}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--color-text)"
                  style={{ opacity: 0.9 }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/**
 * Mock data for a sensible default view.
 */
const mockNodes = [
  { id: 'api-gateway', label: 'API Gateway', type: 'api', provider: 'AWS', center: true, latency: 0.35, errors: 0.05 },
  { id: 'auth-validate', label: 'auth-validate', type: 'function', provider: 'AWS', latency: 0.25, errors: 0.02 },
  { id: 'payment-authorize', label: 'payment-authorize', type: 'function', provider: 'GCP', latency: 0.62, errors: 0.08 },
  { id: 'orders-write', label: 'orders-write', type: 'function', provider: 'Azure', latency: 0.55, errors: 0.12 },
  { id: 'orders-db', label: 'orders-db', type: 'db', provider: 'AWS', latency: 0.48, errors: 0.04 },
  { id: 'events-queue', label: 'events-queue', type: 'queue', provider: 'GCP', latency: 0.18, errors: 0.02 },
];

const mockEdges = [
  { from: 'api-gateway', to: 'auth-validate', latency: 0.28, errors: 0.03, calls: 1200 },
  { from: 'api-gateway', to: 'payment-authorize', latency: 0.54, errors: 0.10, calls: 840 },
  { from: 'payment-authorize', to: 'orders-write', latency: 0.7, errors: 0.12, calls: 420 },
  { from: 'orders-write', to: 'orders-db', latency: 0.45, errors: 0.05, calls: 680 },
  { from: 'orders-write', to: 'events-queue', latency: 0.2, errors: 0.03, calls: 300 },
];
