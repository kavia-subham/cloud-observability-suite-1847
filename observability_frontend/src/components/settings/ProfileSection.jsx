import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ProfileSection
 * A simple profile editor with minimal markup, reverting to the prior structure.
 */
const ProfileSection = ({ value = {}, onChange = () => {} }) => {
  const { name = '', email = '' } = value;

  const update = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => update('name', e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background: '#111827', color: '#e5e7eb' }}
            placeholder="Your full name"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => update('email', e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background: '#111827', color: '#e5e7eb' }}
            placeholder="you@example.com"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
