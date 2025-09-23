import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Topology from '../pages/Topology';
import Functions from '../pages/Functions';
import Alerts from '../pages/Alerts';
import Security from '../pages/Security';
import Cost from '../pages/Cost';
import Settings from '../pages/Settings';
import Login from '../pages/Login';

// PUBLIC_INTERFACE
export default function RoutesIndex() {
  /** Configure all primary routes using React Router v6 */
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/functions" element={<Functions />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/security" element={<Security />} />
        <Route path="/cost" element={<Cost />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
