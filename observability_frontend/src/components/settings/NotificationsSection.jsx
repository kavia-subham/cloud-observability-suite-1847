import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../state/AppContext';

/**
 * PUBLIC_INTERFACE
 * NotificationsSection
 * Manages notification preferences:
 * - alertsEnabled: boolean
 * - weeklySummary: boolean
 * - channels: email, sms, inApp
 * Persists to localStorage key 'app.notifications'
 */
const NotificationsSection = () => {
  const { state, dispatch } = useAppContext();
  const [prefs, setPrefs] = useState({
    alertsEnabled: state?.notifications?.alertsEnabled ?? true,
    weeklySummary: state?.notifications?.weeklySummary ?? true,
    channels: {
      email: state?.notifications?.channels?.email ?? true,
      sms: state?.notifications?.channels?.sms ?? false,
      inApp: state?.notifications?.channels?.inApp ?? true,
    },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app.notifications');
      if (raw) {
        const saved = JSON.parse(raw);
        setPrefs((p) => ({ ...p, ...saved, channels: { ...p.channels, ...saved.channels } }));
        dispatch({ type: 'settings/SET_NOTIFICATIONS', payload: saved });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBool = (key) => (e) => {
    const updated = { ...prefs, [key]: e.target.checked };
    setPrefs(updated);
    dispatch({ type: 'settings/SET_NOTIFICATIONS', payload: updated });
    try {
      localStorage.setItem('app.notifications', JSON.stringify(updated));
    } catch {}
  };

  const updateChannel = (channel) => (e) => {
    const updated = { ...prefs, channels: { ...prefs.channels, [channel]: e.target.checked } };
    setPrefs(updated);
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updated });
    try {
      localStorage.setItem('app.notifications', JSON.stringify(updated));
    } catch {}
  };

  return (
    <form aria-labelledby="notif-form-title">
      <h3 id="notif-form-title" className="sr-only">Notification Preferences</h3>

      <fieldset className="mb-6">
        <legend className="text-lg font-semibold">General</legend>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.alertsEnabled}
              onChange={updateBool('alertsEnabled')}
              className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
              aria-describedby="alerts-enabled-help"
            />
            <span className="text-gray-200">Enable real-time alerts</span>
          </label>
          <div id="alerts-enabled-help" className="text-gray-400 text-sm ml-8">
            Receive instant notifications for critical anomalies and SLO breaches.
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.weeklySummary}
              onChange={updateBool('weeklySummary')}
              className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-200">Weekly email summary</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-semibold">Channels</legend>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.channels.email}
              onChange={updateChannel('email')}
              className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-200">Email</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.channels.sms}
              onChange={updateChannel('sms')}
              className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-200">SMS</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.channels.inApp}
              onChange={updateChannel('inApp')}
              className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-200">In-app</span>
          </label>
        </div>
      </fieldset>
    </form>
  );
};

export default NotificationsSection;
