import React, { useState } from 'react';
import {
  ProfileSection,
  ThemeToggleSection,
  NotificationsSection,
} from '../components';

/**
 * Settings page container that composes profile, theme, and notifications sections.
 * Uses mock data and controls global save alerts (console) for now.
 *
 * PUBLIC_INTERFACE
 */
export default function Settings() {
  // Mock initial data
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    title: 'Senior Platform Engineer',
    org: 'Acme Corp',
  });
  const [themeData, setThemeData] = useState({
    theme: 'ocean-professional',
    accent: 'orange',
  });
  const [notificationData, setNotificationData] = useState({
    email: true,
    sms: false,
    push: true,
    weeklySummary: true,
    frequency: 'realtime',
  });

  const handleProfileSave = (data) => {
    setProfileData(data);
    // Placeholder: connect to user profile API
    // api.updateProfile(data)
    // eslint-disable-next-line no-console
    console.log('Profile saved', data);
  };

  const handleThemeSave = (data) => {
    setThemeData(data);
    // Placeholder: connect to theme/preferences API or context
    // api.saveTheme(data)
    // eslint-disable-next-line no-console
    console.log('Theme saved', data);
  };

  const handleNotifSave = (data) => {
    setNotificationData(data);
    // Placeholder: connect to notifications API
    // api.saveNotificationPrefs(data)
    // eslint-disable-next-line no-console
    console.log('Notifications saved', data);
  };

  return (
    <div className="p-6 text-white">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-300">
          Manage your profile, appearance, and notifications.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <ProfileSection
            initialData={profileData}
            onSave={handleProfileSave}
            onCancel={() => {
              // eslint-disable-next-line no-console
              console.log('Profile changes canceled');
            }}
          />
          <NotificationsSection
            initialData={notificationData}
            onSave={handleNotifSave}
            onCancel={() => {
              // eslint-disable-next-line no-console
              console.log('Notification changes canceled');
            }}
          />
        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <ThemeToggleSection
            initialTheme={themeData}
            onSave={handleThemeSave}
            onCancel={() => {
              // eslint-disable-next-line no-console
              console.log('Theme changes canceled');
            }}
          />

          <section className="w-full bg-[#1F2937] rounded-xl p-5 border border-[#374151]">
            <h2 className="text-white text-lg font-semibold mb-2">Connected Integrations</h2>
            <p className="text-gray-300 text-sm mb-3">
              Placeholder for integration management (e.g., Slack, PagerDuty, Email).
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold border border-[#374151] text-white hover:bg-[#111827] transition-colors"
              onClick={() => {
                // Placeholder: open integration modal
                // eslint-disable-next-line no-console
                console.log('Open integrations modal');
              }}
            >
              Manage Integrations
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
