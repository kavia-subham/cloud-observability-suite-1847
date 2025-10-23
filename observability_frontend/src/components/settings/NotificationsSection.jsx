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
    <section className="w-full rounded-xl border border-[#374151] bg-[#1F2937] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <span aria-hidden className="text-lg">🔔</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <p className="text-sm text-gray-300">
            Choose channels and frequency for anomaly and system alerts.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm text-gray-200">Alert Frequency</span>
          <select
            className="rounded-lg border border-[#374151] bg-black px-3 py-2 text-white outline-none transition focus:border-[#F97316] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)]"
            value={prefs.frequency}
            onChange={(e) => update('frequency', e.target.value)}
          >
            <option value="realtime">Real-time</option>
            <option value="hourly">Hourly digest</option>
            <option value="daily">Daily summary</option>
          </select>
          <span className="text-xs text-gray-400">
            Real-time sends immediate alerts. Digests bundle alerts to reduce noise.
          </span>
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className={`rounded-lg px-4 py-2 font-semibold shadow transition-all ${
            dirty
              ? 'bg-[#F97316] text-black hover:shadow-[0_6px_20px_rgba(249,115,22,0.35)] hover:bg-[#fb8a3b]'
              : 'bg-[#374151] text-gray-400 cursor-not-allowed'
          }`}
          disabled={!dirty || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="rounded-lg border border-[#374151] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#111827]"
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
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-4 rounded-lg border border-[#374151] bg-black px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden>•</span>
        <span className="text-white">{label}</span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`h-6 w-12 rounded-full p-1 transition-all ${
          checked ? 'bg-[#10B981]' : 'bg-[#374151]'
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
