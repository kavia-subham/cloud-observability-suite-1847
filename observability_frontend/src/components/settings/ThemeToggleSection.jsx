import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ThemeToggleSection
 * Simple theme toggle reverting to prior structure.
 */
const ThemeToggleSection = ({ value = 'system', onChange = () => {} }) => {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="radio"
          name="theme"
          value="light"
          checked={value === 'light'}
          onChange={() => onChange('light')}
        />
        Light
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="radio"
          name="theme"
          value="dark"
          checked={value === 'dark'}
          onChange={() => onChange('dark')}
        />
        Dark
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="radio"
          name="theme"
          value="system"
          checked={value === 'system'}
          onChange={() => onChange('system')}
        />
        System
      </label>
    </div>
  );
};

export default ThemeToggleSection;
