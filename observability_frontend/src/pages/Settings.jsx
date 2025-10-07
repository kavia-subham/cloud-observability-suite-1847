import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { ProfileSection, NotificationsSection, ThemeToggleSection } from '../components/settings';
import { UICard as Card, CardHeader, CardContent } from '../components';

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
            <Card>
              <CardHeader
                title="Profile"
                subtitle="Manage your basic account information used across the platform."
              />
              <CardContent>
                <ProfileSection />
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="theme-settings" className="xl:col-span-1">
            <Card>
              <CardHeader
                title="Appearance"
                subtitle="Choose a theme to match your environment or system preferences."
              />
              <CardContent>
                <ThemeToggleSection />
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="notification-settings" className="xl:col-span-3">
            <Card>
              <CardHeader
                title="Notifications"
                subtitle="Control alerts and summaries delivered to you across channels."
              />
              <CardContent>
                <NotificationsSection />
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  );
};

export default Settings;
