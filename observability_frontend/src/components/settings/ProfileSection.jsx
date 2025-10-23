import React, { useEffect, useState } from 'react';

/**
 * ProfileSection component for editing user profile details.
 * Uses mock data and exposes Save/Cancel with local state.
 *
 * PUBLIC_INTERFACE
 */
export default function ProfileSection({ onSave, onCancel, initialData }) {
  /** This is a public component to be used on the Settings page. */
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    org: '',
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Initialize with mock or provided data
  useEffect(() => {
    setForm({
      name: initialData?.name ?? 'Alex Johnson',
      email: initialData?.email ?? 'alex.johnson@example.com',
      title: initialData?.title ?? 'Senior Platform Engineer',
      org: initialData?.org ?? 'Acme Corp',
    });
  }, [initialData]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Placeholder: Replace with API call to update profile
      // await api.updateProfile(form)
      await new Promise((r) => setTimeout(r, 600));
      setDirty(false);
      onSave?.(form);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setDirty(false);
    // Reset to initial
    setForm({
      name: initialData?.name ?? 'Alex Johnson',
      email: initialData?.email ?? 'alex.johnson@example.com',
      title: initialData?.title ?? 'Senior Platform Engineer',
      org: initialData?.org ?? 'Acme Corp',
    });
  };

  return (
    <section className="w-full rounded-xl border border-[#374151] bg-[#1F2937] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-500/30">
          <span aria-hidden className="text-lg">👤</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <p className="text-sm text-gray-300">
            Keep your personal details up to date for accurate notifications and access.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Full Name"
          placeholder="Your full name"
          value={form.name}
          onChange={(v) => updateField('name', v)}
        />
        <Field
          type="email"
          label="Email"
          placeholder="name@company.com"
          value={form.email}
          onChange={(v) => updateField('email', v)}
          helper="Used for account recovery and notifications."
        />
        <Field
          label="Title"
          placeholder="Role or position"
          value={form.title}
          onChange={(v) => updateField('title', v)}
        />
        <Field
          label="Organization"
          placeholder="Company or team"
          value={form.org}
          onChange={(v) => updateField('org', v)}
        />
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

function Field({ label, helper, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-gray-200">{label}</span>
      <input
        type={type}
        className="rounded-lg border border-[#374151] bg-black px-3 py-2 text-white outline-none transition focus:border-[#F97316] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)] placeholder:text-gray-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {helper ? <span className="text-xs text-gray-400">{helper}</span> : null}
    </label>
  );
}
