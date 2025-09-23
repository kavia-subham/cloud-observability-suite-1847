import React, { useMemo, useState } from 'react';
import {
  ProfileSection,
  ThemeToggleSection,
  NotificationsSection,
} from '../components';

/**
 * Settings page container that composes profile, theme, and notifications sections with
 * a polished Ocean Professional UI. Uses mock data with clear pathways to wire up real APIs.
 *
 * PUBLIC_INTERFACE
 */
export default function Settings() {
  // Mock initial data (easy to wire into APIs via onSave handlers)
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

  // Simple animated toast feedback state
  const [toast, setToast] = useState({ show: false, kind: 'success', msg: '' });
  const showToast = (msg, kind = 'success') => {
    setToast({ show: true, kind, msg });
    // Auto-dismiss after 2.4s
    window.clearTimeout(window.__settings_toast_timer);
    window.__settings_toast_timer = window.setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2400);
  };

  const handleProfileSave = (data) => {
    setProfileData(data);
    // Placeholder for API integration:
    // await api.updateProfile(data)
    // On success:
    showToast('Profile settings saved', 'success');
  };

  const handleThemeSave = (data) => {
    setThemeData(data);
    // Placeholder for API integration:
    // await api.saveTheme(data)
    showToast('Appearance updated', 'success');
  };

  const handleNotifSave = (data) => {
    setNotificationData(data);
    // Placeholder for API integration:
    // await api.saveNotificationPrefs(data)
    showToast('Notification preferences saved', 'success');
  };

  const bannerStyles = useMemo(
    () => ({
      base:
        'pointer-events-auto fixed top-6 right-6 z-50 rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-300 ' +
        (toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'),
      success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200 shadow-lg',
      info: 'bg-sky-500/15 border-sky-500/30 text-sky-200 shadow-lg',
      error: 'bg-red-500/15 border-red-500/30 text-red-200 shadow-lg',
    }),
    [toast.show]
  );

  return (
    <div className="relative p-6 text-white">
      {/* Page hero with Ocean gradient, icon and microcopy */}
      <header className="mb-8 rounded-2xl border border-[#374151] bg-gradient-to-br from-orange-500/10 via-[#111827] to-black p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
            <span role="img" aria-label="settings" className="text-2xl">⚙️</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-gray-300">
              Tune your profile, appearance, and alert preferences. Changes are saved locally for now and easily wire into APIs.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Hint label="Profile" text="Name, email, and organization." icon="👤" />
          <Hint label="Appearance" text="Theme and accent color." icon="🎨" />
          <Hint label="Notifications" text="Channels and frequency." icon="🔔" />
        </div>
      </header>

      {/* Two-column responsive grid layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProfileSection
            initialData={profileData}
            onSave={handleProfileSave}
            onCancel={() => showToast('Profile changes canceled', 'info')}
          />
          <NotificationsSection
            initialData={notificationData}
            onSave={handleNotifSave}
            onCancel={() => showToast('Notification changes canceled', 'info')}
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <ThemeToggleSection
            initialTheme={themeData}
            onSave={handleThemeSave}
            onCancel={() => showToast('Appearance changes canceled', 'info')}
          />

          {/* Integrations card with icon and microcopy */}
          <section className="w-full rounded-xl border border-[#374151] bg-[#1F2937] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="mb-2 flex items-center gap-2">
              <span aria-hidden className="text-lg">🔗</span>
              <h2 className="text-lg font-semibold text-white">Connected Integrations</h2>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Connect Slack, PagerDuty, or Email to receive alerts where your team works.
            </p>
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-lg border border-[#374151] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#111827]"
              onClick={() => showToast('Integrations modal coming soon', 'info')}
            >
              <span>Manage Integrations</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </section>
        </div>
      </div>

      {/* Animated toast/banner */}
      <div
        role="status"
        aria-live="polite"
        className={`${bannerStyles.base} ${
          toast.kind === 'error' ? bannerStyles.error : toast.kind === 'info' ? bannerStyles.info : bannerStyles.success
        }`}
      >
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-lg">
            {toast.kind === 'error' ? '⛔' : toast.kind === 'info' ? '💡' : '✅'}
          </span>
          <div className="text-sm">{toast.msg}</div>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast((t) => ({ ...t, show: false }))}
            className="ml-2 text-xs text-gray-300 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small helper to render a labeled hint item with an icon */
function Hint({ icon, label, text }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#374151] bg-[#0B1220] p-3">
      <span aria-hidden className="text-lg">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-400">{text}</div>
      </div>
    </div>
  );
}
