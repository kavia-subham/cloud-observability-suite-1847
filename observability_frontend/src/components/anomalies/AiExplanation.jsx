import React from 'react';

/**
 * AiExplanation
 * Mock AI-generated explanation component with Ocean theme styling.
 * Accepts a prompt/context and renders a deterministic, friendly narrative.
 */
// PUBLIC_INTERFACE
export default function AiExplanation({
  title = 'AI Analysis',
  context = {},
  style: styleProp = {},
}) {
  const { id, service, metric = 'latency', severity = 'high', timeframe = 'last 15 minutes' } = context;

  const bullets = [
    `Service ${service || 'unknown'} shows ${metric} degradation ${timeframe}.`,
    'Downstream dependency variance detected causing tail latencies.',
    'Traffic burst aligns with deploy window; cold starts likely increased.',
    'Error budget burn accelerated in current SLO window.',
  ];

  const recommendations = [
    'Increase provisioned concurrency for critical functions during peak windows.',
    'Roll back last deployment or run canary with traffic splitting.',
    'Add circuit breaker retry policy for upstream API dependencies.',
    'Enable async I/O for data layer calls to reduce head-of-line blocking.',
  ];

  return (
    <div className="surface" style={{ ...styles.card, ...styleProp }} aria-live="polite">
      <div style={styles.header}>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span style={styles.badge} title="Mock AI output">Mock</span>
      </div>

      <div style={styles.body}>
        <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
          Generated summary for anomaly {id ? `#${id}` : ''} ({severity} severity):
        </p>
        <div style={styles.quote}>
          <span style={styles.quoteBar} />
          <p style={{ margin: 0 }}>
            Our analysis indicates that spikes in {metric} for {service || 'the service'} are primarily driven by
            dependency contention and cold starts following a recent traffic surge. The issue is transient but
            repeating at the top of the hour. Consider targeted scaling and a short rollback to validate improvements.
          </p>
        </div>

        <div style={styles.section}>
          <div className="h3" style={styles.sectionTitle}>Key Factors</div>
          <ul style={styles.list}>
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>

        <div style={styles.section}>
          <div className="h3" style={styles.sectionTitle}>Remediation Tips</div>
          <ul style={styles.list}>
            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-2)',
    background: 'var(--color-surface)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)',
  },
  badge: {
    background: 'var(--gradient-accent)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
  },
  body: {
    display: 'flex', flexDirection: 'column', gap: 'var(--space-5)',
  },
  quote: {
    position: 'relative',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.03)',
  },
  quoteBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    background: 'var(--color-secondary)',
    borderTopLeftRadius: 'var(--radius-md)',
    borderBottomLeftRadius: 'var(--radius-md)',
  },
  section: {},
  sectionTitle: { margin: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' },
  list: { margin: 0, paddingLeft: '1.2em', color: 'var(--color-text-muted)' },
};
