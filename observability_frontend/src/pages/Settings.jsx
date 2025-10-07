import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { ProfileSection, NotificationsSection, ThemeToggleSection } from '../components/settings';

/**
 * PUBLIC_INTERFACE
 * Settings page
 * This page aggregates user settings sections:
 * - ProfileSection: editable user profile stub fields.
 * - NotificationsSection: alert/summary notification preferences with localStorage persistence.
 * - ThemeToggleSection: theme (light/dark/system) toggle integrated with AppContext.
 *
 * Accessibility:
 * - Sections are grouped with landmarks and headings.
 * - Form controls are labeled, keyboard navigable, and have visible focus styles.
 */
const Settings = () => {
  return (
    <MainLayout>
      <div className="min-h-full w-full bg-black text-white">
        <header className="px-6 pt-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Settings
          </h1>
          <p className="text-gray-300 mt-2">
            Personalize your experience. Update your profile, notifications, and theme preferences.
          </p>
        </header>

        <main className="px-6 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section aria-labelledby="profile-settings" className="xl:col-span-2">
            <div className="bg-gray-800/70 rounded-xl border border-gray-700/60 shadow-lg">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-orange-500/20 to-black rounded-t-xl">
                <h2 id="profile-settings" className="text-xl font-bold">Profile</h2>
                <p className="text-gray-300 mt-1">
                  Manage your basic account information used across the platform.
                </p>
              </div>
              <div className="p-5">
                <ProfileSection />
              </div>
            </div>
          </section>

          <section aria-labelledby="theme-settings" className="xl:col-span-1">
            <div className="bg-gray-800/70 rounded-xl border border-gray-700/60 shadow-lg">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-orange-500/20 to-black rounded-t-xl">
                <h2 id="theme-settings" className="text-xl font-bold">Appearance</h2>
                <p className="text-gray-300 mt-1">
                  Choose a theme to match your environment or system preferences.
                </p>
              </div>
              <div className="p-5">
                <ThemeToggleSection />
              </div>
            </div>
          </section>

          <section aria-labelledby="notification-settings" className="xl:col-span-3">
            <div className="bg-gray-800/70 rounded-xl border border-gray-700/60 shadow-lg">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-orange-500/20 to-black rounded-t-xl">
                <h2 id="notification-settings" className="text-xl font-bold">Notifications</h2>
                <p className="text-gray-300 mt-1">
                  Control alerts and summaries delivered to you across channels.
                </p>
              </div>
              <div className="p-5">
                <NotificationsSection />
              </div>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
};

export default Settings;
