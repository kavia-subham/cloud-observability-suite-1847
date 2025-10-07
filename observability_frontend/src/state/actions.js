////
// Action constants and creators for global AppContext
////

// Settings slice
export const SET_THEME = 'settings/SET_THEME';
export const SET_PROFILE = 'settings/SET_PROFILE';
export const SET_NOTIFICATIONS = 'settings/SET_NOTIFICATIONS';

// Data placeholder slices
export const SET_METRICS = 'data/SET_METRICS';
export const SET_ANOMALIES = 'data/SET_ANOMALIES';
export const SET_TOPOLOGY = 'data/SET_TOPOLOGY';
export const SET_COST = 'data/SET_COST';

// PUBLIC_INTERFACE
export const actions = {
  /** Set the current UI theme (e.g., 'dark' or 'light' or 'system'). */
  setTheme: (theme) => ({ type: SET_THEME, payload: theme }),

  /** Update user profile settings. */
  setProfile: (profile) => ({ type: SET_PROFILE, payload: profile }),

  /** Update notifications preferences. */
  setNotifications: (prefs) => ({ type: SET_NOTIFICATIONS, payload: prefs }),

  /** Replace metrics dataset. */
  setMetrics: (metrics) => ({ type: SET_METRICS, payload: metrics }),

  /** Replace anomalies dataset. */
  setAnomalies: (anomalies) => ({ type: SET_ANOMALIES, payload: anomalies }),

  /** Replace topology dataset (nodes, edges, etc.). */
  setTopology: (topology) => ({ type: SET_TOPOLOGY, payload: topology }),

  /** Replace cost dataset (summaries, breakdowns, etc.). */
  setCost: (cost) => ({ type: SET_COST, payload: cost }),
};
