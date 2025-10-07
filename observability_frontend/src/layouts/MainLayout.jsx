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

  const navItems = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/topology', label: 'Topology', icon: '🗺️' },
    { to: '/functions', label: 'Functions', icon: 'λ' },
    { to: '/alerts', label: 'Alerts', icon: '🚨' },
    { to: '/security', label: 'Security', icon: '🛡️' },
    { to: '/cost', label: 'Cost', icon: '💰' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
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
            {isMobile ? (mobileOpen ? '✕' : '☰') : collapsed ? '»' : '«'}
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
                <span aria-hidden="true" style={{ marginRight: (!isMobile && collapsed) ? 0 : 'var(--space-3)' }}>
                  {item.icon}
                </span>
                {(!isMobile && !collapsed) || isMobile ? <span>{item.label}</span> : null}
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
              {(!isMobile && !collapsed) || isMobile ? 'Sign out' : '🔓'}
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
              {(!isMobile && !collapsed) || isMobile ? 'Sign in' : '🔐'}
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
              {isMobile ? (mobileOpen ? '✕' : '☰') : collapsed ? '»' : '«'}
            </button>

            <div style={styles.searchWrap} className="surface app-surface-ring" role="search">
              <span aria-hidden="true" style={{ marginRight: 8 }}>🔎</span>
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
