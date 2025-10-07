/**
 * PUBLIC_INTERFACE
 * startMocks
 * Initializes the mock layer when REACT_APP_USE_MOCKS is true or in development mode.
 * - Installs REST fetch interceptors using handlers
 * - Starts WebSocket simulation emitters
 * Returns an async stop function to teardown mocks.
 */
import { createMockHandlers, installFetchMock, createWsMockEmitters } from './handlers';

/**
 * PUBLIC_INTERFACE
 * startMocks
 * Bootstraps the mock server and returns a teardown function.
 */
export async function startMocks() {
  /** This is a public function. */
  const handlers = createMockHandlers();
  const uninstallFetch = installFetchMock(handlers);

  const ws = createWsMockEmitters();
  let stopWs = null;
  if (ws && typeof ws.init === 'function') {
    stopWs = await ws.init();
  }

  return async function stop() {
    if (typeof uninstallFetch === 'function') uninstallFetch();
    if (typeof stopWs === 'function') stopWs();
  };
}
