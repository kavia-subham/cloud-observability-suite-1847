/**
 * PUBLIC_INTERFACE
 * createMockHandlers
 * This exports an array of handlers for intercepting REST API calls in development or when mocks are enabled.
 * Uses a lightweight, dependency-free approach that mirrors MSW's signature to avoid adding packages.
 */
import metrics from './data/metrics.json';
import anomalies from './data/anomalies.json';
import topology from './data/topology.json';
import costs from './data/costs.json';
import functionsData from './data/functions.json';
import security from './data/security.json';

/**
 * PUBLIC_INTERFACE
 * createMockHandlers
 * Returns a list of simple handler definitions mapping method+path to a response body.
 */
export function createMockHandlers() {
  /** This is a public function. */
  return [
    { method: 'GET', path: '/api/metrics/summary', status: 200, json: metrics.summary },
    { method: 'GET', path: '/api/metrics/timeseries', status: 200, json: metrics.timeseries },
    { method: 'GET', path: '/api/metrics/slo', status: 200, json: metrics.slo },

    { method: 'GET', path: '/api/anomalies', status: 200, json: anomalies },

    { method: 'GET', path: '/api/topology', status: 200, json: topology },

    // Costs list and recommendations to support Cost page
    { method: 'GET', path: '/api/costs', status: 200, json: costs },
    { method: 'GET', path: '/api/costs/recommendations', status: 200, json: [
      {
        id: "rec-1",
        title: "Reduce memory for low-CPU Lambda",
        description: "Decrease memory by 128MB for underutilized functions to reduce cost.",
        impactUsd: 120.5,
        impactPct: 8.2,
        type: "memory",
        suggestedDeltaMb: -128
      },
      {
        id: "rec-2",
        title: "Increase concurrency for hot path",
        description: "Raise concurrency to 1.5x to reduce average duration and cost.",
        impactUsd: 210.75,
        impactPct: 12.3,
        type: "concurrency",
        suggestedMultiplier: 1.5
      }
    ] },

    { method: 'GET', path: '/api/functions', status: 200, json: functionsData },

    { method: 'GET', path: '/api/security/summary', status: 200, json: security.summary },
    { method: 'GET', path: '/api/security/findings', status: 200, json: security.findings },
    // individual finding by id (simple first match)
    { method: 'GET', path: '/api/security/findings/sec-001', status: 200, json: security.findings[0] },
    { method: 'GET', path: '/api/security/findings/sec-002', status: 200, json: security.findings[1] },
    // workflow execution mock (POST); respond with updated status
    { method: 'POST', path: '/api/security/findings/sec-001/workflow', status: 200, json: { ok: true, status: 'approved' } },
    { method: 'POST', path: '/api/security/findings/sec-002/workflow', status: 200, json: { ok: true, status: 'resolved' } },
    { method: 'GET', path: '/api/security/workflows', status: 200, json: security.workflows }
  ];
}

/**
 * PUBLIC_INTERFACE
 * installFetchMock
 * Intercepts window.fetch and serves mocked JSON based on the handlers above.
 */
export function installFetchMock(handlers) {
  /** This is a public function. */
  if (typeof window === 'undefined') return () => {};

  const originalFetch = window.fetch.bind(window);

  function match(url, method) {
    try {
      const u = new URL(url, window.location.origin);
      return handlers.find(h => h.method === method && h.path === u.pathname);
    } catch {
      return undefined;
    }
  }

  window.fetch = async (input, init = {}) => {
    const method = (init.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input.url;
    const handler = match(url, method);
    if (handler) {
      const body = JSON.stringify(handler.json);
      return new Response(body, {
        status: handler.status || 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return originalFetch(input, init);
  };

  // Return uninstaller
  return () => {
    window.fetch = originalFetch;
  };
}

/**
 * PUBLIC_INTERFACE
 * createWsMockEmitters
 * Simulates WebSocket events by periodically invoking subscribers via wsClient API.
 * It imports wsClient lazily to avoid circular deps during app bootstrap.
 */
export function createWsMockEmitters() {
  /** This is a public function. */
  const timers = [];
  let ws;

  const init = async () => {
    // dynamic import to avoid bundling cycles
    const mod = await import('../services/wsClient');
    ws = mod.default || mod;
    // The wsClient should expose a publish or internal notify for testing;
    // since we don't want to change production code, we use a shim if available.
    const publish =
      (ws && ws.__mockPublish) ||
      (ws && ws.publish) ||
      null;

    if (!publish) {
      // Create a minimal shim that triggers known topics if not present.
      // This assumes wsClient has a subscribe(topic, cb) method that we can pair with a local map.
      if (!ws || typeof ws.subscribe !== 'function') return;

      const subscribers = {}; // local map only for mock usage
      const origSubscribe = ws.subscribe.bind(ws);
      ws.subscribe = (topic, cb) => {
        subscribers[topic] = subscribers[topic] || [];
        subscribers[topic].push(cb);
        return () => {
          subscribers[topic] = (subscribers[topic] || []).filter(fn => fn !== cb);
        };
      };
      const localPublish = (topic, data) => {
        (subscribers[topic] || []).forEach(fn => {
          try { fn(data); } catch (e) { /* noop */ }
        });
      };

      // Emit topology heartbeat
      timers.push(setInterval(() => {
        localPublish('topology:update', {
          ts: Date.now(),
          edges: topology.edges.map(e => ({ ...e, latency: Math.max(5, e.latency + Math.round((Math.random() - 0.5) * 10)) }))
        });
      }, 4000));

      // Emit metrics tick
      timers.push(setInterval(() => {
        const last = metrics.timeseries[metrics.timeseries.length - 1];
        const next = {
          t: last.t + 1,
          rps: Math.max(600, Math.round(last.rps + (Math.random() - 0.5) * 80)),
          err: Math.max(0, +(last.err + (Math.random() - 0.5) * 0.004).toFixed(3)),
          p50: Math.max(40, last.p50 + Math.round((Math.random() - 0.5) * 8)),
          p90: Math.max(120, last.p90 + Math.round((Math.random() - 0.5) * 15)),
          p99: Math.max(220, last.p99 + Math.round((Math.random() - 0.5) * 25))
        };
        localPublish('metrics:tick', next);
      }, 3000));

      // Emit anomaly occasionally
      timers.push(setInterval(() => {
        const sample = {
          id: `an-${Math.floor(Math.random() * 9000) + 1000}`,
          title: "Transient latency spike detected",
          service: "checkout",
          severity: Math.random() > 0.7 ? "high" : "medium",
          detectedAt: new Date().toISOString(),
          status: "open",
          metrics: { p99: 400 + Math.round(Math.random() * 200), baselineP99: 320 },
          aiExplanation: "Probable downstream contention. Monitoring for persistence."
        };
        localPublish('anomalies:new', sample);
      }, 10000));

      return () => timers.forEach(clearInterval);
    }

    // If wsClient provides publish-like capability, use it directly.
    timers.push(setInterval(() => {
      const changed = topology.edges.map(e => ({ ...e, latency: Math.max(5, e.latency + Math.round((Math.random() - 0.5) * 10)) }));
      publish('topology:update', { ts: Date.now(), edges: changed });
    }, 4000));

    timers.push(setInterval(() => {
      const last = metrics.timeseries[metrics.timeseries.length - 1];
      const next = {
        t: last.t + 1,
        rps: Math.max(600, Math.round(last.rps + (Math.random() - 0.5) * 80)),
        err: Math.max(0, +(last.err + (Math.random() - 0.5) * 0.004).toFixed(3)),
        p50: Math.max(40, last.p50 + Math.round((Math.random() - 0.5) * 8)),
        p90: Math.max(120, last.p90 + Math.round((Math.random() - 0.5) * 15)),
        p99: Math.max(220, last.p99 + Math.round((Math.random() - 0.5) * 25))
      };
      publish('metrics:tick', next);
    }, 3000));

    timers.push(setInterval(() => {
      const sample = {
        id: `an-${Math.floor(Math.random() * 9000) + 1000}`,
        title: "Transient latency spike detected",
        service: "checkout",
        severity: Math.random() > 0.7 ? "high" : "medium",
        detectedAt: new Date().toISOString(),
        status: "open",
        metrics: { p99: 400 + Math.round(Math.random() * 200), baselineP99: 320 },
        aiExplanation: "Probable downstream contention. Monitoring for persistence."
      };
      publish('anomalies:new', sample);
    }, 10000));

    return () => timers.forEach(clearInterval);
  };

  return { init };
}
