import { SET_THEME, SET_METRICS, SET_ANOMALIES, SET_TOPOLOGY, SET_COST } from './actions';

// Initial state of the AppContext
export const initialState = {
  settings: {
    // default theme; will be hydrated from localStorage if available
    theme: 'dark',
    // other settings can be added here (e.g., compactMode, notifications)
  },
  data: {
    metrics: null,   // placeholder for metrics data
    anomalies: null, // placeholder for anomalies data
    topology: null,  // placeholder for topology graph data
    cost: null,      // placeholder for cost/finops data
  },
};

/**
 * Root reducer for AppContext managing app-wide slices.
 * Handles:
 * - settings.theme with persistence handled in provider side effect
 * - data placeholders for metrics, anomalies, topology, cost
 */
export function appReducer(state = initialState, action) {
  switch (action.type) {
    case SET_THEME: {
      const nextTheme = action.payload || 'dark';
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: nextTheme,
        },
      };
    }

    case SET_METRICS: {
      return {
        ...state,
        data: {
          ...state.data,
          metrics: action.payload ?? null,
        },
      };
    }

    case SET_ANOMALIES: {
      return {
        ...state,
        data: {
          ...state.data,
          anomalies: action.payload ?? null,
        },
      };
    }

    case SET_TOPOLOGY: {
      return {
        ...state,
        data: {
          ...state.data,
          topology: action.payload ?? null,
        },
      };
    }

    case SET_COST: {
      return {
        ...state,
        data: {
          ...state.data,
          cost: action.payload ?? null,
        },
      };
    }

    default:
      return state;
  }
}
