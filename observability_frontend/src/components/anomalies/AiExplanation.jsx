import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * AiExplanation renders a natural language explanation (mock-driven) for the anomaly.
 */
function AiExplanation({ anomaly }) {
  const text = useMemo(() => {
    if (!anomaly) {
      return 'Select an anomaly to view AI explanation.';
    }
    const sev = String(anomaly.severity || 'unknown').toLowerCase();
    const subject = anomaly.service || anomaly.function || anomaly.resource || 'your workload';
    const location = anomaly.region || anomaly.zone || 'the current region';
    const score = typeof anomaly.score === 'number' ? Math.round(anomaly.score) : null;

    const intro = `The system detected a ${sev} anomaly affecting ${subject} in ${location}.`;
    const scoreLine = score !== null ? ` Confidence score is ${score} based on correlated telemetry.` : '';
    const signals = Array.isArray(anomaly.signals) && anomaly.signals.length
      ? ` Signals indicate ${anomaly.signals.slice(0, 3).map(s => s.metric || s.name).filter(Boolean).join(', ')}`
      : '';
    const cause = Array.isArray(anomaly.rootCauses) && anomaly.rootCauses.length
      ? ` with probable root cause: ${anomaly.rootCauses[0].factor} (${anomaly.rootCauses[0].confidence || '—'}% confidence).`
      : '.';
    const rec = anomaly.recommendation
      ? ` Recommended action: ${anomaly.recommendation}`
      : ' Consider reviewing recent deployments, configuration changes, and downstream dependencies.';

    return `${intro}${scoreLine}${signals}${cause} ${rec}`;
  }, [anomaly]);

  return (
    <div className="p-4">
      <p className="text-sm text-gray-200">{text}</p>
    </div>
  );
}

AiExplanation.propTypes = {
  anomaly: PropTypes.object,
};

export default AiExplanation;
