import React from 'react';

// PUBLIC_INTERFACE
export default function Login() {
  return (
    <div className="container">
      <div className="surface" style={{ padding: 'var(--space-8)', marginTop: '10vh' }}>
        <h1 className="h2" style={{ marginTop: 0 }}>Sign in</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
          Access your observability workspace
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 420 }}>
            <input placeholder="Email" style={styles.input} />
            <input placeholder="Password" type="password" style={styles.input} />
            <button className="btn">Continue</button>
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
