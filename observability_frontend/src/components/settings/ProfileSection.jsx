import React from 'react';

// PUBLIC_INTERFACE
export default function ProfileSection() {
  /** This is a public component to be used on the Settings page. */
  return (
    <div className="bg-gray-800 rounded p-4">
      <label className="block field-label" htmlFor="profile-fullname">Full name</label>
      <input
        id="profile-fullname"
        type="text"
        className="w-full input"
        placeholder="Your name"
        aria-label="Full name"
      />

      <label className="block field-label" htmlFor="profile-email" style={{ marginTop: 16 }}>Email</label>
      <input
        id="profile-email"
        type="email"
        className="w-full input"
        placeholder="you@example.com"
        aria-label="Email address"
      />

      <p className="field-hint">Your email will be used for notifications and login.</p>
    </div>
  );
}
