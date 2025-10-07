import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { appReducer, initialState } from './reducers';
import { actions } from './actions';

/**
 * AppContext provides global state for the application including:
 * - settings (theme, profile, notification preferences) with localStorage persistence
 * - data placeholders for metrics, anomalies, topology, and cost
 */

// Create the context
const AppContext = createContext(null);

// PUBLIC_INTERFACE
export const useAppContext = () => {
  /** Hook to access global app context which returns { state, dispatch, actions }. */
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
};

// PUBLIC_INTERFACE
export const AppProvider = ({ children }) => {
  /**
   * Provider that initializes app-wide state using a reducer and persists settings.
   * It exposes state, dispatch, and bound action helpers.
   */
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    // Initialize state and hydrate settings from localStorage if present
    try {
      const storedTheme = window.localStorage.getItem('app.theme') || window.localStorage.getItem('app_theme');
      const storedProfile = window.localStorage.getItem('app.profile');
      const storedNotifications = window.localStorage.getItem('app.notifications');

      return {
        ...initialState,
        settings: {
          ...initialState.settings,
          theme: storedTheme || initialState.settings.theme,
          profile: storedProfile ? { ...initialState.settings.profile, ...JSON.parse(storedProfile) } : initialState.settings.profile,
          notifications: storedNotifications
            ? {
                ...initialState.settings.notifications,
                ...JSON.parse(storedNotifications),
                channels: {
                  ...initialState.settings.notifications.channels,
                  ...(JSON.parse(storedNotifications)?.channels || {}),
                },
              }
            : initialState.settings.notifications,
        },
      };
    } catch (e) {
      // In environments without localStorage or on error, fall back to defaults
      return initialState;
    }
  });

  // Apply theme to documentElement as [data-theme] attribute and persist to localStorage
  useEffect(() => {
    const currentTheme = state.settings?.theme || 'dark';
    try {
      document?.documentElement?.setAttribute('data-theme', currentTheme);
      window?.localStorage?.setItem('app.theme', currentTheme);
      window?.localStorage?.setItem('app_theme', currentTheme); // maintain backward compatibility
    } catch (e) {
      // ignore persistence failures
    }
  }, [state.settings?.theme]);

  // Persist profile
  useEffect(() => {
    try {
      window?.localStorage?.setItem('app.profile', JSON.stringify(state.settings?.profile || {}));
    } catch {}
  }, [state.settings?.profile]);

  // Persist notifications
  useEffect(() => {
    try {
      window?.localStorage?.setItem('app.notifications', JSON.stringify(state.settings?.notifications || {}));
    } catch {}
  }, [state.settings?.notifications]);

  // Bind actions to dispatch for ergonomic usage in components
  const boundActions = useMemo(() => {
    return {
      ...actions,
    };
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, actions: boundActions }),
    [state, boundActions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
