import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout
import MainLayout from '../layouts/MainLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Topology from '../pages/Topology';
import Functions from '../pages/Functions';
import Alerts from '../pages/Alerts';
import Security from '../pages/Security';
import Cost from '../pages/Cost';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import { useAuth } from '../state/AuthContext';

/**
 * Build a returnTo URL for redirecting to login with the originally requested path.
 */
function useReturnToQuery() {
  const location = useLocation();
  const pathname = location.pathname + (location.search || '') + (location.hash || '');
  const params = new URLSearchParams();
  params.set('returnTo', pathname);
  return `?${params.toString()}`;
}

// PUBLIC_INTERFACE
export const ProtectedRoute = ({ children }) => {
  /** Guard for private routes using AuthContext */
  const { isAuthenticated } = useAuth();
  const returnTo = useReturnToQuery();
  if (!isAuthenticated) {
    return <Navigate to={`/login${returnTo}`} replace />;
  }
  return children;
};

// PUBLIC_INTERFACE
export const PublicRoute = ({ children }) => {
  /** Guard for public-only routes: redirects authenticated users to home */
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// PUBLIC_INTERFACE
export default function AppRoutes() {
  /** Configure app routes with protected layout and public login route */
  return (
    <Routes>
      {/* Public route(s) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected app shell with nested routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/functions" element={<Functions />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/security" element={<Security />} />
        <Route path="/cost" element={<Cost />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
