"use strict";

/**
 * Environment config reader for the frontend.
 * Reads React env vars (prefixed with REACT_APP_) and applies safe defaults with warnings.
 * Exports getEnv() which can be called anywhere, and a cached env object.
 */

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns normalized environment variables used by the app. */
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  const WS_URL = process.env.REACT_APP_WS_URL || "";
  const USE_MOCKS = parseBoolean(process.env.REACT_APP_USE_MOCKS, false);
  const AUTH_PROVIDER = process.env.REACT_APP_AUTH_PROVIDER || "basic";

  if (!API_BASE_URL && process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] REACT_APP_API_BASE_URL is not set. API calls will use relative paths. Set this in your .env"
    );
  }
  if (!WS_URL && process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn("[env] REACT_APP_WS_URL is not set. Realtime features may be disabled.");
  }

  return {
    API_BASE_URL,
    WS_URL,
    USE_MOCKS,
    AUTH_PROVIDER,
  };
}

function parseBoolean(value, defaultVal = false) {
  if (value === undefined || value === null) return defaultVal;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return defaultVal;
}

const env = getEnv();
export default env;
