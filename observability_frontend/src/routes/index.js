import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

/**
 * Temporary, stubbed auth hook returning always-authenticated.
 * Replace with real Auth Context/Provider later.
 */
const useStubAuth = () => {
  const isAuthenticated = true;
  return { isAuthenticated };
};

// PUBLIC_INTERFACE
export const ProtectedRoute = ({ children }) => {
  /** Guard for private routes using stubbed auth state */
  const { isAuthenticated } = useStubAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PUBLIC_INTERFACE
export const PublicRoute = ({ children }) => {
  /** Guard for public-only routes: redirects authenticated users to home */
  const { isAuthenticated } = useStubAuth();
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
