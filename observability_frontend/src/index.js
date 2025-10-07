import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // index.css imports src/styles/theme.css -> tokens
import App from './App';
import { AppProvider } from './state/AppContext';

/**
 * Initialize mocks conditionally based on env flags.
 * REACT_APP_USE_MOCKS=true will force mocks on any env.
 * In development, mocks are enabled by default unless REACT_APP_USE_MOCKS is explicitly 'false'.
 */
async function initializeMocksIfNeeded() {
  const flag = process.env.REACT_APP_USE_MOCKS;
  const isDev = process.env.NODE_ENV === 'development';

  const useMocks = flag === 'true' || (isDev && flag !== 'false');
  if (!useMocks) return;

  try {
    const { startMocks } = await import('./mocks/server');
    await startMocks();
    // eslint-disable-next-line no-console
    console.info('[mocks] Mock service layer initialized');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[mocks] Failed to initialize mocks', e);
  }
}

async function boot() {
  await initializeMocksIfNeeded();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
}

boot();
