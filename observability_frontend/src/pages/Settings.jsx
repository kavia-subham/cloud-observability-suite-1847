import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { ProfileSection, NotificationsSection, ThemeToggleSection } from '../components';
import '../styles/theme.css';

// PUBLIC_INTERFACE
export default function Settings() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: page-level save if wiring up later
    // Current components have their own save buttons; this provides a unified action bar.
    // eslint-disable-next-line no-console
    console.log('Save changes clicked');
  };

  return (
    <MainLayout title="Settings">
      <header className="page-header" role="banner" aria-label="Settings Header">
        <div className="settings-container">
          <h2 className="text-xl font-bold mb-2">Settings</h2>
          <p className="description">Manage your profile, notifications, and theme preferences.</p>
        </div>
      </header>
      <main role="main">
        <form onSubmit={handleSubmit}>
          <div className="settings-container">
            <section className="settings-section" aria-labelledby="profile-heading">
              <h3 id="profile-heading">Profile</h3>
              <ProfileSection />
            </section>

            <section className="settings-section" aria-labelledby="notifications-heading">
              <h3 id="notifications-heading">Notifications</h3>
              <NotificationsSection />
            </section>

            <section className="settings-section" aria-labelledby="theme-heading">
              <h3 id="theme-heading">Theme</h3>
              <ThemeToggleSection />
            </section>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" aria-label="Save settings changes">
                Save changes
              </button>
            </div>
          </div>
        </form>
      </main>
    </MainLayout>
  );
}
