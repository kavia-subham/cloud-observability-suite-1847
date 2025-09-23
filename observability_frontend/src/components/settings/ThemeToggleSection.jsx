import React, { useEffect, useState } from 'react';

/**
 * ThemeToggleSection allows user to select theme preferences.
 * Uses mock data and exposes Save/Cancel with local state.
 *
 * PUBLIC_INTERFACE
 */
export default function ThemeToggleSection({ onSave, onCancel, initialTheme }) {
  /** This is a public component to be used on the Settings page. */
  const [theme, setTheme] = useState('ocean-professional');
  const [accent, setAccent] = useState('orange');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(initialTheme?.theme ?? 'ocean-professional');
    setAccent(initialTheme?.accent ?? 'orange');
  }, [initialTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Placeholder: Persist user theme preferences
      // await api.saveTheme({ theme, accent })
      await new Promise((r) => setTimeout(r, 500));
      setDirty(false);
      onSave?.({ theme, accent });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save theme:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setTheme(initialTheme?.theme ?? 'ocean-professional');
    setAccent(initialTheme?.accent ?? 'orange');
    setDirty(false);
  };

  return (
    <section className="w-full bg-[#1F2937] rounded-xl p-5 border border-[#374151]">
      <header className="mb-4">
        <h2 className="text-white text-lg font-semibold">Appearance</h2>
        <p className="text-gray-300 text-sm">
          Switch theme and customize accent color to match your preference.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Theme</span>
          <select
            className="bg-black text-white rounded-lg px-3 py-2 border border-[#374151] focus:border-[#F97316] focus:outline-none"
            value={theme}
            onChange={(e) => { setTheme(e.target.value); setDirty(true); }}
          >
            <option value="ocean-professional">Ocean Professional</option>
            <option value="system">System (Auto)</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Accent</span>
          <div className="flex gap-3 items-center">
            {[
              { key: 'orange', color: '#F97316' },
              { key: 'teal', color: '#10B981' },
              { key: 'red', color: '#EF4444' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => { setAccent(opt.key); setDirty(true); }}
                className={`w-9 h-9 rounded-full border-2 transition-transform ${accent === opt.key ? 'scale-110 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: opt.color }}
                aria-label={`Select ${opt.key} accent`}
              />
            ))}
          </div>
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
