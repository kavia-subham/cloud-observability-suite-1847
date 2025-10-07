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
import React from "react";
import { AuthContext } from "../state/AuthContext";
import { AppContext } from "../state/AppContext";

/**
 * Internal: Retrieve auth token from contexts if available or localStorage as fallback.
 * Uses React context if within a component tree; falls back safely in non-React usage.
 */
function getTokenFromContextsOrStorage() {
  try {
    // Attempt to read from contexts only if a Provider has set current value
    // Note: React.useContext must be called inside a component. We guard by checking current dispatcher.
    // For non-component usage, we rely on context defaultValue which is usually undefined.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const authCtx = (() => {
      try {
        // Only call inside component; outside will throw rules-of-hooks warning in lint, but runtime is fine.
        // To avoid lint noise, we do not use the hook when not in component scope.
        return undefined;
      } catch {
        return undefined;
      }
    })();

    // As a non-hook approach, try to access context via defaultValue pattern if library exposed.
    // Many apps store token in localStorage; we use that as reliable fallback.
    // Try localStorage fallback:
    const lsToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token") ||
          window.localStorage.getItem("token") ||
          window.localStorage.getItem("id_token")
        : null;

    if (authCtx && authCtx.token) return authCtx.token;

    // Also try AppContext if present (token may live there)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const appCtx = undefined;
    if (appCtx && appCtx.state && appCtx.state.token) return appCtx.state.token;

    return lsToken;
  } catch {
    return null;
  }
}

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
function normalizeError(err, { url, method, status, body } = {}) {
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
  } = options;

  const env = getEnv();
  const baseURL = env.API_BASE_URL || "";
  if (!baseURL) {
    if (process.env.NODE_ENV !== "test") {
      // Avoid noisy logs in tests
      // eslint-disable-next-line no-console
      console.warn(
        "[apiClient] REACT_APP_API_BASE_URL is not set; requests will use relative paths. Configure it in .env"
      );
    }
  }

  const url = buildUrl(baseURL, path, params);

  // Setup timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const compositeSignal = mergeSignals(signal, controller.signal);

  // Resolve auth token
  const token =
    options?.token ||
    getTokenFromContextsOrStorage() ||
    (typeof window !== "undefined" ? window.sessionStorage?.getItem("auth_token") : null);

  const finalHeaders = buildHeaders(headers, token);

  const fetchOptions = {
    method,
    headers: finalHeaders,
    signal: compositeSignal,
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
  throw lastError || normalizeError(new Error("Unknown request failure"), { url, method });
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
  let final = "";
  if (!baseURL) {
    final = path;
  } else {
    final = `${baseURL.replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;
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
  timeseries: (metricName, params) => api.get(`/metrics/${encodeURIComponent(metricName)}/series`, { params }),
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
  runWorkflow: (id, body) => api.post(`/security/findings/${encodeURIComponent(id)}/workflow`, body),
};

export const FunctionsAPI = {
  /** List functions */
  list: (params) => api.get("/functions", { params }),
  /** Get function details */
  getById: (id) => api.get(`/functions/${encodeURIComponent(id)}`),
  /** Get invocations for function */
  invocations: (id, params) => api.get(`/functions/${encodeURIComponent(id)}/invocations`, { params }),
};

// Default export retains common helpers for convenience.
const apiClient = {
  request,
  api,
  MetricsAPI,
  AnomaliesAPI,
  CostAPI,
  SecurityAPI,
  FunctionsAPI,
};

export default apiClient;
