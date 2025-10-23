import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { appReducer, initialState } from './reducers';
import { actions } from './actions';

/**
 * AppContext provides global state for the application including:
 * - settings (theme and other UI preferences) with localStorage persistence
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
   * Provider that initializes app-wide state using a reducer and persists theme.
   * It exposes state, dispatch, and bound action helpers.
   */
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    // Initialize state and hydrate theme from localStorage if present
    try {
      const storedTheme = window.localStorage.getItem('app_theme');
      if (storedTheme) {
        return {
          ...initialState,
          settings: {
            ...initialState.settings,
            theme: storedTheme,
          },
        };
      }
    } catch (e) {
      // In environments without localStorage or on error, fall back to defaults
    }
    return initialState;
  });

  // Apply theme to documentElement as [data-theme] attribute and persist to localStorage
  useEffect(() => {
    const currentTheme = state.settings?.theme || 'dark';
    try {
      document?.documentElement?.setAttribute('data-theme', currentTheme);
      window?.localStorage?.setItem('app_theme', currentTheme);
    } catch (e) {
      // ignore persistence failures
    }
  }, [state.settings?.theme]);

  // Bind actions to dispatch for ergonomic usage in components
  const boundActions = useMemo(() => {
    return {
      ...actions,
      // Convenience helpers can be added here if desired
    };
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, actions: boundActions }),
    [state, boundActions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
