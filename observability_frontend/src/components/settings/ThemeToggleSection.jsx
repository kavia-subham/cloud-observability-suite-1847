import React from 'react';

// PUBLIC_INTERFACE
export default function ThemeToggleSection() {
  /** This is a public component to be used on the Settings page. */
  return (
    <div className="bg-gray-800 rounded p-4">
      <label className="block field-label" htmlFor="theme-select">Theme</label>
      <select id="theme-select" className="w-full input" aria-label="Theme selection">
        <option>Dark</option>
        <option>Light</option>
        <option>System</option>
      </select>
      <p className="field-hint">Choose your preferred theme.</p>
    </div>
  );
}
