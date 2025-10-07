import React, { useState } from 'react';
import ProfileSection from '../components/settings/ProfileSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import ThemeToggleSection from '../components/settings/ThemeToggleSection';

/**
 * Settings page with simple stacked sections (prior structure).
 * This version removes sticky headers/containers and complex wrappers,
 * reverting to a straightforward layout with an optional floating action button (FAB) for Save.
 */
const Settings = () => {
  const [profile, setProfile] = useState({});
  const [notifications, setNotifications] = useState({});
  const [theme, setTheme] = useState('system');

  const handleSave = () => {
    // Placeholder save handler to mimic prior behavior.
    // Integrations should be handled by each section or lifted state as needed.
    console.log('Saving settings', { profile, notifications, theme });
  };

  return (
    <div className="settings-page" style={{ padding: '16px' }}>
      <h1 style={{ marginBottom: 16 }}>Settings</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Profile</h2>
        <ProfileSection value={profile} onChange={setProfile} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Notifications</h2>
        <NotificationsSection value={notifications} onChange={setNotifications} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Theme</h2>
        <ThemeToggleSection value={theme} onChange={setTheme} />
      </section>

      {/* Basic FAB reintroduced for quick save */}
      <button
        aria-label="Save settings"
        onClick={handleSave}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          border: 'none',
          background: '#F97316',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 999,
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Save
      </button>
    </div>
  );
};

export default Settings;
