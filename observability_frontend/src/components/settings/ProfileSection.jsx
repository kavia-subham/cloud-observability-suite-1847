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
    <section className="w-full bg-[#1F2937] rounded-xl p-5 border border-[#374151]">
      <header className="mb-4">
        <h2 className="text-white text-lg font-semibold">Profile</h2>
        <p className="text-gray-300 text-sm">
          Manage your user information and contact details.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Full Name</span>
          <input
            type="text"
            className="bg-black text-white placeholder-gray-500 rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your full name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Email</span>
          <input
            type="email"
            className="bg-black text-white placeholder-gray-500 rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="name@company.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Title</span>
          <input
            type="text"
            className="bg-black text-white placeholder-gray-500 rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Role or position"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Organization</span>
          <input
            type="text"
            className="bg-black text-white placeholder-gray-500 rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={form.org}
            onChange={(e) => updateField('org', e.target.value)}
            placeholder="Company or team"
          />
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
