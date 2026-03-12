import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/ui.css";
import "../styles/sidebar.css";
import ConsultationPage from "../pages/ConsultationPage";
import HistoryPage from "../pages/HistoryPage";
import TemplatesPage from "../pages/TemplatesPage";
import SettingsPage from "../pages/SettingsPage";
import ProfileImageCropModal from "./ProfileImageCropModal";
import { clearSession, getUser, updateStoredUser } from "../utils/authStorage";
import { getMyProfile, uploadProfileImage } from "../api/profile.api";

export default function Layout() {
  const [active, setActive] = useState("consultation");
  const [currentUser, setCurrentUser] = useState(getUser());
  const [cropOpen, setCropOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const [uploadingHeaderImage, setUploadingHeaderImage] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await getMyProfile();
        setCurrentUser(res.user);
        updateStoredUser(res.user);
        if (res.user && !res.user.onboarding_completed) {
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    loadMe();
  }, []);

  const doctorName = currentUser?.name || "Doctor";

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const headerContent = useMemo(() => {
    switch (active) {
      case "history":
        return {
          title: "History",
          subtitle: "View and manage previous consultation notes.",
        };
      case "templates":
        return {
          title: "Templates",
          subtitle: "Create and manage your templates.",
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Manage your profile and preferences.",
        };
      default:
        return {
          title: "Start Consultation",
          subtitle: "Record voice or type notes and generate editable notes.",
        };
    }
  }, [active]);

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    updateStoredUser(updatedUser);
  };

  const handleSelectHeaderImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setCropOpen(true);
    e.target.value = "";
  };

  const handleCropDone = async (croppedFile) => {
    try {
      setUploadingHeaderImage(true);
      const res = await uploadProfileImage(croppedFile);
      setCurrentUser(res.user);
      updateStoredUser(res.user);
      setCropOpen(false);
      setSelectedImageSrc("");
    } catch (error) {
      console.error("Header image upload failed:", error);
    } finally {
      setUploadingHeaderImage(false);
    }
  };

  const isPageScrollMode = active === "templates";
  const isContainedMode = !isPageScrollMode;

  const renderPage = () => {
    switch (active) {
      case "consultation":
        return <ConsultationPage />;
      case "history":
        return <HistoryPage />;
      case "templates":
        return <TemplatesPage />;
      case "settings":
        return (
          <SettingsPage
            currentUser={currentUser}
            onUserUpdated={handleUserUpdated}
          />
        );
      default:
        return <ConsultationPage />;
    }
  };

  return (
    <div className="ui-app">
      <aside className="ui-sidebar-shell d-none d-lg-flex">
        <Sidebar
          active={active}
          onChange={setActive}
          userName={doctorName}
          userRole="Medical User"
          userImage={currentUser?.profile_image_url || ""}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={`ui-main-shell ${
          isContainedMode
            ? "ui-main-shell-contained"
            : "ui-main-shell-page-scroll"
        }`}
      >
        <div className="ui-topbar d-lg-none">
          <button
            className="btn btn-light"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-label="Open menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="ui-topbar-title">Dashboard</div>
        </div>

        <div
          className={`ui-main-pad ${
            isContainedMode ? "ui-main-pad-contained" : "ui-main-pad-page-scroll"
          }`}
        >
          <div className="ui-header-card ui-header-spacing">
            <div className="ui-header-left">
              <div className="ui-page-title">{headerContent.title}</div>
              <div className="ui-page-subtitle">{headerContent.subtitle}</div>
            </div>

            <div className="ui-header-right">
              <div className="ui-greeting-box">
                <div className="ui-greet-line1">{greeting},</div>
                <div className="ui-greet-line2">{doctorName}</div>
              </div>

              <label
                className="ui-doctor-image-wrap ui-clickable-profile"
                title="Upload profile image"
              >
                {currentUser?.profile_image_url ? (
                  <img
                    src={currentUser.profile_image_url}
                    alt={doctorName}
                    className="ui-header-avatar-img"
                  />
                ) : (
                  <div className="ui-header-avatar-fallback">
                    <i className="bi bi-person-fill" />
                  </div>
                )}

                <div className="ui-profile-overlay">
                  {uploadingHeaderImage ? "Uploading..." : "Change"}
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  hidden
                  onChange={handleSelectHeaderImage}
                />
              </label>
            </div>
          </div>

          <div
            className={`ui-content-canvas ${
              isContainedMode
                ? "ui-content-canvas-contained"
                : "ui-content-canvas-page-scroll"
            }`}
          >
            <div
              className={`ui-page-inner ${
                isContainedMode
                  ? "ui-page-inner-contained"
                  : "ui-page-inner-page-scroll"
              }`}
            >
              {renderPage()}
            </div>
          </div>
        </div>

        <div
          className="offcanvas offcanvas-start ui-offcanvas"
          tabIndex="-1"
          id="sidebarOffcanvas"
          aria-labelledby="sidebarOffcanvasLabel"
          data-bs-backdrop="true"
          data-bs-scroll="true"
        >
          <div className="offcanvas-header ui-offcanvas-header">
            <div className="d-flex align-items-center gap-2">
              <div className="ui-logo-badge">
                <i className="bi bi-stars" />
              </div>
              <div>
                <div className="fw-bold text-dark" id="sidebarOffcanvasLabel">
                  MediNote
                </div>
                <div className="text-muted small">Dashboard</div>
              </div>
            </div>

            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>

          <div className="offcanvas-body p-0 ui-offcanvas-body">
            <Sidebar
              active={active}
              onChange={(key) => {
                setActive(key);
                const el = document.getElementById("sidebarOffcanvas");
                if (el) {
                  const inst = window.bootstrap?.Offcanvas.getInstance(el);
                  inst?.hide();
                }
              }}
              userName={doctorName}
              userRole="Medical User"
              userImage={currentUser?.profile_image_url || ""}
              onLogout={handleLogout}
            />
          </div>
        </div>
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
    </div>
  );
}

