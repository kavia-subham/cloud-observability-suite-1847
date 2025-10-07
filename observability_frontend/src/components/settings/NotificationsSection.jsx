import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function NotificationsSection() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <div className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between">
        <span className="field-label">Email alerts</span>
        <input
          type="checkbox"
          role="switch"
          aria-checked={emailEnabled}
          aria-label="Toggle email alerts"
          checked={emailEnabled}
          onChange={() => setEmailEnabled(!emailEnabled)}
        />
      </div>
      <p className="field-hint">Get critical alerts via email.</p>

      <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
        <span className="field-label">SMS alerts</span>
        <input
          type="checkbox"
          role="switch"
          aria-checked={smsEnabled}
          aria-label="Toggle SMS alerts"
          checked={smsEnabled}
          onChange={() => setSmsEnabled(!smsEnabled)}
        />
      </div>
      <p className="field-hint">Receive SMS for high-priority incidents.</p>
    </div>
  );
}
