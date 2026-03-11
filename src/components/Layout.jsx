import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/ui.css";
import "../styles/sidebar.css";
import ConsultationPage from "../pages/ConsultationPage";
import HistoryPage from "../pages/HistoryPage";
import TemplatesPage from "../pages/TemplatesPage";
import SettingsPage from "../pages/SettingsPage";
import { getUser, clearSession } from "../utils/authStorage";

export default function Layout() {
  const [active, setActive] = useState("consultation");
  const navigate = useNavigate();

  const currentUser = getUser();
  const doctorName = currentUser?.name || "Doctor";

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

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
          subtitle: "Update your profile and preferences.",
        };
      default:
        return {
          title: "Start Consultation",
          subtitle: "Record voice or type notes and generate editable notes.",
        };
    }
  }, [active]);

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [active]);

  const renderPage = () => {
    switch (active) {
      case "consultation":
        return <ConsultationPage />;
      case "history":
        return <HistoryPage />;
      case "templates":
        return <TemplatesPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <ConsultationPage />;
    }
  };

  const handleMobileNavChange = (key) => {
    setActive(key);

    const el = document.getElementById("sidebarOffcanvas");
    if (el && window.bootstrap?.Offcanvas) {
      const instance = window.bootstrap.Offcanvas.getOrCreateInstance(el);
      instance.hide();
    }
  };

  return (
    <div className="ui-app">
      {/* LEFT (Desktop Sidebar) */}
      <aside className="ui-sidebar-shell d-none d-lg-flex">
        <Sidebar
          active={active}
          onChange={setActive}
          userName={doctorName}
          onLogout={handleLogout}
        />
      </aside>

      {/* RIGHT */}
      <div className="ui-main-shell ui-main-shell-scroll">
        {/* Mobile topbar */}
        <div className="ui-topbar d-lg-none">
          <button
            className="btn btn-light"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-label="Open menu"
            type="button"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          <div className="ui-topbar-title">{headerContent.title}</div>
        </div>

        {/* Main pad */}
        <div className="ui-main-pad ui-main-pad-scroll">
          {/* Header */}
          <div className="ui-header-card ui-header-spacing">
            {/* LEFT side */}
            <div className="ui-header-left">
              <div className="ui-page-title">{headerContent.title}</div>
              <div className="ui-page-subtitle">{headerContent.subtitle}</div>
            </div>

            {/* RIGHT side */}
            <div className="ui-header-right">
              <div className="ui-greeting-box">
                <div className="ui-greet-line1">{greeting},</div>
                <div className="ui-greet-line2">{doctorName}</div>
              </div>

              <div className="ui-doctor-image-wrap">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                  alt="Doctor"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="ui-content-canvas ui-content-canvas-scroll">
            {renderPage()}
          </div>
        </div>

        {/* Mobile Offcanvas Sidebar */}
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
              onChange={handleMobileNavChange}
              userName={doctorName}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}