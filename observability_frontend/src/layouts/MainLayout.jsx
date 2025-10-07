import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

/**
 * MainLayout
 * - Sidebar navigation (collapsible with persistence and mobile overlay)
 * - Header with search (placeholder) and user menu stub
 * - Main content area rendering nested routes via <Outlet />
 * - Keyboard accessibility: Esc to close mobile sidebar, Enter/Space on toggle
 *
 * Ocean Professional theme:
 * Uses CSS variables from styles/tokens.css for bold, high-contrast visuals.
 */
// PUBLIC_INTERFACE
export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // Persistent sidebar collapsed state (desktop)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Mobile sidebar open state (overlay)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track viewport width for responsive behavior
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 960px)');
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    } catch {
      /* no-op */
    }
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  // Inline SVG icons (lightweight, no deps)
  const Icon = {
    dashboard: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zM13 3v6h8V3h-8z" />
      </svg>
    ),
    topology: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M10 3h4v4h-4V3zM4 17h4v4H4v-4zm12 0h4v4h-4v-4zM7 10h10v2H7v-2zm3 2v3H8v-3h2zm6 0v3h-2v-3h2z" />
      </svg>
    ),
    functions: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M7 4h10v2H9l4 6-4 6h8v2H7l5-8L7 4z" />
      </svg>
    ),
    alerts: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v5h2v-5z" />
      </svg>
    ),
    security: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M12 2l7 4v6c0 5-3.8 9.7-7 10-3.2-.3-7-5-7-10V6l7-4z" />
      </svg>
    ),
    cost: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M12 1a11 11 0 100 22 11 11 0 000-22zm1 17.9V20h-2v-1.9a4.5 4.5 0 01-3-1.8l1.7-1a2.7 2.7 0 002.3 1.2c1.1 0 1.9-.5 1.9-1.2 0-.6-.5-1-1.8-1.3l-1-.2c-2-.5-3-1.4-3-3.1 0-1.7 1.4-2.9 3.3-3.2V4h2v1.5c1.3.2 2.3.9 3 1.9l-1.6 1a2.6 2.6 0 00-2.2-1.1c-1.1 0-1.8.5-1.8 1.1 0 .6.5 1 1.9 1.3l.9.2c2.1.5 3.1 1.4 3.1 3.1 0 1.8-1.4 3.1-3.4 3.4z" />
      </svg>
    ),
    settings: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M19.14 12.94a7.97 7.97 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.9 7.9 0 00-1.63-.95l-.36-2.54a.5.5 0 00-.5-.43h-3.84a.5.5 0 00-.5.43l-.36 2.54c-.57.23-1.12.54-1.63.95l-2.39-.96a.5.5 0 00-.6.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58c-.05.31-.08.63-.08.94s.03.63.08.94L2.82 14.5a.5.5 0 00-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.51.4 1.06.72 1.63.95l.36 2.54c.05.24.26.43.5.43h3.84c.24 0 .45-.19.5-.43l.36-2.54c.57-.23 1.12-.54 1.63-.95l2.39.96c.21.08.47 0 .6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
      </svg>
    ),
    signout: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M10 17l1.4-1.4L9.8 14H20v-2H9.8l1.6-1.6L10 9l-4 4 4 4zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4V5z" />
      </svg>
    ),
    signin: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M14 7l-1.4 1.4L13.2 10H4v2h9.2l-1.6 1.6L14 15l4-4-4-4zM20 19h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2h-8v2h8v14z" />
      </svg>
    ),
    menu: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
      </svg>
    ),
    close: (props) => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
        <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z" />
      </svg>
    ),
    chevrons: {
      left: (props) => (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
          <path fill="currentColor" d="M11.41 7.41L10 6l-6 6 6 6 1.41-1.41L6.83 12l4.58-4.59zM20 6l-6 6 6 6 1.41-1.41L16.83 12l4.58-4.59L20 6z" />
        </svg>
      ),
      right: (props) => (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
          <path fill="currentColor" d="M12.59 16.59L14 18l6-6-6-6-1.41 1.41L17.17 12l-4.58 4.59zM3 18l6-6-6-6-1.41 1.41L6.83 12l-4.58 4.59L3 18z" />
        </svg>
      ),
    },
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Icon.dashboard /> },
    { to: '/topology', label: 'Topology', icon: <Icon.topology /> },
    { to: '/functions', label: 'Functions', icon: <Icon.functions /> },
    { to: '/alerts', label: 'Alerts', icon: <Icon.alerts /> },
    { to: '/security', label: 'Security', icon: <Icon.security /> },
    { to: '/cost', label: 'Cost', icon: <Icon.cost /> },
    { to: '/settings', label: 'Settings', icon: <Icon.settings /> },
  ];

  const isActive = (path) => location.pathname === path;

  // Refs for focus management
  const toggleBtnRef = useRef(null);
  const sidebarRef = useRef(null);

  const onToggleClick = () => {
    if (isMobile) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  };

  // Keyboard support for toggle button
  const onToggleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleClick();
    }
    if (e.key === 'Escape' && isMobile) {
      setMobileOpen(false);
      toggleBtnRef.current?.focus();
    }
  };

  // Close mobile sidebar with ESC when focus is inside
  const onSidebarKeyDown = (e) => {
    if (e.key === 'Escape' && isMobile) {
      setMobileOpen(false);
      toggleBtnRef.current?.focus();
    }
  };

  // Overlay click closes in mobile
  const onOverlayClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const computedSidebarWidth = collapsed && !isMobile ? 72 : 256;

  return (
    <div style={styles.shell}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={onOverlayClick}
          aria-hidden="true"
          style={styles.overlay}
        />
      )}

      <aside
        ref={sidebarRef}
        style={{
          ...styles.sidebar,
          width: isMobile ? 280 : computedSidebarWidth,
          transform: isMobile
            ? mobileOpen
              ? 'translateX(0)'
              : 'translateX(-100%)'
            : 'translateX(0)',
          position: isMobile ? 'fixed' : 'sticky',
          left: 0,
        }}
        aria-label="Primary"
        aria-expanded={isMobile ? mobileOpen : !collapsed}
        onKeyDown={onSidebarKeyDown}
      >
        <div style={styles.brand} className="app-header">
          <button
            ref={toggleBtnRef}
            onClick={onToggleClick}
            onKeyDown={onToggleKeyDown}
            aria-label={isMobile ? (mobileOpen ? 'Close menu' : 'Open menu') : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
            aria-pressed={isMobile ? mobileOpen : !collapsed}
            style={styles.collapseBtn}
            title={isMobile ? 'Menu' : 'Toggle sidebar'}
          >
            {isMobile ? (mobileOpen ? <Icon.close /> : <Icon.menu />) : collapsed ? <Icon.chevrons.right /> : <Icon.chevrons.left />}
          </button>
          {!isMobile && !collapsed && <div style={styles.brandText}>Cloud Observability</div>}
          {isMobile && <div style={styles.brandText}>Menu</div>}
        </div>

        <nav style={styles.nav} role="navigation" aria-label="Main">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                  justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
                }}
                title={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span aria-hidden="true" style={{ marginRight: (!isMobile && collapsed) ? 0 : 'var(--space-3)', display: 'inline-flex' }}>
                  {item.icon}
                </span>
                {((!isMobile && !collapsed) || isMobile) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          {isAuthenticated ? (
            <button
              style={styles.outlineBtn}
              onClick={async () => {
                await logout();
                const returnTo = location.pathname + (location.search || '') + (location.hash || '');
                navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
              }}
              title="Sign out"
              aria-label="Sign out"
            >
              <span aria-hidden="true" style={{ marginRight: 'var(--space-2)', display: 'inline-flex' }}><Icon.signout /></span>
              {((!isMobile && !collapsed) || isMobile) && 'Sign out'}
            </button>
          ) : (
            <button
              style={styles.outlineBtn}
              onClick={() => {
                const returnTo = location.pathname + (location.search || '') + (location.hash || '');
                navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
              }}
              title="Sign in"
              aria-label="Sign in"
            >
              <span aria-hidden="true" style={{ marginRight: 'var(--space-2)', display: 'inline-flex' }}><Icon.signin /></span>
              {((!isMobile && !collapsed) || isMobile) && 'Sign in'}
            </button>
          )}
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header} className="app-header">
          <div style={styles.leftHeaderGroup}>
            {/* Mobile menu button duplicate for easy access when sidebar closed */}
            <button
              onClick={onToggleClick}
              onKeyDown={onToggleKeyDown}
              aria-label={isMobile ? (mobileOpen ? 'Close menu' : 'Open menu') : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              aria-pressed={isMobile ? mobileOpen : !collapsed}
              style={{ ...styles.collapseBtn, marginRight: 'var(--space-3)' }}
              className="btn-outline"
            >
              {isMobile ? (mobileOpen ? <Icon.close /> : <Icon.menu />) : collapsed ? <Icon.chevrons.right /> : <Icon.chevrons.left />}
            </button>

            <div style={styles.searchWrap} className="surface app-surface-ring" role="search">
              <span aria-hidden="true" style={{ marginRight: 8, display: 'inline-flex' }}>
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zM9.5 14A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/></svg>
              </span>
              <input
                placeholder="Search functions, traces, alerts..."
                style={styles.searchInput}
                aria-label="Search"
              />
            </div>
          </div>

          <div style={styles.headerRight} role="group" aria-label="User actions">
            <button className="btn btn-outline" style={{ marginRight: 'var(--space-3)' }}>
              New Alert
            </button>

            {/* User menu stub */}
            <button
              style={styles.avatarButton}
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Open user menu"
              title="User profile"
            >
              <div style={styles.avatar}>OP</div>
            </button>
          </div>
        </header>

        <main style={styles.content} role="main">
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
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(2px)',
    zIndex: 8,
  },
  sidebar: {
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform var(--transition-base), width var(--transition-base)',
    top: 0,
    height: '100vh',
    zIndex: 9,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
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
  leftHeaderGroup: {
    display: 'flex',
    alignItems: 'center',
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
    minWidth: 200,
  },
  searchInput: {
    appearance: 'none',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--color-text)',
    width: 260,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarButton: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
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
