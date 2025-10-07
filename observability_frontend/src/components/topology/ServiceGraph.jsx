import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

/**
 * PUBLIC_INTERFACE
 * ServiceGraph
 * Renders an interactive graph with simple force-like layout, zoom/pan, and
 * click-to-select interactions. Designed for small to medium graphs.
 *
 * Props:
 * - topology: { nodes: Array<{id,label,type,status,metrics,anomalies,dependencies}>, edges: Array<{source,target,latency,errorRate}> }
 * - selectedNodeId: string | null
 * - onSelectNode: (id: string) => void
 * - onDeselect: () => void
 */
export default function ServiceGraph({ topology, selectedNodeId, onSelectNode, onDeselect }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  // Basic radial layout for readability without external libs
  const layout = useMemo(() => {
    const nodes = topology.nodes || [];
    const edges = topology.edges || [];
    const n = Math.max(nodes.length, 1);
    const radius = 200 + Math.min(400, n * 12);
    const center = { x: 400, y: 300 };
    const positions = {};
    nodes.forEach((node, i) => {
      const theta = (i / n) * Math.PI * 2;
      positions[node.id] = {
        x: center.x + radius * Math.cos(theta),
        y: center.y + radius * Math.sin(theta),
      };
    });
    return { positions, center, edges, nodes };
  }, [topology]);

  // Zoom and pan handlers
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let isPanning = false;
    let last = { x: 0, y: 0 };

    const onWheel = (e) => {
      e.preventDefault();
      const { offsetX, offsetY, deltaY } = e;
      const k = Math.max(0.3, Math.min(3, transform.k * (deltaY > 0 ? 0.9 : 1.1)));
      // Zoom around cursor
      const x = offsetX - (offsetX - transform.x) * (k / transform.k);
      const y = offsetY - (offsetY - transform.y) * (k / transform.k);
      setTransform({ x, y, k });
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isPanning = true;
      last = { x: e.clientX, y: e.clientY };
      svg.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!isPanning) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    };

    const onMouseUp = () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    };

    const onKeyDown = (e) => {
      // Accessible panning/zooming
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setTransform((t) => ({ ...t, k: Math.min(3, t.k * 1.1) }));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setTransform((t) => ({ ...t, k: Math.max(0.3, t.k * 0.9) }));
      } else if (e.key === 'ArrowLeft') {
        setTransform((t) => ({ ...t, x: t.x + 20 }));
      } else if (e.key === 'ArrowRight') {
        setTransform((t) => ({ ...t, x: t.x - 20 }));
      } else if (e.key === 'ArrowUp') {
        setTransform((t) => ({ ...t, y: t.y + 20 }));
      } else if (e.key === 'ArrowDown') {
        setTransform((t) => ({ ...t, y: t.y - 20 }));
      } else if (e.key === 'Escape') {
        onDeselect?.();
      }
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    svg.addEventListener('keydown', onKeyDown);

    svg.style.cursor = 'grab';
    svg.setAttribute('tabIndex', '0'); // focusable for keyboard

    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      svg.removeEventListener('keydown', onKeyDown);
    };
  }, [transform.k, onDeselect]);

  const handleBackgroundClick = useCallback(
    (e) => {
      if (e.target.getAttribute('data-kind') === 'stage') {
        onDeselect?.();
      }
    },
    [onDeselect]
  );

  const nodeFill = (node) => {
    // Use Ocean Professional palette
    if (node?.status === 'error') return '#EF4444';
    if (node?.status === 'degraded') return '#F97316';
    return '#10B981';
  };

  const edgeStroke = (edge) => {
    const err = edge?.errorRate ?? 0;
    if (err > 0.2) return '#EF4444';
    if (err > 0.05) return '#F97316';
    return '#9CA3AF';
  };

  return (
    <div ref={containerRef} className="h-full w-full bg-gray-900/50">
      <svg
        ref={svgRef}
        role="application"
        aria-label="Interactive service topology graph"
        className="w-full h-full outline-none"
        onClick={handleBackgroundClick}
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
            <path d="M 0 0 L 10 4 L 0 8 z" fill="#9CA3AF" />
          </marker>
        </defs>
        <g
          data-kind="stage"
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
        >
          {/* Edges */}
          {layout.edges.map((e, idx) => {
            const s = layout.positions[e.source];
            const t = layout.positions[e.target];
            if (!s || !t) return null;
            return (
              <g key={`edge-${idx}`} opacity={0.9}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={edgeStroke(e)}
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
                {/* latency label */}
                {e.latency != null && (
                  <text
                    x={(s.x + t.x) / 2}
                    y={(s.y + t.y) / 2}
                    dy={-6}
                    textAnchor="middle"
                    className="fill-white/70 text-[10px]"
                  >
                    {`${Math.round(e.latency)} ms`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {layout.nodes.map((node) => {
            const p = layout.positions[node.id];
            if (!p) return null;
            const isSelected = node.id === selectedNodeId;
            const r = isSelected ? 18 : 14;
            return (
              <g
                key={node.id}
                transform={`translate(${p.x},${p.y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode?.(node.id);
                }}
              >
                <circle
                  r={r}
                  fill={nodeFill(node)}
                  stroke={isSelected ? '#F59E0B' : '#111827'}
                  strokeWidth={isSelected ? 3 : 2}
                  aria-label={`Service ${node.label}`}
                />
                <text
                  x={0}
                  y={r + 16}
                  textAnchor="middle"
                  className="fill-white text-xs select-none"
                >
                  {node.label}
                </text>
                {/* status badge */}
                {node?.anomalies?.length ? (
                  <circle r={5} cx={r} cy={-r} fill="#EF4444" />
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
