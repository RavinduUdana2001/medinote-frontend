import React from "react";
import "../styles/sidebar.css";

const menus = [
  { key: "consultation", label: "Consultation", icon: "bi-journal-medical" },
  { key: "history", label: "History", icon: "bi-clock-history" },
  { key: "templates", label: "Templates", icon: "bi-files" },
  { key: "settings", label: "Settings", icon: "bi-gear" },
];

export default function Sidebar({
  active,
  onChange,
  userName = "Doctor",
  userRole = "Doctor",     // ✅ FIX: default role
  appName = "MediNote",    // ✅ FIX: default app name
  onLogout,
}) {
  const handleLogout = () => {
    // ✅ safe logout even if parent didn't pass a function
    if (typeof onLogout === "function") return onLogout();

    // fallback: clear tokens and reload to login route
    localStorage.removeItem("medinote_token");
    localStorage.removeItem("medinote_user");
    sessionStorage.removeItem("medinote_token");
    sessionStorage.removeItem("medinote_user");
    window.location.href = "/login";
  };

  return (
    <div className="ui-left-card">
      <div className="ui-sidebar">
        {/* TOP */}
        <div className="ui-brand">
          <div className="d-flex align-items-center gap-2">
            <div className="ui-logo-badge">
              <i className="bi bi-stars" />
            </div>
            <div>
              <div className="ui-brand-title">{appName}</div>
              <div className="ui-brand-sub">Dashboard</div>
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="ui-menu-card ui-menu-scroll">
          <div className="nav nav-pills flex-column gap-2">
            {menus.map((m) => {
              const isActive = m.key === active;
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`ui-nav-item nav-link ${isActive ? "active" : ""}`}
                  onClick={() => onChange?.(m.key)}
                >
                  <span className="ui-nav-icon">
                    <i className={`bi ${m.icon}`} />
                  </span>
                  <span className="ui-nav-text">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="ui-bottom ui-bottom-fixed">
          <div className="ui-profile-card">
            <div className="ui-avatar">
              <i className="bi bi-person-circle" />
            </div>

            <div className="flex-grow-1">
              <div className="ui-profile-name">{userName}</div>
              <div className="ui-profile-role">{userRole}</div>
            </div>
          </div>

          <button
            className="btn btn-danger w-100 ui-logout-danger"
            type="button"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}