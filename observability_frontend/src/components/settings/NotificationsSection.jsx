import React, { useEffect, useState } from 'react';

/**
 * NotificationsSection allows user to configure notification preferences.
 * Uses mock data, toggles, and frequency select.
 *
 * PUBLIC_INTERFACE
 */
export default function NotificationsSection({ onSave, onCancel, initialData }) {
  /** This is a public component to be used on the Settings page. */
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    weeklySummary: true,
    frequency: 'realtime',
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs({
      email: initialData?.email ?? true,
      sms: initialData?.sms ?? false,
      push: initialData?.push ?? true,
      weeklySummary: initialData?.weeklySummary ?? true,
      frequency: initialData?.frequency ?? 'realtime',
    });
  }, [initialData]);

  const update = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Placeholder: Persist notification preferences
      // await api.saveNotificationPrefs(prefs)
      await new Promise((r) => setTimeout(r, 600));
      setDirty(false);
      onSave?.(prefs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save notifications:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setPrefs({
      email: initialData?.email ?? true,
      sms: initialData?.sms ?? false,
      push: initialData?.push ?? true,
      weeklySummary: initialData?.weeklySummary ?? true,
      frequency: initialData?.frequency ?? 'realtime',
    });
    setDirty(false);
  };

  return (
    <section className="w-full bg-[#1F2937] rounded-xl p-5 border border-[#374151]">
      <header className="mb-4">
        <h2 className="text-white text-lg font-semibold">Notifications</h2>
        <p className="text-gray-300 text-sm">
          Choose how you want to be notified about important events and anomalies.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Toggle
          id="notif-email"
          label="Email alerts"
          checked={prefs.email}
          onChange={(v) => update('email', v)}
        />
        <Toggle
          id="notif-sms"
          label="SMS alerts"
          checked={prefs.sms}
          onChange={(v) => update('sms', v)}
        />
        <Toggle
          id="notif-push"
          label="Push notifications"
          checked={prefs.push}
          onChange={(v) => update('push', v)}
        />
        <Toggle
          id="notif-weekly"
          label="Weekly summary"
          checked={prefs.weeklySummary}
          onChange={(v) => update('weeklySummary', v)}
        />

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm text-gray-200">Alert Frequency</span>
          <select
            className="bg-black text-white rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={prefs.frequency}
            onChange={(e) => update('frequency', e.target.value)}
          >
            <option value="realtime">Real-time</option>
            <option value="hourly">Hourly digest</option>
            <option value="daily">Daily summary</option>
          </select>
        </label>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${dirty ? 'bg-[#F97316] text-black hover:bg-[#fb8a3b]' : 'bg-[#374151] text-gray-400 cursor-not-allowed'}`}
          disabled={!dirty || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold border border-[#374151] text-white hover:bg-[#111827] transition-colors"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </section>
  );
}

function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 bg-black border border-[#374151] rounded-lg px-4 py-3">
      <span className="text-white">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-[#10B981]' : 'bg-[#374151]'}`}
      >
        <span
          className={`block h-4 w-4 bg-white rounded-full transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}
