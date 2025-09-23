import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

/**
 * MainLayout
 * - Sidebar navigation (collapsible)
 * - Header with search and user profile
 * - Main content area rendering nested routes via <Outlet />
 *
 * Ocean Professional theme:
 * Uses CSS variables from styles/tokens.css for bold, high-contrast visuals.
 */
// PUBLIC_INTERFACE
export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/topology', label: 'Topology', icon: '🗺️' },
    { to: '/functions', label: 'Functions', icon: 'λ' },
    { to: '/alerts', label: 'Alerts', icon: '🚨' },
    { to: '/security', label: 'Security', icon: '🛡️' },
    { to: '/cost', label: 'Cost', icon: '💰' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.shell}>
      <aside style={{ ...styles.sidebar, width: collapsed ? 72 : 256 }}>
        <div style={styles.brand} className="app-header">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle navigation"
            style={styles.collapseBtn}
            title="Toggle sidebar"
          >
            {collapsed ? '»' : '«'}
          </button>
          {!collapsed && <div style={styles.brandText}>Cloud Observability</div>}
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                ...styles.navItem,
                ...(isActive(item.to) ? styles.navItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={item.label}
            >
              <span style={{ marginRight: collapsed ? 0 : 'var(--space-3)' }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button
            style={styles.outlineBtn}
            onClick={() => navigate('/login')}
            title="Sign in"
          >
            {!collapsed ? 'Sign in' : '🔐'}
          </button>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header} className="app-header">
          <div style={styles.searchWrap} className="surface app-surface-ring">
            <span role="img" aria-label="search" style={{ marginRight: 8 }}>
              🔎
            </span>
            <input
              placeholder="Search functions, traces, alerts..."
              style={styles.searchInput}
              aria-label="Search"
            />
          </div>
          <div style={styles.headerRight}>
            <button className="btn btn-outline" style={{ marginRight: 'var(--space-3)' }}>
              New Alert
            </button>
            <div style={styles.avatar} title="User profile">
              OP
            </div>
          </div>
        </header>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  sidebar: {
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition-base)',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-5)',
    borderBottom: '1px solid var(--color-border)',
    gap: 'var(--space-3)',
  },
  brandText: {
    fontWeight: 'var(--weight-extrabold)',
    letterSpacing: '-0.02em',
  },
  collapseBtn: {
    appearance: 'none',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-3)',
    gap: '4px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: '10px 12px',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'background var(--transition-fast), border var(--transition-fast), transform var(--transition-fast)',
  },
  navItemActive: {
    background: 'var(--gradient-primary)',
    border: '1px solid var(--color-border)',
    transform: 'translateY(-1px)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: 'var(--space-4)',
    borderTop: '1px solid var(--color-border)',
  },
  outlineBtn: {
    width: '100%',
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    cursor: 'pointer',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-6)',
    position: 'sticky',
    top: 0,
    zIndex: 5,
    background: 'var(--gradient-primary)',
    borderBottom: '1px solid var(--color-border)',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--elevation-1)',
    minWidth: 260,
  },
  searchInput: {
    appearance: 'none',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--color-text)',
    width: 320,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-primary)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--weight-bold)',
    boxShadow: 'var(--elevation-2)',
  },
  content: {
    padding: 'var(--space-6)',
  },
};
