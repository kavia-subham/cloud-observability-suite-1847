import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * MainLayout
 * Minimal main layout structure reverting toolbar alignment and aria-label changes.
 */
const MainLayout = () => {
  return (
    <div className="main-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#111827', borderRight: '1px solid #1f2937', padding: '16px 12px' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>
          <Link to="/" style={{ color: '#fff' }}>Observability</Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/topology">Topology</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          <NavLink to="/functions">Functions</NavLink>
          <NavLink to="/security">Security</NavLink>
          <NavLink to="/cost">Cost</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </aside>

      <div>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1f2937' }}>
          <div>
            <input
              type="text"
              placeholder="Search"
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#e5e7eb', width: 280 }}
            />
          </div>
          <div>
            <Link to="/profile" style={{ color: '#e5e7eb' }}>Profile</Link>
          </div>
        </header>

        <main style={{ padding: 16 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
