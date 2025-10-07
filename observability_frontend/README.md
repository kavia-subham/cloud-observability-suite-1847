# Observability Frontend (React) — Ocean Professional

## Overview
This React application serves as the UI for a real-time, AI-powered observability platform. It provides dashboards, topology views, serverless function insights, cost optimization, security posture, alerts, settings, and DevSecOps workflows. The app is designed with a bold “Ocean Professional” theme emphasizing high contrast, dark surfaces, vibrant accents, and rounded components.

The frontend runs independently using mock data by default for a smooth local experience. It integrates with backends via REST for data querying and WebSockets for live updates once endpoints are available.

## Quick Start
1. Prerequisites:
   - Node.js 18+ and npm
2. Install:
   - npm install
3. Configure environment:
   - Copy .env.example to .env and adjust values as needed. For local development, mocks are on by default.
4. Run in development:
   - npm start
   - Open the app at http://localhost:3000
5. Run tests:
   - npm test
6. Production build:
   - npm run build

## Preview/502 Troubleshooting
If you see a 502 Bad Gateway in the preview:
- The preview proxy expects the app on port 3000. If another dev server is already running on 3000, the proxy may show 502.
- Ensure only one dev server is running and that it binds to port 3000.
- Use the non-interactive start script to force port 3000 and avoid prompts:
  - npm run start:ci
  - This sets PORT=3000 HOST=0.0.0.0 BROWSER=none CI=true.
- In development, mocks are enabled by default unless REACT_APP_USE_MOCKS=false. This avoids backend connectivity failures blocking startup.

## Environment Variables
The app reads environment variables prefixed with REACT_APP_ at build time. Edit .env or provide them via your environment when running build/start.

- REACT_APP_API_BASE_URL
  - Description: Base URL for REST API calls.
  - Example: http://localhost:8080 or https://api.example.com
  - Used by: src/services/apiClient.js (buildUrl for request paths)
- REACT_APP_WS_URL
  - Description: WebSocket URL for live updates.
  - Example: ws://localhost:8080/ws or wss://api.example.com/ws
  - Used by: src/config/env.js and src/services/wsClient.js
- REACT_APP_USE_MOCKS
  - Description: Enables the local mock layer (REST and simulated WS ticks). In development, mocks default to enabled unless REACT_APP_USE_MOCKS is explicitly set to 'false'.
  - Values: true or false
  - Used by: src/index.js, src/config/env.js, src/services/apiClient.js
- REACT_APP_AUTH_PROVIDER
  - Description: Placeholder to document auth strategy (e.g., basic, oauth, cognito, auth0, firebase). Current implementation uses a minimal local mock auth context.
  - Values: basic (default), or another strategy for future integration
  - Used by: Documented for future replacement; current mock auth reads no external provider.

Example .env for local development:
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_USE_MOCKS=true
REACT_APP_AUTH_PROVIDER=basic

## Mock Mode
The application supports a fully functional mock mode to preview the UI and flows without a backend.

How it works:
- src/index.js conditionally initializes mocks based on REACT_APP_USE_MOCKS and NODE_ENV.
  - If REACT_APP_USE_MOCKS=true, mocks are always enabled.
  - In development, mocks are enabled by default unless REACT_APP_USE_MOCKS is explicitly set to 'false'.
- REST mocks:
  - src/mocks/server.js installs fetch interceptors using handlers from src/mocks/handlers.js.
  - Handlers serve dataset files from src/mocks/data/*.json for endpoints like /api/metrics… /api/costs … /api/security …
- WebSocket simulation:
  - src/mocks/handlers.js includes createWsMockEmitters that periodically publish synthetic events (e.g., topology:update, metrics:tick, anomalies:new) to simulate live updates.
- Mock-aware API helpers:
  - src/services/apiClient.js conditionally imports local datasets when USE_MOCKS is true (e.g., getDashboard, getSecurity, getCosts, getAnomalies, getFunctions, getTopology).
- WebSocket client:
  - src/services/wsClient.js will no-op connect() when USE_MOCKS is true and emit a synthetic open event.

Run with mocks:
- Ensure .env includes REACT_APP_USE_MOCKS=true
- npm start

Disable mocks (connect to a real backend):
- Set REACT_APP_USE_MOCKS=false
- Ensure REACT_APP_API_BASE_URL and REACT_APP_WS_URL are properly set to reachable services

## Architecture & Folders
High-level structure:
- src/App.js: App shell, theme toggling, router provider, and auth provider wiring
- src/index.js: App bootstrap and mock initialization
- src/routes/index.js: Route configuration with protected/public route guards
- src/layouts/MainLayout.jsx: Main application layout shell (sidebar/header/content)
- src/pages/*: Top-level pages
  - Dashboard.jsx: Overview metrics and SLOs
  - Topology.jsx: Dynamic service graph and node details
  - Functions.jsx: Serverless functions list and details
  - Alerts.jsx: Alerting overview and recent notable events
  - Security.jsx: Security findings and workflows
  - Cost.jsx: Cost summary, breakdowns, and what-if simulations
  - Settings.jsx: Profile, notifications, theme toggle
  - Login.jsx: Mock login using AuthContext
- src/components/*: Reusable UI and domain components
  - ui/*: Button, Card, Input, Select, Modal, Tooltip, Badge
  - anomalies/*: AI explanations, anomaly list/details, root cause panel
  - cost/*: Cost breakdown, optimization list, what-if panel
  - functions/*: Function list/details, invocations table
  - security/*: Findings table/details, workflow modal
  - topology/*: ServiceGraph and NodeDetailsPanel
- src/state/*:
  - AppContext.jsx: Global app-level context/provider
  - AuthContext.jsx: Minimal mock auth implementation (localStorage persistence)
  - actions.js, reducers.js: App state actions/reducers
- src/services/*:
  - apiClient.js: REST client with retry/backoff, headers, helper APIs, and mock-aware helpers
  - wsClient.js: WebSocket client with reconnect, heartbeat, and subscription APIs
- src/mocks/*:
  - server.js: Mock bootstrap
  - handlers.js: Route handlers and WS tick emitters
  - data/*.json: Mock datasets (anomalies, costs, functions, metrics, security, topology)
- src/styles/*:
  - tokens.css: Design tokens for the Ocean Professional theme
  - theme.css: Global base styles and utilities
- src/config/env.js: Env flags resolution for WS and mock mode
- src/utils/*: Small utilities (formatters, useInterval)

## Theme & Styling (Ocean Professional)
The design system uses CSS tokens and a global theme layer:
- Token source: src/styles/tokens.css defines color palette, typography, spacing, radii, and shadows to achieve a bold, high-contrast aesthetic.
- Global styles: src/styles/theme.css applies tokens, sets typography utilities, container layout, buttons, links, surface styles, focus rings, and gradient background treatments.
- Theme switching: src/App.js toggles data-theme between dark and light and updates the document element. Dark is the default for the “Ocean Professional” look.
- Component styling: UI components in src/components/ui/ consume the theme tokens and utilities.

## Routing & Auth
- Router: react-router-dom v6 is used for routing (BrowserRouter configured in App.js).
- Route guards:
  - ProtectedRoute: Wraps authenticated routes; redirects unauthenticated users to /login with a returnTo param.
  - PublicRoute: Prevents authenticated users from visiting public-only routes like /login.
- Auth:
  - src/state/AuthContext.jsx stores isAuthenticated and user in localStorage and provides login/logout methods.
  - The current implementation is mock/local only. Replace later with the selected provider noted by REACT_APP_AUTH_PROVIDER.
  - usePostLoginRedirect ensures users return to their originally requested protected route after successful login.

## API & WebSocket Clients
- REST API:
  - src/services/apiClient.js exposes a generic request() with standardized error handling, retries, timeouts, and convenience verbs (api.get/post/…).
  - Domain helpers: MetricsAPI, AnomaliesAPI, CostAPI, SecurityAPI, FunctionsAPI provide typed endpoints.
  - Mock-aware helpers: getDashboard, getSecurity, getCosts, getAnomalies, getFunctions, getTopology and others read local JSON when mocks are enabled.
  - Base URL is computed from REACT_APP_API_BASE_URL.
- WebSocket:
  - src/services/wsClient.js provides a reconnecting, heartbeat-enabled client with subscribe/unsubscribe channels and EventEmitter-like hooks.
  - It reads REACT_APP_WS_URL via src/config/env.js.
  - In mock mode, connect() is a no-op and emits an “open” event; WS events are simulated by mock emitters.

## Next Steps (Integrating backend)
When your backend is available:
1. Disable mocks:
   - Set REACT_APP_USE_MOCKS=false in .env
2. Configure endpoints:
   - REACT_APP_API_BASE_URL=http(s)://<your-api-host>/api
   - REACT_APP_WS_URL=ws(s)://<your-api-host>/ws
3. Auth integration:
   - Choose a provider and set REACT_APP_AUTH_PROVIDER accordingly.
   - Replace the mock AuthContext with the corresponding SDK and token flows. Ensure apiClient builds the correct Authorization headers.
4. Verify network calls:
   - Check that apiClient requests hit your expected routes from the domain helpers and that WebSocket connects successfully.
5. Gradual migration:
   - You can keep mocks enabled for specific domains by adapting apiClient functions to prefer live calls while leaving others mock-backed during transition.

## Developer Notes
- Code style: Minimal dependencies with custom UI components styled via tokens.css and theme.css.
- Accessibility: The theme includes a focus-visible outline, high-contrast colors, and scalable typography. Components should use semantic HTML and aria attributes where appropriate.
- Testing: react-scripts test is configured; add unit and integration tests as you extend features.
- Performance: API client includes simple backoff on transient errors; prefer incremental loading and memoization in components as needed.
- Contribution: Keep README and .env.example in sync with src/config/env.js, src/services/apiClient.js, and src/services/wsClient.js when adding or changing env flags.
