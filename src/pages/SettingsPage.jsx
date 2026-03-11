import React, { useEffect, useMemo, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from "../api/profile.api";
import {
  changePassword,
  getPrivacyStatus,
  contactSupport,
  deleteAccount,
} from "../api/settings.api";
import ProfileImageCropModal from "../components/ProfileImageCropModal";
import ActionModal from "../components/ActionModal";
import { clearSession } from "../utils/authStorage";
import "../styles/settings.css";

export default function SettingsPage({ currentUser, onUserUpdated }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profile_image_url: "",
    privacy_accepted: false,
    privacy_accepted_at: null,
    support_ref: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [cropOpen, setCropOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deletePasswordModal, setDeletePasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const docsItems = useMemo(
    () => [
      {
        title: "Getting Started Guide",
        desc: "Learn the basic workflow, login flow, consultation process, and navigation.",
        icon: "bi-rocket-takeoff",
      },
      {
        title: "Templates Documentation",
        desc: "Understand how templates work, how to create them, and how they are used in consultations.",
        icon: "bi-file-earmark-text",
      },
      {
        title: "Profile & Security Guide",
        desc: "Manage profile image, password changes, privacy acceptance, and account settings.",
        icon: "bi-shield-lock",
      },
    ],
    []
  );

  const faqItems = useMemo(
    () => [
      {
        q: "How can I update my profile image?",
        a: "Go to Profile Settings and click Upload Image or Change Image. You can crop and save your image before uploading.",
      },
      {
        q: "How do I change my password?",
        a: "Open Security Settings, enter your current password, then enter your new password twice and save.",
      },
      {
        q: "Where can I contact support?",
        a: "Go to Help & Support and submit your message through the Contact Support section.",
      },
      {
        q: "Can I delete my account later?",
        a: "Yes. Use the Delete Account section in Help & Support. You will be asked for confirmation and password verification.",
      },
      {
        q: "Why do I see privacy policy as already accepted?",
        a: "Privacy policy acceptance happens during account creation, so it is shown as read-only in settings.",
      },
    ],
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");

        if (currentUser) {
          setProfile({
            name: currentUser.name || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            profile_image_url: currentUser.profile_image_url || "",
            privacy_accepted: currentUser.privacy_accepted || false,
            privacy_accepted_at: currentUser.privacy_accepted_at || null,
            support_ref: currentUser.support_ref || "",
          });
        }

        const [profileRes, privacyRes] = await Promise.all([
          getMyProfile(),
          getPrivacyStatus(),
        ]);

        setProfile({
          name: profileRes.user.name || "",
          email: profileRes.user.email || "",
          phone: profileRes.user.phone || "",
          profile_image_url: profileRes.user.profile_image_url || "",
          privacy_accepted: privacyRes.data?.privacy_accepted || false,
          privacy_accepted_at: privacyRes.data?.privacy_accepted_at || null,
          support_ref: profileRes.user.support_ref || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load settings data.");
      }
    };

    loadProfile();
  }, [currentUser]);

  const showSuccess = (title, message) => {
    setSuccessModal({
      open: true,
      title,
      message,
    });
  };

  const closeSuccessModal = () => {
    setSuccessModal({
      open: false,
      title: "",
      message: "",
    });
  };

  const resetMessages = () => {
    setError("");
  };

  const handleSave = async () => {
    try {
      resetMessages();
      setSaving(true);

      const res = await updateMyProfile({
        name: profile.name,
        phone: profile.phone,
      });

      const updated = {
        ...currentUser,
        ...res.user,
        privacy_accepted: profile.privacy_accepted,
        privacy_accepted_at: profile.privacy_accepted_at,
        support_ref: profile.support_ref,
      };

      setProfile((prev) => ({
        ...prev,
        ...res.user,
      }));

      onUserUpdated?.(updated);
      setEditMode(false);
      showSuccess("Profile Updated", "Your profile details were updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setCropOpen(true);
    e.target.value = "";
  };

  const handleCropDone = async (croppedFile) => {
    try {
      resetMessages();

      const res = await uploadProfileImage(croppedFile);

      setProfile((prev) => ({
        ...prev,
        profile_image_url: res.user.profile_image_url,
      }));

      onUserUpdated?.({
        ...currentUser,
        ...res.user,
        privacy_accepted: profile.privacy_accepted,
        privacy_accepted_at: profile.privacy_accepted_at,
        support_ref: profile.support_ref,
      });

      setCropOpen(false);
      setSelectedImageSrc("");
      showSuccess("Profile Photo Updated", "Your profile image was updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to upload image.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      resetMessages();
      setSaving(true);

      const res = await changePassword(passwordForm);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showSuccess(
        "Password Changed",
        res.message || "Your password was changed successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleSupportSend = async () => {
    try {
      resetMessages();
      setSaving(true);

      const res = await contactSupport(supportForm);

      setSupportForm({
        subject: "",
        message: "",
      });

      showSuccess(
        "Support Message Sent",
        `${res.message || "Your support request was sent successfully."}${
          res.reference ? ` Reference: ${res.reference}` : ""
        }`
      );
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send support message.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      resetMessages();
      setSaving(true);

      const res = await deleteAccount({ password: deletePassword });

      setDeletePassword("");
      setDeletePasswordModal(false);

      showSuccess(
        "Account Deleted",
        res.message || "Your account was deleted successfully."
      );

      setTimeout(() => {
        clearSession();
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-shell-pro">
      <div className="settings-scroll-area">
        <div className="settings-tabs-pro">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
            Profile Settings
          </button>

          <button
            className={activeTab === "security" ? "active" : ""}
            onClick={() => setActiveTab("security")}
            type="button"
          >
            Security Settings
          </button>

          <button
            className={activeTab === "privacy" ? "active" : ""}
            onClick={() => setActiveTab("privacy")}
            type="button"
          >
            Privacy Policy
          </button>

          <button
            className={activeTab === "help" ? "active" : ""}
            onClick={() => setActiveTab("help")}
            type="button"
          >
            Help & Support
          </button>
        </div>

        {error ? <div className="msg-box error">{error}</div> : null}

        {activeTab === "profile" && (
          <div className="settings-card-pro">
            <div className="settings-card-head-pro">
              <div>
                <h2>Profile Settings</h2>
                <p>Manage your profile information and photo.</p>
              </div>

              {!editMode ? (
                <button
                  className="profile-edit-btn"
                  type="button"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bi bi-pencil-square"></i>
                  Edit
                </button>
              ) : null}
            </div>

            <div className="profile-top-pro">
              <div className="profile-avatar-big-pro">
                {profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt={profile.name} />
                ) : (
                  <div className="profile-avatar-fallback-pro">
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
              </div>

              <div className="profile-meta-pro">
                <h3>{profile.name || "User"}</h3>
                <p>{profile.email}</p>

                <label className="change-photo-btn compact-upload-btn">
                  <i className="bi bi-camera"></i>
                  <span>{profile.profile_image_url ? "Change Image" : "Upload Image"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    hidden
                    onChange={handleSelectImage}
                  />
                </label>
              </div>
            </div>

            <div className="profile-grid-pro">
              <div className="field-pro">
                <label>Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled={!editMode}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="field-pro">
                <label>Email</label>
                <input type="email" value={profile.email} disabled />
              </div>

              <div className="field-pro">
                <label>Mobile</label>
                <input
                  type="text"
                  value={profile.phone}
                  disabled={!editMode}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            {editMode ? (
              <div className="profile-actions-pro">
                <button
                  className="cancel-btn-pro"
                  type="button"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>

                <button
                  className="save-btn-pro"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "security" && (
          <div className="settings-card-pro">
            <div className="settings-card-head-pro">
              <div>
                <h2>Security Settings</h2>
                <p>Update your password securely.</p>
              </div>
            </div>

            <div className="profile-grid-pro">
              <div className="field-pro full-width">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="field-pro">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
              </div>

              <div className="field-pro">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="profile-actions-pro">
              <button
                className="save-btn-pro"
                type="button"
                onClick={handlePasswordChange}
                disabled={saving}
              >
                {saving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="settings-card-pro">
            <div className="settings-card-head-pro">
              <div>
                <h2>Privacy Policy</h2>
                <p>This policy was accepted during account creation.</p>
              </div>
            </div>

            <div className="privacy-box-pro">
              <h4>Privacy Policy Summary</h4>
              <ul className="privacy-list-pro">
                <li>We store only necessary user account information.</li>
                <li>Your uploaded profile image is linked to your account.</li>
                <li>Your password is securely hashed and never stored as plain text.</li>
                <li>Support messages are used only for service communication.</li>
                <li>You can request account deletion at any time.</li>
              </ul>

              <div className="privacy-status-card">
                <div className="privacy-status-top">
                  <div className="privacy-badge success">
                    <i className="bi bi-shield-check"></i>
                    Accepted
                  </div>

                  {profile.privacy_accepted_at ? (
                    <div className="privacy-date">
                      Accepted on {new Date(profile.privacy_accepted_at).toLocaleString()}
                    </div>
                  ) : null}
                </div>

                <label className="privacy-check-row disabled">
                  <input type="checkbox" checked={!!profile.privacy_accepted} disabled />
                  <span>This policy was accepted when the account was created.</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <>
            <div className="settings-card-pro">
              <div className="settings-card-head-pro">
                <div>
                  <h2>Help & Support</h2>
                  <p>Contact support, browse help guides, and review common questions.</p>
                </div>
              </div>

              <div className="support-id-box">
                <div className="support-id-label">Support ID</div>
                <div className="support-id-value">
                  {profile.support_ref ? `Support ID - ${profile.support_ref}` : "Not available"}
                </div>
              </div>

              <div className="support-grid-pro">
                <div className="support-card-pro">
                  <h4>Contact Support</h4>

                  <div className="field-pro">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={supportForm.subject}
                      onChange={(e) =>
                        setSupportForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Enter subject"
                    />
                  </div>

                  <div className="field-pro">
                    <label>Message</label>
                    <textarea
                      className="support-textarea"
                      value={supportForm.message}
                      onChange={(e) =>
                        setSupportForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Write your message"
                    />
                  </div>

                  <div className="profile-actions-pro">
                    <button
                      className="save-btn-pro"
                      type="button"
                      onClick={handleSupportSend}
                      disabled={saving}
                    >
                      {saving ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>

                <div className="support-card-pro">
                  <h4>Documentation</h4>
                  <div className="help-links-pro">
                    {docsItems.map((doc, index) => (
                      <div key={index} className="help-link-card static">
                        <i className={`bi ${doc.icon}`}></i>
                        <div>
                          <strong>{doc.title}</strong>
                          <span>{doc.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-card-pro">
              <div className="settings-card-head-pro">
                <div>
                  <h2>FAQs</h2>
                  <p>Answers to common questions.</p>
                </div>
              </div>

              <div className="faq-list-pro">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="faq-item-pro">
                    <div className="faq-question-pro">{item.q}</div>
                    <div className="faq-answer-pro">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-card-pro danger-card-pro">
              <div className="settings-card-head-pro">
                <div>
                  <h2>Delete Account</h2>
                  <p>This action is permanent and cannot be undone.</p>
                </div>
              </div>

              <div className="delete-info-text">
                Deleting your account will permanently remove your access and account data from this system.
              </div>

              <div className="profile-actions-pro">
                <button
                  className="delete-btn-pro"
                  type="button"
                  onClick={() => setConfirmDeleteModal(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProfileImageCropModal
        open={cropOpen}
        imageSrc={selectedImageSrc}
        onClose={() => {
          setCropOpen(false);
          setSelectedImageSrc("");
        }}
        onDone={handleCropDone}
      />

      <ActionModal
        open={successModal.open}
        title={successModal.title}
        message={successModal.message}
        onClose={closeSuccessModal}
        hideFooter
      >
        <div className="success-modal-content">
          <div className="success-modal-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
        </div>
      </ActionModal>

      <ActionModal
        open={confirmDeleteModal}
        title="Delete Account"
        message="Do you want to permanently delete this account?"
        onClose={() => setConfirmDeleteModal(false)}
        onConfirm={() => {
          setConfirmDeleteModal(false);
          setDeletePasswordModal(true);
        }}
        confirmText="Yes, Continue"
        cancelText="Cancel"
        danger
      />

      <ActionModal
        open={deletePasswordModal}
        title="Confirm Account Deletion"
        message="Enter your password to permanently delete your account."
        onClose={() => {
          setDeletePasswordModal(false);
          setDeletePassword("");
        }}
        onConfirm={handleDeleteAccount}
        confirmText={saving ? "Deleting..." : "Delete Permanently"}
        cancelText="Cancel"
        danger
      >
        <div className="field-pro full-width">
          <label>Password</label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
      </ActionModal>
    </div>
  );
}