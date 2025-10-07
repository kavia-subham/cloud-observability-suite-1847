import React from 'react';

/**
 * PUBLIC_INTERFACE
 * NotificationsSection
 * A simplified notifications preferences section reverting to prior structure.
 */
const NotificationsSection = ({ value = {}, onChange = () => {} }) => {
  const { email = true, sms = false, push = true } = value;

  const toggle = (field) => {
    onChange({ ...value, [field]: !value[field] });
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!email} onChange={() => toggle('email')} />
          Email alerts
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!sms} onChange={() => toggle('sms')} />
          SMS alerts
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!push} onChange={() => toggle('push')} />
          Push notifications
        </label>
      </div>
    </div>
  );
};

export default NotificationsSection;
