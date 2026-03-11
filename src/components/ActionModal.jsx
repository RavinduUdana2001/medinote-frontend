import React from "react";

export default function ActionModal({
  open,
  title,
  message,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  hideFooter = false,
}) {
  if (!open) return null;

  return (
    <div className="action-modal-backdrop">
      <div className="action-modal-card">
        <div className="action-modal-head">
          <div>
            <h3>{title}</h3>
            {message ? <p>{message}</p> : null}
          </div>

          <button type="button" className="action-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="action-modal-body">{children}</div>

        {!hideFooter && (
          <div className="action-modal-footer">
            <button
              type="button"
              className="action-btn secondary"
              onClick={onClose}
            >
              {cancelText}
            </button>

            {onConfirm ? (
              <button
                type="button"
                className={`action-btn ${danger ? "danger" : "primary"}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}