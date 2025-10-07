import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../state/AppContext';

/**
 * PUBLIC_INTERFACE
 * ProfileSection
 * Editable stub for user profile fields: fullName, title, timezone.
 * - Reads/writes to AppContext under state.profile
 * - Persists to localStorage key 'app.profile'
 */
const ProfileSection = () => {
  const { state, dispatch } = useAppContext();
  const [form, setForm] = useState({
    fullName: state?.profile?.fullName || '',
    title: state?.profile?.title || '',
    timezone: state?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem('app.profile');
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((f) => ({ ...f, ...saved }));
        dispatch({ type: 'SET_PROFILE', payload: saved });
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
  };

  const onSave = (e) => {
    e.preventDefault();
    // Prefer action creator if available
    if (typeof state === 'object') {
      dispatch({ type: 'settings/SET_PROFILE', payload: form });
    } else {
      dispatch({ type: 'SET_PROFILE', payload: form });
    }
    try {
      localStorage.setItem('app.profile', JSON.stringify(form));
    } catch {
      // storage might be disabled; silently ignore
    }
  };

  return (
    <form onSubmit={onSave} aria-describedby="profile-help">
      <div id="profile-help" className="sr-only">
        Update your profile fields and save your changes.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-300 mb-1">Full name</span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Jane Doe"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-300 mb-1">Title</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Staff SRE"
          />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-gray-300 mb-1">Timezone</span>
          <input
            type="text"
            name="timezone"
            value={form.timezone}
            onChange={(e) => updateField('timezone', e.target.value)}
            className="rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="UTC"
          />
        </label>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Save changes
        </button>
      </div>
    </form>
  );
};

export default ProfileSection;
