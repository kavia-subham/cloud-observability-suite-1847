import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import './styles/theme.css';
import AppRoutes from './routes';
import { AuthProvider } from './state/AuthContext';

// PUBLIC_INTERFACE
function App() {
  /**
   * Apply Ocean Professional theme globally.
   * Default to dark for bold, high-contrast aesthetic.
   */
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="h3">Ocean Professional</div>
        <div>
          <button className="btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Switch Dark' : 'Switch Light'}
          </button>
        </div>
      </header>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <main className="app-main">
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
