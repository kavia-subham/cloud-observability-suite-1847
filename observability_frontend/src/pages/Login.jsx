import React, { useState } from 'react';
import { usePostLoginRedirect, useAuth } from '../state/AuthContext';

/**
 * Simple login page with mock authentication using AuthContext.
 * - On submit, calls login() and redirects back to originally requested route if available.
 */
// PUBLIC_INTERFACE
export default function Login() {
  const { login } = useAuth();
  const redirect = usePostLoginRedirect();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email || undefined, pwd || undefined);
      redirect();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="surface" style={{ padding: 'var(--space-8)', marginTop: '10vh' }}>
        <h1 className="h2" style={{ marginTop: 0 }}>Sign in</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
          Access your observability workspace
        </p>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 420 }}>
            <input
              placeholder="Email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <input
              placeholder="Password"
              type="password"
              style={styles.input}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  input: {
    appearance: 'none',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
  },
};
