"use strict";

/**
 * API Client for REST interactions with backend services.
 * - Reads baseURL and feature flags from env config.
 * - Injects Authorization header from AuthContext if available or from localStorage fallback.
 * - Provides standardized error handling and simple retry with exponential backoff.
 * - Exposes a generic request() and specific endpoint helper stubs for common domains.
 *
 * Notes:
 * - This module is tree-shakeable: import only what you use.
 * - Ensure REACT_APP_API_BASE_URL is set via environment; sensible defaults used otherwise.
 */

import { getEnv } from "../config/env";

/**
 * Build headers with JSON defaults and Authorization if token present.
 */
function buildHeaders(extraHeaders = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = headers.Authorization || `Bearer ${token}`;
  }
  return headers;
}

/**
 * Normalize errors to a consistent shape.
 */
function normalizeError(err, { url, method, status } = {}) {
  const base = {
    name: "ApiClientError",
    message: "Request failed",
    url,
    method,
    status: status ?? null,
    data: null,
    cause: err?.message || err?.toString?.() || "Unknown error",
    retryable: false,
  };

  if (err?.name === "AbortError") {
    return {
      ...base,
      name: "ApiClientTimeoutError",
      message: "Request timed out",
      retryable: true,
    };
  }

  if (typeof err === "object" && err !== null) {
    return { ...base, ...err, url: url ?? err.url, status: status ?? err.status };
  }

  return base;
}

/**
 * Simple exponential backoff sleep.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * PUBLIC_INTERFACE
 * Generic request wrapper with retry and standardized errors.
 * - method: HTTP method string (GET, POST, etc.)
 * - path: relative API path (e.g., '/metrics')
 * - options: { params, body, headers, timeoutMs, retries, retryOn }
 */
export async function request(method, path, options = {}) {
  /** This is a public function. It performs an HTTP request using fetch(), adding base URL, headers, auth token, query params, timeout, and retry behavior. Returns parsed JSON or text. Throws normalized error on failure. */
  const {
    params,
    body,
    headers,
    timeoutMs = 15000,
    retries = 1,
    retryOn = [502, 503, 504],
    // Optional signal for cancellation
    signal,
    token: providedToken,
  } = options;

  const env = getEnv();
  const baseURL = env.API_BASE_URL || "";

  const url = buildUrl(baseURL, path, params);

  // Setup timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const timeoutSignal = controller.signal;
  const finalSignal = signal
    ? mergeSignals(signal, timeoutSignal)
    : timeoutSignal;

  // Resolve auth token. We avoid hooks here to keep this module usable outside components.
  const token =
    providedToken ||
    (typeof window !== "undefined"
      ? window.localStorage?.getItem("auth_token") ||
        window.localStorage?.getItem("token") ||
        window.sessionStorage?.getItem("auth_token")
      : null);

  const finalHeaders = buildHeaders(headers, token);

  const fetchOptions = {
    method,
    headers: finalHeaders,
    signal: finalSignal,
  };

  if (body !== undefined && body !== null) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      const res = await fetch(url, fetchOptions);
      const isJson = res.headers.get("content-type")?.includes("application/json");

      if (!res.ok) {
        let errPayload = null;
        try {
          errPayload = isJson ? await res.json() : await res.text();
        } catch {
          errPayload = null;
        }
        const normalized = normalizeError(
          {
            name: "ApiClientHttpError",
            message: "Non-2xx response",
            status: res.status,
            data: errPayload,
          },
          { url, method, status: res.status }
        );

        // Retry on configured status codes
        if (retryOn.includes(res.status) && attempt < retries) {
          attempt += 1;
          const backoff = 300 * Math.pow(2, attempt - 1);
          await delay(backoff);
          continue;
        }

        throw normalized;
      }

      clearTimeout(timeoutId);
      return isJson ? await res.json() : await res.text();
    } catch (err) {
      lastError = normalizeError(err, { url, method });
      // Retry on Abort (timeout) or network failure
      const isTimeout = lastError.name === "ApiClientTimeoutError";
      const isNetwork = lastError.status == null; // fetch network errors have no status
      if ((isTimeout || isNetwork) && attempt < retries) {
        attempt += 1;
        const backoff = 300 * Math.pow(2, attempt - 1);
        await delay(backoff);
        continue;
      }
      clearTimeout(timeoutId);
      throw lastError;
    }
  }

  // If loop exits without return/throw (shouldn't happen), throw last error or generic.
  clearTimeout(timeoutId);
  throw lastError || normalizeError(new Error("Unknown request failure"), { url: path, method });
}

/**
 * PUBLIC_INTERFACE
 * Convenience HTTP verbs
 */
export const api = {
  /** GET request with optional query params. */
  get: (path, options) => request("GET", path, options),
  /** POST request with JSON body. */
  post: (path, body, options = {}) => request("POST", path, { ...options, body }),
  /** PUT request with JSON body. */
  put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
  /** PATCH request with JSON body. */
  patch: (path, body, options = {}) => request("PATCH", path, { ...options, body }),
  /** DELETE request with optional JSON body. */
  delete: (path, options = {}) => request("DELETE", path, options),
};

/**
 * Build full URL with query params.
 */
function buildUrl(baseURL, path, params) {
  let final;
  if (!baseURL) {
    final = path;
  } else {
    final = `${baseURL.replace(/\/+$/, "")}/${String(path || "").replace(/^\//, "")}`;
  }
  if (params && typeof params === "object") {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => usp.append(k, String(item)));
      } else {
        usp.set(k, String(v));
      }
    });
    const qs = usp.toString();
    if (qs) final += (final.includes("?") ? "&" : "?") + qs;
  }
  return final;
}

/**
 * Merge two AbortSignals into a single composite signal.
 */
function mergeSignals(userSignal, timeoutSignal) {
  if (!userSignal) return timeoutSignal;
  if (!timeoutSignal) return userSignal;

  const controller = new AbortController();

  function forwardAbort(src) {
    if (src && typeof src.addEventListener === "function") {
      src.addEventListener(
        "abort",
        () => {
          if (!controller.signal.aborted) controller.abort();
        },
        { once: true }
      );
    }
  }

  forwardAbort(userSignal);
  forwardAbort(timeoutSignal);

  return controller.signal;
}

/**
 * PUBLIC_INTERFACE
 * Endpoint helper stubs for domains: metrics, anomalies, cost, security, functions.
 * These provide typed paths and help centralize API shapes.
 */
export const MetricsAPI = {
  /** Fetch metrics overview */
  listOverview: (params) => api.get("/metrics/overview", { params }),
  /** Fetch detailed time series for a metric */
  timeseries: (metricName, params) =>
    api.get(`/metrics/${encodeURIComponent(metricName)}/series`, { params }),
};

export const AnomaliesAPI = {
  /** List anomalies with optional filters */
  list: (params) => api.get("/anomalies", { params }),
  /** Get anomaly details */
  getById: (id) => api.get(`/anomalies/${encodeURIComponent(id)}`),
  /** Trigger AI explanation */
  explain: (id) => api.post(`/anomalies/${encodeURIComponent(id)}/explain`, {}),
};

export const CostAPI = {
  /** Get cost summary */
  summary: (params) => api.get("/cost/summary", { params }),
  /** Get cost breakdown by dimension */
  breakdown: (params) => api.get("/cost/breakdown", { params }),
  /** Run what-if simulation */
  whatIf: (body) => api.post("/cost/what-if", body),
};

export const SecurityAPI = {
  /** List security findings */
  findings: (params) => api.get("/security/findings", { params }),
  /** Get finding by id */
  getFinding: (id) => api.get(`/security/findings/${encodeURIComponent(id)}`),
  /** Execute workflow/action on finding */
  runWorkflow: (id, body) =>
    api.post(`/security/findings/${encodeURIComponent(id)}/workflow`, body),
};

export const FunctionsAPI = {
  /** List functions */
  list: (params) => api.get("/functions", { params }),
  /** Get function details by id */
  getById: (id) => api.get(`/functions/${encodeURIComponent(id)}`),
  /** Get invocations for function id */
  invocations: (id, params) =>
    api.get(`/functions/${encodeURIComponent(id)}/invocations`, { params }),
  /** Get logs for function id */
  logs: (id, params) =>
    api.get(`/functions/${encodeURIComponent(id)}/logs`, { params }),
};

/**
 * PUBLIC_INTERFACE
 * getTopology
 * Fetch the service topology (nodes and edges). When mocks are enabled via env,
 * fetches from the local mocks JSON.
 */
export async function getTopology(params) {
  const { USE_MOCKS } = getEnv();
  if (USE_MOCKS) {
    // Load mock topology from local JSON
    const res = await fetch('/mocks/data/topology.json');
    if (!res.ok) {
      throw normalizeError(
        { message: 'Failed to fetch topology (mock)', status: res.status },
        { url: '/mocks/data/topology.json', method: 'GET' }
      );
    }
    return res.json();
  }
  return api.get('/topology', { params });
}

/**
 * PUBLIC_INTERFACE
 * apiClient (default)
 * Aggregates helpers and provides mock-aware convenience for Functions data
 * consumed by the Functions page components.
 */
const apiClient = {
  request,
  api,
  MetricsAPI,
  AnomaliesAPI,
  CostAPI,
  SecurityAPI,
  FunctionsAPI,
  getTopology,

  // PUBLIC_INTERFACE
  async getDashboard() {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const mod = await import("../mocks/data/metrics.json");
      return mod.default || [];
    }
    return api.get("/dashboard");
  },

  // PUBLIC_INTERFACE
  async getSecurity() {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const mod = await import("../mocks/data/security.json");
      return mod.default || [];
    }
    return api.get("/security");
  },

  // PUBLIC_INTERFACE
  async getCosts() {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const mod = await import("../mocks/data/costs.json");
      return mod.default || [];
    }
    return api.get("/costs");
  },

  // PUBLIC_INTERFACE
  async getAnomalies() {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const mod = await import("../mocks/data/anomalies.json");
      return mod.default || [];
    }
    return api.get("/anomalies");
  },

  // PUBLIC_INTERFACE
  async getFunctions() {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const mod = await import("../mocks/data/functions.json");
      return mod.default || [];
    }
    return api.get("/functions");
  },

  // PUBLIC_INTERFACE
  async getFunctionInvocations(fn) {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      // synthesize invocations from function attributes
      const now = new Date();
      const items = Array.from({ length: 12 }).map((_, i) => {
        const t = new Date(now.getTime() - i * 60 * 1000);
        const cold = Math.random() < 0.15;
        const err = Math.random() < (fn?.errorRate || 0) / 100;
        return {
          time: t.toISOString(),
          durationMs: Math.round((fn?.p95LatencyMs || 180) * (0.6 + Math.random())),
          memoryMb: fn?.memoryMb || 256,
          coldStart: cold,
          status: err ? "error" : "ok",
          requestId: `${fn?.name || "fn"}-${t.getTime()}-${i}`,
        };
      });
      return items;
    }
    const id = encodeURIComponent(fn?.id || fn?.name || "");
    return FunctionsAPI.invocations(id);
  },

  // PUBLIC_INTERFACE
  async getFunctionLogs(fn) {
    const { USE_MOCKS } = getEnv();
    if (USE_MOCKS) {
      const now = new Date();
      const items = Array.from({ length: 10 }).map((_, i) => {
        const t = new Date(now.getTime() - i * 90 * 1000);
        const error = Math.random() < (fn?.errorRate || 0) / 100;
        return {
          time: t.toISOString(),
          level: error ? "error" : "info",
          message: error
            ? `Error: upstream timeout calling payment API at ${t.toISOString()}`
            : `Processed request in ${Math.round((fn?.p95LatencyMs || 200) * (0.5 + Math.random()))}ms`,
        };
      });
      return items;
    }
    const id = encodeURIComponent(fn?.id || fn?.name || "");
    return FunctionsAPI.logs(id);
  },
};

/**
 * PUBLIC_INTERFACE
 * getCosts: fetch cost dataset (mock-aware).
 */
export async function getCosts(params) {
  const { USE_MOCKS } = getEnv();
  if (USE_MOCKS) {
    const mod = await import("../mocks/data/costs.json");
    return mod.default || [];
  }
  return api.get("/costs", { params });
}

/**
 * PUBLIC_INTERFACE
 * getCostRecommendations: fetch cost optimization recommendations (mock-aware).
 * In mock mode, synthesize a small set from local data for demo.
 */
export async function getCostRecommendations() {
  const { USE_MOCKS } = getEnv();
  if (USE_MOCKS) {
    // synthesize a small static list to avoid extra files
    return [
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
    ];
  }
  return api.get("/costs/recommendations");
}

export { apiClient };
export default apiClient;
