// ✅ SettingsPage.jsx (FULL) — Tabs: Profile / Security / Privacy (matches your screenshots)
// Save: src/pages/SettingsPage.jsx
// CSS:  src/styles/settings.css  (code below)

import React, { useMemo, useState } from "react";
import "../styles/settings.css";

export default function SettingsPage() {
  const tabs = useMemo(
    () => [
      { key: "profile", label: "Profile Settings" },
      { key: "security", label: "Security Settings" },
      { key: "privacy", label: "Privacy Policy" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("profile");

  // Demo form state (connect API later)
  const [profile, setProfile] = useState({
    name: "Shafraz",
    email: "shafraz123@gmail.com",
    phone: "+91 9XXX-XXXXXX",
    signature: "",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const updateProfile = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const updatePassword = (k, v) => setPassword((p) => ({ ...p, [k]: v }));

  const onSaveProfile = () => alert("Save profile (connect API later)");
  const onUpdatePassword = () => alert("Update password (connect API later)");
  const onDonePrivacy = () => alert("Done (connect API later)");

  return (
    <div className="set-page">
      {/* Tabs bar */}
      <div className="set-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`set-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body shell (scroll-safe) */}
      <div className="set-shell">
        <div className="set-scroll">
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              updateProfile={updateProfile}
              onSave={onSaveProfile}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              password={password}
              updatePassword={updatePassword}
              onUpdate={onUpdatePassword}
            />
          )}

          {activeTab === "privacy" && (
            <PrivacyTab
              accepted={privacyAccepted}
              setAccepted={setPrivacyAccepted}
              onDone={onDonePrivacy}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function ProfileTab({ profile, updateProfile, onSave }) {
  return (
    <div className="set-card">
      <div className="set-card-head">
        <div>
          <div className="set-h">Profile Settings</div>
          <div className="set-sub">Manage your account settings and personal information</div>
        </div>

        <button className="set-back" type="button" onClick={() => alert("Back")}>
          <i className="bi bi-arrow-left" />
          <span>Back</span>
        </button>
      </div>

      <div className="set-profile-top">
        <div className="set-avatar-big" aria-hidden="true">
          <i className="bi bi-person" />
        </div>

        <div className="set-avatar-actions">
          <button className="set-btn soft" type="button">
            Change your profile icon
          </button>
          <button className="set-btn soft" type="button">
            Add a image
          </button>
        </div>
      </div>

      <div className="set-form-grid">
        <Field label="Name">
          <input
            className="set-input"
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
            placeholder="Enter your name"
          />
        </Field>

        <Field label="E-mail">
          <input
            className="set-input"
            value={profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
            placeholder="Enter email"
          />
        </Field>

        <Field label="Phone number">
          <input
            className="set-input"
            value={profile.phone}
            onChange={(e) => updateProfile("phone", e.target.value)}
            placeholder="+91 ..."
          />
        </Field>

        <div className="set-signature-row">
          <Field label="Signature">
            <input
              className="set-input"
              value={profile.signature}
              onChange={(e) => updateProfile("signature", e.target.value)}
              placeholder="No signature added"
            />
          </Field>

          <button className="set-btn outline" type="button">
            Upload Signature image
          </button>

          <button className="set-btn soft" type="button" onClick={onSave}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="set-actions">
        <button className="set-btn ghost" type="button">
          Cancel
        </button>
        <button className="set-btn primary" type="button" onClick={onSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecurityTab({ password, updatePassword, onUpdate }) {
  const rules = [
    "At least 8 characters",
    "One upper case letter",
    "One number",
    "One special character",
  ];

  return (
    <div className="set-card">
      <div className="set-card-head">
        <div>
          <div className="set-h">Security Settings</div>
          <div className="set-sub">Change your account password</div>
        </div>
      </div>

      <div className="set-form-grid">
        <Field label="Current Password">
          <input
            className="set-input"
            value={password.current}
            onChange={(e) => updatePassword("current", e.target.value)}
            placeholder="Enter current password"
            type="password"
          />
        </Field>

        <Field label="New Password">
          <input
            className="set-input"
            value={password.next}
            onChange={(e) => updatePassword("next", e.target.value)}
            placeholder="Enter new password"
            type="password"
          />
        </Field>

        <div className="set-rules">
          {rules.map((r) => (
            <div className="set-rule" key={r}>
              <i className="bi bi-check2" />
              <span>{r}</span>
            </div>
          ))}
        </div>

        <Field label="Confirm new Password">
          <input
            className="set-input"
            value={password.confirm}
            onChange={(e) => updatePassword("confirm", e.target.value)}
            placeholder="Re-enter new password"
            type="password"
          />
        </Field>
      </div>

      <div className="set-actions">
        <button className="set-btn ghost" type="button">
          Cancel
        </button>
        <button className="set-btn primary" type="button" onClick={onUpdate}>
          Update password
        </button>
      </div>
    </div>
  );
}

function PrivacyTab({ accepted, setAccepted, onDone }) {
  return (
    <div className="set-card">
      <div className="set-card-head">
        <div>
          <div className="set-h">Privacy Policy</div>
          <div className="set-sub">Last Updated: February 2026</div>
        </div>
      </div>

      <div className="set-policy">
        <p>
          <b>MediNote AI</b> is committed to protecting the privacy and security
          of doctors and patients. We collect only the information necessary to
          provide medical documentation services, improve system performance, and
          ensure secure access to consultation records.
        </p>
        <p>
          All patient data and consultation notes are securely stored and
          encrypted. We do not sell, share, or distribute personal information
          to third parties without consent, except when required by law.
        </p>
        <p>
          By using MediNote AI, you agree to the collection and use of
          information in accordance with this policy.
        </p>

        <label className="set-check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>Accept privacy policy</span>
        </label>
      </div>

      <div className="set-actions">
        <button
          className="set-btn primary"
          type="button"
          disabled={!accepted}
          onClick={onDone}
          title={!accepted ? "Please accept privacy policy" : "Done"}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ---------------- Small helpers ---------------- */

function Field({ label, children }) {
  return (
    <div className="set-field">
      <div className="set-label">{label}</div>
      {children}
    </div>
  );
}