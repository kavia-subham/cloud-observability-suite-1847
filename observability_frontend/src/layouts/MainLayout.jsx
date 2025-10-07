import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function MainLayout({ title, children }) {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 p-4 border-r border-gray-800 sidebar" aria-label="Primary">
        <div className="mb-6 text-xl font-bold">Observability</div>
        <nav className="space-y-2">
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/')}`} to="/">
            Dashboard
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/topology')}`} to="/topology">
            Topology
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/functions')}`} to="/functions">
            Functions
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/alerts')}`} to="/alerts">
            Alerts
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/cost')}`} to="/cost">
            Cost
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/security')}`} to="/security">
            Security
          </Link>
          <Link className={`nav-item block hover:bg-gray-800 ${isActive('/settings')}`} to="/settings">
            Settings
          </Link>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="page-toolbar border-b border-gray-800" role="region" aria-label="Page toolbar">
          <button className="chip bg-gray-800">Prod</button>
          <button className="chip bg-gray-800">EU-West</button>
          <input
            className="input"
            type="search"
            placeholder="Search"
            aria-label="Search solutions, logs, metrics"
          />
          <div className="toolbar-spacer" />
          <button className="btn-primary">New Dashboard</button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
