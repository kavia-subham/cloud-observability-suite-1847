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
    <section className="w-full rounded-xl border border-[#374151] bg-[#1F2937] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30">
          <span aria-hidden className="text-lg">🎨</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Appearance</h2>
          <p className="text-sm text-gray-300">Switch theme and accent to suit your environment.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Theme</span>
          <select
            className="rounded-lg border border-[#374151] bg-black px-3 py-2 text-white outline-none transition focus:border-[#F97316] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)]"
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setDirty(true);
            }}
          >
            <option value="ocean-professional">Ocean Professional</option>
            <option value="system">System (Auto)</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-200">Accent</span>
          <div className="flex items-center gap-3">
            {[
              { key: 'orange', color: '#F97316', name: 'Orange' },
              { key: 'teal', color: '#10B981', name: 'Teal' },
              { key: 'red', color: '#EF4444', name: 'Red' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setAccent(opt.key);
                  setDirty(true);
                }}
                className={`group flex items-center gap-2 rounded-full border px-2 py-1 pr-3 transition-all hover:shadow ${
                  accent === opt.key ? 'border-white/70 bg-white/10' : 'border-transparent bg-black'
                }`}
                aria-label={`Select ${opt.name} accent`}
                title={opt.name}
              >
                <span
                  className="h-5 w-5 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: opt.color }}
                />
                <span className="text-xs text-gray-300">{opt.name}</span>
              </button>
            ))}
          </div>
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
          aria-label="Save appearance settings"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="rounded-lg border border-[#374151] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#111827]"
          onClick={handleCancel}
          aria-label="Cancel appearance changes"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
