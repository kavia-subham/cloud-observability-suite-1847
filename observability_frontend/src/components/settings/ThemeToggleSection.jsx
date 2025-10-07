import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../state/AppContext';

/**
 * PUBLIC_INTERFACE
 * ThemeToggleSection
 * Simple appearance control for theme: 'light' | 'dark' | 'system'
 * - Dispatches to AppContext with type 'SET_THEME'
 * - Persists to localStorage key 'app.theme'
 * - Applies data-theme attribute on documentElement for global styling hooks
 */
const ThemeToggleSection = () => {
  const { state, dispatch } = useAppContext();
  const initialTheme = state?.settings?.theme || 'dark';
  const [theme, setTheme] = useState(initialTheme);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('app.theme') || localStorage.getItem('app_theme');
      if (raw) {
        setTheme(raw);
        dispatch({ type: 'settings/SET_THEME', payload: raw });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateTheme = (value) => {
    setTheme(value);
    dispatch({ type: 'settings/SET_THEME', payload: value });
    try {
      localStorage.setItem('app.theme', value);
    } catch {}
  };

  return (
    <fieldset aria-labelledby="theme-legend">
      <legend id="theme-legend" className="text-lg font-semibold">Theme</legend>
      <div className="mt-3 grid grid-cols-1 gap-3">
        {['dark', 'light', 'system'].map((opt) => (
          <label key={opt} className="flex items-center gap-3">
            <input
              type="radio"
              name="theme"
              value={opt}
              checked={theme === opt}
              onChange={(e) => updateTheme(e.target.value)}
              className="h-5 w-5 border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <span className="capitalize text-gray-200">{opt}</span>
          </label>
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-2">
        System follows your OS color scheme. Dark is recommended for the Ocean Professional theme.
      </p>
    </fieldset>
  );
};

export default ThemeToggleSection;
