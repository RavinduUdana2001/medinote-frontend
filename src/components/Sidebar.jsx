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
  userRole = "Medical User",
  userImage = "",
  appName = "MediNote",
  onLogout,
}) {
  return (
    <div className="ui-left-card">
      <div className="ui-sidebar">
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

        <div className="ui-bottom ui-bottom-fixed">
          <div className="ui-profile-card improved-profile-card">
            <div className="ui-avatar improved-avatar">
              {userImage ? (
                <img src={userImage} alt={userName} className="sidebar-user-img" />
              ) : (
                <div className="sidebar-avatar-fallback">
                  <i className="bi bi-person-fill" />
                </div>
              )}
            </div>

            <div className="flex-grow-1 min-w-0">
              <div className="ui-profile-name text-truncate">{userName}</div>
              <div className="ui-profile-role text-truncate">{userRole}</div>
            </div>
          </div>

          <button
            className="btn btn-danger w-100 ui-logout-danger"
            type="button"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-left me-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}