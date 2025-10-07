import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * AuthContext provides a minimal authentication state for route guards.
 * Uses localStorage to persist a boolean flag and a mock user object.
 * Replace with real authentication logic later (Step 16).
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Initialize auth state from localStorage; fallback to false.
   * We also keep a simple user object for potential header usage later.
   */
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auth:isAuthenticated') || 'false');
    } catch {
      return false;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('auth:isAuthenticated', JSON.stringify(isAuthenticated));
    } catch {
      // no-op
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth:user', JSON.stringify(user));
      else localStorage.removeItem('auth:user');
    } catch {
      // no-op
    }
  }, [user]);

  // Provide a mock login that sets auth true and stores a simple user
  const login = useCallback(async (email) => {
    setIsAuthenticated(true);
    setUser({ email: email || 'user@example.com', name: 'Observability User' });
    return true;
  }, []);

  // Clear auth state
  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
    return true;
  }, []);

  const value = useMemo(() => ({ isAuthenticated, user, login, logout }), [isAuthenticated, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function usePostLoginRedirect() {
  /**
   * Utility hook: after a successful login, navigate to the originally requested route
   * if present (returnTo query param), otherwise go to root.
   */
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');
    navigate(returnTo || '/', { replace: true });
  }, [location.search, navigate]);
}
